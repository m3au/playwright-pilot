module.exports = {
  getAllAlbumsFlow,
  getAlbumByIdFlow,
};

async function getAllAlbumsFlow(page) {
  const response = await page.request.get('/albums');
  
  if (!response.ok()) {
    throw new Error(`Failed to fetch albums: ${response.status()}`);
  }
  
  const albums = await response.json();
  
  if (!Array.isArray(albums) || albums.length === 0) {
    throw new Error('Expected albums array but got invalid response');
  }
  
  return albums;
}

async function getAlbumByIdFlow(page) {
  const albumId = Math.floor(Math.random() * 100) + 1;
  const response = await page.request.get(`/albums/${albumId}`);
  
  if (!response.ok()) {
    throw new Error(`Failed to fetch album ${albumId}: ${response.status()}`);
  }
  
  const album = await response.json();
  
  if (!album || !album.id) {
    throw new Error('Invalid album response');
  }
  
  return album;
}
