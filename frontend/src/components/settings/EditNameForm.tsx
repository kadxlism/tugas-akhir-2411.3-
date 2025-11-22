import { useState } from 'react';
import { updateUserName } from '@/api/user-profile';

interface EditNameFormProps {
    currentName: string;
    onSuccess: (newName: string) => void;
}

const EditNameForm = ({ currentName, onSuccess }: EditNameFormProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(currentName);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await updateUserName({ name });
            if (response.success) {
                onSuccess(name);
                setIsEditing(false);
            } else {
                setError(response.message || 'Gagal memperbarui nama');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setName(currentName);
        setError('');
        setIsEditing(false);
    };

    if (!isEditing) {
        return (
            <div className="group">
                <label className="block text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    Nama
                </label>
                <div className="bg-white dark:bg-gray-700 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-600 group-hover:shadow-md transition-all duration-200 flex justify-between items-center">
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium">{currentName}</p>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="ml-2 px-3 py-1 text-xs sm:text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                        Edit
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="group">
            <label className="block text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Nama
            </label>
            <form onSubmit={handleSubmit} className="space-y-2">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 sm:p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    minLength={2}
                    maxLength={255}
                />
                {error && <p className="text-xs sm:text-sm text-red-500">{error}</p>}
                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={loading || name === currentName}
                        className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm sm:text-base"
                    >
                        {loading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg transition-colors text-sm sm:text-base"
                    >
                        Batal
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditNameForm;
