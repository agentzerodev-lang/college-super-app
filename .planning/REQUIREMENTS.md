# College Super-App MVP - Requirements

## v1 Requirements

### AUTH - Authentication & Users

- [ ] **AUTH-01**: User can sign up and sign in via Clerk
- [ ] **AUTH-02**: User profile includes name, email, branch, year, hostel, phone
- [ ] **AUTH-03**: System supports 5 roles: student, faculty, admin, hostelAdmin, canteenAdmin
- [ ] **AUTH-04**: Role-based access control enforced in all Convex mutations/queries
- [ ] **AUTH-05**: User can update their profile information
- [ ] **AUTH-06**: Admin can view all users and deactivate accounts
- [ ] **AUTH-07**: Wallet created automatically for each new user

### ATTD - Attendance System

- [ ] **ATTD-01**: Student can mark daily self-attendance
- [ ] **ATTD-02**: Faculty can mark attendance for any student by date
- [ ] **ATTD-03**: Faculty can view attendance by date
- [ ] **ATTD-04**: Student can view own attendance history
- [ ] **ATTD-05**: System calculates attendance statistics (total, present, absent, percentage)
- [ ] **ATTD-06**: Faculty can bulk mark attendance for multiple students

### TIME - Timetable & Next Class

- [ ] **TIME-01**: Admin can create classrooms with name, building, capacity, type
- [ ] **TIME-02**: Admin can add timetable entries with day, time, subject, classroom, faculty, branch, year
- [ ] **TIME-03**: Student can view timetable filtered by branch and year
- [ ] **TIME-04**: Student can query next upcoming class
- [ ] **TIME-05**: Faculty can view their teaching schedule
- [ ] **TIME-06**: Faculty/admin can cancel a class

### FREE - Free Classroom Availability

- [ ] **FREE-01**: System derives free classrooms from timetable data
- [ ] **FREE-02**: User can query available classrooms by day and time slot
- [ ] **FREE-03**: Results show classroom name, building, capacity

### RESC - Resource & Knowledge Sharing

- [ ] **RESC-01**: User can create resource with title, type (link/text/file), content
- [ ] **RESC-02**: Resource can be tagged with branch and custom tags
- [ ] **RESC-03**: User can browse resources filtered by branch and tags
- [ ] **RESC-04**: User can upvote resources
- [ ] **RESC-05**: User can remove their own resources
- [ ] **RESC-06**: User can search resources by title/description

### TICK - Unified Ticket System

- [ ] **TICK-01**: User can create ticket with title, description, type (academic/hostel), priority
- [ ] **TICK-02**: System tracks ticket status: open → in_progress → resolved → closed
- [ ] **TICK-03**: User can view their own tickets
- [ ] **TICK-04**: Staff can view all tickets filtered by type and status
- [ ] **TICK-05**: Admin can assign ticket to staff member
- [ ] **TICK-06**: Staff can update ticket status and add resolution notes
- [ ] **TICK-07**: System provides ticket statistics dashboard

### SOS - Women Emergency SOS

- [ ] **SOS-01**: User can create SOS alert with optional location and message
- [ ] **SOS-02**: Staff/admin can view all active SOS alerts
- [ ] **SOS-03**: Staff can update SOS status (responding, resolved)
- [ ] **SOS-04**: User can cancel their own active SOS
- [ ] **SOS-05**: System provides SOS statistics

### HOST - Hostel Food Reviews

- [ ] **HOST-01**: Hostel admin can create meals with menu, date, meal type
- [ ] **HOST-02**: Student can view meals by hostel and date
- [ ] **HOST-03**: Student can submit meal rating (1-5 stars) with optional comment
- [ ] **HOST-04**: System calculates average rating per meal
- [ ] **HOST-05**: Student can update their own review
- [ ] **HOST-06**: Hostel admin can view hostel statistics

### CANT - Canteen Ordering System

- [ ] **CANT-01**: Canteen admin can create menu items with name, price, category
- [ ] **CANT-02**: Canteen admin can update item availability
- [ ] **CANT-03**: User can browse available menu items by category
- [ ] **CANT-04**: User can place order with multiple items and notes
- [ ] **CANT-05**: System tracks order status: pending → confirmed → preparing → ready → delivered
- [ ] **CANT-06**: User can cancel pending orders
- [ ] **CANT-07**: Canteen admin can update order status
- [ ] **CANT-08**: User can view their order history
- [ ] **CANT-09**: Canteen admin can view order statistics

### PLAY - Playground/Sports Booking

- [ ] **PLAY-01**: Admin can create playgrounds with name, type, description
- [ ] **PLAY-02**: Admin can create time slots for playgrounds
- [ ] **PLAY-03**: System prevents slot conflicts
- [ ] **PLAY-04**: User can view available slots by playground and date
- [ ] **PLAY-05**: User can book an available slot
- [ ] **PLAY-06**: User can cancel their booking
- [ ] **PLAY-07**: User limited to one booking per day per playground
- [ ] **PLAY-08**: Admin can view all bookings

