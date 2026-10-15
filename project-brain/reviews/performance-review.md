# Performance Review Rubric

## Checklist
- [ ] Are multiple database fetches parallelized using `Promise.all`?
- [ ] Does the implementation avoid client-side data waterfalls (`useEffect(fetch)`)?
- [ ] Is `memoryCache` and React `cache()` utilized appropriately for repeated reads?
- [ ] Does every database mutation trigger cache epoch synchronization (`.cache-timestamp`)?
- [ ] Are large components or heavy libraries (e.g., Recharts) loaded only when needed?
- [ ] Are list items uniquely and stably keyed?

## Scoring Threshold
- Minimum acceptable score: 90 / 100.
