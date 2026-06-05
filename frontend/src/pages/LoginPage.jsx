import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'receptionist' });
  const { login, loginWithData } = useAuth();
  const navigate = useNavigate();

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const switchMode = (m) => {
    setMode(m);
    setForm({ name: '', email: '', password: '', role: 'receptionist' });
    setShowPass(false);
  };

  // ── LOGIN ──────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(form.email.trim(), form.password);
    setLoading(false);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Login failed');
    }
  };

  // ── REGISTER ───────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name.trim())        { toast.error('Name is required'); return; }
    if (!form.email.trim())       { toast.error('Email is required'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        name:     form.name.trim(),
        email:    form.email.trim(),
        password: form.password,
        role:     form.role,
      });

      // Store in context AND localStorage so PrivateRoute lets us through
      loginWithData(data.token, data.user);

      toast.success(`Welcome to MediCore, ${data.user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      toast.error(msg);
      console.error('Register error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in">

          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 pt-8 pb-6 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3">+</div>
            <h1 className="font-display font-bold text-2xl text-white">MediCore</h1>
            <p className="text-primary-200 text-sm mt-1">Hospital Management Platform</p>
          </div>

          <div className="p-8">
            {/* Tab toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
              {['login', 'register'].map((m) => (
                <button key={m} onClick={() => switchMode(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}>
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            {/* ── LOGIN FORM ── */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <input type="email" className="input" value={form.email}
                    onChange={set('email')} placeholder="you@medicore.com" required autoFocus />
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} className="input pr-10"
                      value={form.password} onChange={set('password')}
                      placeholder="••••••••" required />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm">
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-base">
                  {loading ? 'Signing in…' : 'Sign In →'}
                </button>
                <p className="text-center text-xs text-slate-400">
                  No account?{' '}
                  <button type="button" onClick={() => switchMode('register')}
                    className="text-primary-600 hover:underline font-medium">
                    Create one free
                  </button>
                </p>
              </form>
            )}

            {/* ── REGISTER FORM ── */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input type="text" className="input" value={form.name}
                    onChange={set('name')} placeholder="Dr. Arjun Sharma" required autoFocus />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input type="email" className="input" value={form.email}
                    onChange={set('email')} placeholder="you@medicore.com" required />
                </div>
                <div>
                  <label className="label">
                    Password <span className="text-slate-400 font-normal">(min. 6 characters)</span>
                  </label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} className="input pr-10"
                      value={form.password} onChange={set('password')}
                      placeholder="••••••••" required minLength={6} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm">
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Role</label>
                  <select className="input" value={form.role} onChange={set('role')}>
                    <option value="admin">Admin</option>
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="receptionist">Receptionist</option>
                  </select>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-base">
                  {loading ? 'Creating account…' : 'Create Account →'}
                </button>
                <p className="text-center text-xs text-slate-400">
                  Already have an account?{' '}
                  <button type="button" onClick={() => switchMode('login')}
                    className="text-primary-600 hover:underline font-medium">
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 pb-5 text-center">
            <p className="text-xs text-slate-400">
              Backend runs on port{' '}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">5001</code>
              {' '}· Frontend on{' '}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">5173</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
