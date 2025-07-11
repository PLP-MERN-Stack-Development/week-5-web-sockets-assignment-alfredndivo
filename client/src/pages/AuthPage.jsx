import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AuthPage = () => {
  const [username, setUsername] = useState('');
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = mode === 'register' ? '/register' : '/login';
    const payload = mode === 'register'
      ? { username, email, password }
      : { email, password };

    try {
      const { data } = await api.post(url, payload);
      setAuth({ user: data.user, token: data.token });
      navigate('/chat');
    } catch (err) {
      console.error('Auth error:', err);
      alert(err?.response?.data?.message || err?.response?.data?.error || 'Auth failed');
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-sm space-y-4">
        <h2 className="text-xl font-bold text-center">
          {mode === 'login' ? 'Login' : 'Register'}
        </h2>

        {mode === 'register' && (
          <input
            type="text"
            placeholder="Username"
            className="w-full border p-2 rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-yellow-700"
        >
          {mode === 'login' ? 'Login' : 'Register'}
        </button>

        <p className="text-center text-sm">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <span className="text-blue-600 cursor-pointer" onClick={() => setMode('register')}>
                Register
              </span>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <span className="text-blue-600 cursor-pointer" onClick={() => setMode('login')}>
                Login
              </span>
            </>
          )}
        </p>
      </form>
    </div>
  );
};

export default AuthPage;
