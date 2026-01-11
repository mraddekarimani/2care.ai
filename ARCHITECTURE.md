# System Architecture - Digital Health Wallet

## Overview

The Digital Health Wallet is a modern web application built with a **3-tier architecture** consisting of:
1. **Frontend Layer** - ReactJS-based user interface
2. **Backend Layer** - Supabase (PostgreSQL + Auth + Storage)
3. **Database Layer** - PostgreSQL with Row Level Security

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
│                        (React + TypeScript)                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Auth      │  │   Dashboard  │  │    Vitals    │          │
│  │ Components  │  │   Component  │  │   Component  │          │
│  └─────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Reports   │  │    Sharing   │  │   Profile    │          │
│  │  Component  │  │   Component  │  │  Component   │          │
│  └─────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐           │
│  │         State Management (React Context)         │           │
│  └─────────────────────────────────────────────────┘           │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Supabase Client SDK
                           │ (REST API + WebSocket)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND LAYER                            │
│                      (Supabase Platform)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │  Authentication  │  │   PostgreSQL     │                   │
│  │   (Auth API)     │  │   (Database)     │                   │
│  │                  │  │                  │                   │
│  │  - Email/Pass    │  │  - RLS Policies  │                   │
│  │  - JWT Tokens    │  │  - ACID Trans.   │                   │
│  │  - Sessions      │  │  - Constraints   │                   │
│  └──────────────────┘  └──────────────────┘                   │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │     Storage      │  │    Real-time     │                   │
│  │   (File Store)   │  │  (WebSockets)    │                   │
│  │                  │  │                  │                   │
│  │  - File Upload   │  │  - Live Updates  │                   │
│  │  - RLS Access    │  │  - Auth Events   │                   │
│  │  - CDN Delivery  │  │  - Subscriptions │                   │
│  └──────────────────┘  └──────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                            │
│                   (PostgreSQL Database)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌──────────┐    │
│  │ profiles │  │vital_types │  │  vitals  │  │ reports  │    │
│  └──────────┘  └────────────┘  └──────────┘  └──────────┘    │
│                                                                 │
│  ┌───────────────┐                                             │
│  │report_shares  │                                             │
│  └───────────────┘                                             │
│                                                                 │
│  Row Level Security (RLS) + Foreign Key Constraints            │
└─────────────────────────────────────────────────────────────────┘
```

## Frontend Architecture (ReactJS)

### Component Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── LoginForm.tsx          # User login interface
│   │   └── RegisterForm.tsx       # User registration interface
│   ├── Layout/
│   │   └── DashboardLayout.tsx    # Main app layout with navigation
│   ├── Dashboard/
│   │   └── DashboardView.tsx      # Overview with stats and trends
│   ├── Vitals/
│   │   └── VitalsView.tsx         # Vitals tracking and history
│   ├── Reports/
│   │   └── ReportsView.tsx        # Report upload and management
│   ├── Sharing/
│   │   └── SharingView.tsx        # Access control interface
│   └── Profile/
│       └── ProfileView.tsx        # User profile management
├── contexts/
│   └── AuthContext.tsx            # Global authentication state
├── lib/
│   ├── supabase.ts                # Supabase client configuration
│   └── database.types.ts          # TypeScript database types
└── App.tsx                        # Main application router
```

### State Management

**Authentication State (React Context)**
- Manages user session across components
- Provides authentication methods (signIn, signUp, signOut)
- Handles session persistence and restoration

**Component-Level State**
- Each view manages its own local state
- Uses React hooks (useState, useEffect)
- Direct integration with Supabase client

### API Integration

**Supabase Client SDK**
- Direct database queries from frontend
- Type-safe operations with TypeScript
- Automatic authentication handling
- Real-time subscriptions for auth events

