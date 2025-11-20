module.exports = {
  getAllUsersFlow,
  getUserByIdFlow,
};

async function getAllUsersFlow(page) {
  const response = await page.request.get('/users');
  
  if (!response.ok()) {
    throw new Error(`Failed to fetch users: ${response.status()}`);
  }
  
  const users = await response.json();
  
  if (!Array.isArray(users) || users.length === 0) {
    throw new Error('Expected users array but got invalid response');
  }
  
  return users;
}

async function getUserByIdFlow(page) {
  const userId = Math.floor(Math.random() * 10) + 1;
  const response = await page.request.get(`/users/${userId}`);
  
  if (!response.ok()) {
    throw new Error(`Failed to fetch user ${userId}: ${response.status()}`);
  }
  
  const user = await response.json();
  
  if (!user || !user.id) {
    throw new Error('Invalid user response');
  }
  
  return user;
}
