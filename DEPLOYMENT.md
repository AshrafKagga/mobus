# Deployment Guide for Vercel

## Prerequisites

1. **Cloud Database**: You'll need a PostgreSQL database in the cloud. Recommended options:
   - [Neon](https://neon.tech) (Free tier available)
   - [Supabase](https://supabase.com) (Free tier available)
   - [Railway](https://railway.app) (Free tier available)

## Step 1: Set up Cloud Database

### Option A: Neon (Recommended)
1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string (it looks like: `postgresql://username:password@host/database`)

### Option B: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a free account
3. Create a new project
4. Go to Settings > Database
5. Copy the connection string

## Step 2: Deploy to Vercel

1. **Connect your GitHub repository to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your `mobus` repository

2. **Configure Environment Variables**:
   In your Vercel project settings, add these environment variables:
   ```
   DATABASE_URL=your_cloud_database_connection_string
   NODE_ENV=production
   SESSION_SECRET=your_strong_random_secret_here
   ```

3. **Deploy**:
   - Vercel will automatically detect the `vercel.json` configuration
   - Click "Deploy"

## Step 3: Set up Database Schema

After deployment, you need to run the database migrations:

1. **Option A: Using Vercel CLI**:
   ```bash
   npm i -g vercel
   vercel login
   vercel env pull .env.local
   npm run db:push
   ```

2. **Option B: Using Database Dashboard**:
   - Go to your database provider's dashboard
   - Use the SQL editor to run the schema from `shared/schema.ts`

## Step 4: Verify Deployment

1. Visit your Vercel URL
2. The application should load properly
3. Test the registration/login functionality

## Troubleshooting

### Common Issues:

1. **"Cannot find module" errors**:
   - Make sure all dependencies are in `package.json`
   - Check that `vercel.json` is properly configured

2. **Database connection errors**:
   - Verify `DATABASE_URL` is correct
   - Check if your database allows external connections
   - Ensure the database schema is set up

3. **Static files not loading**:
   - The build process should copy files to `server/public/`
   - Check that `npm run build:vercel` completes successfully

### Environment Variables Reference:

```bash
# Required
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
SESSION_SECRET=your-secret-here

# Optional
PORT=5000
VERCEL_URL=your-app.vercel.app
```

## Alternative Deployment Options

If Vercel doesn't work for your needs, consider:

1. **Railway**: Full-stack deployment platform
2. **Render**: Good for Node.js applications
3. **Heroku**: Traditional hosting platform
4. **DigitalOcean App Platform**: Simple deployment

## Support

If you encounter issues:
1. Check the Vercel deployment logs
2. Verify all environment variables are set
3. Ensure the database is accessible from Vercel's servers
