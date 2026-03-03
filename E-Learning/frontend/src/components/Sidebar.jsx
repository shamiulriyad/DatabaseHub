import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  FaTachometerAlt, FaBook, FaClipboardList, FaUser, FaPlus,
  FaGraduationCap, FaUniversity, FaUsers, FaStar, FaTrophy,
} from 'react-icons/fa';

/* ─── Tokens ─────────────────────────────────────────────────── */
const T = {
  bg:           '#0A0D1A',
  border:       'rgba(124,58,237,0.14)',
  borderActive: '#7C3AED',
  accent:       '#7C3AED',
  accentSoft:   '#A78BFA',
  accentGlow:   'rgba(124,58,237,0.28)',
  activeBg:     'rgba(124,58,237,0.1)',
  hoverBg:      'rgba(139,92,246,0.06)',
  textPrimary:  '#EDE9FE',
  textSub:      '#94A3B8',
  textMuted:    '#475569',
  divider:      'rgba(124,58,237,0.1)',
};

/* ─── Injected CSS ───────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');

.csb-wrap {
  font-family: 'DM Sans', sans-serif;
  background: ${T.bg};
  border-right: 1px solid ${T.border};
  width: 264px;
  min-width: 264px;
  height: calc(100vh - 64px);
  position: sticky;
  top: 64px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 22px 10px 40px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  scrollbar-width: thin;
  scrollbar-color: rgba(124,58,237,0.18) transparent;
}
.csb-wrap::-webkit-scrollbar { width: 3px; }
.csb-wrap::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.22); border-radius: 99px; }

.csb-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 12px 22px;
  border-bottom: 1px solid ${T.divider};
  margin-bottom: 10px;
}
.csb-brand-orb {
  width: 32px; height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #7C3AED, #4F46E5);
  box-shadow: 0 0 16px rgba(124,58,237,0.35);
  display: flex; align-items: center; justify-content: center;
  font-size: 15px;
  color: #EDE9FE;
}
.csb-brand-name {
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  font-weight: 700;
  color: ${T.textPrimary};
  letter-spacing: 0.01em;
}

.csb-label {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${T.textMuted};
  padding: 14px 14px 6px;
}

.csb-link {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 14px;
  border-radius: 12px;
  border-left: 3px solid transparent;
  color: ${T.textSub};
  text-decoration: none !important;
  font-size: 13.5px;
  font-weight: 500;
  transition: all 0.22s cubic-bezier(.4,0,.2,1);
  position: relative;
  overflow: hidden;
}
.csb-link::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at left, rgba(124,58,237,0.1), transparent 70%);
  opacity: 0;
  transition: opacity 0.22s;
}
.csb-link:hover {
  background: ${T.hoverBg};
  color: ${T.textPrimary};
  border-left-color: rgba(124,58,237,0.35);
  transform: translateX(3px);
  text-decoration: none !important;
}
.csb-link:hover::before { opacity: 1; }
.csb-link:hover .csb-icon { color: ${T.accentSoft}; }

.csb-link.active {
  background: ${T.activeBg};
  border-left-color: ${T.borderActive};
  color: ${T.accentSoft};
  font-weight: 600;
  box-shadow: inset 0 0 20px rgba(124,58,237,0.06);
}
.csb-link.active .csb-icon {
  color: ${T.accentSoft};
  filter: drop-shadow(0 0 6px rgba(124,58,237,0.5));
}

.csb-icon {
  font-size: 15px;
  color: ${T.textMuted};
  transition: all 0.22s;
  flex-shrink: 0;
}

.csb-badge {
  margin-left: auto;
  background: rgba(124,58,237,0.18);
  border: 1px solid rgba(124,58,237,0.3);
  color: ${T.accentSoft};
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}

.csb-divider {
  height: 1px;
  background: ${T.divider};
  margin: 10px 12px;
}

.csb-role-box {
  background: rgba(124,58,237,0.05);
  border: 1px solid ${T.border};
  border-radius: 14px;
  padding: 14px;
  margin: 4px 2px 10px;
}
.csb-role-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${T.textMuted};
  margin-bottom: 10px;
}
.csb-role-btns { display: flex; gap: 6px; }
.csb-role-btn {
  flex: 1;
  padding: 7px 0;
  border-radius: 9px;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${T.border};
  background: transparent;
  color: ${T.textMuted};
}
.csb-role-btn:hover { border-color: rgba(124,58,237,0.35); color: ${T.textSub}; }
.csb-role-btn.active {
  background: linear-gradient(135deg, #7C3AED, #5B21B6);
  border-color: rgba(124,58,237,0.5);
  color: #EDE9FE;
  box-shadow: 0 0 18px rgba(124,58,237,0.28);
}

.csb-user {
  padding: 13px;
  background: rgba(124,58,237,0.05);
  border: 1px solid ${T.border};
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.22s;
  text-decoration: none !important;
}
.csb-user:hover { border-color: rgba(124,58,237,0.35); background: rgba(124,58,237,0.09); }

.csb-avatar {
  width: 34px; height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #7C3AED, #4F46E5);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Playfair Display', serif;
  font-size: 14px;
  font-weight: 700;
  color: #EDE9FE;
  border: 1px solid rgba(167,139,250,0.3);
  flex-shrink: 0;
}
.csb-user-name {
  font-size: 13px;
  font-weight: 600;
  color: ${T.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.csb-user-role { font-size: 11px; color: ${T.textMuted}; }
`;

/* ─── SidebarLink ────────────────────────────────────────────── */
const SidebarLink = ({ to, icon: IconComp, label, badge }) => {
  const { pathname } = useLocation();
  const isActive = pathname === to || (to !== '/' && pathname.startsWith(to));

  return (
    <RouterLink to={to} className={`csb-link${isActive ? ' active' : ''}`}>
      <IconComp className="csb-icon" />
      <span style={{ flex: 1 }}>{label}</span>
      {badge && <span className="csb-badge">{badge}</span>}
    </RouterLink>
  );
};

