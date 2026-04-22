import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  FlagOutlined, CalendarOutlined, MoreOutlined, DeleteOutlined,
  CheckCircleOutlined, ClockCircleOutlined, MinusCircleOutlined,
  CheckOutlined, CloseOutlined, PlusOutlined, EnterOutlined,
} from '@ant-design/icons';
import type { Task, TaskStatus, TaskPriority, Subtask } from '../types';
import { taskAPI } from '../services/api';
import DatePickerMenu from './DatePickerMenu';

/* ─── constants ─────────────────────────────────────────────────────────── */

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string; icon: React.ReactNode }[] = [
  { value: 'TO_DO',       label: 'Phải làm',       color: '#94a3b8', icon: <MinusCircleOutlined /> },
  { value: 'IN_PROGRESS', label: 'Đang tiến hành', color: '#818cf8', icon: <ClockCircleOutlined /> },
  { value: 'DONE',        label: 'Hoàn thành',     color: '#34d399', icon: <CheckCircleOutlined /> },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'URGENT', label: 'Khẩn cấp', color: '#ef4444' },
  { value: 'HIGH',   label: 'Cao',      color: '#f97316' },
  { value: 'MEDIUM', label: 'Trung bình', color: '#f59e0b' },
  { value: 'LOW',    label: 'Thấp',     color: '#64748b' },
];

/* ─── helpers ────────────────────────────────────────────────────────────── */

function today() { const d = new Date(); d.setHours(0,0,0,0); return d; }
function isSame(a: Date, b: Date) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}
function fmtDate(d: Date) {
  return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
}

/* ─── Dropdown portal ────────────────────────────────────────────────────── */

interface DropdownProps {
  anchor: HTMLElement | null;
  onClose: () => void;
  children: React.ReactNode;
  minWidth?: number;
}
const Dropdown: React.FC<DropdownProps> = ({ anchor, onClose, children, minWidth = 180 }) => {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const left = Math.min(r.left + window.scrollX, window.innerWidth - minWidth - 8);
    setPos({ top: r.bottom + window.scrollY + 4, left });
  }, [anchor, minWidth]);

  return ReactDOM.createPortal(
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9990 }} onClick={onClose} />
      <div style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 9991, minWidth }}>
        {children}
      </div>
    </>,
    document.body
  );
};

const dropdownStyle: React.CSSProperties = {
  background: '#1a1a2e', border: '1px solid #2a2a45',
  borderRadius: 10, padding: '4px 0',
  boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
};

/* ─── Subtask section ────────────────────────────────────────────────────── */

interface SubtaskSectionProps {
  taskId: string;
  subtasks: Subtask[];
  onSubtasksChange: (subtasks: Subtask[]) => void;
}

