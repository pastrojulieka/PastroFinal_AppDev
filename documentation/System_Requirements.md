# System Requirements Specification
## Pastro Mobile Application

---

## Executive Summary

Pastro is a mobile e-commerce application for managing product orders and inventory. This document outlines the technical, hardware, and software requirements for deploying, running, and maintaining the system.

---

## 1. SOFTWARE REQUIREMENTS

### 1.1 Frontend Requirements

#### Mobile Application
- **Platform:** React Native 0.84.0
- **Language:** TypeScript 4.x
- **Target OS:**
  - Android 8.0 (API Level 26) or higher
  - iOS 13.0 or higher

#### Frontend Dependencies
```
Core Libraries:
- @react-navigation/native ^6.x
- @react-navigation/bottom-tabs ^6.x
- @react-navigation/stack ^6.x
- react-native-paper ^5.x (UI Components)
- @react-native-async-storage/async-storage (removed - replaced with InMemoryStorage)

State Management:
- redux ^4.x
- react-redux ^8.x
- redux-saga ^1.x

HTTP Client:
- axios ^1.x

Real-time Communication:
- eventsource-polyfill (for Mercure WebSocket)

Development:
- @types/react-native ^0.84.x
- @types/react ^18.x
- typescript ^4.x
```

#### UI Framework
- **React Native Paper** for Material Design components
- Custom theme with dark mode support
- Responsive design for multiple screen sizes

### 1.2 Backend Requirements

#### Server Framework
- **Framework:** Symfony 6.x
- **Language:** PHP 8.1 or higher
- **API Type:** RESTful API with API Platform

#### Backend Dependencies
```
Authentication:
- JWT tokens (firebase/jwt)
- OAuth2 support for Google authentication

Database:
- Doctrine ORM
- MySQL migrations

Email:
- SwiftMailer for SMTP

Real-time:
- Mercure for WebSocket push notifications
```

#### Backend Endpoints
- `/api/login` - User authentication
- `/api/register` - User registration
- `/api/products` - Product listing and details
- `/api/orders` - Order management (CRUD)
- `/api/stock` - Stock information and management
- `/api/customers` - Customer profile management

### 1.3 Database Requirements

#### Database System
- **DBMS:** MySQL 8.0 or MariaDB 10.5+
- **Character Set:** UTF8MB4
- **Collation:** utf8mb4_unicode_ci

#### Core Tables
```sql
- users (id, email, password, name, created_at, verified_at)
- products (id, name, description, price, material, color, created_at)
- orders (id, product_id, customer_name, quantity, total_price, created_at)
- stock (id, product_id, status, quantity_available)
- customers (id, email, name, phone, address)
```

### 1.4 Email Service Requirements

#### SMTP Configuration
- **Protocol:** SMTP or SMTP with TLS/SSL
- **Port:** 587 (TLS) or 465 (SSL)
- **Authentication:** Required (username/password)
- **Verification:** Email verification for new registrations

#### Email Templates
- Registration confirmation with verification link
- Order confirmation
- Order status updates
- Password reset (future enhancement)

### 1.5 Authentication Service

#### JWT Requirements
- **Algorithm:** HS256 or RS256
- **Expiration:** 24 hours (configurable)
- **Refresh Token:** Optional (future enhancement)

#### Google OAuth
- **OAuth 2.0** integration for social login
- **Scopes:** email, profile
- **Client ID/Secret:** Required from Google Cloud Console

### 1.6 Real-time Communication

#### Mercure Configuration
- **Protocol:** Server-Sent Events (SSE) + WebSocket
- **Subscription Topics:**
  - `orders/{orderId}` - Order updates
  - `notifications` - General notifications
- **Message Format:** JSON

### 1.7 Version Control & Deployment

#### Development Tools
- **Git** for version control
- **npm** for dependency management
- **Node.js** 18.x or higher (build tools)

#### Build & Compilation
- **Metro Bundler** for React Native bundling
- **Gradle** for Android build (v6.7.1 or higher)
- **Xcode** 14.x for iOS build (macOS required)

---

## 2. HARDWARE REQUIREMENTS

### 2.1 Development Environment

#### Minimum Specifications
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **Processor** | Intel Core i5 / AMD Ryzen 5 | Intel Core i7 / AMD Ryzen 7 |
| **RAM** | 8 GB | 16 GB |
| **Storage** | 20 GB SSD | 50 GB SSD |
| **Display** | 1920×1080 | 2560×1440 |
| **OS** | Windows 10/11, macOS 11+, Linux | Windows 11, macOS 12+, Ubuntu 20.04+ |

#### Development Devices
- **Android Emulator or Physical Device** (Android 8.0+)
- **iOS Simulator or Physical Device** (iOS 13+)
  - For iOS: Requires Apple Silicon Mac or Intel Mac with virtualization support

### 2.2 Production Server

#### Backend Server
| Component | Specification |
|-----------|---------------|
| **CPU** | Minimum 2 cores (4 cores recommended) |
| **RAM** | Minimum 4 GB (8 GB recommended) |
| **Storage** | Minimum 10 GB SSD (50 GB for growth) |
| **Network** | Minimum 100 Mbps |
| **Uptime** | 99.5% availability |

#### Database Server
| Component | Specification |
|-----------|---------------|
| **CPU** | 4 cores (8 cores for high traffic) |
| **RAM** | 8 GB minimum (16 GB recommended) |
| **Storage** | 100 GB SSD for initial setup (scalable) |
| **Backup** | Daily automated backups with 30-day retention |
| **Replication** | Primary-secondary setup for high availability |

