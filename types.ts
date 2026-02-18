
export type ROA_Type = 'AL' | 'EL' | 'MC' | 'ABS' | 'HP';
export type ShiftType = 'A' | 'B' | 'C' | 'D';

export interface Absence {
  type: ROA_Type;
  count: number;
}

export interface Employee {
  id: string;
  name: string;
  absences: Absence[];
}

export interface MonthlyReport {
  id: string;
  month: string;
  year: string;
  shift: ShiftType;
  fileName: string;
  uploadDate: number;
  data: Employee[];
}

export const ROA_OPTIONS: ROA_Type[] = ['AL', 'EL', 'MC', 'ABS', 'HP'];
export const SHIFT_OPTIONS: ShiftType[] = ['A', 'B', 'C', 'D'];

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const MONTH_SHORTS: Record<string, string> = {
  "January": "Jan", "February": "Feb", "March": "Mar", "April": "Apr", "May": "May", "June": "Jun",
  "July": "Jul", "August": "Aug", "September": "Sep", "October": "Oct", "November": "Nov", "December": "Dec"
};

export const YEARS = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

export type ViewType = 'dashboard' | 'upload' | 'extraction' | 'analysis' | 'analytics' | 'training';
