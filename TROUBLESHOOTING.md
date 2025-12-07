# Troubleshooting Guide

## Issues and Solutions

### 1. Permission Denied Errors (EACCES)

**Problem**: `node_modules` directory is owned by root, causing permission errors.

**Solution**: Run these commands in your terminal:

```bash
# Fix ownership of node_modules
sudo chown -R $(whoami) node_modules

# Clear Vite cache
rm -rf node_modules/.vite

# If issues persist, reinstall:
rm -rf node_modules package-lock.json
npm install
```

### 2. Tailwind CSS v4 Configuration Error

**Problem**: Tailwind CSS v4.1.17 requires `@tailwindcss/postcss` package.

**Solution Options**:

**Option A: Use Tailwind v3 (Recommended - More Stable)**
```bash
npm uninstall tailwindcss
npm install -D tailwindcss@^3.4.1
```

**Option B: Install Tailwind v4 PostCSS Plugin**
```bash
npm install -D @tailwindcss/postcss@^4.1.0
```

Then update `postcss.config.js`:
```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

### 3. Authentication Token Not Persisting

The token IS being stored in localStorage. If you're still being logged out on refresh:

1. **Check Browser Console**: Look for errors during initialization
2. **Check localStorage**: Open DevTools → Application → Local Storage
   - Key: `adminToken` should exist
   - Key: `adminUser` should exist
3. **Check API Response**: Verify your backend returns `{ token, admin }` structure
4. **Private/Incognito Mode**: localStorage might be blocked

The current code handles multiple response structures and validates token storage.


