import api from './api';

export const communityService = {
  async getPosts(params = {}) {
    // Accepts either (page, pageSize, sortBy, search) or an object
    let page = 1, pageSize = 10, sortBy = 'latest', search = '';
    if (typeof params === 'object' && params !== null) {
      page = Number(params.page) || 1;
      pageSize = Number(params.pageSize) || 10;
      sortBy = params.sortBy || 'latest';
      search = params.search || '';
    }
    let url = `/posts/public?page=${page}&pageSize=${pageSize}`;
    if (sortBy) url += `&sortBy=${encodeURIComponent(sortBy)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const response = await api.get(url);
    return response.data.data;
  },

  async getPostById(id) {
    const response = await api.get(`/community/posts/${id}`);
    return response.data.data;
  },

  async createPost(postData) {
    const response = await api.post('/posts/public', postData);
    return response.data.data;
  },

  async updatePost(id, postData) {
    const response = await api.put(`/community/posts/${id}`, postData);
    return response.data.data;
  },

  async deletePost(id) {
    const response = await api.delete(`/community/posts/${id}`);
    return response.data;
  },

  async votePost(id, voteType) {
    const response = await api.post(`/community/posts/${id}/vote`, { voteType });
    return response.data;
  },

  async getComments(postId) {
    const response = await api.get(`/community/posts/${postId}/comments`);
    return response.data.data;
  },

  async addComment(postId, commentData) {
    const response = await api.post(`/community/posts/${postId}/comments`, commentData);
    return response.data.data;
  },

  async uploadCommunityImage(formData) {
    const response = await api.post('/uploads/community-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response?.data?.url || response?.data?.data?.url || null;
  }
};
