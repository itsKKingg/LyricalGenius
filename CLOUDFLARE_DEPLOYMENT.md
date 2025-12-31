# Cloudflare Pages Deployment Guide

This guide covers deploying LyricalGenius to Cloudflare Pages using Wrangler.

## Prerequisites

- Node.js 18+ installed
- A Cloudflare account (free tier works)
- Wrangler CLI installed globally: `npm install -g wrangler`

## Quick Start

### 1. Authenticate with Cloudflare

```bash
wrangler login
```

This will open a browser window to authenticate with your Cloudflare account.

### 2. Build and Deploy

```bash
# Build and deploy in one command
npm run deploy:cloudflare
```

Or test first with a dry run:

```bash
# Test deployment without publishing
npm run deploy:dry-run
```

### 3. Access Your Site

After deployment, Wrangler will output your site URL:
```
✨ Deployment complete! Take a flight to see your site!
➡️ https://lyricalgenius.pages.dev
```

## Configuration

The project includes a `wrangler.jsonc` configuration file:

```jsonc
{
  "name": "lyricalgenius",
  "compatibility_date": "2025-12-31",
  "assets": {
    "directory": "./dist"
  }
}
```

### Configuration Options

- **name**: The name of your Cloudflare Pages project
- **compatibility_date**: Ensures compatibility with Cloudflare's latest features
- **assets.directory**: Points to the build output directory (`dist/`)

### Custom Domain

To use a custom domain:

1. Go to your [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** → **Your Project**
3. Click **Custom domains**
4. Add your domain and follow the DNS configuration instructions

## SPA Routing

The project includes proper SPA routing configuration to ensure all routes redirect to `index.html`:

### Files Included

1. **public/_redirects** - Cloudflare Pages redirect rules
   ```
   /* /index.html 200
   ```

2. **public/_routes.json** - Cloudflare Pages routing configuration
   ```json
   {
     "version": 1,
     "include": ["/*"],
     "exclude": []
   }
   ```

These files are automatically copied to the `dist/` folder during the build process.

## Environment-Specific Configuration

### Development vs Production

The project uses the same configuration for both environments. Since LyricalGenius is 100% client-side, no environment variables or backend configuration is needed.

### Custom Project Name

To change the project name, edit `wrangler.jsonc`:

```jsonc
{
  "name": "your-custom-name",
  // ... rest of config
}
```

## Troubleshooting

### Error: "Missing entry-point to Worker script"

This error occurs when Wrangler can't find the configuration file or the assets directory.

**Solution**: Ensure `wrangler.jsonc` exists in the project root and run `npm run build` before deploying.

### Error: "Authentication Required"

**Solution**: Run `wrangler login` to authenticate with Cloudflare.

### Routes Return 404 on Refresh

**Solution**: The `_redirects` and `_routes.json` files should be in your `dist/` folder. Rebuild with `npm run build` to ensure they're copied from `public/`.

### Build Fails

**Solution**: Check that all dependencies are installed with `npm install` and that TypeScript compilation succeeds with `npm run build`.

## Advanced Configuration

### Custom Headers

To add custom headers (e.g., security headers), create a `_headers` file in the `public/` directory:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### Performance Optimization

Cloudflare Pages automatically provides:
- Global CDN distribution
- HTTP/2 and HTTP/3 support
- Automatic SSL/TLS
- Brotli and Gzip compression
- Image optimization (for images served through Cloudflare)

### CI/CD Integration

For automated deployments via GitHub Actions, create `.github/workflows/deploy-cloudflare.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
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
        
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: deploy
```

**Note**: You'll need to add a `CLOUDFLARE_API_TOKEN` secret to your GitHub repository settings.

## Monitoring and Analytics

### Cloudflare Web Analytics

To add privacy-friendly analytics:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Web Analytics**
3. Add a new site and copy the JavaScript snippet
4. Add it to `index.html` before the closing `</body>` tag

### Performance Monitoring

Cloudflare Pages provides built-in performance metrics in the dashboard:
- Page views
- Bandwidth usage
- Request count
- Cache hit ratio

## Cost

Cloudflare Pages is **free** for:
- Unlimited static requests
- Unlimited bandwidth
- 500 builds per month
- Concurrent builds: 1

Perfect for LyricalGenius since it's a static site!

## Support

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [LyricalGenius Issues](https://github.com/yourusername/lyricalgenius/issues)

---

**Last Updated**: 2025-01-02
