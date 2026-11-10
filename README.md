# Freelancer Project Bidding and Contract Management Platform (LanceHub)

[![CI/CD Pipeline](https://github.com/venka/Devops/actions/workflows/ci.yml/badge.svg)](https://github.com/venka/Devops/actions)
![Docker](https://img.shields.io/badge/Docker-Supported-blue?logo=docker)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326CE5?logo=kubernetes)
![Node.js](https://img.shields.io/badge/Node.js-v20+-green?logo=node.js)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)

---

## Student Details
- **Student Name:** GUNDA VENKATARAMANA
- **Enrolment Number:** 2303A51893
- **Project Number:** 46

---

## 1. Project Overview

**LanceHub** is an enterprise-grade, responsive Freelancer Project Bidding and Contract Management Platform. It enables clients to post complex technical projects, allows verified freelancers to submit competitive bids, facilitates side-by-side bid comparison and acceptance, automatically generates formal binding contracts, tracks milestone-based deliverable submissions, and provides simulated payment escrow reviews and comprehensive business analytics with CSV exports.

---

## 2. Technology Stack

| Domain | Technology / Library | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18 with Vite | Fast Single Page Application (SPA) architecture |
| **Styling** | Tailwind CSS 3.4 | Clean modern UI with blue and purple accents |
| **Routing** | React Router DOM 6 | Protected role-based client routing |
| **Icons & Charts**| Lucide React & Recharts | Professional data visualizations and iconography |
| **HTTP Client** | Axios | Configured with automatic Bearer token interceptor |
| **Backend** | Node.js & Express.js | Production-ready modular REST API server |
| **Database** | PostgreSQL 16 & Sequelize ORM | Relational schema with migrations and SQLite fallback |
| **Security** | JWT & bcryptjs | 7-day signed tokens and 10-round salted password hashing |
| **DevOps** | Docker & Docker Compose | Multi-stage Docker builds and orchestrated compose cluster |
| **Orchestration**| Kubernetes (K8s) | Deployments, Services, ConfigMaps, Secrets, PVCs, Probes |
| **CI/CD** | GitHub Actions | Automated lint, build, testing, and container packaging |

---

## 3. Four User Roles & Permissions

1. **Admin (`admin`):**
   - System supervisor account.
   - Access to platform-wide User Management (view profiles, toggle activation/deactivation).
   - Global view of all projects, bids, contracts, and simulated escrow payouts.
   - Access to all 4 mandatory executive reports with CSV export.

2. **Client (`client`):**
   - Create, edit, and publish project listings (scope, budget, deadline, skills required).
   - Review incoming freelancer proposals.
   - Side-by-side bid comparison and decision (Accept / Reject).
   - Automated contract creation upon proposal acceptance.
   - Add custom milestones to active contracts.
   - Review submitted deliverables (Approve or Request Revision).
   - Submit 5-star ratings and written feedback after contract completion.

3. **Freelancer (`freelancer`):**
   - Create and update freelancer profile (skills, hourly rate, portfolio, bio).
   - Browse and search open project listings by category, budget, and skills.
   - Submit competitive proposals (bid quote, delivery timeframe, cover letter).
   - Duplicate bid prevention per project.
   - Track proposal statuses and active contracts.
   - Upload and submit milestone deliverables.
   - Receive simulated milestone disbursements and client reviews.

4. **Payment Reviewer (`payment_reviewer`):**
   - Independent financial auditor role.
   - Review simulated payout requests generated from approved milestones.
   - Authorize (disburse) or reject simulated payments with auditor notes.
   - View complete transaction audit trails and download milestone reports.

---

## 4. Demo Login Credentials (1-Click Switcher Available)

For effortless evaluation, the login screen includes a **1-Click Instant Role Demo Login Switcher**:

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | Gunda Venkataramana (Admin) | `admin@lancehub.com` | `Password123!` |
| **Payment Reviewer** | Sarah Jenkins (Finance) | `reviewer@lancehub.com` | `Password123!` |
| **Client** | Marcus Vance (TechCorp Global) | `client1@techcorp.com` | `Password123!` |
| **Freelancer** | Alex Chen (Cloud Architect) | `freelancer1@dev.com` | `Password123!` |
| **Client 2** | Elena Rostova (Apex Fintech) | `client2@fintech.io` | `Password123!` |
| **Freelancer 2** | Priya Sharma (UI/UX) | `freelancer2@dev.com` | `Password123!` |

---

## 5. Minimum 12 Application Screens Implemented

1. **Login & Registration Page (`/login`, `/register`):** Modern split layout with 1-click role switcher and custom registration fields by role.
2. **Main Dashboard (`/`):** Role-specific dashboard with 8 metric cards, Recharts financial volume trend, proposal status pie chart, and pending approvals.
3. **User Management Page (`/users`):** Admin console with search, role filters, status toggles (activate/deactivate), and user detail modals.
4. **Project Listing Page (`/projects`):** Multi-filter search toolbar (categories, scopes, statuses, budgets, sorting) and interactive project cards.
5. **Create & Edit Project Page (`/projects/create`, `/projects/:id/edit`):** Full form validation with technical tags and scope indicators.
6. **Project Details Page (`/projects/:id`):** Project specifications, client profile, proposal submissions count, and freelancer bid modal.
7. **Freelancer Proposal & Bidding Page (`/bids`):** Freelancer's submitted proposals, status breakdown (Pending, Accepted, Rejected), and quick contract links.
8. **Bid Comparison & Selection Page (`/projects/:id/compare`):** Side-by-side evaluation of bids with quote variance, freelancer ratings, on-time delivery rates, and accept/reject triggers.
9. **Contract Management Page (`/contracts`):** Active and completed contracts, agreed values, milestone progress bars, and completion sign-off.
10. **Milestone & Deliverables Page (`/contracts/:id`):** Milestone management, deliverable submission with artifact links, and client approval/revision workflow.
11. **Simulated Payment Management Page (`/payments`):** Payment Reviewer audit console, pending payout approvals, transaction receipts, and financial metrics.
12. **Reports & Analytics Page (`/reports`):** 4 mandatory executive reports with interactive tables, Recharts visualizations, and CSV data export.

---

## 6. Four Mandatory Reports Implemented

- **Report 1: Project Bids Report:** Project title, client, status, budget, total bids, lowest bid, highest bid, average bid, accepted vs. rejected counts, and quotation spread chart.
- **Report 2: Freelancer Performance Report:** Freelancer name, verified rating, total reviews, completed projects, active contracts, on-time delivery %, bid win rate, and total simulated earnings.
- **Report 3: Contract Status Report:** Contract ID, project title, client, freelancer, contract value, start/end dates, agreement status, and milestone completion progress %.
- **Report 4: Payment Milestones Report:** Transaction ID, contract, milestone title, amount, due date, payment status, approval date, reviewer name, and audit notes.

All 4 reports include **CSV Data Export** via `exportToCSV`.

---

## 7. Quick Start with Docker Compose

Deploy the complete full-stack environment with one command:

```bash
docker compose up --build
```

- **Frontend Application:** `http://localhost:3000`
- **Backend REST API:** `http://localhost:5000`
- **Backend Health Check:** `http://localhost:5000/api/health`
- **PostgreSQL Database:** `localhost:5432` (database: `freelancer_db`, user: `postgres`)

---

## 8. Kubernetes Deployment

All Kubernetes manifests are located in `k8s/` and configured under the `freelancer-platform` namespace:

```bash
# 1. Build container images
docker build -t lancehub-backend:latest ./backend
docker build -t lancehub-frontend:latest ./frontend

# 2. Deploy to Kubernetes
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# 3. Verify deployment
kubectl get all -n freelancer-platform
```

Access the frontend on NodePort `http://localhost:30080` (or run `kubectl port-forward -n freelancer-platform svc/frontend-service 8080:80`).
See [`k8s/README.md`](file:///c:/Users/venka/OneDrive/Desktop/Devops/k8s/README.md) for full documentation.

---

## 9. Running Tests Locally

### Backend Unit & Integration Tests (Jest + Supertest)
```bash
cd backend
npm test
```
**Results:** 20/20 test suites passed (100% pass rate) covering authentication, role-based access, project CRUD, bid deduplication, contract generation, deliverable approval, payment review, and all 4 reports.

### Frontend Production Build (Vite)
```bash
cd frontend
npm run build
```
**Results:** Compiled into `dist/` without warnings or errors.

---

## 10. End-to-End Workflow Verification

1. **Client Registers & Posts Project:** Log in as Client Marcus Vance -> Post project "NextGen AI Gateway" ($4,000 budget).
2. **Freelancer Submits Bid:** Switch role to Freelancer Alex Chen -> Browse listing -> Submit bid ($3,800, 14 days, cover letter).
3. **Client Evaluates & Accepts:** Client opens Bid Comparison page -> Compares quotes -> Accepts Alex's bid -> Contract #X is generated automatically.
4. **Milestone Created:** Client divides contract into 2 milestones ($1,900 each).
5. **Freelancer Submits Deliverable:** Freelancer submits GitHub PR link and deliverables notes.
6. **Client Approves:** Client reviews deliverable and clicks "Approve Work" -> Creates simulated payment record in "Pending Review".
7. **Payment Reviewer Signs Off:** Switch role to Reviewer Sarah Jenkins -> Audits deliverable acceptance -> Clicks "Sign Off & Disburse" -> Milestone marked Paid.
8. **Client Rates Freelancer:** Client rates Alex Chen 5 stars with written review -> Alex's average rating is recalculated.
9. **Admin Audits Reports:** Admin Gunda Venkataramana views Report 1, 2, 3, 4 and exports CSV.

