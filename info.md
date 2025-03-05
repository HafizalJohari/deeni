<document>
  
<title>Deeni – Developer Guide & Documentation</title>

<scope>
Deeni is a web application designed to help users consistently track good deeds, integrating AI-powered Islamic insights, habit tracking, and gamification. This document provides a structured guide for developers to set up, develop, test, and deploy the project.  
</scope>

<development_workflow>
- Deeni follows an Agile development methodology with structured sprints.
- Git branching strategy:
  - `main` – Stable production-ready branch.
  - `develop` – Ongoing development branch.
  - `feature/*` – Individual branches for each feature/fix before merging into develop.
- Sprint Phases:
  - **MVP Development** – Habit tracking, authentication, Quran & Hadith insights.
  - **AI Integration** – OpenAI & Fal.AI API for AI-powered content.
  - **UI/UX Enhancements** – Mobile responsiveness & gamification.
  - **Testing & Deployment Prep** – Bug fixes & optimization.
</development_workflow>

<tech_stack>
- **Frontend:** Next.js (React) with Tailwind CSS.
- **Backend:** Supabase (PostgreSQL & Auth).
- **Hosting & CI/CD:** Vercel with automatic deployments.
- **AI Integrations:** OpenAI API (Quran & Hadith insights), Fal.AI (Islamic poster generation).
- **Notifications:** Web Push API & Firebase Cloud Messaging (FCM).
</tech_stack>

<roles>
- **Frontend Developer:** Build UI, integrate APIs, ensure responsiveness.
- **Backend Developer:** Manage Supabase, secure API endpoints, optimize database.
- **AI Engineer:** Implement OpenAI & Fal.AI, optimize prompts.
- **DevOps Engineer:** Manage CI/CD, configure environment variables, monitor deployments.
</roles>

<coding_standards>
- Maintain a **clean project structure** (separate frontend, backend, utilities).
- Follow **Git best practices** (feature branches, pull requests).
- Use **ESLint & Prettier** for consistent code formatting.
- Secure API keys using **environment variables** (`.env.local`).
- Implement **Supabase Row-Level Security (RLS)** for authorization.
- Ensure **unit & integration testing** to maintain code quality.
</coding_standards>

<project_setup>
1. Clone the repository:  
   ```bash
   git clone <repo_url>
