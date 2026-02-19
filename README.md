# College Super App

A comprehensive college management platform built with Next.js 15, Convex, and Clerk.

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/agentzerodev-lang/college-super-app?utm_source=oss&utm_medium=github&utm_campaign=agentzerodev-lang%2Fcollege-super-app&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

## Features

- **Dashboard** - Role-based dashboards for students, faculty, and admins
- **Attendance** - Track and manage attendance records
- **Timetable** - View and manage class schedules
- **Canteen** - Online food ordering system
- **Library** - Book borrowing and management
- **Events** - Campus events and registrations
- **Tickets** - Support ticket system
- **SOS** - Emergency alert system
- **Wallet** - Digital wallet for campus payments
- **Hostel** - Hostel management and meal plans

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Convex (Serverless Database & Functions)
- **Auth**: Clerk
- **Icons**: Lucide React

## Getting Started

```bash
npm install
npm run dev
```

## Environment Variables

- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `CLERK_WEBHOOK_SECRET` - Clerk webhook secret
