import { test, expect } from '../../world';
import { runArtilleryTest } from '../../utils/artillery-runner';
import { validatePerformanceMetrics } from '../../utils/metrics-analyzer';
import { getJSONPlaceholderThresholds } from './utils/performance-validator';

test.describe('JSONPlaceholder Todos Load Test', () => {
  test('should handle normal load', async () => {
    const configPath = 'tests/performance/challenges/jsonplaceholder/config/todos-load.yml';
    const result = await runArtilleryTest({ config: configPath });

    expect(result.success).toBe(true);
    expect(result.results).toBeDefined();

    if (result.results) {
      expect(result.results.aggregate.requests.completed).toBeGreaterThan(0);
      
      const thresholds = getJSONPlaceholderThresholds('todos');
      const validation = validatePerformanceMetrics(result.results, thresholds);
      
      if (!validation.passed) {
        console.error('Performance violations:', validation.violations);
      }
      
      expect(validation.passed).toBe(true);
    }
  });
});
