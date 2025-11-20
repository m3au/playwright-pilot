import { test, expect } from '../../world';
import { runArtilleryTest } from '../../utils/artillery-runner';
import { validatePerformanceMetrics } from '../../utils/metrics-analyzer';

test.describe('ReqRes.in Authenticated Load Test', () => {
  test('should handle normal load', async () => {
    const configPath = 'tests/performance/challenges/reqres/config/authenticated-load.yml';
    const result = await runArtilleryTest({ config: configPath });

    expect(result.success).toBe(true);
    expect(result.results).toBeDefined();

    if (result.results) {
      expect(result.results.aggregate.requests.completed).toBeGreaterThan(0);
      
      const totalRequests =
        result.results.aggregate.requests.completed + result.results.aggregate.requests.failed;
      const errorRate = totalRequests > 0 ? result.results.aggregate.errors / totalRequests : 0;

      expect(errorRate).toBeLessThan(0.01);
    }
  });
});

