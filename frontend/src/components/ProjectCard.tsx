import React, { useState } from 'react';
import {
  CheckCircleOutlined, DeleteOutlined, EditOutlined,
  MoreOutlined, FolderOpenOutlined, ReloadOutlined,
} from '@ant-design/icons';
import type { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  taskStats: { total: number; done: number };
  onClick: () => void;
  onComplete: () => void;
  onReopen: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
}

const PROJECT_COLORS = [
  '#7c3aed','#2563eb','#0891b2','#059669',
  '#d97706','#dc2626','#db2777','#7c3aed',
];

const ProjectCard: React.FC<ProjectCardProps> = ({
  project, taskStats, onClick, onComplete, onReopen, onDelete, onRename,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [nameVal, setNameVal] = useState(project.name);

  const allDone = taskStats.total > 0 && taskStats.done === taskStats.total;
  const pct = taskStats.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0;
  const isCompleted = project.status === 'COMPLETED';

  const handleRename = () => {
    if (nameVal.trim() && nameVal !== project.name) onRename(nameVal.trim());
    setEditing(false);
  };

  return (
    <div
      onClick={() => !editing && !menuOpen && onClick()}
      style={{
        position: 'relative',
        background: isCompleted ? 'rgba(6,18,34,0.72)' : 'rgba(18,50,73,0.72)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: `1px solid ${isCompleted ? 'rgba(68,119,148,0.2)' : 'rgba(68,119,148,0.35)'}`,
        borderRadius: 14,
        padding: '18px 18px 16px',
        cursor: 'pointer',
        transition: 'all 0.18s',
        overflow: 'hidden',
        opacity: isCompleted ? 0.8 : 1,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = project.color + '99'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px ${project.color}33`; (e.currentTarget as HTMLDivElement).style.background = isCompleted ? 'rgba(6,18,34,0.82)' : 'rgba(18,50,73,0.85)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = isCompleted ? 'rgba(68,119,148,0.2)' : 'rgba(68,119,148,0.35)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.background = isCompleted ? 'rgba(6,18,34,0.72)' : 'rgba(18,50,73,0.72)'; }}
    >
      {/* Top accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${project.color}, ${project.color}44)`, borderRadius: '14px 14px 0 0' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: project.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {isCompleted
              ? <CheckCircleOutlined style={{ color: '#34d399', fontSize: 18 }} />
              : <FolderOpenOutlined style={{ color: project.color, fontSize: 18 }} />
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              <input
                autoFocus
                value={nameVal}
                onChange={e => setNameVal(e.target.value)}
                onBlur={handleRename}
                onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') { setNameVal(project.name); setEditing(false); } }}
                onClick={e => e.stopPropagation()}
                style={{ background: 'transparent', border: 'none', borderBottom: `1px solid ${project.color}`, outline: 'none', color: '#dde3f0', fontSize: 15, fontWeight: 600, width: '100%', padding: '2px 0' }}
              />
            ) : (
              <div style={{ fontSize: 15, fontWeight: 700, color: isCompleted ? '#8ab4c8' : '#f0f6ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>
                {project.name}
              </div>
            )}
            {project.description && (
              <div style={{ fontSize: 11, color: '#7aadca', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {project.description}
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
            style={{ width: 28, height: 28, border: 'none', borderRadius: 7, background: 'transparent', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}
          >
            <MoreOutlined />
          </button>
          {menuOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={e => { e.stopPropagation(); setMenuOpen(false); }} />
              <div style={{ position: 'absolute', right: 0, top: 32, zIndex: 101, background: 'rgba(6,18,34,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(68,119,148,0.4)', borderRadius: 10, padding: '4px 0', minWidth: 170, boxShadow: '0 16px 40px rgba(0,0,0,0.6)' }}>
                <button onClick={e => { e.stopPropagation(); setEditing(true); setMenuOpen(false); }} style={mItem}>
                  <EditOutlined style={{ fontSize: 13 }} /><span>Đổi tên</span>
                </button>
                {isCompleted ? (
                  <button onClick={e => { e.stopPropagation(); onReopen(); setMenuOpen(false); }} style={mItem}>
                    <ReloadOutlined style={{ fontSize: 13 }} /><span>Mở lại dự án</span>
                  </button>
                ) : allDone && (
                  <button onClick={e => { e.stopPropagation(); onComplete(); setMenuOpen(false); }} style={{ ...mItem, color: '#34d399' }}>
                    <CheckCircleOutlined style={{ fontSize: 13 }} /><span>Hoàn thành</span>
                  </button>
                )}
                <div style={{ height: 1, background: '#1e1e35', margin: '3px 0' }} />
                <button onClick={e => { e.stopPropagation(); onDelete(); setMenuOpen(false); }} style={{ ...mItem, color: '#f87171' }}>
                  <DeleteOutlined style={{ fontSize: 13 }} /><span>Xoá dự án</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: '#7aadca' }}>{taskStats.done}/{taskStats.total} nhiệm vụ</span>
          <span style={{ fontSize: 11, color: pct === 100 ? '#34d399' : '#a8cfe0', fontWeight: pct === 100 ? 700 : 500 }}>{pct}%</span>
        </div>
        <div style={{ height: 5, borderRadius: 99, background: 'rgba(6,18,34,0.5)', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: pct === 100 ? '#34d399' : `linear-gradient(90deg, ${project.color}, ${project.color}cc)`, transition: 'width 0.4s', boxShadow: pct > 0 ? `0 0 8px ${project.color}88` : 'none' }} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: '#5a8fa8' }}>
          {isCompleted && project.completedAt
            ? `Hoàn thành ${new Date(project.completedAt).toLocaleDateString('vi-VN')}`
            : `${taskStats.total - taskStats.done} còn lại`}
        </span>
        {/* Complete button — shown when all done and not yet completed */}
        {allDone && !isCompleted && (
          <button
            onClick={e => { e.stopPropagation(); onComplete(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', border: 'none', borderRadius: 6,
              background: 'rgba(52,211,153,0.15)', color: '#34d399',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(52,211,153,0.25)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(52,211,153,0.15)')}
          >
            <CheckCircleOutlined style={{ fontSize: 12 }} />
            Hoàn thành dự án
          </button>
        )}
      </div>
    </div>
  );
};

const mItem: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  width: '100%', padding: '7px 14px', border: 'none',
  background: 'transparent', color: '#d0e8f5', fontSize: 13,
  cursor: 'pointer', textAlign: 'left',
};

export { PROJECT_COLORS };
export default ProjectCard;
