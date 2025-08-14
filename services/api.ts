import { DashboardStats, MailType, Surat, Filters, AuthUser, UserProfile } from '../types';

// =================================================================
// HELPER & INTERFACES
// =================================================================

// Promisify the google.script.run calls for a modern async/await syntax
const serverCall = <T>(functionName: string, ...args: any[]): Promise<T> => {
    return new Promise((resolve, reject) => {
        google.script.run
            .withSuccessHandler((result: T) => resolve(result))
            .withFailureHandler(reject)
            [functionName](...args);
    });
};

interface ApiResponse<T> {
    success: boolean;
    user?: T;
    message?: string;
}

// =================================================================
// SERVER API (for deployed app on Google Apps Script)
// =================================================================

const serverApi = {
    ping: () => serverCall<{ success: boolean; source: string; }>('ping'),
    login: (email: string, password: string): Promise<ApiResponse<AuthUser>> => serverCall('login', email, password),
    logout: (): Promise<{ success: boolean }> => serverCall('logout'),
    checkAuth: (): Promise<ApiResponse<AuthUser>> => serverCall('checkAuth'),
    getDashboardStats: (): Promise<DashboardStats> => serverCall('getDashboardStats'),
    listSurat: (type: MailType, filters: Filters): Promise<Surat[]> => serverCall('listSurat', type, filters),
    createSurat: (type: MailType, data: Partial<Surat>): Promise<{ success: boolean }> => serverCall('createSurat', type, data),
    updateSurat: (type: MailType, id: string, data: Partial<Surat>): Promise<{ success: boolean }> => serverCall('updateSurat', type, id, data),
    deleteSurat: (type: MailType, id: string): Promise<{ success: boolean }> => serverCall('deleteSurat', type, id),
    getNewNomorSurat: (): Promise<string> => serverCall('getNewNomorSurat'),
    updateUserProfile: (data: Partial<UserProfile>): Promise<ApiResponse<AuthUser>> => serverCall('updateUserProfile', data),
};

// =================================================================
// MOCK API (for local development, `npm run dev`)
// =================================================================

const mockApi = {
    async ping() {
        console.log("MOCK API: PING");
        await new Promise(res => setTimeout(res, 200));
        return { success: true, source: 'Koneksi Lokal (Mock Data)' };
    },
    async login(email: string, password: string): Promise<ApiResponse<AuthUser>> {
        console.log("MOCK API: Logging in", { email, password });
        await new Promise(res => setTimeout(res, 500));
        if (email === 'admin@example.com' && password === 'admin123') {
            const user: AuthUser = {
                ID: 'user-1',
                Email: 'admin@example.com',
                Nama: 'Admin Lokal',
                Jabatan: 'Developer',
                Unit: 'IT',
                'Foto URL': `https://i.pravatar.cc/150?u=admin@example.com`,
            };
            return { success: true, user };
        }
        return { success: false, message: 'Email atau password salah.' };
    },
    async logout(): Promise<{ success: boolean }> {
        console.log("MOCK API: Logging out");
        return { success: true };
    },
    async checkAuth(): Promise<ApiResponse<AuthUser>> {
         // In a real local setup, this might check localStorage. For now, we assume not logged in.
        console.log("MOCK API: Checking auth status");
        return { success: false };
    },
    async getDashboardStats(): Promise<DashboardStats> {
        console.log("MOCK API: Fetching dashboard stats");
        await new Promise(res => setTimeout(res, 500));
        return {
            totalMasuk: 125,
            totalKeluar: 88,
            masukBulanIni: 15,
            keluarBulanIni: 9,
            belumDisposisi: 7,
        };
    },
    async listSurat(type: MailType, filters: Filters): Promise<Surat[]> {
        console.log("MOCK API: Listing surat", { type, filters });
        await new Promise(res => setTimeout(res, 500));
        return []; // Return empty for simplicity, or generate mock data
    },
    async createSurat(type: MailType, data: Partial<Surat>): Promise<{ success: boolean }> {
        console.log("MOCK API: Creating surat", { type, data });
        return { success: true };
    },
    async updateSurat(type: MailType, id: string, data: Partial<Surat>): Promise<{ success: boolean }> {
        console.log("MOCK API: Updating surat", { type, id, data });
        return { success: true };
    },
    async deleteSurat(type: MailType, id: string): Promise<{ success: boolean }> {
        console.log("MOCK API: Deleting surat", { type, id });
        return { success: true };
    },
    async getNewNomorSurat(): Promise<string> {
        console.log("MOCK API: Getting new nomor surat");
        return `MOCK/${new Date().getFullYear()}/001`;
    },
    async updateUserProfile(data: Partial<UserProfile>): Promise<ApiResponse<AuthUser>> {
        console.log("MOCK API: Updating user profile", { data });
        const updatedUser: AuthUser = {
            ID: 'user-1',
            Email: 'admin@example.com',
            Nama: data.Nama || 'Admin Lokal',
            Jabatan: data.Jabatan || 'Developer',
            Unit: data.Unit || 'IT',
            'Foto URL': data['Foto URL'] || `https://i.pravatar.cc/150?u=admin@example.com`,
        };
        return { success: true, user: updatedUser };
    },
};

// =================================================================
// EXPORT API
// =================================================================
// This is the magic: it checks if `google.script.run` exists.
// If it does, we're on the server, use `serverApi`.
// If not, we're in local development, use `mockApi`.
export const api = typeof google !== 'undefined' && google?.script?.run ? serverApi : mockApi;
