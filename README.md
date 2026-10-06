# art_em_c — mobile shop app

iOS + Android app (Expo / React Native) for browsing and buying original artwork.

- **Gallery**: available and sold pieces, with a detail page for each artwork
- **About Us**: story, offerings, Instagram and email links (edit `constants/business.ts`)
- **Cart & checkout**: secure payment through Stripe Checkout, with shipping address collection

## Run the app

```bash
npm install
npx expo start        # scan the QR code with Expo Go, or press w for web
```

Without `EXPO_PUBLIC_API_URL` set, the app runs in **preview mode**: sample artwork (`data/sampleArtworks.ts`) and a simulated checkout.

## Go live with Stripe

Artwork is managed in Stripe, so there's no separate database to keep up to date.

1. In the Stripe dashboard, create a **Product** for each piece:
   - Name, description, and one image
   - A one-time price (set as the default price)
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

## Publishing to the App Store / Google Play

Use EAS: `npx eas-cli@latest build` then `npx eas-cli@latest submit`. You need an Apple Developer account ($99/yr) and a Google Play Console account ($25 one-time).
