import { useState, useEffect } from 'react';
import axios from '@/services/axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from "@/contexts/LanguageContext";

const UserForm = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('designer');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`/admin/users/${id}`)
        .then(res => {
          setName(res.data.name);
          setEmail(res.data.email);
          setRole(res.data.role);
        })
        .catch(err => {
          console.error('Error fetching user:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const data = {
        name,
        email,
        role,
        ...(password && { password })
      };

      if (id) {
        await axios.put(`/admin/users/${id}`, data);
      } else {
        await axios.post('/admin/users', { ...data, password });
      }
      navigate('/users');
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        setErrors({ general: t('users.saveError') });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <div className="p-4">
        <div className="text-center text-gray-700">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 lg:p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-white to-blue-100 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {id ? t('users.editUser') : t('users.addNewUser')}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                {id ? t('users.editUserDesc') : t('users.addNewUserDesc')}
              </p>
            </div>
          </div>
        </div>

        {errors.general && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('users.fullName')}
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('users.enterFullName')}
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.email')}
            </label>
            <input
              type="email"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('users.enterEmail')}
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.role')}
            </label>
            <select
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${errors.role ? 'border-red-500' : 'border-gray-300'
                }`}
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="admin">{t('users.admin')}</option>
              <option value="designer">{t('users.designer')}</option>
              <option value="copywriter">{t('users.copywriter')}</option>
              <option value="web_designer">{t('users.web_designer')}</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.password')} {id && <span className="text-gray-500">{t('users.passwordHint')}</span>}
            </label>
            <input
              type="password"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={id ? t('users.newPasswordOptional') : t('users.enterPassword')}
              required={!id}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-linear-to-r from-blue-500 to-blue-600 text-white py-2.5 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? t('users.saving') : (id ? t('users.updateUser') : t('users.saveUser'))}
            </button>
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
