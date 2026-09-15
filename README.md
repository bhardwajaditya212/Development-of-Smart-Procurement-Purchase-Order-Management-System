# Development of Smart Procurement & Purchase Order Management System
> **Infosys Springboard Virtual Internship 7.0 — Final Project Release**  
> **Author & Intern:** Aditya Bhardwaj ([bhardwajaditya212@gmail.com](mailto:bhardwajaditya212@gmail.com))  
> **Repository:** [https://github.com/bhardwajaditya212/Development-of-Smart-Procurement-Purchase-Order-Management-System](https://github.com/bhardwajaditya212/Development-of-Smart-Procurement-Purchase-Order-Management-System)

---

## 📌 Project Overview
The **Enterprise Procurement Management System (EPMS)** is an end-to-end, multi-tier procurement lifecycle automation platform designed to digitize corporate purchase requisitions, hierarchical managerial approvals, financial clearance, vendor fulfillment, real-time shipment dispatch tracking, and employee vendor feedback.

Built with an enterprise-grade **Spring Boot 3.5.4** backend, **MySQL 8.0** relational persistence layer, and a modern **React 19 + Vite + Tailwind CSS** frontend portal, EPMS replaces manual, error-prone paperwork and uncoordinated emails with a unified, transparent, and auditable corporate workflow.

---

## 🏗️ System Architecture & Tech Stack

```
   ┌────────────────────────────────────────────────────────┐
   │          React 19 + Vite Frontend Client               │
   │  (Employee Portal | Approver Hub | Admin | Supplier)   │
   └───────────────────────────┬────────────────────────────┘
                               │ HTTP / REST APIs (Axios)
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │            Spring Boot 3.5.4 Web Tier                  │
   │   - RestControllers (@CrossOrigin, JSON Payloads)      │
   │   - Multi-Level Approval State Engine (L1, L2, L3)     │
   │   - Payment Validation Gate (PO -> Clearing)           │
   │   - Supplier Fulfillment & Dispatch Tracking           │
   │   - JavaMailSender SMTP Notification Engine            │
   └───────────────────────────┬────────────────────────────┘
                               │ JPA / Hibernate ORM
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │             MySQL 8.0 Relational Database              │
   │  (employee_db: 11 Entities, Foreign Keys, Audit Logs)  │
   └────────────────────────────────────────────────────────┘
```

### Core Technologies
- **Backend:** Java 17+, Spring Boot 3.5.4, Spring Data JPA, Spring Mail (SMTP), Lombok / POJO DTOs, HikariCP
- **Frontend:** React 19, Vite 5, Tailwind CSS 3, Lucide Icons, Axios, React Router 7
- **Database:** MySQL 8.0 (`employee_db`)
- **Notifications:** Google SMTP TLS (`JavaMailSender`) with asynchronous, resilient failover

---

## 🔄 End-to-End 6-Stage Procurement Lifecycle

1. **Requisition Inception (Employee Portal):**
   - Employee selects Department, Product Category, Item, and Quantity.
   - Initial state: `PENDING_FOR_APPROVAL`, `currentApprovalLevel = 1`, `paymentStatus = UNPAID`.
   - Real-time automated email alert dispatched to Level 1 Manager.

2. **Hierarchical 3-Level Approval Engine:**
   - **Level 1 (Department Manager):** Validates technical need $	o$ advances to Level 2.
   - **Level 2 (Finance / Budget Approver):** Verifies cost against departmental ceiling $	o$ advances to Level 3.
   - **Level 3 (Procurement Head):** Final executive sanction $	o$ transitions status to `APPROVED` and `paymentStatus` to `PAYMENT_REQUIRED`.

3. **Admin Payment Clearance & Ledger Gate:**
   - Orders with `PAYMENT_REQUIRED` enter the Admin Payment Ledger.
   - Admin executes transaction via UPI, NetBanking, or Corporate Card.
   - Upon clearance, status advances to `PAYMENT_SUCCESSFUL` with unique `TXN-` identifier.
   - **Security Invariant:** Orders CANNOT be accessed or fulfilled by suppliers until payment is verified.

4. **Supplier Fulfillment & Logistics Dispatch:**
   - Supplier views only cleared orders in their portal.
   - Progression: `ACCEPTED` $	o$ `PROCESSING` $	o$ `SHIPPED`.
   - On dispatch, Supplier records carrier partner (e.g. BlueDart Express) and Airway Bill (AWB) tracking number.
   - Live transit email dispatched to employee with tracking details.

5. **Shipment & Delivery Tracking:**
   - Live visual 4-step stepper bar displays real-time milestone progression.
   - Status transitions from `SHIPPED` $	o$ `DELIVERED`.
   - Timestamp and delivery remarks recorded in `delivery` table.

6. **Employee Feedback & Vendor Scorecard:**
   - Once marked `DELIVERED`, employee submits 4-dimensional evaluation:
     - Product Quality Rating (1–5 ⭐)
     - Delivery Timeliness Rating (1–5 ⭐)
     - Supplier Service Rating (1–5 ⭐)
     - Overall Vendor Score & Qualitative Comments
   - Updates Supplier lifetime performance rating in database.

---

## 📂 Project Structure

```
Development-of-Smart-Procurement-Purchase-Order-Management-System/
├── enterpriseprocurementsystem/          # Spring Boot 3.5.4 Backend
│   ├── src/main/java/com/aditya/enterpriseprocurementsystem/
│   │   ├── config/                       # CorsConfig, WebMvc
│   │   ├── controller/                   # 10 REST Controllers
│   │   ├── dto/                          # 21 Data Transfer Objects
│   │   ├── entity/                       # 11 JPA Relational Entities
│   │   ├── enums/                        # RequestStatus State Machine
│   │   ├── repository/                   # 11 Spring Data JPA Repositories
│   │   └── service/                      # Business Logic & MailService
│   ├── src/main/resources/
│   │   ├── application.properties        # App Configuration
│   │   └── application.properties.example # Sanitized Template
│   ├── pom.xml                           # Maven Build Configuration
│   └── mvnw / mvnw.cmd                   # Maven Wrapper
│
├── procurement-frontend/                 # React 19 Frontend
│   ├── src/
│   │   ├── components/layout/            # Navbar, Sidebar
│   │   ├── context/                      # AuthContext (Role State)
│   │   ├── pages/                        # 10 Application Role Pages
│   │   ├── services/                     # api.js (Axios REST Client)
│   │   ├── App.jsx                       # Routing & State Hierarchy
│   │   └── main.jsx                      # Application Entrypoint
│   ├── package.json                      # NPM Dependencies
│   └── vite.config.js                    # Vite Configuration
│
├── .gitignore                            # Root Git Exclusions
└── README.md                             # Project Documentation
```

---

## ⚡ Quick Start & Local Setup

### 1. Prerequisites
- Java Development Kit (JDK 17 or higher)
- Node.js (v18+) and npm
- MySQL Server 8.0+

### 2. Database Initialization
Create the database in MySQL:
```sql
CREATE DATABASE employee_db;
```
*(Spring Boot's `hibernate.ddl-auto=update` will automatically generate all 11 relational tables and constraints upon first startup).*

### 3. Backend Setup
1. Navigate to backend:
   ```bash
   cd enterpriseprocurementsystem
   ```
2. Configure credentials in `src/main/resources/application.properties` (or set environment variables `SPRING_DATASOURCE_PASSWORD` and `SPRING_MAIL_PASSWORD`).
3. Compile and launch:
   ```bash
   ./mvnw spring-boot:run
   ```
   Backend starts on: `http://localhost:8080`

### 4. Frontend Setup
1. Navigate to frontend:
   ```bash
   cd procurement-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Vite dev server:
   ```bash
   npm run dev
   ```
   Frontend runs on: `http://localhost:5173`

---

## 🔑 Default Credentials & Role Accounts

| Role | Email | Password | Access / Purpose |
|------|-------|----------|------------------|
| **Employee** | `aditya@gmail.com` | `Aditya@123` | Raise requisitions, track shipments, submit feedback |
| **Admin (Approver L1/L2/L3)** | `bhardwajaditya212@gmail.com` | `Aditya@123` | Multi-level approval review, payment clearance, ledger |
| **Supplier** | `supplier@techsolutions.com` | `Aditya@123` | Order acceptance, packing, AWB dispatch & delivery |

---

## 📜 REST API Catalog

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/user/login` | Authenticate Employee / Admin / Supplier |
| `POST` | `/request/create` | Submit new procurement requisition |
| `GET` | `/request/user/{userId}` | Fetch user requests with live delivery tracking |
| `POST` | `/request/action` | Multi-level approval action (APPROVE / REJECT) |
| `GET` | `/payment/pending-orders` | Fetch approved orders awaiting payment |
| `POST` | `/payment/process` | Process financial clearance with transaction ledger |
| `GET` | `/supplier/{id}/orders` | Retrieve paid orders assigned to supplier |
| `PUT` | `/supplier/orders/{id}/status` | Update fulfillment state (`SHIPPED`, AWB, carrier) |
| `GET` | `/delivery/by-request/{id}` | Query real-time tracking milestones |
| `POST` | `/feedback/submit` | Submit 4-star vendor performance scorecard |

---

## 🏆 Internship Certification & Acknowledgments
- **Program:** Infosys Springboard Virtual Internship 7.0
- **Domain:** Full-Stack Java Development & Enterprise Systems
- **Author:** Aditya Bhardwaj
- **Submission Mail:** `springboardmentor.manage@gmail.com`
