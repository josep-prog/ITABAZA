# ITABAZA - Healthcare Platform

A modern healthcare platform built with React, TypeScript, and Supabase for authentication.

## Features

- 🔐 **User Authentication** - Sign up, login, and logout with Supabase
- 👨‍⚕️ **Doctor Discovery** - Browse and search for healthcare professionals
- 📅 **Appointment Booking** - Book video calls or in-person appointments
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎨 **Modern UI** - Clean and professional design with Tailwind CSS

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your project URL and anon key from the project settings
3. Update the `.env` file with your credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Configure Supabase Authentication

1. In your Supabase dashboard, go to **Authentication > Settings**
2. Enable **Email confirmations** (optional but recommended)
3. Configure your email templates if needed

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # React components
│   ├── AuthPage.tsx    # Login/Signup forms
│   ├── Header.tsx      # Navigation header
│   ├── HeroSection.tsx # Landing page hero
│   ├── StatsSection.tsx # Statistics display
│   ├── DoctorsPage.tsx # Doctor listing
│   └── AppointmentPage.tsx # Booking system
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── lib/               # Utility functions
│   ├── supabase.ts    # Supabase client
│   └── auth.ts        # Authentication functions
└── App.tsx           # Main app component
```

## Authentication Flow

1. **Sign Up**: Users can create accounts with email and password
2. **Email Verification**: Supabase sends verification emails (if enabled)
3. **Sign In**: Users can log in with their credentials
4. **Session Management**: Authentication state is managed globally
5. **Sign Out**: Users can log out and return to guest state

## Key Files Explained

### `src/lib/supabase.ts`
- Simple Supabase client configuration
- Uses environment variables for security

### `src/lib/auth.ts`
- Clean authentication functions (signUp, signIn, signOut, getCurrentUser)
- Error handling with try-catch blocks
- Returns consistent response format

### `src/contexts/AuthContext.tsx`
- React context for global authentication state
- Provides user data and logout function
- Handles session persistence

### `src/components/AuthPage.tsx`
- Complete login/signup forms
- Form validation and error handling
- Loading states and success messages
- Password visibility toggle

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Supabase** - Backend and authentication
- **Lucide React** - Icons

## Security Notes

- Environment variables are prefixed with `VITE_` for client-side access
- Supabase handles password hashing and security
- Authentication tokens are managed securely by Supabase
- No sensitive data is stored in localStorage

## Next Steps

1. Add more user profile features
2. Implement appointment management
3. Add payment processing
4. Create admin dashboard
5. Add real-time notifications 