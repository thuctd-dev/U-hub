import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Tooltip } from 'antd';
import {
  PlusOutlined, FilterOutlined, ReloadOutlined, SearchOutlined,
  AppstoreOutlined, TableOutlined, FolderOutlined, DownOutlined,
  CheckOutlined, CloseOutlined, FlagOutlined, ArrowLeftOutlined, CheckCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import type { Project, TaskStatus, TaskPriority } from '../types';

type ViewType = 'board' | 'list' | 'calendar' | 'gantt' | 'table';

export interface FilterState {
  search: string;
  priorities: TaskPriority[];
  statuses: TaskStatus[];
}

export const EMPTY_FILTER: FilterState = { search: '', priorities: [], statuses: [] };

interface SubHeaderProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  onAddTask: () => void;
  onRefresh: () => void;
  loading?: boolean;
  showSeedButton?: boolean;
  onSeed?: () => void;
  projects?: Project[];
  selectedProjectId?: string | null;
  onSelectProject?: (projectId: string | null) => void;
  filter?: FilterState;
  onFilterChange?: (f: FilterState) => void;
  // project kanban header
  projectHeader?: {
    name: string;
    color: string;
    onBack: () => void;
    allDone?: boolean;
    onComplete?: () => void;
    onAIGenerate?: () => void;
  };
}

const VIEWS: { key: ViewType; icon: React.ReactNode; label: string }[] = [
  { key: 'board', icon: <AppstoreOutlined />, label: 'Bảng' },
  { key: 'table', icon: <TableOutlined />,    label: 'Bảng tính' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'URGENT', label: 'Khẩn cấp', color: '#ef4444' },
  { value: 'HIGH',   label: 'Cao',       color: '#f97316' },
  { value: 'MEDIUM', label: 'Trung bình',color: '#f59e0b' },
  { value: 'LOW',    label: 'Thấp',      color: '#64748b' },
];

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'TO_DO',       label: 'Phải làm',       color: '#94a3b8' },
  { value: 'IN_PROGRESS', label: 'Đang tiến hành', color: '#818cf8' },
  { value: 'DONE',        label: 'Hoàn thành',     color: '#34d399' },
];

