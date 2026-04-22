import React, { useState, useMemo } from 'react';
import { Modal, Input } from 'antd';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners,
  type DragStartEvent, type DragOverEvent, type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { PlusOutlined, SyncOutlined, CheckCircleOutlined, MinusCircleOutlined, TranslationOutlined } from '@ant-design/icons';
import TaskCard from './TaskCard';
import InlineTaskForm from './InlineTaskForm';
import type { Task, TaskStatus, User } from '../types';
import type { FilterState } from './SubHeader';

interface Column {
  id: TaskStatus;
  title: string;
  color: string;
  glow: string;
  badgeBg: string;
  icon: React.ReactNode;
}

const COLUMNS: Column[] = [
  {
    id: 'TO_DO',
    title: 'Phải làm',
    color: '#94a3b8',
    glow: 'rgba(148,163,184,0.15)',
    badgeBg: 'rgba(148,163,184,0.1)',
    icon: <MinusCircleOutlined />,
  },
  {
    id: 'IN_PROGRESS',
    title: 'Đang tiến hành',
    color: '#818cf8',
    glow: 'rgba(129,140,248,0.18)',
    badgeBg: 'rgba(129,140,248,0.12)',
    icon: <SyncOutlined spin />,
  },
  {
    id: 'DONE',
    title: 'Hoàn thành',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.15)',
    badgeBg: 'rgba(52,211,153,0.1)',
    icon: <CheckCircleOutlined />,
  },
];