const SubtaskSection: React.FC<SubtaskSectionProps> = ({ taskId, subtasks, onSubtasksChange }) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [showPriDrop, setShowPriDrop] = useState(false);
  const [showDateDrop, setShowDateDrop] = useState(false);
  const priRef = useRef<HTMLButtonElement>(null);
  const dateRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (showForm) setTimeout(() => inputRef.current?.focus(), 50); }, [showForm]);

  const reset = () => { setTitle(''); setPriority('MEDIUM'); setStartDate(undefined); setDueDate(undefined); setShowForm(false); };

  const handleSave = async () => {
    if (!title.trim()) return;
    try {
      const res = await taskAPI.addSubtask(taskId, {
        title: title.trim(), priority,
        startDate: startDate ? startDate.toISOString() : null,
        dueDate: dueDate ? dueDate.toISOString() : null,
      });
      onSubtasksChange([...subtasks, res.data]);
      reset();
    } catch { /* silent */ }
  };

  const handleToggleDone = async (sub: Subtask) => {
    const newStatus: TaskStatus = sub.status === 'DONE' ? 'TO_DO' : 'DONE';
    try {
      await taskAPI.updateSubtask(taskId, sub._id, { status: newStatus });
      onSubtasksChange(subtasks.map(s => s._id === sub._id ? { ...s, status: newStatus } : s));
    } catch { /* silent */ }
  };

  const handleDelete = async (subId: string) => {
    try {
      await taskAPI.deleteSubtask(taskId, subId);
      onSubtasksChange(subtasks.filter(s => s._id !== subId));
    } catch { /* silent */ }
  };

  const priColor = PRIORITY_OPTIONS.find(p => p.value === priority)?.color ?? '#64748b';

  return (
    <div style={{ borderTop: '1px solid #1a1a2e', padding: '8px 10px 8px 13px' }}
      onClick={e => e.stopPropagation()}>

      {/* Existing subtasks */}
      {subtasks.map(sub => {
        const done = sub.status === 'DONE';
        const subPri = PRIORITY_OPTIONS.find(p => p.value === sub.priority);
        const subStart = sub.startDate ? new Date(sub.startDate) : undefined;
        const subDue = sub.dueDate ? new Date(sub.dueDate) : undefined;
        return (
          <div key={sub._id}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0', borderRadius: 6 }}
            className="group/sub"
          >
            {/* done toggle */}
            <button onClick={() => handleToggleDone(sub)}
              style={{ ...fieldBtn, padding: '0 2px', color: done ? '#34d399' : '#3a3a58', fontSize: 12, flexShrink: 0 }}>
              {done ? <CheckCircleOutlined /> : <MinusCircleOutlined />}
            </button>
            <span style={{ flex: 1, fontSize: 12, color: done ? '#4a4a65' : '#c8d0e0', textDecoration: done ? 'line-through' : 'none' }}>
              {sub.title}
            </span>
            {subPri && (
              <span style={{ fontSize: 10, color: subPri.color, opacity: 0.8 }}>
                <FlagOutlined />
              </span>
            )}
            {(subDue || subStart) && (
              <span style={{ fontSize: 10, color: '#6a6a8a' }}>
                {subStart && subDue ? `${fmtDate(subStart)} - ${fmtDate(subDue)}` : subStart ? `Từ ${fmtDate(subStart)}` : subDue ? `Đến ${fmtDate(subDue)}` : ''}
              </span>
            )}
            <button onClick={() => handleDelete(sub._id)}
              style={{ ...fieldBtn, padding: '0 2px', color: '#f87171', fontSize: 11, opacity: 0, transition: 'opacity 0.15s' }}
              className="group-hover/sub:opacity-100">
              <CloseOutlined />
            </button>
          </div>
        );
      })}

      {/* Add form */}
      {showForm ? (
        <div style={{
          marginTop: 6, borderRadius: 8, border: '1px solid #34d39955',
          background: '#0e0e1c', padding: '10px 12px',
          boxShadow: '0 0 0 2px rgba(52,211,153,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <input
              ref={inputRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') reset(); }}
              placeholder="Tên subtask..."
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: '#dde3f0', fontSize: 13, fontWeight: 500,
              }}
            />
            <button onClick={handleSave}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 6, border: 'none',
                background: '#1a3a2e', color: '#34d399', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>
              Lưu <EnterOutlined style={{ fontSize: 10 }} />
            </button>
          </div>

          {/* Field row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Priority picker */}
            <button ref={priRef} onClick={() => setShowPriDrop(v => !v)}
              style={{ ...fieldBtn, gap: 4, color: priColor, fontSize: 11 }}>
              <FlagOutlined style={{ fontSize: 11 }} />
              <span>{PRIORITY_OPTIONS.find(p => p.value === priority)?.label}</span>
            </button>

            <div style={{ width: 1, height: 10, background: '#1e1e35' }} />

            {/* Date picker */}
            <button ref={dateRef} onClick={() => setShowDateDrop(v => !v)}
              style={{ ...fieldBtn, gap: 4, color: dueDate || startDate ? '#a78bfa' : '#3a3a58', fontSize: 11 }}>
              <CalendarOutlined style={{ fontSize: 11 }} />
              <span>{startDate && dueDate ? `${fmtDate(startDate)} - ${fmtDate(dueDate)}` : startDate ? `Từ ${fmtDate(startDate)}` : dueDate ? `Đến ${fmtDate(dueDate)}` : 'Ngày'}</span>
            </button>

            <div style={{ flex: 1 }} />
            <button onClick={reset} style={{ ...fieldBtn, color: '#4a4a65', fontSize: 11 }}>
              <CloseOutlined />
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)}
          style={{ ...fieldBtn, gap: 5, color: '#3a3a58', fontSize: 11, marginTop: subtasks.length ? 4 : 0, width: '100%' }}>
          <PlusOutlined style={{ fontSize: 10 }} />
          <span>Thêm subtask</span>
        </button>
      )}

      {/* Priority dropdown */}
      {showPriDrop && (
        <Dropdown anchor={priRef.current} onClose={() => setShowPriDrop(false)}>
          <div style={dropdownStyle}>
            {PRIORITY_OPTIONS.map(p => (
              <button key={p.value} onClick={() => { setPriority(p.value); setShowPriDrop(false); }}
                style={{ ...menuItem, color: p.color }}>
                <FlagOutlined style={{ fontSize: 12 }} />
                <span style={{ flex: 1 }}>{p.label}</span>
                {priority === p.value && <CheckOutlined style={{ fontSize: 10, color: '#34d399' }} />}
              </button>
            ))}
          </div>
        </Dropdown>
      )}

      {/* Date dropdown */}
      {showDateDrop && (
        <Dropdown anchor={dateRef.current} onClose={() => setShowDateDrop(false)} minWidth={520}>
          <div style={dropdownStyle}>
            <DatePickerMenu
              startDate={startDate}
              dueDate={dueDate}
              defaultTab="start"
              onChangeStart={(d) => setStartDate(d)}
              onChangeDue={(d) => setDueDate(d)}
            />
          </div>
        </Dropdown>
      )}
    </div>
  );
};

