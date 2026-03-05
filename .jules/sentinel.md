## 2025-05-14 - [Unprotected File Upload Endpoint]
**Vulnerability:** The `/api/upload` endpoint was completely unprotected, allowing any anonymous user to upload files to the server.
**Learning:** Utility endpoints can sometimes be overlooked during security reviews if they are not part of the main domain logic.
**Prevention:** Use a standard template or middleware stack for all new routes to ensure authentication and authorization are applied by default.