/* ─── Sidebar ────────────────────────────────────────────────── */
const Sidebar = () => {
  const { user } = useAuth();
  const [activeRole, setActiveRole] = useState(
    () => localStorage.getItem('activeRole') || (user?.isTeacher ? 'teacher' : 'student')
  );

  useEffect(() => { localStorage.setItem('activeRole', activeRole); }, [activeRole]);

  if (!user) return null;

  const initials = ((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase() || user.username?.[0]?.toUpperCase() || '?';
  const displayName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username;
  const primaryRole = user.isAdmin ? 'Admin' : user.isTeacher && !user.isStudent ? 'Teacher' : 'Student';

  const isDual = user.isTeacher && user.isStudent && !user.isAdmin;

  return (
    <>
      <style>{css}</style>
      <aside className="csb-wrap">

        {/* Brand */}
      

        {/* Role Toggle */}
        {isDual && (
          <>
            <div className="csb-role-box">
              <div className="csb-role-label">Switch Role</div>
              <div className="csb-role-btns">
                <button className={`csb-role-btn${activeRole === 'teacher' ? ' active' : ''}`} onClick={() => setActiveRole('teacher')}>Teacher</button>
                <button className={`csb-role-btn${activeRole === 'student' ? ' active' : ''}`} onClick={() => setActiveRole('student')}>Student</button>
              </div>
            </div>
            <div className="csb-divider" />
          </>
        )}

        {/* Admin */}
        {user.isAdmin && (
          <>
            <div className="csb-label">Admin Panel</div>
            <SidebarLink to="/admin/dashboard"           icon={FaTachometerAlt} label="Dashboard" />
            <SidebarLink to="/admin/manage-teachers"     icon={FaGraduationCap} label="All Applications" />
            <SidebarLink to="/admin/users"               icon={FaUsers}         label="Users" />
            <SidebarLink to="/admin/university-requests" icon={FaClipboardList} label="University Requests" />
            <SidebarLink to="/admin/department-requests" icon={FaClipboardList} label="Department Requests" />
            <SidebarLink to="/admin/courses"             icon={FaBook}          label="Courses" />
            <SidebarLink to="/admin/competitions"        icon={FaTrophy}        label="Competitions" />
            <SidebarLink to="/admin/clan-competitions"   icon={FaUsers}         label="Clan Competitions" />
          </>
        )}

        {/* Teacher (pure or dual → teacher tab) */}
        {user.isTeacher && !user.isAdmin && (!isDual || activeRole === 'teacher') && (
          <>
            <div className="csb-label">Teaching</div>
            <SidebarLink to="/teacher"                icon={FaTachometerAlt} label="Dashboard" />
            <SidebarLink to="/teacher/create-course"  icon={FaPlus}          label="Create Course" />
            <SidebarLink to="/teacher/manage-courses" icon={FaBook}          label="My Courses" />
            <SidebarLink to="/teacher/reviews"        icon={FaStar}          label="Course Reviews" />
            {!isDual && (
              <>
                <div className="csb-divider" />
                <SidebarLink to="/profile" icon={FaUser} label="My Profile" />
              </>
            )}
          </>
        )}

        {/* Student (pure or dual → student tab) */}
        {user.isStudent && !user.isAdmin && (!isDual || activeRole === 'student') && (
          <>
            <div className="csb-label">Learning</div>
            <SidebarLink to="/dashboard"           icon={FaTachometerAlt} label="My Dashboard" />
            <SidebarLink to="/profile/enrollments" icon={FaBook}          label="My Courses" />
            <SidebarLink to="/my-competitions"     icon={FaTrophy}        label="My Competitions" />
            <SidebarLink to="/universities"        icon={FaUniversity}    label="Universities" />
          </>
        )}

        {/* Bottom User Strip */}
        <div style={{ marginTop: 'auto', paddingTop: 20 }}>
          <div className="csb-divider" style={{ marginBottom: 14 }} />
          <RouterLink to="/profile" className="csb-user">
            <div className="csb-avatar">{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div className="csb-user-name">{displayName}</div>
              <div className="csb-user-role">{primaryRole}</div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 14, color: T.textMuted, flexShrink: 0 }}>›</span>
          </RouterLink>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;