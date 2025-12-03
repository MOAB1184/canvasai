# CanvasAI Complete Setup Guide

This guide covers everything you need to set up CanvasAI for production on Vercel.

## Quick Answer: `.env` vs `.env.local`

- **For local development**: Use `.env.local` (this is ignored by git)
- **For Vercel production**: Add environment variables in the Vercel Dashboard → Settings → Environment Variables
- **Never commit `.env` or `.env.local` to git** - they contain secrets!

---

## 1. Prerequisites

- A **GitHub Account** (to host the code)
- A **Vercel Account** (for hosting)
- A **MongoDB Atlas Account** (free tier works) for the database
- A **Google Cloud Console Account** (for OAuth and Gemini API)

---

## 2. Environment Variables

Create a `.env.local` file in the `website` folder for local development:

```env
# MongoDB Database
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority"
MONGODB_DB_NAME="canvasai"

# Authentication (Google OAuth)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

# Security
JWT_SECRET="generate_a_long_random_string_here_at_least_32_characters"

# AI Models (Server-side Gemini API Key)
GOOGLE_API_KEY="your_google_gemini_api_key"

# Public URL (for production, change to your Vercel domain)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: Wasabi Storage (for lecture recordings feature)
WASABI_ACCESS_KEY="your_wasabi_key"
WASABI_SECRET_KEY="your_wasabi_secret"
WASABI_REGION="us-east-1"
WASABI_BUCKET_NAME="your_bucket"

# Optional: RunPod (for lecture transcription)
RUNPOD_API_KEY="your_runpod_key"
RUNPOD_ENDPOINT_ID="your_endpoint_id"

# Optional: Canvas LMS (for server-side Canvas integration)
CANVAS_BASE_URL="https://your-school.instructure.com"
CANVAS_ACCESS_TOKEN="your_canvas_token"
CANVAS_COURSE_ID="your_course_id"
```

---

## 3. Setting Up External Services

### A. MongoDB Atlas (Database) - FREE TIER AVAILABLE

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free account and a new project.
3. Click **Build a Database** → Choose **M0 Free Tier**.
4. Select a cloud provider and region closest to your users.
5. Create a database user:
   - Username: `canvasai`
   - Password: Generate a secure password (save this!)
6. Add IP Access:
   - For development: Add your current IP
   - For Vercel: Add `0.0.0.0/0` (allows all IPs - Vercel uses dynamic IPs)
7. Click **Connect** → **Connect your application**.
8. Copy the connection string and replace `<password>` with your password.
9. Set `MONGODB_URI` to this connection string.

### B. Google Cloud (OAuth & Gemini API)

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., "CanvasAI").
3. **Enable APIs**:
   - Search for and enable "Google People API"
   - Search for and enable "Generative Language API" (for Gemini)
   
4. **OAuth Consent Screen**:
   - Go to **APIs & Services** → **OAuth consent screen**
   - Select **External** user type
   - Fill in app name ("CanvasAI"), user support email, developer contact
   - Add scopes: `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `openid`
   - Add test users if in "Testing" mode

5. **Create OAuth Credentials**:
   - Go to **Credentials** → **Create Credentials** → **OAuth Client ID**
   - Type: **Web application**
   - Name: `CanvasAI Web`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://your-project.vercel.app`
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/google/callback`
     - `https://your-project.vercel.app/api/auth/google/callback`
   - Copy **Client ID** and **Client Secret**

6. **Gemini API Key**:
   - Go to [Google AI Studio](https://aistudio.google.com/)
   - Click **Get API key** → **Create API key**
   - Copy the key to `GOOGLE_API_KEY`

### C. Canvas LMS Token (For Users)

Users generate their own Canvas API tokens:
1. Log in to Canvas LMS
2. Go to **Account** → **Settings**
3. Scroll to **Approved Integrations**
4. Click **+ New Access Token**
5. Enter a purpose (e.g., "CanvasAI")
6. Copy the generated token

---

## 4. Local Development

```bash
# Install dependencies
cd website
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 5. Deployment to Vercel

1. Push your code to GitHub.
2. Log in to [Vercel](https://vercel.com) and click **Add New** → **Project**.
3. Import your GitHub repository.
4. **IMPORTANT**: Set **Root Directory** to `website`.
5. Add all environment variables from step 2 (use production values):
   - Update `GOOGLE_REDIRECT_URI` to use your Vercel domain
   - Update `NEXT_PUBLIC_APP_URL` to your Vercel domain
6. Click **Deploy**.

---

## 6. Extension Setup

After deploying to Vercel:

1. Open `extension/content.js`.
2. Find `const CANVASAI_URL = 'http://localhost:3000';`.
3. Change it to your Vercel URL: `const CANVASAI_URL = 'https://your-project.vercel.app';`.
4. Go to `chrome://extensions` in Chrome.
5. Enable **Developer mode** (toggle in top right).
6. Click **Load unpacked** and select the `extension` folder.
7. Navigate to any Canvas LMS page to see the extension.

---

## 7. Features Checklist

### Website Features
- [x] User authentication (Email/Password + Google OAuth)
- [x] Dashboard with flashcards view
- [x] User-to-user messaging
- [x] User search
- [x] Settings page
- [x] Flashcard sync from extension

### Extension Features
- [x] AI Chat with Gemini
- [x] Flashcard generation from Canvas content
- [x] Smart content search/indexing
- [x] Auto-updating To-Do list
- [x] Canvas API integration
- [x] Account sync with website

---

## 8. Troubleshooting

### "User not found" after signup
- Check MongoDB connection string is correct
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0` for Vercel

### Google OAuth not working
- Ensure redirect URIs match EXACTLY (including http vs https)
- Check if OAuth consent screen is published (not in testing mode)

### Extension can't connect to website
- Update `CANVASAI_URL` in `extension/content.js`
- Ensure no trailing slash in the URL
- Check browser console for CORS errors

### Flashcards not syncing
- Verify user is logged in on both website and extension
- Check browser console for API errors
- Ensure `CANVASAI_URL` matches your deployed site

---

## 9. Optional: Wasabi Storage + RunPod (Lecture Recording)

For the lecture recording and transcription feature:

1. **Wasabi Storage**: Create a bucket at [Wasabi](https://wasabi.com)
2. **RunPod**: Deploy the worker from `runpod_worker/` folder
3. Add the environment variables listed in step 2

---

## Support

If you encounter issues, check:
1. Browser console for errors
2. Vercel function logs
3. MongoDB Atlas connection status
