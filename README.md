# AI Search Checker

เครื่องมือตรวจสอบความพร้อมของเว็บไซต์สำหรับ AI Search

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
```

Static files will be in `dist/` folder

## Deploy

### Option 1: AWS S3 + CloudFront + Cloudflare

1. Push to GitHub
2. Set up GitHub Actions for auto-deploy to S3
3. Configure CloudFront
4. Set Cloudflare as proxy (DNS only or Full proxy)

### Option 2: AWS EC2

1. Push to GitHub
2. Pull code on EC2
3. Run `npm run build`
4. Serve `dist/` folder with Nginx

### Option 3: Vercel/Netlify (Easiest)

1. Connect GitHub repo to Vercel/Netlify
2. Auto-deploy on every push

## Environment Variables

Create `.env.local` for local development:

```
NEXT_PUBLIC_API_URL=your_api_url
```

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
