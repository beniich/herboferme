## 2026-03-06 - [Dashboard Optimization]
**Learning:** Sequential `await` calls for independent data domains (Agro, IT, Maintenance) created a significant performance bottleneck (~550ms with 50ms latency). Consolidating multiple queries into MongoDB `$facet` aggregations and replacing in-memory JS filtering with database-level `$regexMatch` and `$cond` drastically improved performance by ~90%.
**Action:** Always parallelize independent data fetching using `Promise.all` and prefer MongoDB aggregation pipelines over in-memory processing for large datasets.
