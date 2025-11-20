module.exports = {
  getAllTodosFlow,
  getTodosByUserFlow,
};

async function getAllTodosFlow(page) {
  const response = await page.request.get('/todos');
  
  if (!response.ok()) {
    throw new Error(`Failed to fetch todos: ${response.status()}`);
  }
  
  const todos = await response.json();
  
  if (!Array.isArray(todos) || todos.length === 0) {
    throw new Error('Expected todos array but got invalid response');
  }
  
  return todos;
}

async function getTodosByUserFlow(page) {
  const userId = Math.floor(Math.random() * 10) + 1;
  const response = await page.request.get(`/todos?userId=${userId}`);
  
  if (!response.ok()) {
    throw new Error(`Failed to fetch todos for user ${userId}: ${response.status()}`);
  }
  
  const todos = await response.json();
  
  if (!Array.isArray(todos)) {
    throw new Error('Invalid todos response');
  }
  
  return todos;
}
