# VidzAI starter project

## Contents
- `public/index.html`: mobile-friendly VidzAI interface
- `api/generate.js`: starts a Runway video-generation task
- `api/status.js`: checks task status
- `package.json`: project metadata

## Deploy
1. Upload the files and folders to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import the repository.
3. In Project Settings → Environment Variables, add `RUNWAYML_API_SECRET` with your private Runway API key.
4. Save, then redeploy.
5. Open the deployed site and test with a short prompt.

Keep the API key out of the frontend and GitHub. Runway API use consumes paid credits. This is an early starter; authentication, rate limiting, payment processing, persistent project history, and production abuse prevention are not included.
