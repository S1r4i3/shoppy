<p align="center">
  <img src="public/logo.png" alt="MyShoppy logo" height="70" />
</p>

<h3 align="center">A mobile-first e-commerce app for household products</h3>

<p align="center">
  React 19 · Vite · React Router 7 · Context API
</p>

---

## Table of Contents

1. [Overview](#1-overview)
2. [Features](#2-features)
3. [Tech Stack](#3-tech-stack)
4. [Getting Started](#4-getting-started)
5. [Project Structure](#5-project-structure)
6. [Screens & Routes](#6-screens--routes)
7. [Application Flow](#7-application-flow)
8. [Architecture](#8-architecture)
9. [Security](#9-security)
10. [Validation & Error Handling](#10-validation--error-handling)
11. [Product Dataset](#11-product-dataset)
12. [Wireframe Mapping](#12-wireframe-mapping)
13. [Testing the App](#13-testing-the-app)
14. [Assumptions](#14-assumptions)
15. [Future Enhancements](#15-future-enhancements)

---

## 1. Overview

**MyShoppy** digitises a retail company's sales process. Customers can create an account, sign in securely, browse and search household products, manage a shopping cart and place orders from their phone.

The app is built to the *Capstone Project – myShoppy* specification: a clean, responsive mobile interface, a component-based architecture, managed application state, validated inputs, protected routes and graceful handling of every UI state.

---

## 2. Features

### 👤 User Account Management
- Register with validated name, email, 10-digit mobile number and a strong password (with strength meter)
- Sign in / sign out securely
- Forgot password flow with a 6-digit reset code (expires in 10 minutes)
- View and update profile, change password
- Session stays active while you use the app and expires after 30 minutes of inactivity, with a clear message

### 🛍️ Product Catalogue
- 31 household products across 6 categories
- Real product photos, name, category, description, price, rating and stock status
- Category-wise browsing
- Product details page with quantity selector
- Wishlist (heart icon) on product cards

### 🔍 Search & Filter
- Search by product name as you type
- Filter by category, price range (min / max) and availability
- Sort by price or rating
- Filters are kept in the URL, so they survive a refresh

### 🛒 Cart & Checkout
- Cart and checkout are available only to signed-in users
- Add, update quantity and remove items, with stock limits enforced
- Order summary: subtotal, delivery fee (free above ₹999), 5% GST, total payable
- Checkout captures delivery details and payment method (Cash / UPI on delivery)
- Order confirmation with order ID, items, address and estimated delivery

### 🎨 User Interface
- Mobile-first layout that follows the PDF wireframes
- Loading skeletons, empty states, error states with retry and toast messages
- Accessible forms (labels, inline errors, keyboard focus, screen-reader hints)

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| UI library | React 19 |
| Build tool | Vite |
| Routing | React Router 7 (protected, guest-only and lazy-loaded routes) |
| State management | Context API + `useReducer` (Auth, Cart, Wishlist, Toast) |
| Backend | Mock API service layer over a local database (`localStorage`) with simulated network delay |
| Security | Web Crypto API: PBKDF2 password hashing, SHA-256 token hashing |
| Styling | Plain CSS with design tokens, Poppins font |
| Linting | Oxlint |

---

## 4. Getting Started

### Prerequisites

- **Node.js 20.19+** (or 22.12+)
- npm

### Installation

```bash
# 1. Go to the project folder
cd myshoppy

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open **http://localhost:5173** in your browser.
For the best experience, switch the browser to mobile view (DevTools → device toolbar).

### Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint the source code |

### Environment variables (optional)

Copy `.env.example` to `.env` to change the defaults:

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_LATENCY_MS` | `400` | Simulated API delay (shows loading states) |
| `VITE_SESSION_TTL_MINUTES` | `30` | Minutes of inactivity before auto sign-out |

> ⚠️ Open the app on `localhost` (or HTTPS). Password hashing uses the Web Crypto API, which browsers only allow in a secure context. Do **not** open `index.html` directly from the file system.

---

## 5. Project Structure

```
myshoppy/
├── public/
│   ├── logo.png                 # MyShoppy logo
│   ├── hero.jpg                 # Home page banner image
│   ├── favicon.svg
│   └── images/                  # Offline fallback product images
├── scripts/
│   └── generate-images.mjs      # Regenerates fallback images
├── docs/
│   └── screenshots/             # User journey screenshots
├── src/
│   ├── main.jsx                 # Entry point (wrapped in ErrorBoundary)
│   ├── App.jsx                  # Providers + route table
│   │
│   ├── pages/                   # One component per screen
│   │   ├── HomePage.jsx
│   │   ├── CategoriesPage.jsx
│   │   ├── ProductListPage.jsx
│   │   ├── ProductDetailsPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── OrderConfirmationPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── NotFoundPage.jsx
│   │
│   ├── components/              # Reusable UI components
│   │   ├── AppHeader.jsx        # Logo + profile icon + page title band
│   │   ├── BottomNav.jsx        # Home · Categories · Cart
│   │   ├── Layout.jsx
│   │   ├── ProtectedRoute.jsx   # ProtectedRoute & GuestRoute
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── ProductImage.jsx     # Image with offline fallback
│   │   ├── QuantityStepper.jsx
│   │   ├── OrderSummary.jsx
│   │   ├── FormField.jsx
│   │   ├── PasswordStrength.jsx
│   │   ├── Modal.jsx
│   │   ├── StateViews.jsx       # Loader, Skeleton, EmptyState, ErrorState
│   │   ├── ErrorBoundary.jsx
│   │   └── …
│   │
│   ├── context/                 # Global state
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   ├── WishlistContext.jsx
│   │   └── ToastContext.jsx
│   │
│   ├── services/                # "Backend" layer — the only code that touches data
│   │   ├── authService.js       # Register, login, logout, reset, profile
│   │   ├── productService.js    # List / search / filter / get by id
│   │   ├── cartService.js       # Per-user cart
│   │   ├── orderService.js      # Place & fetch orders
│   │   ├── mockDb.js            # localStorage-backed mock database
│   │   ├── crypto.js            # Hashing & random tokens
│   │   ├── sessionStorage.js    # Session token store
│   │   ├── apiClient.js         # Simulated latency
│   │   ├── config.js
│   │   └── errors.js
│   │
│   ├── hooks/                   # useAsync, useAddToCart
│   ├── data/                    # products.json, categories.js
│   ├── utils/                   # validators, cartTotals, format
│   └── styles/global.css
├── index.html
├── package.json
└── README.md
```

**Naming conventions:** components and pages use `PascalCase.jsx`; hooks start with `use`; services, utils and data use `camelCase.js`.

---

## 6. Screens & Routes

| Screen | Route | Access |
|---|---|---|
| Home | `/` | Public |
| Categories | `/categories` | Public |
| Product listing | `/products` | Public |
| Product details | `/products/:id` | Public |
| Sign in | `/login` | Guests only |
| Register | `/register` | Guests only |
| Forgot password | `/forgot-password` | Guests only |
| Cart | `/cart` | 🔒 Signed in |
| Checkout | `/checkout` | 🔒 Signed in |
| Order confirmation | `/order/:orderId` | 🔒 Signed in (order owner only) |
| Profile | `/profile` | 🔒 Signed in |
| Not found | `*` | Public |

Product listing supports query parameters:
`/products?search=pan&category=kitchen&minPrice=200&maxPrice=1500&availability=in&sort=price-asc`

---

## 7. Application Flow

```
                ┌──────────┐
                │   Home   │
                └────┬─────┘
          ┌──────────┴──────────┐
          ▼                     ▼
   ┌─────────────┐       ┌─────────────┐
   │ Categories  │──────▶│  Products   │◀── Search / Filter
   └─────────────┘       └──────┬──────┘
                                ▼
                        ┌───────────────┐
                        │Product Details│
                        └───────┬───────┘
                                │ Add to Cart
                  signed in? ───┤
                  no ▼          │ yes
            ┌──────────────┐    ▼
            │ Sign in /    │  ┌──────┐     ┌──────────┐     ┌──────────────┐
            │ Register     │─▶│ Cart │───▶ │ Checkout │───▶ │ Order Placed │
            └──────────────┘  └──────┘     └──────────┘     └──────────────┘
```

1. **Browse:** guests can explore categories, search, filter and view product details.
2. **Authenticate:** adding to cart, or opening Cart or Profile, redirects guests to Sign in, then returns them to where they were.
3. **Cart:** users add items, change quantities or remove items. The cart is saved per user and restored on the next sign-in.
4. **Checkout:** users review items, enter delivery details, choose a payment method and see the total price.
5. **Place order:** the backend re-checks stock and recalculates prices, saves the order, reduces inventory and clears the cart.
6. **Confirmation:** an "order accepted" dialog, then the order confirmation page.

---

## 8. Architecture

```
 Pages  ──▶  Context / Hooks  ──▶  Services  ──▶  Mock DB (localStorage)
 (UI)        (app state)           (API layer)     (replaceable)
```

- **Pages** only render UI and call hooks or contexts.
- **Contexts** hold application state:
  - `AuthContext`: user, session token, expiry, login / logout
  - `CartContext`: cart items (via `useReducer`), live totals, stock checks
  - `WishlistContext`: saved products
  - `ToastContext`: user feedback messages
- **Services** act as the backend API. Every call is asynchronous with simulated latency.
- **Swapping the backend:** to move to Firebase or a REST API, only the files in `src/services/` need to change. The UI stays the same.

---

## 9. Security

| Requirement | Implementation |
|---|---|
| No plain-text passwords | Passwords are hashed with **PBKDF2 (100,000 iterations, SHA-256)** and a unique salt per user |
| No secrets in code | No API keys or credentials in the source. `.env` holds only non-secret settings |
| Secure session storage | A 256-bit random token is stored in `sessionStorage` (cleared when the tab closes). The backend keeps only a **SHA-256 hash** of the token |
| Session expiry | Sliding idle timeout: activity extends the session; after 30 minutes of inactivity the user is signed out with a message |
| Protected routes | `ProtectedRoute` blocks Cart, Checkout, Order and Profile for guests |
| User-specific data | Carts and orders are tied to the signed-in user. Orders can only be viewed by their owner |
| No account enumeration | Login returns the same "Invalid email or password" for unknown emails and wrong passwords. Password reset responds the same way for every email |
| Password reset | Codes are hashed, expire in 10 minutes and are single-use. A successful reset signs out all sessions |
| Tamper-proof totals | Prices, stock and totals are recalculated on the service side when placing an order |

---

## 10. Validation & Error Handling

### Input validation

| Field | Rule |
|---|---|
| Name | Required, letters only, 2–50 characters |
| Email | Required, valid format, unique on registration |
| Mobile number | Required, 10 digits starting with 6–9 |
| Password | Minimum 8 characters, with uppercase, lowercase and a number |
| Quantity | Whole number, 1 to 10, no more than stock |
| Delivery address | Required, at least 10 characters |
| City / State | Required |
| PIN code | Required, 6 digits |
| Price filter | Minimum price cannot exceed maximum price |

### UI states handled

| Scenario | Behaviour |
|---|---|
| Loading | Skeleton cards and spinners, button loading indicators |
| Empty cart / no search results | Friendly empty state with an action button |
| Invalid credentials | Inline error message; password field cleared |
| Expired session | Auto sign-out and redirect to Sign in with a message |
| Out-of-stock product | "Out of stock" badge, Add to Cart disabled |
| Stock changed while in cart | Item flagged, checkout blocked until fixed |
| Network or image failure | Retry button; product images fall back to local placeholders |
| Unexpected crash | Error boundary shows a reload screen instead of a blank page |
| Unknown page | 404 screen |

---

## 11. Product Dataset

`src/data/products.json` contains **31 products across 6 categories**:

| Category | Products |
|---|---|
| Kitchen | Carbon Steel Wok, Chef Knife, Bamboo Spatula, Chopping Board, Grater, Spice Rack |
| Appliances | Countertop Blender, Microwave Oven, Induction Stove, Hand Blender, Smart Home Speaker |
| Dining | Cooking Pot with Lid, Lunch Box, Serving Tray, Mug Tree Stand, Dinner Plate |
| Home Décor | Showpiece Plant, Photo Frame, Table Lamp, Plant Pot, Decoration Swing |
| Furniture | Bedside Table, Office Chair, Double Bed, 3-Seater Sofa, Bathroom Vanity with Mirror |
| Essentials | Hand Soap, Tissue Paper Box, Body Wash, Body & Face Lotion, Cooking Oil |

Each product has:

```json
{
  "id": "p001",
  "name": "Carbon Steel Wok 30cm",
  "category": "kitchen",
  "price": 1499,
  "rating": 4.1,
  "stock": 18,
  "image": "https://cdn.dummyjson.com/product-images/...",
  "description": "Pre-seasoned carbon steel wok ..."
}
```

Product photos come from the free [DummyJSON](https://dummyjson.com) demo CDN. If they can't load (for example offline), the app shows local placeholder images from `public/images/`.

---

## 12. Wireframe Mapping

| Wireframe (PDF) | Implementation |
|---|---|
| Home / landing: logo, banner image, "Shopping And Department Store." | `HomePage.jsx` |
| Categories grid with image tiles | `CategoriesPage.jsx` |
| "Categories/ Headphones" list, "… For You!", cards with heart, price, rating, Add to Cart | `ProductListPage.jsx`, `ProductCard.jsx` |
| "Review Item And Shipping", "Total Price", "Place Order" | `CheckoutPage.jsx` |
| "Your order has been accepted" pop-up | `CheckoutPage.jsx` + `Modal.jsx` |
| Bottom bar: Home · Categories · Cart | `BottomNav.jsx` |
| Header: logo + profile icon | `AppHeader.jsx` |

Screenshots of the main user journeys are in [`docs/screenshots/`](docs/screenshots).

---

## 13. Testing the App

### Quick walkthrough

1. Open the app and browse **Categories**, then open **Kitchen**.
2. Tap **Add to Cart**. You'll be asked to sign in.
3. **Register** a new account (e.g. password `Shoppy123`).
4. Add a few products, open **Cart** and change quantities.
5. Go to **Checkout**, fill in delivery details and tap **Place Order**.
6. View the **order confirmation**.

### Edge cases to try

| Test | How |
|---|---|
| Invalid login | Sign in with a wrong password |
| Validation | Submit Register or Checkout with empty or invalid fields |
| Out of stock | Countertop Blender, Microwave Oven, Office Chair |
| Low stock limit | Hand Blender (only 2 left) |
| Password reset | *Forgot password?* The code is shown on screen in demo mode |
| Session expiry | Set `VITE_SESSION_TTL_MINUTES=1` in `.env`, restart, sign in and leave the app idle for one minute |
| Protected route | Sign out and open `/cart` directly |
| No results | Search for `xyz` |

### Reset all data

Run this in the browser console, then refresh:

```js
localStorage.removeItem('myshoppy_mock_db_v1');
sessionStorage.clear();
```

---

## 14. Assumptions

- **No real backend was required.** A mock service layer stores data in the browser's `localStorage` and simulates API delay.
- **No email service is connected.** The password-reset code is shown on screen in *demo mode*; in production it would be emailed.
- **Session token storage.** `sessionStorage` is the most suitable option for a front-end-only app. In production the backend should use an `HttpOnly; Secure; SameSite` cookie, or Keychain/Keystore in a native app.
- **Payment** is Cash or UPI on delivery. No card data is collected.
- **Region:** prices are in INR, mobile and PIN code validation follow Indian formats, and GST is fixed at 5%.
- **Delivery fee:** ₹49, free for orders of ₹999 or more.
- **Quantity limit:** up to 10 units of one product per order.

---

## 15. Future Enhancements

- Order history page
- Real-time inventory tracking
- Social sign-in (Google) and multi-factor authentication
- Payment gateway integration (Razorpay / Stripe)
- Firebase or Node.js + database backend
- Product reviews and a wishlist page
- Push notifications for order status

---

<p align="center">Built with React for the myShoppy Capstone Project</p>
