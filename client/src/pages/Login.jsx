import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

export default function Login() {
  const navigate  = useNavigate();
  const { setAuth } = useAuthStore();
  const [tab,  setTab]  = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setLoading(true);
    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload  = tab === 'login'
        ? { email: form.email, password: form.password }
        : { username: form.username, email: form.email, password: form.password };

      const { data } = await api.post(endpoint, payload);
      setAuth(data.user, data.token);
      localStorage.setItem('db_username', data.user.username);
      toast.success(tab === 'login' ? 'Welcome back!' : 'Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">
      {/* Brand */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white rounded-sm" />
        </div>
        <span className="text-white font-bold text-xl tracking-tight">
          Distributed<span className="text-indigo-400">Board</span>
        </span>
      </div>

      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-7 shadow-2xl">
        <h1 className="text-white text-xl font-semibold mb-1">
          {tab === 'login' ? 'Sign in' : 'Create account'}
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          {tab === 'login' ? "Don't have an account? " : 'Already have one? '}
          <button
            onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
            className="text-indigo-400 hover:text-indigo-300 transition"
          >
            {tab === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        <div className="space-y-3">
          {tab === 'register' && (
            <Field label="Username" type="text" value={form.username}
              onChange={update('username')} placeholder="Your display name" />
          )}
          <Field label="Email" type="email" value={form.email}
            onChange={update('email')} placeholder="you@example.com" />
          <Field label="Password" type="password" value={form.password}
            onChange={update('password')} placeholder="Min 6 characters"
            onKeyDown={(e) => e.key === 'Enter' && submit()} />
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full mt-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition"
        >
          {loading ? 'Please wait…' : tab === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </div>

      <p className="text-slate-600 text-xs mt-6">
        By continuing you agree to the terms of this demo project
      </p>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-slate-400 text-xs mb-1">{label}</label>
      <input
        {...props}
        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition"
      />
    </div>
  );
}