import React from 'react';
import { Tooltip, Avatar, Popconfirm } from 'antd';
import { HomeOutlined, ProjectOutlined, SettingOutlined, BellOutlined, FolderOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

type MenuKey = 'dashboard' | 'board' | 'projects' | 'settings';

interface NavItem { key: MenuKey; icon: React.ReactNode; label: string; }
interface SidebarProps { activeKey: string; onMenuClick: (key: string) => void; }

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', icon: <HomeOutlined />,    label: 'Dashboard' },
  { key: 'projects',  icon: <FolderOutlined />,  label: 'Dự án' },
  { key: 'board',     icon: <ProjectOutlined />, label: 'Kanban' },
];

const getInitials = (name?: string) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
};

const Sidebar: React.FC<SidebarProps> = ({ activeKey, onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 48, minWidth: 48, height: '100vh', background: '#191927', borderRight: '1px solid #2a2a4a', zIndex: 100, overflow: 'hidden', flexShrink: 0 }}>
      
      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, padding: '8px 0', gap: 2, overflowY: 'auto', width: '100%' }}>
        {NAV_ITEMS.map((item) => (
          <Tooltip key={item.key} title={item.label} placement="right">
            <button
              onClick={() => onMenuClick(item.key)}
              style={{
                width: 36, height: 36, borderRadius: 8, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 16, transition: 'all 0.15s ease',
                background: activeKey === item.key ? 'rgba(124,58,237,0.2)' : 'transparent',
                color: activeKey === item.key ? '#a78bfa' : '#64748b',
              }}
            >
              {item.icon}
            </button>
          </Tooltip>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0 12px', gap: 4, borderTop: '1px solid #2a2a4a', width: '100%' }}>
        <Popconfirm title="Đăng xuất?" description="Bạn có chắc muốn đăng xuất?" onConfirm={logout} okText="Đăng xuất" cancelText="Huỷ" placement="right">
          <Tooltip title={user?.name || 'Guest'} placement="right">
            <Avatar size={32} style={{ backgroundColor: '#7c3aed', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginTop: 2 }}>
              {getInitials(user?.name)}
            </Avatar>
          </Tooltip>
        </Popconfirm>
      </div>
    </aside>
  );
};

export default Sidebar;