**Key Operations:**
```typescript
// Authentication
await supabase.auth.signUp({ email, password })
await supabase.auth.signInWithPassword({ email, password })

// Database queries
await supabase.from('vitals').select('*').eq('user_id', userId)
await supabase.from('reports').insert([reportData])

// File storage
await supabase.storage.from('health-reports').upload(path, file)
await supabase.storage.from('health-reports').download(path)
```

### UI/UX Design

**Tailwind CSS Utilities**
- Responsive grid layouts
- Mobile-first design approach
- Consistent color scheme (blue primary, green accents)
- Smooth transitions and hover effects

**Accessibility Features**
- Semantic HTML elements
- Proper form labels
- Keyboard navigation support
- Focus indicators

## Backend Architecture (Supabase)

### Authentication System

**Email/Password Authentication**
- Secure password hashing (bcrypt)
- JWT-based session tokens
- Automatic token refresh
- Session management

**Authentication Flow:**
```
1. User submits credentials
2. Supabase Auth validates and issues JWT
3. JWT stored in localStorage
4. Subsequent requests include JWT in headers
5. Database RLS policies validate JWT
```

### Business Logic

**Profile Creation**
- Triggered on user registration
- Creates extended profile in `profiles` table
- Links to `auth.users` via foreign key

**File Upload Flow**
```
1. User selects file (PDF/image)
2. Frontend validates file type and size
3. Upload to Supabase Storage with user-specific path
4. Store metadata in `reports` table
5. RLS ensures only owner can access
```

**Sharing Mechanism**
```
1. Owner selects report to share
2. Enters recipient email
3. System looks up user by email
4. Creates entry in `report_shares` table
5. RLS policy grants read access to recipient
```

### Authorization Flow

**Row Level Security (RLS)**
```sql
-- Example: Users can only view their own vitals
CREATE POLICY "Users can view own vitals"
  ON vitals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Example: Users can view shared reports
CREATE POLICY "Users can view shared reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM report_shares
      WHERE report_shares.report_id = reports.id
      AND report_shares.shared_with_id = auth.uid()
    )
  );
```

## Database Architecture (PostgreSQL)

### Schema Design

#### Entity Relationship Diagram

```
┌──────────────┐
│  auth.users  │
│ (Supabase)   │
└──────┬───────┘
       │
       │ 1:1
       ▼
┌──────────────┐     1:N      ┌──────────────┐
│   profiles   │◄──────────────│   vitals     │
└──────┬───────┘               └──────┬───────┘
       │                              │
       │ 1:N                          │ N:1
       │                              ▼
       │                       ┌──────────────┐
       │                       │ vital_types  │
       │                       │ (Reference)  │
       │                       └──────────────┘
       │
       │ 1:N
       ▼
┌──────────────┐     1:N      ┌──────────────┐
│   reports    │◄──────────────│report_shares │
└──────────────┘               └──────────────┘
       │                              │
       │                              │ N:1
       │                              ▼
       │                       ┌──────────────┐
       └───────────────────────┤   profiles   │
                 N:1           │  (viewers)   │
                               └──────────────┘
```

### Table Specifications

#### 1. profiles
**Purpose**: Extended user information
**Relationships**:
- 1:1 with auth.users (id = auth.users.id)
- 1:N with vitals
- 1:N with reports

**Key Fields**:
- `id`: UUID, primary key, foreign key to auth.users
- `email`: Text, user's email
- `full_name`: Text, display name
- `phone`: Text, optional contact
- `date_of_birth`: Date, optional

**Indexes**:
- Primary key on id
- Email is indexed via auth.users

#### 2. vital_types
**Purpose**: Reference data for vital measurements
**Relationships**: 1:N with vitals

**Key Fields**:
- `id`: UUID, primary key
- `name`: Text, unique (e.g., "Blood Pressure")
- `unit`: Text (e.g., "mmHg")
- `normal_range_min`: Numeric, optional
- `normal_range_max`: Numeric, optional

**Pre-populated Data**:
- 14 common vital types
- Used for data validation and UI

#### 3. vitals
**Purpose**: Store vital measurements over time
**Relationships**:
- N:1 with profiles (user_id)
- N:1 with vital_types (vital_type_id)

