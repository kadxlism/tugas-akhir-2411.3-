import { useState } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const { register } = useAuth(); // pastikan fungsi ini menerima semua field
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'team'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.password_confirmation) {
      setError('Password & konfirmasi tidak sama');
      return;
    }

    try {
      setLoading(true);
      await register(form); 
      // Jika backend sudah return token & auto login => navigate ke dashboard
      navigate('/login'); // atau '/dashboard' sesuai flow
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors) {
        const first = Object.values(data.errors)[0] as string[];
        setError(first?.[0] || 'Registrasi gagal');
      } else {
        setError(data?.message || 'Registrasi gagal');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-full max-w-sm">
        <h1 className="text-2xl text-blackfont-bold mb-4 text-center">Register</h1>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name"
                 className="w-full p-2 border rounded" required />
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email"
                 className="w-full p-2 border rounded" required />
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password"
                 className="w-full p-2 border rounded" required />
            <input name="password_confirmation" type="password"
                 value={form.password_confirmation} onChange={handleChange}
                 placeholder="Confirm Password" className="w-full p-2 border rounded" required />
          <select name="role" value={form.role} onChange={handleChange}
                  className="w-full p-2 border rounded">
            <option value="admin">Admin</option>
            <option value="pm">Project Manager</option>
            <option value="team">Team</option>
            <option value="client">Client</option>
          </select>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded disabled:opacity-60">
            {loading ? 'Processing...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
