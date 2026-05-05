Car Management System 🚗

A modern, full-stack car management and dealership platform built to streamline the process of buying, selling, and managing vehicle inventory. This application features a high-performance user interface and a robust administrative dashboard for business operations.

🌟 Key Features
👤 Customer-Facing Portal
Dynamic Inventory: Browse available cars with high-quality images and detailed specifications.

Sell Your Car: A dedicated portal for users to submit requests to sell their vehicles to the dealership.

EMI Calculator: Interactive tool for customers to estimate monthly loan repayments.

Responsive Experience: Fully optimized for mobile and desktop using a clean, modern UI.

🔐 Advanced Admin Panel (Protected)
Operational Dashboard: Real-time tracking of pending requests, live inventory, sold units, and total revenue.

Request Workflow: Manage car selling requests with the ability to view, approve, or reject incoming leads.

Inventory Control: Add "offline" cars manually to the system and manage live listings.

Financial Tracking: Integrated expense management with visual charts and detailed logs.

Automated Invoicing: Generate professional PDF Payment Invoices and Final Sales Invoices directly from the browser.

Sales History: Comprehensive logs of all past transactions, customer details (Dealers/Individuals), and sale specifics.

🛠️ Technical Stack
Framework: React 18 with TypeScript.

State Management: TanStack Query (React Query) for efficient server-state handling.

Routing: React Router DOM for seamless navigation and protected admin routes.

Styling: Tailwind CSS & Shadcn UI for a consistent and accessible design system.

API Interaction: Axios with request interceptors for automated JWT Bearer token authentication.

Theme Management: Support for Light and Dark modes via next-themes.

📁 Project Architecture (src/)
Plaintext
src/
├── api/             # Axios configuration and API services
├── assets/          # Static images, car photos, and icons
├── components/      # Shared UI elements (Navbar, Footer, ProtectedRoute)
│   ├── forms/       # Complex form logic for car entries
│   ├── home/        # Landing page sections (Hero, Featured, Team)
│   └── ui/          # Reusable Shadcn UI base components
├── hooks/           # Custom React hooks (use-toast, use-mobile)
├── lib/             # Utility functions and helper classes
├── pages/           # Main application views
│   └── admin/       # Secure Admin modules and Dashboards
├── types.ts         # Global TypeScript definitions and interfaces
├── App.tsx          # Root component with Providers and Routes
└── main.tsx         # Application entry point
🚀 Getting Started
1. Installation
Clone the repository and install the necessary dependencies:

Bash
npm install
2. Configuration
Create a .env file in the root directory and add your backend API URL:

Code snippet
VITE_API_URL=https://your-api-endpoint.com
3. Running Locally
Start the development server:

Bash
npm run dev
4. Build
Prepare the project for production:

Bash
npm run build

🛡️ Security
Admin routes are guarded by a ProtectedRoute component. The system expects a valid JWT token in the localStorage, which is automatically attached to all outgoing API calls via Axios interceptors to ensure secure data handling.