interface DroppableColumnProps {
  column: Column;
  tasks: Task[];
  users: User[];
  activeFormStatus: TaskStatus | null;
  onShowForm: (status: TaskStatus) => void;
  onHideForm: () => void;
  onInlineSave: (data: { title: string; status: TaskStatus; priority: string; assignee?: string }) => Promise<void>;
  onTaskClick: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onChangeStatus: (taskId: string, status: TaskStatus) => void;
  onChangePriority: (taskId: string, priority: string) => void;
  onChangeDates: (taskId: string, start: Date | undefined, due: Date | undefined) => void;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({
  column, tasks, users, activeFormStatus, onShowForm, onHideForm, onInlineSave, onTaskClick, onDeleteTask, onChangeStatus, onChangePriority, onChangeDates,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: 'column', column } });
  const showForm = activeFormStatus === column.id;

  return (
    <div
      ref={setNodeRef} 
      className="backdrop-blur-lg"
      style={{
        width: 290, minWidth: 290, maxWidth: 290,
        maxHeight: '100%',
        display: 'flex', flexDirection: 'column',
        borderRadius: 14,
        border: `1px solid ${isOver ? column.color + '55' : '#c8d0e0'}`,
        background: 'transition',
        marginRight: 14,
        flexShrink: 0,
        transition: 'border-color 0.15s, background 0.15s',
        boxShadow: isOver ? `0 0 0 1px ${column.color}33, 0 8px 32px rgba(0,0,0,0.3)` : '0 2px 12px rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }}
    >
      {/* Top accent line */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${column.color}, ${column.color}44)`, borderRadius: '14px 14px 0 0', flexShrink: 0 }} />

      {/* Header */}
      <div style={{ padding: '12px 14px 10px', flexShrink: 0, borderBottom: '1px solid #c8d0e0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: column.glow,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: column.color, fontSize: 13,
            }}>
              {column.icon}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#c8d0e0', letterSpacing: 0.2 }}>
              {column.title}
            </span>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700,
            background: column.badgeBg, color: column.color,
            padding: '2px 8px', borderRadius: 20,
            minWidth: 22, textAlign: 'center',
          }}>
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Task list */}
      <div style={{ flex: 1, padding: '10px 10px 6px', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', minHeight: 0 }}
        className="scrollbar-thin ">
        <SortableContext 
        items={tasks.map(t => t._id || t.id!)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task._id || task.id} task={task}
              onClick={onTaskClick} onDelete={onDeleteTask}
              onChangeStatus={onChangeStatus}
              onChangePriority={onChangePriority}
              onChangeDates={onChangeDates}
            />
          ))}
        </SortableContext>

        {/* Drop indicator */}
        {isOver && (
          <div style={{ height: 3, borderRadius: 4, background: `linear-gradient(90deg, ${column.color}, transparent)`, margin: '2px 0' }} />
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '6px 10px 10px', flexShrink: 0 }}>
        {/* Inline form or add button */}
        {showForm ? (
          <InlineTaskForm status={column.id} users={users} onSave={onInlineSave} onCancel={onHideForm} />
        ) : (
          <button
            onClick={() => onShowForm(column.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 8px', border: 'none', borderRadius: 8,
              background: 'transparent', color: '#c8d0e0',
              fontSize: 12, cursor: 'pointer', width: '100%',
              transition: 'all 0.15s', marginTop: 2,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLButtonElement).style.color = '#7c7ca0'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#c8d0e0'; }}
          >
            <PlusOutlined style={{ fontSize: 11 }} />
            <span>Thêm tác vụ</span>
          </button>
        )}
      </div>
    </div>
  );
};

interface KanbanBoardProps {
  tasks: Task[];
  users: User[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onTaskClick: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onChangePriority: (taskId: string, priority: string) => void;
  onChangeDates: (taskId: string, start: Date | undefined, due: Date | undefined) => void;
  onInlineSave: (data: { title: string; status: TaskStatus; priority: string; assignee?: string }) => Promise<void>;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks, users, setTasks, onTaskClick, onDeleteTask, onChangeStatus, onUpdateTaskStatus, onChangePriority, onChangeDates, onInlineSave,
}) => {
  const [columns, setColumns] = useState<Column[]>(COLUMNS);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeFormStatus, setActiveFormStatus] = useState<TaskStatus | null>(null);
  const [groupPromptOpen, setGroupPromptOpen] = useState(false);
  const [groupPromptTitle, setGroupPromptTitle] = useState('');

  const submitAddGroup = () => {
    if (!groupPromptTitle.trim()) return;
    const newId = `GROUP_${Date.now()}`;
    setColumns(prev => [...prev, {
      id: newId,
      title: groupPromptTitle.trim(),
      color: '#a78bfa',
      glow: 'rgba(167,139,250,0.15)',
      badgeBg: 'rgba(167,139,250,0.1)',
      icon: <PlusOutlined />
    }]);
    setGroupPromptOpen(false);
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {};
    columns.forEach(c => grouped[c.id] = []);
    tasks.forEach(task => { 
      if (grouped[task.status]) grouped[task.status].push(task); 
      else grouped[task.status] = [task]; 
    });
    (Object.keys(grouped) as TaskStatus[]).forEach(key => grouped[key].sort((a, b) => (a.order || 0) - (b.order || 0)));
    return grouped;
  }, [tasks, columns]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTask(tasks.find(t => (t._id || t.id) === event.active.id) || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const draggedTask = tasks.find(t => (t._id || t.id) === activeId);
    if (!draggedTask) return;
    let targetStatus: TaskStatus | undefined;
    if (columns.some(c => c.id === overId)) targetStatus = overId as TaskStatus;
    else { const ot = tasks.find(t => (t._id || t.id) === overId); if (ot) targetStatus = ot.status; }
    if (targetStatus && draggedTask.status !== targetStatus)
      setTasks(prev => prev.map(t => (t._id || t.id) === activeId ? { ...t, status: targetStatus! } : t));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event;
    setActiveTask(null);
    const task = tasks.find(t => (t._id || t.id) === active.id);
    if (task) onUpdateTaskStatus(active.id as string, task.status);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners}
      onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', minHeight: 0 }}>

    
        {/* Dark overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, pointerEvents: 'none' }} />

        {/* Columns */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', padding: '20px 20px', flex: 1, overflowX: 'auto', overflowY: 'hidden', alignItems: 'flex-start', gap: 0 }}>
          {columns.map(column => (
            <DroppableColumn
              key={column.id}
              column={column}
              tasks={tasksByStatus[column.id] || []}
              users={users}
              activeFormStatus={activeFormStatus}
              onShowForm={setActiveFormStatus}
              onHideForm={() => setActiveFormStatus(null)}
              onInlineSave={onInlineSave}
              onTaskClick={onTaskClick}
              onDeleteTask={onDeleteTask}
              onChangeStatus={onChangeStatus}
              onChangePriority={onChangePriority}
              onChangeDates={onChangeDates}
            />
          ))}

          {/* Add group button */}
          <div style={{ flexShrink: 0, paddingTop: 3 }}>
            <button
              onClick={() => {
                setGroupPromptTitle('');
                setGroupPromptOpen(true);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 10,
                border: '1.5px dashed #1e1e35',
                background: 'transparent', color: '#3a3a58',
                fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.borderColor = '#7c3aed'; b.style.color = '#a78bfa';
                b.style.background = 'rgba(124,58,237,0.06)';
              }}
              onMouseLeave={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.borderColor = '#1e1e35'; b.style.color = '#3a3a58';
                b.style.background = 'transparent';
              }}
            >
              <PlusOutlined style={{ fontSize: 11 }} />
              Thêm nhóm
            </button>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeTask
          ? <div style={{ opacity: 0.9, transform: 'rotate(2deg) scale(1.03)', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.5))' }}>
              <TaskCard task={activeTask} />
            </div>
          : null}
      </DragOverlay>
      <Modal
        title="Thêm nhóm mới"
        open={groupPromptOpen}
        onOk={submitAddGroup}
        onCancel={() => setGroupPromptOpen(false)}
        okText="Thêm"
        cancelText="Huỷ"
      >
        <Input
          autoFocus
          placeholder="Nhập tên nhóm..."
          value={groupPromptTitle}
          onChange={e => setGroupPromptTitle(e.target.value)}
          onPressEnter={submitAddGroup}
        />
      </Modal>
    </DndContext>
  );
};

export default KanbanBoard;
