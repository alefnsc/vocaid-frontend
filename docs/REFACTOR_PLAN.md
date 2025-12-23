# Vocaid 3-in-1 Platform Refactor — Implementation Plan

## Overview
Transform Vocaid into a unified platform with three product lines:
1. **B2C Interview Practice** - Candidates practice and improve
2. **B2B Recruiter Platform** - Organizations evaluate candidates  
3. **Employee HR Hub** - Internal employee support

**Mission:** Turn interviews into structured, measurable progress.

---

## Gap Analysis Summary

### 🔴 Critical Issues (Block Launch)
1. Navigation inconsistency (TopBar hardcodes items, doesn't use NAV_CONFIG)
2. No B2C personal workspace support
3. No credit ledger (audit trail missing)
4. No free trial grant (3 credits)
5. Analytics missing filter dimensions

### 🟡 Important Issues (Affects Quality)
1. Charts not reusable across landing/app
2. Route structure needs migration path
3. Mobile menu doesn't match sidebar
4. No context switcher UI

### 🟢 Minor Issues (Polish)
1. Unused imports in components
2. Copy/messaging updates
3. Animation consistency

---

## Implementation Phases

### Phase 1: Navigation & App Shell (2-3 days)
**Goal:** Single source of truth for navigation

Tasks:
- [x] Update NAV_CONFIG with B2C/B2B/HR contexts ✅
- [x] Create ContextSwitcher component (B2C/B2B/HR toggle) ✅
- [x] Add new routes in App.tsx (/app/b2c/*, /app/b2b/*, /app/hr, /app/billing) ✅
- [x] Add legacy route redirects ✅
- [ ] Update TopBar to use NAV_CONFIG
- [ ] Update Sidebar to use NAV_CONFIG
- [ ] Ensure mobile menu mirrors desktop
- [ ] Add "Personal Workspace" support for B2C users

### Phase 2: Credit System & Billing Foundation (2-3 days)
**Goal:** Robust credit ledger with free trial

Tasks:
- [ ] Create Prisma schema for CreditsWallet + CreditLedger
- [ ] Implement credit grant on signup (3 credits)
- [ ] Create credit debit service (idempotent via sessionId)
- [x] Add credits display in nav/account area ✅ (in B2C Dashboard)
- [x] Create /app/billing page (balance, history) ✅

### Phase 3: B2C Interview Flow (3-4 days)
**Goal:** Complete practice interview experience

Tasks:
- [x] Create interview setup form (role/title/company/language) ✅
- [x] Add resume selector to interview setup ✅
- [ ] Connect to interview engine (existing)
- [ ] Create post-interview scorecard view
- [ ] Implement credit deduction on completion
- [ ] Create interview history list with filters

### Phase 4: Resume Management (2 days)
**Goal:** Resume upload, storage, and scoring

Tasks:
- [ ] Resume upload component
- [ ] Resume parsing service (basic extraction)
- [ ] Resume scoring algorithm (relevance, structure)
- [ ] Resume library page (/app/b2c/resumes)
- [ ] Link resumes to interview sessions

### Phase 5: Analytics & Filtering (3-4 days)
**Goal:** Consistent analytics across landing and app

Tasks:
- [x] Create AnalyticsFilters component ✅
- [x] Create reusable chart components (Line, Radar, Bar, Area) ✅
- [ ] Add analytics API endpoints with filters
- [x] B2C Dashboard with performance trends ✅
- [ ] Insights page with recommendations

### Phase 6: Mercado Pago Integration (2-3 days)
**Goal:** End-to-end payment flow

Tasks:
- [ ] Create MP preference endpoint
- [ ] Create MP webhook endpoint (with verification)
- [ ] Implement idempotent credit granting
- [x] Credit pack selection UI ✅ (in BillingPage)
- [ ] Post-checkout success/failure pages
- [x] Purchase history in billing page ✅

### Phase 7: Landing Page Rebuild (2-3 days)
**Goal:** Marketing site for all three platforms

Tasks:
- [x] Update hero section (three platforms, one mission) ✅
- [x] Add PlatformShowcase with B2C mock dashboard ✅
- [x] Add B2B section to PlatformShowcase ✅
- [x] Add Employee Hub section to PlatformShowcase ✅
- [x] Update pricing section (free trial emphasis) ✅
- [x] Update FAQ (credits, billing) ✅
- [x] Animate mock dashboard charts ✅ (using recharts)

### Phase 8: Hardening & Testing (2-3 days)
**Goal:** Production-ready quality

Tasks:
- [ ] Write integration tests for credit flow
- [ ] Test payment webhook idempotency
- [ ] Mobile regression testing
- [ ] RBAC verification tests
- [ ] Performance audit
- [ ] Accessibility audit

---

## Prisma Schema Changes

```prisma
// New/Modified Models

model User {
  id              String   @id @default(uuid())
  clerkUserId     String   @unique
  email           String
  name            String?
  createdAt       DateTime @default(now())
  
  // B2C Relationships
  creditsWallet   CreditsWallet?
  interviewSessions InterviewSession[]
  resumes         Resume[]
  
  // B2B Relationships  
  memberships     Membership[]
}

model CreditsWallet {
  id              String   @id @default(uuid())
  userId          String?  @unique
  organizationId  String?  @unique
  balance         Int      @default(0)
  trialGranted    Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user            User?    @relation(fields: [userId], references: [id])
  organization    Organization? @relation(fields: [organizationId], references: [id])
  ledgerEntries   CreditLedger[]
}

model CreditLedger {
  id              String   @id @default(uuid())
  walletId        String
  type            CreditTransactionType
  amount          Int      // positive = credit, negative = debit
  balance         Int      // balance after transaction
  description     String?
  referenceType   String?  // 'session', 'payment', 'adjustment'
  referenceId     String?  // sessionId, paymentId, etc.
  idempotencyKey  String?  @unique
  createdAt       DateTime @default(now())
  
  wallet          CreditsWallet @relation(fields: [walletId], references: [id])
}

enum CreditTransactionType {
  GRANT_TRIAL
  PURCHASE
  DEBIT_INTERVIEW
  DEBIT_RESUME_SCORE
  REFUND
  ADJUSTMENT
  BONUS
}

model InterviewSession {
  id              String   @id @default(uuid())
  userId          String
  organizationId  String?  // null for B2C
  resumeId        String?
  
  // Context
  role            String?  // "Software Engineer"
  jobTitle        String?  // "Senior Frontend Developer"
  company         String?  // "Acme Corp" (optional)
  language        String   @default("en")
  
  // Status
  status          SessionStatus @default(PENDING)
  startedAt       DateTime?
  completedAt     DateTime?
  
  // Scoring
  overallScore    Float?
  scorecard       Json?    // competency breakdown
  
  // Billing
  creditCharged   Boolean  @default(false)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user            User     @relation(fields: [userId], references: [id])
  resume          Resume?  @relation(fields: [resumeId], references: [id])
  organization    Organization? @relation(fields: [organizationId], references: [id])
  transcript      Transcript?
}

enum SessionStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
  FAILED
}

model Resume {
  id              String   @id @default(uuid())
  userId          String
  fileName        String
  fileUrl         String
  fileSize        Int
  mimeType        String
  
  // Parsed content
  parsedContent   Json?
  
  // Scoring
  scoreOverall    Float?
  scoreRelevance  Float?
  scoreClarity    Float?
  scoredAt        DateTime?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user            User     @relation(fields: [userId], references: [id])
  sessions        InterviewSession[]
}

model Payment {
  id              String   @id @default(uuid())
  walletId        String
  provider        String   @default("mercadopago")
  externalId      String   @unique // MP payment ID
  preferenceId    String?  // MP preference ID
  
  amount          Decimal  @db.Decimal(10, 2)
  currency        String   @default("BRL")
  status          PaymentStatus
  
  packId          String?
  creditsAmount   Int
  
  metadata        Json?
  webhookPayload  Json?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  paidAt          DateTime?
  
  wallet          CreditsWallet @relation(fields: [walletId], references: [id])
}

enum PaymentStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
  REFUNDED
}
```

---

## API Routes Specification

### Credit System
```
POST /api/credits/grant-trial
  - Body: { userId }
  - Response: { success, wallet: { balance, trialGranted } }
  - Idempotent: won't grant twice

POST /api/credits/debit
  - Body: { walletId, amount, type, referenceId, idempotencyKey }
  - Response: { success, newBalance, ledgerEntry }
  - Fails if insufficient balance

GET /api/credits/wallet
  - Query: { userId } or { organizationId }
  - Response: { wallet, recentTransactions }
```

### Interview Sessions
```
POST /api/b2c/sessions
  - Body: { role, jobTitle, company?, language, resumeId? }
  - Response: { session, remainingCredits }

POST /api/b2c/sessions/:id/complete
  - Body: { scorecard }
  - Response: { session, creditCharged, newBalance }
  - Debits 1 credit (idempotent via sessionId)

GET /api/b2c/sessions
  - Query: { page, limit, role?, dateFrom?, dateTo? }
  - Response: { sessions, total, page }
```

### Analytics
```
GET /api/analytics/b2c/overview
  - Query: { period: weekly|monthly|yearly, role?, resumeId? }
  - Response: { 
      totalSessions, avgScore, scoresTrend[], 
      topRoles[], topCompanies[] 
    }

GET /api/analytics/b2c/performance
  - Query: { period, groupBy: day|week|month }
  - Response: { dataPoints: [{ date, avgScore, count }] }
```

### Billing / Mercado Pago
```
POST /api/billing/mp/create-preference
  - Body: { packId, quantity? }
  - Response: { preferenceId, initPoint }

POST /api/billing/mp/webhook
  - Body: MP webhook payload
  - Verifies signature, grants credits, idempotent

GET /api/billing/history
  - Query: { page, limit }
  - Response: { payments, total }
```

---

## Frontend Component Tree

```
src/
├── components/
│   ├── analytics/
│   │   ├── AnalyticsFilters.tsx      # Date range + dimension filters
│   │   ├── InterviewVolumeChart.tsx  # Line chart
│   │   ├── PerformanceTrendChart.tsx # Line chart
│   │   ├── ResumeScoreChart.tsx      # Line chart
│   │   ├── CompetencyRadar.tsx       # Radar chart
│   │   └── ScoreDistribution.tsx     # Bar chart
│   │
│   ├── billing/
│   │   ├── CreditBalance.tsx         # Current balance display
│   │   ├── CreditPackSelector.tsx    # Pack cards
│   │   ├── PurchaseHistory.tsx       # Transaction table
│   │   └── CheckoutButton.tsx        # MP checkout trigger
│   │
│   ├── interview/
│   │   ├── InterviewSetupForm.tsx    # Role/title/company/language
│   │   ├── ResumeSelector.tsx        # Resume picker
│   │   └── ScorecardView.tsx         # Post-interview results
│   │
│   ├── resume/
│   │   ├── ResumeUploader.tsx        # Upload component
│   │   ├── ResumeCard.tsx            # Resume preview
│   │   └── ResumeScoreBreakdown.tsx  # Score details
│   │
│   ├── navigation/
│   │   ├── ContextSwitcher.tsx       # B2C/B2B/HR toggle
│   │   ├── AppSidebar.tsx            # Desktop sidebar
│   │   └── MobileMenu.tsx            # Mobile drawer
│   │
│   └── landing/
│       ├── (existing components)
│       └── MockDashboardPreview.tsx  # Animated demo
│
├── pages/
│   ├── app/
│   │   ├── b2c/
│   │   │   ├── dashboard/
│   │   │   ├── interview/
│   │   │   │   └── new/
│   │   │   ├── interviews/
│   │   │   ├── resumes/
│   │   │   └── insights/
│   │   ├── b2b/
│   │   │   ├── dashboard/
│   │   │   ├── kits/
│   │   │   ├── candidates/
│   │   │   ├── analytics/
│   │   │   └── developer/
│   │   ├── hr/
│   │   └── billing/
│   └── Landing/
```

---

## Mercado Pago Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │     │   Backend   │     │ MercadoPago │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │ Select Pack       │                   │
       │──────────────────>│                   │
       │                   │ Create Preference │
       │                   │──────────────────>│
       │                   │                   │
       │                   │<──────────────────│
       │ Init Point URL    │   Preference ID   │
       │<──────────────────│                   │
       │                   │                   │
       │ Redirect to MP    │                   │
       │───────────────────────────────────────>
       │                   │                   │
       │ (User pays in MP) │                   │
       │                   │                   │
       │                   │<──────────────────│
       │                   │ Webhook: approved │
       │                   │                   │
       │                   │ Verify + Grant    │
       │                   │ (idempotent)      │
       │                   │                   │
       │<──────────────────│                   │
       │ Redirect to       │                   │
       │ success page      │                   │
       │                   │                   │
```

### Idempotency Strategy
- Store `externalId` (MP payment ID) as unique in Payment table
- Before granting credits, check if payment already processed
- Use database transaction for credit grant
- Log all webhook events for debugging

---

## Test Gates

### Credit System
- [ ] New user signup creates wallet with 3 credits
- [ ] Second signup attempt doesn't grant additional trial
- [ ] Interview completion debits exactly 1 credit
- [ ] Same session ID doesn't debit twice
- [ ] Insufficient balance prevents interview start

### Payments
- [ ] MP preference created with correct amount
- [ ] Webhook verifies authenticity (as supported)
- [ ] Approved payment grants correct credits
- [ ] Duplicate webhook doesn't grant twice
- [ ] Rejected payment doesn't grant credits

### Navigation
- [ ] TopBar uses NAV_CONFIG for items
- [ ] Mobile menu matches desktop sidebar items
- [ ] Context switcher changes visible nav groups
- [ ] Role-gated items hidden for unauthorized users

### Analytics
- [ ] Weekly/Monthly/Yearly filter works
- [ ] Role filter scopes results
- [ ] Resume filter scopes results
- [ ] B2C queries scoped to userId
- [ ] B2B queries scoped to organizationId

---

## Architecture Upgrades (Post-MVP)

### Event Queue
- Move payment processing to background queue
- Add dead letter queue for failed events
- Retry with exponential backoff

### Analytics Pre-aggregation
- Daily rollup jobs for performance data
- Materialized views for common queries
- Cache layer for dashboard data

### Multi-tenancy Hardening
- Row-level security for B2B data
- Tenant ID in all queries (middleware)
- Audit logging for sensitive operations

### Observability
- Distributed tracing (OpenTelemetry)
- SLO dashboards (latency, error rate)
- Synthetic monitoring for critical paths
- Alert rules for payment failures

---

## Next Steps

1. **Start Phase 1:** Update navigation to use NAV_CONFIG
2. **Parallel:** Design Prisma schema changes
3. **Review:** Get approval on route structure before migration
