# Frontend Authentication Guide - Restaurant Ordering System

## 🎯 Overview

This system has **two types of users** with different authentication requirements:

| User Type | Login Required | Purpose |
|-----------|---------------|---------|
| **Admin** | ✅ Yes | Manage restaurant (dishes, orders, users, etc.) |
| **Customer (User)** | ❌ No | Browse menu, place orders (public access) |

**Key Principle:** Customers can use the system without authentication. Only admins need to login to access management features.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐         ┌──────────────┐     │
│  │   Customer   │         │    Admin     │     │
│  │   (Public)   │         │ (Protected)  │     │
│  └──────────────┘         └──────────────┘     │
│         │                        │              │
│         │ No Auth                │ JWT Cookie   │
│         ▼                        ▼              │
│  ┌──────────────┐         ┌──────────────┐     │
│  │ Public APIs  │         │Protected APIs│     │
│  └──────────────┘         └──────────────┘     │
└─────────────────────────────────────────────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │   Backend (NestJS)   │
         │  - HTTP-only cookies │
         │  - JWT authentication│
         │  - Role-based guards │
         └─────────────────────┘
```

---

## 🔓 Public APIs (No Authentication Required)

### Customer Can Access:
```javascript
// View menu/dishes
GET /dish              // Get all dishes
GET /dish/:id          // Get specific dish details
GET /category          // Get all categories

// Place orders (guest checkout)
POST /order            // Create order (no auth needed)
GET /order/:id         // Track order status (with order ID)

// View tables (if needed)
GET /table             // Get available tables
```

### Implementation Example:
```javascript
// No credentials needed for public APIs
async function fetchMenu() {
  const response = await fetch('http://your-api.com/dish', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
    // ❌ NO credentials: 'include' needed for public APIs
  });
  
  return response.json();
}

