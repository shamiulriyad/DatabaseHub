export function parseJwt(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch (e) {
    return null;
  }
}

export function getUserIdFromToken() {
  const token = localStorage.getItem('elearning.accessToken');
  const payload = parseJwt(token);
  return payload?.userId || payload?.sub || null;
}

export function isClanLeader(clan, userId) {
  if (!clan || !userId) return false;
  // clan may have LeaderId or MemberRole on payload
  if (clan.leaderId) return clan.leaderId === Number(userId);
  if (clan.MemberRole) return clan.MemberRole === 'Leader' || clan.MemberRole === 'CoLeader';
  return false;
}
