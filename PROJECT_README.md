# 🎮 Mini Games Platform

A TikTok-style mobile games platform with a vertical swipeable feed and web-based admin panel for managing HTML5 games.

## 🌟 Features

### Mobile App (React Native + Expo)

- **Vertical Game Feed**: TikTok-style swipeable interface to discover games
- **Instant Play**: Tap to play HTML5 games in fullscreen WebView
- **Favorites System**: Save favorite games with persistent storage
- **Categories**: Browse games by Puzzle, Arcade, Action, Casual, Strategy
- **Smooth Animations**: 60fps animations with react-native-reanimated
- **Tab Navigation**: Home, Explore, Favorites, Profile sections
- **Game Statistics**: Track plays, ratings, and favorites
- **Dark Theme**: Beautiful dark UI with purple-cyan gradients

### Admin Panel (Web)

- **Dashboard**: View game statistics and recent activity
- **Game Management**: Create, edit, delete, and preview games
- **Category Management**: Organize games into categories
- **Draft/Published System**: Control game visibility
- **Featured Games**: Highlight special games
- **Authentication**: Secure admin access with Supabase Auth
- **Responsive Design**: Works on desktop and tablet

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Expo CLI (installed automatically)

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd project
   npm install
   ```

2. **Start the mobile app**:
   ```bash
   npm run dev
   ```
   Then scan the QR code with Expo Go app on your phone, or press `w` to open in web browser.

3. **Set up admin panel**:
   - Open `admin/setup.html` in your browser
   - Create your admin account
   - Access the admin panel at `admin/index.html`

## 📱 Mobile App Usage

### Home Feed
- Swipe up/down to browse games
- Tap a game card to play
- Double-tap the heart icon to favorite
- View game ratings and play counts

### Explore
- Browse games by category
- Tap a category to see filtered games
- Return to all categories with back button

### Favorites
- View all your saved games
- Grid layout for easy browsing
- Tap to play your favorites

### Game Player
- Fullscreen game experience
- Back button to return to feed
- Menu for sharing and favoriting
- Automatic play count tracking

## 🛠️ Admin Panel Usage

### Initial Setup

1. Navigate to `admin/setup.html`
2. Enter your email and password
3. Click "Create Admin Account"
4. Go to `admin/index.html` and login

### Managing Games

#### Adding a Game

1. Go to **Games** tab
2. Click **➕ Add Game**
3. Fill in the form:
   - **Title**: Name of the game
   - **Description**: Brief description
   - **Category**: Select from dropdown
   - **Thumbnail URL**: Image URL (use Pexels or your CDN)
   - **Game URL**: Where the HTML5 game is hosted
   - **Rating**: 0-5 stars
   - **Status**: Draft (hidden) or Published (visible)
   - **Featured**: Toggle to highlight
4. Click **Save Game**

#### Editing a Game

1. Click ✏️ icon on any game
2. Modify the details
3. Click **Save Game**

#### Previewing a Game

1. Click 👁️ icon to test the game
2. Game loads in an iframe
3. Close when done

#### Deleting a Game

1. Click 🗑️ icon
2. Confirm deletion

### Managing Categories

1. Go to **Categories** tab
2. Click **➕ Add Category**
3. Enter:
   - **Name**: Category name
   - **Icon**: Emoji (e.g., 🎮, 🧩, ⚔️)
   - **Order**: Numeric sorting order
4. Click **Save Category**

### Hosting HTML5 Games

You have several options:

**Option 1: External Platforms**
- Use games from CrazyGames, Poki, Miniclip, etc.
- Copy the game URL and paste in admin panel

**Option 2: Your Own CDN**
- Upload game files to a web server
- Enter the full URL to index.html

**Option 3: Supabase Storage (Coming Soon)**
- Direct upload of ZIP files through admin panel
- Automatic extraction and hosting

## 🏗️ Project Structure

```
project/
├── admin/                    # Web admin panel
│   ├── index.html           # Main admin interface
│   ├── app.js              # Admin panel logic
│   ├── setup.html          # Initial admin setup
│   └── README.md           # Admin documentation
├── app/                     # Mobile app routes
│   ├── (tabs)/             # Tab navigation
│   │   ├── index.tsx       # Home feed
│   │   ├── explore.tsx     # Categories
│   │   ├── favorites.tsx   # Saved games
│   │   └── profile.tsx     # User profile
│   ├── game/[id].tsx       # Game player
│   └── _layout.tsx         # Root layout
├── components/              # Reusable components
│   └── GameCard.tsx        # Game card component
├── store/                   # State management
│   └── gameStore.ts        # Zustand store
├── lib/                     # Utilities
│   └── supabase.ts         # Supabase client
├── types/                   # TypeScript types
│   └── index.ts            # Type definitions
└── assets/                  # Images and fonts
```

## 🗄️ Database Schema

### Tables

**games**
- id, title, description, category_id
- thumbnail_url, game_url, file_path
- play_count, rating
- status (draft/published/archived)
- is_featured
- created_at, updated_at

**categories**
- id, name, icon, order
- created_at

**favorites**
- id, user_id, game_id
- created_at

**admin_users** (future)
- id, email, password_hash, role
- created_at, last_login

**game_files** (future)
- id, game_id, file_path
- file_size, file_type
- created_at

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Published games are public
- Draft games only visible to admins
- Admin authentication via Supabase Auth
- Favorites stored locally with AsyncStorage

## 🎨 Design System

### Colors
- Background: #0F172A (dark navy)
- Cards: #1E293B (dark gray)
- Primary: #8B5CF6 (purple)
- Accent: #06B6D4 (cyan)
- Text: #E2E8F0 (light gray)

### Typography
- Font: System default (SF Pro on iOS, Roboto on Android)
- Headings: 800 weight
- Body: 600 weight

### Animations
- Spring physics for natural movement
- 60fps smooth scrolling
- Heart pop on favorite
- Card press feedback

## 📦 Tech Stack

### Mobile App
- React Native 0.81
- Expo SDK 54
- Expo Router (file-based routing)
- React Native Reanimated (animations)
- Zustand (state management)
- Supabase JS Client
- Lucide React Native (icons)
- WebView (game player)

### Admin Panel
- Pure JavaScript (ES6 modules)
- Supabase JS Client
- No build process required
- Modern CSS with gradients

### Backend
- Supabase (PostgreSQL database)
- Supabase Auth (authentication)
- Supabase Storage (file hosting - coming soon)
- Row Level Security (RLS)

## 🚢 Deployment

### Mobile App

**Web Version**:
```bash
npm run build:web
```
Deploy the `dist/` folder to any static host (Vercel, Netlify, etc.)

**Native Apps**:
Use Expo EAS Build for iOS and Android:
```bash
npx eas build --platform ios
npx eas build --platform android
```

### Admin Panel

Simply upload the `admin/` folder to your web server or static hosting:
- Vercel: Drag and drop the folder
- Netlify: Deploy from git repository
- Any web host: Upload via FTP

## 🔧 Configuration

### Environment Variables

Located in `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Supabase Setup

