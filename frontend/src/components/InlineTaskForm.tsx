import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import ReactDOM from 'react-dom';
import { Input } from 'antd';
import { UserOutlined, CalendarOutlined, FlagOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import DatePickerMenu from './DatePickerMenu';
import type { TaskStatus, User } from '../types';

interface InlineTaskFormProps {
  status: TaskStatus;
  users: User[];
  onSave: (data: { title: string; status: TaskStatus; priority: string; assignee?: string; dueDate?: string }) => Promise<void>;
  onCancel: () => void;
}

const PRIORITIES = [
  { value: 'URGENT', label: 'Cấp bách',   color: '#ef4444', flagColor: '#ef4444' },
  { value: 'HIGH',   label: 'Cao',         color: '#f59e0b', flagColor: '#f59e0b' },
  { value: 'MEDIUM', label: 'Bình thường', color: '#818cf8', flagColor: '#818cf8' },
  { value: 'LOW',    label: 'Thấp',        color: '#94a3b8', flagColor: '#94a3b8' },
];

const FlagIcon = ({ color }: { color: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 3l16 6-16 6V3z" fill={color} opacity="0.9"/>
    <line x1="4" y1="3" x2="4" y2="21" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ClearIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="9"/>
    <line x1="8" y1="8" x2="16" y2="16"/>
    <line x1="16" y1="8" x2="8" y2="16"/>
  </svg>
);

function formatDate(d: Date) {
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

// Portal dropdown — renders at document.body level
interface PortalDropdownProps {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  children: React.ReactNode;
}

const PortalDropdown: React.FC<PortalDropdownProps> = ({ anchorRef, onClose, children }) => {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    }
  }, [anchorRef]);

  return ReactDOM.createPortal(
    <>
      {/* backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
        onClick={onClose}
      />
      {/* dropdown */}
      <div
        style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 9999 }}
      >
        {children}
      </div>
    </>,
    document.body
  );
};

const InlineTaskForm: React.FC<InlineTaskFormProps> = ({ status, users, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<string | undefined>(undefined);
  const [assignee, setAssignee] = useState<string | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const priorityBtnRef = useRef<HTMLButtonElement>(null);
  const dateBtnRef = useRef<HTMLButtonElement>(null);

  const selectedPriority = PRIORITIES.find((p) => p.value === priority);

  const handleSave = async () => {
    if (!title.trim()) { toast.warning('Vui lòng nhập tên nhiệm vụ'); return; }
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        status,
        priority: priority || 'MEDIUM',
        assignee,
        dueDate: dueDate?.toISOString(),
      });
      setTitle(''); setPriority(undefined); setAssignee(undefined); setDueDate(undefined); setStartDate(undefined);
    } catch {
      toast.error('Không thể tạo nhiệm vụ');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); }
    else if (e.key === 'Escape') onCancel();
  };

  return (
    <div className="inline-task-form">
      <div className="inline-task-form-main">
        <Input
          autoFocus
          placeholder="Tên nhiệm vụ..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="inline-task-input"
          variant="borderless"
        />
        <div className="inline-task-project">Dự án 1</div>

        <div className="inline-task-actions">
          <button
            ref={dateBtnRef}
            className={`inline-task-action-btn ${(dueDate || startDate) ? 'has-value' : ''}`}
            onClick={() => { setShowDatePicker(!showDatePicker); setShowPriorityMenu(false); }}
          >
            <CalendarOutlined />
            <span>
              {startDate && dueDate
                ? `${formatDate(startDate)} → ${formatDate(dueDate)}`
                : dueDate ? formatDate(dueDate)
                : startDate ? formatDate(startDate)
                : 'Thêm ngày'}
            </span>
          </button>

          <button
            ref={priorityBtnRef}
            className={`inline-task-action-btn ${priority ? 'has-value' : ''}`}
            onClick={() => { setShowPriorityMenu(!showPriorityMenu); setShowDatePicker(false); }}
          >
            {selectedPriority ? <FlagIcon color={selectedPriority.flagColor} /> : <FlagOutlined />}
            <span style={{ color: selectedPriority?.color }}>
              {selectedPriority ? selectedPriority.label : 'Thêm ưu tiên'}
            </span>
          </button>
        </div>

        <div className="inline-task-footer">
          <button className="inline-task-save-btn" onClick={handleSave} disabled={saving}>
            <SaveOutlined /> Thêm
          </button>
          <button className="inline-task-cancel-btn" onClick={onCancel}>
            <CloseOutlined />
          </button>
        </div>
      </div>

      {/* Priority dropdown — portal */}
      {showPriorityMenu && (
        <PortalDropdown anchorRef={priorityBtnRef} onClose={() => setShowPriorityMenu(false)}>
          <div className="inline-priority-menu backdrop-blur-lg" style={{ position: 'relative' }}>
            <div className="inline-priority-title">Sự ưu tiên</div>
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                className={`inline-priority-item ${priority === p.value ? 'active' : ''}`}
                onClick={() => { setPriority(p.value); setShowPriorityMenu(false); }}
              >
                <span className="inline-priority-icon"><FlagIcon color={p.flagColor} /></span>
                <span>{p.label}</span>
              </button>
            ))}
            <button
              className="inline-priority-item priority-clear"
              onClick={() => { setPriority(undefined); setShowPriorityMenu(false); }}
            >
              <span className="inline-priority-icon"><ClearIcon /></span>
              <span>Clear</span>
            </button>
          </div>
        </PortalDropdown>
      )}

      {/* Date picker — portal */}
      {showDatePicker && (
        <PortalDropdown anchorRef={dateBtnRef} onClose={() => setShowDatePicker(false)}>
          <div style={{ position: 'relative' }}>
            <DatePickerMenu
              startDate={startDate}
              dueDate={dueDate}
              onChangeStart={(d) => setStartDate(d)}
              onChangeDue={(d) => setDueDate(d)}
            />
          </div>
        </PortalDropdown>
      )}
    </div>
  );
};

export default InlineTaskForm;
