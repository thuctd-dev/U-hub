import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { CloseOutlined, ThunderboltOutlined, LoadingOutlined } from '@ant-design/icons';
import { aiAPI, taskAPI } from '../services/api';

interface GeneratedTask {
  title: string;
  priority: string;
}

interface AIGenerateModalProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
  onTasksCreated: () => void;
}

const PRIORITY_COLOR: Record<string, string> = {
  URGENT: '#ef4444', HIGH: '#f97316', MEDIUM: '#f59e0b', LOW: '#64748b',
};

const PRIORITY_LABEL: Record<string, string> = {
  URGENT: 'Khẩn cấp', HIGH: 'Cao', MEDIUM: 'Trung bình', LOW: 'Thấp',
};

const AIGenerateModal: React.FC<AIGenerateModalProps> = ({
  projectId, projectName, onClose, onTasksCreated,
}) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<GeneratedTask[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError('');
    setTasks([]);
    try {
      const res = await aiAPI.generateTasks({ description, projectName });
      const generated: GeneratedTask[] = res.data.tasks;
      setTasks(generated);
      setSelected(new Set(generated.map((_: GeneratedTask, i: number) => i)));
    } catch (e: any) {
      setError(e.response?.data?.message || 'Lỗi khi gọi Gemini');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const toCreate = tasks.filter((_: GeneratedTask, i: number) => selected.has(i));
    if (!toCreate.length) return;
    setSaving(true);
    try {
      await Promise.all(
        toCreate.map((t: GeneratedTask, i: number) =>
          taskAPI.create({ title: t.title, priority: t.priority, status: 'TO_DO', projectId, order: i })
        )
      );
      onTasksCreated();
      onClose();
    } catch {
      setError('Lỗi khi tạo tasks');
      setSaving(false);
    }
  };

  const toggleSelect = (i: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const isGenerateDisabled = loading || !description.trim();
  const isSaveDisabled = saving || selected.size === 0;

  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Modal box */}
      <div style={{
        position: 'relative', zIndex: 1, width: 520, maxHeight: '82vh',
        background: '#13132a', border: '1px solid #2a2a45', borderRadius: 16,
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.7)', overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e1e35', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'rgba(124,58,237,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#a78bfa', fontSize: 15,
          }}>
            <ThunderboltOutlined />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#dde3f0' }}>AI Generate Tasks</div>
            <div style={{ fontSize: 11, color: '#4a4a65' }}>Powered by Gemini · {projectName}</div>
          </div>
          <button
            onClick={onClose}
            style={{ marginLeft: 'auto', border: 'none', background: 'transparent', color: '#4a4a65', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center' }}
          >
            <CloseOutlined />
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>

          {/* Description input */}
          <div>
            <div style={{ fontSize: 12, color: '#7c7ca0', marginBottom: 6 }}>Mô tả dự án / tính năng cần làm</div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="VD: Xây dựng trang web bán hàng với giỏ hàng, thanh toán, quản lý sản phẩm..."
              rows={4}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#0e0e1c', border: '1px solid #2a2a45',
                borderRadius: 10, padding: '10px 12px',
                color: '#dde3f0', fontSize: 13, resize: 'vertical',
                outline: 'none', fontFamily: 'inherit', lineHeight: 1.6,
              }}
              onFocus={e => (e.target.style.borderColor = '#7c3aed')}
              onBlur={e => (e.target.style.borderColor = '#2a2a45')}
            />
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '9px 0', borderRadius: 9, border: 'none',
              background: isGenerateDisabled ? '#1e1e35' : 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              color: isGenerateDisabled ? '#3a3a58' : '#fff',
              fontSize: 13, fontWeight: 600,
              cursor: isGenerateDisabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loading ? <LoadingOutlined /> : <ThunderboltOutlined />}
            {loading ? 'Đang tạo...' : 'Tạo tasks với Gemini'}
          </button>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#f87171',
            }}>
              {error}
            </div>
          )}

          {/* Task list */}
          {tasks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexShrink: 0 }}>
                <div style={{ fontSize: 12, color: '#7c7ca0' }}>
                  {tasks.length} tasks · đã chọn {selected.size}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setSelected(new Set(tasks.map((_: GeneratedTask, i: number) => i)))}
                    style={{ border: 'none', background: 'transparent', color: '#a78bfa', fontSize: 11, cursor: 'pointer' }}
                  >
                    Chọn tất cả
                  </button>
                  <button
                    onClick={() => setSelected(new Set())}
                    style={{ border: 'none', background: 'transparent', color: '#4a4a65', fontSize: 11, cursor: 'pointer' }}
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>

              {/* Scrollable task list */}
              <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 6,
                paddingRight: 4,
                minHeight: 0,
              }}
              className="scrollbar-thin">
                {tasks.map((task: GeneratedTask, i: number) => (
                  <div
                    key={i}
                    onClick={() => toggleSelect(i)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 9, cursor: 'pointer',
                      border: `1px solid ${selected.has(i) ? '#7c3aed44' : '#1e1e35'}`,
                      background: selected.has(i) ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.02)',
                      transition: 'all 0.12s',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                      border: `1.5px solid ${selected.has(i) ? '#7c3aed' : '#2a2a45'}`,
                      background: selected.has(i) ? '#7c3aed' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {selected.has(i) && <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>✓</span>}
                    </div>
                    <span style={{ flex: 1, fontSize: 13, color: '#c8d0e0' }}>{task.title}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99,
                      background: (PRIORITY_COLOR[task.priority] || '#64748b') + '22',
                      color: PRIORITY_COLOR[task.priority] || '#64748b',
                      flexShrink: 0,
                    }}>
                      {PRIORITY_LABEL[task.priority] || task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {tasks.length > 0 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #1e1e35', display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={handleSave}
              disabled={isSaveDisabled}
              style={{
                flex: 1, padding: '9px 0', border: 'none', borderRadius: 9,
                background: isSaveDisabled ? '#1e1e35' : '#7c3aed',
                color: isSaveDisabled ? '#3a3a58' : '#fff',
                fontSize: 13, fontWeight: 600,
                cursor: isSaveDisabled ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Đang lưu...' : `Thêm ${selected.size} tasks vào dự án`}
            </button>
            <button
              onClick={onClose}
              style={{ padding: '9px 16px', border: '1px solid #2a2a45', borderRadius: 9, background: 'transparent', color: '#64748b', fontSize: 13, cursor: 'pointer' }}
            >
              Huỷ
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default AIGenerateModal;
