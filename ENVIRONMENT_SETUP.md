# Environment Setup Guide

## Quick Start

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update the required values in `.env`:**
   - `MONGO_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A secure random string (change the default!)
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - `STRIPE_BACKEND_SECRET` - Your Stripe secret key
   - `FRONTEND_URL` - Your frontend application URL

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Environment-Specific Configurations

### Development
```env
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/RuralConnect
FRONTEND_URL=http://localhost:5173
DEBUG_MODE=true
```

### Production
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/pharmaconnect-prod
FRONTEND_URL=https://yourdomain.com
TRUST_PROXY=true
DEBUG_MODE=false
```

### Testing
```env
NODE_ENV=test
MONGO_URI=mongodb://localhost:27017/RuralConnect-test
JWT_SECRET=test-secret
```

## Security Recommendations

1. **Never commit `.env` files** - Add `.env` to your `.gitignore`
2. **Use strong JWT secrets** - At least 32 characters, random
3. **Rotate API keys regularly** - Especially in production
4. **Use HTTPS in production** - Set FRONTEND_URL to https://
5. **Enable all security features** - Keep rate limiting and sanitization enabled
6. **Use environment-specific databases** - Separate dev/staging/prod databases

## Required API Keys

### Google Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to `GEMINI_API_KEY` in your `.env`

### Stripe API
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your secret key (starts with `sk_`)
3. Add it to `STRIPE_BACKEND_SECRET` in your `.env`

## Troubleshooting

### Common Issues
- **MongoDB connection failed**: Check your `MONGO_URI` format
- **JWT errors**: Ensure `JWT_SECRET` is set and secure
- **CORS errors**: Verify `FRONTEND_URL` matches your frontend
- **Rate limiting in development**: Disable by setting `NODE_ENV=test`

### Security Features
All security middleware is automatically disabled in test environment (`NODE_ENV=test`) to allow tests to run properly.
