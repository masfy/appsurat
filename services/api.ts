import { DashboardStats, MailType, Surat, Filters, AuthUser, UserProfile } from '../types';

// =================================================================
// KONFIGURASI FRONTEND
// =================================================================
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzOldo_l28tqsmAT2uExzHZDq8gp14jf--Z1zilvS4HNSj9Ka0LDlbt8yR1BYw0qFN5/exec';

// =================================================================
// FETCH API IMPLEMENTATION
// =================================================================

interface ApiResponse<T> {
    success: boolean;
    user?: T;
    message?: string;
}

// Helper untuk memanggil backend Apps Script menggunakan fetch
const apiCall = async (functionName: string, ...args: any[]): Promise<any> => {
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ functionName, args }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Network response was not ok: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        
        // Jika backend Apps Script mengembalikan error terstruktur
        if (result.success === false || result.error) {
           throw new Error(result.message || result.error || 'Terjadi kesalahan di backend.');
        }

        return result;
    } catch (error) {
        console.error(`API call failed for ${functionName}:`, error);
        // Melempar ulang error agar komponen yang memanggil bisa menangani (misalnya, menampilkan notifikasi)
        throw error;
    }
};

// Implementasi API yang diekspor menggunakan fetch
export const api = {
    ping: (): Promise<{ success: boolean; source: string; }> => apiCall('ping'),
    login: (email: string, password: string): Promise<ApiResponse<AuthUser>> => apiCall('login', email, password),
    logout: (): Promise<{ success: boolean }> => apiCall('logout'),
    checkAuth: (): Promise<ApiResponse<AuthUser>> => apiCall('checkAuth'),
    getDashboardStats: (): Promise<DashboardStats> => apiCall('getDashboardStats'),
    listSurat: (type: MailType, filters: Filters): Promise<Surat[]> => apiCall('listSurat', type, filters),
    createSurat: (type: MailType, data: Partial<Surat>): Promise<{ success: boolean }> => apiCall('createSurat', type, data),
    updateSurat: (type: MailType, id: string, data: Partial<Surat>): Promise<{ success: boolean }> => apiCall('updateSurat', type, id, data),
    deleteSurat: (type: MailType, id: string): Promise<{ success: boolean }> => apiCall('deleteSurat', type, id),
    getNewNomorSurat: (): Promise<string> => apiCall('getNewNomorSurat'),
    updateUserProfile: (data: Partial<UserProfile>): Promise<ApiResponse<AuthUser>> => apiCall('updateUserProfile', data),
};
