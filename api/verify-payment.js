// POST /api/verify-payment : checks Razorpay's signature on the SERVER before confirming. A browser redirect alone proves nothing.
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { confirmPayment } from './_confirm.js';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { orderId, paymentId, signature } = req.body || {};
  const want = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(orderId + '|' + paymentId).digest('hex');
  const a = Buffer.from(want), b = Buffer.from(String(signature || ''));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(400).json({ error: 'Invalid signature' });
  await confirmPayment(createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY), orderId, paymentId);
  res.json({ ok: true });
}
