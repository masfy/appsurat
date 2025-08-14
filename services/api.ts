
import { DashboardStats, MailType, Surat, Filters, SuratMasuk, SuratKeluar, UserProfile, AuthUser } from '../types';

// This is a mock for development outside of the GAS environment.
const gasRunner = (fnName: string, ...args: any[]): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (typeof google === 'undefined' || typeof google.script === 'undefined') {
            console.warn(`google.script.run is not available. Mocking API call for ${fnName}.`);
            // Mock data for local development
             if (fnName === 'login') {
                 if (args[0] === 'admin@example.com' && args[1] === 'admin123') {
                     resolve({ success: true, user: { ID: '1', Email: 'admin@example.com', Nama: 'Admin Alfy', Jabatan: 'Developer', Unit: 'IT', 'Foto URL': '' } });
                 } else {
                     resolve({ success: false, message: 'Email atau password salah.' });
                 }
             } else if (fnName === 'checkAuth') {
                 // To test logged out state, change this to resolve({ success: false });
                 resolve({ success: true, user: { ID: '1', Email: 'admin@example.com', Nama: 'Admin Alfy', Jabatan: 'Developer', Unit: 'IT', 'Foto URL': '' } });
             } else if (fnName === 'logout') {
                 resolve({ success: true });
             } else if (fnName === 'getUserProfile') {
                 resolve({ ID: '1', Email: 'admin@example.com', Nama: 'Admin Alfy', Jabatan: 'Developer', Unit: 'IT', 'Foto URL': '' });
             } else if (fnName === 'getDashboardStats') {
                 resolve({ totalMasuk: 10, totalKeluar: 5, masukBulanIni: 2, keluarBulanIni: 1, belumDisposisi: 3 });
             } else if (fnName === 'listSurat') {
                 resolve([]);
             } else {
                 resolve({success: true, message: "Mocked success"});
             }
            return;
        }

        google.script.run
            .withSuccessHandler(response => {
                // GAS can return an Error object on failure
                if (response instanceof Error) {
                    reject(response);
                } else if (response && response.error) {
                    reject(new Error(response.error));
                } else {
                    resolve(response);
                }
            })
            .withFailureHandler(reject)
            [fnName](...args);
    });
};

export const api = {
    // Auth
    login: (email: string, password: string): Promise<{ success: boolean; user?: AuthUser; message?: string; }> => {
        return gasRunner('login', email, password);
    },
    logout: (): Promise<{ success: boolean; }> => {
        return gasRunner('logout');
    },
    checkAuth: (): Promise<{ success: boolean; user?: AuthUser; }> => {
        return gasRunner('checkAuth');
    },

    // Dashboard
    getDashboardStats: (): Promise<DashboardStats> => {
        return gasRunner('getDashboardStats');
    },

    // Surat
    listSurat: (type: MailType, filters: Filters): Promise<Surat[]> => {
        return gasRunner('listSurat', type, filters);
    },
    getSuratById: (type: MailType, id: string): Promise<Surat> => {
        return gasRunner('getSuratById', type, id);
    },
    getNewNomorSurat: (): Promise<string> => {
        return gasRunner('getNewNomorSurat');
    },
    createSurat: (type: MailType, data: Partial<SuratMasuk> | Partial<SuratKeluar>): Promise<{ success: boolean; message: string; }> => {
        return gasRunner('createSurat', type, data);
    },
    updateSurat: (type: MailType, id: string, data: Partial<SuratMasuk> | Partial<SuratKeluar>): Promise<{ success: boolean; message: string; }> => {
        return gasRunner('updateSurat', type, id, data);
    },
    deleteSurat: (type: MailType, id: string): Promise<{ success: boolean; message: string; }> => {
        return gasRunner('deleteSurat', type, id);
    },

    // User Profile
    getUserProfile: (): Promise<AuthUser> => {
        return gasRunner('getUserProfile');
    },
    updateUserProfile: (profile: Partial<AuthUser> & { photoFile?: any }): Promise<{ success: boolean; message: string; }> => {
        return gasRunner('updateUserProfile', profile);
    },
};
