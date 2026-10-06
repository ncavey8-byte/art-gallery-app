import cors from 'cors';
import express from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import Stripe from 'stripe';

const {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  PUBLIC_URL = 'http://localhost:4242',
  ALLOWED_WEB_ORIGINS = 'http://localhost:8081',
  APP_SCHEMES = 'artgalleryapp,exp',
  SHIPPING_COUNTRIES = 'US',
  SMTP_HOST,
  SMTP_PORT = '465',
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM,
  COMMISSION_EMAIL_TO = 'ncavey8@gmail.com',
  PORT = 4242,
} = process.env;

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;
const mailer =
  SMTP_HOST && SMTP_USER && SMTP_PASS
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        // Gmail shows App Passwords in groups of four; the spaces aren't part of the password.
        auth: { user: SMTP_USER, pass: SMTP_HOST === 'smtp.gmail.com' ? SMTP_PASS.replace(/\s+/g, '') : SMTP_PASS },
      })
    : null;

if (!stripe) console.warn('STRIPE_SECRET_KEY not set: shop endpoints are disabled.');
if (!mailer) console.warn('SMTP settings not set: commission requests cannot be emailed.');

const app = express();
app.use(cors());

function requireStripe(_req, res, next) {
  if (!stripe) return res.status(503).json({ error: 'Payments are not configured yet' });
  next();
}

const ARTWORK_CATEGORIES = ['pets-cats-dogs', 'pets-other', 'people', 'original'];

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
    category: ARTWORK_CATEGORIES.includes(m.category) ? m.category : 'original',
    sold: m.sold === 'true',
  };
}

app.post('/webhook', requireStripe, express.raw({ type: 'application/json' }), async (req, res) => {
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

app.get('/artworks', requireStripe, async (_req, res) => {
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

app.post('/checkout', requireStripe, async (req, res) => {
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

const CANVAS_SIZES = ['10x10', '20x20', '30x30'];
const MEDIUMS = { pencil: 'Pencil', oil: 'Oil paint' };
const MAX_PHOTOS = 1;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: MAX_PHOTOS },
  // HEIC/HEIF are listed explicitly because some clients send them as application/octet-stream.
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith('image/') || /\.(heic|heif)$/i.test(file.originalname)),
});

const oneLine = (value) => String(value ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, 200);
const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

app.post('/commission', upload.array('photos', MAX_PHOTOS), async (req, res) => {
  if (!mailer) return res.status(503).json({ error: 'Commission requests are not configured yet' });

  const canvasSize = oneLine(req.body.canvasSize);
  const medium = oneLine(req.body.medium);
  const name = oneLine(req.body.name);
  const email = oneLine(req.body.email);
  const phone = oneLine(req.body.phone);
  const notes = String(req.body.notes ?? '').trim().slice(0, 5000);
  const photos = req.files ?? [];

  if (!CANVAS_SIZES.includes(canvasSize)) return res.status(400).json({ error: 'Please choose a canvas size' });
  if (!MEDIUMS[medium]) return res.status(400).json({ error: 'Please choose pencil or oil paint' });
  if (!name) return res.status(400).json({ error: 'Please enter your name' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address' });
  if (photos.length === 0) return res.status(400).json({ error: 'Please attach a photo' });

  const size = canvasSize.replace('x', ' × ') + ' in';
  const details = [
    ['Canvas size', size],
    ['Medium', MEDIUMS[medium]],
    ['Name', name],
    ['Email', email],
    ['Phone', phone || 'Not provided'],
    ['Photo attached', photos[0].originalname || 'photo.jpg'],
  ];

  try {
    await mailer.sendMail({
      from: MAIL_FROM || SMTP_USER,
      to: COMMISSION_EMAIL_TO,
      replyTo: { name, address: email },
      subject: `New portrait commission: ${size} ${MEDIUMS[medium].toLowerCase()} for ${name}`,
      text: [...details.map(([k, v]) => `${k}: ${v}`), '', 'Notes:', notes || 'None'].join('\n'),
      html: `<h2>New portrait commission request</h2>
<table cellpadding="6">${details.map(([k, v]) => `<tr><td><b>${k}</b></td><td>${escapeHtml(v)}</td></tr>`).join('')}</table>
<p><b>Notes:</b><br>${notes ? escapeHtml(notes).replace(/\n/g, '<br>') : 'None'}</p>
<p>Reply to this email to respond to ${escapeHtml(name)} directly. The reference photo is attached.</p>`,
      attachments: photos.map((p, i) => ({
        filename: p.originalname || `photo-${i + 1}.jpg`,
        content: p.buffer,
        contentType: p.mimetype,
      })),
    });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not send your request. Please try again.' });
  }
});

app.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'The photo must be under 15 MB'
      : err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE' ? 'Please attach just one photo'
      : `Upload error: ${err.message}`;
    return res.status(400).json({ error: message });
  }
  next(err);
});

app.listen(PORT, () => console.log(`Art gallery server running on port ${PORT}`));
