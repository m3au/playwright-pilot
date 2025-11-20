module.exports = {
  getRequestFlow,
  postRequestFlow,
  putRequestFlow,
  deleteRequestFlow,
};

async function getRequestFlow(page) {
  const response = await page.request.get('/get');
  
  if (!response.ok()) {
    throw new Error(`GET request failed: ${response.status()}`);
  }
  
  const data = await response.json();
  
  if (!data || !data.url) {
    throw new Error('Invalid GET response');
  }
  
  return data;
}

async function postRequestFlow(page) {
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
  
  return data;
}

async function putRequestFlow(page) {
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
  
  return data;
}

async function deleteRequestFlow(page) {
  const response = await page.request.delete('/delete');
  
  if (!response.ok()) {
    throw new Error(`DELETE request failed: ${response.status()}`);
  }
  
  const data = await response.json();
  
  if (!data || !data.url) {
    throw new Error('Invalid DELETE response');
  }
  
  return data;
}
