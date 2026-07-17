---
name: github-actions-ci-deploy-pages
description: Guide to setting up CI/CD for Vite/React to GitHub Pages.
---
# GitHub Actions CI Deploy Pages

1. **Workflow File:** Create `.github/workflows/deploy.yml`.
2. **Build Steps:** `npm install`, `npm run build` (running Vite build).
3. **Artifacts:** Ensure the Whisper `.bin` models and PWA service worker files are copied to the `dist` folder.
4. **Deploy:** Use `actions/upload-pages-artifact` and `actions/deploy-pages`.
5. **Exit criteria:** Commits to `main` automatically deploy to GitHub Pages and function correctly.
