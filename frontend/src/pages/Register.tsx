import { useState } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from "@/contexts/LanguageContext";

const Register = () => {
  const { t } = useLanguage();
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
      setError(t('auth.passwordMismatch'));
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
        setError(first?.[0] || t('auth.registerFailed'));
      } else {
        setError(data?.message || t('auth.registerFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-full max-w-sm">
        <h1 className="text-2xl text-blackfont-bold mb-4 text-center">{t('auth.registerTitle')}</h1>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" value={form.name} onChange={handleChange} placeholder={t('auth.fullNamePlaceholder')}
            className="w-full p-2 border rounded" required />
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder={t('common.email')}
            className="w-full p-2 border rounded" required />
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder={t('common.password')}
            className="w-full p-2 border rounded" required />
          <input name="password_confirmation" type="password"
            value={form.password_confirmation} onChange={handleChange}
            placeholder={t('auth.confirmPasswordPlaceholder')} className="w-full p-2 border rounded" required />
          <select name="role" value={form.role} onChange={handleChange}
            className="w-full p-2 border rounded">
            <option value="admin">{t('users.admin')}</option>
            <option value="pm">{t('users.pm')}</option>
            <option value="team">{t('users.team')}</option>
            <option value="client">{t('users.client')}</option>
          </select>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded disabled:opacity-60">
            {loading ? t('auth.processing') : t('auth.registerButton')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
