# College Super App - Technical Documentation

## Project Overview

**MySRKR - College Super App** is a comprehensive campus management platform designed for students, faculty, and administrators. It provides an all-in-one solution for managing campus activities, resources, events, and communications.

- **Live URL**: https://college-super-app.vercel.app
- **Repository**: https://github.com/agentzerodev-lang/college-super-app
- **Status**: Production Ready

---

## Architecture

### 1. Frontend Stack

#### Core Framework
- **Next.js 15.5.12** - React framework with App Router
  - File-based routing with parallel/intercepted routes
  - Server and Client components architecture
  - API Routes for webhooks
  - Static Site Generation (SSG) + Server-Side Rendering (SSR)

- **React 19.0.0** - UI library with latest features
  - Hooks for state management
  - Context API for global state
  - Suspense for loading states

- **TypeScript 5.7.0** - Type safety and developer experience
  - Strict mode enabled
  - Path aliases (@/*)
  - Type definitions for all APIs

#### Styling & UI
- **Tailwind CSS 3.4.19** - Utility-first CSS framework
  - Custom design system with extended colors
  - Dark mode support (class-based)
  - Glassmorphism effects
  - Custom animations and transitions
  - Responsive breakpoints

- **Framer Motion 12.34.2** - Animation library
  - Page transitions
  - Component animations
  - Gesture support
  - Layout animations

- **next-themes 0.4.6** - Theme management
  - System preference detection
  - Dark/Light mode switching
  - CSS variable integration

#### UI Components
- **Custom Component Library**
  - GlassCard - Glassmorphism card component
  - Button - Multiple variants (primary, secondary, danger, glass)
  - Input, Textarea, Select - Form components
  - Typography - H1-H6 headings, Text components
  - Skeleton - Loading placeholders

- **Lucide React 0.574.0** - Icon library
  - 1000+ icons
  - Tree-shakeable
  - Consistent styling

### 2. Backend Stack

#### Database & Backend
- **Convex 1.31.0** - Serverless backend platform
  - Real-time database with automatic sync
  - TypeScript-native functions
  - Built-in authentication integration
  - File storage capabilities
  - Scheduled functions

#### Database Schema
- **Users** - Authentication and profiles (5 roles: student, faculty, admin, hostelAdmin, canteenAdmin)
- **Colleges** - Multi-tenancy support
- **Events** - Event management with registration
- **Tickets** - Support ticket system
- **Library** - Book management and borrowing
- **Canteen** - Food ordering system
- **Hostel** - Reviews and management
- **Attendance** - Student attendance tracking
- **Timetable** - Class schedules
- **Classrooms** - Room booking system
- **Playground** - Sports slot booking
- **SOS** - Emergency alerts
- **Wallet** - Credits and rewards system
- **Resources** - Knowledge sharing
- **Skills** - Leaderboard and rankings

#### Authentication
- **Clerk 6.9.0** - Complete authentication solution
  - Email/password authentication
  - Social login (Google, GitHub, etc.)
  - Session management
  - User metadata storage
  - Webhook support for user events
  - Role-based access control (RBAC)

### 3. Development Tools

#### Build & Dev Tools
- **Node.js >=20.0.0** - Runtime environment
- **PostCSS 8.5.6** - CSS processing
- **Autoprefixer 10.4.24** - CSS vendor prefixes
- **ESLint 9.16.0** - Code linting
- **TypeScript Compiler** - Type checking

#### Utilities
- **clsx 2.1.1** - Conditional class names
- **tailwind-merge 3.5.0** - Tailwind class merging
- **svix 1.85.0** - Webhook verification

### 4. Deployment & Hosting

- **Vercel** - Frontend deployment
  - Automatic deployments from Git
  - Edge functions
  - Analytics and monitoring
  - Custom domains

- **Convex Cloud** - Backend hosting
  - Auto-scaling
  - Global CDN
  - Real-time sync
  - Automatic backups

---

## Project Structure

```
college-super-app/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes group
│   │   ├── sign-in/[[...sign-in]]/
│   │   └── sign-up/[[...sign-up]]/
│   ├── (dashboard)/              # Dashboard routes group
│   │   ├── attendance/
│   │   ├── canteen/
│   │   ├── classrooms/
│   │   ├── dashboard/
│   │   ├── events/
│   │   ├── hostel/
│   │   ├── leaderboard/
│   │   ├── library/
│   │   ├── playground/
│   │   ├── profile/
│   │   ├── resources/
│   │   ├── search/
│   │   ├── sos/
│   │   ├── tickets/
│   │   ├── timetable/
│   │   └── wallet/
│   ├── onboarding/
│   ├── api/
│   │   ├── webhooks/clerk/
│   │   └── search/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── dashboard/               # Dashboard components
│   ├── features/                # Feature-specific components
│   ├── layout/                  # Layout components
│   ├── modals/                  # Modal components
│   ├── motion/                  # Animation components
│   ├── providers/               # Context providers
│   └── ui/                      # Reusable UI components
├── convex/                      # Backend functions
│   ├── _generated/             # Auto-generated types
│   ├── attendance.ts
│   ├── auth.ts
│   ├── canteen.ts
│   ├── dashboard.ts
│   ├── events.ts
│   ├── hostel.ts
│   ├── library.ts
│   ├── playground.ts
│   ├── resources.ts
│   ├── schema.ts
│   ├── skills.ts
│   ├── sos.ts
│   ├── tickets.ts
│   ├── timetable.ts
│   ├── users.ts
│   └── wallet.ts
├── hooks/                       # Custom React hooks
├── lib/                         # Utility functions
├── types/                       # TypeScript types
├── middleware.ts               # Next.js middleware
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── package.json
```

---

## Features Overview

### 1. User Management & Authentication
- Multi-role authentication (Student, Faculty, Admin, HostelAdmin, CanteenAdmin)
- Onboarding flow with role selection
- Profile management
- Secure session handling with Clerk

### 2. Attendance System
- Mark attendance with location verification
- View attendance statistics
- Monthly/semester reports
- Faculty can mark for their courses

### 3. Timetable Management
- View daily class schedules
- Next class countdown
- Classroom details
- Course information

### 4. Event Management (Full CRUD)
- Students can create, edit, delete their own events
- Event registration with waitlist support
- Free and paid event support
- Category filtering (Academic, Cultural, Sports, etc.)
- Creator-only edit/delete permissions

### 5. Library System
- Book catalog with search
- Borrow/return functionality
- Due date tracking
- Book reviews and ratings
- Fine calculation

### 6. Ticket System
- Unified support tickets
- Multiple categories (Technical, Academic, Facility, etc.)
- Status tracking (Open, In Progress, Resolved, Closed)
- Priority levels
- Comments and updates

### 7. Canteen Ordering
- Digital menu browsing
- Cart functionality
- Order tracking
- Payment integration (Wallet credits)
- Order history

### 8. Hostel Management
- Food reviews and ratings
- Complaint system
- Room allocation tracking
- Mess menu display

### 9. SOS/Emergency
- One-tap emergency alerts
- Location sharing
- Contact emergency services
- Women safety features

### 10. Playground Booking
- Sports slot booking
- Equipment reservation
- Cancel/rebook functionality
- Availability calendar

### 11. Resource Sharing
- Upload documents, videos, links
- Category-based organization
- Search and filter
- Download tracking

### 12. Skills Leaderboard
- Skill-based rankings
- Ghost mode for privacy
- Anonymous participation option
- Points and badges system

### 13. Wallet & Rewards
- Digital wallet for campus payments
- Rewards for participation
- Transaction history
- Top-up functionality

### 14. Classroom Booking
- View free classrooms
- Book time slots
- Cancel bookings
- Recurring bookings

---

## Security Features

1. **Authentication**
   - JWT-based session management
   - CSRF protection
   - Secure cookie handling
   - Multi-factor authentication support (via Clerk)

2. **Authorization**
   - Role-based access control (RBAC)
   - Creator-only edit/delete permissions
   - Resource-level permissions
   - API route protection

3. **Data Protection**
   - Input validation with Convex validators
   - SQL injection prevention (Convex handles this)
   - XSS protection via React's escaping
   - Secure webhook verification with Svix

4. **Privacy**
   - Ghost mode for leaderboards
   - Optional anonymous participation
   - Data export capabilities
   - Account deletion support

---

## Performance Optimizations

1. **Frontend**
   - Next.js Image optimization
   - Code splitting and lazy loading
   - React.memo for component memoization
   - Skeleton loading states

2. **Backend**
   - Convex's automatic caching
   - Real-time subscriptions (no polling)
   - Efficient database queries with indexes
   - Optimistic updates

3. **Build**
   - Static generation where possible
   - Incremental Static Regeneration (ISR)
   - Bundle optimization
   - Tree shaking

---

## Development Workflow

### Available Scripts

```bash
# Development
npm run dev              # Start Next.js dev server
npm run convex:dev       # Start Convex dev server

# Building
npm run build            # Build for production
npm run start            # Start production server

# Linting
npm run lint             # Run ESLint
```

### Environment Variables

Required environment variables (in `.env.local`):

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Convex
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOY_KEY=

# Optional
NEXT_PUBLIC_APP_URL=
```

---

## API Endpoints

### Webhooks
- `POST /api/webhooks/clerk` - Clerk user events

### Search API
- `GET /api/search/books` - Search library books
- `GET /api/search/events` - Search events
- `GET /api/search/resources` - Search resources
- `GET /api/search/tickets` - Search tickets

### Convex Queries & Mutations

All backend functions are exposed through Convex's client SDK:

```typescript
// Queries (read-only)
api.users.getUser
api.events.getByCollege
api.events.getMyRegistrations
api.dashboard.getStudentDashboard
api.tickets.getByCollege
api.library.getBooks
...

// Mutations (write operations)
api.events.createEvent
api.events.updateEvent
api.events.deleteEvent
api.events.register
api.tickets.create
api.users.createOrUpdateUser
...
```

---

## Design System

### Colors

**Primary Palette:**
- Primary: Sky blue (#0ea5e9)
- Accent: Magenta (#d946ef)
- Success: Green (#22c55e)
- Warning: Amber (#f59e0b)
- Error: Red (#ef4444)

**Dark Mode:**
- Background: #0d0d0f
- Surface: #202123, #343541
- Text: White with varying opacity

### Typography

- **Primary Font**: Inter (Sans-serif)
- **Monospace**: JetBrains Mono
- **Scales**: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl

### Components

**Glassmorphism:**
- Background: rgba(255, 255, 255, 0.05)
- Border: rgba(255, 255, 255, 0.1)
- Backdrop blur: 16px
- Border radius: 16px-24px

**Buttons:**
- Primary: Filled with gradient
- Secondary: Outlined
- Glass: Transparent with border
- Danger: Red filled
- Sizes: sm, md, lg

**Cards:**
- Elevated: With shadow
- Flat: No shadow
- Bordered: Prominent border
- Glass: Glassmorphism effect

---

## Deployment Checklist

- [ ] Set up Clerk application
- [ ] Configure Clerk webhooks
- [ ] Create Convex project
- [ ] Deploy Convex schema and functions
- [ ] Set environment variables on Vercel
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring (Vercel Analytics)
- [ ] Configure error tracking

---

## Future Roadmap

1. **Mobile App**: React Native companion app
2. **Push Notifications**: Real-time alerts
3. **AI Assistant**: Campus chatbot
4. **Integration**: LMS, ERP systems
5. **Offline Support**: PWA capabilities
6. **Analytics Dashboard**: For administrators

---

## Team & Credits

**Built with:**
- Next.js 15 + React 19
- Convex Backend
- Clerk Authentication
- Tailwind CSS + Framer Motion
- Vercel Hosting

**License:** Private (Closed Source)

---

## Support

For technical issues or feature requests:
- GitHub Issues: https://github.com/agentzerodev-lang/college-super-app/issues
- Documentation: This file
- Live Demo: https://college-super-app.vercel.app

---

*Last Updated: February 19, 2026*
