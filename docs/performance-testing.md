# Performance Testing

This document describes the performance/load testing framework integrated into the Playwright Pilot project using Artillery with Playwright engine.

## Overview

Performance tests extend the existing challenge-based testing framework to include comprehensive load testing capabilities. Tests use Artillery with Playwright engine to simulate concurrent users and measure API performance under load.

## Architecture

### Performance Test Structure

Performance tests follow a similar challenge-based pattern as E2E and API tests:

```text
tests/performance/
├── challenges/
│   ├── jsonplaceholder/    # JSONPlaceholder API load tests
│   ├── reqres/             # ReqRes.in API load tests
│   └── httpbin/            # HTTPBin load tests
├── utils/                   # Performance testing utilities
└── world.ts                 # Performance test fixtures
```

### Challenge Structure

Each challenge contains:

- **config/**: Artillery YAML configuration files defining load test scenarios
- **processors/**: JavaScript processor files with flow functions for Artillery
- ***.load.spec.ts**: Playwright test wrappers that execute Artillery tests and validate results

### Artillery Configuration

Artillery configuration files define:

- **Phases**: Load patterns (warm-up, normal load, spike, ramp-down)
- **Engines**: Playwright engine configuration
- **Scenarios**: Test scenarios with weights
- **Processors**: JavaScript files with flow functions

Example configuration:

```yaml
config:
  target: 'https://jsonplaceholder.typicode.com'
  phases:
    - duration: 30
      arrivalRate: 2
      name: 'Warm up'
    - duration: 60
      arrivalRate: 5
      name: 'Normal load'
  engines:
    playwright:
      launchOptions:
        headless: true
  processor: './processors/posts-processor.js'
scenarios:
  - name: 'GET all posts'
    engine: playwright
    flowFunction: 'getAllPostsFlow'
    weight: 50
```

### Processor Functions

Processors are JavaScript files that export flow functions executed by Artillery:

```javascript
module.exports = {
  getAllPostsFlow,
};

async function getAllPostsFlow(page) {
  const response = await page.request.get('/posts');
  
  if (!response.ok()) {
    throw new Error(`Failed: ${response.status()}`);
  }
  
  return await response.json();
}
```

## Running Performance Tests

### Run All Performance Tests

```bash
bun run test:performance
```

### Run Specific Challenge

```bash
bun run test:performance:jsonplaceholder
```

### Run Artillery Directly

```bash
bun run load:jsonplaceholder
```

### Using Playwright Test Runner

Performance tests integrate with Playwright's test runner:

```bash
bun run test -- --project=jsonplaceholder-performance
```

## Performance Metrics

Performance tests collect and validate:

- **Latency**: Mean, p50, p95, p99 response times
- **Throughput**: Requests per second
- **Error Rate**: Percentage of failed requests
- **Concurrent Users**: Number of simultaneous users

### Thresholds

Each challenge defines performance thresholds:

```typescript
export const JSONPLACEHOLDER_THRESHOLDS: PerformanceThreshold = {
  latency: {
    mean: 500,
    p50: 500,
    p95: 1000,
    p99: 2000,
  },
  errorRate: 0.01,
  throughput: 5,
};
```

## Test Types

### Normal Load Tests

Simulate typical user load patterns:

- Warm-up phase
- Sustained normal load
- Ramp-down phase

### Stress Tests

Test maximum capacity:

- Gradual load increase
- Sustained high load
- Monitor for degradation

### Spike Tests

Test sudden load increases:

- Normal load
- Sudden spike
- Recovery monitoring

## Utilities

### Artillery Runner

`tests/performance/utils/artillery-runner.ts` - Executes Artillery tests from Playwright:

```typescript
import { runArtilleryTest } from '../../utils/artillery-runner';

const result = await runArtilleryTest({
  config: 'path/to/config.yml',
});
```

### Metrics Analyzer

`tests/performance/utils/metrics-analyzer.ts` - Validates performance metrics:

```typescript
import { validatePerformanceMetrics } from '../../utils/metrics-analyzer';

const validation = validatePerformanceMetrics(results, thresholds);
```

### Report Generator

`tests/performance/utils/report-generator.ts` - Generates performance reports:

```typescript
import { generateHTMLReport } from '../../utils/report-generator';

const reportPath = generateHTMLReport(results);
```

## CI/CD Integration

Performance tests run on every push to main and are integrated into the main CI workflow:

- **Push trigger**: Runs on every push to main branch (alongside E2E tests, Lighthouse, and Axe audits)
- **Schedule**: Also runs daily at midnight UTC for continuous monitoring
- **Manual execution**: Via `workflow_dispatch`
- **Workflow**: `.github/workflows/performance.yml`
- **CI integration**: Part of main CI workflow (`.github/workflows/ci.yml`)
- **Report publishing**: Performance test reports are published to GitHub Pages along with other test reports

Performance test reports are uploaded as artifacts and published to GitHub Pages for analysis. Failures don't block CI/CD - tests use `continue-on-error: true` to ensure reports are always collected.

## Best Practices

1. **Start Small**: Begin with low arrival rates and gradually increase
2. **Include Warm-up**: Always include a warm-up phase before sustained load
3. **Monitor Error Rates**: Track error rates in addition to latency
4. **Validate Responses**: Always validate API responses in processor functions
5. **Use Realistic Data**: Use realistic test data that matches production
6. **Set Thresholds**: Define appropriate performance thresholds per API
7. **Document Findings**: Document performance characteristics and thresholds

## Environment Variables

Performance test configuration via environment variables:

```bash
PERFORMANCE_DURATION=60          # Test duration in seconds
PERFORMANCE_ARRIVAL_RATE=5       # Users per second
PERFORMANCE_MAX_CONCURRENT=50    # Max concurrent users
```

## References

- [Artillery Documentation](https://www.artillery.io/docs)
- [Artillery Playwright Engine](https://www.artillery.io/docs/guides/playwright)
- [Load Testing Best Practices](https://www.artillery.io/docs/guides/load-testing-best-practices)

