# Kubernetes Deployment Guide
## Freelancer Project Bidding and Contract Management Platform (LanceHub)

### Student & Project Details
- **Student Name:** GUNDA VENKATARAMANA
- **Enrolment Number:** 2303A51893
- **Project Number:** 46

---

## 1. Architecture Overview

The application is deployed on Kubernetes inside a dedicated, isolated namespace named `freelancer-platform`:

```
                                  [ Internet / Browser ]
                                             │
                                             ▼
                               [ NodePort: 30080 / Port 80 ]
                                             │
                                ┌───────────────────────────┐
                                │  frontend-service         │
                                └─────────────┬─────────────┘
                                              │
                         ┌────────────────────┴────────────────────┐
                         ▼                                         ▼
                [ frontend-pod-1 ]                        [ frontend-pod-2 ]
                 (Nginx + React)                           (Nginx + React)
                         │                                         │
                         └────────────────────┬────────────────────┘
                                              │ Reverse Proxy /api/*
                                              ▼
                                ┌───────────────────────────┐
                                │  backend-service (Port 5000)│
                                └─────────────┬─────────────┘
                                              │
                         ┌────────────────────┴────────────────────┐
                         ▼                                         ▼
                [ backend-pod-1 ]                         [ backend-pod-2 ]
                (Express REST API)                        (Express REST API)
                         │                                         │
                         └────────────────────┬────────────────────┘
                                              │ DB: postgres-service:5432
                                              ▼
                                ┌───────────────────────────┐
                                │  postgres-service (5432)  │
                                └─────────────┬─────────────┘
                                              │
                                              ▼
                                    [ postgres-pod ]
                                  (PostgreSQL 16 Alpine)
                                              │
                                              ▼
                                    [ Persistent Volume ]
                                    (postgres-pvc: 2Gi)
```

### Components
1. **Namespace:** `freelancer-platform`
2. **ConfigMap (`lancehub-config`):** Database host, port, name, user, seed flag, and environment.
3. **Secret (`lancehub-secret`):** Encrypted database password and JWT signing secret.
4. **PersistentVolumeClaim (`postgres-pvc`):** 2Gi persistent volume for database data durability across pod restarts.
5. **PostgreSQL Deployment & Service:** Single-pod database with readiness/liveness health probes.
6. **Backend Deployment & Service:** 2-replica scalable Node.js API with health checks and resource limits.
7. **Frontend Deployment & Service:** 2-replica Nginx server serving compiled React Vite bundle with NodePort `30080`.

---

## 2. Prerequisites

Ensure you have installed:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (with Kubernetes enabled under Settings -> Kubernetes)
  *OR* [Minikube](https://minikube.sigs.k8s.io/docs/start/) (`minikube start`)
- [kubectl CLI](https://kubernetes.io/docs/tasks/tools/) (`kubectl version --client`)

---

## 3. Step 1: Build Local Docker Images

Before applying the manifests, build the container images locally:

```bash
# 1. Build Backend Image
docker build -t lancehub-backend:latest ./backend

# 2. Build Frontend Image
docker build -t lancehub-frontend:latest ./frontend
```

*(Note for Minikube users: run `eval $(minikube docker-env)` before building, or use `minikube image load lancehub-backend:latest` and `minikube image load lancehub-frontend:latest`)*

---

## 4. Step 2: Deploy to Kubernetes

Deploy all resources to the `freelancer-platform` namespace in ordered sequence:

```bash
# 1. Create Dedicated Namespace
kubectl apply -f k8s/namespace.yaml

# 2. Apply ConfigMap and Secret
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# 3. Create Storage and Database
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml

# 4. Deploy Backend REST API (Replicas: 2)
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# 5. Deploy Frontend Web Application (Replicas: 2)
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

*Or deploy all resources at once:*
```bash
kubectl apply -f k8s/
```

---

## 5. Step 3: Verification & Inspection

### Check All Resources in Namespace
```bash
kubectl get all -n freelancer-platform
```

Expected output:
```
NAME                                       READY   STATUS    RESTARTS   AGE
pod/backend-deployment-64d84f98b6-2q9w8   1/1     Running   0          45s
pod/backend-deployment-64d84f98b6-g7x9z   1/1     Running   0          45s
pod/frontend-deployment-55bd676885-45m1n  1/1     Running   0          30s
pod/frontend-deployment-55bd676885-v82kd  1/1     Running   0          30s
pod/postgres-deployment-78ff4d76fb-9b2kx  1/1     Running   0          60s

NAME                       TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE
service/backend-service    ClusterIP   10.96.120.45     <none>        5000/TCP         45s
service/frontend-service   NodePort    10.96.210.88     <none>        80:30080/TCP     30s
service/postgres-service   ClusterIP   10.96.15.112     <none>        5432/TCP         60s

NAME                                  READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/backend-deployment    2/2     2            2           45s
deployment.apps/frontend-deployment   2/2     2            2           30s
deployment.apps/postgres-deployment   1/1     1            1           60s
```

### Check Persistent Volume Claim Status
```bash
kubectl get pvc -n freelancer-platform
```
Expected: `STATUS: Bound`

### Check Backend Health Endpoint
```bash
kubectl exec -n freelancer-platform deploy/backend-deployment -c backend -- wget -qO- http://localhost:5000/api/health
```

---

## 6. Accessing the Application

### Option A: Docker Desktop (NodePort)
Open your browser and navigate to:
```
http://localhost:30080
```

### Option B: Port Forwarding (Direct)
```bash
# Port-forward the frontend service to port 8080
kubectl port-forward -n freelancer-platform svc/frontend-service 8080:80
```
Then visit: `http://localhost:8080`

---

## 7. Verifying Database Persistence

1. Log into the application and create a test project or register a new user.
2. Delete the active PostgreSQL pod to simulate a hardware/node failure:
   ```bash
   kubectl delete pod -n freelancer-platform -l tier=database
   ```
3. Kubernetes will automatically start a replacement pod:
   ```bash
   kubectl get pods -n freelancer-platform -l tier=database -w
   ```
4. Refresh your browser at `http://localhost:30080`. All projects, proposals, contracts, and user records remain intact due to the persistent volume claim (`postgres-pvc`).

---

## 8. Teardown / Cleanup

To delete all resources and free allocated storage:
```bash
kubectl delete namespace freelancer-platform
```

