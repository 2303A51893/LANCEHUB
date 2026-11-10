# System Architecture & Technical Specifications
## Freelancer Project Bidding and Contract Management Platform

- **Student Name:** GUNDA VENKATARAMANA
- **Enrolment Number:** 2303A51893
- **Project Number:** 46

---

## 1. High-Level Architecture Diagram

```
[ User Browser / Client Apps ]
             │
             ▼
     ┌──────────────┐
     │ Nginx Ingress│  (Handles SSL/TLS, static routing & SPA fallback)
     └───────┬──────┘
             │
     ┌───────┴──────────────────────────────┐
     │                                      │
     ▼                                      ▼
[ Frontend Service: Port 80 ]        [ Backend API: Port 5000 ]
  (React 18 + Vite + Tailwind)         (Node.js Express REST API)
                                            │
                             ┌──────────────┼──────────────┐
                             ▼              ▼              ▼
                       [ JWT Auth ]    [ Sequelize ]  [ Business Logic ]
                             │              │
                             └──────┬───────┘
                                    ▼
                         [ PostgreSQL 16 DB ]
                          (Port 5432 / PVC 2Gi)
```

---

## 2. Core Functional Subsystems

### 2.1 Authentication & Role-Based Access Control (RBAC)
- **Token Generation:** JSON Web Tokens (JWT) signed with a secret key and a 7-day lifespan.
- **Password Security:** Salted hashes generated with `bcryptjs` (10 rounds).
- **Middleware:** `authenticateToken` validates signatures and verifies that `user.isActive === true`. `authorizeRoles('admin', 'client', 'freelancer', 'payment_reviewer')` strictly guards sensitive endpoints.

### 2.2 Project & Bidding Engine
- **Lifecycle:** `Open` -> `In Progress` -> `Completed` / `Cancelled`.
- **Deduplication Check:** Composite unique constraint check on `(projectId, freelancerId)` guarantees that each freelancer can submit at most one active bid per project.
- **Contract Auto-Generation:** When a client selects and accepts a proposal, the backend executes an atomic transaction:
  1. Sets selected bid status to `Accepted`.
  2. Sets competing pending bids to `Rejected`.
  3. Transitions project status to `In Progress`.
  4. Generates a new `Contract` record with start date, calculated end date, and agreed budget.
  5. Seeds initial milestone structures.

### 2.3 Milestone & Simulated Escrow Payout Workflow
- Contracts are broken down into discrete milestones.
- Deliverables are submitted by the assigned freelancer with revision history and artifact URLs.
- When a client approves a deliverable, an immutable `Payment` record is created with a generated transaction ID (`TXN-...`) in `Pending Review` status.
- Only users with the `payment_reviewer` (or `admin`) role can approve or reject the payment request.
- Approving updates the milestone to `Paid` and increments the freelancer's cumulative earnings.

### 2.4 Rating & Feedback Subsystem
- Clients can submit ratings (1 to 5 stars) and qualitative feedback after contract completion.
- The system recalculates the freelancer's cumulative weighted rating and total review count upon submission.

### 2.5 Real-Time Notifications
- In-app notification records are generated whenever actions occur (bid received, contract created, deliverable submitted, payment processed).
- The frontend context polls every 15 seconds to surface unread notification badges.

