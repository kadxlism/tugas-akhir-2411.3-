import { useState } from 'react';
import { updateUserEmail } from '@/api/user-profile';

interface EditEmailFormProps {
    currentEmail: string;
    onSuccess: (newEmail: string) => void;
}

const EditEmailForm = ({ currentEmail, onSuccess }: EditEmailFormProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [email, setEmail] = useState(currentEmail);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await updateUserEmail({ email, password });
            if (response.success) {
                onSuccess(email);
                setIsEditing(false);
                setPassword('');
            } else {
                setError(response.message || 'Gagal memperbarui email');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEmail(currentEmail);
        setPassword('');
        setError('');
        setIsEditing(false);
    };

    if (!isEditing) {
        return (
            <div className="group">
                <label className="block text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    Email
                </label>
                <div className="bg-white dark:bg-gray-700 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-600 group-hover:shadow-md transition-all duration-200 flex justify-between items-center">
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium break-words">{currentEmail}</p>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="ml-2 px-3 py-1 text-xs sm:text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex-shrink-0"
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
                Email
            </label>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Email Baru</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Password Saat Ini (untuk verifikasi)</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 pr-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
                {error && <p className="text-xs sm:text-sm text-red-500">{error}</p>}
                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={loading || email === currentEmail || !password}
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

export default EditEmailForm;
