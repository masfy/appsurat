
// Global declarations for environment-specific variables
declare global {
    // For Google Apps Script environment
    namespace google {
        namespace script {
            interface Runner {
                withSuccessHandler(handler: (value: any) => void): Runner;
                withFailureHandler(handler: (error: Error) => void): Runner;
                [functionName: string]: (...args: any[]) => void;
            }
            const run: Runner;
        }
    }

    // Polyfill for global object
    var global: any;
}


export type Theme = 'light' | 'dark';
export type MailType = 'masuk' | 'keluar';
export type View = 'dashboard' | 'surat-masuk' | 'surat-keluar' | 'profile' | 'login';

export interface AuthUser {
    ID: string;
    Email: string;
    Nama: string;
    Jabatan: string;
    Unit: string;
    'Foto URL'?: string;
}

// UserProfile is used for forms, might not have all fields from AuthUser
export interface UserProfile {
    Nama: string;
    Jabatan: string;
    Unit: string;
    'Foto URL'?: string;
    photoFile?: UploadedFile;
}

export interface UploadedFile {
    fileName: string;
    mimeType: string;
    base64Data: string;
}

export interface SuratBase {
    ID: string;
    'Nomor Surat': string;
    'Tanggal Surat': string;
    Perihal: string;
    Keterangan?: string;
    'File URL'?: string;
    file?: UploadedFile;
}

export interface SuratMasuk extends SuratBase {
    'Tanggal Diterima': string;
    'Asal Surat': string;
    Status: 'Belum Disposisi' | 'Sudah Disposisi' | 'Diarsipkan';
}

export interface SuratKeluar extends SuratBase {
    'Tujuan Surat': string;
    Status: 'Draf' | 'Terkirim' | 'Diarsipkan';
}

export type Surat = SuratMasuk | SuratKeluar;

export interface DashboardStats {
    totalMasuk: number;
    totalKeluar: number;
    masukBulanIni: number;
    keluarBulanIni: number;
    belumDisposisi: number;
}

export interface NotificationMessage {
    message: string;
    type: 'success' | 'error' | 'info';
}

export interface Filters {
    searchTerm?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
}
