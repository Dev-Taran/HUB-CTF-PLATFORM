# CTF Platform

A modern Capture The Flag (CTF) platform built with Next.js, Shadcn/ui, and Prisma.

## Features

- **Invite-only registration** with unique invite keys
- **User authentication** (signup/login) with JWT tokens
- **Password strength indicator** with real-time feedback
- **Modern UI** with Shadcn/ui components
- **PostgreSQL database** with Prisma ORM
- **Admin panel** for managing invite keys
- **Responsive design** for all devices

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI**: Shadcn/ui + Tailwind CSS
- **Database**: PostgreSQL (Neon DB)
- **ORM**: Prisma
- **Authentication**: JWT with cookies
- **Language**: TypeScript

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Update the database URL and other secrets

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The platform includes the following models:
- **User**: User accounts with authentication and scoring
- **Challenge**: CTF challenges with categories and points
- **Solve**: User challenge completion records
- **InviteKey**: Invite-only registration system

## API Routes

- `POST /api/auth/signup` - User registration (requires invite key)
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-invite` - Verify invite key validity
- `POST /api/admin/invite-keys` - Create new invite key (admin only)
- `GET /api/admin/invite-keys` - List all invite keys (admin only)

## Project Structure

```
├── src/
│   ├── app/                   # Next.js app directory
│   │   ├── api/              # API routes
│   │   ├── login/            # Login page
│   │   ├── signup/           # Signup page
│   │   └── layout.tsx        # Root layout
│   ├── components/           # React components
│   │   └── ui/              # Shadcn/ui components
│   ├── lib/                 # Utility functions
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── prisma.ts        # Prisma client
│   │   └── utils.ts         # General utilities
│   └── middleware.ts        # Authentication middleware
├── prisma/                  # Database schema
└── README.md
```

### 만들어야하는 기능
1. Challenge Prob 올리기
2. Docker 이미지를 통한 문제 돌리기 (Challenge Start 버튼 클릭시 접속 정보 떠야함)
3. Leader Board 
4. tlqkf 그냥 전체적으로 전체 확인 후 문제점들 수정해야함