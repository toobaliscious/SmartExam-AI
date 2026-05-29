# SmartExam AI - Deployment Guide

## Overview
SmartExam AI is a full-stack Next.js application with AI-powered exam generation, student testing, and semantic grading. This guide covers local setup, testing, and production deployment to Vercel.

## Local Development Setup

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or yarn
- PostgreSQL database (local or cloud like Neon)
- OpenRouter API key for AI integration

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd smartexam-ai
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
# Database (Neon PostgreSQL recommended)
DATABASE_URL=postgresql://user:password@host/smartexam

# NextAuth configuration
NEXTAUTH_SECRET=your-long-random-secret-here-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# OpenRouter API for AI exam generation
OPENROUTER_API_KEY=your-openrouter-api-key
```

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Push Database Schema

On first run, initialize your database:

```bash
npm run prisma:push
```

This creates all tables (`User`, `ExamPaper`, `Question`, `Result`, `MockTestAttempt`).

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing

### Unit Tests (Grading Logic)

```bash
npm test
```

Tests for `compareAnswer()` and `calculateScore()` ensure exam grading works correctly.

### E2E Tests (Optional - Playwright)

```bash
```

## Building for Production

```bash
npm run test:e2e
```

The `.next` folder contains optimized production build.

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "SmartExam AI ready for deployment"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Next.js framework is auto-detected

### 3. Set Environment Variables

In Vercel project settings, add under **Environment Variables**:

```
DATABASE_URL=postgresql://...  (your production DB)
NEXTAUTH_SECRET=<generate new random secret>
AUTH_SECRET=<same secret as NEXTAUTH_SECRET>
NEXTAUTH_URL=https://your-app.vercel.app
OPENAI_API_KEY=<your OpenAI API key>
GEMINI_API_KEY=<your Gemini API key>
OPENROUTER_API_KEY=<your OpenRouter key>
```

If your app uses NextAuth authentication in production, `NEXTAUTH_SECRET` or `AUTH_SECRET` must be set. If you deploy without a database, any Prisma-backed API routes will fail.

### 4. Deploy

Vercel auto-deploys on `git push` to main branch. Monitor deployment status in Vercel dashboard.

## Workflow - Local to Production

1. **Local Development**: Run `npm run dev`, test features
2. **Testing**: Run `npm test` to verify grading logic
3. **Build**: Run `npm run build` to catch type errors early
4. **Git Push**: Commit and push to GitHub
5. **Vercel Deploy**: Automatically triggered; watch logs
6. **Verify**: Test AI generation, exams, and results on production URL

## Key Features & Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/signIn` - Login (via NextAuth)
- Session-based JWT tokens

### AI Exam Generation
- `POST /api/ai` - Generate exam with AI (Teacher only)
  - Input: title, subject, topic, difficulty, style, MCQ/short/long count, timeLimit
  - Output: structured exam with questions and answer keys

### Exam Management
- `GET /api/exams` - List exams (filter by teacherId)
- `POST /api/exams` - Save generated exam with questions

### Student Testing
- `GET /api/exams` - Get available exams for testing
- `POST /api/results` - Submit test answers and save result

### Results & Grading
- `GET /api/results/get` - Fetch results (by studentId or teacherId)
- Auto-grading uses semantic answer matching (tolerates case/punctuation)

## Environment & CI/CD

### GitHub Actions CI Workflow
- Runs on push to `main` and pull requests
- Steps: Install → Prisma generate → Build → Tests
- Path: `.github/workflows/ci.yml`

### Vercel CI/CD
- Auto-builds on push, auto-deploys on success
- Logs viewable in Vercel dashboard
- Rollback available for any deployment

## Troubleshooting

### Build fails: "DATABASE_URL not provided"
- Ensure `.env` is set and contains valid `DATABASE_URL`
- On Vercel, check environment variables in project settings

### AI generation returns empty/malformed response
- Verify `OPENROUTER_API_KEY` is valid and has credits
- Check OpenRouter API status at [openrouter.ai](https://openrouter.ai)

### Tests fail locally but pass in CI
- Ensure you ran `npm install` recently
- Run `npm run prisma:generate` to update Prisma Client

### TypeScript errors during build
- Run `npm run build` locally first to catch errors early
- Check `types/next-auth.d.ts` for NextAuth type augmentations

## Performance Tips

- **Database**: Use connection pooling (Neon offers this by default)
- **AI**: OpenRouter uses model `deepseek-chat-v3-0324` for cost-efficiency; swap model URL in `lib/ai.ts` if needed
- **Frontend**: Pages are pre-rendered where possible; API routes are server-rendered

## Support & Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [OpenRouter Docs](https://openrouter.ai/docs)

---

**Version**: 1.0.0  
**Last Updated**: May 2026
