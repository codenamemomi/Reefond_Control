# REE-FOND Control Dashboard

[![React](https://img.shields.io/badge/React-19.2+-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.0+-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2+-38B2AC.svg)](https://tailwindcss.com/)

> **The Frontend Control Center for REE-FOND.** A highly responsive, secure, and intuitive React application that serves as the primary interface for organizations to manage their tax portfolios, compliance, and refund claims.

## 🌟 Overview

The **Reefond_Control** dashboard connects seamlessly to the REE-FOND backend API. It provides a rich, dynamic user interface for Admins, Accountants, and HR Managers to perform complex tax operations comfortably. Built with performance and usability in mind, the frontend utilizes Vite for lightning-fast HMR and build times.

---

## 🏗️ Architecture & Features

### Core Capabilities

- **Strict Role-Based Access Control (RBAC)**: Secure `ProtectedRoute` wrappers enforce permissions at the component and route level (e.g., `UserPermission.MANAGE_ORG_SETTINGS`, `VIEW_FILINGS`).
- **Multi-Tenant Context Aware**: The global `TenantProvider` seamlessly injects the active organization's context into every API call, ensuring true data isolation on the client-side.
- **Granular API Service Layer**: All backend interactions are abstracted into dedicated modules within `src/api` (e.g., `taxpayers.js`, `billing.js`, `compliance.js`), utilizing `axios` interceptors for token management.

### Dashboard Modules

- **Overview & Analytics**: High-level visual summaries of compliance health and pending tasks.
- **Taxpayer Management**: Create, view, and manage individual or corporate tax profiles.
- **Filings & Refund Cases**: Dedicated pipelines for submitting returns and tracking refund SLAs step-by-step.
- **Compliance Health**: Real-time notifications and scoring breakdowns fetched straight from the backend Rules Engine.
- **Document Vault**: A secure interface for managing tax receipts and proofs.
- **Billing & Usage**: Integrated subscription management and dynamic quota progress bars.

---

## 🛠️ Technology Stack

- **Core**: React 19.2, React Router DOM v7
- **Build Tool**: Vite v7
- **Styling**: Tailwind CSS v4.2 + `clsx` for dynamic class merging
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **State/Auth Management**: React Context (`TenantContext`, `ToastContext`), JWT Decode, JS Cookie

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js 18+ (or 20+ LTS recommended)
- `npm` or `yarn`

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/codenamemomi/Reefond_Control
cd Reefond_Control
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
# Add other frontend-specific configuration flags here
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

### 4. Build for Production

```bash
npm run build
npm run preview # To preview the built static files
```

---

## 📂 Project Structure

```text
Reefond_Control/
├── public/                 # Static assets (favicon, images)
├── src/
│   ├── api/                # Axios instances and endpoint services 
│   ├── assets/             # Brand assets, SVGs
│   ├── components/         # Reusable UI components (layout, forms, cards)
│   ├── context/            # Global React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Route-level components
│   │   ├── dashboard/      # Authenticated views (Filings, Analytics, etc.)
│   │   └── auth/           # Login, Register, Password Reset
│   ├── App.jsx             # Main router definition
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global Tailwind directives
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite build configuration
└── eslint.config.js        # ESLint flat config
```

---

## 🎨 UI/UX Philosophy

Reefond_Control prioritizes a premium, clean aesthetic. We leverage **Tailwind CSS** for consistent, atomic styling and **Framer Motion** for subtle micro-interactions that make the extensive data-tables and forms feel alive and responsive, rather than overwhelming.

---

## 📄 License

This project is proprietary and confidential. Unauthorized copying of this file, via any medium, is strictly prohibited.
