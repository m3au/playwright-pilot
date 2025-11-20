module.exports = {
  getAllPostsFlow,
  getPostByIdFlow,
  createPostFlow,
};

async function getAllPostsFlow(page) {
  const response = await page.request.get('/posts');
  
  if (!response.ok()) {
    throw new Error(`Failed to fetch posts: ${response.status()}`);
  }
  
  const posts = await response.json();
  
  if (!Array.isArray(posts) || posts.length === 0) {
    throw new Error('Expected posts array but got invalid response');
  }
  
  return posts;
}

async function getPostByIdFlow(page) {
  const postId = Math.floor(Math.random() * 100) + 1;
  const response = await page.request.get(`/posts/${postId}`);
  
  if (!response.ok()) {
    throw new Error(`Failed to fetch post ${postId}: ${response.status()}`);
  }
  
  const post = await response.json();
  
  if (!post || !post.id) {
    throw new Error('Invalid post response');
  }
  
  return post;
}

async function createPostFlow(page) {
  const postData = {
    title: `Load Test Post ${Date.now()}`,
    body: `This is a load test post created at ${new Date().toISOString()}`,
    userId: Math.floor(Math.random() * 10) + 1,
  };
  
  const response = await page.request.post('/posts', {
    data: postData,
  });
  
  if (!response.ok()) {
    throw new Error(`Failed to create post: ${response.status()}`);
  }
  
  const createdPost = await response.json();
  
  if (!createdPost || !createdPost.title) {
    throw new Error('Invalid post creation response');
  }
  
  return createdPost;
}
