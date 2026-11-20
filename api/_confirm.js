// Marks a booking confirmed after a payment is VERIFIED. Safe to call many times (idempotent):
// payments.razorpay_payment_id is UNIQUE, so a duplicate webhook or retry is ignored.
export async function confirmPayment(sb, orderId, paymentId) {
  const { data: bk } = await sb.from('bookings').select('id,advance_paise').eq('razorpay_order_id', orderId).maybeSingle();
  if (!bk) return null;
  const { error } = await sb.from('payments').insert({ booking_id: bk.id, razorpay_payment_id: paymentId, amount_paise: bk.advance_paise, status: 'captured' });
  if (error && error.code !== '23505') throw error;
  // Only a still-pending booking is confirmed. If the hold expired first, an admin must handle it (refund or re-book).
  await sb.from('bookings').update({ status: 'confirmed' }).eq('id', bk.id).eq('status', 'pending');
  return bk.id;
}