#### Email Service
| Requirement | Specification |
|-------------|---------------|
| **SMTP Server** | Third-party (SendGrid, AWS SES, etc.) |
| **Rate Limit** | Minimum 100 emails/minute |
| **Deliverability** | 99%+ successful delivery |

### 2.3 Client (Mobile Device) Requirements

#### Android Devices
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **OS Version** | Android 8.0 (API 26) | Android 12+ (API 31+) |
| **RAM** | 2 GB | 4 GB+ |
| **Storage** | 200 MB free space | 500 MB free space |
| **Screen Size** | 4.5 inches | 5.5+ inches |
| **Processor** | Snapdragon 400 equiv. | Snapdragon 800 equiv. |

#### iOS Devices
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **OS Version** | iOS 13.0 | iOS 15+ |
| **RAM** | 2 GB | 4 GB+ |
| **Storage** | 200 MB free space | 500 MB free space |
| **Screen Size** | 4.7 inches | 6.1+ inches |
| **Device** | iPhone 8 or later | iPhone 12 or later |

### 2.4 Network Requirements

#### Bandwidth
- **Minimum Download:** 2 Mbps
- **Minimum Upload:** 1 Mbps
- **Recommended:** 10+ Mbps for optimal experience

#### Latency
- **Acceptable:** < 200 ms
- **Optimal:** < 50 ms

#### Connectivity
- WiFi or 4G/5G mobile data
- Stable connection for real-time features

---

## 3. SOFTWARE COMPATIBILITY MATRIX

### Operating Systems

#### Development
| OS | Version | Support | Notes |
|----|---------|---------|-------|
| Windows | 10/11 | ✅ Full | Android development preferred |
| macOS | 11+ | ✅ Full | Required for iOS development |
| Linux | Ubuntu 20.04+ | ✅ Full | Android development only |

#### Runtime (Backend)
| OS | Version | Support |
|----|---------|---------|
| Linux | Ubuntu 20.04+ | ✅ Full |
| Linux | CentOS 8+ | ✅ Full |
| macOS | 10.15+ | ✅ Full |
| Windows | Windows Server 2019+ | ✅ Full |

### Browser Support (Admin Dashboard - if applicable)
| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |

---

## 4. SECURITY REQUIREMENTS

### Data Security
- **Encryption in Transit:** TLS 1.2 or higher for all API communications
- **Encryption at Rest:** Database encryption for sensitive data (passwords, tokens)
- **Password Hashing:** bcrypt with salt (minimum 10 rounds)

### Authentication & Authorization
- JWT token-based authentication
- Token expiration: 24 hours
- Refresh token mechanism for extended sessions
- Role-based access control (RBAC) for admin features

### API Security
- CORS (Cross-Origin Resource Sharing) configured
- Rate limiting: 100 requests per minute per client
- Input validation and sanitization
- SQL injection prevention via parameterized queries

### Infrastructure
- SSL/TLS certificates (minimum 2048-bit RSA)
- Firewall protection
- DDoS mitigation
- Regular security patches and updates

---

## 5. PERFORMANCE REQUIREMENTS

### Response Times
- Login/Registration: < 2 seconds
- Product listing: < 1.5 seconds
- Order creation: < 2 seconds
- Real-time notifications: < 500 ms

### Concurrent Users
- **Initial:** 1,000 concurrent users
- **Peak:** 10,000 concurrent users
- **Growth:** 5,000 new users per month

### Database Performance
- Query response time: < 100 ms
- Index optimization for common queries
- Connection pooling (minimum 50 connections)

### Mobile App Performance
- App startup time: < 3 seconds
- Scrolling frame rate: 60 FPS
- Battery consumption: < 5% per hour of active use

---

## 6. BACKUP & DISASTER RECOVERY

### Backup Strategy
- **Frequency:** Daily at 02:00 UTC
- **Retention:** 30 days minimum
- **Location:** Geographically distributed storage
- **Verification:** Weekly restore tests

### Recovery Objectives
- **RTO (Recovery Time Objective):** 4 hours
- **RPO (Recovery Point Objective):** 1 hour
- **Backup Redundancy:** 3 copies in different locations

---

## 7. SCALABILITY REQUIREMENTS

### Horizontal Scaling
- Load balancer (nginx or AWS ELB)
- API server instances can be scaled independently
- Database read replicas for performance

### Vertical Scaling
- Database server can be upgraded without downtime
- Cache layer (Redis) for session and data caching

### Monitoring & Alerts
- CPU usage > 70%
- Memory usage > 80%
- Disk space < 20% available
- API response time > 2 seconds
- Database query time > 500 ms

---

## 8. COMPLIANCE & STANDARDS

### Data Protection
- GDPR compliance (if serving EU users)
- Data retention policies
- User privacy controls

### API Standards
- RESTful API design principles
- JSON data format
- API versioning (v1, v2, etc.)
- OpenAPI/Swagger documentation

### Code Quality
- TypeScript for type safety
- ESLint for code consistency
- Jest for unit testing (minimum 80% coverage)
- SonarQube for code analysis

---

## 9. MAINTENANCE & SUPPORT

### System Maintenance Window
- **Day:** Scheduled maintenance on Sundays
- **Time:** 00:00-02:00 UTC
- **Frequency:** Monthly security patches, quarterly major updates

### Support Channels
- **Email:** support@pastro.app
- **Response Time:** 
  - Critical: 1 hour
  - High: 4 hours
  - Medium: 24 hours
  - Low: 48 hours

### SLA (Service Level Agreement)
- 99.5% uptime availability
- Automatic failover for critical components
- 15-minute incident response for critical issues

---

## Document Version

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | May 28, 2026 | Development Team | Initial specification |

---

**Last Updated:** May 28, 2026