const SubHeader: React.FC<SubHeaderProps> = ({
  activeView, onViewChange, onAddTask, onRefresh, loading,
  showSeedButton, onSeed,
  projects, selectedProjectId, onSelectProject,
  filter = EMPTY_FILTER, onFilterChange,
  projectHeader,
}) => {
  const [projDropOpen, setProjDropOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const projBtnRef   = useRef<HTMLButtonElement>(null);
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const [projPos,   setProjPos]   = useState({ top: 0, left: 0 });
  const [filterPos, setFilterPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (projDropOpen && projBtnRef.current) {
      const r = projBtnRef.current.getBoundingClientRect();
      setProjPos({ top: r.bottom + 4, left: r.left });
    }
  }, [projDropOpen]);

  useEffect(() => {
    if (filterOpen && filterBtnRef.current) {
      const r = filterBtnRef.current.getBoundingClientRect();
      setFilterPos({ top: r.bottom + 4, left: r.right - 260 });
    }
  }, [filterOpen]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  const selectedProject = projects?.find(p => p._id === selectedProjectId);
  const showProjectSelector = projects !== undefined && onSelectProject !== undefined;
  const hasFilter = filter.priorities.length > 0 || filter.statuses.length > 0;
  const activeFilterCount = filter.priorities.length + filter.statuses.length;

  const setFilter = (patch: Partial<FilterState>) => onFilterChange?.({ ...filter, ...patch });

  const togglePriority = (v: TaskPriority) =>
    setFilter({ priorities: filter.priorities.includes(v) ? filter.priorities.filter(x => x !== v) : [...filter.priorities, v] });

  const toggleStatus = (v: TaskStatus) =>
    setFilter({ statuses: filter.statuses.includes(v) ? filter.statuses.filter(x => x !== v) : [...filter.statuses, v] });

  const actionBtn: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px', height: 28,
    borderRadius: 6, border: 'none', background: 'transparent', color: '#64748b',
    fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.15s',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', height: 40, minHeight: 40,
      background: 'transparent',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '0 16px', overflow: 'hidden', flexShrink: 0, gap: 8,
    }} className='backdrop-blur-lg'>
      {/* ── Project kanban header (back + name + complete btn) ── */}
      {projectHeader && (
        <>
          <button onClick={projectHeader.onBack}
            style={{ display: 'flex', alignItems: 'center', gap: 5, border: 'none', background: 'transparent', color: '#c8d0e0', cursor: 'pointer', fontSize: 12, padding: '4px 6px', borderRadius: 6, flexShrink: 0, whiteSpace: 'nowrap' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#64748b')}
            onMouseLeave={e => (e.currentTarget.style.color = '#c8d0e0')}
          >
            <ArrowLeftOutlined style={{ fontSize: 11 }} /> Dự án
          </button>
          <div style={{ width: 1, height: 16, background: '#1e1e35', flexShrink: 0 }} />
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: projectHeader.color, flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#dde3f0', flexShrink: 0, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {projectHeader.name}
          </span>
          {projectHeader.allDone && projectHeader.onComplete && (
            <button onClick={projectHeader.onComplete}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', border: 'none', borderRadius: 6, background: 'rgba(52,211,153,0.15)', color: '#34d399', fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(52,211,153,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(52,211,153,0.15)')}
            >
              <CheckCircleOutlined style={{ fontSize: 11 }} /> Hoàn thành dự án
            </button>
          )}
          {projectHeader.onAIGenerate && (
            <button onClick={projectHeader.onAIGenerate}
              style={{ display: 'flex', alignItems: 'center',border: '1px solid #a855f7', gap: 5, padding: '3px 10px', borderRadius: 6, background: 'rgba(124,58,237,0.15)', color: '#a78bfa', fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.15)')}
            >
              <ThunderboltOutlined style={{ fontSize: 11 }} /> AI Generate
            </button>
          )}
          <div style={{ width: 1, height: 16, background: '#1e1e35', flexShrink: 0 }} />
        </>
      )}

      {/* ── Project selector ── */}
      {showProjectSelector && (
        <>
          <button ref={projBtnRef} onClick={() => setProjDropOpen(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', height: 28, borderRadius: 7, border: '1px solid #1e1e35', background: 'transparent', color: selectedProject ? '#dde3f0' : '#64748b', fontSize: 12, cursor: 'pointer', flexShrink: 0, transition: 'border-color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#2a2a45')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e35')}
          >
            {selectedProject
              ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: selectedProject.color, flexShrink: 0 }} />
              : <FolderOutlined style={{ fontSize: 11 }} />}
            <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedProject?.name ?? 'Tất cả dự án'}
            </span>
            <DownOutlined style={{ fontSize: 9, color: '#4a4a65' }} />
          </button>
          <div style={{ width: 1, height: 16, background: '#1e1e35', flexShrink: 0 }} />

          {projDropOpen && ReactDOM.createPortal(
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 9990 }} onClick={() => setProjDropOpen(false)} />
              <div style={{ position: 'absolute', top: projPos.top, left: projPos.left, zIndex: 9991, minWidth: 220, background: '#1a1a2e', border: '1px solid #2a2a45', borderRadius: 10, padding: '4px 0', boxShadow: '0 16px 40px rgba(0,0,0,0.55)' }}>
                <button onClick={() => { onSelectProject!(null); setProjDropOpen(false); }} style={dropItem}>
                  <FolderOutlined style={{ fontSize: 13, color: '#64748b' }} />
                  <span style={{ flex: 1, color: '#c8d0e0' }}>Tất cả dự án</span>
                  {selectedProjectId === null && <CheckOutlined style={{ fontSize: 10, color: '#34d399' }} />}
                </button>
                {projects!.length > 0 && <div style={{ height: 1, background: '#1e1e35', margin: '3px 0' }} />}
                {projects!.filter(p => p.status === 'ACTIVE').map(p => (
                  <button key={p._id} onClick={() => { onSelectProject!(p._id); setProjDropOpen(false); }} style={dropItem}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, color: '#c8d0e0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                    {selectedProjectId === p._id && <CheckOutlined style={{ fontSize: 10, color: '#34d399' }} />}
                  </button>
                ))}
                {projects!.filter(p => p.status === 'ACTIVE').length === 0 && (
                  <div style={{ padding: '8px 14px', fontSize: 12, color: '#3a3a58' }}>Chưa có dự án nào</div>
                )}
              </div>
            </>,
            document.body
          )}
        </>
      )}

      {/* ── View tabs ── */}
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {VIEWS.map(v => (
          <button key={v.key} onClick={() => onViewChange(v.key)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 12px', height: 40, border: 'none', background: 'transparent', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, borderBottom: `2px solid ${activeView === v.key ? '#7c3aed' : 'transparent'}`, color: activeView === v.key ? '#a78bfa' : '#64748b' }}>
            {v.icon}<span>{v.label}</span>
          </button>
        ))}
      </div>

      {/* ── Right actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>

        {/* Search — expand inline */}
        {searchOpen ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px', height: 28, borderRadius: 6, border: '1px solid #2a2a45', background: '#0e0e1c' }}>
            <SearchOutlined style={{ fontSize: 12, color: '#64748b' }} />
            <input
              ref={searchInputRef}
              value={filter.search}
              onChange={e => setFilter({ search: e.target.value })}
              placeholder="Tìm nhiệm vụ..."
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#dde3f0', fontSize: 12, width: 160 }}
            />
            <button onClick={() => { setFilter({ search: '' }); setSearchOpen(false); }}
              style={{ border: 'none', background: 'transparent', color: '#4a4a65', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
              <CloseOutlined style={{ fontSize: 10 }} />
            </button>
          </div>
        ) : (
          <Tooltip title="Tìm kiếm">
            <button style={actionBtn} onClick={() => setSearchOpen(true)}
              onMouseEnter={e => (e.currentTarget.style.color = '#c8d0e0')}
              onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}>
              <SearchOutlined />
            </button>
          </Tooltip>
        )}

        {/* Filter button */}
        <Tooltip title="Bộ lọc">
          <button ref={filterBtnRef}
            onClick={() => setFilterOpen(v => !v)}
            style={{
              ...actionBtn,
              color: hasFilter ? '#a78bfa' : '#64748b',
              background: hasFilter ? 'rgba(124,58,237,0.12)' : 'transparent',
              border: hasFilter ? '1px solid rgba(124,58,237,0.3)' : 'none',
              borderRadius: 6, position: 'relative',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#c8d0e0')}
            onMouseLeave={e => (e.currentTarget.style.color = hasFilter ? '#a78bfa' : '#64748b')}
          >
            <FilterOutlined />
            <span>Lọc</span>
            {activeFilterCount > 0 && (
              <span style={{ marginLeft: 2, background: '#7c3aed', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 99, padding: '1px 5px', lineHeight: 1.4 }}>
                {activeFilterCount}
              </span>
            )}
          </button>
        </Tooltip>

        {/* Filter dropdown */}
        {filterOpen && ReactDOM.createPortal(
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 9990 }} onClick={() => setFilterOpen(false)} />
            <div style={{ position: 'absolute', top: filterPos.top, left: filterPos.left, zIndex: 9991, width: 260, background: '#1a1a2e', border: '1px solid #2a2a45', borderRadius: 12, padding: '12px 14px', boxShadow: '0 16px 40px rgba(0,0,0,0.55)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#c8d0e0' }}>Bộ lọc</span>
                {hasFilter && (
                  <button onClick={() => setFilter({ priorities: [], statuses: [] })}
                    style={{ border: 'none', background: 'transparent', color: '#64748b', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CloseOutlined style={{ fontSize: 9 }} /> Xoá lọc
                  </button>
                )}
              </div>

              {/* Priority filter */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#4a4a65', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <FlagOutlined style={{ fontSize: 10 }} /> Ưu tiên
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {PRIORITY_OPTIONS.map(p => {
                    const active = filter.priorities.includes(p.value);
                    return (
                      <button key={p.value} onClick={() => togglePriority(p.value)}
                        style={{ padding: '3px 10px', borderRadius: 99, border: `1px solid ${active ? p.color : '#2a2a45'}`, background: active ? p.color + '22' : 'transparent', color: active ? p.color : '#64748b', fontSize: 11, cursor: 'pointer', transition: 'all 0.12s' }}>
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status filter */}
              <div>
                <div style={{ fontSize: 11, color: '#4a4a65', marginBottom: 6 }}>Trạng thái</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {STATUS_OPTIONS.map(s => {
                    const active = filter.statuses.includes(s.value);
                    return (
                      <button key={s.value} onClick={() => toggleStatus(s.value)}
                        style={{ padding: '3px 10px', borderRadius: 99, border: `1px solid ${active ? s.color : '#2a2a45'}`, background: active ? s.color + '22' : 'transparent', color: active ? s.color : '#64748b', fontSize: 11, cursor: 'pointer', transition: 'all 0.12s' }}>
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>,
          document.body
        )}

        <Tooltip title="Làm mới">
          <button style={actionBtn} onClick={onRefresh}
            onMouseEnter={e => (e.currentTarget.style.color = '#c8d0e0')}
            onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}>
            <ReloadOutlined spin={loading} />
          </button>
        </Tooltip>

        {showSeedButton && (
          <button style={{ ...actionBtn, border: '1px solid #2a2a4a' }} onClick={onSeed}>
            <PlusOutlined /> Tạo dữ liệu mẫu
          </button>
        )}

        {(!showProjectSelector || selectedProjectId !== null) && (
          <button onClick={onAddTask}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 12px', height: 28, borderRadius: 6, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <PlusOutlined /> Nhiệm vụ
          </button>
        )}
      </div>
    </div>
  );
};

const dropItem: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 9,
  width: '100%', padding: '7px 14px', border: 'none',
  background: 'transparent', fontSize: 13, cursor: 'pointer', textAlign: 'left',
};

export default SubHeader;
