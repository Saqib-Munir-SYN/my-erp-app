# ERP Pro - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm lint
```

The app will be available at `http://localhost:5173` (Vite default)

---

## 📱 Application Overview

### Modules

#### 1. **Dashboard** (`/`)
- Real-time metrics and KPIs
- Inventory breakdown overview
- System sync status
- Search-aware statistics

#### 2. **Inventory** (`/inventory`)
- Product management (CRUD operations)
- Stock level tracking with status indicators
- Search and filter products by name or SKU
- Paginated table (10 items per page)

#### 3. **Customers** (`/customers`)
- Customer directory management
- Contact information management
- Customer status tracking (Active/Inactive)
- Search by name or email
- Paginated table (10 items per page)

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 4.1.18
- **Routing**: React Router 7.12.0
- **State Management**: Context API + LocalStorage
- **Linting**: ESLint 9.39.1

---

## 📁 Project Structure

```
my-erp-app/
├── src/
│   ├── api/
│   │   ├── client.js        # API client library (ready for backend)
│   │   └── hooks.js         # Custom React hooks (fetch, mutations)
│   ├── components/
│   │   └── Bootstrapper.jsx # App initialization (if needed)
│   ├── context/
│   │   └── AppContext.jsx   # Global state management
│   ├── layouts/
│   │   └── MainLayout.jsx   # Main layout wrapper
│   ├── pages/
│   │   ├── Dashboard.jsx    # Dashboard page
│   │   ├── Inventory.jsx    # Inventory management
│   │   └── Customers.jsx    # Customer management
│   ├── App.jsx              # Main App component
│   ├── main.jsx             # React entry point
│   ├── index.css            # Global styles
│   └── App.css              # App-specific styles
├── public/                   # Static assets
├── API_DOCUMENTATION.md     # API specification
├── postman-collection.json  # Postman collection
├── REVIEW_AND_IMPROVEMENTS.md # Code review summary
├── .env.example             # Environment variables template
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS config
└── eslint.config.js         # ESLint configuration
```

---

## 🔌 API Integration (Future)

### Postman Setup

1. **Open Postman**
2. **Import Collection**:
   - Click "Import"
   - Select "Raw text"
   - Copy entire contents of `postman-collection.json`
   - Click "Import"

3. **Configure Environment**:
   - Set variable `base_url` to `http://localhost:3000/api`

4. **Test Endpoints**:
   - All endpoints pre-configured with examples
   - Includes validation tests

### Using API Client in Code

```javascript
// Import API functions
import { productAPI, customerAPI } from './api/client';
import { useFetch, useMutation } from './api/hooks';

// Option 1: Direct API call (one-time)
async function getProducts() {
  try {
    const response = await productAPI.getAll(1, 10);
    console.log(response.data);
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }
}

// Option 2: Using React hook (recommended)
function ProductList() {
  const { data, loading, error } = useFetch(
    () => productAPI.getAll(1, 10),
    [] // dependencies
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <ul>
      {data?.data.map(product => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}

// Option 3: Mutations (POST, PUT, DELETE)
function AddProduct() {
  const { mutate, loading, success } = useMutation(
    (data) => productAPI.create(data),
    {
      onSuccess: () => alert('Product created!'),
      onError: (error) => alert(`Error: ${error}`)
    }
  );

  return (
    <button onClick={() => mutate({ name: 'New Product', stock: 10 })}>
      {loading ? 'Creating...' : 'Create Product'}
    </button>
  );
}
```

---

## 💾 Data Persistence

Currently using **LocalStorage** for persistence:
- All products saved to `erp_products` key
- All customers saved to `erp_customers` key
- Data persists across page refreshes

**Switch to Backend API**:
Replace the useEffect hooks in `src/context/AppContext.jsx` with API calls once backend is ready.

---

## 🎨 Styling Guidelines

Using **Tailwind CSS** with these conventions:

```jsx
// Colors
primary: blue (products, inventory)
secondary: indigo (customers)
neutral: slate
accent: emerald (success), red (alerts), yellow (warnings)

// Spacing
sm: 0.25rem (1px)
md: 0.5rem (2px)
lg: 1rem (4px)
xl: 1.25rem (5px)

// Common patterns
Rounded: rounded-xl (default), rounded-lg (compact)
Shadows: shadow-sm (cards), shadow-lg (modals)
Borders: border border-slate-200
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Dashboard loads without errors
- [ ] Search filters work on all pages
- [ ] Add/Edit/Delete operations work
- [ ] Pagination navigation works
- [ ] Responsive design on mobile (< 768px)
- [ ] Form validation prevents empty submissions
- [ ] Modal close buttons work
- [ ] localStorage data persists after refresh

### Future: Automated Testing

```bash
# Run unit tests (when added)
npm run test

# Run E2E tests (when added)
npm run test:e2e

# Check test coverage
npm run test:coverage
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'react-router-dom'"
**Solution**: Run `npm install`

### Issue: Styles not loading
**Solution**: Restart dev server with `npm run dev`

### Issue: Search not working
**Solution**: Make sure you're using the global search in the header (for Dashboard) or local search within each page

### Issue: Data not persisting
**Solution**: Check browser DevTools → Application → LocalStorage. Data should be stored under `erp_products` and `erp_customers`

### Issue: API client errors after backend integration
**Solution**: 
1. Check `VITE_API_URL` in `.env.local`
2. Verify backend is running on correct port
3. Check browser Network tab for CORS errors

---

## 📚 Documentation Files

- **API_DOCUMENTATION.md** - Complete REST API specification
- **postman-collection.json** - Postman collection for testing
- **REVIEW_AND_IMPROVEMENTS.md** - Detailed code review and recommendations
- **.env.example** - Environment variables template

---

## 🚀 Deployment

### Development Deployment
```bash
npm run build
npm run preview
```

### Production Deployment (Vercel - Recommended for React)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Documentation](https://reactrouter.com)
- [Vite Guide](https://vitejs.dev/guide/)

---

## 📞 Support & Next Steps

1. **Review Code**: Check `REVIEW_AND_IMPROVEMENTS.md` for detailed feedback
2. **Implement Backend**: Use `API_DOCUMENTATION.md` and `postman-collection.json`
3. **Test APIs**: Use Postman collection to test backend endpoints
4. **Connect Frontend**: Replace localStorage calls with API calls
5. **Deploy**: Use Vercel for frontend, chosen platform for backend

---

## ✅ Checklist for Moving Forward

- [ ] Review `REVIEW_AND_IMPROVEMENTS.md`
- [ ] Test all pages in dev environment
- [ ] Plan backend database schema
- [ ] Set up backend project (Node.js/Express recommended)
- [ ] Implement API endpoints from documentation
- [ ] Test APIs with Postman collection
- [ ] Connect frontend to API
- [ ] Deploy to production

---

**Current Version**: 1.0.0  
**Last Updated**: January 14, 2026  
**Status**: ✅ Production Ready (Frontend Only)
