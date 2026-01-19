# How to Install Dan-shboard on Your iPhone

Dan-shboard is a **Progressive Web App (PWA)**, which means you can install it on your iPhone and use it just like a native app - with notifications, offline support, and no browser chrome!

## Prerequisites

- **iOS 16.4 or later** (required for push notifications)
- **Safari browser** (Safari has the best PWA support on iOS)
- Dan-shboard deployed to your Vercel domain

## Installation Steps

### 1. Deploy to Vercel

First, make sure Dan-shboard is deployed to Vercel:

```bash
git push origin claude/setup-danshboard-nextjs-BsbtQ
```

Then deploy via Vercel dashboard or wait for automatic deployment.

### 2. Open in Safari on iPhone

1. Open **Safari** on your iPhone
2. Navigate to your Dan-shboard URL (e.g., `https://your-app.vercel.app`)
3. Wait for the page to fully load

### 3. Add to Home Screen

#### Method 1: Share Button
1. Tap the **Share button** (square with arrow pointing up) at the bottom of Safari
2. Scroll down and tap **"Add to Home Screen"**
3. You'll see the app icon and name "Dan-shboard"
4. Tap **"Add"** in the top right corner

#### Method 2: Long Press (iOS 17+)
1. Long press on an empty area of your home screen
2. Tap **"+"** in the top left
3. Search for the website or paste the URL
4. Tap **"Add to Home Screen"**

### 4. Enable Notifications

After installing:

1. Open **Dan-shboard** from your home screen (tap the icon)
2. You'll see a notification permission prompt after 5 seconds
3. Tap **"Enable"** or **"Allow"** when prompted
4. Grant notification permissions in the iOS dialog

### 5. Configure Notifications

1. Tap **Settings** in the app navigation
2. Toggle notification types on/off
3. Customize times and intervals
4. All changes save automatically

## Features When Installed

✅ **Home Screen Icon** - Launch like a native app
✅ **Full Screen** - No browser bars or address bar
✅ **Push Notifications** - All 20+ notification types work
✅ **Offline Support** - Basic functionality works without internet
✅ **Background Updates** - Service worker keeps data synced
✅ **App Shortcuts** - Long press icon for quick access to Routines/Tasks/Settings

## Notification Types Available

Once installed, you can enable:

### Routines (4)
- Stop Working (9pm)
- No Screens (9:45pm)
- Lights Out (10pm)
- Wake Up (5:30am/6am)

### Health (6)
- Water Reminder (every 90 min)
- Microbreak Reminder (every 2 hours)
- Movement Break (every 2 hours)
- Meal Reminders (12pm, 6pm)
- Medication Reminder (custom time)
- Energy Check (2pm, 7pm)

### Focus (2)
- Hyperfocus Check-in (every 90 min)
- Task Timer Warning (5 min before end)

### And more... (20+ total notification types)

## Troubleshooting

### Notifications Not Working?

1. **Check iOS Settings**
   - Settings → Dan-shboard → Notifications → **Allow Notifications** = ON
   - Settings → Safari → Advanced → Website Data → Check if Dan-shboard is listed

2. **Check Browser Permissions**
   - In the app, go to Settings → Notification Center
   - Check if notifications show as "Enabled"
   - Try toggling off and on again

3. **Reinstall the App**
   - Delete from home screen
   - Clear Safari cache: Settings → Safari → Clear History and Website Data
   - Reinstall following steps above

### App Not Installing?

1. **Make sure you're using Safari** (not Chrome/Firefox)
2. **Check iOS version** (Settings → General → About → iOS Version)
   - Must be iOS 16.4+ for notifications
   - iOS 15+ for basic PWA features
3. **Clear Safari cache** and try again

### Offline Support Issues?

1. Open the app while online first (caches app shell)
2. Service worker needs to install (wait 30 seconds)
3. Check Developer Console in Safari for service worker errors

## Updating the App

When Dan-shboard is updated:

1. Open the app on your iPhone
2. Pull down to refresh (or close and reopen)
3. The service worker will update automatically
4. You may see a brief loading screen

## Uninstalling

To remove Dan-shboard:

1. Long press the app icon on your home screen
2. Tap **"Remove App"**
3. Tap **"Delete App"**
4. This also removes all notification permissions

To fully clear data:

1. Settings → Safari → Advanced → Website Data
2. Search for your Dan-shboard domain
3. Swipe left and tap **Delete**

## Best Practices

- **Keep iOS Updated** - Latest iOS has best PWA support
- **Use Safari** - Other browsers don't support PWA features well on iOS
- **Enable Background App Refresh** - Settings → General → Background App Refresh → Safari
- **Check Notification Settings** - Settings → Dan-shboard → Notifications

## Alternative: Native App Wrapper (Future)

If you want a true native app in the App Store, you could:

1. Use **Capacitor** to wrap the Next.js app
2. Build and submit to App Store
3. Get native iOS features like widgets, Siri shortcuts, etc.

But the PWA approach works great for personal use and is much simpler!

## Support

If you have issues, check:
- Safari Web Inspector (Settings → Safari → Advanced → Web Inspector)
- Browser console for errors
- Service worker registration status

---

**Note:** PWA support on iOS is constantly improving. Some features may require the latest iOS version.
