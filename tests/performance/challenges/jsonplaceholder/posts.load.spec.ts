import { test, expect } from '../../world';
import { runArtilleryTest } from '../../utils/artillery-runner';
import { validatePerformanceMetrics } from '../../utils/metrics-analyzer';
import { getJSONPlaceholderThresholds } from './utils/performance-validator';

test.describe('JSONPlaceholder Posts Load Test', () => {
  test('should handle normal load', async () => {
    const configPath = 'tests/performance/challenges/jsonplaceholder/config/posts-load.yml';
    const result = await runArtilleryTest({ config: configPath });

    expect(result.success).toBe(true);
    expect(result.results).toBeDefined();

    if (result.results) {
      expect(result.results.aggregate.requests.completed).toBeGreaterThan(0);
      
      const thresholds = getJSONPlaceholderThresholds('posts');
      const validation = validatePerformanceMetrics(result.results, thresholds);
      
      if (!validation.passed) {
        console.error('Performance violations:', validation.violations);
      }
      
      expect(validation.passed).toBe(true);
    }
  });

  test('should maintain low error rate under load', async () => {
    const configPath = 'tests/performance/challenges/jsonplaceholder/config/posts-load.yml';
    const result = await runArtilleryTest({ config: configPath });

    expect(result.success).toBe(true);
    expect(result.results).toBeDefined();

    if (result.results) {
      const totalRequests =
        result.results.aggregate.requests.completed + result.results.aggregate.requests.failed;
      const errorRate = totalRequests > 0 ? result.results.aggregate.errors / totalRequests : 0;

      expect(errorRate).toBeLessThan(0.01);
    }
  });

  test('should validate JSONPlaceholder-specific thresholds', async () => {
    const configPath = 'tests/performance/challenges/jsonplaceholder/config/posts-load.yml';
    const result = await runArtilleryTest({ config: configPath });

    expect(result.success).toBe(true);
    expect(result.results).toBeDefined();

    if (result.results) {
      const thresholds = getJSONPlaceholderThresholds('posts');
      const validation = validatePerformanceMetrics(result.results, thresholds);
      
      if (!validation.passed) {
        console.error('JSONPlaceholder performance violations:', validation.violations);
      }
      
      expect(validation.passed).toBe(true);
    }
  });
});

