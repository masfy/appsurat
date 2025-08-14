
import React, { useState, useEffect } from 'react';
import { AuthUser, NotificationMessage, UploadedFile } from '../types';
import { api } from '../services/api';
import LoadingSpinner from './common/LoadingSpinner';
import { UserCircleIcon, UploadIcon } from './common/Icon';

interface ProfilePageProps {
    userProfile: AuthUser;
    onProfileUpdate: (updatedProfile: AuthUser) => void;
    showNotification: (message: NotificationMessage) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userProfile, onProfileUpdate, showNotification }) => {
    const [formData, setFormData] = useState<Partial<AuthUser>>(userProfile);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [photoFile, setPhotoFile] = useState<UploadedFile | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(userProfile['Foto URL'] || null);

    useEffect(() => {
        setFormData(userProfile);
        setPhotoPreview(userProfile['Foto URL'] || null);
    }, [userProfile]);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setPhotoPreview(base64String); // Show preview
                const base64Data = base64String.split(',')[1];
                setPhotoFile({
                    fileName: file.name,
                    mimeType: file.type,
                    base64Data,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value as string }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.Nama) {
            showNotification({ message: 'Nama tidak boleh kosong.', type: 'error' });
            return;
        }

        setIsSubmitting(true);
        const dataToSubmit: Partial<AuthUser> & { photoFile?: UploadedFile } = {
            ...formData,
        };
        if(photoFile) {
            dataToSubmit.photoFile = photoFile;
        }

        try {
            await api.updateUserProfile(dataToSubmit);
            // Create the updated profile object for the parent state
            const updatedProfileData = { ...userProfile, ...formData };
            if (photoPreview && photoFile) { // Check if a new file was uploaded
                 updatedProfileData['Foto URL'] = photoPreview;
            }
            onProfileUpdate(updatedProfileData);
            showNotification({ message: 'Profil berhasil diperbarui!', type: 'success' });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            showNotification({ message: `Gagal memperbarui profil: ${errorMessage}`, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const renderField = (name: keyof AuthUser, label: string, placeholder: string) => (
         <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>
            <input
                type="text"
                id={name}
                name={name}
                value={(formData as any)[name] || ''}
                onChange={handleChange}
                placeholder={placeholder}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                disabled={isSubmitting}
            />
        </div>
    );

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 dark:text-gray-100">Profil Pengguna</h2>

            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 md:p-8 rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                        {photoPreview ? (
                            <img src={photoPreview} alt="Profil" className="w-24 h-24 rounded-full object-cover shadow-md border-4 border-white dark:border-gray-600" />
                        ) : (
                            <UserCircleIcon className="w-24 h-24 text-gray-400 dark:text-gray-500" />
                        )}
                         <label htmlFor="photo-upload" className="cursor-pointer px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 flex items-center text-sm font-medium">
                            <UploadIcon className="w-4 h-4 mr-2" />
                            Ubah Foto
                         </label>
                         <input id="photo-upload" type="file" className="sr-only" accept="image/png, image/jpeg" onChange={handleFileChange} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderField('Nama', 'Nama Lengkap', 'Masukkan nama Anda')}
                        {renderField('Jabatan', 'Jabatan', 'e.g., Staf, Guru, Admin')}
                        <div className="md:col-span-2">
                          {renderField('Unit', 'Unit/Bagian', 'e.g., Tata Usaha, IT, Kurikulum')}
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                        <button 
                            type="submit" 
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center shadow-md transition-all duration-200" 
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <LoadingSpinner size="small" className="mr-2" />}
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
