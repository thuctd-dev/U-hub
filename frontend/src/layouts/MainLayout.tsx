import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import SubHeader from '../components/SubHeader';
import KanbanBoard from '../components/KanbanBoard';
import TableBoard from '../components/TableBoard';
import ProjectsPage from '../pages/ProjectsPage';
import { taskAPI, userAPI, projectAPI } from '../services/api';
import type { Task, TaskStatus, User, Project } from '../types';
import { type FilterState, EMPTY_FILTER } from '../components/SubHeader';
import { PictureOutlined } from '@ant-design/icons';

type ViewType = 'board' | 'table';

const MainLayout: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('projects');
  const [activeView, setActiveView] = useState<ViewType>('board');

  // Kanban state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Project selector for Kanban tab
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);
  const [bgIndex, setBgIndex] = useState(2);

  // Initialize random background on mount
  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * 9) + 2; // 2 to 10
    setBgIndex(randomIdx);
  }, []);

  const changeBackground = () => {
    setBgIndex(prev => (prev >= 10 ? 2 : prev + 1));
  };

  const filteredTasks = React.useMemo(() => {
    let visible = tasks;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      visible = visible.filter(t => t.title.toLowerCase().includes(q));
    }
    if (filter.priorities.length) {
      visible = visible.filter(t => filter.priorities.includes(t.priority));
    }
    if (filter.statuses.length) {
      visible = visible.filter(t => filter.statuses.includes(t.status));
    }
    return visible;
  }, [tasks, filter]);

  // Fetch active projects for the selector
  const fetchProjects = useCallback(async () => {
    try {
      const res = await projectAPI.getAll();
      setProjects(res.data.filter((p: Project) => p.status === 'ACTIVE'));
    } catch { /* silent */ }
  }, []);

  const fetchTasks = useCallback(async (projectId?: string | null) => {
    try {
      setLoading(true);
      const res = await taskAPI.getAll(projectId ?? undefined);
      setTasks(res.data);
    } catch { toast.error('Không thể tải dữ liệu task'); }
    finally { setLoading(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    try { const res = await userAPI.getAll(); setUsers(res.data); } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (activeMenu === 'board') {
      fetchProjects();
      fetchUsers();
      fetchTasks(selectedProjectId);
    }
  }, [activeMenu]); // eslint-disable-line

  // Re-fetch tasks when project selection changes
  const handleSelectProject = (projectId: string | null) => {
    setSelectedProjectId(projectId);
    fetchTasks(projectId);
  };

  const handleAddTask = async () => {
    const title = prompt('Tên nhiệm vụ:');
    if (!title?.trim()) return;
    try {
      await taskAPI.create({
        title: title.trim(), status: 'TO_DO', priority: 'MEDIUM',
        projectId: selectedProjectId ?? undefined,
        order: tasks.filter(t => t.status === 'TO_DO').length,
      });
      fetchTasks(selectedProjectId);
    } catch { toast.error('Không thể tạo nhiệm vụ'); }
  };

  const handleDeleteTask = async (taskId: string) => {
    try { await taskAPI.delete(taskId); setTasks(prev => prev.filter(t => t._id !== taskId)); }
    catch { toast.error('Không thể xoá'); }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try { await taskAPI.updateStatus(taskId, { status: newStatus }); }
    catch { toast.error('Không thể cập nhật trạng thái'); fetchTasks(selectedProjectId); }
  };

  const handleUpdatePriority = async (taskId: string, priority: string) => {
    try {
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, priority: priority as Task['priority'] } : t));
      await taskAPI.updatePriority(taskId, { priority });
    } catch { toast.error('Không thể cập nhật ưu tiên'); }
  };

  const handleUpdateDates = async (taskId: string, start: Date | undefined, due: Date | undefined) => {
    try {
      const startDate = start ? start.toISOString() : null;
      const dueDate = due ? due.toISOString() : null;
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, startDate: startDate ?? undefined, dueDate: dueDate ?? undefined } : t));
      await taskAPI.updateDates(taskId, { startDate, dueDate });
    } catch { toast.error('Không thể cập nhật ngày'); }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0f0f1a' }}>
      <Sidebar activeKey={activeMenu} onMenuClick={setActiveMenu} />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minWidth: 0 }}>
        <TopBar />

        {/* Projects view */}
        {activeMenu === 'projects' && (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <ProjectsPage />
          </div>
        )}

        {/* Kanban with project switcher */}
        {activeMenu === 'board' && (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {/* Video/Image background — covers SubHeader + board */}
            <div 
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0,  pointerEvents: 'none' }}>
              <img src={`/bg${bgIndex}.jpg`} className="w-full h-full object-cover" />
            </div>
            <div style={{ position: 'absolute', inset: 0,  zIndex: 1, pointerEvents: 'none' }} />

            {/* Content above video */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <SubHeader
                activeView={activeView as any}
                onViewChange={setActiveView as any}
                onAddTask={handleAddTask}
                onRefresh={() => fetchTasks(selectedProjectId)}
                loading={loading}
                showSeedButton={false}
                projects={projects}
                selectedProjectId={selectedProjectId}
                onSelectProject={handleSelectProject}
                filter={filter}
                onFilterChange={setFilter}
              />
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {projects.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <div style={{ fontSize: 40 }}>📁</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#4a4a65' }}>Chưa có dự án nào</div>
                    <div style={{ fontSize: 12, color: '#3a3a58' }}>Tạo dự án trước để bắt đầu thêm nhiệm vụ</div>
                  </div>
                ) : selectedProjectId === null ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <div style={{ fontSize: 40 }}>🗂️</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#4a4a65' }}>Chọn một dự án để xem kanban</div>
                    <div style={{ fontSize: 12, color: '#3a3a58' }}>Dùng dropdown bên trên để chọn dự án</div>
                  </div>
                ) : activeView === 'table' ? (
                  <div style={{ flex: 1, overflowY: 'auto' }} className="scrollbar-thin">
                    <TableBoard
                      tasks={filteredTasks}
                      users={users}
                      onDeleteTask={handleDeleteTask}
                      onChangeStatus={handleUpdateTaskStatus}
                      onChangePriority={handleUpdatePriority}
                    />
                  </div>
                ) : (
                  <KanbanBoard
                    tasks={filteredTasks}
                    users={users}
                    setTasks={setTasks}
                    onTaskClick={() => {}}
                    onDeleteTask={handleDeleteTask}
                    onChangeStatus={handleUpdateTaskStatus}
                    onUpdateTaskStatus={handleUpdateTaskStatus}
                    onChangePriority={handleUpdatePriority}
                    onChangeDates={handleUpdateDates}
                    onInlineSave={async (data) => {
                      await taskAPI.create({
                        ...data,
                        projectId: selectedProjectId ?? undefined,
                        order: tasks.filter((t: Task) => t.status === data.status).length,
                      });
                      fetchTasks(selectedProjectId);
                    }}
                  />
                )}
              </div>
            </div>

            {/* Floating Change Background Button for Board View */}
            <button
              onClick={changeBackground}
              title="Đổi hình nền"
              style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(45, 91, 117, 0.8)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 9999,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1) rotate(15deg)';
                e.currentTarget.style.background = 'rgba(68, 119, 148, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                e.currentTarget.style.background = 'rgba(45, 91, 117, 0.8)';
              }}
            >
              <PictureOutlined />
            </button>
          </div>
        )}

        {activeMenu === 'dashboard' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3a3a58', fontSize: 14 }}>
            Dashboard (coming soon)
          </div>
        )}
      </div>
    </div>
  );
};

export default MainLayout;
