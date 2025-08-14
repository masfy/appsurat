import React, { useState } from 'react';
import { AuthUser, NotificationMessage } from '../types';
import { api } from '../services/api';
import LoadingSpinner from './common/LoadingSpinner';
import { AppLogoIcon, KeyIcon, UserCircleIcon } from './common/Icon';

interface LoginPageProps {
    onLoginSuccess: (user: AuthUser) => void;
    showNotification: (message: NotificationMessage) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, showNotification }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            showNotification({ message: 'Email dan password harus diisi.', type: 'error' });
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.login(email, password);
            if (response.success && response.user) {
                onLoginSuccess(response.user);
            } else {
                showNotification({ message: response.message || 'Login gagal. Periksa kembali email dan password Anda.', type: 'error' });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui';
            showNotification({ message: errorMessage, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 transition-colors duration-300">
            <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">
                {/* Left Panel - Branding */}
                <div className="hidden md:flex flex-col justify-center items-center text-white p-12 bg-gradient-to-br from-blue-600 to-indigo-700">
                    <AppLogoIcon className="w-24 h-24 mb-6 text-blue-200" />
                    <h1 className="text-3xl font-bold mb-2 text-center">Aplikasi Manajemen Surat</h1>
                    <p className="text-center text-blue-200">Kelola surat masuk dan keluar dengan efisien, cepat, dan aman.</p>
                </div>

                {/* Right Panel - Form */}
                <div className="w-full p-8 sm:p-12 flex flex-col justify-center">
                    <div className="md:hidden flex flex-col items-center text-center mb-8">
                         <AppLogoIcon className="w-16 h-16 mb-4 text-blue-600 dark:text-blue-400"/>
                         <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Manajemen Surat</h1>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Selamat Datang Kembali!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">Silakan masuk untuk melanjutkan.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserCircleIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-offset-gray-800"
                                    placeholder="anda@email.com"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password"  className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                             <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-offset-gray-800"
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 dark:focus:ring-offset-gray-800 transition-all duration-200"
                                disabled={isLoading}
                            >
                                {isLoading ? <LoadingSpinner size="small" /> : 'Masuk'}
                            </button>
                        </div>
                    </form>
                    <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
                        Gunakan akun yang telah terdaftar. <br/> Untuk development, gunakan `admin@example.com` / `admin123`.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;