import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5145/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error info for debugging
    if (error.response?.status === 400) {
      console.error('400 Bad Request:', {
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
        data: error.config?.data,
        message: error.response?.data?.message,
      });
    }
    
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Dispatch a custom event instead of hard redirect
      window.dispatchEvent(new Event('auth-logout'));
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        // Use replace to avoid history issues
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);


// Community API endpoints
export const communityAPI = {
  // Get single post by ID
  getPostById: (postId) => api.get(`/community/posts/${postId}`),

  // Comments for a post
  getComments: (postId) => api.get(`/community/posts/${postId}/comments`),

  // Add comment to a post
  addComment: (postId, commentData) => api.post(`/community/posts/${postId}/comments`, commentData),

  // Update comment
  updateComment: (commentId, commentData) =>
    api.put(`/community/comments/${commentId}`, commentData),

  // Delete comment
  deleteComment: (commentId) =>
    api.delete(`/community/comments/${commentId}`),

  // Upvote a comment
  upvoteComment: (commentId) => api.post(`/community/comments/${commentId}/upvote`),

  // Downvote a comment
  downvoteComment: (commentId) => api.post(`/community/comments/${commentId}/downvote`),

  // Get posts with filters
  getPosts: (params = {}) => {
    // Accepts either (page, pageSize, sortBy, search) or an object
    let page = 1, pageSize = 10, sortBy = 'latest', search = '';
    if (typeof params === 'object' && params !== null) {
      page = Number(params.page) || 1;
      pageSize = Number(params.pageSize) || 10;
      sortBy = params.sortBy || 'latest';
      search = params.search || '';
    }
    let url = `/community/posts?page=${page}&pageSize=${pageSize}`;
    if (sortBy) url += `&sortBy=${encodeURIComponent(sortBy)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return api.get(url);
  },
  // Get posts created by current user (requires auth)
  getMyPosts: (params = {}) => {
    let page = 1, pageSize = 10, sortBy = 'latest', search = '';
    if (typeof params === 'object' && params !== null) {
      page = Number(params.page) || 1;
      pageSize = Number(params.pageSize) || 10;
      sortBy = params.sortBy || 'latest';
      search = params.search || '';
    }
    let url = `/community/my-posts?page=${page}&pageSize=${pageSize}`;
    if (sortBy) url += `&sortBy=${encodeURIComponent(sortBy)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return api.get(url);
  },
  // Like a post
  likePost: (postId) => api.post(`/community/posts/${postId}/like`),

  // Unlike a post
  unlikePost: (postId) => api.post(`/community/posts/${postId}/unlike`),

  // Dislike / downvote a post
  dislikePost: (postId) => api.post(`/community/posts/${postId}/dislike`),
  
  // Create a post
  createPost: (postData) => api.post('/community/posts', postData),

  // Update a post
  updatePost: (postId, postData) => api.put(`/community/posts/${postId}`, postData),

  // Delete a post
  deletePost: (postId) => api.delete(`/community/posts/${postId}`),
};

export default api;
