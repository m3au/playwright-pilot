import type { Page } from '@playwright/test';

export async function getRequestFlow(page: Page): Promise<void> {
  const response = await page.request.get('/get');
  
  if (!response.ok()) {
    throw new Error(`GET request failed: ${response.status()}`);
  }
  
  const data = await response.json();
  
  if (!data || !data.url) {
    throw new Error('Invalid GET response');
  }
}

export async function postRequestFlow(page: Page): Promise<void> {
  const response = await page.request.post('/post', {
    data: {
      test: 'load test',
      timestamp: Date.now(),
    },
  });
  
  if (!response.ok()) {
    throw new Error(`POST request failed: ${response.status()}`);
  }
  
  const data = await response.json();
  
  if (!data || !data.json) {
    throw new Error('Invalid POST response');
  }
}

export async function putRequestFlow(page: Page): Promise<void> {
  const response = await page.request.put('/put', {
    data: {
      test: 'load test',
      timestamp: Date.now(),
    },
  });
  
  if (!response.ok()) {
    throw new Error(`PUT request failed: ${response.status()}`);
  }
  
  const data = await response.json();
  
  if (!data || !data.json) {
    throw new Error('Invalid PUT response');
  }
}

export async function deleteRequestFlow(page: Page): Promise<void> {
  const response = await page.request.delete('/delete');
  
  if (!response.ok()) {
    throw new Error(`DELETE request failed: ${response.status()}`);
  }
  
  const data = await response.json();
  
  if (!data || !data.url) {
    throw new Error('Invalid DELETE response');
  }
}

