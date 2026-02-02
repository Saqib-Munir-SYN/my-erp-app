# 🚀 ERP Pro - Complete Quick Start Guide

**Version**: 1.0.0 | **Status**: ✅ Production Ready

---

## 📋 Table of Contents
1. [Prerequisites & Installation](#-prerequisites--installation)
2. [Running the App](#-running-the-app)
3. [Module Overview](#-module-overview)
4. [Authentication](#-authentication)
5. [Testing](#-testing)
6. [Deployment](#-deployment)

---

## ✅ Prerequisites & Installation

### System Requirements
- **Node.js**: 16+ or higher
- **npm**: 8+ or yarn 3+
- **OS**: Windows, macOS, or Linux
- **Browser**: Modern browser (Chrome, Firefox, Safari, Edge)

### Step 1: Clone & Install

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd my-erp-app

# Install dependencies
npm install

# Create environment file (optional, for future backend integration)
cp .env.example .env.local
```

### Step 2: Verify Installation

```bash
# Check Node version
node --version  # Should be 16+

# Check npm version
npm --version   # Should be 8+

# Check installed packages
npm list react  # Should show React 19.2.0
```

---

## ▶️ Running the App

### Development Mode

```bash
# Start development server with hot reload
npm run dev

# Output: ➜ Local:   http://localhost:5173/
# Press 'q' to quit
```

The app opens at `http://localhost:5173` with:
- ✅ Live reloading
- ✅ Error overlay
- ✅ Fast refresh (state preservation)

### Production Build

```bash
# Build for production (optimized)
npm run build

# Output: dist/ folder created with optimized assets
```

### Preview Production Build

```bash
# Preview the production build locally
npm run preview

# Output: http://localhost:4173/
```

### Linting & Quality Check

```bash
# Run ESLint to check code quality
npm run lint

# Check for unused variables, style issues, etc.
```

---

## 🔐 Authentication

### Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |

### Authentication Flow

1. **First Load**: Redirects to `/login` page
2. **Login**: Enter credentials or continue as guest
3. **Success**: Redirected to Dashboard (`/`)
4. **Session**: Persists for 24 hours in localStorage
5. **Logout**: Button in top-right corner of app

### Session Management

```javascript
// Session stored in localStorage as 'erp_session'
// Session expires after 24 hours
// Session data: { user, timestamp, remember }
```

### Guest Mode

- Click **"Continue as Guest"** on login page
- Limited access without authentication
- Perfect for demos or testing
- No data saved for guests

---

## 📱 Complete Module Overview

### 1. Dashboard (`/`)

**Features:**
- 📊 **KPI Cards**: Revenue, Collections, Pending, Customers, Orders
- 📈 **Sales Trend Chart**: 6-month sales and collection history
- 📊 **Revenue Breakdown**: Invoice status distribution (pie chart)
- 📦 **Inventory Status**: Product distribution chart
- 🔔 **Alerts**: Low stock warnings, overdue invoices
- 🔍 **Search Integration**: Dashboard updates with global search

**Metrics Calculated:**
```
- Total Revenue: Sum of all invoice totals
- Amount Collected: Sum of paid invoices
- Pending Amount: Revenue - Collected
- Low Stock Products: Products with stock < 10
- Overdue Invoices: Invoices past due date
```

---

### 2. Inventory (`/inventory`)

**Features:**
- ✅ **CRUD Operations**: Create, read, update, delete products
- 📦 **Stock Tracking**: Real-time inventory levels
- 🎯 **Status Indicators**:
  - 🟢 In Stock (stock > 10)
  - 🟡 Low Stock (stock 1-10)
  - 🔴 Out of Stock (stock = 0)
- 🔍 **Search**: Filter by name or SKU
- 📄 **Pagination**: 10 items per page
- 💾 **Local Storage**: Data persists across refreshes

**Quick Actions:**
```
1. Click "+ Add Product" to create new product
2. Enter product details (name, SKU, stock, price)
3. Click "Save" to store locally
4. Use search bar to find products
5. Click edit icon to modify
6. Click delete icon to remove
```

**Data Stored:**
```javascript
{
  id: "prod-001",
  name: "Product Name",
  sku: "SKU-001",
  stock: 25,
  price: 99.99,
  createdAt: "2024-01-15T10:30:00Z"
}
```

---

### 3. Customers (`/customers`)

**Features:**
- 👥 **Directory Management**: Complete customer database
- 📧 **Contact Tracking**: Email, phone, address
- ✅ **Status Management**: Active/Inactive tracking
- 🔍 **Search**: Filter by name or email
- 📄 **Pagination**: 10 items per page
- 🔗 **Order History**: View orders from this customer

**Quick Actions:**
```
1. Click "+ Add Customer" to create new customer
2. Fill in customer details (name, email, phone, address)
3. Select status (Active/Inactive)
4. Click "Save" to store
5. Use search to find customers quickly
6. Edit or delete as needed
```

**Data Stored:**
```javascript
{
  id: "cust-001",
  name: "John Doe",
  email: "john@example.com",
  phone: "(555) 123-4567",
  address: "123 Main St, City, State",
  status: "Active",
  createdAt: "2024-01-15T10:30:00Z"
}
```

---

### 4. Products (`/products`)

**Features:**
- 🛍️ **Catalog Browse**: View all available products
- 💰 **Pricing**: Real-time product pricing
- 📊 **Product Details**: SKU, descriptions, specifications
- 🔄 **Retry Logic**: Failed loads can be retried
- 🌐 **Mock API**: Currently uses Postman Mock API

**Data Source:**
- Mock API: `https://ea723e8f-f1fe-4042-94ff-dd5a55eed317.mock.pstmn.io/products`
- Will switch to your backend API after integration

---

### 5. Orders (`/orders`)

**Features:**
- 📦 **Order Management**: Create and manage orders
- 🛒 **Order Items**: Add multiple products to order
- 💵 **Automatic Calculations**:
  - Subtotal (price × quantity)
  - Tax (based on tax rate)
  - Shipping (flat or calculated)
  - Discounts (amount or percentage)
  - Total (subtotal + tax + shipping - discount)
- 📊 **Status Tracking**: Draft, submitted, completed, cancelled
- 🔍 **Search & Filter**: Find orders by ID or customer
- 📄 **Pagination**: Navigate through orders

**Quick Actions:**
```
1. Click "+ Create Order" to start new order
2. Select customer from dropdown
3. Add items with quantities
4. Apply discounts and taxes
5. Set shipping cost
6. Click "Submit Order"
7. View order status and history
```

**Calculated Fields:**
```javascript
subtotal = sum(quantity × price for each item)
tax = subtotal × (taxRate / 100)
total = subtotal + tax + shippingCost - discountAmount
```

---

### 6. Invoices (`/invoices`)

**Features:**
- 📄 **Invoice Generation**: Create from orders or manually
- 💳 **Payment Tracking**: Record payments with methods
- 📊 **Status Management**: Draft, sent, unpaid, partial, paid, overdue
- 📑 **Recurring Invoices**: Create templates for recurring billing
- 📥 **PDF Export**: Download invoices as PDF files
- 💰 **Financial Tracking**: Payment history and aging report
- 🔍 **Advanced Filtering**: Filter by status, customer, date
- 📄 **Pagination**: 10 items per page

**Status Meanings:**
- 📝 **Draft**: Not yet sent to customer
- ✈️ **Sent**: Sent to customer, awaiting payment
- ⚠️ **Unpaid**: Overdue and unpaid
- ⏳ **Partial**: Payment received but not full amount
- ✓ **Paid**: Fully paid
- 🔴 **Overdue**: Past due date

**Quick Actions:**
```
1. Click "+ Generate Invoice" to create from order
2. Select order to generate from
3. Review invoice details
4. Send to customer
5. Record payments as received
6. Export as PDF when needed
7. Create recurring template for monthly invoicing
```

---

### 7. Authentication & User

**Features:**
- 🔐 **Secure Login**: Username and password
- 👤 **User Profile**: Display current user
- 🚪 **Guest Access**: Limited access without login
- ⏱️ **Session Management**: 24-hour sessions
- 🔄 **Auto-Logout**: Automatic expiration
- 📍 **Role Display**: Show user role (Admin, etc.)

**Session Storage:**
```javascript
localStorage.erp_session = {
  user: { username, name, role },
  timestamp: Date.now(),
  remember: boolean
}
```

---

## 🛠️ Technology Stack

---

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2.0 | UI Framework |
| **Vite** | 7.2.4 | Build Tool & Dev Server |
| **Tailwind CSS** | 4.1.18 | Styling |
| **React Router** | 7.12.0 | Client-side routing |
| **Recharts** | 3.6.0 | Data visualization |
| **Lucide React** | 0.563.0 | Icons |
| **html2pdf.js** | 0.14.0 | PDF export |
| **ESLint** | 9.39.1 | Code quality |

---

## 📁 Project Structure

```
my-erp-app/
├── src/
│   ├── api/                      # API Integration
│   │   ├── client.js             # API client (ready for backend)
│   │   └── hooks.js              # React hooks for data fetching
│   ├── components/               # Reusable Components
│   │   ├── Bootstrapper.jsx      # App initialization
│   │   ├── ErrorBoundary.jsx     # Error handling
│   │   ├── FormInput.jsx         # Form input component
│   │   ├── Loader.jsx            # Loading spinner
│   │   ├── Modal.jsx             # Modal dialog
│   │   ├── Pagination.jsx        # Pagination controls
│   │   ├── Table.jsx             # Data table
│   │   ├── Toast.jsx             # Toast notifications
│   │   └── NavLink.jsx           # Navigation link
│   ├── context/                  # State Management
│   │   ├── AppContext.jsx        # Global app state
│   │   ├── AuthContext.jsx       # Authentication
│   │   └── ThemeContext.jsx      # Theme state
│   ├── hooks/                    # Custom Hooks
│   │   ├── useDebounce.js        # Debounce hook
│   │   └── useFormValidation.js  # Form validation
│   ├── layouts/                  # Layout Components
│   │   └── MainLayout.jsx        # Main layout wrapper
│   ├── pages/                    # Page Components
│   │   ├── Dashboard.jsx         # Dashboard (/)
│   │   ├── Inventory.jsx         # Inventory (/inventory)
│   │   ├── Customers.jsx         # Customers (/customers)
│   │   ├── Products.jsx          # Products (/products)
│   │   ├── Orders.jsx            # Orders (/orders)
│   │   ├── Invoices.jsx          # Invoices (/invoices)
│   │   └── Login.jsx             # Login (/login)
│   ├── utils/                    # Utilities
│   │   └── exportData.js         # Export functions
│   ├── constants/                # Constants
│   │   └── index.js              # App constants
│   ├── App.jsx                   # Main App component
│   ├── main.jsx                  # React entry point
│   ├── App.css                   # App styles
│   └── index.css                 # Global styles
├── public/                       # Static assets
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind config
├── postcss.config.js             # PostCSS config
├── eslint.config.js              # ESLint config
├── index.html                    # HTML entry
├── README.md                     # Main documentation
├── QUICK_START.md                # This file
├── INDEX.md                      # Documentation index
├── API_DOCUMENTATION.md          # API specification
├── REVIEW_AND_IMPROVEMENTS.md    # Code review
├── IMPLEMENTATION_SUMMARY.md     # Summary
├── FILES_REFERENCE.md            # File reference
└── postman-collection.json       # Postman collection
```

---

## 🔌 API Integration

### Current Setup
- **Status**: Mock API (Postman Mock Server)
- **Products API**: `https://ea723e8f-f1fe-4042-94ff-dd5a55eed317.mock.pstmn.io/products`
- **Data**: LocalStorage for other entities

### Future: Backend Integration

#### Step 1: Update API Client
Edit `src/api/client.js`:
```javascript
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';

export const productAPI = {
  getAll: (page = 1, limit = 10) => 
    fetch(`${API_BASE_URL}/products?page=${page}&limit=${limit}`).then(r => r.json()),
  create: (data) => 
    fetch(`${API_BASE_URL}/products`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => 
    fetch(`${API_BASE_URL}/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => 
    fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' })
};

// Similar for customerAPI, orderAPI, invoiceAPI
```

#### Step 2: Environment Setup
Create `.env.local`:
```
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=5000
```

#### Step 3: Test with Postman
1. Open [postman-collection.json](./postman-collection.json)
2. Import into Postman
3. Set `base_url` environment variable
4. Test endpoints

#### Step 4: Connect Components
Replace localStorage calls in `src/context/AppContext.jsx`:
```javascript
// Before: localStorage.setItem('erp_products', ...)
// After: await productAPI.getAll()
```

---

## 📚 Data Storage

---

### LocalStorage Data Structure

```javascript
// Authentication
localStorage.erp_session = {
  user: { username, name, role },
  timestamp: timestamp,
  remember: boolean
}

// Guest mode
localStorage.erp_guest = "true"

// Theme preference
localStorage.erp_theme = "dark" | "light"

// Business Data (all stored as JSON)
localStorage.erp_products = [
  { id, name, sku, stock, price, createdAt }
]

localStorage.erp_customers = [
  { id, name, email, phone, address, status, createdAt }
]

localStorage.erp_orders = [
  { id, customerId, items, status, subtotal, tax, total, createdAt }
]

localStorage.erp_invoices = [
  { id, orderId, customerId, status, total, amountPaid, dueDate, createdAt }
]
```

---

## 🎨 Styling Guidelines

### Color System (Tailwind CSS)
```
Primary Colors:
  - Emerald: Success, positive actions
  - Blue: Information, primary actions
  - Indigo: Secondary actions
  - Violet: Highlights

Semantic Colors:
  - Green: Success, available
  - Amber: Warning, caution
  - Red: Error, danger
  - Slate: Neutral, backgrounds

Example Classes:
  - bg-emerald-500 text-white
  - border-blue-200 dark:border-blue-800
  - hover:bg-indigo-50
```

### Common Patterns
```jsx
// Cards
className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"

// Buttons
className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 py-2 transition-colors"

// Inputs
className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"

// Status Badge
className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold"
```

---

## 🧪 Testing Checklist

### Manual Testing

```
Dashboard Page:
  [ ] Loads without errors
  [ ] KPI cards display correct values
  [ ] Charts render properly
  [ ] Search updates dashboard
  [ ] Theme toggle works
  [ ] Mobile layout looks good

Inventory Page:
  [ ] Product list displays
  [ ] Pagination works (10 items/page)
  [ ] Search filters products
  [ ] Add product creates new item
  [ ] Edit product updates data
  [ ] Delete product removes item
  [ ] Stock status colors correct

Customers Page:
  [ ] Customer list displays
  [ ] Pagination works (10 items/page)
  [ ] Search filters customers
  [ ] Add customer creates new item
  [ ] Edit customer updates data
  [ ] Delete customer removes item
  [ ] Status toggle works

Products Page:
  [ ] Products load from API
  [ ] Prices display formatted
  [ ] Error handling works
  [ ] Retry button appears on error

Orders Page:
  [ ] Order list displays
  [ ] Create order works
  [ ] Add items to order
  [ ] Calculations correct (tax, discount, total)
  [ ] Submit order saves
  [ ] Edit order works
  [ ] Delete order works

Invoices Page:
  [ ] Invoice list displays
  [ ] Generate from order works
  [ ] Record payment works
  [ ] Export PDF works
  [ ] Filter by status works
  [ ] Create recurring invoice works

Authentication:
  [ ] Login with admin/admin123 works
  [ ] Guest mode works
  [ ] Logout works
  [ ] Session persists on refresh
  [ ] Protected routes redirect to login
  [ ] User info displays in header

General:
  [ ] Responsive on mobile
  [ ] Dark mode works
  [ ] No console errors
  [ ] No ESLint warnings
  [ ] LocalStorage updates on changes
```

### Browser DevTools Checks

```
Console (F12 → Console):
  ✅ No errors
  ✅ No warnings
  ✅ No failed API calls

Network (F12 → Network):
  ✅ All assets load (200 status)
  ✅ No failed requests
  ✅ Load times < 2 seconds

Application (F12 → Application):
  ✅ LocalStorage has correct keys
  ✅ Session data is valid
  ✅ Theme preference saved
```

---

## 🚀 Deployment

### Local Testing
```bash
# Build production version
npm run build

# Test production build
npm run preview

# Open http://localhost:4173
```

### Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI globally (once)
npm install -g vercel

# Deploy from project directory
vercel

# Follow prompts to connect GitHub & deploy
```

### Deploy to Netlify
```bash
# Install Netlify CLI globally (once)
npm install -g netlify-cli

# Build project
npm run build

# Deploy dist folder
netlify deploy --prod --dir dist
```

### Deploy to AWS S3
```bash
# Build project
npm run build

# Upload dist folder to S3
aws s3 sync dist/ s3://your-bucket-name/

# Set CloudFront cache invalidation
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

### Docker Deployment
```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

---

## 📞 Troubleshooting Guide

### Development Issues

#### ❌ "Module not found: react-router-dom"
```bash
# Solution: Install all dependencies
npm install

# Or for specific package
npm install react-router-dom
```

#### ❌ "Port 5173 is already in use"
```bash
# Solution: Use different port
npm run dev -- --port 5174

# Or kill the process using port 5173
lsof -ti:5173 | xargs kill -9  # macOS/Linux
```

#### ❌ "Styles not loading correctly"
```bash
# Solution: Restart dev server
npm run dev

# Clear browser cache
Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
```

#### ❌ "Hot reload not working"
```bash
# Solution: Check if file saved
# Ensure you're editing source files, not dist/

# Clear Vite cache
rm -rf .vite node_modules/.vite
```

### Data Issues

#### ❌ "Data not persisting after refresh"
```javascript
// Check DevTools: F12 → Application → Local Storage
// Look for keys: erp_products, erp_customers, etc.

// Solution: Clear localStorage and reload
localStorage.clear()
location.reload()
```

#### ❌ "Search not working"
```
// Dashboard search: Updates KPI metrics
// Page search: Filters current page only

// Try these:
1. Check search input is focused
2. Verify text is being typed
3. Check console (F12) for errors
4. Reload page with Ctrl+Shift+R
```

### Build Issues

#### ❌ "npm run build fails"
```bash
# Solution: Clear build cache and rebuild
rm -rf dist .vite
npm run build

# If still fails, check for linting errors
npm run lint

# Fix linting issues
npm run lint -- --fix
```

#### ❌ "Production build is large"
```bash
# Check bundle size
npm run build

# Analyze what's included
npm install -g source-map-explorer
source-map-explorer 'dist/**/*.js'

# Optimize by removing unused dependencies
npm prune
```

### API Integration Issues

#### ❌ "API calls failing after backend integration"
```
Checklist:
1. Backend server is running
2. .env.local has correct VITE_API_URL
3. Backend accepts CORS from localhost
4. API endpoints match specification
5. Response format matches expected shape

Debug steps:
1. Check Network tab (F12)
2. Verify request URL is correct
3. Check response status code
4. Inspect response body
5. Check browser console for errors
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| [README.md](./README.md) | Project overview & features |
| [QUICK_START.md](./QUICK_START.md) | This file - getting started |
| [INDEX.md](./INDEX.md) | Complete documentation index |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | REST API specification |
| [REVIEW_AND_IMPROVEMENTS.md](./REVIEW_AND_IMPROVEMENTS.md) | Code review & analysis |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | Summary of improvements |
| [FILES_REFERENCE.md](./FILES_REFERENCE.md) | Code snippets reference |
| [.env.example](./.env.example) | Environment variables template |
| [postman-collection.json](./postman-collection.json) | Postman API collection |

---

## 📖 Learning Resources

### React & JavaScript
- [React 19 Documentation](https://react.dev)
- [React Hooks Guide](https://react.dev/reference/react)
- [JavaScript ES6+ Features](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)

### Styling & UI
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind Color Palette](https://tailwindcss.com/docs/customizing-colors)
- [Lucide Icons](https://lucide.dev/)

### Routing & State
- [React Router 7](https://reactrouter.com/)
- [Context API Guide](https://react.dev/reference/react/useContext)
- [Local Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

### Build & Dev Tools
- [Vite Documentation](https://vitejs.dev/)
- [ESLint Configuration](https://eslint.org/)
- [Postman Documentation](https://learning.postman.com/)

### Visualization
- [Recharts Guide](https://recharts.org/)
- [Chart.js](https://www.chartjs.org/)

---

## ✅ Getting Started Checklist

- [ ] Install Node.js 16+ and npm 8+
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Open http://localhost:5173
- [ ] Login with admin/admin123
- [ ] Test all pages
- [ ] Read documentation
- [ ] Plan backend integration
- [ ] Deploy to production

---

## 🎯 Next Steps

### For Development
1. Review [REVIEW_AND_IMPROVEMENTS.md](./REVIEW_AND_IMPROVEMENTS.md)
2. Test all features in dev environment
3. Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
4. Plan backend implementation

### For Backend Integration
1. Set up your backend (Node/Express, Python/Flask, etc.)
2. Implement endpoints from [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
3. Update `.env.local` with API URL
4. Modify `src/api/client.js` to use backend endpoints
5. Test with [postman-collection.json](./postman-collection.json)
6. Update components to use API instead of localStorage

### For Deployment
1. Build: `npm run build`
2. Test: `npm run preview`
3. Deploy to Vercel, Netlify, or AWS
4. Set production environment variables
5. Monitor with error tracking (Sentry, etc.)

---

**Version**: 1.0.0  
**Last Updated**: February 2, 2026  
**Status**: ✅ Production Ready | ⏳ Backend Integration Ready

---

Made with ❤️ using React, Vite & Tailwind CSS
