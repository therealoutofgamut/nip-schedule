# Australian NIP Immunisation Schedule

Interactive vaccine schedule based on the National Immunisation Program (January 2026).

## Option A: Deploy to Vercel (2 minutes)

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
gh repo create nip-schedule --public --push

# 2. Deploy
npx vercel
# Follow prompts — it auto-detects Vite
# Your site is live at https://nip-schedule.vercel.app
```

Or just go to [vercel.com/new](https://vercel.com/new), import the GitHub repo, and click Deploy. Zero config needed for Vite projects.

## Option B: Deploy to Cloudflare Pages (2 minutes)

```bash
# 1. Push to GitHub (same as above)

# 2. Go to dash.cloudflare.com > Pages > Create > Connect to Git
#    Build command: npm run build
#    Output directory: dist
#    Done.
```

## Option C: Self-host on QNAP via Docker

```bash
# 1. Copy project to your NAS
scp -r . admin@<qnap-ip>:/share/Container/nip-schedule/

# 2. SSH in and build
ssh admin@<qnap-ip>
cd /share/Container/nip-schedule
docker compose up -d --build

# Site is now at http://<qnap-ip>:8092
```

### Expose via Cloudflare Tunnel

Add to your tunnel config (`~/.cloudflared/config.yml` or via dashboard):

```yaml
- hostname: nip.yourdomain.com
  service: http://nip-schedule:80
```

Then restart cloudflared. If your tunnel container is on the same Docker network (`proxy`), it'll just work.

### Expose via reverse proxy (if using Nginx Proxy Manager)

Add a proxy host:
- Domain: `nip.yourdomain.com`
- Forward to: `nip-schedule:80`
- Enable SSL (Let's Encrypt)

## Local development

```bash
npm install
npm run dev
# Open http://localhost:5173
```

## Build for production

```bash
npm run build
# Static files in ./dist — serve from anywhere
```

## Data sources

- [NIP Schedule (Jan 2026)](https://www.health.gov.au/topics/immunisation/when-to-get-vaccinated/national-immunisation-program-schedule)
- [Australian Immunisation Handbook](https://immunisationhandbook.health.gov.au)
- [NCIRS Immunisation Schedules](https://ncirs.org.au/health-professionals/immunisation-schedules)
