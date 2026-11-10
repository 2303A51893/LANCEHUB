
process.env.NODE_ENV = 'test';

const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const { connectDatabase } = require('../config/database');
const seedDatabase = require('../seeders/seedData');

let adminToken;
let clientToken;
let freelancerToken;
let reviewerToken;

const getId = (document) => document?._id || document?.id;

beforeAll(async () => {
  await connectDatabase();
  await seedDatabase();

  // Login Admin
  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@lancehub.com',
      password: 'Password123!'
    });

  adminToken = adminRes.body.token;

  // Login Client
  const clientRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'client1@techcorp.com',
      password: 'Password123!'
    });

  clientToken = clientRes.body.token;

  // Login Freelancer
  const freelancerRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'freelancer1@dev.com',
      password: 'Password123!'
    });

  freelancerToken = freelancerRes.body.token;

  // Login Payment Reviewer
  const reviewerRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'reviewer@lancehub.com',
      password: 'Password123!'
    });

  reviewerToken = reviewerRes.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('1. Health and Authentication API Tests', () => {
  test('GET /api/health should return status healthy', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  test('POST /api/auth/login with valid credentials should return token and user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@lancehub.com',
        password: 'Password123!'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('admin');
  });

  test('POST /api/auth/login with invalid password should fail', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@lancehub.com',
        password: 'WrongPassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/register should create a new user account', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'New Test Freelancer',
        email: `newfreelancer_${Date.now()}@dev.com`,
        password: 'Password123!',
        role: 'freelancer',
        title: 'Full Stack Engineer',
        hourlyRate: 40
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  test('GET /api/auth/me with valid token should return current user', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe('admin@lancehub.com');
  });
});

describe('2. Role Permission & User Management Tests', () => {
  test('Admin can access GET /api/users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toBeGreaterThan(0);
  });

  test('Non-admin client cannot access GET /api/users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.statusCode).toBe(403);
  });
});

describe('3. Project Management Tests', () => {
  let createdProjectId;

  test('Client can create a new project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        title: 'Automated Kubernetes Scaling Service',
        description: 'Build an automated autoscaling operator in Go and Docker.',
        category: 'Cloud & DevOps',
        scope: 'Expert',
        budget: 3500,
        deadline: '2026-12-30',
        skillsRequired: ['Kubernetes', 'Docker', 'Go']
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.project.title).toBe('Automated Kubernetes Scaling Service');

    createdProjectId = getId(res.body.project);
    expect(createdProjectId).toBeDefined();
  });

  test('Freelancer cannot create a project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${freelancerToken}`)
      .send({
        title: 'Unauthorized Project',
        description: 'Test',
        budget: 1000,
        deadline: '2026-12-31'
      });

    expect(res.statusCode).toBe(403);
  });

  test('GET /api/projects returns list of projects', async () => {
    const res = await request(app).get('/api/projects');

    expect(res.statusCode).toBe(200);
    expect(res.body.projects.length).toBeGreaterThan(0);
  });
});

describe('4. Bidding & Proposal Management Tests', () => {
  let newProjectForBid;
  let testBidId;

  beforeAll(async () => {
    const pRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        title: 'Bidding Test Project',
        description: 'Testing proposals and bid acceptance workflow.',
        category: 'Web Development',
        scope: 'Intermediate',
        budget: 2000,
        deadline: '2026-12-31'
      });

    expect(pRes.statusCode).toBe(201);
    newProjectForBid = pRes.body.project;
  });

  test('Freelancer can submit a bid', async () => {
    const res = await request(app)
      .post('/api/bids')
      .set('Authorization', `Bearer ${freelancerToken}`)
      .send({
        projectId: getId(newProjectForBid),
        bidAmount: 1950,
        deliveryDays: 14,
        coverLetter: 'I am ready to deliver this project with high quality.'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.bid.bidAmount).toBe(1950);

    testBidId = getId(res.body.bid);
    expect(testBidId).toBeDefined();
  });

  test('Duplicate bid by the same freelancer is prevented', async () => {
    const res = await request(app)
      .post('/api/bids')
      .set('Authorization', `Bearer ${freelancerToken}`)
      .send({
        projectId: getId(newProjectForBid),
        bidAmount: 1800,
        deliveryDays: 10,
        coverLetter: 'Duplicate attempt'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Duplicate bids are not allowed');
  });

  test('Client accepts bid and automatically generates contract', async () => {
    const res = await request(app)
      .post(`/api/bids/${testBidId}/accept`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.contract).toBeDefined();
    expect(res.body.contract.contractValue).toBe(1950);
  });
});

describe('5. Milestone & Simulated Payment Workflow Tests', () => {
  test('Payment Reviewer can view all simulated payments', async () => {
    const res = await request(app)
      .get('/api/payments')
      .set('Authorization', `Bearer ${reviewerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.payments).toBeDefined();
  });

  test('Payment Reviewer can approve pending simulated payment', async () => {
    const listRes = await request(app)
      .get('/api/payments?status=Pending Review')
      .set('Authorization', `Bearer ${reviewerToken}`);

    expect(listRes.statusCode).toBe(200);

    if (listRes.body.payments?.length > 0) {
      const paymentToApprove = listRes.body.payments[0];
      const paymentId = getId(paymentToApprove);

      const approveRes = await request(app)
        .post(`/api/payments/${paymentId}/review`)
        .set('Authorization', `Bearer ${reviewerToken}`)
        .send({
          action: 'approve',
          reviewerNotes: 'Test approved.'
        });

      expect(approveRes.statusCode).toBe(200);
      expect(approveRes.body.payment.status).toBe('Approved');
    }
  });
});

describe('6. Reports and Analytics Tests', () => {
  test('GET /api/reports/dashboard returns dashboard overview and charts', async () => {
    const res = await request(app)
      .get('/api/reports/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.overview.totalProjects).toBeGreaterThan(0);
    expect(res.body.charts).toBeDefined();
  });

  test('Report 1: GET /api/reports/project-bids returns report data', async () => {
    const res = await request(app)
      .get('/api/reports/project-bids')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('Report 2: GET /api/reports/freelancer-performance returns report data', async () => {
    const res = await request(app)
      .get('/api/reports/freelancer-performance')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('Report 3: GET /api/reports/contract-status returns report data', async () => {
    const res = await request(app)
      .get('/api/reports/contract-status')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('Report 4: GET /api/reports/payment-milestones returns report data', async () => {
    const res = await request(app)
      .get('/api/reports/payment-milestones')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
