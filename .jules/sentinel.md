## 2025-02-12 - Admin Middleware Development Bypass
**Vulnerability:** The `adminOnly` middleware in `herbute-backend/src/routes/admin.ts` was a mock implementation that called `next()` regardless of the user's role, effectively bypassing all authorization checks for administrative endpoints.
**Learning:** Development-time bypasses and mock implementations in security-critical middleware are high-risk patterns that can easily be forgotten and leak into production.
**Prevention:** Always implement a strict fail-secure check even in development mocks, or use environment-specific configuration to explicitly enable/disable security features rather than hardcoding a bypass in the middleware logic itself.
