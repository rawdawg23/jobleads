# CTEK JOB LEADS

A job board platform connecting customers with dealers for automotive services.

## Authentication Setup

This application uses Redis for authentication. To enable authentication, you need to set the following environment variables:

### Required Environment Variables

```bash
# Redis Configuration (Upstash KV)
KV_REST_API_URL=your_redis_url_here
KV_REST_API_TOKEN=your_redis_token_here
```

### Setting up Upstash Redis

1. Go to [Upstash](https://upstash.com/) and create an account
2. Create a new Redis database
3. Copy the `REST API URL` and `REST API Token` from your database
4. Add these to your `.env.local` file:

```bash
KV_REST_API_URL=https://your-database-url.upstash.io
KV_REST_API_TOKEN=your_token_here
```

### Without Redis Configuration

If Redis is not configured, the application will show an error message: "Authentication service is not configured. Please contact support."

## Development

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
npm start
```
