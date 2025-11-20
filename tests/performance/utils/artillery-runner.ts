import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { mkdir } from 'node:fs/promises';

import type { ArtilleryResults } from './metrics-analyzer';

export interface ArtilleryRunOptions {
  config: string;
  output?: string;
  environment?: string;
}

export interface ArtilleryRunResult {
  success: boolean;
  results?: ArtilleryResults;
  error?: string;
  output?: string;
}

export async function runArtilleryTest(options: ArtilleryRunOptions): Promise<ArtilleryRunResult> {
  const { config, output, environment } = options;

  if (!existsSync(config)) {
    return {
      success: false,
      error: `Artillery config file not found: ${config}`,
    };
  }

  const projectRoot = process.cwd();
  const artilleryBin = existsSync(join(projectRoot, 'node_modules', '.bin', 'artillery'))
    ? join(projectRoot, 'node_modules', '.bin', 'artillery')
    : 'bunx artillery';

  const outputPath = output || join(projectRoot, 'test-output', 'artillery-temp.json');
  const outputDir = outputPath.substring(0, outputPath.lastIndexOf('/') || outputPath.lastIndexOf('\\'));
  
  if (outputDir && outputDir !== outputPath) {
    await mkdir(outputDir, { recursive: true }).catch(() => {
      // Directory might already exist
    });
  }

  const args: string[] = ['run', config, '--output', outputPath];

  if (environment) {
    args.push('--environment', environment);
  }

  return new Promise((resolve) => {
    const artilleryProcess = spawn(artilleryBin, args, {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        ...(environment ? { NODE_ENV: environment } : {}),
      },
    });

    let stdout = '';
    let stderr = '';

    artilleryProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    artilleryProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    artilleryProcess.on('error', (error) => {
      resolve({
        success: false,
        error: `Failed to run Artillery: ${error.message}`,
        output: stderr,
      });
    });

    artilleryProcess.on('close', async (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          error: `Artillery exited with code ${code ?? 1}`,
          output: stderr || stdout,
        });
        return;
      }

      let results: ArtilleryResults | undefined;
      try {
        if (existsSync(outputPath)) {
          const jsonContent = readFileSync(outputPath, 'utf-8');
          results = parseArtilleryJSON(jsonContent);
        } else {
          results = parseArtilleryOutput(stdout);
        }
      } catch (error) {
        resolve({
          success: false,
          error: `Failed to parse Artillery results: ${error instanceof Error ? error.message : String(error)}`,
          output: stdout,
        });
        return;
      }

      resolve({
        success: true,
        results,
        output: stdout,
      });
    });
  });
}

function parseArtilleryOutput(output: string): ArtilleryResults {
  const lines = output.split('\n');
  const results: ArtilleryResults = {
    aggregate: {
      latency: {
        mean: 0,
        p50: 0,
        p95: 0,
        p99: 0,
      },
      requests: {
        completed: 0,
        failed: 0,
      },
      errors: 0,
      duration: 0,
    },
    scenarios: {
      completed: 0,
      failed: 0,
    },
  };

  for (const line of lines) {
    if (line.includes('mean:') && line.includes('latency')) {
      const match = line.match(/mean:\s*(\d+)/);
      if (match) {
        results.aggregate.latency.mean = Number.parseInt(match[1]!, 10);
      }
    }

    if (line.includes('p50:')) {
      const match = line.match(/p50:\s*(\d+)/);
      if (match) {
        results.aggregate.latency.p50 = Number.parseInt(match[1]!, 10);
      }
    }

    if (line.includes('p95:')) {
      const match = line.match(/p95:\s*(\d+)/);
      if (match) {
        results.aggregate.latency.p95 = Number.parseInt(match[1]!, 10);
      }
    }

    if (line.includes('p99:')) {
      const match = line.match(/p99:\s*(\d+)/);
      if (match) {
        results.aggregate.latency.p99 = Number.parseInt(match[1]!, 10);
      }
    }

    if (line.includes('requests') && line.includes('completed')) {
      const match = line.match(/completed:\s*(\d+)/);
      if (match) {
        results.aggregate.requests.completed = Number.parseInt(match[1]!, 10);
      }
    }

    if (line.includes('requests') && line.includes('failed')) {
      const match = line.match(/failed:\s*(\d+)/);
      if (match) {
        results.aggregate.requests.failed = Number.parseInt(match[1]!, 10);
      }
    }

    if (line.includes('errors:')) {
      const match = line.match(/errors:\s*(\d+)/);
      if (match) {
        results.aggregate.errors = Number.parseInt(match[1]!, 10);
      }
    }
  }

  return results;
}

function parseArtilleryJSON(jsonContent: string): ArtilleryResults {
  try {
    const data = JSON.parse(jsonContent);
    
    const aggregate = data.aggregate || {};
    const counters = aggregate.counters || {};
    const summaries = aggregate.summaries || {};
    
    const sessionLength = summaries['vusers.session_length'] || summaries['session_length'] || {};
    const latency = sessionLength || {};
    
    const vusersCompleted = counters['vusers.completed'] || aggregate['vusers.completed'] || 0;
    const vusersFailed = counters['vusers.failed'] || aggregate['vusers.failed'] || 0;
    const httpErrors = counters['http.errors'] || counters['errors'] || 0;
    
    const firstMetricAt = aggregate.firstMetricAt || 0;
    const lastMetricAt = aggregate.lastMetricAt || 0;
    const duration = lastMetricAt > firstMetricAt ? lastMetricAt - firstMetricAt : 0;
    
    return {
      aggregate: {
        latency: {
          mean: Math.round(latency.mean || 0),
          p50: Math.round(latency.p50 || latency.median || 0),
          p95: Math.round(latency.p95 || 0),
          p99: Math.round(latency.p99 || 0),
        },
        requests: {
          completed: Number(vusersCompleted) || 0,
          failed: Number(vusersFailed) || 0,
        },
        errors: Number(httpErrors) || 0,
        duration: Math.round(duration),
      },
      scenarios: {
        completed: Number(vusersCompleted) || 0,
        failed: Number(vusersFailed) || 0,
      },
    };
  } catch (error) {
    throw new Error(`Failed to parse Artillery JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

