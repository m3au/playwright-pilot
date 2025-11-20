module.exports = {
  getAllPhotosFlow,
  getPhotosByAlbumFlow,
};

async function getAllPhotosFlow(page) {
  const response = await page.request.get('/photos');
  
  if (!response.ok()) {
    throw new Error(`Failed to fetch photos: ${response.status()}`);
  }
  
  const photos = await response.json();
  
  if (!Array.isArray(photos) || photos.length === 0) {
    throw new Error('Expected photos array but got invalid response');
  }
  
  return photos;
}

async function getPhotosByAlbumFlow(page) {
  const albumId = Math.floor(Math.random() * 100) + 1;
  const response = await page.request.get(`/photos?albumId=${albumId}`);
  
  if (!response.ok()) {
    throw new Error(`Failed to fetch photos for album ${albumId}: ${response.status()}`);
  }
  
  const photos = await response.json();
  
  if (!Array.isArray(photos)) {
    throw new Error('Invalid photos response');
  }
  
  return photos;
}
