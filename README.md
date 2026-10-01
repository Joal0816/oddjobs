# oddJobs / addJobs 🎓💼

> **Hyperlocal Student Workforce Marketplace for MSU-IIT**  
> *CONNECT. WORK. EARN.* — Connecting students, people, and campus businesses.

`oddJobs` (also referred to as `addJobs`) is a student-first hyperlocal gig and workforce marketplace built for Mindanao State University – Iligan Institute of Technology (MSU-IIT). It addresses the friction students face finding flexible, trusted micro-gigs within their campus ecosystem while allowing campus departments, student organizations, peers, and local community members to safely delegate short-term tasks and projects.

---

## 📌 Technopreneurship BCA172 MVP Scope & Features

This web application represents the functional Minimum Viable Product (MVP) developed for the **BCA172 - Technopreneurship** course. The platform is designed around three core pillars: **WORK**, **CONNECT**, and **EARN**.

### 1. 🔍 Job Discovery & Exploration
- **Tinder-style Gig Swipe (`SwipeHome`)**: Rapid, interactive card swiping interface to discover campus jobs, review budgets, skills, and deadlines with immediate action triggers (Apply, Bookmark, Pass).
- **Categorized Job Marketplace (`JobListings`)**: Filter and search tasks across key campus domains:
  - Web & Software Development
  - Photography & Media
  - Graphic Design & Illustration
  - Academic Tutoring & Review
  - Event Support & Ushering
  - Errands, Moving & Logistics

### 2. 🪪 Student Profile & Campus Verification
- **Verified Student Credentials**: University domain verification (`@g.msuiit.edu.ph`), student ID validation, college/department association, and year level.
- **Skill Badges & Availability**: Student showcase for technical, academic, and creative skills, along with real-time availability toggles (`Available`, `Busy`, `Flexible`).
- **Reputation & Review System**: Transparent 5-star ratings and student peer reviews to foster trust within the campus community.

### 3. 📝 Job Posting & Requisition (`PostJob`)
- Intuitive modal and form workflow for students, student councils/organizations, and campus faculty to publish tasks.
- Specification of budgets (PHP ₱), pricing models (`per job`, `per day`, `per hour`), required deliverables, and deadlines.

### 4. 🤝 Digital Job Agreement & Milestone Tracking (`AgreementView`)
- Formal digital contract workflow to protect both student freelancers and requesters against ghosting or wage disputes.
- Explicit deliverable lists, deadline parameters, and revision policies.
- Payment status tracking supporting campus-friendly options: **GCash**, **Cash on Campus**, and **Simulated Protected Payment**.
- Work submission attachments and feedback/approval mechanisms.

### 5. 🌐 Random Connect — Hyperlocal Networking (`RandomConnect`)
- Controlled student social and networking layer facilitating serendipitous peer discovery.
- Match verified MSU-IIT peers by shared technical interests, study topics, or creative hobbies.
- Instant peer messaging with trust controls (safety reporting and moderation).

### 6. 🛡️ Admin & Moderation Panel (`AdminDashboard`)
- Centralized administrative console for campus moderators.
- Student identity and ID verification approval queue.
- Job listing oversight, flagged content reviews, and agreement dispute tracking.

---

## 🛠️ Tech Stack Overview

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Turbopack support, React 19)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Modern dark mode UI, glowing accent palettes, and responsive glassmorphism)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strictly-typed data structures for Users, Jobs, Agreements, and Applications)
- **Icons**: [Lucide React](https://lucide.dev/) (Modern, clean icon pack)
- **Interactive FX**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) (Celebratory effects for completed agreements and job submissions)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.18.0 or later (v20+ recommended)
- **npm** (or pnpm / yarn)

### Installation

Clone the repository and install the project dependencies:

```bash
cd oddjobs-web
npm install
```

### Development Server

Start the local development server with Next.js Turbopack:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Production Build

Create an optimized production build:

```bash
npm run build
```

Run the built production server locally:

```bash
npm run start
```

### Linting

Validate code style and TypeScript correctness:

```bash
npm run lint
```

---

## 📂 Project Organization

```text
BCA172 - Technopreneurship/
├── documentation/               # Course documents, MVP proposals, and Business Model Canvases
│   ├── addJobs_Full_Core_Features_and_MVP_Scope.docx
│   ├── addJobs_MVP_Canvas_Final_Tagline_Clean.pptx
│   ├── business-model-canvas.docx
│   └── OddJob_MVP_Proposal.docx
├── reference_images/            # High-resolution design assets and reference screenshots
└── oddjobs-web/                 # Next.js 15 Web Application
    ├── src/
    │   ├── app/                 # Next.js App Router (layout, page, global styling)
    │   ├── components/          # Views: LandingPage, SwipeHome, JobListings, RandomConnect, etc.
    │   ├── context/             # AppContext for state management and active tab switching
    │   ├── data/                # Mock data representing MSU-IIT campus gigs and verified students
    │   └── types/               # TypeScript interfaces (Job, User, DigitalAgreement, etc.)
    └── public/                  # Brand logos, avatars, and static media
```
