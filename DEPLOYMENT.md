# Deployment Guide - Digital Health Wallet

## Prerequisites

Before deploying the Digital Health Wallet, ensure you have:
- A Supabase account (free tier is sufficient for development)
- Node.js v18 or higher installed
- npm or yarn package manager
- Git (for version control)

## Step 1: Supabase Project Setup

### 1.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create a new account
3. Click "New Project"
4. Fill in project details:
   - **Name**: Digital Health Wallet
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
   - **Pricing Plan**: Free tier is fine for development
5. Click "Create new project"
6. Wait 2-3 minutes for project initialization

### 1.2 Get API Credentials

1. In your Supabase dashboard, go to **Project Settings** (gear icon)
2. Click on **API** in the left sidebar
3. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### 1.3 Apply Database Migrations

The database schema has already been created. To apply it to your Supabase project:

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the migration SQL from the project (see database migration details below)
4. Run the query

**Note**: The migration was already applied during development. If you're setting up a fresh Supabase instance, the tables and policies have been created via the Supabase MCP tools.

### 1.4 Verify Database Setup

1. Go to **Table Editor** in Supabase dashboard
2. Verify these tables exist:
   - profiles
   - vital_types (should have 14 rows)
   - vitals
   - reports
   - report_shares

### 1.5 Verify Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Verify bucket exists: `health-reports`
3. Check that bucket is private (not public)

## Step 2: Application Configuration

### 2.1 Clone/Download Project

If using Git:
```bash
git clone <your-repo-url>
cd digital-health-wallet
```

### 2.2 Install Dependencies

```bash
npm install
```

### 2.3 Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 2.4 Test Locally

Run the development server:
```bash
npm run dev
```

Open your browser to `http://localhost:5173` and verify:
- Login/Register pages load
- You can create an account
- Dashboard appears after login

## Step 3: Production Build

### 3.1 Build for Production

```bash
npm run build
```

This creates optimized files in the `dist/` directory.

### 3.2 Test Production Build Locally

```bash
npm run preview
```

Visit `http://localhost:4173` to test the production build.

## Step 4: Deployment Options

### Option A: Vercel (Recommended)

#### 4.1 Install Vercel CLI
```bash
npm install -g vercel
```

#### 4.2 Deploy
```bash
vercel
```

Follow the prompts:
- Link to existing project or create new
- Set up project settings
- Deploy

#### 4.3 Configure Environment Variables

In Vercel dashboard:
1. Go to your project
2. Settings → Environment Variables
3. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

#### 4.4 Redeploy
```bash
vercel --prod
```

### Option B: Netlify

#### 4.1 Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### 4.2 Deploy
```bash
netlify deploy
```

For production:
```bash
netlify deploy --prod
```

#### 4.3 Configure Environment Variables

In Netlify dashboard:
1. Site settings → Build & deploy → Environment
2. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Option C: Static Hosting (Cloudflare Pages, GitHub Pages, etc.)

#### 4.1 Build the Project
```bash
npm run build
```

#### 4.2 Upload `dist/` Folder

Upload the contents of the `dist/` folder to your hosting provider.

**Important**: Configure environment variables in your hosting platform before building.

### Option D: Docker Deployment

#### 4.1 Create Dockerfile

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 4.2 Create nginx.conf

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires max;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 4.3 Build and Run
```bash
docker build \
  --build-arg VITE_SUPABASE_URL=your_url \
  --build-arg VITE_SUPABASE_ANON_KEY=your_key \
  -t health-wallet .

docker run -p 80:80 health-wallet
```

## Step 5: Post-Deployment Verification

### 5.1 Test Authentication
1. Visit your deployed URL
2. Register a new account
3. Verify you receive confirmation and can log in

### 5.2 Test Core Features
1. **Profile**: Update your profile information
2. **Vitals**: Add a vital measurement
3. **Reports**: Upload a test PDF
4. **Sharing**: Try sharing a report (requires second test account)

### 5.3 Test File Upload
1. Upload a small PDF or image
2. Verify it appears in reports list
3. Try viewing and downloading

### 5.4 Check Console
1. Open browser DevTools
2. Check for any errors in Console
3. Verify no failed network requests

## Step 6: Supabase Production Settings

### 6.1 Email Configuration (Optional)

For production use, configure email settings:
1. Supabase Dashboard → Authentication → Email Templates
2. Customize confirmation and reset password emails
3. Configure SMTP settings for custom email domain

### 6.2 Security Settings

1. **Authentication** → Settings:
   - Set password requirements
   - Configure session timeouts
   - Enable/disable email confirmation

