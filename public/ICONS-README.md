# App Icons for PWA

## Required Icons

The manifest.json requires the following icon sizes:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192 (currently exists)
- 384x384
- 512x512

## How to Generate Icons

### Option 1: Use an Icon Generator (Recommended)
1. Go to https://realfavicongenerator.net/
2. Upload a 512x512 PNG of your app icon
3. Download the generated pack
4. Copy all icon-*.png files to the /public directory

### Option 2: Use Figma/Sketch/Photoshop
1. Create a 512x512 design with the Dan-shboard branding
2. Export at all required sizes
3. Name them icon-{size}.png (e.g., icon-72.png, icon-96.png, etc.)

### Temporary Solution
Currently using icon-192.png for all sizes. This works but isn't ideal for all resolutions.

## Design Guidelines
- Use a simple, recognizable icon (trophy, target, or checkmark)
- Charcoal gray background (#141414) to match app theme
- High contrast for visibility
- Safe area: leave 10% padding on all sides for "maskable" icons