### EVNT - Event/Hackathon Registration

- [ ] **EVNT-01**: Staff can create events with title, description, type, date, venue, max participants
- [ ] **EVNT-02**: Event can be free or paid (registration fee specified)
- [ ] **EVNT-03**: User can browse upcoming events
- [ ] **EVNT-04**: User can register for event with profile auto-fill
- [ ] **EVNT-05**: System tracks registration status (registered, waitlisted, cancelled)
- [ ] **EVNT-06**: System tracks payment status (free, pending, paid)
- [ ] **EVNT-07**: User can cancel registration
- [ ] **EVNT-08**: Staff can view event registrations
- [ ] **EVNT-09**: Staff can update event status

### LIBR - Library Management

- [ ] **LIBR-01**: Staff can add books with title, author, ISBN, category, copies, location
- [ ] **LIBR-02**: User can browse and search books
- [ ] **LIBR-03**: User can borrow a book (if copies available)
- [ ] **LIBR-04**: System sets 14-day due date on borrow
- [ ] **LIBR-05**: User can return borrowed book
- [ ] **LIBR-06**: System calculates fines for overdue books (5/day)
- [ ] **LIBR-07**: User can view their borrow history
- [ ] **LIBR-08**: Staff can view overdue books
- [ ] **LIBR-09**: Staff can view library statistics

### WALL - Rewards & Credits System

- [ ] **WALL-01**: Each user has a wallet with balance
- [ ] **WALL-02**: User can view their wallet balance and transaction history
- [ ] **WALL-03**: Admin can credit user wallet with reason
- [ ] **WALL-04**: Admin can debit user wallet with reason
- [ ] **WALL-05**: Admin can award rewards (attendance, event, achievement, bonus)
- [ ] **WALL-06**: Reward credits are added to wallet automatically
- [ ] **WALL-07**: Admin can freeze/unfreeze wallets
- [ ] **WALL-08**: Admin can view wallet statistics

### SKIL - Skills Ranking (Ghost Mode)

- [ ] **SKIL-01**: User can submit score for an event
- [ ] **SKIL-02**: Scores can be anonymous (ghost mode)
- [ ] **SKIL-03**: System aggregates scores by user
- [ ] **SKIL-04**: User can view overall leaderboard (anonymous names shown)
- [ ] **SKIL-05**: User can view event-specific leaderboard
- [ ] **SKIL-06**: User can view their own ranking
- [ ] **SKIL-07**: Staff can remove scores

### DASH - Dashboards

- [ ] **DASH-01**: Student dashboard shows: today's attendance, next class, pending tickets, upcoming events, wallet balance, active orders
- [ ] **DASH-02**: Faculty dashboard shows: today's classes, attendance marked count, open tickets
- [ ] **DASH-03**: Admin dashboard shows: user counts, ticket stats, event stats, active SOS alerts
- [ ] **DASH-04**: Hostel admin dashboard shows: meals, reviews, hostel tickets
- [ ] **DASH-05**: Canteen admin dashboard shows: orders, revenue, item availability

### FRNT - Frontend Application

- [ ] **FRNT-01**: Responsive Next.js app with App Router
- [ ] **FRNT-02**: Bottom navigation with Home, Search, Quick Add, Notifications, Profile
- [ ] **FRNT-03**: Hub dashboard with feature cards
- [ ] **FRNT-04**: Role-based page access and UI rendering
- [ ] **FRNT-05**: Mobile-first responsive design
- [ ] **FRNT-06**: Student-friendly color scheme (blue-indigo primary, teal accent)
- [ ] **FRNT-07**: Dark mode support
- [ ] **FRNT-08**: Universal search across features

## v2 Requirements (Deferred)

- Real payment gateway integration
- Email/SMS notifications
- Mobile native apps (iOS/Android)
- Advanced analytics dashboards
- Bulk data import/export
- API for third-party integrations

## Out of Scope

- Real-time subscriptions — explicit refresh only
- Complex reporting — basic stats only for v1
- Multi-tenant college support — single college for v1
- File upload storage — links only for v1

---

## Traceability

| Phase | Requirements |
|-------|-------------|
| Phase 1: Project Setup | AUTH-01 to AUTH-07 |
| Phase 2: Core Backend | ATTD-01 to ATTD-06, TIME-01 to TIME-06, FREE-01 to FREE-03 |
| Phase 3: Support Systems | RESC-01 to RESC-06, TICK-01 to TICK-07, SOS-01 to SOS-05 |
| Phase 4: Services | HOST-01 to HOST-06, CANT-01 to CANT-09 |
| Phase 5: Activities | PLAY-01 to PLAY-08, EVNT-01 to EVNT-09 |
| Phase 6: Library & Credits | LIBR-01 to LIBR-09, WALL-01 to WALL-08 |
| Phase 7: Gamification | SKIL-01 to SKIL-07 |
| Phase 8: Frontend Core | FRNT-01 to FRNT-08, DASH-01 to DASH-05 |
