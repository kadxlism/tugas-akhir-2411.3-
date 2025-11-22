import { useEffect, useState } from 'react';
import axios from '@/services/axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(`/api/users/${id}`).then(res => setUser(res.data));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`/api/users/${id}`, user);
      setMessage('User berhasil diperbarui');
      setTimeout(() => navigate('/admin/users'), 1000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Gagal update user');
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Edit User</h2>
      {message && <p className="mb-2 text-blue-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={user.name}
          onChange={e => setUser({ ...user, name: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <input
          type="email"
          value={user.email}
          onChange={e => setUser({ ...user, email: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Kosongkan jika tidak ingin diubah"
          onChange={e => setUser({ ...user, password: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={user.is_admin}
            onChange={e => setUser({ ...user, is_admin: e.target.checked })}
            className="mr-2"
          />
          Admin?
        </label>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Update
        </button>
      </form>
    </div>
  );
};

export default EditUser;
