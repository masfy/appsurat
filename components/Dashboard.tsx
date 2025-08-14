
import React, { useState, useEffect } from 'react';
import { DashboardStats, NotificationMessage } from '../types';
import { api } from '../services/api';
import LoadingSpinner from './common/LoadingSpinner';
import { ArrowDownIcon, ArrowUpIcon, ClockIcon, AppLogoIcon, ExclamationIcon } from './common/Icon';

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center dark:bg-gray-800 dark:border dark:border-gray-700">
        <div className={`p-3 rounded-full mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    </div>
);


interface DashboardProps {
    showNotification: (message: NotificationMessage) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ showNotification }) => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await api.getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
                showNotification({ message: `Gagal memuat statistik: ${error.message}`, type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
    }

    if (!stats) {
        return <div className="text-center text-gray-500 dark:text-gray-400">Gagal memuat data statistik.</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 dark:text-gray-100">Dashboard</h2>
            
            <div className="mb-10 bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
                 <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center dark:text-gray-200">
                    <AppLogoIcon className="mr-2 h-6 w-6 text-blue-600 dark:text-blue-400"/>
                    Selamat Datang di Aplikasi Manajemen Surat
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Gunakan menu di sebelah kiri untuk menavigasi antara Dashboard, Surat Masuk, dan Surat Keluar. Anda dapat menambah, mengubah, menghapus, dan mencari surat dengan mudah.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <StatCard title="Total Surat Masuk" value={stats.totalMasuk} icon={<ArrowDownIcon />} color="bg-blue-100 text-blue-600" />
                <StatCard title="Total Surat Keluar" value={stats.totalKeluar} icon={<ArrowUpIcon />} color="bg-green-100 text-green-600" />
                <StatCard title="Masuk Bulan Ini" value={stats.masukBulanIni} icon={<ClockIcon />} color="bg-indigo-100 text-indigo-600" />
                <StatCard title="Keluar Bulan Ini" value={stats.keluarBulanIni} icon={<ClockIcon />} color="bg-purple-100 text-purple-600" />
                <StatCard title="Belum Disposisi" value={stats.belumDisposisi} icon={<ExclamationIcon />} color="bg-yellow-100 text-yellow-600" />
            </div>
        </div>
    );
};

export default Dashboard;
