# Deployment Guide

LyricalGenius is a static web application that can be deployed to any static hosting service. Here are instructions for the most popular platforms.

## Prerequisites

Before deploying, ensure:
- All dependencies are installed (`npm install`)
- The build completes successfully (`npm run build`)
- The `dist/` directory contains the built files

## Vercel (Recommended)

### Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Via GitHub Integration

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com) and sign in
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect the Vite configuration
6. Click "Deploy"

Your site will be live at `https://your-project.vercel.app`

## Netlify

### Via Netlify CLI

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### Via Netlify UI

1. Push your code to GitHub/GitLab/Bitbucket
2. Visit [netlify.com](https://netlify.com) and sign in
3. Click "Add new site" → "Import an existing project"
4. Connect your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

## GitHub Pages

### Using GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

Then enable GitHub Pages in repository settings and set the source to the `gh-pages` branch.

## Cloudflare Pages

### Via Wrangler CLI (Recommended)

```bash
# Install Wrangler CLI (if not already installed)
npm install -g wrangler

# Deploy to Cloudflare Pages
npm run deploy:cloudflare

# Or test deployment without publishing
npm run deploy:dry-run
```

The project includes a `wrangler.jsonc` configuration file that handles:
- Static asset deployment from the `dist/` directory
- SPA routing (all routes redirect to `index.html`)
- Automatic compatibility with Cloudflare Pages

### Via Cloudflare Dashboard

1. Push your code to GitHub
2. Visit [pages.cloudflare.com](https://pages.cloudflare.com)
3. Click "Create a project"
4. Connect your GitHub repository
5. Configure build:
   - Build command: `npm run build`
   - Build output directory: `dist`
6. Click "Save and Deploy"

## Custom Server (Nginx)

```bash
# Build the project
npm run build

# Copy dist/ to your server
scp -r dist/* user@server:/var/www/lyricalgenius/

# Nginx configuration
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/lyricalgenius;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

## Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

And `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Build and run:

```bash
docker build -t lyricalgenius .
docker run -p 8080:80 lyricalgenius
```

## Environment Variables

LyricalGenius doesn't require any environment variables as it's 100% client-side. All configuration is done through the UI.

## Post-Deployment Checklist

- [ ] Test audio upload on the deployed site
- [ ] Verify IndexedDB works (create and save a project)
- [ ] Test all export formats
- [ ] Check mobile responsiveness
- [ ] Verify all routes work correctly (no 404s on refresh)
- [ ] Test in different browsers (Chrome, Firefox, Safari, Edge)

## Troubleshooting

### Routes return 404 on refresh

Ensure your hosting platform is configured to redirect all routes to `/index.html` (SPA routing).

### IndexedDB not working

Check browser compatibility and ensure the site is served over HTTPS (some browsers restrict IndexedDB on HTTP).

### Audio files not loading

Ensure CORS headers are properly configured if serving audio from external sources.

## Performance Tips

- Enable gzip/brotli compression on your server
- Set proper cache headers for static assets
- Use a CDN for global distribution
- Consider lazy-loading heavy components

---

Need help? Open an issue on [GitHub](https://github.com/yourusername/lyricalgenius/issues).