async function placeGuestOrder(orderData) {
  const response = await fetch('http://your-api.com/order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });
  
  return response.json();
}
```

---

## 🔐 Admin Authentication (Login Required)

### Admin-Only Protected APIs:
```javascript
// User management
GET /user              // View all users (admin only)
DELETE /user/:id       // Delete user (admin only)

// Dish management
POST /dish             // Create dish (admin only)
PATCH /dish/:id        // Update dish (admin only)
DELETE /dish/:id       // Delete dish (admin only)

// Order management
GET /order             // View all orders (admin only)
PATCH /order/:id       // Update order status (admin only)

// View own profile
GET /auth/me           // Get logged-in admin info
```

---

## 🔑 Admin Login Flow

### 1. Admin Login
```javascript
async function adminLogin(email, password) {
  try {
    const response = await fetch('http://your-api.com/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // ✅ Required: Enables HTTP-only cookie
      body: JSON.stringify({
        user_email: email,
        user_password: password
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    // { message: 'Login successful' }
    
    // Backend automatically sets HTTP-only cookie with JWT
    // Cookie name: access_token
    
    // Fetch admin profile after login
    const adminProfile = await fetchAdminProfile();
    return adminProfile;
    
  } catch (error) {
    console.error('Login failed:', error.message);
    // Handle errors:
    // - Invalid credentials
    // - Account locked (3 failed attempts)
    throw error;
  }
}
```

### 2. Get Admin Profile
```javascript
async function fetchAdminProfile() {
  try {
    const response = await fetch('http://your-api.com/auth/me', {
      method: 'GET',
      credentials: 'include', // ✅ Sends HTTP-only cookie automatically
    });

    if (response.status === 401) {
      // Not authenticated or token expired
      return null;
    }

    const data = await response.json();
    /* Response:
    {
      success: true,
      user: {
        user_id: 1,
        user_name: "Admin User",
        user_email: "admin@example.com",
        user_role: "admin"
      },
      message: "Token is valid"
    }
    */
    
    return data.user;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}
```

### 3. Admin Logout
```javascript
async function adminLogout() {
  try {
    const response = await fetch('http://your-api.com/user/logout', {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      // Clear admin state in frontend
      // Redirect to home or login page
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
}
```

### 4. Admin Protected API Calls
```javascript
async function createDish(dishData) {
  try {
    const response = await fetch('http://your-api.com/dish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // ✅ Sends admin JWT cookie
      body: JSON.stringify(dishData)
    });

    if (response.status === 401) {
      // Not authenticated - redirect to login
      window.location.href = '/admin/login';
      return null;
    }

    if (response.status === 403) {
      // Authenticated but not authorized (not admin)
      throw new Error('Access denied: Admin rights required');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating dish:', error);
    throw error;
  }
}
```

---

## ⚛️ React Implementation Example

### Auth Context for Admin Only

```javascript
// contexts/AdminAuthContext.js
import { createContext, useState, useEffect, useContext } from 'react';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if admin is logged in on mount
  useEffect(() => {
    checkAdminAuth();
  }, []);

  async function checkAdminAuth() {
    try {
      const response = await fetch('http://your-api.com/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        // Only set admin if role is 'admin'
        if (data.user.user_role === 'admin') {
          setAdmin(data.user);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const response = await fetch('http://your-api.com/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        user_email: email, 
        user_password: password 
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    // Fetch admin profile after successful login
    await checkAdminAuth();
  }

  async function logout() {
    await fetch('http://your-api.com/user/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setAdmin(null);
  }

  return (
    <AdminAuthContext.Provider value={{ 
      admin, 
      loading, 
      login, 
      logout,
      isAdmin: !!admin 
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
```

### Protected Admin Routes

```javascript
// components/AdminRoute.js
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export function AdminRoute({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!admin) {
    // Not logged in - redirect to admin login
    return <Navigate to="/admin/login" />;
  }

  return children;
}
```

### Admin Login Page

```javascript
// pages/AdminLogin.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/admin/dashboard'); // Redirect to admin dashboard
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  }

  return (
    <div className="admin-login">
      <h1>Admin Login</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
```

### Admin Dashboard (Protected)

```javascript
// pages/AdminDashboard.js
import { useAdminAuth } from '../contexts/AdminAuthContext';

export function AdminDashboard() {
  const { admin, logout } = useAdminAuth();

  return (
    <div className="admin-dashboard">
      <header>
        <h1>Admin Dashboard</h1>
        <div className="admin-info">
          <span>Welcome, {admin.user_name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>
      
      <nav>
        <a href="/admin/dishes">Manage Dishes</a>
        <a href="/admin/orders">View Orders</a>
        <a href="/admin/users">Manage Users</a>
      </nav>
      
      {/* Admin content */}
    </div>
  );
}
```

### Customer (Public) Pages - No Auth Required

```javascript
// pages/Menu.js (Public - No authentication)
import { useState, useEffect } from 'react';

export function Menu() {
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    fetchMenu();
  }, []);

  async function fetchMenu() {
    // ✅ No credentials needed - public API
    const response = await fetch('http://your-api.com/dish');
    const data = await response.json();
    setDishes(data);
  }

  async function placeOrder(orderData) {
    // ✅ No credentials needed - guest checkout
    const response = await fetch('http://your-api.com/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    
    return response.json();
  }

  return (
    <div className="menu">
      <h1>Our Menu</h1>
      <div className="dishes">
        {dishes.map(dish => (
          <DishCard key={dish.id} dish={dish} onOrder={placeOrder} />
        ))}
      </div>
    </div>
  );
}
```

---

## 🗺️ Routing Structure

```javascript
// App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { AdminRoute } from './components/AdminRoute';

// Public pages
import { Home } from './pages/Home';
import { Menu } from './pages/Menu';
import { OrderTracking } from './pages/OrderTracking';

// Admin pages
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { ManageDishes } from './pages/ManageDishes';
import { ManageOrders } from './pages/ManageOrders';

function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          {/* Public Routes - No authentication needed */}
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/order/:orderId" element={<OrderTracking />} />
          
          {/* Admin Login - Public (to allow admin to login) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Admin Protected Routes - Authentication required */}
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/dishes" element={
            <AdminRoute>
              <ManageDishes />
            </AdminRoute>
          } />
          <Route path="/admin/orders" element={
            <AdminRoute>
              <ManageOrders />
            </AdminRoute>
          } />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}
```

---

## 🎨 Conditional UI Rendering

```javascript
// components/Header.js
import { useAdminAuth } from '../contexts/AdminAuthContext';

export function Header() {
  const { admin, logout } = useAdminAuth();

  return (
    <header>
      <nav>
        <a href="/">Home</a>
        <a href="/menu">Menu</a>
        
        {/* Show admin link only if logged in as admin */}
        {admin && (
          <>
            <a href="/admin/dashboard">Admin Dashboard</a>
            <button onClick={logout}>Logout</button>
            <span>👤 {admin.user_name}</span>
          </>
        )}
        
        {/* Show admin login only if NOT logged in */}
        {!admin && (
          <a href="/admin/login">Admin Login</a>
        )}
      </nav>
    </header>
  );
}
```

---

## 🔄 API Service Layer

```javascript
// services/api.js
const API_BASE = 'http://your-api.com';

// Public API calls (no credentials)
export const publicAPI = {
  async getDishes() {
    const response = await fetch(`${API_BASE}/dish`);
    return response.json();
  },

  async getDish(id) {
    const response = await fetch(`${API_BASE}/dish/${id}`);
    return response.json();
  },

  async placeOrder(orderData) {
    const response = await fetch(`${API_BASE}/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return response.json();
  },

  async trackOrder(orderId) {
    const response = await fetch(`${API_BASE}/order/${orderId}`);
    return response.json();
  }
};

// Admin API calls (requires authentication)
export const adminAPI = {
  async createDish(dishData) {
    const response = await fetch(`${API_BASE}/dish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // ✅ Sends admin JWT cookie
      body: JSON.stringify(dishData)
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/admin/login';
        return null;
      }
      throw new Error('Failed to create dish');
    }
    
    return response.json();
  },

  async updateDish(id, dishData) {
    const response = await fetch(`${API_BASE}/dish/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dishData)
    });
    
    if (!response.ok) throw new Error('Failed to update dish');
    return response.json();
  },

  async deleteDish(id) {
    const response = await fetch(`${API_BASE}/dish/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (!response.ok) throw new Error('Failed to delete dish');
    return response.json();
  },

  async getAllOrders() {
    const response = await fetch(`${API_BASE}/order`, {
      credentials: 'include',
    });
    
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  async updateOrderStatus(orderId, status) {
    const response = await fetch(`${API_BASE}/order/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) throw new Error('Failed to update order');
    return response.json();
  }
};
```

---

## 🛡️ Error Handling

```javascript
// utils/errorHandler.js
export function handleAPIError(error, navigate) {
  if (error.response) {
    switch (error.response.status) {
      case 401:
        // Unauthorized - redirect to admin login
        navigate('/admin/login');
        return 'Please login to continue';
      
      case 403:
        // Forbidden - user doesn't have required role
        return 'Access denied: Admin rights required';
      
      case 404:
        return 'Resource not found';
      
      case 500:
        return 'Server error. Please try again later';
      
      default:
        return error.message || 'An error occurred';
    }
  }
  
  return 'Network error. Please check your connection';
}
```

---

## 📋 Summary: Authentication Matrix

| Feature | Customer | Admin |
|---------|----------|-------|
| **Browse Menu** | ✅ Public | ✅ Public |
| **Place Order** | ✅ Public | ✅ Public |
| **Track Order** | ✅ Public (with order ID) | ✅ All orders |
| **Login Required** | ❌ No | ✅ Yes |
| **JWT Cookie** | ❌ No | ✅ Yes (HTTP-only) |
| **Create/Edit Dishes** | ❌ No | ✅ Yes |
| **Manage Orders** | ❌ No | ✅ Yes |
| **Manage Users** | ❌ No | ✅ Yes |

---

## ⚙️ Backend API Summary

### Public Endpoints (No Auth)
```
GET    /dish              - List all dishes
GET    /dish/:id          - Get dish details
GET    /category          - List categories
POST   /order             - Place order
GET    /order/:id         - Track specific order
POST   /user/login        - Admin login
```

### Protected Endpoints (Admin Only)
```
POST   /dish              - Create dish
PATCH  /dish/:id          - Update dish
DELETE /dish/:id          - Delete dish
GET    /order             - View all orders
PATCH  /order/:id         - Update order status
GET    /user              - View all users
DELETE /user/:id          - Delete user
GET    /auth/me           - Get admin profile
POST   /user/logout       - Admin logout
```

---

## 🚀 Implementation Checklist

### Frontend Setup
- [ ] Create `AdminAuthContext` for admin authentication
- [ ] Create `AdminRoute` component for protected routes
- [ ] Implement admin login page
- [ ] Implement admin dashboard
- [ ] Create public pages (menu, home, order tracking)
- [ ] Setup routing with public and protected routes
- [ ] Create API service layer (public vs admin)
- [ ] Implement error handling for 401/403
- [ ] Add conditional UI rendering (show/hide admin features)

### Backend Verification
- [ ] Verify public endpoints work without authentication
- [ ] Verify admin endpoints require authentication
- [ ] Test role-based access (admin vs user)
- [ ] Ensure CORS allows `credentials: true`
- [ ] Test HTTP-only cookie is set on login
- [ ] Test cookie is cleared on logout

### Testing
- [ ] Test customer can browse and order without login
- [ ] Test admin can login
- [ ] Test admin can access protected endpoints
- [ ] Test admin logout works
- [ ] Test 401 redirect to login page
- [ ] Test 403 shows access denied message
- [ ] Test session persists across page refreshes

---

## 🔒 Security Notes

1. **HTTP-only Cookies**: JWT stored in HTTP-only cookie prevents XSS attacks
2. **CORS Configuration**: Backend must allow credentials from frontend domain
3. **Public vs Protected**: Clear separation between public customer features and protected admin features
4. **No Token in Frontend**: Frontend never handles JWT directly - browser manages it automatically
5. **Role Validation**: Backend validates admin role on every protected endpoint
6. **HTTPS in Production**: Always use HTTPS in production for secure cookie transmission

---

## 🎯 Key Takeaways

1. **Customers don't need accounts** - They use public APIs to browse and order
2. **Only admins login** - Authentication is for management features only
3. **JWT in HTTP-only cookies** - Secure, automatic, no manual token management
4. **Always use `credentials: 'include'`** - Required for admin API calls to send cookies
5. **Redirect on 401** - Automatically redirect to login when token expires
6. **Conditional UI** - Show admin features only when logged in as admin

This architecture provides a smooth customer experience while maintaining secure admin access! 🎉
