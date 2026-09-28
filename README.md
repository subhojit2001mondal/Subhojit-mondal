# Remix Parijai Group — Hotels & Residencies

Thoughtful Hospitality, Dedicated Care. Luxury mountain stays at Trikuta Residency Gangtok and specialized medical convenience at Hotel Parijaye near AIIMS Kalyani.

---

## Deploying to Vercel

This repository is optimized for fail-proof deployments on Vercel using standard `npm`.

### Recommended Vercel Project Settings

| Setting | Value | Notes |
| :--- | :--- | :--- |
| **Framework Preset** | `Vite` | Automatically detects Vite configuration |
| **Root Directory** | `./` | Root of repository |
| **Node.js Version** | `22.x` | Set in Vercel Project Settings &gt; General |
| **Install Command** | `npm install` *(Default)* | Clean install; lockfile is `package-lock.json` |
| **Build Command** | `npm run build` | Runs `vite build` |
| **Output Directory** | `dist` | Default Vite build directory |

### Environment Variables

The application builds and loads cleanly **even if zero environment variables are configured in Vercel**.

| Variable | Required? | Purpose & Graceful Fallback Behavior |
| :--- | :--- | :--- |
| `VITE_GOOGLE_MAPS_API_KEY` | **Optional** | Enables embedded Google Maps tiles and live Google Places search in the interactive map section.<br><br>**If omitted or left empty:** The website does **not** crash or fail to build. The sightseeing section and AIIMS Kalyani access guide gracefully fall back to fully interactive curated destination cards, distances, altitude tags, and direct external Google Maps navigation links (`maps.app.goo.gl`). |

*Note on Firebase & Gemini:*
- **Firebase:** Database, photo storage, and authentication settings are read directly from `firebase-applet-config.json` inside the repository. No environment variables are required for Firebase to connect to your live Firestore database.
- **Help Desk:** The floating help launcher connects guests directly to hotel WhatsApp desk and direct phone numbers; no external AI API key or server proxy is required.

---

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run TypeScript checks
npm run lint

# Build for production
npm run build
```
