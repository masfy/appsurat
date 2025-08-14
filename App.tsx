
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, NotificationMessage, Theme, AuthUser } from './types';
import Dashboard from './components/Dashboard';
import SuratListView from './components/SuratListView';
import ProfilePage from './components/ProfilePage';
import LoginPage from './components/LoginPage';
import Notification from './components/common/Notification';
import LoadingSpinner from './components/common/LoadingSpinner';
import { MenuIcon, XIcon, SunIcon, MoonIcon, DashboardIcon, InboxIcon, PaperAirplaneIcon, ChevronDoubleLeftIcon, UserCircleIcon, LogoutIcon, AppLogoIcon } from './components/common/Icon';
import { api } from './services/api';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [notification, setNotification] = useState<NotificationMessage | null>(null);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<string>('Mengecek koneksi...');
    
    const profileMenuRef = useRef<HTMLDivElement>(null);

    const [theme, setTheme] = useState<Theme>(
        (localStorage.getItem('theme') as Theme) || 'light'
    );

    useEffect(() => {
        // --- Connection Test ---
        const checkConnection = async () => {
            try {
                const response = await api.ping();
                if (response.success) {
                    setConnectionStatus(`Koneksi: ${response.source}`);
                } else {
                    setConnectionStatus('Koneksi: Gagal terhubung ke backend.');
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Error tidak diketahui';
                setConnectionStatus(`Koneksi Error: ${errorMessage}`);
                console.error("Connection ping failed:", error);
            }
        };
        checkConnection();
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const showNotification = useCallback((message: NotificationMessage) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 5000);
    }, []);

    useEffect(() => {
        const checkUserAuth = async () => {
            try {
                const response = await api.checkAuth();
                if (response.success && response.user) {
                    setAuthUser(response.user);
                }
            } catch (error) {
                console.error("Auth check failed:", error);
            } finally {
                setIsCheckingAuth(false);
            }
        };
        // Run after a short delay to allow the connection test to complete first
        setTimeout(checkUserAuth, 100);
    }, []);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLoginSuccess = (user: AuthUser) => {
        setAuthUser(user);
        showNotification({ message: `Selamat datang, ${user.Nama}!`, type: 'success' });
    };

    const handleLogout = async () => {
        try {
            await api.logout();
            setAuthUser(null);
            setCurrentView('dashboard');
            setProfileMenuOpen(false);
            showNotification({ message: 'Anda telah berhasil logout.', type: 'info' });
        } catch (error) {
            showNotification({ message: 'Gagal logout.', type: 'error' });
        }
    };

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };
    
    const toggleSidebarCollapse = () => {
        setSidebarCollapsed(!isSidebarCollapsed);
    }

    const handleProfileUpdate = (updatedProfile: AuthUser) => {
        setAuthUser(updatedProfile);
        showNotification({ message: 'Profil berhasil diperbarui!', type: 'success' });
    };
    
    const handleSetView = (view: View) => {
        setCurrentView(view);
        setSidebarOpen(false);
        setProfileMenuOpen(false);
    };

    const renderView = () => {
        switch (currentView) {
            case 'surat-masuk':
                return <SuratListView mailType="masuk" showNotification={showNotification} />;
            case 'surat-keluar':
                return <SuratListView mailType="keluar" showNotification={showNotification} />;
            case 'profile':
                if (!authUser) return null;
                return <ProfilePage userProfile={authUser} onProfileUpdate={handleProfileUpdate} showNotification={showNotification} />;
            case 'dashboard':
            default:
                return <Dashboard showNotification={showNotification} />;
        }
    };

    if (isCheckingAuth) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    if (!authUser) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} showNotification={showNotification} />;
    }

    const NavLink: React.FC<{ view: View; label: string; icon: React.ReactNode }> = ({ view, label, icon }) => (
        <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleSetView(view); }}
            className={`flex items-center px-4 py-2.5 text-sm rounded-md transition-colors duration-200 ${
                currentView === view
                    ? 'bg-blue-600 text-white font-semibold shadow-md'
                    : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'
            } ${isSidebarCollapsed ? 'justify-center' : ''}`}
            title={isSidebarCollapsed ? label : ''}
        >
            {icon}
            <span className={`transition-all duration-200 ${isSidebarCollapsed ? 'md:hidden' : 'ml-3'}`}>{label}</span>
        </a>
    );

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 bg-white/70 backdrop-blur-md shadow-lg transform ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } transition-all duration-300 ease-in-out md:relative md:translate-x-0 dark:bg-gray-800/70 dark:border-r dark:border-gray-700/50 ${ isSidebarCollapsed ? 'md:w-20' : 'md:w-64' }`}
            >
                <div className={`flex items-center h-16 p-4 border-b dark:border-gray-700/50 ${isSidebarCollapsed ? 'md:justify-center' : 'justify-between'}`}>
                    <div className="flex items-center overflow-hidden">
                        <AppLogoIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0"/>
                        <h1 className={`ml-2 text-md font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap transition-opacity duration-200 ease-in-out ${isSidebarCollapsed ? 'md:opacity-0' : 'md:opacity-100'}`}>
                            Manajemen Surat
                        </h1>
                    </div>
                    <button onClick={toggleSidebarCollapse} className="hidden md:block text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                       <ChevronDoubleLeftIcon className={`w-6 h-6 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                        <XIcon />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavLink view="dashboard" label="Dashboard" icon={<DashboardIcon />} />
                    <NavLink view="surat-masuk" label="Surat Masuk" icon={<InboxIcon />} />
                    <NavLink view="surat-keluar" label="Surat Keluar" icon={<PaperAirplaneIcon />} />
                    <NavLink view="profile" label="Profil" icon={<UserCircleIcon />} />
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-md border-b dark:bg-gray-800/70 dark:border-gray-700/50">
                     <button onClick={() => setSidebarOpen(true)} className="text-gray-600 hover:text-gray-900 md:hidden dark:text-gray-400 dark:hover:text-white">
                        <MenuIcon />
                    </button>
                    <div className="flex-grow"></div>
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={toggleTheme} 
                            className="p-2 rounded-full text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                        </button>
                        
                        <div className="relative" ref={profileMenuRef}>
                            <button
                                className="flex items-center space-x-2"
                                onClick={() => setProfileMenuOpen(prev => !prev)}
                                id="user-menu-button"
                                aria-expanded={isProfileMenuOpen}
                                aria-haspopup="true"
                            >
                               <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                  {authUser?.Nama || 'Pengguna'}
                               </span>
                              {authUser?.['Foto URL'] ? (
                                <img src={authUser['Foto URL']} alt="Profil" className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" />
                              ) : (
                                <UserCircleIcon className="w-10 h-10 text-gray-500" />
                              )}
                            </button>
                            {isProfileMenuOpen && (
                                <div 
                                    className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-gray-800 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none p-2 space-y-1 transition-all duration-100 ease-out"
                                    role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button"
                                >
                                    <a
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); handleSetView('profile'); }}
                                        className={`flex items-center w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                                            currentView === 'profile'
                                            ? 'bg-blue-600 text-white font-semibold shadow-sm'
                                            : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
                                        }`}
                                        role="menuitem"
                                    >
                                        <UserCircleIcon className="w-5 h-5 mr-3" />
                                        Profil Saya
                                    </a>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-200 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50"
                                        role="menuitem"
                                    >
                                        <LogoutIcon className="w-5 h-5 mr-3"/>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6 lg:p-8 dark:bg-gray-900">
                    {renderView()}
                </main>
                <footer className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 bg-white/70 backdrop-blur-md dark:bg-gray-800/70 border-t dark:border-gray-700/50">
                    <span className="mr-2">Dibuat dengan ❤️ oleh mas alfy.</span> | 
                    <span className="ml-2 font-mono text-xs">{connectionStatus}</span>
                </footer>
            </div>

            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
};

export default App;
