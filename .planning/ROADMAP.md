# College Super-App MVP - Roadmap

## Overview

| Metric | Value |
|--------|-------|
| Total Phases | 8 |
| Total Requirements | 76 |
| Timeline | 1-2 days |
| Mode | YOLO (auto-advance) |

---

## Phase 1: Project Setup & Auth

**Goal:** Establish Convex backend, Clerk auth, and user management foundation

**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07

**Success Criteria:**
1. Convex project initialized with schema
2. Clerk integration working with 5 roles
3. User can sign up, sign in, view profile
4. Role-based authorization helper created
5. Wallet created for each new user
6. Admin can manage users

**Plans:** 2-3 plans

---

## Phase 2: Core Backend (Attendance + Timetable)

**Goal:** Implement academic core features - attendance and timetable systems

**Requirements:** ATTD-01 to ATTD-06, TIME-01 to TIME-06, FREE-01 to FREE-03

**Success Criteria:**
1. Student can mark daily attendance
2. Faculty can view/mark attendance by date
3. Attendance statistics calculated
4. Timetable CRUD operations work
5. Next class query returns correct result
6. Free classroom availability derived correctly

**Plans:** 3-4 plans

---

## Phase 3: Support Systems (Resources + Tickets + SOS)

**Goal:** Implement support and emergency features

**Requirements:** RESC-01 to RESC-06, TICK-01 to TICK-07, SOS-01 to SOS-05

**Success Criteria:**
1. Resources can be created, filtered, upvoted
2. Tickets created with status lifecycle
3. Staff can manage tickets
4. SOS alerts created and tracked
5. All queries return usable data

**Plans:** 3-4 plans

---

## Phase 4: Services (Hostel + Canteen)

**Goal:** Implement daily service features

**Requirements:** HOST-01 to HOST-06, CANT-01 to CANT-09

**Success Criteria:**
1. Meals created and rated by students
2. Average ratings calculated correctly
3. Canteen menu items managed
4. Orders placed and tracked through status lifecycle
5. Order statistics available

**Plans:** 3-4 plans

---

## Phase 5: Activities (Playground + Events)

**Goal:** Implement activity and event management

**Requirements:** PLAY-01 to PLAY-08, EVNT-01 to EVNT-09

**Success Criteria:**
1. Playgrounds and slots created
2. Booking conflict prevention works
3. Events created with registration
4. Waitlisting when max participants reached
5. Registration cancellation updates counts

**Plans:** 3-4 plans

---

## Phase 6: Library & Credits

**Goal:** Implement library management and wallet system

**Requirements:** LIBR-01 to LIBR-09, WALL-01 to WALL-08

**Success Criteria:**
1. Books catalog searchable
2. Borrow/return with due dates
3. Fines calculated for overdue
4. Wallet balance tracked
5. Rewards credit wallet automatically
6. Admin can manage wallets

**Plans:** 3-4 plans

---

## Phase 7: Gamification

**Goal:** Implement skills ranking with ghost mode

**Requirements:** SKIL-01 to SKIL-07

**Success Criteria:**
1. Scores submitted for events
2. Anonymous leaderboard shows masked names
3. User can view own rank
4. Aggregation works across events

**Plans:** 1-2 plans

---

## Phase 8: Frontend Application

**Goal:** Build responsive Next.js frontend with all features

**Requirements:** FRNT-01 to FRNT-08, DASH-01 to DASH-05

**Success Criteria:**
1. Responsive app with bottom navigation
2. Hub dashboard with feature cards
3. Role-based UI rendering
4. All 16 features accessible from frontend
5. Mobile-first design works
6. Dark mode available

**Plans:** 4-5 plans

---

## Phase Dependencies

```
Phase 1 (Setup)
    │
    ├── Phase 2 (Core) ──────────────┐
    │                                │
    ├── Phase 3 (Support)            │
    │                                │
    ├── Phase 4 (Services)           │
    │                                │
    ├── Phase 5 (Activities)         │
    │                                │
    ├── Phase 6 (Library/Credits)    │
    │                                │
    └── Phase 7 (Gamification)       │
                                     │
                    ┌────────────────┘
                    ▼
              Phase 8 (Frontend)
```

Phases 2-7 can run in parallel (backend features are independent).
Phase 8 depends on all backend phases being complete.

---

## Execution Strategy

1. **Phase 1**: Must complete first (foundation)
2. **Phases 2-7**: Execute in parallel waves (3 agents max concurrent)
3. **Phase 8**: Final integration, requires all backend ready

---

## Progress Tracking

| Phase | Status | Plans | Completed |
|-------|--------|-------|-----------|
| Phase 1: Project Setup | 🔲 Not Started | - | 0/7 |
| Phase 2: Core Backend | 🔲 Not Started | - | 0/15 |
| Phase 3: Support Systems | 🔲 Not Started | - | 0/18 |
| Phase 4: Services | 🔲 Not Started | - | 0/15 |
| Phase 5: Activities | 🔲 Not Started | - | 0/17 |
| Phase 6: Library & Credits | 🔲 Not Started | - | 0/17 |
| Phase 7: Gamification | 🔲 Not Started | - | 0/7 |
| Phase 8: Frontend | 🔲 Not Started | - | 0/13 |

---
*Last updated: 2026-02-19*
