import api from './api';

function normalizeError(error) {
  const status = error?.response?.status;
  const data = error?.response?.data || {};
  const message = data?.message || error?.message || 'Unexpected error';
  return { status, message, data };
}

export async function createClan(payload) {
  try {
    const res = await api.post('/clans', payload);
    return res.data;
  } catch (error) {
    const err = normalizeError(error);
    // Provide clear messaging for leadership exclusivity
    if (err.status === 403) {
      return {
        success: false,
        message: err.message || 'Clan creation not allowed: leadership exclusivity enforced',
        code: 'LEADERSHIP_EXCLUSIVITY',
        ...err.data,
      };
    }
    return { success: false, message: err.message, ...err.data };
  }
}

export async function joinClan(clanId, payload = {}) {
  try {
    const res = await api.post(`/clans/${clanId}/join`, payload);
    return res.data;
  } catch (error) {
    const err = normalizeError(error);
    return { success: false, message: err.message, ...err.data };
  }
}

export async function getMyClans() {
  try {
    const res = await api.get('/clans/my-clans');
    return res.data;
  } catch (error) {
    const err = normalizeError(error);
    return { success: false, message: err.message, ...err.data };
  }
}

export default {
  createClan,
  joinClan,
  getMyClans,
};
