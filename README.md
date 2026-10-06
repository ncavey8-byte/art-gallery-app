# art_em_c — mobile shop app

iOS + Android app (Expo / React Native) for browsing and buying original artwork.

- **Gallery** ("Emily Cavey - Fine Art"): Pet Portraits (Cats & Dogs, Other Pets), People Portraits and Original Works, with a detail page for each artwork
- **Commission**: request a custom portrait (canvas size, pencil or oil, a reference photo, contact details); emailed to `COMMISSION_EMAIL_TO`
- **About Us**: story, offerings, Instagram and email links (edit `constants/business.ts`)
- **Cart & checkout**: secure payment through Stripe Checkout, with shipping address collection

## Run the app

```bash
npm install
npx expo start        # scan the QR code with Expo Go, or press w for web
```

Without `EXPO_PUBLIC_API_URL` set, the app runs in **preview mode**: sample artwork (`data/sampleArtworks.ts`) and a simulated checkout.

`EXPO_PUBLIC_API_URL` is set in `.env` to the hosted server on Render (`https://art-gallery-app-nszq.onrender.com`). Until Stripe is connected there, the app still shows sample artwork with a simulated checkout, but commission requests are emailed for real.

## Go live with Stripe

Artwork is managed in Stripe, so there's no separate database to keep up to date.

1. In the Stripe dashboard, create a **Product** for each piece:
   - Name, description, and one image
   - A one-time price (set as the default price)
   - Metadata `category`: `pets-cats-dogs`, `pets-other`, `people` or `original` (defaults to `original`)
   - Optional metadata: `medium`, `dimensions`, `year`
2. Start the server:
   ```bash
   cd server
   npm install
   cp .env.example .env   # add STRIPE_SECRET_KEY etc.
   npm start
   ```
3. Add a Stripe webhook for `checkout.session.completed` pointing at `<PUBLIC_URL>/webhook` and put its signing secret in `STRIPE_WEBHOOK_SECRET`. Paid pieces are marked `sold=true` automatically.
4. Point the app at the server: `EXPO_PUBLIC_API_URL=https://your-server.example.com npx expo start`

To list a sold piece for sale again, remove its `sold` metadata in Stripe.

## Commission emails

Commission requests are sent by the server (`POST /commission`) with the photos attached and the customer's address as Reply-To. Set `RESEND_API_KEY` (from [resend.com](https://resend.com), sign up with the `COMMISSION_EMAIL_TO` address so it can deliver without a verified domain), or the `SMTP_*` values in `server/.env`. Hosts like Render's free plan block SMTP ports, so use Resend there. For Gmail SMTP: turn on 2-Step Verification, create an [App Password](https://myaccount.google.com/apppasswords), then use `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER=<gmail address>`, `SMTP_PASS=<app password>`. Photos are converted to JPEG on the phone (including iPhone HEIC), one photo per request.

## Publishing to the App Store / Google Play

Use EAS: `npx eas-cli@latest build` then `npx eas-cli@latest submit`. You need an Apple Developer account ($99/yr) and a Google Play Console account ($25 one-time).
