# SkillNest — Student Skill and Service Management System (SSSM)

> **“By GPM Students, For GPM Students.”**  
> An exclusive student skill-sharing, freelance collaboration, and academic resource platform built for **Government Polytechnic Malvan**.

---

## 🏛️ Institution Details

- **Institution:** Government Polytechnic Malvan
- **Address:** A/P – Kumbharmath, Taluka – Malvan, District – Sindhudurg, Maharashtra – 416606
- **Established:** 1985
- **MSBTE Institute Code:** `0015`
- **DTE Institute Code:** `3011`
- **Official Portal:** [https://www.gpmalvan.co.in/](https://www.gpmalvan.co.in/)
- **Phone:** `02365 252223` | **Email:** `office.gpmalvan@dtemaharashtra.gov.in`

### 📚 Official Departments Supported
1. Civil Engineering
2. Computer Engineering
3. Electrical Engineering
4. Electronics and Communication Engineering
5. Mechanical Engineering
6. Food Technology
7. Science & Humanities
8. Workshop

---

## 🌿 Core Features

- **Dual-Mode Architecture (Student ↔ Freelancer):** Single unified account allows students to toggle between Student Mode (requesting services, academic resources) and Freelancer Mode (offering technical skills, fulfilling gigs).
- **Authenticated Header & Live Activity Summary:**
  - Header profile display with student photo, legal name, department, and Student ID.
  - Interactive profile dropdown with dynamic profile completion percentage bar.
  - Live activity stats calculated directly from Supabase: *Orders Given*, *Active Orders*, *Completed Orders*, *Active Gigs*, *Orders Received*, *Completed Gigs*, and *Peer Rating ★*.
- **Real Supabase Authentication:**
  - Login via registered email or **Student ID / Enrollment Number** (e.g. `2200150042`).
  - Secure registration validating legal name, enrollment number, phone number, diploma year, and GPM department.
  - Password recovery email workflow.
- **Campus Services Marketplace:** Browse, search, filter, and order student-offered services with 6-stage lifecycle tracking (`Pending` → `Accepted` → `In Progress` → `Submitted` → `Revision Requested` → `Completed`).
- **MSBTE Academic Vault:** Download and upload handwritten lecture notes, laboratory manuals, and previous year solved question papers (PYQs) categorized by department and semester.
- **Direct Messaging & Realtime Notifications:** Stay updated on inquiries, work submissions, and order milestones with live unread badge counters.
- **Supabase Storage Integration:** Supports file attachments for project orders, deliverables, and student avatar photo uploads.
- **Zero Mock Data:** Completely empty-state compliant; no fake users, orders, or hardcoded stats.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Custom Editorial Typography (*Playfair Display*, *Plus Jakarta Sans*, *Caveat*)
- **Icons:** Lucide React
- **Backend & Database:** Supabase (PostgreSQL, Supabase Auth, Supabase Storage, Realtime)
- **Routing:** React Router v6

---

## 🚀 Getting Started Locally

### 1. Clone the Repository
```bash
git clone https://github.com/TanmayGhadi/SkillNest-SSSM-SyS.git
cd SkillNest-SSSM-SyS
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://cgtqbffzehpdbfrimbmz.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```
*(Reference values are provided in `.env.example`)*

### 4. Database Setup
1. Open your Supabase project dashboard.
2. Navigate to the **SQL Editor**.
3. Run the complete migration script provided in [`supabase/schema.sql`](./supabase/schema.sql).
4. All 18 tables, automated profile creation triggers, Row Level Security (RLS) policies, and storage buckets (`avatars`, `services`, `resources`, `orders`, `submissions`) will be initialized immediately.

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📄 License & Academic Integrity
Developed by and for students of Government Polytechnic Malvan. Project services are positioned for development assistance, peer debugging, and collaborative learning in compliance with MSBTE academic guidelines.
