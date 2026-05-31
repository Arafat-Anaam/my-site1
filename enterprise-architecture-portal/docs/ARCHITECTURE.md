# 🏛️ Enterprise Architecture Portal - Complete Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Sections](#architecture-sections)
3. [Database Design](#database-design)
4. [User Workflows](#user-workflows)
5. [Security Framework](#security-framework)
6. [Infrastructure](#infrastructure)
7. [API Documentation](#api-documentation)
8. [Roadmap & Timeline](#roadmap--timeline)

---

## System Overview

### Project Vision
A **Hybrid Offline-First Multi-Tenant Multi-Branch Accounting & POS Platform** that combines:
- Enterprise-grade accounting capabilities
- Modern point-of-sale system
- Offline-first architecture
- Cloud synchronization (optional)
- Modular plugin system
- Hardware-based licensing

### Key Characteristics
- ✅ Works without internet connection
- ✅ Multi-branch synchronization via LAN
- ✅ Multi-currency with historical rates
- ✅ Domain-driven design
- ✅ Role-based access control
- ✅ Remote maintenance capabilities
- ✅ Automatic backups
- ✅ Audit logging

---

## Architecture Sections

### 1. System Architecture

#### 1.1 High-Level Architecture
```
┌─────────────────────────────────────┐
│      Presentation Layer             │
│  ┌──────────────────────────────┐   │
│  │ Desktop UI │ Mobile App      │   │
│  │ POS        │ Admin Dashboard │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
           ↕
┌─────────────────────────────────────┐
│     Business Logic Layer            │
│  ┌──────────────────────────────┐   │
│  │ Accounting Engine            │   │
│  │ Inventory Manager            │   │
│  │ Sales Processor              │   │
│  │ Currency Handler             │   │
│  │ Sync Engine                  │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
           ↕
┌─────────────────────────────────────┐
│     Data Access Layer               │
│  ┌──────────────────────────────┐   │
│  │ Repository Pattern           │   │
│  │ Query Builder                │   │
│  │ Cache Management             │   │
│  │ Migration Handler            │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
           ↕
┌─────────────────────────────────────┐
│      Data Storage Layer             │
│  ┌──────────────────────────────┐   │
│  │ Local Database               │   │
│  │ Cloud Backup                 │   │
│  │ File Storage                 │   │
│  │ Offline Queue                │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

#### 1.2 Modular Architecture
```
Core System
├── Accounting Module
│   ├── Journal Entries
│   ├── Chart of Accounts
│   ├── General Ledger
│   ├── Financial Reports
│   └── Year-End Closing
├── POS Module
│   ├── Sales Processing
│   ├── Payment Handling
│   ├── Receipt Printing
│   └── Drawer Management
├── Inventory Module
│   ├── Stock Management
│   ├── Barcode Scanning
│   ├── Stock Levels
│   └── Movement History
├── Multi-Currency Module
│   ├── Exchange Rate Management
│   ├── Currency Conversion
│   ├── Historical Rates
│   └── Revaluation
├── Sync Engine
│   ├── LAN Sync
│   ├── Cloud Sync
│   ├── Conflict Resolution
│   └── Offline Queue
└── Security Module
    ├── Authentication
    ├── Authorization
    ├── Encryption
    └── Audit Logging
```

### 2. Deployment Architecture

#### 2.1 Deployment Profiles

**Profile 1: Single Location (Standalone)**
- Single server installation
- Local database only
- Optional cloud backup
- No branch communication

**Profile 2: Multi-Branch LAN**
- Central server + branch clients
- LAN-based synchronization
- No internet required
- Real-time or periodic sync

**Profile 3: Multi-Branch Cloud**
- Central server + branch clients
- Cloud synchronization
- Internet required
- Automatic sync with conflict resolution

**Profile 4: Hybrid Cloud**
- Cloud primary + local backup
- Optional offline mode
- Automatic failover
- Best of both worlds

---

## Database Design

### Core Database Tables

#### 1. Chart of Accounts
```sql
CREATE TABLE chart_of_accounts (
  id UUID PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  description TEXT,
  account_type ENUM('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'),
  normal_balance ENUM('DEBIT', 'CREDIT'),
  parent_id UUID REFERENCES chart_of_accounts(id),
  is_leaf BOOLEAN DEFAULT FALSE,
  currency_id UUID REFERENCES currencies(id),
  opening_balance NUMERIC(20, 6),
  current_balance NUMERIC(20, 6),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  KEY idx_code (code),
  KEY idx_parent (parent_id),
  KEY idx_type (account_type)
);
```

#### 2. Journal Entries
```sql
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY,
  entry_number VARCHAR(50) UNIQUE NOT NULL,
  entry_date DATE NOT NULL,
  period_id UUID REFERENCES fiscal_periods(id),
  reference VARCHAR(100),
  description TEXT,
  total_debit NUMERIC(20, 6),
  total_credit NUMERIC(20, 6),
  status ENUM('DRAFT', 'POSTED', 'REVERSED'),
  reversal_of_id UUID REFERENCES journal_entries(id),
  created_by UUID REFERENCES users(id),
  posted_by UUID REFERENCES users(id),
  posted_at TIMESTAMP,
  branch_id UUID REFERENCES branches(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT check_balanced CHECK (total_debit = total_credit),
  KEY idx_date (entry_date),
  KEY idx_period (period_id),
  KEY idx_status (status)
);
```

#### 3. Journal Lines
```sql
CREATE TABLE journal_lines (
  id UUID PRIMARY KEY,
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id),
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  debit NUMERIC(20, 6) DEFAULT 0,
  credit NUMERIC(20, 6) DEFAULT 0,
  currency_id UUID REFERENCES currencies(id),
  exchange_rate NUMERIC(18, 8),
  base_amount NUMERIC(20, 6),
  description TEXT,
  
  KEY idx_entry (journal_entry_id),
  KEY idx_account (account_id)
);
```

#### 4. Customers & Accounts Receivable
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  customer_id_display VARCHAR(50) UNIQUE,
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  address_ar TEXT,
  tax_id VARCHAR(50),
  credit_limit NUMERIC(20, 2),
  payment_terms INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  branch_id UUID REFERENCES branches(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  KEY idx_name (name),
  KEY idx_branch (branch_id)
);

CREATE TABLE customer_transactions (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  invoice_id VARCHAR(50),
  type ENUM('INVOICE', 'PAYMENT', 'CREDIT_NOTE'),
  amount NUMERIC(20, 2),
  balance NUMERIC(20, 2),
  transaction_date DATE,
  due_date DATE,
  reference VARCHAR(100),
  created_at TIMESTAMP
);
```

#### 5. Inventory Management
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  description TEXT,
  unit_type VARCHAR(50),
  category_id UUID REFERENCES product_categories(id),
  cost_price NUMERIC(20, 4),
  selling_price NUMERIC(20, 4),
  tax_rate NUMERIC(5, 2),
  is_active BOOLEAN DEFAULT TRUE,
  branch_id UUID REFERENCES branches(id),
  created_at TIMESTAMP
);

CREATE TABLE inventory_stock (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  branch_id UUID REFERENCES branches(id),
  quantity_on_hand INT,
  quantity_reserved INT,
  quantity_available INT GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved),
  reorder_level INT,
  reorder_quantity INT,
  last_count_date DATE,
  
  UNIQUE KEY unique_product_branch (product_id, branch_id)
);

CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  branch_id UUID REFERENCES branches(id),
  movement_type ENUM('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT', 'DAMAGE'),
  quantity INT,
  reference_id VARCHAR(100),
  reference_type VARCHAR(50),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP,
  
  KEY idx_product (product_id),
  KEY idx_date (created_at)
);
```

#### 6. Multi-Currency Support
```sql
CREATE TABLE currencies (
  id UUID PRIMARY KEY,
  code VARCHAR(3) UNIQUE NOT NULL,
  name VARCHAR(100),
  symbol VARCHAR(5),
  is_base BOOLEAN DEFAULT FALSE,
  decimal_places INT DEFAULT 2,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY,
  from_currency_id UUID REFERENCES currencies(id),
  to_currency_id UUID REFERENCES currencies(id),
  rate NUMERIC(18, 8) NOT NULL,
  rate_date DATE NOT NULL,
  source VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  
  UNIQUE KEY unique_rate (from_currency_id, to_currency_id, rate_date),
  KEY idx_date (rate_date)
);

CREATE TABLE exchange_rate_history (
  id UUID PRIMARY KEY,
  currency_id UUID REFERENCES currencies(id),
  rate_date DATE,
  opening_rate NUMERIC(18, 8),
  closing_rate NUMERIC(18, 8),
  high_rate NUMERIC(18, 8),
  low_rate NUMERIC(18, 8),
  average_rate NUMERIC(18, 8),
  
  UNIQUE KEY unique_history (currency_id, rate_date)
);
```

#### 7. Audit Logging
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  record_id VARCHAR(100),
  operation ENUM('CREATE', 'UPDATE', 'DELETE'),
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  user_id UUID REFERENCES users(id),
  ip_address VARCHAR(50),
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  KEY idx_table (table_name),
  KEY idx_user (user_id),
  KEY idx_timestamp (timestamp)
);
```

---

## User Workflows

### 1. Sales Workflow
```
Customer arrives
    ↓
Open POS Screen
    ↓
[Choose Customer or Quick Sale]
    ↓
Scan/Select Products
    ↓
Enter Quantities
    ↓
Apply Discounts (if applicable)
    ↓
Review Total
    ↓
Select Payment Method (Cash/Card/Credit)
    ↓
Process Payment
    ↓
[Payment Approved?]
    ├─ YES → Print Receipt
    │         Update Inventory
    │         Create Journal Entry
    │         Complete Sale
    └─ NO  → Retry Payment or Cancel
```

### 2. Accounting Workflow
```
Sales Transaction
    ↓
Auto-Generated Journal Entry
    ↓
Review by Accountant
    ↓
Approve Entry
    ↓
Post to General Ledger
    ↓
Update Account Balances
    ↓
Generate Reports
    ↓
Year-End Closing Process
```

### 3. Inventory Management
```
Product Received
    ↓
Barcode Scan/Manual Entry
    ↓
Quantity Entry
    ↓
Cost Price Validation
    ↓
Add to Stock
    ↓
Update Inventory Balance
    ↓
Generate Stock Movement Record
    ↓
Trigger Reorder Alert (if below threshold)
```

---

## Security Framework

### 1. Authentication
- Multi-factor authentication (MFA)
- Hardware fingerprinting for offline use
- Device-based activation
- Session management
- Token-based API authentication

### 2. Authorization
- Role-based access control (RBAC)
- Granular permissions (action-level)
- Resource-level access (branch-specific)
- Delegation capabilities

### 3. Encryption
- AES-256 for data at rest
- TLS 1.3 for data in transit
- Key management system (KMS)
- Encrypted backups

### 4. Audit
- All user actions logged
- Change tracking (what, who, when)
- Immutable audit trail
- Tamper detection

---

## Infrastructure

### 1. Deployment Options

**On-Premises**
- Single server installation
- Local network synchronization
- Optional cloud backup
- Full control and privacy

**Cloud-Based**
- AWS/Azure/GCP hosting
- Automatic scaling
- Managed backups
- Disaster recovery

**Hybrid**
- Primary cloud with local backup
- Offline mode capability
- Automatic synchronization
- Best resilience

### 2. Scaling Strategy
- Horizontal scaling for stateless services
- Database replication for high availability
- Caching layer (Redis) for performance
- CDN for content delivery
- Load balancing for distribution

### 3. Backup & Recovery
- Hourly incremental backups
- Daily full backups
- Multi-region replication
- Point-in-time recovery
- Disaster recovery procedures

---

## API Documentation

### 1. Core Endpoints

#### Sales APIs
```
POST   /api/v1/sales              - Create sale
GET    /api/v1/sales/:id          - Get sale details
PUT    /api/v1/sales/:id          - Update sale
DELETE /api/v1/sales/:id          - Cancel sale
GET    /api/v1/sales/daily-report - Get daily report
```

#### Accounting APIs
```
GET    /api/v1/accounts           - List chart of accounts
GET    /api/v1/accounts/:id       - Get account details
POST   /api/v1/journal-entries    - Create journal entry
GET    /api/v1/journal-entries    - List entries
GET    /api/v1/general-ledger/:id - Get GL for account
GET    /api/v1/reports/trial-balance
GET    /api/v1/reports/income-statement
GET    /api/v1/reports/balance-sheet
```

#### Inventory APIs
```
GET    /api/v1/products           - List products
GET    /api/v1/inventory          - Get stock levels
PUT    /api/v1/inventory/:product - Update stock
POST   /api/v1/transfers          - Create stock transfer
GET    /api/v1/movements          - Get movement history
```

### 2. Authentication
```
Header: Authorization: Bearer {token}
```

### 3. Response Format
```json
{
  "success": true,
  "data": { },
  "error": null,
  "timestamp": "2026-05-31T12:00:00Z"
}
```

---

## Roadmap & Timeline

### Phase 1: Discovery & Analysis (Complete)
- Business requirements analysis
- Market research
- Competitive analysis
- User personas definition

### Phase 2: Domain Deep Dive (In Progress)
- Accounting domain study
- POS system design
- Inventory management design
- Multi-currency engine design

### Phase 3: System Architecture
- High-level design
- Component breakdown
- Technology selection
- Infrastructure planning

### Phase 4: Database Design
- Schema design
- Relationship modeling
- Indexing strategy
- Performance optimization

### Phase 5: API Design
- Endpoint specification
- Authentication design
- Rate limiting
- Error handling

### Phase 6: Frontend Development
- Component library
- Page layouts
- Interactive features
- Mobile responsiveness

### Phase 7: Backend Development
- API implementation
- Business logic
- Data validation
- Error handling

### Phase 8: DevOps & Deployment
- Infrastructure setup
- CI/CD pipeline
- Monitoring & logging
- Security hardening

---

## Contact & Support

For questions or clarifications, please refer to the project documentation or contact the development team.

**Last Updated**: 2026-05-31
**Version**: 1.0.0
**Status**: Active Development
