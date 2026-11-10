# Kubernetes Cluster Deployment & Operations Guide
## Freelancer Project Bidding and Contract Management Platform

- **Student Name:** GUNDA VENKATARAMANA
- **Enrolment Number:** 2303A51893
- **Project Number:** 46
- **Kubernetes Namespace:** `freelancer-platform`

---

## 1. Directory Structure

```
k8s/
├── namespace.yaml             # Dedicated namespace 'freelancer-platform'
├── configmap.yaml             # Database and application environment variables
├── secret.yaml                # Opaque secrets (Database password, JWT secret)
├── postgres-pvc.yaml          # 2Gi PersistentVolumeClaim for PostgreSQL storage
├── postgres-deployment.yaml   # PostgreSQL 16 Deployment with health probes
├── postgres-service.yaml      # PostgreSQL ClusterIP Service (Port 5432)
├── backend-deployment.yaml    # Node.js API Deployment (2 Replicas, Port 5000)
├── backend-service.yaml       # Backend ClusterIP Service (Port 5000)
├── frontend-deployment.yaml   # Nginx + React Deployment (2 Replicas, Port 80)
├── frontend-service.yaml      # Frontend NodePort Service (Port 80 -> NodePort 30080)
└── README.md                  # Comprehensive Kubernetes operator documentation
```

---

## 2. Manifest Breakdown & Configuration Details

### 2.1 Namespace (`k8s/namespace.yaml`)
Isolates all pods, services, secrets, and volumes in the `freelancer-platform` namespace to prevent name collisions and enable clean resource cleanup.

### 2.2 Storage: PersistentVolumeClaim (`k8s/postgres-pvc.yaml`)
- **Storage Request:** `2Gi`
- **Access Mode:** `ReadWriteOnce`
- **Mount Path:** `/var/lib/postgresql/data`
- **Durability:** Data survives pod crashes, rolling updates, and node migrations.

### 2.3 PostgreSQL Database (`k8s/postgres-deployment.yaml` & `k8s/postgres-service.yaml`)
- **Image:** `postgres:16-alpine`
- **Service Name:** `postgres-service` on port `5432`
- **Probes:**
  - `readinessProbe`: runs `pg_isready -U postgres -d freelancer_db` every 5s.
  - `livenessProbe`: runs `pg_isready -U postgres -d freelancer_db` every 10s.

### 2.4 Backend REST API (`k8s/backend-deployment.yaml` & `k8s/backend-service.yaml`)
- **Replicas:** 2
- **Image:** `lancehub-backend:latest`
- **Port:** `5000`
- **Service Name:** `backend-service` (ClusterIP: `5000`)
- **Probes:**
  - `readinessProbe`: `HTTP GET /api/health`
  - `livenessProbe`: `HTTP GET /api/health`
- **Resource Constraints:**
  - Request: `100m CPU`, `128Mi Memory`
  - Limit: `500m CPU`, `256Mi Memory`

### 2.5 Frontend Web Client (`k8s/frontend-deployment.yaml` & `k8s/frontend-service.yaml`)
- **Replicas:** 2
- **Image:** `lancehub-frontend:latest`
- **Port:** `80` (Nginx)
- **Service Type:** `NodePort`
- **Exposed Port:** `30080` (accessible at `http://localhost:30080`)
- **Nginx Reverse Proxy:** Routes `/api/*` seamlessly to `http://backend-service:5000/api/*`.

---

## 3. Step-by-Step Deployment Commands

```bash
# 1. Create the dedicated namespace
kubectl apply -f k8s/namespace.yaml

# 2. Deploy configuration maps and secrets
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# 3. Provision persistent database storage and PostgreSQL pod
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml

# 4. Deploy scalable backend microservices
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# 5. Deploy frontend user interface
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

---

## 4. Verification and Diagnostic Commands

```bash
# View all workloads in the namespace
kubectl get all -n freelancer-platform

# Check Pod rollout status
kubectl rollout status deployment/backend-deployment -n freelancer-platform
kubectl rollout status deployment/frontend-deployment -n freelancer-platform

# Inspect logs of backend pod
kubectl logs -n freelancer-platform -l tier=backend --tail=50

# Check PVC binding
kubectl get pvc -n freelancer-platform
```

---

## 5. Teardown
```bash
kubectl delete namespace freelancer-platform
```

