# AnatomiX - Medical Terminology Learning Platform

**AnatomiX** is a comprehensive medical terminology study platform built with React, Firebase, and Tailwind CSS. It features accurate anatomical terminology based on "The Language of Medicine" by Davi-Ellen Chabner, with interactive quizzes, games, and progress tracking.

## Features

✅ **Accurate Medical Terminology** - All terms and definitions from Chabner's "The Language of Medicine"
✅ **Interactive Quizzes** - Multiple choice and fill-in-the-blank modes with flexible answer validation
✅ **Educational Games** - Hangman, Memory, Crossword, Word Search, Trivia, and more
✅ **Progress Tracking** - Firebase-powered user accounts with quiz score history
✅ **Muted Pastel Design** - Eye-friendly color scheme that's easy on the eyes
✅ **Flexible Answer Validation** - Accepts "a", "A", "an", "An" variations automatically
✅ **12+ Body Systems** - Prefixes, Suffixes, Cardiovascular, Respiratory, Digestive, Urinary, Musculoskeletal, Nervous, Endocrine, Integumentary, Immune, and more

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4
- **Backend**: Firebase (Authentication + Firestore)
- **Routing**: Wouter
- **UI Components**: shadcn/ui with Radix UI
- **Hosting**: Netlify (free tier)

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and pnpm
- Firebase project (free tier available at https://firebase.google.com)

### 2. Clone and Install

```bash
cd anatomix
pnpm install
```

### 3. Configure Firebase

1. Create a Firebase project at https://firebase.google.com
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Copy your project credentials
5. Create `.env.local` file:

```bash
cp .env.example .env.local
```

6. Update `.env.local` with your Firebase credentials:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run Locally

```bash
pnpm dev
```

Visit http://localhost:5173

## Deployment to Netlify

### Option 1: Direct Netlify Deployment

1. Push code to GitHub
2. Go to https://app.netlify.com
3. Click "New site from Git"
4. Select your repository
5. Build command: `pnpm build`
6. Publish directory: `dist`
7. Add environment variables in Netlify settings
8. Deploy!

### Option 2: CLI Deployment

```bash
npm install -g netlify-cli
pnpm build
netlify deploy --prod
```

## Medical Terminology Accuracy

All medical terms and definitions are based on **"The Language of Medicine" by Davi-Ellen Chabner**, ensuring:

- ✅ Accurate anatomical terminology
- ✅ Proper medical definitions
- ✅ Correct prefixes, suffixes, and roots
- ✅ Organized by body system
- ✅ Phonetic pronunciations included

### Key Corrections Made

- **Pharynx (Throat)** - Now correctly included in Digestive System (while also in Respiratory)
- **Accurate Organ Names** - Trachea (not "Windpipe"), Larynx (not "Voice Box")
- **Complete Systems** - All organs and structures properly categorized
- **Scientific Names** - Latin terminology included for medical accuracy

## Answer Validation

The quiz system now accepts flexible variations:

- **"a" or "A"** - Both accepted for "a-" prefix
- **"an" or "An"** - Both accepted for "an-" prefix
- **Case-insensitive** - "TERM", "term", "Term" all accepted
- **Whitespace trimmed** - Leading/trailing spaces ignored
- **Hyphen flexible** - "a-" and "a" both accepted

## Quiz Features

### Multiple Choice Mode
- 4 options per question
- Immediate feedback
- Visual indicators (green for correct, red for incorrect)

### Fill-in-the-Blank Mode
- Type the medical term
- Flexible answer matching
- Detailed feedback with correct answer

### Progress Tracking
- Individual user accounts
- Quiz score history
- Category-based statistics
- Performance analytics

## File Structure

```
anatomix/
├── client/
│   ├── src/
│   │   ├── pages/          # Page components (Quizzes, Games, etc.)
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # Firebase & Theme contexts
│   │   ├── hooks/          # Custom hooks (useProgress, useTerms)
│   │   ├── lib/            # Utilities (answerUtils, medicalDatabase)
│   │   ├── App.tsx         # Main app with routing
│   │   └── index.css       # Muted pastel color scheme
│   ├── index.html
│   └── public/
├── server/                 # Express server for production
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Customization

### Adding New Terms

Edit `/client/src/lib/medicalDatabase.ts`:

```typescript
{ 
  id: "unique-id", 
  term: "your-term", 
  type: "prefix|suffix|root|term",
  meaning: "definition",
  phonetic: "pronunciation",
  example: "example-usage",
  mnemonic: "memory-aid",
  category: "Body System",
  source: "Language of Medicine",
  createdAt: Date.now()
}
```

### Changing Colors

Edit `/client/src/index.css` to modify the muted pastel palette:

```css
:root {
  --primary: oklch(0.65 0.12 260);
  --background: oklch(0.97 0.01 240);
  /* ... more colors ... */
}
```

## Troubleshooting

### Firebase Not Connecting
- Verify `.env.local` has correct credentials
- Check Firebase project has Firestore database created
- Ensure Authentication is enabled

### Quiz Answers Not Validating
- Check `answerUtils.ts` for validation logic
- Ensure term spelling matches database exactly
- Test with simple terms first

### Deployment Issues
- Verify `dist` folder is created: `pnpm build`
- Check Netlify build logs for errors
- Ensure environment variables are set in Netlify

## Performance Tips

- Quiz system uses memoization to prevent unnecessary re-renders
- Firebase queries are optimized with proper indexing
- CSS uses OKLCH color space for better color accuracy
- Lazy loading for game components

## Future Enhancements

- [ ] Spaced repetition algorithm
- [ ] Custom study decks
- [ ] Anatomy diagrams with interactive labels
- [ ] Pronunciation audio
- [ ] Study groups/collaboration
- [ ] Mobile app version
- [ ] Offline mode

## License

MIT

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Firebase documentation
3. Verify medical terminology accuracy against Chabner's textbook

---

**Built with ❤️ for medical students everywhere**
