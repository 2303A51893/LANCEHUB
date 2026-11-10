# REST API Documentation
## LanceHub Freelancer Platform API

- **Student Name:** GUNDA VENKATARAMANA
- **Enrolment Number:** 2303A51893
- **Project Number:** 46
- **Base URL:** `http://localhost:5000/api`

---

## Authentication Header
All protected endpoints require the standard Bearer authorization header:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Method:** `POST /api/auth/register`
- **Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "Password123!",
  "role": "freelancer",
  "phone": "+1-555-0199",
  "title": "React Specialist",
  "hourlyRate": 45
}
```
- **Response:** `201 Created` with JWT token and user profile.

### 1.2 Login User
- **Method:** `POST /api/auth/login`
- **Body:**
```json
{
  "email": "admin@lancehub.com",
  "password": "Password123!"
}
```
- **Response:** `200 OK` with `{ success: true, token: "...", user: {...} }`.

### 1.3 Get Current User Profile
- **Method:** `GET /api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` with user details and attached role profile.

---

## 2. Project Endpoints

### 2.1 Get All Projects (with Filtering, Search & Sorting)
- **Method:** `GET /api/projects`
- **Query Params:**
  - `search`: Keyword string
  - `status`: `'all' | 'Open' | 'In Progress' | 'Completed'`
  - `category`: Domain filter
  - `scope`: `'Entry' | 'Intermediate' | 'Expert'`
  - `sortBy`: Field name (`createdAt`, `budget`)
  - `order`: `'ASC' | 'DESC'`
  - `page`: Page index
  - `limit`: Items per page

### 2.2 Create Project (Client & Admin)
- **Method:** `POST /api/projects`
- **Headers:** `Authorization: Bearer <client_or_admin_token>`
- **Body:**
```json
{
  "title": "Cloud Microservices Migration",
  "description": "Refactor monolithic codebase into Docker containers.",
  "category": "Cloud & DevOps",
  "scope": "Expert",
  "budget": 4500,
  "deadline": "2026-12-15",
  "skillsRequired": ["Docker", "Kubernetes", "Node.js"]
}
```

### 2.3 Get Project by ID
- **Method:** `GET /api/projects/:id`
- **Response:** Project specifications, client details, proposals count, and competing proposals if requested by project owner or admin.

---

## 3. Bidding & Proposal Endpoints

### 3.1 Submit Proposal (Freelancer Only)
- **Method:** `POST /api/bids`
- **Headers:** `Authorization: Bearer <freelancer_token>`
- **Body:**
```json
{
  "projectId": 1,
  "bidAmount": 4200,
  "deliveryDays": 14,
  "coverLetter": "Extensive experience in production Docker and K8s orchestration."
}
```
*Note: Duplicate bids by the same freelancer on the same project are strictly blocked (400 Bad Request).*

### 3.2 Accept Proposal & Auto-Generate Contract (Client Owner & Admin)
- **Method:** `POST /api/bids/:bidId/accept`
- **Headers:** `Authorization: Bearer <client_token>`
- **Response:** `200 OK` with generated contract and initialized milestones.

---

## 4. Milestone & Deliverable Endpoints

### 4.1 Create Milestone
- **Method:** `POST /api/milestones`
- **Body:**
```json
{
  "contractId": 1,
  "title": "Milestone 1: Container Architecture",
  "amount": 2100,
  "dueDate": "2026-11-20",
  "description": "Deliver Dockerfile and compose manifests."
}
```

### 4.2 Freelancer Submit Deliverables
- **Method:** `POST /api/milestones/:milestoneId/deliverables`
- **Body:**
```json
{
  "submissionNotes": "All services containerized and verified.",
  "fileUrl": "https://github.com/project/pull/1"
}
```

### 4.3 Client Review Deliverables
- **Method:** `POST /api/milestones/deliverables/:deliverableId/review`
- **Body:**
```json
{
  "action": "approve", // or 'revision'
  "feedback": "Deliverables verified against acceptance criteria."
}
```

---

## 5. Payment Escrow Endpoints

### 5.1 List All Payments
- **Method:** `GET /api/payments`
- **Query Params:** `status`: `'all' | 'Pending Review' | 'Approved' | 'Rejected'`

### 5.2 Payment Reviewer Sign-Off
- **Method:** `POST /api/payments/:paymentId/review`
- **Headers:** `Authorization: Bearer <reviewer_or_admin_token>`
- **Body:**
```json
{
  "action": "approve", // or 'reject'
  "reviewerNotes": "Verified deliverable sign-off. Simulated funds released."
}
```

---

## 6. Reports & Executive Analytics Endpoints

- `GET /api/reports/dashboard` — Global platform overview and trend charts.
- `GET /api/reports/project-bids` — Report 1: Project Bids with lowest/average/highest statistics.
- `GET /api/reports/freelancer-performance` — Report 2: Freelancer Performance with completed projects and ratings.
- `GET /api/reports/contract-status` — Report 3: Contract Status with milestone completion percentage.
- `GET /api/reports/payment-milestones` — Report 4: Payment Milestones with reviewer audit details.

