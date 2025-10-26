# Trail Life USA Northern Tier Website

![Trail Life Logo](images/TL_ClassicLogo_1_RGB.png)

## 🏕️ Overview

This is the official website for the Trail Life USA Northern Tier, designed to connect troops, share resources, and celebrate achievements across the Northern Tier. The site features a modern, responsive design with Progressive Web App (PWA) capabilities, allowing it to be installed as an app on any device.

## ✨ Features

### Core Pages
- **Home** - Exciting hero section with quick links to all major features
- **Regional Blog** - Latest news, updates, and stories from troops
- **Resources** - Document library, training calendar, gear swap, program ideas
- **Events** - Regional calendar and upcoming activities
- **Photo Gallery** - Troop photos and adventures (ready for uploads)
- **Troop Directory** - PA-997, PA-4031, and expandable for new troops
- **Troop Spotlight** - Monthly feature on outstanding troops
- **Leader Directory** - Regional leadership contacts
- **Achievement Board** - Celebrating troop milestones and successes
- **Contact** - Form and contact information

### Technical Features
- ✅ **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ✅ **PWA Enabled** - Installable as a web app on any device
- ✅ **Fast Loading** - Optimized performance with caching
- ✅ **Open Sans Font** - Clean, professional typography
- ✅ **Trail Life Branding** - Official colors (red, gold, white, black)
- ✅ **Smooth Animations** - Engaging user experience
- ✅ **Service Worker** - Offline functionality
- ✅ **Easy to Update** - HTML files with clear comments for editing

## 🎨 Design Colors

The site uses Trail Life USA's official brand colors:
- **Primary Red:** #C1272D
- **Gold:** #A67C52
- **Dark Red:** #8B1A1F
- **Dark Gold:** #8B6B47
- **Orange Accent:** #E87722
- **Black:** #1a1a1a
- **White:** #ffffff

## 📁 File Structure

```
traillife-northern-tier-region/
├── index.html              # Homepage
├── blog.html               # Regional blog
├── resources.html          # Resource center
├── events.html             # Events calendar
├── gallery.html            # Photo gallery
├── troops.html             # Troop directory
├── spotlight.html          # Troop spotlight
├── leaders.html            # Leader directory
├── achievements.html       # Achievement board
├── contact.html            # Contact form
├── manifest.json           # PWA manifest
├── service-worker.js       # Service worker for PWA
├── css/
│   └── style.css          # Main stylesheet
├── js/
│   └── main.js            # JavaScript functionality
└── images/
    ├── TL_ClassicLogo_1_RGB.png    # Trail Life logo (horizontal)
    ├── TL_ClassicLogo_3_RGB.png    # Trail Life logo (stacked)
    └── TL_Block_Logo-Tag_RGB.png   # Trail Life block logo
```

## 🚀 Deployment to GitHub Pages

### Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right, select "New repository"
3. Name it: `traillife-northern-tier` (or any name you prefer)
4. Make it Public
5. Do NOT initialize with README (we already have files)
6. Click "Create repository"

### Step 2: Upload Files

**Option A: Using GitHub Web Interface**
1. In your new repository, click "uploading an existing file"
2. Drag and drop ALL files and folders from this directory
3. Scroll down and click "Commit changes"

**Option B: Using Git Command Line**
```bash
# Navigate to this directory
cd /path/to/traillife-northern-tier-region

# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit - Trail Life Northern Tier website"

# Add your GitHub repository as remote (replace USERNAME and REPO)
git remote add origin https://github.com/USERNAME/traillife-northern-tier.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" (top menu)
3. Click "Pages" in the left sidebar
4. Under "Source," select "Deploy from a branch"
5. Under "Branch," select "main" and "/ (root)"
6. Click "Save"
7. Wait 2-3 minutes for deployment
8. Your site will be live at: `https://USERNAME.github.io/traillife-northern-tier/`

### Step 4: Custom Domain (Optional)

If you want a custom domain like `northern-tier.traillife.org`:
1. In GitHub Pages settings, enter your custom domain
2. In your domain registrar (where you bought the domain):
   - Create a CNAME record pointing to: `USERNAME.github.io`
   - Or create A records pointing to GitHub's IPs
3. Enable "Enforce HTTPS" in GitHub Pages settings

## 📝 How to Update Content

### Adding a Blog Post

1. Open `blog.html`
2. Find the section marked `<!-- EDITOR NOTE: Add new blog posts here -->`
3. Copy an existing `<article class="blog-card">` block
4. Update the content:
   - Date
   - Author
   - Title
   - Description
   - Tags
   - Image (add to `/images/` folder first)
5. Save and push to GitHub

### Adding Resources

1. Open `resources.html`
2. Find the Document Library section
3. Add a new `<div class="resource-item">` block
4. Update title, description, and link
5. Upload the actual resource file to your repository or link to external URL

### Adding Events

1. Open `events.html`
2. Add a new `<div class="event-card">` block
3. Update date, title, location, and description
4. Save and push

### Adding a Troop

1. Open `troops.html`
2. Copy an existing troop section
3. Update troop number, location, description, and website link
4. Save and push

### Adding Leader Information

1. Open `leaders.html`
2. Update the leader cards with actual names and contact info
3. Save and push

### Updating Photos

1. Add images to the `/images/` folder
2. Update `gallery.html` or other pages to reference new images
3. Keep images optimized (under 500KB each)

## 💡 Tips for Maintenance

1. **Keep it Updated** - Regular updates keep visitors engaged
2. **Optimize Images** - Compress photos before uploading (use tools like TinyPNG)
3. **Test on Mobile** - Always check how changes look on phones
4. **Backup Regularly** - GitHub automatically backs up, but keep local copies
5. **Get Feedback** - Ask leaders and troop members for suggestions

## 🔧 Troubleshooting

### Site Not Updating
- GitHub Pages can take 5-10 minutes to update
- Clear your browser cache (Ctrl+F5 or Cmd+Shift+R)
- Check that you pushed changes to the main branch

### Images Not Showing
- Ensure image paths are correct (case-sensitive)
- Check that images are in the `/images/` folder
- Verify image file names match exactly

### Mobile Menu Not Working
- Make sure `js/main.js` is loading
- Check browser console for JavaScript errors (F12)

### PWA Not Installing
- Site must be served over HTTPS (GitHub Pages does this automatically)
- Ensure `manifest.json` and `service-worker.js` are in the root directory
- Clear browser cache and try again

## 📱 Installing as an App

Users can install this website as an app on their devices:

**On Desktop (Chrome/Edge)**
1. Visit the website
2. Click the install icon in the address bar (computer with down arrow)
3. Click "Install"

**On iOS (Safari)**
1. Visit the website
2. Tap the Share button
3. Tap "Add to Home Screen"

**On Android (Chrome)**
1. Visit the website
2. Tap the three dots menu
3. Tap "Add to Home Screen" or "Install app"

## 🆘 Support

For technical issues or questions:
- Email: info@tlnorthern-tier.org
- Check [GitHub Issues](https://github.com/USERNAME/traillife-northern-tier/issues)
- Reference: [GitHub Pages Documentation](https://docs.github.com/en/pages)

## 📄 License

This website is created for Trail Life USA Northern Tier. Trail Life USA and all associated logos are registered trademarks of Trail Life USA.

## 🙏 Credits

Built with:
- HTML5, CSS3, JavaScript
- Open Sans Font (Google Fonts)
- Font Awesome Icons
- Love for the outdoors and developing godly men

---

**Adventure • Character • Leadership**

Trail Life USA Northern Tier
© 2025 All Rights Reserved
