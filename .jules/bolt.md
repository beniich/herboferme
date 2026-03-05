## 2026-03-05 - Dashboard Route Optimization
**Learning:** Sequential database queries and in-memory data processing in the dashboard route were causing unnecessary latency and increased memory usage. Consolidating queries with `$facet` and parallelizing with `Promise.all` significantly improves response times.
**Action:** Always check for opportunities to use `$facet` when multiple aggregations/counts are performed on the same collection, and use `Promise.all` for independent I/O operations.
