import api from './api';

export const communityService = {
  async getPosts(page = 1, pageSize = 20) {
    const response = await api.get('/community/posts', { params: { page, pageSize } });
    return response.data.data;
  },

  async getPostById(id) {
    const response = await api.get(`/community/posts/${id}`);
    return response.data.data;
  },

  async createPost(postData) {
    const response = await api.post('/community/posts', postData);
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
  }
};
