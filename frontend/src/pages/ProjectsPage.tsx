import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Modal, Input } from 'antd';
import { PlusOutlined, CheckCircleOutlined, FolderOpenOutlined, ExclamationCircleFilled, PictureOutlined } from '@ant-design/icons';
import KanbanBoard from '../components/KanbanBoard';
import TableBoard from '../components/TableBoard';
import ProjectCard, { PROJECT_COLORS } from '../components/ProjectCard';
import SubHeader, { type FilterState, EMPTY_FILTER } from '../components/SubHeader';
import AIGenerateModal from '../components/AIGenerateModal';
import { projectAPI, taskAPI, userAPI } from '../services/api';
import type { Project, Task, TaskStatus, User } from '../types';

type Tab = 'active' | 'completed';
type ViewType = 'board' | 'table';

const ProjectsPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('active');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasksByProject, setTasksByProject] = useState<Record<string, Task[]>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [projectTasksLoading, setProjectTasksLoading] = useState(false);
  const [taskPromptOpen, setTaskPromptOpen] = useState(false);
  const [taskPromptTitle, setTaskPromptTitle] = useState('');
  const [activeView, setActiveView] = useState<ViewType>('board');
  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);
  const [creatingProject, setCreatingProject] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState(PROJECT_COLORS[0]);
  const [bgIndex, setBgIndex] = useState(2);

  // Initialize random background on mount
  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * 9) + 2; // 2 to 10
    setBgIndex(randomIdx);
  }, []);

  const changeBackground = () => {
    setBgIndex(prev => (prev >= 10 ? 2 : prev + 1));
  };

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const [projRes, usersRes] = await Promise.all([projectAPI.getAll(), userAPI.getAll()]);
      const projs: Project[] = projRes.data;
      setProjects(projs);
      setUsers(usersRes.data);
      // fetch task stats for all projects
      const stats: Record<string, Task[]> = {};
      await Promise.all(projs.map(async p => {
        const res = await taskAPI.getAll(p._id);
        stats[p._id] = res.data;
      }));
      setTasksByProject(stats);
    } catch { toast.error('Không thể tải dự án'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const fetchProjectTasks = useCallback(async (projectId: string) => {
    try {
      setProjectTasksLoading(true);
      const res = await taskAPI.getAll(projectId);
      setProjectTasks(res.data);
    } catch { toast.error('Không thể tải nhiệm vụ'); }
    finally { setProjectTasksLoading(false); }
  }, []);

  const openProject = (project: Project) => {
    setActiveProject(project);
    fetchProjectTasks(project._id);
  };

  const closeProject = () => {
    setActiveProject(null);
    setProjectTasks([]);
    fetchProjects(); // refresh stats
  };

  const handleCreateProject = async () => {
    if (!newName.trim()) return;
    try {
      const res = await projectAPI.create({ name: newName.trim(), description: newDesc.trim(), color: newColor });
      setProjects(prev => [...prev, res.data]);
      setTasksByProject(prev => ({ ...prev, [res.data._id]: [] }));
      setNewName(''); setNewDesc(''); setNewColor(PROJECT_COLORS[0]);
      setCreatingProject(false);
      toast.success('Đã tạo dự án!');
    } catch { toast.error('Không thể tạo dự án'); }
  };

  const handleComplete = async (project: Project) => {
    try {
      const res = await projectAPI.complete(project._id);
      setProjects(prev => prev.map(p => p._id === project._id ? res.data : p));
      toast.success(`Dự án "${project.name}" đã hoàn thành!`);
    } catch { toast.error('Không thể hoàn thành dự án'); }
  };

  const handleReopen = async (project: Project) => {
    try {
      const res = await projectAPI.reopen(project._id);
      setProjects(prev => prev.map(p => p._id === project._id ? res.data : p));
      toast.success('Đã mở lại dự án');
    } catch { toast.error('Không thể mở lại dự án'); }
  };

  const handleDelete = (project: Project) => {
    Modal.confirm({
      title: 'Xoá dự án',
      icon: <ExclamationCircleFilled />,
      content: `Xoá dự án "${project.name}"? Tất cả nhiệm vụ sẽ bị xoá.`,
      okText: 'Xoá',
      okType: 'danger',
      cancelText: 'Huỷ',
      onOk: async () => {
        try {
          await projectAPI.delete(project._id);
          setProjects(prev => prev.filter(p => p._id !== project._id));
          toast.success('Đã xoá dự án');
        } catch { toast.error('Không thể xoá dự án'); }
      }
    });
  };

  const handleRename = async (project: Project, name: string) => {
    try {
      const res = await projectAPI.update(project._id, { name });
      setProjects(prev => prev.map(p => p._id === project._id ? res.data : p));
    } catch { toast.error('Không thể đổi tên'); }
  };

  // ── Kanban handlers for active project ──
  const handleAddTask = () => {
    if (!activeProject) return;
    setTaskPromptTitle('');
    setTaskPromptOpen(true);
  };

  const submitAddTask = async () => {
    if (!activeProject || !taskPromptTitle.trim()) return;
    try {
      await taskAPI.create({ title: taskPromptTitle.trim(), status: 'TO_DO', priority: 'MEDIUM', projectId: activeProject._id, order: projectTasks.filter(t => t.status === 'TO_DO').length });
      fetchProjectTasks(activeProject._id);
      setTaskPromptOpen(false);
    } catch { toast.error('Không thể tạo nhiệm vụ'); }
  };

  const handleDeleteTask = async (taskId: string) => {
    try { await taskAPI.delete(taskId); setProjectTasks(prev => prev.filter(t => t._id !== taskId)); toast.success('Đã xoá!'); }
    catch { toast.error('Không thể xoá'); }
  };

  const handleUpdateStatus = async (taskId: string, status: TaskStatus) => {
    try { await taskAPI.updateStatus(taskId, { status }); }
    catch { toast.error('Lỗi cập nhật trạng thái'); fetchProjectTasks(activeProject!._id); }
  };

  const handleUpdatePriority = async (taskId: string, priority: string) => {
    try {
      setProjectTasks(prev => prev.map(t => t._id === taskId ? { ...t, priority: priority as Task['priority'] } : t));
      await taskAPI.updatePriority(taskId, { priority });
    } catch { toast.error('Lỗi cập nhật ưu tiên'); }
  };

  const handleUpdateDates = async (taskId: string, start: Date | undefined, due: Date | undefined) => {
    try {
      const startDate = start ? start.toISOString() : null;
      const dueDate = due ? due.toISOString() : null;
      setProjectTasks(prev => prev.map(t => t._id === taskId ? { ...t, startDate: startDate ?? undefined, dueDate: dueDate ?? undefined } : t));
      await taskAPI.updateDates(taskId, { startDate, dueDate });
    } catch { toast.error('Lỗi cập nhật ngày'); }
  };

  // Check if all tasks done → show complete button in kanban header
  const allTasksDone = projectTasks.length > 0 && projectTasks.every(t => t.status === 'DONE');

  const filteredTasks = useMemo(()=> {
    let visible = projectTasks;
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
  }, [projectTasks, filter]);

  const activeProjects = projects.filter(p => p.status === 'ACTIVE');
  const completedProjects = projects.filter(p => p.status === 'COMPLETED');

  // ── Kanban view for a project ──
  if (activeProject) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
        {/* Video/Image background */}
        <div 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, opacity: 0.7, pointerEvents: 'none' }}>
          <img src={`/bg${bgIndex}.jpg`} className='w-full h-full object-cover' />
        </div>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <SubHeader
          activeView={activeView as any}
          onViewChange={setActiveView as any}
          onAddTask={handleAddTask}
          onRefresh={() => fetchProjectTasks(activeProject._id)}
          loading={projectTasksLoading}
          filter={filter}
          onFilterChange={setFilter}
          projectHeader={{
            name: activeProject.name,
            color: activeProject.color,
            onBack: closeProject,
            allDone: allTasksDone && activeProject.status === 'ACTIVE',
            onComplete: () => handleComplete(activeProject).then(closeProject),
            onAIGenerate: () => setShowAIModal(true),
          }}
        />

        {showAIModal && (
          <AIGenerateModal
            projectId={activeProject._id}
            projectName={activeProject.name}
            onClose={() => setShowAIModal(false)}
            onTasksCreated={() => fetchProjectTasks(activeProject._id)}
          />
        )}

        <Modal
          title="Thêm nhiệm vụ mới"
          open={taskPromptOpen}
          onOk={submitAddTask}
          onCancel={() => setTaskPromptOpen(false)}
          okText="Thêm"
          cancelText="Huỷ"
        >
          <Input
            autoFocus
            placeholder="Nhập tên nhiệm vụ..."
            value={taskPromptTitle}
            onChange={e => setTaskPromptTitle(e.target.value)}
            onPressEnter={submitAddTask}
          />
        </Modal>

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {activeView === 'table' ? (
            <div style={{ flex: 1, overflowY: 'auto' }} className="scrollbar-thin">
              <TableBoard
                tasks={filteredTasks}
                users={users}
                onDeleteTask={handleDeleteTask}
                onChangeStatus={handleUpdateStatus}
                onChangePriority={handleUpdatePriority}
              />
            </div>
          ) : (
            <KanbanBoard
              tasks={filteredTasks}
              users={users}
              setTasks={setProjectTasks}
              onTaskClick={() => {}}
              onDeleteTask={handleDeleteTask}
              onChangeStatus={handleUpdateStatus}
              onUpdateTaskStatus={handleUpdateStatus}
              onChangePriority={handleUpdatePriority}
              onChangeDates={handleUpdateDates}
              onInlineSave={async (data) => {
                await taskAPI.create({ ...data, projectId: activeProject._id, order: projectTasks.filter(t => t.status === data.status).length });
                fetchProjectTasks(activeProject._id);
              }}
            />
          )}
        </div>
        </div>
      </div>
    );
  }

  // ── Project list view ──
  return (
    <div style={{
      flex: 1, overflow: 'auto', padding: '24px 28px',
      position: 'relative',
      backgroundImage: `url("/bg${bgIndex}.jpg")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        {/* Pill tab group */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'rgba(68,119,148,0.3)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(68,119,148,0.25)',
          borderRadius: 13, padding: '4px',
        }}>
          {([['active', 'Đang thực hiện', activeProjects.length], ['completed', 'Đã hoàn thành', completedProjects.length]] as const).map(([key, label, count]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{
                padding: '7px 16px', border: 'none', cursor: 'pointer',
                borderRadius: 10, fontSize: 13, fontWeight: tab === key ? 700 : 500,
                display: 'flex', alignItems: 'center', gap: 8,
                background: tab === key
                  ? '#447794'
                  : 'transparent',
                color: tab === key ? '#e8f4ff' : '#7aadca',
                boxShadow: tab === key
                  ? '0 2px 8px rgba(18,50,73,0.7), inset 0 1px 0 rgba(255,255,255,0.1)'
                  : 'none',
              }} className='hover:bg-cyan-500 hover:text-white transition-all duration-700'>
              {label}
              <span style={{
                fontSize: 11, padding: '2px 6px', borderRadius: 20, fontWeight: 500,
                background: tab === key ? 'rgba(255,255,255,0.15)' : 'rgba(68,119,148,0.2)',
                color: tab === key ? '#fff' : '#5a8fa8',
                minWidth: 15, textAlign: 'center',
              }}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* New project button */}
        <button onClick={() => setCreatingProject(true)}
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', border: 'none', borderRadius: 9, background: 'linear-gradient(135deg, #2D5B75, #123249)', color: '#e8f4ff', fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 12px rgba(18,50,73,0.6), inset 0 1px 0 rgba(255,255,255,0.1)', transition: 'all 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #447794, #2D5B75)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #2D5B75, #123249)'; }}
        >
          <PlusOutlined style={{ fontSize: 11 }} /> Dự án mới
        </button>
      </div>

      {/* Create project form */}
      {creatingProject && (
        <div style={{ background: 'rgba(18,50,73,0.8)', backdropFilter: 'blur(14px)', border: '1px solid rgba(68,119,148,0.4)', borderRadius: 14, padding: '18px 20px', marginBottom: 20, maxWidth: 480 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#e8f4ff', marginBottom: 14 }}>Tạo dự án mới</div>
          <input
            autoFocus
            placeholder="Tên dự án..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreateProject()}
            style={{ width: '100%', background: 'rgba(6,18,34,0.6)', border: '1px solid rgba(68,119,148,0.4)', borderRadius: 8, padding: '8px 12px', color: '#e8f4ff', fontSize: 13, outline: 'none', marginBottom: 10, boxSizing: 'border-box' }}
          />
          <input
            placeholder="Mô tả (tuỳ chọn)..."
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            style={{ width: '100%', background: 'rgba(6,18,34,0.6)', border: '1px solid rgba(68,119,148,0.4)', borderRadius: 8, padding: '8px 12px', color: '#e8f4ff', fontSize: 13, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }}
          />
          {/* Color picker */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {PROJECT_COLORS.map(c => (
              <button key={c} onClick={() => setNewColor(c)}
                style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: newColor === c ? `2px solid #fff` : '2px solid transparent', cursor: 'pointer', padding: 0 }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleCreateProject}
              style={{ padding: '6px 16px', border: 'none', borderRadius: 7, background: '#2D5B75', color: '#e8f4ff', fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(45,91,117,0.4)' }}>
              Tạo
            </button>
            <button onClick={() => { setCreatingProject(false); setNewName(''); setNewDesc(''); }}
              style={{ padding: '6px 14px', border: '1px solid rgba(68,119,148,0.3)', borderRadius: 7, background: 'transparent', color: '#7aadca', fontSize: 12, cursor: 'pointer' }}>
              Huỷ
            </button>
          </div>
        </div>
      )}

      {/* Project grid */}
      {loading ? (
        <div style={{ color: '#4a4a65', fontSize: 13, textAlign: 'center', paddingTop: 60 }}>Đang tải...</div>
      ) : (
        <>
          {tab === 'active' && (
            activeProjects.length === 0
              ? <EmptyState icon={<FolderOpenOutlined />} text="Chưa có dự án nào. Tạo dự án đầu tiên!" />
              : <ProjectGrid projects={activeProjects} tasksByProject={tasksByProject} onOpen={openProject} onComplete={handleComplete} onReopen={handleReopen} onDelete={handleDelete} onRename={handleRename} />
          )}
          {tab === 'completed' && (
            completedProjects.length === 0
              ? <EmptyState icon={<CheckCircleOutlined />} text="Chưa có dự án hoàn thành nào." />
              : <ProjectGrid projects={completedProjects} tasksByProject={tasksByProject} onOpen={openProject} onComplete={handleComplete} onReopen={handleReopen} onDelete={handleDelete} onRename={handleRename} />
          )}
        </>
      )}

      {/* Floating Change Background Button */}
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
  );
};

/* ── helpers ── */

const ProjectGrid: React.FC<{
  projects: Project[];
  tasksByProject: Record<string, Task[]>;
  onOpen: (p: Project) => void;
  onComplete: (p: Project) => void;
  onReopen: (p: Project) => void;
  onDelete: (p: Project) => void;
  onRename: (p: Project, name: string) => void;
}> = ({ projects, tasksByProject, onOpen, onComplete, onReopen, onDelete, onRename }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
    {projects.map(p => {
      const tasks = tasksByProject[p._id] ?? [];
      return (
        <ProjectCard
          key={p._id}
          project={p}
          taskStats={{ total: tasks.length, done: tasks.filter(t => t.status === 'DONE').length }}
          onClick={() => onOpen(p)}
          onComplete={() => onComplete(p)}
          onReopen={() => onReopen(p)}
          onDelete={() => onDelete(p)}
          onRename={(name) => onRename(p, name)}
        />
      );
    })}
  </div>
);

const EmptyState: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div className="flex w-full h-[60vh] items-center justify-center">
    <div 
      className="flex flex-col h-64 w-full max-w-md items-center justify-center rounded-2xl backdrop-blur-md"
      style={{ color: '#7aadca', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }}
    >
      <div style={{ fontSize: 48, marginBottom: 16, filter: 'drop-shadow(0 4px 12px rgba(122, 173, 202, 0.4))' }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: 0.3 }}>{text}</div>
    </div>
  </div>
);

export default ProjectsPage;
