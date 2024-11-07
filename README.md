# Employee Time-Off Request System

## Live Demo

The application is deployed and accessible at: https://spm-group7.vercel.app/

## Important Note for Login

For testing purposes, the password for each user account is set to be the same as their username, which is the staff_id, to access Olivia (140015), you would key in 140015 in the username and password.

Some accounts to test:
Staff: 140015
HR/Director: 160008
HR Staff: 160015
Manager: 140894

## Project Overview

This is an Employee Time-Off Request Management System built with Next.js and Supabase. The system allows employees to:

- View their work schedule
- Submit time-off requests
- Track request status
- Manage approvals/rejections
- View request history
- Delegate approval authorities

## Key Features

- User authentication and role-based access control
- Request management workflow (submit, approve, reject, withdraw, cancel)
- Viewing of own schedule, team schedule, department schedule or organisation schedule depending on role
- Comprehensive logging system for an audit
- Document attachment support for requests
- Transferring of role-based access control permissions

## Technical Stack

- Frontend: Next.js
- Database: Supabase
- ORM: Prisma
- Authentication: NextAuth.js
- File Storage: Supabase

## Database Schema

The system uses the following main entities:

- Users (staff information and hierarchy)
- Requests (time-off requests)
- Logs (tracking requests)
- Delegation Requests (approval authority delegation)
- Delegation Logs (tracking delegation requests)

## Environment Variables

Create a `.env` file in the root directory with the following format:

```
NEXT_PUBLIC_BASE_URL=your_base_url
NEXTAUTH_SECRET=your_nextauth_secret
GITHUB_ID=your_github_id
GITHUB_SECRET=your_github_secret
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_database_url
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables as described above
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Access the application at `http://localhost:3000`

## Database Setup

1. Make sure PostgreSQL is installed and running
2. Run Prisma migrations:
   ```bash
   npx prisma db pull
   ```
   Then run this to generate the Typescript types.
   ```bash
   npx prisma generate
   ```

## Testing

Login with any user account using the username as both the username and password.

## Contributors

Section G1
Group 7
