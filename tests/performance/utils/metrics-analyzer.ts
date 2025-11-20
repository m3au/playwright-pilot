export interface ArtilleryResults {
  aggregate: {
    latency: {
      mean: number;
      p50: number;
      p95: number;
      p99: number;
    };
    requests: {
      completed: number;
      failed: number;
    };
    errors: number;
    duration: number;
  };
  scenarios: {
    completed: number;
    failed: number;
  };
}

export interface PerformanceThresholds {
  latency?: {
    mean?: number;
    p50?: number;
    p95?: number;
    p99?: number;
  };
  errorRate?: number;
  throughput?: number;
}

export const DEFAULT_PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  latency: {
    mean: 1000,
    p50: 1000,
    p95: 2000,
    p99: 3000,
  },
  errorRate: 0.01,
  throughput: 10,
};

export function validatePerformanceMetrics(
  results: ArtilleryResults,
  thresholds: PerformanceThresholds = DEFAULT_PERFORMANCE_THRESHOLDS,
): {
  passed: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  if (thresholds.latency) {
    if (thresholds.latency.mean && results.aggregate.latency.mean > thresholds.latency.mean) {
      violations.push(
        `Mean latency ${results.aggregate.latency.mean}ms exceeds threshold ${thresholds.latency.mean}ms`,
      );
    }

    if (thresholds.latency.p50 && results.aggregate.latency.p50 > thresholds.latency.p50) {
      violations.push(
        `P50 latency ${results.aggregate.latency.p50}ms exceeds threshold ${thresholds.latency.p50}ms`,
      );
    }

    if (thresholds.latency.p95 && results.aggregate.latency.p95 > thresholds.latency.p95) {
      violations.push(
        `P95 latency ${results.aggregate.latency.p95}ms exceeds threshold ${thresholds.latency.p95}ms`,
      );
    }

    if (thresholds.latency.p99 && results.aggregate.latency.p99 > thresholds.latency.p99) {
      violations.push(
        `P99 latency ${results.aggregate.latency.p99}ms exceeds threshold ${thresholds.latency.p99}ms`,
      );
    }
  }

  if (thresholds.errorRate !== undefined) {
    const totalRequests = results.aggregate.requests.completed + results.aggregate.requests.failed;
    const actualErrorRate = totalRequests > 0 ? results.aggregate.errors / totalRequests : 0;

    if (actualErrorRate > thresholds.errorRate) {
      violations.push(
        `Error rate ${(actualErrorRate * 100).toFixed(2)}% exceeds threshold ${(thresholds.errorRate * 100).toFixed(2)}%`,
      );
    }
  }

  if (thresholds.throughput !== undefined) {
    const actualThroughput =
      results.aggregate.duration > 0
        ? results.aggregate.requests.completed / (results.aggregate.duration / 1000)
        : 0;

    if (actualThroughput < thresholds.throughput) {
      violations.push(
        `Throughput ${actualThroughput.toFixed(2)} req/s below threshold ${thresholds.throughput} req/s`,
      );
    }
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

export function analyzePerformanceResults(results: ArtilleryResults): {
  summary: string;
  metrics: Record<string, unknown>;
} {
  const totalRequests = results.aggregate.requests.completed + results.aggregate.requests.failed;
  const errorRate =
    totalRequests > 0 ? (results.aggregate.errors / totalRequests) * 100 : 0;
  const throughput =
    results.aggregate.duration > 0
      ? results.aggregate.requests.completed / (results.aggregate.duration / 1000)
      : 0;

  const summary = `
Performance Test Results:
- Requests: ${results.aggregate.requests.completed} completed, ${results.aggregate.requests.failed} failed
- Latency: mean ${results.aggregate.latency.mean}ms, p50 ${results.aggregate.latency.p50}ms, p95 ${results.aggregate.latency.p95}ms, p99 ${results.aggregate.latency.p99}ms
- Error Rate: ${errorRate.toFixed(2)}%
- Throughput: ${throughput.toFixed(2)} req/s
  `.trim();

  return {
    summary,
    metrics: {
      requests: {
        completed: results.aggregate.requests.completed,
        failed: results.aggregate.requests.failed,
        total: totalRequests,
      },
      latency: results.aggregate.latency,
      errorRate,
      throughput,
      duration: results.aggregate.duration,
      scenarios: results.scenarios,
    },
  };
}

