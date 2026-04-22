import React, { useState } from 'react';
import { toast } from 'sonner';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(form.username, form.password);
      navigate('/');
    } catch {
      toast.error('Sai tài khoản hoặc mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    width: '100%', padding: '10px 14px', borderRadius: 9, fontSize: 13,
    background: 'rgba(6,18,34,0.6)', border: '1px solid rgba(68,119,148,0.35)',
    color: '#e8f4ff', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #061222 0%, #123249 50%, #061222 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(68,119,148,0.18) 0%, transparent 70%)', top: -150, right: -150, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(18,50,73,0.3) 0%, transparent 70%)', bottom: -100, left: -100, pointerEvents: 'none' }} />

      <div style={{
        width: 360, padding: '36px 32px 28px',
        background: 'rgba(18,50,73,0.55)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(68,119,148,0.3)',
        borderRadius: 20, boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
        position: 'relative', zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: '0 auto 12px',
            background: 'linear-gradient(135deg, #2D5B75, #447794)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 800, color: '#fff',
            boxShadow: '0 8px 24px rgba(45,91,117,0.5)',
          }}>U</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#e8f4ff', letterSpacing: '-0.03em' }}>U-Hub</div>
          <div style={{ fontSize: 12, color: '#7aadca', marginTop: 4 }}>Quản lý đào tạo thông minh</div>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input style={inp} type="text" placeholder="Tên đăng nhập" autoComplete="username" value={form.username} onChange={set('username')} required
            onFocus={e => e.target.style.borderColor = '#447794'}
            onBlur={e => e.target.style.borderColor = 'rgba(68,119,148,0.35)'}
          />
          <input style={inp} type="password" placeholder="Mật khẩu" autoComplete="new-password" value={form.password} onChange={set('password')} required
            onFocus={e => e.target.style.borderColor = '#447794'}
            onBlur={e => e.target.style.borderColor = 'rgba(68,119,148,0.35)'}
          />
          <button type="submit" disabled={loading} style={{
            marginTop: 4, padding: '11px 0', border: 'none', borderRadius: 9, fontSize: 14,
            fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? 'rgba(45,91,117,0.5)' : 'linear-gradient(135deg, #2D5B75, #447794)',
            color: '#e8f4ff', transition: 'all 0.2s',
            boxShadow: loading ? 'none' : '0 4px 16px rgba(45,91,117,0.5)',
          }}>
            {loading ? '...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
