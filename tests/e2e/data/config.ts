export interface EnvironmentConfig {
  baseUrl: string;
  timeout: number;
  expectTimeout: number;
}

export interface DataConfig {
  [key: string]: unknown;
}

export function getEnvironment(): DataConfig & { environment: EnvironmentConfig } {
  const baseUrl = process.env['BASE_URL'];

  if (!baseUrl) {
    throw new Error('BASE_URL environment variable is required');
  }

  const timeout = process.env['TIMEOUT'];
  if (!timeout) {
    throw new Error('TIMEOUT environment variable is required');
  }

  const expectTimeout = process.env['EXPECT_TIMEOUT'];
  if (!expectTimeout) {
    throw new Error('EXPECT_TIMEOUT environment variable is required');
  }

  const environment: EnvironmentConfig = {
    baseUrl,
    timeout: Number.parseInt(timeout, 10),
    expectTimeout: Number.parseInt(expectTimeout, 10),
  };

  return {
    environment,
  };
}
