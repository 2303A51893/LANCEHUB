
const {
  User,
  FreelancerProfile,
  ClientProfile,
  Project,
  Bid,
  Contract,
  Milestone,
  Deliverable,
  Payment,
  Feedback,
  Notification
} = require('../models');

async function seedDatabase() {
  try {
    console.log('[Seeder] Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      FreelancerProfile.deleteMany({}),
      ClientProfile.deleteMany({}),
      Project.deleteMany({}),
      Bid.deleteMany({}),
      Contract.deleteMany({}),
      Milestone.deleteMany({}),
      Deliverable.deleteMany({}),
      Payment.deleteMany({}),
      Feedback.deleteMany({}),
      Notification.deleteMany({})
    ]);

    const defaultPassword = 'Password123!';

    // 1. Admin and Payment Reviewer
    const admin = await User.create({
      name: 'Gunda Venkataramana (Admin)',
      email: 'admin@lancehub.com',
      password: defaultPassword,
      role: 'admin',
      phone: '+1-555-0101',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    });

    const reviewer = await User.create({
      name: 'Sarah Jenkins (Finance Reviewer)',
      email: 'reviewer@lancehub.com',
      password: defaultPassword,
      role: 'payment_reviewer',
      phone: '+1-555-0102',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'
    });

    // 2. Clients
    const client1 = await User.create({
      name: 'Marcus Vance',
      email: 'client1@techcorp.com',
      password: defaultPassword,
      role: 'client',
      phone: '+1-555-0103',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    });

    await ClientProfile.create({
      userId: client1._id,
      companyName: 'TechCorp Global Ltd.',
      industry: 'Enterprise Software & Cloud',
      website: 'https://techcorp-global.example.com',
      bio: 'Leading multinational enterprise cloud systems provider.',
      totalSpent: 12500,
      totalProjectsPosted: 4
    });

    const client2 = await User.create({
      name: 'Elena Rostova',
      email: 'client2@fintech.io',
      password: defaultPassword,
      role: 'client',
      phone: '+1-555-0104',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
    });

    await ClientProfile.create({
      userId: client2._id,
      companyName: 'Apex Fintech Solutions',
      industry: 'Financial Technology',
      website: 'https://apexfintech.example.com',
      bio: 'Pioneering algorithmic trading and blockchain banking solutions.',
      totalSpent: 8400,
      totalProjectsPosted: 3
    });

    const client3 = await User.create({
      name: 'Dr. Jonathan Reed',
      email: 'client3@healthplus.org',
      password: defaultPassword,
      role: 'client',
      phone: '+1-555-0105',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
    });

    await ClientProfile.create({
      userId: client3._id,
      companyName: 'HealthPlus Digital Health',
      industry: 'Healthcare Technology',
      website: 'https://healthplus.example.org',
      bio: 'Delivering telehealth and medical AI diagnostics.',
      totalSpent: 6200,
      totalProjectsPosted: 3
    });

    // 3. Freelancers
    const freelancerData = [
      {
        name: 'Alex Chen',
        email: 'freelancer1@dev.com',
        phone: '+1-555-0111',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        title: 'Senior Full Stack & Cloud Architect',
        bio: '10+ years experience building scalable enterprise distributed systems and React/Node microservices.',
        hourlyRate: 65,
        skills: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes', 'TypeScript'],
        portfolioUrl: 'https://alexchen.dev',
        githubUrl: 'https://github.com/alexchen-dev',
        rating: 4.9,
        totalReviews: 8,
        completedProjectsCount: 9,
        totalEarnings: 18500,
        onTimeDeliveryRate: 99.0
      },
      {
        name: 'Priya Sharma',
        email: 'freelancer2@dev.com',
        phone: '+1-555-0112',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        title: 'React & UI/UX Frontend Specialist',
        bio: 'Crafting pixel-perfect, responsive web applications using React, Tailwind CSS, and Next.js.',
        hourlyRate: 50,
        skills: ['React', 'Tailwind CSS', 'Vite', 'JavaScript', 'Figma', 'Redux'],
        portfolioUrl: 'https://priyasharma.design',
        githubUrl: 'https://github.com/priyasharma-ui',
        rating: 4.8,
        totalReviews: 6,
        completedProjectsCount: 7,
        totalEarnings: 11200,
        onTimeDeliveryRate: 98.2
      },
      {
        name: 'David Miller',
        email: 'freelancer3@dev.com',
        phone: '+1-555-0113',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        title: 'Python, FastAPI & AI/ML Engineer',
        bio: 'Specializing in LLM agent pipelines, predictive modeling, and high-performance REST APIs.',
        hourlyRate: 60,
        skills: ['Python', 'FastAPI', 'PyTorch', 'Docker', 'PostgreSQL', 'LangChain'],
        portfolioUrl: 'https://davidmiller.ai',
        githubUrl: 'https://github.com/davidmiller-ai',
        rating: 4.7,
        totalReviews: 5,
        completedProjectsCount: 5,
        totalEarnings: 9800,
        onTimeDeliveryRate: 96.5
      },
      {
        name: 'Sophia Garcia',
        email: 'freelancer4@dev.com',
        phone: '+1-555-0114',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        title: 'Mobile App Developer (Flutter & React Native)',
        bio: 'Native and cross-platform mobile developer with over 20 published applications on App Store and Google Play.',
        hourlyRate: 45,
        skills: ['Flutter', 'React Native', 'iOS', 'Android', 'Firebase', 'REST API'],
        portfolioUrl: 'https://sophiagarcia.app',
        githubUrl: 'https://github.com/sophiagarcia-dev',
        rating: 4.9,
        totalReviews: 7,
        completedProjectsCount: 8,
        totalEarnings: 13400,
        onTimeDeliveryRate: 99.5
      },
      {
        name: "Liam O'Connor",
        email: 'freelancer5@dev.com',
        phone: '+1-555-0115',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
        title: 'DevOps & Kubernetes Cloud Specialist',
        bio: 'Certified Kubernetes Administrator (CKA). Terraform, AWS, Docker Compose, Helm, CI/CD automation.',
        hourlyRate: 70,
        skills: ['Kubernetes', 'Docker', 'CI/CD', 'GitHub Actions', 'Terraform', 'PostgreSQL'],
        portfolioUrl: 'https://liamdevops.io',
        githubUrl: 'https://github.com/liamdevops',
        rating: 5.0,
        totalReviews: 4,
        completedProjectsCount: 4,
        totalEarnings: 8200,
        onTimeDeliveryRate: 100.0
      }
    ];

    const freelancers = [];

    for (const data of freelancerData) {
      const user = await User.create({
        name: data.name,
        email: data.email,
        password: defaultPassword,
        role: 'freelancer',
        phone: data.phone,
        avatar: data.avatar
      });

      const {
        name,
        email,
        phone,
        avatar,
        ...profileData
      } = data;

      const profile = await FreelancerProfile.create({
        userId: user._id,
        ...profileData
      });

      freelancers.push(user);
    }

    const [f1, f2, f3, f4, f5] = freelancers;

    // 4. Projects
    const projectData = [
      {
        clientId: client1._id,
        title: 'Enterprise Cloud Migration & Microservices Architecture',
        description: 'Refactor legacy monolithic Java application into containerized Node.js and Go microservices deployed on AWS EKS with zero downtime.',
        category: 'Cloud & DevOps',
        scope: 'Expert',
        budget: 5000,
        deadline: '2026-12-15',
        skillsRequired: ['Docker', 'Kubernetes', 'Node.js', 'PostgreSQL', 'AWS'],
        status: 'In Progress',
        bidsCount: 3
      },
      {
        clientId: client2._id,
        title: 'AI-Powered Customer Support Chatbot with LLM',
        description: 'Develop an intelligent conversational assistant integrated with Zendesk and internal knowledge base using embeddings and streaming response UI.',
        category: 'AI & Machine Learning',
        scope: 'Expert',
        budget: 3500,
        deadline: '2026-11-30',
        skillsRequired: ['Python', 'FastAPI', 'React', 'PostgreSQL', 'LangChain'],
        status: 'Open',
        bidsCount: 2
      },
      {
        clientId: client1._id,
        title: 'NextGen E-Commerce Multi-Vendor Marketplace',
        description: 'Build a blazing fast multi-vendor marketplace frontend with responsive cart, checkout, vendor dashboards, and SEO SSR capabilities.',
        category: 'Web Development',
        scope: 'Intermediate',
        budget: 4200,
        deadline: '2026-12-01',
        skillsRequired: ['React', 'Tailwind CSS', 'Vite', 'Node.js', 'PostgreSQL'],
        status: 'Open',
        bidsCount: 3
      },
      {
        clientId: client3._id,
        title: 'Cross-Platform Telehealth Mobile Application',
        description: 'HIPAA-compliant telemedicine application supporting video consultations, prescription tracking, and biometric authentication for patients.',
        category: 'Mobile Apps',
        scope: 'Expert',
        budget: 4800,
        deadline: '2026-12-20',
        skillsRequired: ['Flutter', 'React Native', 'WebRTC', 'iOS', 'Android'],
        status: 'Completed',
        bidsCount: 2
      },
      {
        clientId: client2._id,
        title: 'Financial Fraud Detection Real-time Dashboard',
        description: 'Interactive analytics dashboard displaying live transactional alerts, anomaly detection metrics, and geocoded risk maps for banking analysts.',
        category: 'Data Analytics',
        scope: 'Intermediate',
        budget: 2800,
        deadline: '2026-12-05',
        skillsRequired: ['React', 'Recharts', 'Node.js', 'PostgreSQL'],
        status: 'Open',
        bidsCount: 2
      },
      {
        clientId: client1._id,
        title: 'Automated CI/CD Pipeline & Kubernetes Orchestration',
        description: 'Set up end-to-end GitHub Actions CI/CD pipelines, container registries, automated testing, and rolling updates to Kubernetes clusters.',
        category: 'Cloud & DevOps',
        scope: 'Intermediate',
        budget: 2400,
        deadline: '2026-11-25',
        skillsRequired: ['GitHub Actions', 'Kubernetes', 'Docker', 'DevOps'],
        status: 'In Progress',
        bidsCount: 1
      },
      {
        clientId: client3._id,
        title: 'Smart IoT Medical Device Management Portal',
        description: 'Web dashboard for hospital biomedical technicians to track IoT telemetry, battery life, calibration schedules, and firmware updates.',
        category: 'Web Development',
        scope: 'Intermediate',
        budget: 3100,
        deadline: '2026-12-28',
        skillsRequired: ['React', 'Node.js', 'WebSockets', 'PostgreSQL'],
        status: 'Open',
        bidsCount: 1
      },
      {
        clientId: client2._id,
        title: 'Decentralized Smart Contract Escrow System',
        description: 'Design and audit Solidity smart contracts for automated milestone escrow releases with multi-signature arbitration and web3 frontend.',
        category: 'Blockchain',
        scope: 'Expert',
        budget: 4500,
        deadline: '2026-12-10',
        skillsRequired: ['Solidity', 'React', 'TypeScript', 'Node.js'],
        status: 'Open',
        bidsCount: 0
      },
      {
        clientId: client1._id,
        title: 'High-Performance API Gateway with OAuth2 & Rate Limiting',
        description: 'Build an ultrafast API reverse proxy with token introspection, distributed Redis rate limiting, and Prometheus telemetry metrics.',
        category: 'Backend & APIs',
        scope: 'Expert',
        budget: 2900,
        deadline: '2026-11-28',
        skillsRequired: ['Node.js', 'PostgreSQL', 'Docker', 'REST API'],
        status: 'Open',
        bidsCount: 1
      },
      {
        clientId: client3._id,
        title: 'Corporate Brand Redesign & Responsive Design System',
        description: 'Comprehensive UI component library in Tailwind CSS and Storybook with WCAG AAA accessibility compliance and dark mode support.',
        category: 'Design & UI/UX',
        scope: 'Entry',
        budget: 1800,
        deadline: '2026-12-12',
        skillsRequired: ['Tailwind CSS', 'React', 'Figma', 'UI/UX'],
        status: 'Open',
        bidsCount: 2
      }
    ];

    const projects = await Project.insertMany(projectData);
    const [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10] = projects;

    // 5. Bids
    const bid1_p1 = await Bid.create({
      projectId: p1._id,
      freelancerId: f1._id,
      bidAmount: 4800,
      deliveryDays: 25,
      coverLetter: 'I have architected 15+ Kubernetes clusters for enterprise clients. I can deliver full zero-downtime migration with automated blue-green deployments.',
      status: 'Accepted'
    });

    await Bid.create({
      projectId: p1._id,
      freelancerId: f5._id,
      bidAmount: 5100,
      deliveryDays: 30,
      coverLetter: 'As a Certified Kubernetes Administrator, I specialize in production cloud migrations with strict security compliance.',
      status: 'Rejected'
    });

    await Bid.create({
      projectId: p1._id,
      freelancerId: f3._id,
      bidAmount: 4950,
      deliveryDays: 28,
      coverLetter: 'Expertise in microservices containerization and robust PostgreSQL optimizations for enterprise workloads.',
      status: 'Rejected'
    });

    await Bid.create({
      projectId: p2._id,
      freelancerId: f3._id,
      bidAmount: 3400,
      deliveryDays: 20,
      coverLetter: 'I have built multiple production LLM agents using FastAPI and LangChain with custom vector embeddings and streaming chat UI.',
      status: 'Pending'
    });

    await Bid.create({
      projectId: p2._id,
      freelancerId: f1._id,
      bidAmount: 3500,
      deliveryDays: 22,
      coverLetter: 'Can integrate seamlessly with your backend API and deliver modern React streaming chat client with full test coverage.',
      status: 'Pending'
    });

    await Bid.create({
      projectId: p3._id,
      freelancerId: f2._id,
      bidAmount: 4000,
      deliveryDays: 21,
      coverLetter: 'I specialize in high-converting modern React e-commerce interfaces with sub-second page loads and mobile responsiveness.',
      status: 'Pending'
    });

    await Bid.create({
      projectId: p3._id,
      freelancerId: f4._id,
      bidAmount: 4200,
      deliveryDays: 25,
      coverLetter: 'Can deliver both responsive web frontend and PWA mobile experience for your marketplace.',
      status: 'Pending'
    });

    const bid1_p4 = await Bid.create({
      projectId: p4._id,
      freelancerId: f4._id,
      bidAmount: 4700,
      deliveryDays: 35,
      coverLetter: 'Extensive healthcare application portfolio. Experienced in WebRTC encrypted video streaming and medical compliance.',
      status: 'Accepted'
    });

    const bid1_p6 = await Bid.create({
      projectId: p6._id,
      freelancerId: f5._id,
      bidAmount: 2300,
      deliveryDays: 14,
      coverLetter: 'Can configure complete GitHub Actions workflows, multi-stage Docker builds, and Helm charts for your K8s cluster.',
      status: 'Accepted'
    });

    await Bid.create({
      projectId: p10._id,
      freelancerId: f2._id,
      bidAmount: 1750,
      deliveryDays: 12,
      coverLetter: 'Tailwind CSS specialist with a keen eye for typography, spacing, and design tokens. Will deliver a complete Storybook suite.',
      status: 'Pending'
    });

    // 6. Contracts
    const c1 = await Contract.create({
      projectId: p1._id,
      clientId: client1._id,
      freelancerId: f1._id,
      bidId: bid1_p1._id,
      contractValue: 4800,
      status: 'Active',
      startDate: '2026-11-01',
      endDate: '2026-12-05',
      terms: 'Delivery of complete microservices migration, Docker configurations, and Kubernetes manifests.'
    });

    const c2 = await Contract.create({
      projectId: p4._id,
      clientId: client3._id,
      freelancerId: f4._id,
      bidId: bid1_p4._id,
      contractValue: 4700,
      status: 'Completed',
      startDate: '2026-10-01',
      endDate: '2026-11-04',
      terms: 'Cross-platform telehealth app delivery on iOS and Android test environments with WebRTC.'
    });

    const c3 = await Contract.create({
      projectId: p6._id,
      clientId: client1._id,
      freelancerId: f5._id,
      bidId: bid1_p6._id,
      contractValue: 2300,
      status: 'Active',
      startDate: '2026-11-05',
      endDate: '2026-11-20',
      terms: 'CI/CD pipeline with GitHub Actions, Helm charts, and automated testing.'
    });

    // 7. Milestones
    const m1_c1 = await Milestone.create({
      contractId: c1._id,
      title: 'Milestone 1: Containerization & Dockerfile Architecture',
      description: 'Dockerize existing backend and database services with multi-stage production builds.',
      amount: 2400,
      dueDate: '2026-11-12',
      status: 'Approved'
    });

    const m2_c1 = await Milestone.create({
      contractId: c1._id,
      title: 'Milestone 2: Kubernetes Manifests & Cluster Deployment',
      description: 'Deploy services, secrets, PVCs, and ingress onto Kubernetes cluster with autoscaling.',
      amount: 2400,
      dueDate: '2026-12-05',
      status: 'Deliverable Submitted'
    });

    // 8. Deliverables
    await Deliverable.create({
      milestoneId: m1_c1._id,
      freelancerId: f1._id,
      fileUrl: 'https://github.com/techcorp/microservices/tree/v1.0.0',
      submissionNotes: 'All services containerized with multi-stage builds. docker-compose verified locally.',
      status: 'Accepted',
      clientFeedback: 'Excellent work, builds are lightweight and secure.'
    });

    await Deliverable.create({
      milestoneId: m2_c1._id,
      freelancerId: f1._id,
      fileUrl: 'https://github.com/techcorp/k8s-manifests/pull/4',
      submissionNotes: 'Kubernetes manifests, HPA, and ingress configurations ready for review.',
      status: 'Submitted'
    });

    // 9. Payments
    await Payment.create({
      milestoneId: m1_c1._id,
      contractId: c1._id,
      clientId: client1._id,
      freelancerId: f1._id,
      amount: 2400,
      status: 'Pending Review',
      transactionId: 'TXN-2026-1101-9921',
      reviewerNotes: null
    });

    const m1_c2 = await Milestone.create({
      contractId: c2._id,
      title: 'Milestone 1: Mobile UI & Video Consultation MVP',
      description: 'Deliver responsive mobile screens and WebRTC peer connection.',
      amount: 2350,
      dueDate: '2026-10-18',
      status: 'Paid'
    });

    const m2_c2 = await Milestone.create({
      contractId: c2._id,
      title: 'Milestone 2: Biometrics, Encryption & Store Release Build',
      description: 'Complete HIPAA audit compliance, push notifications, and release binaries.',
      amount: 2350,
      dueDate: '2026-11-04',
      status: 'Paid'
    });

    await Payment.create({
      milestoneId: m1_c2._id,
      contractId: c2._id,
      clientId: client3._id,
      freelancerId: f4._id,
      amount: 2350,
      status: 'Approved',
      reviewerId: reviewer._id,
      reviewedAt: '2026-10-20T10:00:00Z',
      reviewerNotes: 'Verified deliverable acceptance and escrow funds release. Approved.',
      transactionId: 'TXN-2026-1020-4102'
    });

    await Payment.create({
      milestoneId: m2_c2._id,
      contractId: c2._id,
      clientId: client3._id,
      freelancerId: f4._id,
      amount: 2350,
      status: 'Approved',
      reviewerId: reviewer._id,
      reviewedAt: '2026-11-05T14:30:00Z',
      reviewerNotes: 'Final project milestone verified and signed off. Disbursed.',
      transactionId: 'TXN-2026-1105-8834'
    });

    await Milestone.create({
      contractId: c3._id,
      title: 'Milestone 1: GitHub Actions CI Workflow',
      description: 'Build test and lint pipelines for pull requests.',
      amount: 1150,
      dueDate: '2026-11-12',
      status: 'In Progress'
    });

    await Milestone.create({
      contractId: c3._id,
      title: 'Milestone 2: CD Release & K8s Deploy Pipeline',
      description: 'Helm chart release and automated staging deployment.',
      amount: 1150,
      dueDate: '2026-11-20',
      status: 'Pending'
    });

    // 10. Feedback
    await Feedback.create({
      contractId: c2._id,
      clientId: client3._id,
      freelancerId: f4._id,
      rating: 5,
      comment: 'Sophia was absolutely phenomenal! Delivered the telemedicine app ahead of schedule, solved all WebRTC edge cases, and communicated daily. Highly recommended!'
    });

    // 11. Notifications
    await Notification.create([
      {
        userId: reviewer._id,
        title: 'Simulated Payment Review Needed',
        message: 'Milestone 1 for "Enterprise Cloud Migration" was approved by client. Please review payment request of $2,400.',
        type: 'payment',
        link: '/payments'
      },
      {
        userId: client1._id,
        title: 'Deliverable Submitted',
        message: 'Alex Chen submitted deliverables for Milestone 2: Kubernetes Manifests.',
        type: 'milestone',
        link: `/contracts/${c1._id}`
      },
      {
        userId: f1._id,
        title: 'Milestone Approved',
        message: 'Your deliverable for Milestone 1 was approved. Payment of $2,400 is in review.',
        type: 'milestone',
        link: `/contracts/${c1._id}`
      }
    ]);

    console.log('[Seeder] Database seeding completed successfully!');
    console.log('[Seeder] Created 1 Admin, 1 Reviewer, 3 Clients, 5 Freelancers, 10 Projects and related sample records.');
  } catch (error) {
    console.error('[Seeder] Error during database seeding:', error);
    throw error;
  }
}

if (require.main === module) {
  const { connectDatabase } = require('../config/database');

  connectDatabase()
    .then(seedDatabase)
    .then(() => {
      console.log('[Seeder] Execution finished.');
      process.exit(0);
    })
    .catch(() => process.exit(1));
}

module.exports = seedDatabase;
