# Data Flow Diagram - Level 1 (Context Diagram)

## Pastro Mobile Application - System Context

```mermaid
graph TB
    User["👤 End User<br/>(Customer/Admin)"]
    Mobile["📱 Pastro Mobile App<br/>(React Native)"]
    Backend["🖥️ Pastro Backend API<br/>(Symfony)"]
    Database["💾 Database<br/>(MySQL)"]
    Email["📧 Email Service<br/>(SMTP)"]
    GoogleAuth["🔐 Google OAuth<br/>Service"]
    
    User -->|1. Launch App| Mobile
    Mobile -->|2. Request/Response| Backend
    Backend -->|3. Query/Update| Database
    Backend -->|4. Send Verification<br/>Email| Email
    Mobile -->|5. Google Sign-in| GoogleAuth
    
    style User fill:#e1f5ff
    style Mobile fill:#fff3e0
    style Backend fill:#f3e5f5
    style Database fill:#e8f5e9
    style Email fill:#fce4ec
    style GoogleAuth fill:#f1f8e9
```

## Data Flow Elements

### External Entities
| Entity | Type | Description |
|--------|------|-------------|
| End User | External Actor | Customer interacting with mobile app |
| Database | External Data Store | Persistent storage for users, products, orders |
| Email Service | External System | Sends verification emails and notifications |
| Google OAuth | External Service | Authentication provider for social login |

### Major Data Flows

#### Flow 1: User Authentication
- **Source:** Mobile App
- **Destination:** Backend API
- **Data:** Email, Password
- **Process:** Login/Registration validation

#### Flow 2: Product Browsing
- **Source:** Mobile App
- **Destination:** Backend API
- **Data:** Product list, Stock information
- **Process:** Retrieve available products

#### Flow 3: Order Creation
- **Source:** Mobile App
- **Destination:** Backend API
- **Data:** Product ID, Quantity, Customer Name, Material, Color
- **Process:** Create new order, validate inventory

#### Flow 4: Order Management
- **Source:** Mobile App
- **Destination:** Backend API
- **Data:** Order status, Order details
- **Process:** Retrieve orders, update order status

#### Flow 5: Real-time Updates
- **Source:** Backend API
- **Destination:** Mobile App
- **Data:** Order status changes, Notifications
- **Process:** Mercure WebSocket subscription for live updates

#### Flow 6: Email Verification
- **Source:** Backend API
- **Destination:** Email Service
- **Data:** User email, Verification token
- **Process:** Send verification email to new users

---

## System Boundaries

### Within System
- Mobile application logic
- Redux state management
- Local in-memory storage
- API request/response handling
- Authentication management

### Outside System
- Backend API (external microservice)
- Database storage
- Email sending service
- Google authentication service
- Network communication

---

## Key Processes (Level 0)

1. **User Authentication** - Login, Register, Logout
2. **Product Management** - Browse products, view details, check stock
3. **Order Management** - Create orders, view orders, track status
4. **Real-time Notifications** - Mercure WebSocket for live updates
5. **User Profile Management** - View/edit profile information

---

## Technology Stack Integration

```
┌─────────────────────────────────────────────────────────┐
│              PASTRO MOBILE APPLICATION                  │
├─────────────────────────────────────────────────────────┤
│  UI Layer (React Native + React Native Paper)           │
│  State Management (Redux + Redux-Saga)                  │
│  Local Storage (InMemoryStorage)                        │
│  HTTP Client (Axios)                                    │
│  Real-time (Mercure WebSocket)                          │
├─────────────────────────────────────────────────────────┤
│                    NETWORK LAYER                         │
├─────────────────────────────────────────────────────────┤
│  Backend: Symfony API                                   │
│  URL: https://finalwebdev-production.up.railway.app    │
│  Authentication: JWT Bearer Tokens                      │
├─────────────────────────────────────────────────────────┤
│                   DATA LAYER                            │
├─────────────────────────────────────────────────────────┤
│  MySQL Database                                         │
│  Tables: Users, Products, Orders, Stock                │
└─────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant App as Mobile App
    participant API as Backend API
    participant DB as Database
    participant Email as Email Service
    
    User->>App: Enter credentials
    App->>API: POST /login (email, password)
    API->>DB: Verify user
    alt Email Not Verified
        API->>Email: Send verification email
        API->>App: Return error (verified: false)
        App->>App: Generate dev token (development mode)
    else Email Verified
        API->>App: Return JWT token
        App->>App: Store token in InMemoryStorage
    end
```

---

## Order Creation Flow

```mermaid
sequenceDiagram
    participant User
    participant App as Mobile App
    participant API as Backend API
    participant DB as Database
    
    User->>App: Click "Create Order"
    App->>App: Fill order form
    User->>App: Submit order
    App->>API: POST /orders (product_id, quantity, customer_name)
    API->>DB: Validate product & stock
    API->>DB: Create order record
    API->>App: Return order confirmation
    App->>User: Show success message
```

---

## Real-time Update Flow

```mermaid
sequenceDiagram
    participant App as Mobile App
    participant API as Backend API
    participant Mercure as Mercure Hub
    
    App->>Mercure: Subscribe to topics
    API->>Mercure: Publish order update
    Mercure->>App: Push notification
    App->>App: Update local state
    App->>User: Display notification
```
