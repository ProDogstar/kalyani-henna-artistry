// POST /api/webhook : Razorpay calls this server-to-server. This is the reliable source of truth for payments.
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { confirmPayment } from './_confirm.js';
export const config = { api: { bodyParser: false } };   // we need the exact raw body to check the signature
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const chunks = []; for await (const ch of req) chunks.push(ch);
  const raw = Buffer.concat(chunks);
  const want = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(raw).digest('hex');
  const a = Buffer.from(want), b = Buffer.from(String(req.headers['x-razorpay-signature'] || ''));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(400).end();
  const ev = JSON.parse(raw.toString());
  if (ev.event === 'payment.captured') {
    const p = ev.payload.payment.entity;
    await confirmPayment(createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY), p.order_id, p.id);
  }
  res.json({ ok: true });   // always 200 for verified events so Razorpay stops retrying
}
