# Fix Build and Permission Issues

## Issue 1: Token Persistence ✅

**Good news**: Your authentication code is already correctly configured to persist tokens! 

The token is stored in `localStorage` and should persist across page refreshes. If you're still being logged out, check:
1. Browser DevTools → Application → Local Storage → Look for `adminToken` key
2. Check browser console for any errors
3. Make sure you're not in private/incognito mode

## Issue 2: Build Errors

### Problem A: Permission Denied (EACCES)

Your `node_modules` directory is owned by root. Fix it:

```bash
# Fix ownership
sudo chown -R $(whoami) node_modules

# Clear Vite cache
rm -rf node_modules/.vite

# Reinstall if needed
rm -rf node_modules package-lock.json
npm install
```

### Problem B: Tailwind CSS v4 Configuration

You have Tailwind CSS v4.1.17 installed but configuration is for v3.

**Option 1: Use Tailwind v3 (Recommended)**

After fixing permissions, run:
```bash
npm uninstall tailwindcss
npm install -D tailwindcss@^3.4.1
```

**Option 2: Use Tailwind v4**

After fixing permissions, run:
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

And update `src/index.css` for v4 syntax (remove `@tailwind` directives, use CSS imports).

## Quick Fix Steps

1. Fix permissions:
   ```bash
   sudo chown -R $(whoami) node_modules
   rm -rf node_modules/.vite
   ```

2. Choose Tailwind version and reinstall:
   ```bash
   # For v3 (simpler):
   npm uninstall tailwindcss
   npm install -D tailwindcss@^3.4.1
   
   # OR for v4:
   npm install -D @tailwindcss/postcss@^4.1.0
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```


