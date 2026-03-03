import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5145/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const publicApi = axios.create({
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
      // Log full response body to aid debugging (stringify to avoid collapsed [Object])
      try {
        console.error('400 Bad Request:', {
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params,
          requestData: error.config?.data,
          responseData: JSON.stringify(error.response?.data)
        });
      } catch (logEx) {
        console.error('400 Bad Request (failed to stringify):', error.response?.data);
      }
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
  getForumPosts: (params = {}) => {
    const page = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 10;
    return api.get(`/posts/forums?page=${page}&pageSize=${pageSize}`);
  },

  getPublicPosts: (params = {}) => {
    const page = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 10;
    return api.get(`/posts/public?page=${page}&pageSize=${pageSize}`);
  },

  createForumPost: (postData) => api.post('/posts/forums', postData),
  createPublicPost: (postData) => api.post('/posts/public', postData),

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
    return communityAPI.getPublicPosts(params);
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
  createPost: (postData) => communityAPI.createPublicPost(postData),

  // Update a post
  updatePost: (postId, postData) => api.put(`/community/posts/${postId}`, postData),

  // Delete a post
  deletePost: (postId) => api.delete(`/community/posts/${postId}`),
};

export default api;
