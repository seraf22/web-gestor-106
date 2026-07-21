import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl, authHeaders } from '../config';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const resp = await fetch(apiUrl('/api/Auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!resp.ok) throw new Error('Credenciales inválidas');

      const data = await resp.json();
      const token = data?.token ?? data?.accessToken ?? data?.access_token ?? data?.tokenValue ?? null;
      if (token) {
        localStorage.setItem('token', token);
        // notificar a Layout en la misma ventana
        try { window.dispatchEvent(new Event('authchange')); } catch {}
        navigate('/');
        return;
      }

      throw new Error('Respuesta inválida del servidor');
    } catch (err: any) {
      setError(err?.message ?? 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Iniciar sesión</h2>
      {error && <div className="mb-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Usuario</label>
          <input className="w-full px-3 py-2 border rounded" value={username} onChange={(e)=>setUsername(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Contraseña</label>
          <input type="password" className="w-full px-3 py-2 border rounded" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="bg-casa-blue text-white px-4 py-2 rounded">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
      </form>
    </div>
  );
}
