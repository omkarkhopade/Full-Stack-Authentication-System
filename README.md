# Authly

Authly is a full-stack authentication and user-management application built with
Next.js, TypeScript, MongoDB, and Tailwind CSS. It includes email verification,
password recovery, secure JWT sessions, role-based authorization, and an
administrator dashboard.

## Features

### Authentication

- User registration with normalized email and unique-account validation
- Password hashing with bcrypt
- Secure HTTP-only JWT session cookies
- Protected profile and administrator routes
- Logout with server-side cookie invalidation

### Email verification

- One-hour, single-use verification links
- Login blocked until the email address is verified
- Verification-email resending from login, profile, and `/verifyemail`
- New verification requests invalidate older links
- Generic resend responses prevent account enumeration

### Password recovery

- Forgot-password request using the registered email address
- One-hour, single-use reset links
- Password confirmation and server-side validation
- Secure password rehashing
- Automatic redirect to login after a successful reset

### Administration

- Server-protected `/admin` dashboard
- Independent authorization on every `/api/admin/*` request
- User search and pagination
- Verification-status management
- Administrator-role management
- User deletion
- Protection against administrator self-deletion and self-demotion
- Local-only initial administrator provisioning

### Security

- Random verification and reset tokens
- Only SHA-256 token digests are stored in MongoDB
- Passwords and token fields are excluded from normal database queries
- Secure, `SameSite=Lax` session cookies
- Input validation and normalized emails
- Security response headers
- Generic authentication-recovery responses
- No public administrator-registration endpoint

## Technology stack

- Next.js 16 and React 19
- TypeScript
- MongoDB and Mongoose
- Tailwind CSS 4
- JSON Web Tokens
- bcrypt
- Nodemailer and SMTP
- Axios
- React Hot Toast

## Local development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure every value:

```env
MONGO_URI=mongodb+srv://username:password@cluster.example.mongodb.net/auth_app
TOKEN_SECRET=replace-with-a-long-random-secret
APP_URL=http://localhost:3000

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-sender@gmail.com
SMTP_PASS=your-google-app-password
EMAIL_FROM=Authly <your-sender@gmail.com>
```

Generate a strong session secret with:

```bash
openssl rand -base64 48
```

Never commit `.env`.

### 3. Start the application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Gmail SMTP

For a personal or demonstration deployment:

1. Enable two-step verification on the sending Google account.
2. Create a Google App Password.
3. Use the 16-character App Password as `SMTP_PASS`.
4. Use the same Gmail address for `SMTP_USER` and `EMAIL_FROM`.

Do not use the Google account's normal password. Gmail SMTP is suitable for
small projects but not high-volume transactional email. For production delivery
analytics, bounce handling, and higher limits, use a provider such as Resend,
Postmark, Amazon SES, Brevo, or SendGrid.

## Email-verification flow

1. Signup creates an unverified account and sends a verification email.
2. The signup page displays a clear **Check your inbox** state.
3. Opening the link verifies the raw token against its stored SHA-256 digest.
4. The account is marked as verified and the token fields are removed.
5. Unverified login attempts return `403 EMAIL_NOT_VERIFIED` without creating a
   session.
6. Users can request a replacement link from login, profile, or `/verifyemail`.

Only the newest verification link remains valid.

## Initial administrator provisioning

There is intentionally no public admin-signup form. Create and verify a normal
account first, then run:

```bash
npm run admin:provision -- admin@example.com
```

Sign out and sign in again. The account will receive an **Admin dashboard**
button and can open `/admin`.

The provisioning command:

- Reads `MONGO_URI` from `.env`
- Promotes only an existing account
- Does not accept or modify passwords
- Does not expose a public provisioning API

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript validation |
| `npm run check` | Run lint, type-check, and production build |
| `npm run audit:prod` | Audit dependencies included in production |
| `npm run admin:provision -- email` | Promote an existing user to administrator |

## Main routes

| Route | Description |
| --- | --- |
| `/signup` | Create an account |
| `/verifyemail` | Verify an email or request a new link |
| `/login` | Sign in |
| `/forgotpassword` | Request a password-reset link |
| `/resetpassword` | Choose a new password |
| `/profile` | View the authenticated account |
| `/admin` | Manage users as an administrator |

## Validation

Run the complete validation pipeline before committing:

```bash
npm run check
npm run audit:prod
```

The project is expected to pass:

- ESLint
- TypeScript validation
- Next.js production compilation
- Production dependency vulnerability audit

`npm audit` may report a development-only `brace-expansion` advisory through
ESLint 9 plugins. The production dependency graph is unaffected and is checked
with `npm run audit:prod`. Do not use `npm audit fix --force` until the Next.js
lint plugin stack supports ESLint 10, because the forced update is a breaking
toolchain change.

## Deploying to Vercel

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Add every variable from `.env.example` to the Vercel project.
4. Set `APP_URL` to the final HTTPS deployment URL.
5. Configure a real SMTP provider and verified sender.
6. Allow the deployment environment through MongoDB Atlas Network Access.
7. Deploy the application.
8. Test signup, verification, resend, unverified-login rejection, login, logout,
   password recovery, and admin authorization in production.
9. Provision the production administrator from a trusted local environment
   connected to the production `MONGO_URI`, if required.

## Production considerations

For a larger public deployment, add:

- Shared rate limiting using Redis or a managed service such as Upstash
- Centralized application logging and monitoring
- Transactional email delivery events and bounce handling
- Automated unit, integration, and end-to-end tests
- A custom domain with a verified SMTP sending domain

Never expose database credentials, JWT secrets, SMTP passwords, App Passwords,
session cookies, or raw verification/reset tokens.
