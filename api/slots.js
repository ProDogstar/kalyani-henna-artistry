// GET /api/slots?date=YYYY-MM-DD : returns the times already taken that day (so the form can disable them).
import { createClient } from '@supabase/supabase-js';
export default async function handler(req, res) {
  const date = String(req.query.date || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: 'Bad date' });
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  await sb.from('bookings').update({ status: 'expired' }).eq('status', 'pending').lt('hold_expires_at', new Date().toISOString());
  const { data } = await sb.from('bookings').select('slot').eq('event_date', date).in('status', ['pending', 'confirmed']);
  res.json({ taken: (data || []).map(r => r.slot).filter(Boolean) });   // names/phones are never returned
}
