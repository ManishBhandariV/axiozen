# Axiozen — Placeholders & Setup Checklist

Everything below still holds a **placeholder** value. Each item lists where it lives,
how to get the real value, and how to apply it. Hand me the values and I'll wire them in.

Legend for "Apply via":
- **config** = edit `lib/config.ts`, then redeploy (`vercel --prod`)
- **env** = a Vercel environment variable (`vercel env add NAME production`), then redeploy
- **admin** = managed from the live admin panel at `/admin` (no redeploy needed)

---

## 1. Company / contact details — `lib/config.ts`  (Apply via: config)

| Field | Current placeholder | Real value = | How to get it |
|---|---|---|---|
| `companyEmail` | `info@axiozen.com` | Your public contact email | Your own |
| `companyPhone` | `+91 00000 00000` | Your phone number | Your own |
| `companyAddress` | `Your Street Address, City, State PIN, India` | Full postal address | Your own |
| `social.linkedin` | `#` | LinkedIn page URL | Copy from your LinkedIn company page |
| `social.facebook` | `#` | Facebook page URL | Copy from your FB page |
| `social.instagram` | `#` | Instagram profile URL | Copy from your IG profile |
| `social.youtube` | `#` | YouTube channel URL | Copy from your channel |
| `social.x` | `#` | X (Twitter) profile URL | Copy from your X profile |
| `social.threads` | `#` | Threads profile URL | Copy from your Threads profile |
| `googleMapsLink` | generic maps URL | Link to your business on Google Maps | Search your business on Google Maps → Share → Copy link |
| `googleMapsEmbed` | generic embed | Embed URL for the footer map | Google Maps → Share → "Embed a map" → copy the `src="..."` URL |

> Social icons with a `#` value still render but link nowhere. Real URLs make them clickable.

---

## 2. Email / contact form — Resend  (Apply via: env)  ⏸ NOT configured

The contact form **saves every enquiry to the database** (visible in `/admin/enquiries`)
even without email. Email notifications need Resend:

| Env var | Needed? | How to get it |
|---|---|---|
| `RESEND_API_KEY` | Required for email | 1. Sign up free at https://resend.com  2. **API Keys → Create API Key**  3. Copy the `re_...` value |
| `MAIL_TO` | Recommended | The inbox that receives enquiries. Recommended: `manishv.bhandari56@gmail.com` |
| `MAIL_FROM` | Optional | Sender. Default `Axiozen Website <onboarding@resend.dev>`. **In test mode Resend only delivers to the email that owns your Resend account.** To send from `@axiozen.com` to anyone, verify the domain: Resend → **Domains → Add Domain → axiozen.com**, add the DNS records, then set `MAIL_FROM="Axiozen <noreply@axiozen.com>"`. |

---

## 3. Analytics — optional  (Apply via: config)  ⏸ disabled

| Field | Current | How to get it |
|---|---|---|
| `gtmId` | `""` (off) | Google Tag Manager → container ID `GTM-XXXXXXX` |
| `gaMeasurementId` | `""` (off) | Google Analytics 4 → Admin → Data Streams → `G-XXXXXXXX` |

Leave blank to keep all tracking scripts disabled.

---

## 4. Live Google reviews — optional  (Apply via: env)

Without these, the homepage shows 3 built-in placeholder reviews.

| Env var | How to get it |
|---|---|
| `GOOGLE_PLACES_API_KEY` | Google Cloud Console → enable **Places API (New)** → create an API key |
| `GOOGLE_PLACE_ID` | https://developers.google.com/maps/documentation/places/web-service/place-id → search your business |

---

## 5. YouTube gallery videos — optional  (Apply via: env)

| Env var | How to get it |
|---|---|
| `YOUTUBE_CHANNEL_ID` | Your channel's ID (`UC...`). On the channel page: ⋯ → Share channel → Copy channel ID. Until set, the gallery shows pinned/placeholder videos only. |

---

## 6. Site content — replace Syncbyte's data  (Apply via: admin)

The clone inherited Syncbyte's real catalogue/content. Update from `/admin`:

| What | Where | Note |
|---|---|---|
| Product catalogue | `/admin` (Products, Categories, Brands) | Currently Syncbyte's products & vendor brands. Edit/hide/add as needed. |
| Customer logos | `public/images/customers/*.png` | Syncbyte's clients — replace the image files with your own. |
| Brand logos | `public/images/brands/*.png` | Vendor brands you resell — keep/replace. |
| Homepage carousel | `/admin/carousel` | Upload your own banner slides. |
| Gallery, Reviews, Downloads, Featured | `/admin/*` | Add your own. |

---

## Already configured (no action needed)

| Item | Value / store |
|---|---|
| `DATABASE_URL` + `POSTGRES_*` | Neon Postgres store `neon-cinereous-pillar` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store `axiozen-media` (public) |
| `SESSION_SECRET` | random 64-char hex |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | `admin` / (set during setup) |

Live site: https://axiozen.vercel.app · Admin: https://axiozen.vercel.app/admin
