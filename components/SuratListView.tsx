import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MailType, NotificationMessage, Surat, Filters, SuratMasuk, SuratKeluar } from '../types';
import { api } from '../services/api';
import LoadingSpinner from './common/LoadingSpinner';
import SuratFormModal from './SuratFormModal';
import { PlusIcon, TrashIcon, PencilIcon, DownloadIcon, DocumentSearchIcon } from './common/Icon';

// Status Badge Component for better visual feedback
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const statusStyles: { [key: string]: string } = {
        'Belum Disposisi': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        'Sudah Disposisi': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        'Draf': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
        'Terkirim': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'Diarsipkan': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };

    return (
        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusStyles[status] || statusStyles['Diarsipkan']}`}>
            {status}
        </span>
    );
};


interface SuratListViewProps {
    mailType: MailType;
    showNotification: (message: NotificationMessage) => void;
}

const SuratListView: React.FC<SuratListViewProps> = ({ mailType, showNotification }) => {
    const [suratList, setSuratList] = useState<Surat[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedSurat, setSelectedSurat] = useState<Surat | null>(null);
    const [filters, setFilters] = useState<Filters>({ searchTerm: '', startDate: '', endDate: '', status: '' });

    const title = useMemo(() => mailType === 'masuk' ? 'Surat Masuk' : 'Surat Keluar', [mailType]);

    const statusOptions = useMemo(() => mailType === 'masuk' 
        ? ['Belum Disposisi', 'Sudah Disposisi', 'Diarsipkan'] 
        : ['Draf', 'Terkirim', 'Diarsipkan'], [mailType]);

    const tableHeaders = useMemo(() => mailType === 'masuk' 
        ? ["Nomor Surat", "Asal Surat", "Perihal", "Tanggal Diterima", "Status"] 
        : ["Nomor Surat", "Tujuan Surat", "Perihal", "Tanggal Surat", "Status"], [mailType]);

    const fetchSurat = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.listSurat(mailType, filters);
            setSuratList(data);
        } catch (error) {
            console.error(`Failed to fetch ${title}:`, error);
            showNotification({ message: `Gagal memuat ${title}: ${error.message}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [mailType, filters, title, showNotification]);

    useEffect(() => {
        fetchSurat();
    }, [fetchSurat]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenModal = (surat: Surat | null = null) => {
        setSelectedSurat(surat);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedSurat(null);
    };

    const handleFormSubmit = async () => {
        showNotification({ message: `Data ${title} berhasil disimpan.`, type: 'success' });
        handleCloseModal();
        fetchSurat(); // Refresh data
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus surat ini?")) {
            try {
                await api.deleteSurat(mailType, id);
                showNotification({ message: 'Surat berhasil dihapus.', type: 'success' });
                fetchSurat();
            } catch (error) {
                console.error('Failed to delete surat:', error);
                showNotification({ message: `Gagal menghapus surat: ${error.message}`, type: 'error' });
            }
        }
    };
    
    const exportToCSV = () => {
        if (suratList.length === 0) {
            showNotification({message: "Tidak ada data untuk diekspor.", type: 'info'});
            return;
        }
        
        const allHeaders = Object.keys(suratList[0]);
        const csvRows = [allHeaders.join(',')];

        for (const row of suratList) {
            const values = allHeaders.map(header => {
                const escaped = ('' + (row as any)[header]).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `${title}_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const renderTableRows = () => {
        if (suratList.length === 0) {
            return (
                <tr>
                    <td colSpan={tableHeaders.length + 1} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                           <DocumentSearchIcon className="w-16 h-16 mb-4 text-gray-400" />
                           <h3 className="text-xl font-semibold">Data Tidak Ditemukan</h3>
                           <p className="mt-1">Coba ubah filter pencarian Anda atau tambahkan data baru.</p>
                        </div>
                    </td>
                </tr>
            );
        }

        return suratList.map(surat => (
            <tr key={surat.ID} className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-600 transition-colors duration-150">
                {mailType === 'masuk' ? (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{(surat as SuratMasuk)['Nomor Surat']}</td>
                        <td className="px-6 py-4">{(surat as SuratMasuk)['Asal Surat']}</td>
                        <td className="px-6 py-4 max-w-xs truncate">{(surat as SuratMasuk)['Perihal']}</td>
                        <td className="px-6 py-4">{(surat as SuratMasuk)['Tanggal Diterima']}</td>
                        <td className="px-6 py-4"><StatusBadge status={(surat as SuratMasuk).Status} /></td>
                    </>
                ) : (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{(surat as SuratKeluar)['Nomor Surat']}</td>
                        <td className="px-6 py-4">{(surat as SuratKeluar)['Tujuan Surat']}</td>
                        <td className="px-6 py-4 max-w-xs truncate">{(surat as SuratKeluar)['Perihal']}</td>
                        <td className="px-6 py-4">{(surat as SuratKeluar)['Tanggal Surat']}</td>
                        <td className="px-6 py-4"><StatusBadge status={(surat as SuratKeluar).Status} /></td>
                    </>
                )}
                 <td className="px-6 py-4 text-right whitespace-nowrap space-x-4">
                    <button title="Ubah" onClick={() => handleOpenModal(surat)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"><PencilIcon /></button>
                    <button title="Hapus" onClick={() => handleDelete(surat.ID)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"><TrashIcon /></button>
                </td>
            </tr>
        ));
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 dark:text-gray-100">{title}</h2>
            
            {/* Controls */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6 dark:bg-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <input
                            type="text"
                            name="searchTerm"
                            placeholder="Cari perihal, nomor, asal/tujuan..."
                            value={filters.searchTerm}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        />
                    </div>
                     <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"/>
                     <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"/>
                     <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option value="">Semua Status</option>
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                 <div className="flex justify-between items-center mt-4">
                    <div>
                        <button onClick={() => handleOpenModal()} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md">
                            <PlusIcon className="mr-2" />
                            Tambah {title}
                        </button>
                    </div>
                    <div>
                         <button onClick={exportToCSV} className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md">
                            <DownloadIcon className="mr-2" />
                            Ekspor CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-md overflow-x-auto dark:bg-gray-800">
                {loading ? <div className="flex justify-center items-center h-64"><LoadingSpinner /></div> : (
                    <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                {tableHeaders.map(header => <th key={header} scope="col" className="px-6 py-3">{header}</th>)}
                                <th scope="col" className="px-6 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderTableRows()}
                        </tbody>
                    </table>
                )}
            </div>

            {isModalOpen && (
                <SuratFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleFormSubmit}
                    mailType={mailType}
                    initialData={selectedSurat}
                    showNotification={showNotification}
                />
            )}
        </div>
    );
};

export default SuratListView;