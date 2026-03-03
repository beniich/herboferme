## 2026-03-03 - [Dashboard Aggregation Optimization]
**Learning:** The dashboard route was performing sequential database queries and in-memory processing of large collections. Combining these into a single `Promise.all` with MongoDB `$facet` aggregations significantly reduces the number of database round-trips and leverages the database engine for filtering/reduction.
**Action:** Always look for opportunities to parallelize independent database queries and use `$facet` to consolidate multiple aggregations on the same collection.
