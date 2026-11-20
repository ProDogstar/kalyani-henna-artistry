/* ===========================================================================
   EDIT THIS FILE to change the client's details. Normal changes need no other file.
   Everything here is PUBLIC (visible in the browser). Never put secret keys here.
   Leave a value as "" to hide it or show "[to be added]".
   =========================================================================== */
window.SITE = {
  name: "Kalyani Henna Artistry",            // Business name: page title, footer, Razorpay checkout
  phone: "",                                 // Shown on site, e.g. "+91 98765 43210"
  whatsapp: "",                              // Digits only with country code, e.g. "919876543210"
  email: "",                                 // Shown on site
  address: "",                               // Shown in contact section
  area: "",                                  // Service area, e.g. "Your city and nearby"
  hours: "",                                 // e.g. "10 am to 8 pm"
  social: {                                  // Full https:// links. Empty ones are hidden.
    instagram: "", facebook: "", youtube: ""
  },
  bio: "",                                   // "Meet Kalyani" paragraph
  slots: ["10:00 AM", "1:00 PM", "4:00 PM", "7:00 PM"],   // Start times customers can choose
  // Service names in the booking form. Must match the names in api/_pricing.js exactly.
  services: ["Bridal Mehndi","Engagement Mehndi","Wedding Guest Mehndi","Arabic Mehndi","Minimalist Mehndi","Feet Mehndi","Festival Mehndi","Group and Family Bookings","Custom Mehndi Designs"],
  // Supabase PUBLIC values (Supabase > Project Settings > API). The anon key is safe here because
  // database rules (row level security) protect the data. Never put the service_role key here.
  supabaseUrl: "", supabaseAnonKey: "",
  // FAQ: edit freely. Replace the [to be confirmed] answers with the artist's real policies.
  faq: [
    {q: "How do I book an appointment?", a: "Tap Book now, choose your service, date and time, and pay the advance online. Bridal and group bookings are confirmed after a quote."},
    {q: "How much advance do I pay?", a: "[To be confirmed by the artist]"},
    {q: "How long does bridal mehndi take?", a: "[To be confirmed by the artist]"},
    {q: "Can I get a custom design?", a: "Yes. Share your idea on WhatsApp and the artist will advise."},
    {q: "What is the cancellation and refund policy?", a: "[To be confirmed by the artist]"},
    {q: "Do you travel to the venue?", a: "[To be confirmed by the artist]"}
  ]
};
