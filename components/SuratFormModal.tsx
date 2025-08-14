
import React, { useState, useEffect, useCallback } from 'react';
import { MailType, NotificationMessage, Surat, SuratMasuk, SuratKeluar, UploadedFile } from '../types';
import { api } from '../services/api';
import LoadingSpinner from './common/LoadingSpinner';
import { XIcon, UploadIcon } from './common/Icon';

interface SuratFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    mailType: MailType;
    initialData: Surat | null;
    showNotification: (message: NotificationMessage) => void;
}

const SuratFormModal: React.FC<SuratFormModalProps> = ({ isOpen, onClose, onSubmit, mailType, initialData, showNotification }) => {
    const defaultState: Partial<Surat> = mailType === 'masuk' ? 
        { 'Nomor Surat': '', 'Tanggal Surat': '', 'Tanggal Diterima': '', 'Asal Surat': '', 'Perihal': '', 'Status': 'Belum Disposisi' } :
        { 'Nomor Surat': '', 'Tanggal Surat': '', 'Tujuan Surat': '', 'Perihal': '', 'Status': 'Draf' };

    const [formData, setFormData] = useState<Partial<Surat>>(initialData || defaultState);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [file, setFile] = useState<UploadedFile | null>(null);

    const getNewNumber = useCallback(async () => {
        if (mailType === 'keluar' && !initialData) {
            setLoading(true);
            try {
                const newNumber = await api.getNewNomorSurat();
                setFormData(prev => ({ ...prev, 'Nomor Surat': newNumber }));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                showNotification({ message: `Gagal membuat nomor surat: ${errorMessage}`, type: 'error' });
            } finally {
                setLoading(false);
            }
        }
    }, [mailType, initialData, showNotification]);

    useEffect(() => {
        setFormData(initialData || defaultState);
        setFile(null); // Reset file on modal open/re-open
        if (isOpen && !initialData && mailType === 'keluar') {
            getNewNumber();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialData, mailType]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const base64Data = base64String.split(',')[1];
                setFile({
                    fileName: selectedFile.name,
                    mimeType: selectedFile.type,
                    base64Data: base64Data
                });
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const validateForm = () => {
        const requiredFieldsMasuk = ['Nomor Surat', 'Tanggal Surat', 'Tanggal Diterima', 'Asal Surat', 'Perihal'];
        const requiredFieldsKeluar = ['Tanggal Surat', 'Tujuan Surat', 'Perihal'];
        const fields = mailType === 'masuk' ? requiredFieldsMasuk : requiredFieldsKeluar;
        
        for (const field of fields) {
            if (!(formData as any)[field]) {
                showNotification({ message: `Kolom "${field}" wajib diisi.`, type: 'error' });
                return false;
            }
        }
        return true;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        const dataToSubmit = { ...formData, file: file };

        try {
            if (initialData) {
                await api.updateSurat(mailType, initialData.ID, dataToSubmit);
            } else {
                await api.createSurat(mailType, dataToSubmit);
            }
            onSubmit();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            showNotification({ message: `Gagal menyimpan: ${errorMessage}`, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const renderField = (name: string, label: string, type: string = "text", options?: string[]) => {
      const commonProps = {
        id: name,
        name: name,
        onChange: handleChange,
        className: "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white",
        disabled: isSubmitting,
      };

      if (type === "textarea") {
        return <textarea {...commonProps} value={(formData as any)[name] || ''} rows={3}></textarea>
      }

      if (type === "select") {
        return <select {...commonProps} value={(formData as any)[name] || ''}>{options?.map(o => <option key={o} value={o}>{o}</option>)}</select>
      }
      
      return <input type={type} {...commonProps} value={(formData as any)[name] || ''}/>
    }

    const title = `${initialData ? 'Ubah' : 'Tambah'} ${mailType === 'masuk' ? 'Surat Masuk' : 'Surat Keluar'}`;
    const statusOptions = mailType === 'masuk' ? ['Belum Disposisi', 'Sudah Disposisi', 'Diarsipkan'] : ['Draf', 'Terkirim', 'Diarsipkan'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto dark:bg-gray-800">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-white"><XIcon /></button>
                </div>
                {loading ? <div className="h-64 flex items-center justify-center"><LoadingSpinner /></div> : (
                <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {mailType === 'keluar' && (
                            <div className="md:col-span-2">
                                <label htmlFor="Nomor Surat" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nomor Surat (Otomatis)</label>
                                <input id="Nomor Surat" name="Nomor Surat" type="text" value={(formData as any)['Nomor Surat'] || ''} className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300" readOnly/>
                            </div>
                        )}
                        {mailType === 'masuk' && (
                           <div>
                                <label htmlFor="Nomor Surat" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nomor Surat</label>
                                {renderField('Nomor Surat', 'Nomor Surat')}
                            </div>
                        )}
                        <div>
                            <label htmlFor="Tanggal Surat" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Surat</label>
                            {renderField('Tanggal Surat', 'Tanggal Surat', 'date')}
                        </div>
                         {mailType === 'masuk' && (
                           <div>
                                <label htmlFor="Tanggal Diterima" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Diterima</label>
                                {renderField('Tanggal Diterima', 'Tanggal Diterima', 'date')}
                            </div>
                        )}
                         <div>
                            <label htmlFor={mailType === 'masuk' ? 'Asal Surat' : 'Tujuan Surat'} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{mailType === 'masuk' ? 'Asal Surat' : 'Tujuan Surat'}</label>
                            {renderField(mailType === 'masuk' ? 'Asal Surat' : 'Tujuan Surat', '')}
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="Perihal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Perihal</label>
                            {renderField('Perihal', 'Perihal')}
                        </div>
                        <div>
                            <label htmlFor="Status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                            {renderField('Status', 'Status', 'select', statusOptions)}
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lampiran File (Opsional)</label>
                             <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <UploadIcon className="mx-auto h-12 w-12 text-gray-400"/>
                                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                                            <span>Pilih file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                        </label>
                                        <p className="pl-1">atau tarik dan lepas</p>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                        {file ? file.fileName : 'PNG, JPG, PDF hingga 10MB'}
                                        {initialData?.['File URL'] && !file && <a href={initialData['File URL']} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-2">(Lihat file lama)</a>}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="Keterangan" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Keterangan (Opsional)</label>
                            {renderField('Keterangan', 'Keterangan', 'textarea')}
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t flex justify-end space-x-3 dark:bg-gray-700/50 dark:border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500" disabled={isSubmitting}>Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center" disabled={isSubmitting}>
                            {isSubmitting && <LoadingSpinner size="small" className="mr-2" />}
                            Simpan
                        </button>
                    </div>
                </form>
                )}
            </div>
        </div>
    );
};

export default SuratFormModal;
