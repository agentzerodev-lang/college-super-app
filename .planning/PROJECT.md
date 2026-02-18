# College Super-App MVP

## What This Is

A unified college management platform connecting students, faculty, and administrators through a single responsive web application. Handles daily campus operations: attendance, timetable, canteen ordering, hostel management, library, events, emergency SOS, tickets, and more. Built for real production use with live users.

## Core Value

**One app for everything campus** — Students manage their entire college life in one place, staff operate efficiently, admins have full visibility.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Core Infrastructure:**
- [ ] User authentication via Clerk with 5 role types (student, faculty, admin, hostelAdmin, canteenAdmin)
- [ ] Role-based access control enforced in Convex mutations/queries
- [ ] Responsive Next.js frontend with student-friendly UI
- [ ] Convex backend with flat schemas, no real-time subscriptions

**Feature 1: Users & Roles**
- [ ] User profile management with branch, year, hostel assignment
- [ ] Role-based dashboard views
- [ ] Admin user management

**Feature 2: Attendance System**
- [ ] Student daily self-attendance marking
- [ ] Faculty/admin attendance viewing by date and user
- [ ] Attendance statistics and reports

**Feature 3: Timetable & Next Class**
- [ ] Timetable storage and display
- [ ] Next class query per student
- [ ] Shared with free-classroom logic

**Feature 4: Free Classroom Availability**
- [ ] Derived from timetable + classrooms
- [ ] Real-time availability checking

**Feature 5: Resource & Knowledge Sharing**
- [ ] Student uploads (links/text/files)
- [ ] Branch/tag-based filtering
- [ ] Upvoting system

**Feature 6: Unified Ticket System**
- [ ] Academic and hostel ticket types
- [ ] Status lifecycle: open → in_progress → resolved
- [ ] Ticket assignment and tracking

**Feature 7: Ticket Status Tracking**
- [ ] User-specific ticket views
- [ ] Admin ticket dashboard

**Feature 8: Women Emergency SOS**
- [ ] SOS alert creation with location
- [ ] Admin visibility and response
- [ ] Status resolution tracking

**Feature 9: Hostel Food Reviews**
- [ ] Meal-based rating system (1-5 stars)
- [ ] Comments and feedback
- [ ] Average rating calculation

**Feature 10: Canteen Ordering System**
- [ ] Menu browsing with categories
- [ ] Order placement and tracking
- [ ] Status updates: pending → confirmed → preparing → ready → delivered
- [ ] Canteen admin management

**Feature 11: Playground/Sports Slot Booking**
- [ ] Slot creation and availability
- [ ] Booking with conflict prevention
- [ ] User booking history

**Feature 12: Event/Hackathon Registration**
- [ ] Event listing and details
- [ ] Student registration with profile auto-fill
- [ ] Max participants and waitlisting

**Feature 13: Payment/Free Registration Logic**
- [ ] Conditional registration completion
- [ ] Payment status tracking (no gateway, status only)
- [ ] Free vs paid event handling

**Feature 14: Library Management**
- [ ] Book catalog with search
- [ ] Borrow/return tracking
- [ ] Due dates and fine calculation
- [ ] Overdue notifications

**Feature 15: Rewards & Credits System**
- [ ] Wallet per user
- [ ] Credit/debit transactions
- [ ] Admin-controlled rewards
- [ ] Transaction history

**Feature 16: Skills Ranking (Ghost Mode)**
- [ ] Anonymous leaderboard
- [ ] Score aggregation by event
- [ ] No direct user identity exposure

### Out of Scope

- Real payment gateway integration — status tracking only
- Real-time subscriptions — refresh after mutations
- Email/SMS notifications — in-app only for v1
- Mobile native apps — responsive web only
- Complex reporting/analytics dashboards — basic stats only

## Context

**Tech Stack:**
- Frontend: Next.js 14+ with App Router, React, Tailwind CSS
- Backend: Convex (serverless database + functions)
- Auth: Clerk (userId from Clerk, roles in publicMetadata)
- Deployment: Vercel + Convex Cloud

**Architecture Decisions:**
- Flat schemas only, no joins/foreign keys
- String IDs (userId, entityId)
- Status fields instead of deletes
- Every table includes createdAt
- Denormalization over relations
- No real-time subscriptions — clean re-fetch after mutations

**Target Users:**
- Students: Primary users accessing all features
- Faculty: Attendance, timetable, ticket management
- Admins: Full system access, user management
- Hostel Admin: Meal management, hostel tickets
- Canteen Admin: Menu and order management

## Constraints

- **Timeline:** 1-2 days for v1 MVP
- **Stack:** Must use Convex + Clerk + Next.js as specified
- **Data Model:** Flat schemas, no foreign keys, status-based soft deletes
- **Auth:** All authorization in Convex mutations/queries
- **UI:** Responsive, student-friendly, mobile-works

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Convex over traditional DB | Real-time capable, serverless, TypeScript native | — Pending |
| Clerk for auth | Handles roles in publicMetadata, drop-in components | — Pending |
| No subscriptions | Simpler data model, explicit refresh patterns | — Pending |
| Flat schemas | Hackathon-safe, no complex relations | — Pending |
| All 16 features in v1 | Demo requires full feature showcase | — Pending |

---
*Last updated: 2026-02-19 after initialization*
