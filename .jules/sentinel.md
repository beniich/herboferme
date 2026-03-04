## 2025-05-15 - [CRITICAL] Admin Authorization Bypass via Mock Middleware
**Vulnerability:** The `adminOnly` middleware in `herbute-backend/src/routes/admin.ts` was a mock implementation that explicitly called `next()` in its failure branch, allowing any authenticated user (regardless of role) to access sensitive administrative endpoints.
**Learning:** Security placeholders or "dev-only" mocks frequently survive into higher environments and represent critical risks. Bypasses should never be coded directly into authorization logic.
**Prevention:** Always implement security middleware to fail-securely (deny access by default). Avoid local mock reimplementations of centralized security logic.
