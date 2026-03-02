## 2025-05-15 - [Whitelist-based CORS Policy]
**Vulnerability:** Overly permissive CORS configuration (`origin: true`) allowed any origin to make credentialed requests to the API.
**Learning:** Defaulting to `origin: true` in production is a significant security risk, especially when `credentials: true` is enabled, as it effectively disables CORS protections for credentialed requests.
**Prevention:** Always use a whitelist-based origin check in production, derived from trusted environment variables.

## 2025-05-15 - [Import Errors in Production-ready Code]
**Vulnerability:** Broken imports (`bcrypt` instead of `bcryptjs`, missing `Router`) prevented the application from starting/compiling.
**Learning:** Even security-focused changes can be blocked by pre-existing technical debt. Ensuring a clean build is essential before and after security fixes.
**Prevention:** Run a full type-check and build as part of the CI/CD pipeline and before submitting any PR.