2. **Database** → Policies:
   - Verify all RLS policies are active
   - Test policies with different user accounts

3. **Storage** → Policies:
   - Verify bucket policies are active
   - Test file access permissions

### 6.3 Performance Settings

1. Enable **Connection Pooling** (if using Supabase Pro)
2. Set up **Database Indexes** (already configured)
3. Configure **CDN** for Storage bucket

## Step 7: Monitoring and Maintenance

### 7.1 Monitor Usage

Supabase Dashboard provides:
- **Database usage**: Storage, connections, queries
- **Storage usage**: Files and bandwidth
- **Authentication**: Active users, sign-ups

### 7.2 Set Up Alerts

1. Configure email alerts for:
   - High database usage
   - Storage limits
   - Error rates

### 7.3 Regular Maintenance

- **Weekly**: Check error logs
- **Monthly**: Review usage metrics
- **Quarterly**: Update dependencies

## Step 8: Custom Domain (Optional)

### 8.1 Configure DNS

Add DNS records for your domain:
```
Type: A
Name: @
Value: [Your hosting provider's IP]

Type: CNAME
Name: www
Value: [Your hosting provider's domain]
```

### 8.2 SSL Certificate

Most hosting providers (Vercel, Netlify) automatically provision SSL certificates.

For manual setup:
1. Use Let's Encrypt for free SSL
2. Configure your web server to use HTTPS
3. Force HTTPS redirects

## Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution**: Ensure `.env` file exists with correct values, or environment variables are set in hosting platform.

### Issue: "Failed to fetch data from Supabase"

**Solution**:
1. Check Supabase URL is correct
2. Verify API key is the **anon** key, not service role key
3. Check Supabase project is active

### Issue: "Failed to upload file"

**Solution**:
1. Verify storage bucket exists
2. Check RLS policies on storage.objects
3. Ensure file size is under 10MB
4. Verify file type is PDF or image

### Issue: "Cannot create profile"

**Solution**:
1. Check profiles table exists
2. Verify RLS policies allow INSERT for authenticated users
3. Ensure user_id matches auth.uid()

### Issue: "Reports not showing"

**Solution**:
1. Check browser console for errors
2. Verify RLS policies on reports table
3. Ensure reports are linked to correct user_id

## Security Checklist

Before going to production, verify:

- [ ] Environment variables are not committed to Git
- [ ] `.env` file is in `.gitignore`
- [ ] Supabase anon key is used (not service role key)
- [ ] All tables have RLS enabled
- [ ] Storage bucket has RLS policies
- [ ] HTTPS is enforced
- [ ] Password requirements are set
- [ ] Error messages don't expose sensitive info
- [ ] File upload size limits are enforced
- [ ] File type validation is in place

## Performance Checklist

- [ ] Production build is optimized
- [ ] Assets are served via CDN
- [ ] Images are compressed
- [ ] Database has proper indexes
- [ ] Unused dependencies removed
- [ ] Code splitting implemented
- [ ] Lazy loading enabled

## Backup Strategy

### Database Backups

Supabase automatically backs up your database:
- **Free Plan**: 7 days of backup history
- **Pro Plan**: 30 days + point-in-time recovery

### File Backups

Consider periodic backups of storage bucket:
1. Download all files via Supabase API
2. Store in secondary location (S3, Google Cloud, etc.)
3. Automate with scheduled scripts

## Scaling Considerations

### When to Scale Up

Monitor these metrics:
- Database connections near limit
- Storage approaching plan limit
- Response times increasing
- Error rates climbing

### Scaling Options

1. **Supabase**: Upgrade to Pro plan
2. **Hosting**: Add more server instances
3. **Database**: Enable connection pooling
4. **CDN**: Add caching layer

## Cost Estimation

### Free Tier (Supabase + Vercel)
- **Supabase**: Free up to 500MB database, 1GB storage
- **Vercel**: Free unlimited deployments
- **Total**: $0/month (suitable for development and small projects)

### Production (Supabase Pro + Vercel Pro)
- **Supabase Pro**: $25/month (8GB database, 100GB storage)
- **Vercel Pro**: $20/month (enhanced performance)
- **Total**: $45/month (suitable for production with moderate traffic)

## Support and Resources

- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **Tailwind CSS**: https://tailwindcss.com

## Conclusion

Your Digital Health Wallet is now deployed and ready for use. Remember to:
1. Monitor usage regularly
2. Keep dependencies updated
3. Backup data periodically
4. Test new features before deploying
5. Collect user feedback for improvements

For issues or questions, refer to the documentation or create an issue in the project repository.
