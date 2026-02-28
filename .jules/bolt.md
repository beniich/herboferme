## 2025-05-15 - [Consolidation of Dashboard Queries]
**Learning:** The `getComplaintStats` method was performing 3 separate database round-trips (1 count + 2 aggregations). Using MongoDB's `$facet` operator allows combining these into a single query, significantly reducing network overhead and database load for analytics-heavy endpoints.
**Action:** Always prefer `$facet` when multiple aggregations are needed on the same filtered dataset for dashboards or reporting features.
