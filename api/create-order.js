// POST /api/create-order : validates input, holds the slot, creates the Razorpay order. Server only.
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { ADVANCE_RUPEES, HOLD_MINUTES } from './_pricing.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const b = req.body || {}, c = (v, n) => String(v || '').trim().slice(0, n);
  const d = { name: c(b.name, 80), phone: c(b.phone, 15).replace(/[\s-]/g, ''), email: c(b.email, 120), service: c(b.service, 60),
    event_type: c(b.eventType, 30), event_date: c(b.eventDate, 10), slot: c(b.slot, 20), venue: c(b.venue, 200), notes: c(b.notes, 500) };
  if (!d.name || !/^(\+91)?[6-9]\d{9}$/.test(d.phone)) return res.status(400).json({ error: 'Enter your name and a valid 10-digit mobile number.' });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.event_date) || d.event_date < new Date().toISOString().slice(0, 10)) return res.status(400).json({ error: 'Choose a future event date.' });
  if (!Object.hasOwn(ADVANCE_RUPEES, d.service)) return res.status(400).json({ error: 'Unknown service.' });

  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const advance = ADVANCE_RUPEES[d.service], ref = 'KHA-' + randomBytes(3).toString('hex').toUpperCase();
  const row = { ...d, reference: ref, status: advance == null ? 'quote' : 'pending' };
  if (advance != null) {
    // Free slots whose unpaid hold has expired, then try to take this one (the unique index blocks double booking).
    await sb.from('bookings').update({ status: 'expired' }).eq('status', 'pending').lt('hold_expires_at', new Date().toISOString());
    row.advance_paise = advance * 100;
    row.hold_expires_at = new Date(Date.now() + HOLD_MINUTES * 60000).toISOString();
  } else row.slot = d.slot || null;
  const { data: bk, error } = await sb.from('bookings').insert(row).select('id').single();
  if (error) return res.status(error.code === '23505' ? 409 : 500).json({ error: error.code === '23505' ? 'That time was just taken. Please pick another.' : 'Could not save the booking.' });
  if (advance == null) return res.json({ reference: ref });   // quote request: no payment

  const auth = Buffer.from(process.env.RAZORPAY_KEY_ID + ':' + process.env.RAZORPAY_KEY_SECRET).toString('base64');
  const r = await fetch('https://api.razorpay.com/v1/orders', { method: 'POST', headers: { Authorization: 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: row.advance_paise, currency: 'INR', receipt: ref }) });
  const o = await r.json();
  if (!r.ok) { await sb.from('bookings').update({ status: 'cancelled' }).eq('id', bk.id); return res.status(502).json({ error: 'Payment could not be started.' }); }
  await sb.from('bookings').update({ razorpay_order_id: o.id }).eq('id', bk.id);
  res.json({ reference: ref, orderId: o.id, keyId: process.env.RAZORPAY_KEY_ID, amount: row.advance_paise });
}
