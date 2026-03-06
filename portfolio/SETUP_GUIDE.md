# Secure Deployment Guide — ajaykushwaha.in
# GitHub + Netlify (No credentials ever exposed)

## WHY GITHUB?
Drag-and-drop only uploads a single file.
GitHub uploads the full folder including netlify/functions/ → serverless functions run → credentials stay hidden on server.

---

## STEP 1 — Create GitHub Account (if you don't have one)
1. Go to https://github.com
2. Click "Sign up" → use any email
3. Verify email → log in

---

## STEP 2 — Create a New Repository
1. Click the "+" icon (top right) → "New repository"
2. Repository name: `portfolio`
3. Set to: ✅ Public
4. Click "Create repository"

---

## STEP 3 — Upload Your Files
On the repository page:
1. Click "uploading an existing file" (link in the middle of the page)
2. Drag the ENTIRE folder structure:

   📁 portfolio/
   ├── index.html
   ├── netlify.toml
   └── 📁 netlify/
       └── 📁 functions/
           ├── send-contact.js
           └── send-lor.js

   IMPORTANT: Upload ALL files keeping the folder structure intact
   
3. Scroll down → Click "Commit changes"

---

## STEP 4 — Connect Netlify to GitHub
1. Go to https://netlify.com → log in
2. Click your site: ajaykushwaha.in
3. Left sidebar → "Site configuration"
4. Scroll to "Build & deploy" → "Link repository"
5. Choose "GitHub" → Authorize Netlify
6. Select your "portfolio" repository → click Deploy

---

## STEP 5 — Add Environment Variables (your secret keys)
In Netlify → Site configuration → Environment variables:

Click "Add a variable" for each:

| Key                   | Value                          |
|-----------------------|--------------------------------|
| EMAILJS_PUBLIC_KEY    | (from emailjs.com Account page)|
| EMAILJS_PRIVATE_KEY   | (from emailjs.com Account page)|
| EMAILJS_SERVICE_ID    | (from Email Services page)     |
| CONTACT_TEMPLATE_ID   | (from Email Templates page)    |
| LOR_TEMPLATE_ID       | (from Email Templates page)    |

Click "Save" after each one.

---

## STEP 6 — Trigger Deploy
1. Left sidebar → "Deploys"
2. Click "Trigger deploy" → "Deploy site"
3. Wait ~30 seconds
4. ✅ Forms now work with full security

---

## HOW TO UPDATE YOUR SITE IN FUTURE
1. Go to github.com/YOUR_USERNAME/portfolio
2. Click index.html → click pencil icon (Edit)
3. Make changes → click "Commit changes"
4. Netlify auto-deploys in 30 seconds ✅

OR: Open the file in VS Code, edit, then drag-and-drop onto GitHub.

---

## SECURITY ACHIEVED
✅ No credentials in HTML (anyone can view-source, nothing to steal)
✅ Credentials only on Netlify servers (encrypted, never exposed)
✅ Server-side validation (deadline check, input sanitization)
✅ CORS restricted to ajaykushwaha.in only
✅ Content Security Policy headers block XSS attacks
