# HealthVault - Digital Health Wallet

A modern, secure digital health wallet application built with React, TypeScript, and Supabase. Manage, track, and securely share your medical records with healthcare providers.

live : https://digital-health-walle-8pcd.bolt.host/

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Deployment](#deployment)

## Features

- **Secure Health Records Management** - Store and organize all medical documents in one place
- **Vital Tracking** - Monitor heart rate, blood pressure, temperature, and other health metrics
- **Smart Sharing** - Share medical records with healthcare providers with granular access control
- **Health Reports** - Generate and view comprehensive health reports
- **User Profiles** - Maintain detailed health profiles with personal information
- **Bank-Level Security** - End-to-end encryption and enterprise-grade security
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Real-Time Sync** - All data syncs in real-time across devices

## Tech Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript 5.5** - Type safety
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Vite 5.4** - Build tool and dev server
- **Lucide React 0.344** - Icon library
- **React Hooks** - State management

### Backend
- **Supabase** - PostgreSQL database with authentication
- **PostgREST API** - Auto-generated REST API
- **Row Level Security (RLS)** - Data protection policies
- **Real-time Subscriptions** - Live data updates

### Database
- **PostgreSQL** - Relational database
- **UUID** - Unique identifiers
- **JWT** - Authentication tokens

### DevOps & Tools
- **ESLint** - Code linting
- **TypeScript Compiler** - Type checking
- **Vite** - Module bundling and HMR

## Project Structure

```
healthvault/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── Dashboard/
│   │   │   └── DashboardView.tsx
│   │   ├── Layout/
│   │   │   └── DashboardLayout.tsx
│   │   ├── Profile/
│   │   │   └── ProfileView.tsx
│   │   ├── Reports/
│   │   │   └── ReportsView.tsx
│   │   ├── Sharing/
│   │   │   └── SharingView.tsx
│   │   ├── Vitals/
│   │   │   └── VitalsView.tsx
│   │   └── Landing/
│   │       └── LandingPage.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── database.types.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── migrations/
│       └── 20260111121342_create_health_wallet_schema.sql
├── dist/
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## System Architecture

### Frontend (ReactJS)

The frontend is built with React 18 and TypeScript, using modern React patterns including:

- **Component Architecture**: Organized into logical modules
  - `/components/Auth`: Login and registration forms
  - `/components/Layout`: Dashboard layout with responsive sidebar
  - `/components/Dashboard`: Overview with statistics and recent vitals
  - `/components/Vitals`: Vitals tracking with filtering
  - `/components/Reports`: Report upload, viewing, and management
  - `/components/Sharing`: Access control and report sharing
  - `/components/Profile`: User profile management

- **State Management**: React Context API for authentication state
- **UI Framework**: Tailwind CSS for responsive, modern design
- **Icons**: Lucide React for consistent iconography
- **API Integration**: Supabase client for direct database access

### Backend (Supabase)

Supabase provides a complete backend solution:

- **Authentication**: Email/password authentication with Supabase Auth
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Storage**: Supabase Storage for health report files
- **Real-time**: Automatic session management

### Database Schema (PostgreSQL)

#### Tables

1. **profiles**
   - Extended user information linked to `auth.users`
   - Fields: id, email, full_name, phone, date_of_birth, created_at, updated_at

2. **vital_types**
   - Reference table for different vital measurements
   - Pre-populated with common vitals (BP, blood sugar, heart rate, etc.)
   - Fields: id, name, unit, description, normal_range_min, normal_range_max

3. **vitals**
   - Stores vital measurements over time
   - Fields: id, user_id, vital_type_id, value, measured_at, notes, created_at

4. **reports**
   - Metadata for uploaded health reports
   - Fields: id, user_id, title, report_type, file_path, file_type, file_size, report_date, description, vital_type_id

5. **report_shares**
   - Access control for sharing reports
   - Fields: id, report_id, owner_id, shared_with_id, access_level, shared_at, expires_at

#### Security (Row Level Security)

All tables have RLS enabled with comprehensive policies:

- Users can only access their own data
- Shared reports are accessible to authorized viewers
- All queries are secured at the database level
- Storage access is also controlled via RLS policies

## Features

### 1. User Management
- User registration with email and password
- Secure login with session management
- Profile management (name, phone, date of birth)
- Automatic profile creation on signup

### 2. Health Reports
- Upload medical reports (PDF/Image, max 10MB)
- Store rich metadata (title, type, date, description)
- Associate reports with specific vitals
- View reports in browser or download
- Filter by date range, report type
- Search reports by title or type

### 3. Vitals Tracking
- Record various health vitals with timestamps
- Support for 14 predefined vital types
- Normal range indicators (visual feedback)
- Add notes to measurements
- Filter by vital type
- Historical tracking with chronological display

### 4. Report Retrieval
- Advanced search functionality
- Multiple filter options (type, date range)
- Quick access to recent records
- Downloadable and viewable reports

### 5. Access Control
- Share specific reports with other users
- Email-based user lookup
- Optional expiration dates for shares
- View all active shares
- Revoke access anytime
- Read-only access for viewers

## Technology Stack

- **Frontend**: ReactJS 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Database**: PostgreSQL with Row Level Security
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Authentication**: Supabase Auth (email/password)

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm/yarn
- A Supabase account (free tier available)
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/healthvault.git
   cd healthvault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Supabase credentials (see [Environment Variables](#environment-variables) section)

4. **Start development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

5. **Open in browser**
   Navigate to `http://localhost:5173` and you should see the HealthVault landing page

### Building for Production

```bash
npm run build
```

The optimized build will be created in the `dist/` folder.

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**How to get your Supabase credentials:**

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Settings > API**
4. Copy the **Project URL** and **Anon Key**
5. Add them to your `.env` file

**Note:** These are public keys used for client-side authentication. The Anon Key should not access sensitive operations.

## API Documentation

### Authentication Endpoints

#### Sign Up
- **Method:** POST
- **Endpoint:** `POST /auth/v1/signup`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "secure_password"
  }
  ```
- **Response:** User object with session token

#### Sign In
- **Method:** POST
- **Endpoint:** `POST /auth/v1/signin`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "secure_password"
  }
  ```
