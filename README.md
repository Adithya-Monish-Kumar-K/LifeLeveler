# LifeLeveler

Transform your daily life into an RPG adventure! Level up, complete quests, and unlock achievements in the real world.

## Features

- **Quest System**: Create daily, weekly, and challenge quests
- **Leveling System**: Gain experience and level up your character
- **Custom Skill Trees**: Build your own skill chains and unlock abilities
- **Achievement System**: Create achievement chains with different tiers
- **Title System**: Earn and display prestigious titles
- **Mobile App**: Native iOS and Android apps via Capacitor
- **Responsive Design**: Works perfectly on all devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Mobile**: Capacitor for native iOS/Android apps
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Icons**: Lucide React

## Getting Started

### Web Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Start development server:
```bash
npm run dev
```

### Mobile Development

1. Build the web app:
```bash
npm run build
```

2. Initialize Capacitor platforms:
```bash
# Add iOS platform
npx cap add ios

# Add Android platform  
npx cap add android
```

3. Sync web assets to native platforms:
```bash
npm run build:mobile
```

4. Open in native IDEs:
```bash
# Open iOS in Xcode
npx cap open ios

# Open Android in Android Studio
npx cap open android
```

### Mobile Development Requirements

**For iOS:**
- macOS with Xcode installed
- iOS Simulator or physical iOS device
- Apple Developer account (for device testing/App Store)

**For Android:**
- Android Studio installed
- Android SDK and emulator set up
- Physical Android device (optional)

## Mobile Features

- **Native Navigation**: Bottom tab navigation optimized for mobile
- **Haptic Feedback**: Tactile feedback on button presses
- **Status Bar**: Customized status bar styling
- **Keyboard Handling**: Automatic UI adjustments for keyboard
- **Touch Optimized**: Larger touch targets and mobile-friendly interactions
- **Offline Support**: Core functionality works offline
- **Push Notifications**: Ready for quest reminders (future feature)

## Database Schema

The app uses Supabase with the following main tables:
- `user_profiles`: User data, stats, and progression
- `quests`: User-created quests with rewards
- `skill_chains` & `skills`: Custom skill trees
- `achievement_chains` & `achievements`: Achievement systems
- `title_chains` & `titles`: Title progression
- `quest_rewards`: Links quests to unlockable rewards

## Deployment

### Web Deployment
The web app is deployed to Netlify at: https://lifeleveler.netlify.app

### Mobile App Deployment

**iOS App Store:**
1. Build in Xcode with release configuration
2. Archive and upload to App Store Connect
3. Submit for review

**Google Play Store:**
1. Build signed APK/AAB in Android Studio
2. Upload to Google Play Console
3. Submit for review

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both web and mobile
5. Submit a pull request

## License

MIT License - see LICENSE file for details