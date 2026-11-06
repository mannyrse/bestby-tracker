# Best-By Tracker

A mobile-friendly web app for tracking perishable products and their best-by dates in a store. It replaces a paper process with a shared digital list: add products by barcode scan or by hand, see what's expiring soon, and mark items as handled.

- **Live site:** https://mannyrse.com/bestby-tracker/ (sign-in required)
- **Demo:** https://mannyrse.com/bestby-tracker/demo/ (anyone can try it - the data stays in your browser)

## Features

- List sorted by best-by date, with colored chips for overdue, soon, and later
- Barcode scanning with the phone camera, with product lookup and a saved catalog
- Add, edit, and delete entries, with a separate history of handled items
- Printable checklist of active items
- Shared inventory for coworkers behind a login

## Built with

- React and Vite
- Supabase (database and login)
- ZXing for in-browser barcode scanning
- Open Food Facts API for product names and images
- GitHub Pages and GitHub Actions for hosting


## Run it locally

```bash
npm install
```

Create `.env.local` in the project root:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxx
```

```bash
npm run dev        # live version (login and Supabase)
npm run dev:demo   # demo version (no login)
```

Only the publishable key belongs in the frontend. Access is protected by the login and database rules.

## Database

Tables and security rules are in [`database/schema.sql`](database/schema.sql). Run it in Supabase's SQL Editor, create the shared user under Authentication (tick Auto Confirm), and turn off public sign-ups.

## Notes

- The demo build has no Supabase code or address, so it can't reach the real data.
- Free-tier Supabase projects pause after a week of inactivity. A paused project keeps its data and can be restored from the dashboard.
- Product data comes from [Open Food Facts](https://world.openfoodfacts.org/), available under the Open Database License.