- **Response:** User object with session token

#### Sign Out
- **Method:** POST
- **Endpoint:** `POST /auth/v1/logout`
- **Response:** Success message

### Health Records API

#### Get All Records
```javascript
const { data, error } = await supabase
  .from('health_records')
  .select('*')
  .eq('user_id', userId);
```

#### Create Health Record
```javascript
const { data, error } = await supabase
  .from('health_records')
  .insert({
    user_id: userId,
    record_type: 'blood_test',
    data: {},
  });
```

#### Update Record
```javascript
const { data, error } = await supabase
  .from('health_records')
  .update({ data: {} })
  .eq('id', recordId);
```

#### Delete Record
```javascript
const { data, error } = await supabase
  .from('health_records')
  .delete()
  .eq('id', recordId);
```

### Vitals API

#### Get User Vitals
```javascript
const { data, error } = await supabase
  .from('vitals')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

#### Record New Vital
```javascript
const { data, error } = await supabase
  .from('vitals')
  .insert({
    user_id: userId,
    heart_rate: 72,
    blood_pressure: '120/80',
    temperature: 98.6,
  });
```

### Sharing API

#### Get Shared Records
```javascript
const { data, error } = await supabase
  .from('shared_records')
  .select('*')
  .eq('user_id', userId);
```

#### Share Record with Provider
```javascript
const { data, error } = await supabase
  .from('shared_records')
  .insert({
    user_id: userId,
    provider_email: 'doctor@hospital.com',
    record_id: recordId,
    access_level: 'read',
  });
```

## Authentication

HealthVault uses Supabase Authentication with email/password flow:

1. **Sign Up** - Users create account with email and password
2. **Sign In** - Users authenticate with credentials
3. **Session Management** - JWT tokens stored in browser
4. **Row Level Security** - Database policies ensure users only access their data
5. **Auto Logout** - Sessions expire after inactivity

### Security Features
- Passwords are hashed with bcrypt
- Email verification optional
- JWT-based stateless authentication
- HTTPS enforced in production
- CORS configured for trusted origins

## Deployment

### Deploy to Vercel (Recommended)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import from GitHub
   - Select your repository

3. **Add Environment Variables**
   - In Vercel dashboard, go to **Settings > Environment Variables**
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

4. **Deploy**
   - Click "Deploy"
   - Your app will be live at `https://your-app.vercel.app`

### Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Connect to Netlify**
   - Drag and drop `dist/` folder to Netlify
   - Or connect GitHub for automatic deployments

3. **Add Environment Variables**
   - Site settings > Build & deploy > Environment
   - Add Supabase credentials

### Deploy to Custom Server

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Upload `dist/` folder to your server**

3. **Configure web server** (nginx/Apache) to serve `index.html` for all routes

## Usage Guide

### Getting Started

1. **Register an Account**: Create a new account with your email and password
2. **Complete Profile**: Add your personal information in the Profile section
3. **Add Vitals**: Start tracking your health by recording vitals
4. **Upload Reports**: Upload medical reports with relevant metadata
5. **Share Reports**: Grant access to doctors or family members

### Vitals Tracking

- Click "Add Vital" to record a new measurement
- Select the vital type (e.g., Blood Pressure, Blood Sugar)
- Enter the value and timestamp
- Add optional notes
- View history with normal range indicators

### Report Management

- Click "Upload Report" to add a new health report
- Fill in the title, type, and date
- Optionally associate with a vital type
- Upload PDF or image file (max 10MB)
- View or download reports anytime

### Sharing Reports

- Navigate to the Sharing section
- Click "Share Report"
- Select the report to share
- Enter the recipient's email (must have an account)
- Optionally set an expiration date
- Recipients can view shared reports in their dashboard

## Security Features

- All data is protected by Row Level Security (RLS)
- Users can only access their own data or explicitly shared data
- File storage is secured with RLS policies
- Authentication required for all operations
- Secure session management
- Password requirements enforced

## Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

Potential features for future versions:
- WhatsApp integration for report uploads
- Data visualization charts for vitals trends
- Export reports to PDF
- Appointment scheduling
- Medication tracking
- Health goal setting
- Integration with wearable devices
- Multi-language support