1. Create a Supabase project
2. Database tables are automatically created via migrations
3. Update `.env` with your credentials
4. Admin panel uses the same credentials (hardcoded in app.js)

## 📝 Development

### Run Type Checking
```bash
npm run typecheck
```

### Build for Web
```bash
npm run build:web
```

### Lint Code
```bash
npm run lint
```

## 🐛 Troubleshooting

### Mobile App Issues

**Games not loading**:
- Check internet connection
- Verify game URLs are accessible
- Check Supabase credentials in `.env`

**Images not showing**:
- Ensure thumbnail URLs are publicly accessible
- Check image URLs are valid

### Admin Panel Issues

**Cannot login**:
- Create an account via `setup.html` first
- Check Supabase credentials in `app.js`
- Clear browser cache and try again

**Games not appearing in mobile app**:
- Ensure games are set to "Published" status
- Check RLS policies in Supabase

## 🎯 Roadmap

- [ ] File upload directly to Supabase Storage
- [ ] ZIP file extraction for HTML5 games
- [ ] User accounts and authentication
- [ ] Game ratings by users
- [ ] Comments and social features
- [ ] Search functionality
- [ ] Game recommendations
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Push notifications

## 📄 License

This project is for educational and demonstration purposes.

## 🤝 Support

For issues or questions:
1. Check the admin panel README at `admin/README.md`
2. Review the database migrations in `supabase/migrations/`
3. Check Expo documentation at https://docs.expo.dev

---

Built with ❤️ using React Native, Expo, and Supabase