**Key Fields**:
- `id`: UUID, primary key
- `user_id`: UUID, foreign key to profiles
- `vital_type_id`: UUID, foreign key to vital_types
- `value`: Numeric, measured value
- `measured_at`: Timestamptz, measurement time
- `notes`: Text, optional

**Indexes**:
- user_id (for user queries)
- vital_type_id (for filtering)
- measured_at (for time-based queries)

#### 4. reports
**Purpose**: Metadata for health report files
**Relationships**:
- N:1 with profiles (user_id)
- N:1 with vital_types (vital_type_id, optional)
- 1:N with report_shares

**Key Fields**:
- `id`: UUID, primary key
- `user_id`: UUID, foreign key to profiles
- `title`: Text, report name
- `report_type`: Text (e.g., "Blood Test")
- `file_path`: Text, path in Supabase Storage
- `file_type`: Text, MIME type
- `file_size`: Bigint, bytes
- `report_date`: Date, medical report date
- `vital_type_id`: UUID, optional association

**Indexes**:
- user_id (for user queries)
- report_date (for date filtering)
- report_type (for type filtering)

#### 5. report_shares
**Purpose**: Access control for report sharing
**Relationships**:
- N:1 with reports (report_id)
- N:1 with profiles (owner_id)
- N:1 with profiles (shared_with_id)

**Key Fields**:
- `id`: UUID, primary key
- `report_id`: UUID, foreign key to reports
- `owner_id`: UUID, foreign key to profiles
- `shared_with_id`: UUID, foreign key to profiles
- `access_level`: Text, currently "viewer"
- `shared_at`: Timestamptz, share timestamp
- `expires_at`: Timestamptz, optional expiration

**Constraints**:
- Unique constraint on (report_id, shared_with_id)

**Indexes**:
- report_id (for report queries)
- shared_with_id (for user access queries)

### Security Model

**Row Level Security Policies**

1. **Owner Access**: Users can CRUD their own records
2. **Shared Access**: Users can READ explicitly shared reports
3. **Isolation**: No cross-user data access without explicit sharing
4. **Authenticated Only**: All operations require authentication

**Policy Examples**:

```sql
-- Profile access
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Report access (owner)
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Report access (shared)
CREATE POLICY "Users can view shared reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM report_shares
      WHERE report_shares.report_id = reports.id
      AND report_shares.shared_with_id = auth.uid()
      AND (report_shares.expires_at IS NULL
           OR report_shares.expires_at > now())
    )
  );

-- Share management
CREATE POLICY "Owners can create shares for their reports"
  ON report_shares FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM reports
      WHERE reports.id = report_shares.report_id
      AND reports.user_id = auth.uid()
    )
  );
```

### Data Integrity

**Foreign Key Constraints**
- Cascade deletes for user data cleanup
- SET NULL for optional relationships
- Prevent orphaned records

**Check Constraints**
- Email format validation (via auth.users)
- Positive values for file sizes
- Date range validation

**Unique Constraints**
- One share per report-user combination
- Unique vital type names

## Storage Architecture

### File Storage Structure

```
health-reports/
└── {user_id}/
    ├── {timestamp1}.pdf
    ├── {timestamp2}.jpg
    └── {timestamp3}.png
```

**Access Control**:
- User-specific folders (/{user_id}/)
- RLS policies on storage.objects
- Signed URLs for temporary access (1 hour)

**File Validation**:
- Max size: 10MB
- Allowed types: PDF, JPEG, PNG
- Client-side and server-side validation

## Data Flow Examples

### 1. User Registration Flow

```
User Input → Frontend Validation → Supabase Auth API
                                          ↓
                                    Create auth.users
                                          ↓
                                    Return User Object
                                          ↓
                                    Frontend creates profile
                                          ↓
                                    Insert into profiles table
                                          ↓
                                    Auto-login user
```

### 2. Upload Report Flow

