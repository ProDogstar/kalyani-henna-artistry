// SERVER-SIDE pricing. The browser can never change these numbers (it only sends the service name).
// Value = advance in RUPEES the customer pays online.
//   null  -> "quote request": no online payment, the artist replies with a quote.
// Names must match site.config.js exactly. Set real amounts only after the artist confirms them.
export const ADVANCE_RUPEES = {
  "Bridal Mehndi": null,
  "Engagement Mehndi": null,
  "Wedding Guest Mehndi": null,
  "Arabic Mehndi": null,
  "Minimalist Mehndi": null,
  "Feet Mehndi": null,
  "Festival Mehndi": null,
  "Group and Family Bookings": null,
  "Custom Mehndi Designs": null
};
export const HOLD_MINUTES = 15;   // unpaid slot hold time
