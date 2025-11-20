module.exports = {
  getAllCommentsFlow,
  getCommentsByPostFlow,
};

async function getAllCommentsFlow(page) {
  const response = await page.request.get('/comments');
  
  if (!response.ok()) {
    throw new Error(`Failed to fetch comments: ${response.status()}`);
  }
  
  const comments = await response.json();
  
  if (!Array.isArray(comments) || comments.length === 0) {
    throw new Error('Expected comments array but got invalid response');
  }
  
  return comments;
}

async function getCommentsByPostFlow(page) {
  const postId = Math.floor(Math.random() * 100) + 1;
  const response = await page.request.get(`/comments?postId=${postId}`);
  
  if (!response.ok()) {
    throw new Error(`Failed to fetch comments for post ${postId}: ${response.status()}`);
  }
  
  const comments = await response.json();
  
  if (!Array.isArray(comments)) {
    throw new Error('Invalid comments response');
  }
  
  return comments;
}
