## 2025-05-15 - [Dashboard Stats Inefficiency]
**Learning:** The dashboard route was performing multiple sequential database queries and in-memory array filtering/reductions for statistics that could be more efficiently handled by MongoDB's aggregation framework, specifically using `$facet`.
**Action:** Consolidate multiple count and grouping operations into single aggregation pipelines per model. Use MongoDB's `$group` and `$sum` for animal population stats instead of fetching all records and processing in Node.js.
