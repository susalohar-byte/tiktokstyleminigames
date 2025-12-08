# Mini Games Admin Panel

A web-based admin panel for managing HTML5 games in the Mini Games mobile app platform.

## Features

- 🔐 Secure authentication with Supabase Auth
- 🎮 Game management (Create, Read, Update, Delete)
- 📁 Category management
- 📊 Dashboard with statistics
- 👁️ Game preview functionality
- 🎯 Featured games support
- 📝 Draft and published status
- ⭐ Rating management

## Getting Started

### 1. Initial Setup

Before using the admin panel, you need to create your first admin account:

1. Open `admin/setup.html` in your browser
2. Enter your admin email and password
3. Click "Create Admin Account"
4. You'll be redirected to the login page

### 2. Accessing the Admin Panel

After setup, access the admin panel at `admin/index.html`:

1. Enter your admin credentials
2. You'll see the dashboard with game statistics

## Using the Admin Panel

### Dashboard

The dashboard shows:
- Total number of games
- Published games count
- Draft games count
- Total plays across all games
- Recent games list

### Managing Games

#### Adding a New Game

1. Go to the "Games" tab
2. Click "➕ Add Game"
3. Fill in the game details:
   - **Title**: Game name
   - **Description**: Brief description
   - **Category**: Select from existing categories
   - **Thumbnail URL**: Direct URL to game thumbnail image (use Pexels or your CDN)
   - **Game URL**: URL where the HTML5 game is hosted
   - **Rating**: 0-5 star rating
   - **Status**: Draft, Published, or Archived
   - **Featured**: Toggle to make the game featured
4. Click "Save Game"

#### Editing a Game

1. Go to the "Games" tab
2. Click the ✏️ (edit) button on any game
3. Modify the details
4. Click "Save Game"

#### Previewing a Game

1. Click the 👁️ (preview) button on any game
2. The game will load in an iframe for testing
3. Close the preview when done

#### Deleting a Game

1. Click the 🗑️ (delete) button on any game
2. Confirm the deletion
3. The game will be permanently removed

### Managing Categories

#### Adding a Category

1. Go to the "Categories" tab
2. Click "➕ Add Category"
3. Fill in:
   - **Name**: Category name (e.g., "Puzzle")
   - **Icon**: Emoji icon (e.g., "🧩")
   - **Order**: Numeric order for sorting
4. Click "Save Category"

#### Editing a Category

1. Click the ✏️ button on any category
2. Modify the details
3. Click "Save Category"

#### Deleting a Category

Note: You cannot delete a category that has games assigned to it. Reassign or delete the games first.

## Hosting HTML5 Games

Currently, the admin panel requires you to host HTML5 games externally and provide the URL. Here are some options:

### ⚠️ Important: Game Embedding Restrictions

**Most external websites block embedding in mobile apps** for security reasons using `X-Frame-Options` or `Content-Security-Policy` headers. This means:

- Games from platforms like CrazyGames, Poki, Miniclip typically **WON'T work** in the mobile app
- These sites can be previewed in the admin panel but will fail to load in the app
- Users will see a timeout message with an "Open in Browser" button as a fallback

**✅ What Works:**
- Games you host yourself on your own domain/server
- HTML5 games from platforms that explicitly allow iframe embedding
- Games hosted on Supabase Storage (when implemented)
- Open-source HTML5 games from GitHub Pages (if embedding is allowed)

**Recommended Approach:**
1. Download free HTML5 games from sites like:
   - itch.io (many games allow downloads)
   - GitHub (open-source HTML5 games)
   - Free game assets websites
2. Host them on your own server or CDN
3. Use those URLs in your game library

### Option 1: Host on Your Own CDN (Recommended)

1. Upload your HTML5 game files to a web server or CDN
2. Ensure the game's `index.html` is accessible via a public URL
3. Make sure your server allows CORS and doesn't set restrictive frame options
4. Enter the full URL in the "Game URL" field

### Option 2: Use Embed-Friendly Platforms

Some platforms explicitly allow embedding:
- itch.io embed URLs (check game permissions)
- Some HTML5 game CDNs that support embedding
- Your own GitHub Pages (if you host the games there)

### Option 3: Supabase Storage (Coming Soon)

File upload to Supabase Storage will be added in a future update, allowing you to upload game ZIP files directly through the admin panel. This will be the best solution as all games will be hosted on your own infrastructure.

## Game Status Types

- **Draft**: Game is hidden from users, used for testing
- **Published**: Game is visible to all users in the mobile app
- **Archived**: Game is hidden but kept in the database

## Featured Games

Mark games as "Featured" to highlight them in the mobile app. Featured games may appear in special sections or promotions.

## Security Notes

- Admin authentication uses Supabase Auth
- All admin operations are protected by Row Level Security (RLS)
- Only authenticated users can manage games and categories
- Public users can only view published games

## Technical Details

### Stack

- Pure JavaScript (ES6 Modules)
- Supabase for backend (database + auth)
- No build process required
- Works in modern browsers

### Database Tables

- `admin_users`: Admin account information
- `games`: Game data and metadata
- `categories`: Game categories
- `game_files`: File metadata (for future use)
- `admin_logs`: Audit trail of admin actions

### File Structure

```
admin/
├── index.html      # Main admin panel
├── app.js          # Admin panel JavaScript
├── setup.html      # Initial admin account creation
└── README.md       # This file
```

## Troubleshooting

### "Cannot log in"

- Make sure you've created an admin account via `setup.html` first
- Check that your email and password are correct
- Ensure Supabase is properly configured

### "Games not loading"

- Check browser console for errors
- Verify Supabase credentials are correct
- Ensure RLS policies are properly set up

### "Cannot delete category"

- Categories with games cannot be deleted
- Reassign games to another category first
- Or delete the games, then delete the category

## Future Enhancements

Planned features:
- [ ] Direct file upload to Supabase Storage
- [ ] ZIP file extraction for HTML5 games
- [ ] Bulk game import from CSV
- [ ] Game analytics and charts
- [ ] User management
- [ ] Role-based permissions
- [ ] Thumbnail generation
- [ ] Game version control

## Support

For issues or questions, check the main project README or contact the development team.
