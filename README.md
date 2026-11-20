# Kalyani Henna Artistry website

Static site (index.html) + Vercel serverless functions (api/) + Supabase (database, login, photo storage) + Razorpay (payments).

## 1. Change the client's details 
Open `site.config.js`. Every line has a comment. Change name, phone, WhatsApp number, email, address, hours,
social links, bio, FAQ, time slots. Empty values are hidden or shown as "[to be added]".
Prices: open `api/_pricing.js` and set the advance in rupees per service (`null` = quote request, no payment).
Logo/photos: replace files in `images/` using the SAME file names (see `index.html` for which is which).
The "Made by ProDG" footer link is in `index.html` (search `prodgcorp.in`).

## 2. Set up Supabase 
1. supabase.com > New project. Copy Project URL, anon key, service_role key (Project Settings > API).
2. SQL Editor > paste `supabase/schema.sql` > Run.
3. Authentication > Users > Add user (the owner's email + password).
4. SQL Editor: `insert into admins (user_id) select id from auth.users where email = 'owner@example.com';`
5. Put URL + anon key in `site.config.js`. The service_role key goes ONLY in Vercel env vars.

## 3. Razorpay test mode first
1. razorpay.com > Dashboard > Test Mode > Settings > API Keys > Generate. Copy Key Id and Secret.
2. Settings > Webhooks > Add: URL `https://YOUR-DOMAIN/api/webhook`, event `payment.captured`, set a secret.
3. Set a real advance amount in `api/_pricing.js` for at least one service, e.g. 500.
4. Test with Razorpay's test UPI/card details (see Razorpay docs "Test Card Details").
Going live: complete Razorpay KYC in the client's name, switch Dashboard to Live Mode, create LIVE keys + webhook,
and replace the three Razorpay env vars in Vercel. Do not test with real money before checking the cancellation/refund wording.

## 4. Deploy on Vercel
1. Push to GitHub. vercel.com > Add New Project > import the repo (framework: Other).
2. Settings > Environment Variables: add everything from `.env.example`.
3. Deploy. Add the client's domain under Settings > Domains.
4. Open `/admin.html` and sign in.

## What exists / what does not yet
Exists: gallery, services, FAQ, social icons, booking form, slot-conflict protection, 15-minute holds, Razorpay order +
server signature check + webhook (idempotent), admin login, bookings list, complete/cancel, photo upload/delete.
Not built: booking lookup page for customers, reschedule/cancel requests, quotation sending, calendar/blocked dates/holidays,
reports, refund tracking, reviews, policy pages, SEO files. Add before selling as "complete".
Never commit `.env` files. Never put service_role or Razorpay secret keys in `site.config.js`.
