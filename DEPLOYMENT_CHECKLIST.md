# Deployment Checklist

Use this checklist to ensure a smooth deployment.

## Pre-Deployment

### 1. API Keys Ready
- [ ] Google Gemini API key obtained from https://makersuite.google.com/app/apikey
- [ ] ElevenLabs API key obtained (optional) from https://elevenlabs.io
- [ ] API keys tested in local environment

### 2. Code Ready
- [ ] All changes committed to git
- [ ] Code builds successfully (`npm run build`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Tested locally (`npm run dev`)

### 3. Configuration Files
- [ ] `vercel.json` exists (for Vercel)
- [ ] `wrangler.toml` exists (for Cloudflare)
- [ ] `.env.example` is up to date
- [ ] `.gitignore` excludes `.env` and `.env.local`

## Vercel Deployment

### Initial Setup
- [ ] Vercel CLI installed (`npm i -g vercel`)
- [ ] Logged in to Vercel (`vercel login`)
- [ ] Project linked or ready to create

### Deployment Steps
- [ ] Run `npm run build` (verify it works)
- [ ] Run `npm run deploy:vercel` or `vercel --prod`
- [ ] Deployment successful
- [ ] Note deployment URL

### Environment Variables
- [ ] Go to Vercel dashboard → Project → Settings → Environment Variables
- [ ] Add `GEMINI_API_KEY` with your key
- [ ] Add `ELEVENLABS_API_KEY` (optional)
- [ ] Apply to: Production, Preview, Development
- [ ] Save changes
- [ ] Trigger redeploy (or run `npm run deploy:vercel` again)

### Verification
- [ ] Visit deployment URL
- [ ] Site loads correctly
- [ ] Can create new project
- [ ] Can upload audio file
- [ ] **Auto Lyrics button works** (key test!)
- [ ] Captions appear on timeline
- [ ] Preview shows lyrics with animation

## Cloudflare Pages Deployment

### Initial Setup
- [ ] Wrangler CLI installed (`npm i -g wrangler`)
- [ ] Logged in to Cloudflare (`wrangler login`)
- [ ] Cloudflare account ready

### Deployment Steps
- [ ] Run `npm run build` (verify it works)
- [ ] Run `npm run deploy:cloudflare`
- [ ] Deployment successful
- [ ] Note deployment URL

### Environment Variables
- [ ] Run `wrangler pages secret put GEMINI_API_KEY`
- [ ] Enter your Gemini API key when prompted
- [ ] Run `wrangler pages secret put ELEVENLABS_API_KEY` (optional)
- [ ] Enter your ElevenLabs key when prompted
- [ ] Secrets saved successfully

### Alternative: Dashboard Method
- [ ] Go to https://dash.cloudflare.com
- [ ] Navigate to Workers & Pages → Your Project
- [ ] Go to Settings → Environment Variables
- [ ] Add `GEMINI_API_KEY` and `ELEVENLABS_API_KEY`
- [ ] Apply to Production and Preview
- [ ] Save and trigger redeploy

### Verification
- [ ] Visit deployment URL
- [ ] Site loads correctly
- [ ] Can create new project
- [ ] Can upload audio file
- [ ] **Auto Lyrics button works** (key test!)
- [ ] Captions appear on timeline
- [ ] Preview shows lyrics with animation

## Post-Deployment

### Testing
- [ ] Test on desktop browser
- [ ] Test on mobile browser (if applicable)
- [ ] Test Auto Lyrics with different audio files
- [ ] Test all animation templates
- [ ] Test undo/redo functionality
- [ ] Test keyboard shortcuts (Space, Ctrl+Z, etc.)
- [ ] Test export functionality

### Performance
- [ ] Check page load time (< 3 seconds)
- [ ] Check API response time (Auto Lyrics)
- [ ] Verify no console errors
- [ ] Test with slow network (throttling)

### Custom Domain (Optional)
- [ ] Domain registered and ready
- [ ] DNS configured (A record or CNAME)
- [ ] SSL certificate active (auto on both platforms)
- [ ] Domain verified and working

### Monitoring
- [ ] Set up error tracking (optional)
- [ ] Monitor API usage in Google Cloud Console
- [ ] Monitor function execution in platform dashboard
- [ ] Set up usage alerts (optional)

## GitHub Actions (Optional)

### Vercel Auto-Deploy
- [ ] `.github/workflows/deploy-vercel.yml` exists
- [ ] GitHub secrets configured:
  - [ ] `VERCEL_TOKEN`
  - [ ] `VERCEL_ORG_ID`
  - [ ] `VERCEL_PROJECT_ID`
- [ ] Push to main triggers deploy
- [ ] Deployment successful

### Cloudflare Auto-Deploy
- [ ] `.github/workflows/deploy-cloudflare.yml` exists
- [ ] GitHub secrets configured:
  - [ ] `CLOUDFLARE_API_TOKEN`
  - [ ] `CLOUDFLARE_ACCOUNT_ID`
- [ ] Push to main triggers deploy
- [ ] Deployment successful

## Documentation

- [ ] README.md updated with deployment info
- [ ] DEPLOYMENT_GUIDE.md reviewed
- [ ] Team members informed of deployment
- [ ] Deployment URL shared

## Rollback Plan (Just in Case)

### Vercel
- [ ] Know how to rollback: Dashboard → Deployments → Previous → Promote to Production

### Cloudflare
- [ ] Know how to rollback: Dashboard → Deployments → Previous → Retry

## Common Issues & Solutions

### Issue: API Returns 404
**Solution**: 
- Vercel: Check `/api` folder exists
- Cloudflare: Check `/functions/api` folder exists
- Verify build includes function files

### Issue: Environment Variables Not Working
**Solution**:
- Redeploy after adding variables
- Verify variable names are exact (case-sensitive)
- Check API key is valid

### Issue: Build Fails
**Solution**:
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Issue: Auto Lyrics Button Does Nothing
**Solution**:
- Check browser console for errors
- Verify `GEMINI_API_KEY` is set correctly
- Test API key in Google AI Studio
- Check function logs in platform dashboard

## Success Criteria

✅ Deployment complete when:
- [ ] Site is live and accessible
- [ ] Auto Lyrics feature works end-to-end
- [ ] No console errors
- [ ] All features functional
- [ ] Performance is acceptable
- [ ] Environment variables secure

## Support

If you encounter issues:
1. Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. Review platform documentation (Vercel or Cloudflare)
3. Check GitHub Issues
4. Contact platform support

---

**Platform Comparison**: See [PLATFORM_COMPARISON.md](./PLATFORM_COMPARISON.md) to choose between Vercel and Cloudflare.

**Last Updated**: December 2024
