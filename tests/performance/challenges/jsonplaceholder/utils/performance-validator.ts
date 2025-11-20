import type { ArtilleryResults } from '../../../utils/metrics-analyzer';

export interface PerformanceThreshold {
  latency?: {
    mean?: number;
    p50?: number;
    p95?: number;
    p99?: number;
  };
  errorRate?: number;
  throughput?: number;
}

export const JSONPLACEHOLDER_THRESHOLDS: PerformanceThreshold = {
  latency: {
    mean: 1000,
    p50: 800,
    p95: 2000,
    p99: 3000,
  },
  errorRate: 0.02,
  throughput: 3,
};

export const JSONPLACEHOLDER_ENDPOINT_THRESHOLDS: Record<string, PerformanceThreshold> = {
  posts: {
    latency: {
      mean: 800,
      p50: 700,
      p95: 1800,
      p99: 2500,
    },
    errorRate: 0.01,
    throughput: 4,
  },
  users: {
    latency: {
      mean: 900,
      p50: 750,
      p95: 1900,
      p99: 2800,
    },
    errorRate: 0.02,
    throughput: 3.5,
  },
  comments: {
    latency: {
      mean: 1200,
      p50: 1000,
      p95: 2200,
      p99: 3200,
    },
    errorRate: 0.02,
    throughput: 3,
  },
  albums: {
    latency: {
      mean: 1100,
      p50: 900,
      p95: 2100,
      p99: 3100,
    },
    errorRate: 0.02,
    throughput: 3,
  },
  photos: {
    latency: {
      mean: 1500,
      p50: 1200,
      p95: 2500,
      p99: 3500,
    },
    errorRate: 0.02,
    throughput: 2.5,
  },
  todos: {
    latency: {
      mean: 1000,
      p50: 800,
      p95: 2000,
      p99: 3000,
    },
    errorRate: 0.02,
    throughput: 3,
  },
};

export function getJSONPlaceholderThresholds(endpoint?: string): PerformanceThreshold {
  if (endpoint && JSONPLACEHOLDER_ENDPOINT_THRESHOLDS[endpoint]) {
    return JSONPLACEHOLDER_ENDPOINT_THRESHOLDS[endpoint]!;
  }
  return JSONPLACEHOLDER_THRESHOLDS;
}

export function validateJSONPlaceholderPerformance(
  results: ArtilleryResults,
): {
  passed: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  if (JSONPLACEHOLDER_THRESHOLDS.latency) {
    const { latency } = JSONPLACEHOLDER_THRESHOLDS;
    
    if (latency.mean && results.aggregate.latency.mean > latency.mean) {
      violations.push(
        `Mean latency ${results.aggregate.latency.mean}ms exceeds threshold ${latency.mean}ms`,
      );
    }

    if (latency.p95 && results.aggregate.latency.p95 > latency.p95) {
      violations.push(
        `P95 latency ${results.aggregate.latency.p95}ms exceeds threshold ${latency.p95}ms`,
      );
    }

    if (latency.p99 && results.aggregate.latency.p99 > latency.p99) {
      violations.push(
        `P99 latency ${results.aggregate.latency.p99}ms exceeds threshold ${latency.p99}ms`,
      );
    }
  }

  if (JSONPLACEHOLDER_THRESHOLDS.errorRate !== undefined) {
    const totalRequests = results.aggregate.requests.completed + results.aggregate.requests.failed;
    const actualErrorRate = totalRequests > 0 ? results.aggregate.errors / totalRequests : 0;

    if (actualErrorRate > JSONPLACEHOLDER_THRESHOLDS.errorRate) {
      violations.push(
        `Error rate ${(actualErrorRate * 100).toFixed(2)}% exceeds threshold ${(JSONPLACEHOLDER_THRESHOLDS.errorRate * 100).toFixed(2)}%`,
      );
    }
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

