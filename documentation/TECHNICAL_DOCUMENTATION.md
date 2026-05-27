# Technical Documentation - Pastro Mobile Application

**Version 1.0**  
**Date:** May 28, 2026  
**Document Type:** Technical Reference Manual

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Installation & Setup](#installation--setup)
3. [Configuration](#configuration)
4. [Development Environment](#development-environment)
5. [Database Schema](#database-schema)
6. [API Documentation](#api-documentation)
7. [Deployment](#deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)
10. [Security Guidelines](#security-guidelines)

---

## 1. System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React Native Mobile Application                      │  │
│  │  - iOS (Swift runtime)                               │  │
│  │  - Android (Kotlin runtime)                          │  │
│  │  - UI: React Native Paper (Material Design)          │  │
│  │  - State: Redux + Redux-Saga                         │  │
│  │  - Storage: InMemoryStorage (session-based)          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         ↓ HTTPS/REST ↓
┌─────────────────────────────────────────────────────────────┐
│               API GATEWAY / LOAD BALANCER                   │
│  - nginx or AWS Application Load Balancer                   │
│  - SSL/TLS termination                                      │
│  - Rate limiting & DDoS protection                          │
└─────────────────────────────────────────────────────────────┘
                         ↓ HTTP (Internal) ↓
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND APPLICATION                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Symfony 6.x Framework                               │  │
│  │  - RESTful API with API Platform                      │  │
│  │  - PHP 8.1+ runtime                                  │  │
│  │  - Doctrine ORM for database operations              │  │
│  │  - JWT authentication middleware                     │  │
│  │  - CORS headers configuration                        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          ↓ SQL              ↓ SMTP            ↓ SSE/WebSocket ↓
┌──────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   MySQL Database │  │  SMTP Service   │  │  Mercure Hub    │
│                  │  │  (SendGrid/AWS) │  │ (Real-time Pub) │
└──────────────────┘  └─────────────────┘  └─────────────────┘
```

### Component Breakdown

#### Frontend (React Native)

```typescript
App Structure:
├── screens/
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── HomeScreen.tsx
│   ├── ProductsScreen.tsx
│   ├── CreateOrderScreen.tsx
│   ├── OrdersScreen.tsx
│   ├── BookingsScreen.tsx
│   ├── ProfileScreen.tsx
│   └── ...
├── components/
│   ├── CustomButton.tsx
│   ├── CustomCard.tsx
│   ├── CustomTextInput.tsx
│   └── ...
├── navigations/
│   ├── AuthNav.tsx
│   ├── MainNav.tsx
│   └── index.tsx
├── app/
│   ├── actions.ts
│   ├── reducers/
│   │   ├── auth.ts
│   │   └── index.ts
│   ├── sagas/
│   │   ├── auth.ts
│   │   └── index.js
│   └── api/
│       └── auth.ts
├── services/
│   ├── api.ts
│   ├── authService.ts
│   ├── orderService.ts
│   ├── productService.ts
│   ├── inMemoryStorage.ts
│   ├── mercureService.ts
│   └── ...
└── utils/
    ├── routes.ts
    ├── image.ts
    └── index.ts
```

#### Backend (Symfony)

```
src/
├── Controller/
│   ├── ApiController.php
│   ├── AuthController.php
│   ├── OrderController.php
│   ├── ProductController.php
│   └── ...
├── Entity/
│   ├── User.php
│   ├── Product.php
│   ├── Order.php
│   ├── Stock.php
│   └── ...
├── Repository/
│   ├── UserRepository.php
│   ├── OrderRepository.php
│   ├── ProductRepository.php
│   └── ...
├── Service/
│   ├── AuthenticationService.php
│   ├── OrderService.php
│   ├── NotificationService.php
│   └── ...
├── EventListener/
│   └── ExceptionListener.php
├── Security/
│   ├── Authenticator.php
│   └── ...
└── Command/
    └── ...
```

---

## 2. Installation & Setup

### Prerequisites

Before installation, ensure you have:

```bash
# Node.js and npm
node --version  # Should be v18.x or higher
npm --version   # Should be v8.x or higher

# Git
git --version   # Should be v2.0+

# Android Development
ANDROID_HOME=/path/to/android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools

# iOS Development (macOS only)
xcode-select --version  # Xcode 14.x+
```

### Frontend Installation

#### Step 1: Clone Repository

```bash
git clone https://github.com/pastrojulieka/PastroFinal_AppDev.git
cd PastroFinal_AppDev
```

#### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

This installs all packages defined in `package.json`:

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-native": "0.84.0",
    "redux": "^4.x",
    "react-redux": "^8.x",
    "redux-saga": "^1.x",
    "axios": "^1.x",
    "react-native-paper": "^5.x",
    "@react-navigation/native": "^6.x",
    "typescript": "^4.x"
  }
}
```

#### Step 3: Configure Environment

Create `.env` file in project root:

```env
# API Configuration
API_BASE_URL=https://finalwebdev-production.up.railway.app/api
API_TIMEOUT=10000

# Authentication
JWT_EXPIRY_HOURS=24
ENABLE_DEV_MODE=true

# Real-time Updates
MERCURE_URL=https://mercure.pastro.app/hub

# Feature Flags
ENABLE_GOOGLE_AUTH=true
ENABLE_NOTIFICATIONS=true
```

#### Step 4: Run Android Development Build

```bash
# Clean build
cd android
./gradlew clean
cd ..

# Run on connected device or emulator
npx react-native run-android --port 8081

# Or use specific configurations
npx react-native run-android --variant release
npx react-native run-android --active-arch arm64-v8a
```

#### Step 5: Run iOS Development Build (macOS only)

```bash
# Install CocoaPods dependencies
cd ios
pod install
cd ..

# Run on simulator
npx react-native run-ios

# Or specify device
npx react-native run-ios --simulator "iPhone 14"
```

#### Step 6: Verify Installation

```bash
# Check metro bundler is running
# Terminal should show: "MetroMetroBundler ready."

# App should launch on device/emulator
# Should see Pastro login screen
```

### Backend Installation

#### Step 1: Clone Backend Repository

```bash
git clone https://github.com/pastrojulieka/pastro-backend.git
cd pastro-backend
```

#### Step 2: Install PHP Dependencies

```bash
composer install
```

#### Step 3: Environment Configuration

Create `.env.local`:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/pastro_db

# JWT
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem

# Email
MAILER_DSN=smtp://username:password@smtp.sendgrid.net:587

# Mercure
MERCURE_URL=http://localhost:3000/.well-known/mercure
MERCURE_JWT_SECRET=your-secret-key

# Frontend URL
FRONTEND_URL=http://localhost:8080
```

#### Step 4: Generate JWT Keys

```bash
mkdir -p config/jwt
openssl genrsa -out config/jwt/private.pem 4096
openssl rsa -in config/jwt/private.pem -pubout -out config/jwt/public.pem
```

#### Step 5: Setup Database

```bash
# Create database
php bin/console doctrine:database:create

# Run migrations
php bin/console doctrine:migrations:migrate

# Load fixtures (sample data)
php bin/console doctrine:fixtures:load
```

#### Step 6: Start Development Server

```bash
# Using Symfony CLI
symfony serve

# Or using PHP built-in server
php -S localhost:8000 -t public

# Server should be running at http://localhost:8000
```

### Database Installation

#### Step 1: Install MySQL

```bash
# macOS (using Homebrew)
brew install mysql

# Ubuntu/Debian
sudo apt-get install mysql-server

# Windows
# Download from: https://dev.mysql.com/downloads/mysql/
```

#### Step 2: Start MySQL Service

```bash
# macOS
mysql.server start

# Ubuntu/Debian
sudo systemctl start mysql

# Windows
# Use MySQL Workbench or command line
```

#### Step 3: Create Database & User

```sql
-- Login to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE pastro_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'pastro_user'@'localhost' IDENTIFIED BY 'strong_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON pastro_db.* TO 'pastro_user'@'localhost';
FLUSH PRIVILEGES;

-- Verify
SHOW DATABASES;
```

#### Step 4: Initialize Tables

```bash
# Using Doctrine (Symfony)
php bin/console doctrine:migrations:migrate

# Or manually run SQL files
mysql -u pastro_user -p pastro_db < database/schema.sql
```

---

## 3. Configuration

### Frontend Configuration

#### API Interceptor Configuration

File: `src/services/api.ts`

```typescript
const api: AxiosInstance = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/ld+json',
  },
});

// JWT interceptor adds Authorization header
api.interceptors.request.use(async (config) => {
  const token = await storage.getItem(AUTH_TOKEN_KEY);
  if (token && !token.startsWith('dev_')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### Redux Store Configuration

File: `src/app/reducers/index.ts`

```typescript
import { combineReducers } from 'redux';
import authReducer from './auth';

const rootReducer = combineReducers({
  auth: authReducer,
  // Add other reducers here
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
```

#### Redux-Saga Middleware

File: `src/app/sagas/index.js`

```javascript
import { fork } from 'redux-saga/effects';
import authSaga from './auth';

export function* rootSaga() {
  yield fork(authSaga);
  // Add other sagas here
}
```

### Backend Configuration

#### JWT Configuration

File: `config/packages/lexik_jwt_authentication.yaml`

```yaml
lexik_jwt_authentication:
  secret_key: '%env(JWT_SECRET_KEY)%'
  public_key: '%env(JWT_PUBLIC_KEY)%'
  pass_phrase: '%env(JWT_PASSPHRASE)%'
  token_ttl: 86400  # 24 hours
  clock_skew: 0
```

#### CORS Configuration

File: `config/packages/nelmio_cors.yaml`

```yaml
nelmio_cors:
  defaults:
    allow_credentials: true
    allow_origin:
      - 'http://localhost:8080'
      - 'http://localhost:3000'
      - 'https://pastro.app'
    allow_headers: ['*']
    allow_methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
    expose_headers: ['X-Total-Count']
    max_age: 3600
```

#### Database Connection

File: `config/doctrine.yaml`

```yaml
doctrine:
  dbal:
    url: '%env(resolve:DATABASE_URL)%'
    charset: utf8mb4
  orm:
    auto_generate_proxy_classes: true
    naming_strategy: doctrine.orm.naming_strategy.underscore
    mappings:
      App:
        is_bundle: false
        type: attribute
        dir: '%kernel.project_dir%/src/Entity'
        prefix: 'App\Entity'
        alias: App
```

---

## 4. Development Environment

### Development Tools Setup

#### IDE Configuration (VS Code)

```json
// .vscode/settings.json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "eslint.enable": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

#### Required VS Code Extensions

```
- ES7+ React/Redux/React-Native snippets (dsznajder.es7-react-js-snippets)
- Prettier - Code formatter (esbenp.prettier-vscode)
- ESLint (dbaeumer.vscode-eslint)
- TypeScript Vue Plugin (Vue.vscode-typescript-vue-plugin)
- React Native Tools (msjsdiag.vscode-react-native)
```

### Running Development Server

#### Terminal 1: Metro Bundler

```bash
# Start React Native development server
npx react-native start --port 8081

# Output should show:
# MetroMetroBundler ready.
# To reload the app press r
```

#### Terminal 2: Symfony Backend

```bash
# Start Symfony development server
cd /path/to/backend
symfony serve --port=8000

# Output should show:
# Server running at http://127.0.0.1:8000
```

#### Terminal 3: Run App

```bash
# Run on Android
npx react-native run-android

# Or iOS (macOS)
npx react-native run-ios

# App should launch with hot reload enabled
```

### Debugging

#### React Native Debugger

```bash
# Install React Native Debugger
# https://github.com/jhen0409/react-native-debugger

# Start with custom flags
npx react-native start --verbose

# In app: Press Ctrl+M (Android) or Cmd+D (iOS)
# Select "Debug with Chrome"
```

#### Redux DevTools

```typescript
// In store configuration, add:
import { composeWithDevTools } from 'redux-devtools-extension';

const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(sagaMiddleware))
);
```

#### Console Logging

```typescript
// Useful debug patterns:
console.log('Login response:', JSON.stringify(response.data, null, 2));
console.error('API Error:', error.response?.data);
console.warn('Deprecation warning:', message);
```

---

## 5. Database Schema

### Core Tables

#### Users Table

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_verified (verified_at)
);
```

#### Products Table

```sql
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    material VARCHAR(100),
    color VARCHAR(100),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_name (name),
    INDEX idx_price (price)
);
```

#### Orders Table

```sql
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total_price DECIMAL(10, 2),
    status ENUM('pending', 'processing', 'ready', 'completed', 'cancelled') DEFAULT 'pending',
    material VARCHAR(100),
    color VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_status (status),
    INDEX idx_customer (customer_name),
    INDEX idx_created (created_at)
);
```

#### Stock Table

```sql
CREATE TABLE stock (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL UNIQUE,
    quantity_available INT NOT NULL DEFAULT 0,
    quantity_reserved INT NOT NULL DEFAULT 0,
    status ENUM('in_stock', 'low_stock', 'out_of_stock') DEFAULT 'in_stock',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_status (status)
);
```

### Query Examples

#### Get User with Orders

```sql
SELECT u.id, u.email, u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.id = ?
GROUP BY u.id;
```

#### Get Products with Stock Status

```sql
SELECT p.id, p.name, p.price, s.quantity_available, s.status
FROM products p
INNER JOIN stock s ON p.id = s.product_id
WHERE s.status = 'in_stock'
ORDER BY p.created_at DESC;
```

---

## 6. API Documentation

### Authentication Endpoints

#### POST /api/login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "verified": true
  }
}
```

**Response (Email Not Verified):**
```json
{
  "success": false,
  "verified": false,
  "message": "Please verify your email before logging in"
}
```

#### POST /api/register

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "name": "Jane Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Verification email sent.",
  "user": {
    "id": 2,
    "email": "newuser@example.com",
    "name": "Jane Doe",
    "verified": false
  }
}
```

### Product Endpoints

#### GET /api/products

**Query Parameters:**
- `page` (int) - Page number (default: 1)
- `limit` (int) - Items per page (default: 20)
- `search` (string) - Search term

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Product Name",
      "description": "Description",
      "price": 99.99,
      "material": "Cotton",
      "color": "White",
      "image_url": "https://...",
      "stock": {
        "quantity_available": 50,
        "status": "in_stock"
      }
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

### Order Endpoints

#### POST /api/orders?customer_name=John

**Request:**
```json
{
  "product_id": 1,
  "quantity": 2,
  "material": "Cotton",
  "color": "Blue"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 101,
    "product_id": 1,
    "customer_name": "John",
    "quantity": 2,
    "total_price": 199.98,
    "status": "pending",
    "created_at": "2026-05-28T10:30:00Z"
  }
}
```

#### GET /api/orders

**Response:**
```json
{
  "data": [
    {
      "id": 101,
      "product_id": 1,
      "customer_name": "John",
      "quantity": 2,
      "total_price": 199.98,
      "status": "pending",
      "created_at": "2026-05-28T10:30:00Z"
    }
  ]
}
```

---

## 7. Deployment

### Frontend Deployment

#### Android Release Build

```bash
# Build signed APK
cd android
./gradlew assembleRelease -x bundleRelease

# Build App Bundle (for Play Store)
./gradlew bundle

# Output: android/app/build/outputs/apk/release/app-release.apk
```

#### iOS Release Build

```bash
# Build for App Store
xcodebuild -workspace ios/AppDev.xcworkspace \
  -scheme AppDev \
  -configuration Release \
  -archivePath build/AppDev.xcarchive \
  archive

# Export for App Store
xcodebuild -exportArchive \
  -archivePath build/AppDev.xcarchive \
  -exportOptionsPlist ios/ExportOptions.plist \
  -exportPath build/
```

### Backend Deployment

#### Docker Deployment

**Dockerfile:**
```dockerfile
FROM php:8.1-fpm

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN composer install --optimize-autoloader --no-dev

CMD ["php-fpm"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  php:
    build: .
    container_name: pastro-backend
    working_dir: /app
    volumes:
      - ./:/app
    ports:
      - "9000:9000"
    networks:
      - pastro

  nginx:
    image: nginx:latest
    container_name: pastro-nginx
    ports:
      - "80:80"
    volumes:
      - ./:/app
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - php
    networks:
      - pastro

  db:
    image: mysql:8.0
    container_name: pastro-db
    environment:
      MYSQL_DATABASE: pastro_db
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_USER: pastro_user
      MYSQL_PASSWORD: user_password
    ports:
      - "3306:3306"
    networks:
      - pastro

networks:
  pastro:
    driver: bridge
```

**Deploy:**
```bash
# Build and start containers
docker-compose up -d

# Run migrations
docker-compose exec php php bin/console doctrine:migrations:migrate

# Verify deployment
docker-compose ps
```

#### Cloud Deployment (Railway/Heroku)

```bash
# Set environment variables
railway env set DATABASE_URL=mysql://...
railway env set JWT_SECRET_KEY=...

# Deploy
git push railway main

# Or using Heroku CLI
heroku create pastro-app
git push heroku main
heroku run "php bin/console doctrine:migrations:migrate"
```

---

## 8. Monitoring & Maintenance

### Application Monitoring

#### Health Check Endpoint

```php
// GET /api/health

public function health(): JsonResponse
{
    return new JsonResponse([
        'status' => 'ok',
        'timestamp' => new DateTime(),
        'database' => $this->checkDatabase(),
        'cache' => $this->checkCache(),
    ]);
}
```

#### Log Monitoring

```bash
# Real-time logs
tail -f logs/prod.log

# Filter errors
grep ERROR logs/prod.log

# Find API errors
grep "api" logs/prod.log | grep ERROR
```

### Database Maintenance

#### Regular Backups

```bash
# Backup database
mysqldump -u pastro_user -p pastro_db > backup_$(date +%Y%m%d).sql

# Restore from backup
mysql -u pastro_user -p pastro_db < backup_20260528.sql

# Automated backup (cron)
0 2 * * * /usr/local/bin/backup-db.sh
```

#### Performance Optimization

```sql
-- Analyze tables
ANALYZE TABLE users, products, orders, stock;

-- Optimize tables
OPTIMIZE TABLE users, products, orders, stock;

-- Check table status
CHECK TABLE users;

-- Repair if needed
REPAIR TABLE users;
```

---

## 9. Troubleshooting

### Common Issues

#### Metro Bundler Issues

**Problem:** "Unable to resolve module"

**Solution:**
```bash
# Clear cache and restart
rm -rf node_modules
npm install
npm start -- --reset-cache
```

#### Database Connection Issues

**Problem:** "PDOException: SQLSTATE[HY000]"

**Solution:**
```bash
# Check MySQL is running
sudo systemctl status mysql

# Verify credentials in .env
cat .env.local | grep DATABASE_URL

# Test connection
mysql -u user -p -h localhost -D database_name
```

#### JWT Token Errors

**Problem:** "Invalid JWT token"

**Solution:**
```bash
# Regenerate JWT keys
rm config/jwt/*.pem
openssl genrsa -out config/jwt/private.pem 4096
openssl rsa -in config/jwt/private.pem -pubout -out config/jwt/public.pem

# Clear cache
php bin/console cache:clear
```

#### CORS Errors

**Problem:** "Access to XMLHttpRequest has been blocked"

**Solution:**
```yaml
# Update nelmio_cors.yaml
nelmio_cors:
  defaults:
    allow_origin: ['http://localhost:*', 'https://yourdomain.com']
    allow_credentials: true
```

---

## 10. Security Guidelines

### Code Security

#### Input Validation

```typescript
// Always validate input
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};
```

#### HTTPS Only

```typescript
// Force HTTPS in production
if (!url.startsWith('https') && process.env.NODE_ENV === 'production') {
  throw new Error('HTTPS required in production');
}
```

### Secrets Management

```bash
# Never commit secrets to version control
# Use .env files (add to .gitignore)

echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore
echo "config/jwt/*.pem" >> .gitignore

# Use environment variables or secret management services
# - AWS Secrets Manager
# - Azure Key Vault
# - HashiCorp Vault
```

### Data Protection

```sql
-- Hash passwords
UPDATE users SET password = SHA2(password, 256) WHERE password NOT LIKE '$2%';

-- Encrypt sensitive data
ALTER TABLE users ADD COLUMN phone_encrypted VARBINARY(255);
UPDATE users SET phone_encrypted = AES_ENCRYPT(phone, 'encryption_key');
```

---

## Support & References

| Resource | Link |
|----------|------|
| React Native Docs | https://reactnative.dev |
| Symfony Docs | https://symfony.com/doc |
| MySQL Docs | https://dev.mysql.com/doc |
| API Platform | https://api-platform.com |

---

**Document Version:** 1.0  
**Last Updated:** May 28, 2026  
**Maintainer:** Development Team
