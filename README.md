# Endometriosis Symptom Tracker - Phase 1

A web-based calendar interface for tracking daily endometriosis symptoms over a 15-20 day period.

## Features

- **User Authentication**: Email/password and Google OAuth via Firebase Auth
- **Calendar Interface**: Interactive calendar for daily symptom logging
- **Comprehensive Symptom Tracking**: Based on ML model parameters including:
  - Menstrual symptoms (irregular periods, clots, long menstruation)
  - Pain symptoms (cramping, chronic pain, leg/hip pain)
  - Digestive issues (diarrhea, bloating, GI problems)
  - General health (migraines, depression, insomnia)
  - Reproductive health (fertility issues, ovarian cysts)
- **Progress Tracking**: Visual progress bar showing completion status
- **Data Security**: Firestore with user-specific access rules

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Calendar**: FullCalendar
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Build Tool**: Vite

## Setup Instructions

### 1. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Email/Password and Google providers
3. Create a Firestore database
4. Copy your Firebase config and update `src/firebase/config.ts`

### 2. Firestore Security Rules

Deploy the security rules from `firestore.rules` to ensure user data privacy:

```bash
firebase deploy --only firestore:rules
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── AuthPage.tsx          # Login/signup page
│   ├── Dashboard.tsx         # Main dashboard
│   ├── Calendar.tsx          # Calendar component
│   ├── SymptomModal.tsx      # Symptom entry form
│   ├── ToggleSwitch.tsx      # Custom toggle component
│   ├── ProgressBar.tsx       # Progress visualization
│   └── LoadingSpinner.tsx    # Loading component
├── firebase/
│   ├── config.ts             # Firebase configuration
│   └── firestore.ts          # Database operations
├── types/
│   └── index.ts              # TypeScript interfaces
└── App.tsx                   # Main app component
```

## Data Schema

### Symptom Entry
```typescript
interface SymptomEntry {
  // 27 symptom parameters based on ML model
  irregularPeriods: boolean;
  cramping: boolean;
  menstrualClots: boolean;
  // ... (all ML model parameters)
  notes?: string;
  date: string;
  timestamp: number;
}
```

### Firestore Structure
```
/users/{uid}/logs/{YYYY-MM-DD}
  → SymptomEntry object

/users/{uid}/metadata/progress
  → UserProgress object
```

## Key Features

### 1. Smart Calendar
- Prevents future date entries
- Visual indicators for completed days
- Click-to-log interface

### 2. Comprehensive Symptom Form
- Organized by symptom categories
- Toggle switches for easy input
- Optional notes field
- Form validation

### 3. Progress Tracking
- Visual progress bar
- Completion percentage
- Days remaining counter

### 4. Data Security
- User-specific data access
- Firebase security rules
- Secure authentication

## ML Model Integration

The symptom parameters are directly mapped from your ML model:
- All 27 feature columns from `predict_user_input.py`
- Boolean values (0/1) for easy ML processing
- Export function for prediction data

## Next Steps (Phase 2)

- ML prediction integration
- Data visualization
- Export functionality
- Reminder notifications
- Advanced analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details