/* ─── TaskCard ───────────────────────────────────────────────────────────── */

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onChangeStatus?: (taskId: string, status: TaskStatus) => void;
  onChangePriority?: (taskId: string, priority: TaskPriority) => void;
  onChangeDates?: (taskId: string, start: Date | undefined, due: Date | undefined) => void;
  onSubtasksChange?: (taskId: string, subtasks: Subtask[]) => void;
}

type OpenMenu = 'status' | 'priority' | 'date' | 'more' | null;

const TaskCard: React.FC<TaskCardProps> = ({
  task, onClick, onDelete, onChangeStatus, onChangePriority, onChangeDates, onSubtasksChange,
}) => {
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState<OpenMenu>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks ?? []);

  const statusRef  = useRef<HTMLButtonElement>(null);
  const priorityRef = useRef<HTMLButtonElement>(null);
  const dateRef    = useRef<HTMLButtonElement>(null);
  const moreRef    = useRef<HTMLButtonElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id || task.id!,
    data: { type: 'task', task },
  });

  const dndStyle = { transform: CSS.Transform.toString(transform), transition };

  const currentStatus   = STATUS_OPTIONS.find(s => s.value === task.status) || {
    value: task.status, label: task.status, color: '#a78bfa', icon: <CheckCircleOutlined />
  };
  const currentPriority = PRIORITY_OPTIONS.find(p => p.value === task.priority);
  const startDate = task.startDate ? new Date(task.startDate) : undefined;
  const dueDate = task.dueDate ? new Date(task.dueDate) : undefined;

  const toggle = useCallback((menu: OpenMenu) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(prev => prev === menu ? null : menu);
  }, []);

  const close = useCallback(() => setOpen(null), []);

  const taskId = task._id || task.id!;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick?.(task)}
      style={{
        ...dndStyle,
        position: 'relative',
        background: '#13131f',
        borderRadius: 10,
        border: `1px solid ${isDragging ? '#7c3aed' : hovered ? '#2a2a45' : '#1c1c30'}`,
        cursor: 'grab',
        transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
        boxShadow: isDragging
          ? '0 8px 24px rgba(124,58,237,0.35)'
          : hovered ? '0 4px 16px rgba(0,0,0,0.35)' : '0 1px 4px rgba(0,0,0,0.2)',
        opacity: isDragging ? 0.5 : 1,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Priority accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: currentPriority?.color ?? '#64748b',
        opacity: 0.8,
      }} />

      <div style={{ padding: '10px 10px 10px 13px' }}>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 10 }}>
          {/* Status dot button */}
          <button ref={statusRef} onClick={toggle('status')}
            style={{ ...fieldBtn, marginTop: 2, color: currentStatus.color, fontSize: 13, padding: '0 2px' }}
            title="Đổi trạng thái"
          >
            {currentStatus.icon}
          </button>
          <p style={{ flex: 1, margin: 0, fontSize: 13, fontWeight: 500, color: '#dde3f0', lineHeight: 1.45 }}>
            {task.title}
          </p>
          {/* More button */}
          <button ref={moreRef} onClick={toggle('more')}
            style={{ ...fieldBtn, opacity: hovered || open === 'more' ? 1 : 0, color: '#64748b', fontSize: 14 }}
          >
            <MoreOutlined />
          </button>
        </div>

        {/* Fields row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' as const }}>

          {/* Priority */}
          <button ref={priorityRef} onClick={toggle('priority')}
            style={{ ...fieldBtn, gap: 4, color: currentPriority?.color ?? '#64748b' }}
            title="Đổi ưu tiên"
          >
            <FlagOutlined style={{ fontSize: 11 }} />
            <span style={{ fontSize: 11 }}>{currentPriority?.label ?? '—'}</span>
          </button>

          <div style={{ width: 1, height: 12, background: '#1e1e35' }} />

          {/* Dates */}
          <button ref={dateRef} onClick={toggle('date')}
            style={{ ...fieldBtn, gap: 4, color: dueDate || startDate ? '#a78bfa' : '#3a3a58' }}
            title="Đặt ngày bắt đầu/kết thúc"
          >
            <CalendarOutlined style={{ fontSize: 11 }} />
            <span style={{ fontSize: 11 }}>
              {startDate && dueDate ? `${fmtDate(startDate)} - ${fmtDate(dueDate)}` : startDate ? `Từ ${fmtDate(startDate)}` : dueDate ? `Đến ${fmtDate(dueDate)}` : 'Ngày'}
            </span>
            {(dueDate || startDate) && (
              <span onClick={(e) => { e.stopPropagation(); onChangeDates?.(taskId, undefined, undefined); }}
                style={{ marginLeft: 2, opacity: 0.6, fontSize: 9, lineHeight: 1 }}>
                <CloseOutlined />
              </span>
            )}
          </button>

          {/* Subtask count */}
          {subtasks.length > 0 && (
            <>
              <div style={{ width: 1, height: 12, background: '#1e1e35' }} />
              <span style={{ fontSize: 11, color: '#4a4a65', display: 'flex', alignItems: 'center', gap: 3 }}>
                <CheckCircleOutlined style={{ fontSize: 10 }} />
                {subtasks.filter(s => s.status === 'DONE').length}/{subtasks.length}
              </span>
            </>
          )}

        </div>
      </div>

      {/* Subtask section */}
      <SubtaskSection
        taskId={taskId}
        subtasks={subtasks}
        onSubtasksChange={(updated) => { setSubtasks(updated); onSubtasksChange?.(taskId, updated); }}
      />

      {/* ── Status dropdown ── */}
      {open === 'status' && (
        <Dropdown anchor={statusRef.current} onClose={close}>
          <div style={dropdownStyle}>
            {STATUS_OPTIONS.map(s => (
              <button key={s.value} onClick={(e) => { e.stopPropagation(); onChangeStatus?.(taskId, s.value); close(); }}
                style={{ ...menuItem, color: s.color }}>
                <span style={{ fontSize: 13 }}>{s.icon}</span>
                <span style={{ flex: 1 }}>{s.label}</span>
                {task.status === s.value && <CheckOutlined style={{ fontSize: 10, color: '#34d399' }} />}
              </button>
            ))}
          </div>
        </Dropdown>
      )}

      {/* ── Priority dropdown ── */}
      {open === 'priority' && (
        <Dropdown anchor={priorityRef.current} onClose={close}>
          <div style={dropdownStyle}>
            {PRIORITY_OPTIONS.map(p => (
              <button key={p.value} onClick={(e) => { e.stopPropagation(); onChangePriority?.(taskId, p.value); close(); }}
                style={{ ...menuItem, color: p.color }}>
                <FlagOutlined style={{ fontSize: 12 }} />
                <span style={{ flex: 1 }}>{p.label}</span>
                {task.priority === p.value && <CheckOutlined style={{ fontSize: 10, color: '#34d399' }} />}
              </button>
            ))}
          </div>
        </Dropdown>
      )}

      {/* ── Date picker dropdown ── */}
      {open === 'date' && (
        <Dropdown anchor={dateRef.current} onClose={close} minWidth={520}>
          <div style={dropdownStyle}>
            <DatePickerMenu
              startDate={startDate}
              dueDate={dueDate}
              defaultTab="start"
              onChangeStart={(d) => { onChangeDates?.(taskId, d, dueDate); }}
              onChangeDue={(d) => { onChangeDates?.(taskId, startDate, d); }}
            />
          </div>
        </Dropdown>
      )}

      {/* ── More dropdown ── */}
      {open === 'more' && (
        <Dropdown anchor={moreRef.current} onClose={close}>
          <div style={dropdownStyle}>
            <button onClick={(e) => { e.stopPropagation(); onDelete?.(taskId); close(); }}
              style={{ ...menuItem, color: '#f87171' }}>
              <DeleteOutlined style={{ fontSize: 13 }} /><span>Xoá nhiệm vụ</span>
            </button>
          </div>
        </Dropdown>
      )}
    </div>
  );
};

/* ─── shared micro-styles ────────────────────────────────────────────────── */

const fieldBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center',
  padding: '3px 6px', border: 'none', borderRadius: 6,
  background: 'transparent', cursor: 'pointer',
  transition: 'background 0.12s',
  whiteSpace: 'nowrap',
};

const menuItem: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 9,
  width: '100%', padding: '7px 14px',
  border: 'none', background: 'transparent',
  color: '#c8d0e0', fontSize: 13, cursor: 'pointer',
  textAlign: 'left',
};

export default TaskCard;
