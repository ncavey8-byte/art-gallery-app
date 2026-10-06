import cors from 'cors';
import express from 'express';
import Stripe from 'stripe';

const {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  PUBLIC_URL = 'http://localhost:4242',
  ALLOWED_WEB_ORIGINS = 'http://localhost:8081',
  APP_SCHEMES = 'artgalleryapp,exp',
  SHIPPING_COUNTRIES = 'US',
  PORT = 4242,
} = process.env;

if (!STRIPE_SECRET_KEY) {
  console.error('Missing STRIPE_SECRET_KEY. Copy .env.example to .env and add your key.');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY);
const app = express();
app.use(cors());

const webOrigins = ALLOWED_WEB_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);
const appSchemes = APP_SCHEMES.split(',').map((s) => `${s.trim()}:`);

// Only redirect back to the app itself or approved web origins.
function isAllowedReturnUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol === 'http:' || url.protocol === 'https:') return webOrigins.includes(url.origin);
    return appSchemes.includes(url.protocol);
  } catch {
    return false;
  }
}

// Stripe only redirects to http(s) URLs, so app deep links go through /return.
function stripeRedirectUrl(returnUrl) {
  const url = new URL(returnUrl);
  if (url.protocol === 'http:' || url.protocol === 'https:') return returnUrl;
  return `${PUBLIC_URL}/return?to=${encodeURIComponent(returnUrl)}`;
}

function toArtwork(product) {
  const price = product.default_price;
  const m = product.metadata ?? {};
  return {
    id: product.id,
    title: product.name,
    description: product.description ?? '',
    image: product.images?.[0] ?? '',
    medium: m.medium ?? '',
    dimensions: m.dimensions ?? '',
    year: m.year ?? '',
    price: price?.unit_amount ?? 0,
    currency: price?.currency ?? 'usd',
    sold: m.sold === 'true',
  };
}

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    const ids = (event.data.object.metadata?.artwork_ids ?? '').split(',').filter(Boolean);
    await Promise.all(ids.map((id) => stripe.products.update(id, { metadata: { sold: 'true' } })));
    console.log(`Marked sold: ${ids.join(', ')}`);
  }
  res.json({ received: true });
});

app.use(express.json());

app.get('/artworks', async (_req, res) => {
  try {
    const products = await stripe.products
      .list({ active: true, expand: ['data.default_price'] })
      .autoPagingToArray({ limit: 500 });
    const artworks = products.filter((p) => p.default_price).map(toArtwork);
    artworks.sort((a, b) => Number(a.sold) - Number(b.sold));
    res.json({ artworks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load artwork' });
  }
});

app.post('/checkout', async (req, res) => {
  const { artworkIds, successUrl, cancelUrl } = req.body ?? {};
  if (!Array.isArray(artworkIds) || artworkIds.length === 0) return res.status(400).json({ error: 'Your cart is empty' });
  if (!isAllowedReturnUrl(successUrl) || !isAllowedReturnUrl(cancelUrl)) return res.status(400).json({ error: 'Invalid return URL' });

  try {
    const products = await Promise.all(
      [...new Set(artworkIds)].map((id) => stripe.products.retrieve(id, { expand: ['default_price'] })),
    );
    const unavailable = products.filter((p) => !p.active || p.metadata?.sold === 'true' || !p.default_price);
    if (unavailable.length) {
      return res.status(409).json({ error: `Sorry, ${unavailable.map((p) => p.name).join(', ')} is no longer available.` });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: products.map((p) => ({ price: p.default_price.id, quantity: 1 })),
      shipping_address_collection: { allowed_countries: SHIPPING_COUNTRIES.split(',').map((c) => c.trim()) },
      metadata: { artwork_ids: products.map((p) => p.id).join(',') },
      success_url: stripeRedirectUrl(successUrl),
      cancel_url: stripeRedirectUrl(cancelUrl),
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not start checkout' });
  }
});

app.get('/return', (req, res) => {
  const to = String(req.query.to ?? '');
  if (!isAllowedReturnUrl(to)) return res.status(400).send('Invalid return URL');
  res.redirect(to);
});

app.listen(PORT, () => console.log(`Art gallery server running on port ${PORT}`));
