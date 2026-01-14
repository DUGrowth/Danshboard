# Dan-shboard 🎮

A personal productivity and gamification system designed specifically for ADHD. Built with Next.js 14, featuring an engaging, dopamine-friendly UI with animations, celebrations, and streak tracking.

## Features ✨

### MVP Features (Implemented)

- **🔥 Streak Tracking**: Daily check-in system with automatic streak calculation
- **🎯 Accomplishment Logging**: Quick and satisfying way to log your daily wins
- **💭 Daily Check-In Dialog**: Track mood and energy levels
- **🎊 Milestone Celebrations**: Confetti animations when hitting streak milestones (3, 7, 14, 30, 60, 90, 180, 365 days)
- **📊 Achievement History**: View all your past accomplishments with stats
- **⚡ Smooth Animations**: Framer Motion animations throughout for a satisfying UX
- **🎨 Beautiful UI**: Dark mode design with purple gradients and glass-morphism effects

## Tech Stack 🛠️

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (better-sqlite3)
- **Animations**: Framer Motion
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Notifications**: react-hot-toast
- **Celebrations**: canvas-confetti
- **Date Handling**: date-fns
- **Validation**: Zod

## Getting Started 🚀

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Project Structure

```
Danshboard/
├── app/
│   ├── api/              # API routes
│   │   ├── streaks/      # Streak management
│   │   ├── accomplishments/ # Accomplishment logging
│   │   └── checkin/      # Daily check-ins
│   ├── achievements/     # Achievements page
│   ├── layout.tsx        # Root layout with navigation
│   ├── page.tsx          # Dashboard home page
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── NavBar.tsx        # Navigation bar
│   ├── StreakCard.tsx    # Streak display & check-in
│   ├── AccomplishmentForm.tsx # Quick log form
│   ├── AccomplishmentList.tsx # Today's wins
│   └── DailyCheckInDialog.tsx # Mood/energy tracker
├── lib/
│   ├── db.ts             # SQLite database setup
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Utility functions
└── data/
    └── danshboard.db     # SQLite database (auto-created)
```

## Database Schema 📊

### Tables

- **streaks**: Track daily check-in streaks
- **accomplishments**: Log completed tasks and wins
- **daily_checkins**: Store daily mood and energy data
- **milestones**: Record streak milestone achievements

## Key Interactions 🎯

1. **Daily Check-In**: Opens automatically if you haven't checked in today
2. **Streak Update**: Click "Check In" to increment your streak (once per day)
3. **Log Accomplishment**: Quick form to capture wins throughout the day
4. **Milestone Celebrations**: Automatic confetti when hitting streak milestones

## Design Principles 🎨

- **Dopamine-Friendly**: Every interaction feels rewarding
- **Visual Feedback**: Numbers animate, buttons respond to clicks
- **Immediate Gratification**: Instant feedback on all actions
- **Low Friction**: Quick logging, no complex forms
- **Celebration-Focused**: Regular positive reinforcement

## Future Enhancements 🔮

Potential features to add:

- Multiple custom streaks
- Categories for accomplishments
- Weekly/monthly reports
- Habit tracking
- Pomodoro timer integration
- Rewards system
- Social accountability features
- Data export
- Mobile app (React Native)

## Development 💻

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## License

MIT

---

Built with 💜 for ADHD productivity