```
User selects file → Frontend validation → Upload to Storage
                                                ↓
                                    Generate file path
                                                ↓
                                    Insert metadata to reports
                                                ↓
                                    RLS checks ownership
                                                ↓
                                    Success/Error response
```

### 3. Share Report Flow

```
User enters email → Lookup user by email → Create report_share entry
                                                ↓
                                    RLS validates ownership
                                                ↓
                                    Grant access to recipient
                                                ↓
                                    Recipient can now view report
```

### 4. View Shared Report Flow

```
User requests reports → Database query with RLS
                                ↓
                    SELECT reports WHERE user_id = current_user
                                OR
                    EXISTS in report_shares for current_user
                                ↓
                    Return combined results
                                ↓
                    Frontend displays all accessible reports
```

## Performance Considerations

### Database Optimization

**Indexes**:
- Primary keys for fast lookups
- Foreign keys for join performance
- Date fields for time-based queries
- User IDs for filtering

**Query Optimization**:
- Select only needed columns
- Use pagination for large result sets
- Leverage indexes in WHERE clauses
- Minimize JOIN operations

### Frontend Optimization

**Code Splitting**:
- Lazy loading for route components
- Dynamic imports for large dependencies

**Caching**:
- Browser caching for static assets
- LocalStorage for authentication tokens

**Bundle Optimization**:
- Vite for fast builds
- Tree shaking for unused code
- Minification and compression

## Scalability

### Horizontal Scaling

**Database**:
- Supabase handles auto-scaling
- Read replicas for high traffic
- Connection pooling

**Storage**:
- CDN distribution
- Geographic replication
- Automatic caching

### Vertical Scaling

**Application**:
- Stateless frontend (easy to replicate)
- No server-side session storage
- Client-side rendering

## Security Best Practices

### Authentication
- Password complexity requirements (6+ chars)
- JWT token expiration and refresh
- Secure password storage (bcrypt)

### Authorization
- Principle of least privilege
- RLS on all tables
- Explicit access grants only

### Data Protection
- HTTPS for all communications
- Encrypted storage
- No sensitive data in client logs

### Input Validation
- Client-side validation for UX
- Server-side validation for security
- SQL injection prevention (parameterized queries)
- File type and size restrictions

## Monitoring and Logging

### Application Logs
- Console errors in development
- Error boundaries in React
- User-friendly error messages

### Database Logs
- Supabase dashboard for query logs
- Performance metrics
- Error tracking

## Backup and Recovery

### Data Backup
- Supabase automated daily backups
- Point-in-time recovery
- Geographic redundancy

### File Backup
- Storage replication
- CDN caching provides redundancy

## Deployment Architecture

### Production Setup

```
User → CDN (Static Assets) → React App
                                  ↓
                            Supabase Edge
                                  ↓
                         ┌────────┴────────┐
                         ↓                 ↓
                    PostgreSQL        Storage
                    (Database)        (Files)
```

### Environment Configuration

**Development**:
- Local Supabase instance (optional)
- Hot module reloading
- Source maps enabled

**Production**:
- Optimized build
- Minified assets
- CDN delivery
- Production Supabase instance

## Technology Choices Rationale

### React
- Component-based architecture
- Large ecosystem
- TypeScript support
- Excellent developer experience

### Supabase
- PostgreSQL (ACID compliance)
- Built-in authentication
- Real-time capabilities
- Generous free tier
- Row Level Security

### TypeScript
- Type safety
- Better IDE support
- Reduced runtime errors
- Self-documenting code

### Tailwind CSS
- Utility-first approach
- Rapid development
- Consistent design system
- Responsive by default

## Conclusion

The Digital Health Wallet architecture provides:
- **Security**: RLS, authentication, encryption
- **Scalability**: Cloud-native, stateless design
- **Maintainability**: Clear separation of concerns
- **Performance**: Optimized queries, caching, CDN
- **User Experience**: Responsive design, intuitive UI
