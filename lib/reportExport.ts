import { Report, ReportCategory, ReportStatus } from '../types';

export interface ReportExportData {
  headers: string[];
  rows: (string | number)[][];
  title: string;
  subtitle: string;
}

export const generateReportExportData = (
  reports: Report[],
  format: 'csv' | 'pdf' | 'excel' = 'csv'
): ReportExportData => {
  const headers = ["ID", "Petugas", "Kategori", "Lokasi", "Deskripsi", "Status", "Waktu", "Catatan"];
  
  const rows = reports.map(r => [
    r.id,
    r.userName,
    r.category,
    r.location,
    `"${r.description}"`,
    r.status,
    new Date(r.createdAt).toLocaleString(),
    `\"${r.feedback || ''}\"`
  ]);

  return {
    headers,
    rows,
    title: 'Laporan PPSU Kelurahan',
    subtitle: `Diekspor pada ${new Date().toLocaleString()} - Jumlah: ${reports.length} laporan`
  };
};

export const filterReports = (
  reports: Report[],
  status?: ReportStatus,
  category?: ReportCategory,
  dateRange?: { start: Date | null; end: Date | null },
  petugasId?: string
): Report[] => {
  return reports.filter(report => {
    if (status && report.status !== status) return false;
    
    if (category && report.category !== category) return false;
    
    if (dateRange) {
      const reportDate = new Date(report.createdAt);
      if (dateRange.start && reportDate < dateRange.start) return false;
      if (dateRange.end && reportDate > dateRange.end) return false;
    }
    
    if (petugasId && report.userId !== petugasId) return false;
    
    return true;
  });
};

export const calculateReportStats = (reports: Report[]) => {
  const total = reports.length;
  const pending = reports.filter(r => r.status === ReportStatus.PENDING).length;
  const accepted = reports.filter(r => r.status === ReportStatus.ACCEPTED).length;
  const rejected = reports.filter(r => r.status === ReportStatus.REJECTED).length;
  
  const categoryStats: Record<string, number> = {};
  Object.values(ReportCategory).forEach(cat => {
    categoryStats[cat] = reports.filter(r => r.category === cat).length;
  });
  
  const userStats: Record<string, { total: number; accepted: number; rejected: number }> = {};
  reports.forEach(report => {
    if (!userStats[report.userId]) {
      userStats[report.userId] = { total: 0, accepted: 0, rejected: 0 };
    }
    userStats[report.userId].total++;
    if (report.status === ReportStatus.ACCEPTED) userStats[report.userId].accepted++;
    if (report.status === ReportStatus.REJECTED) userStats[report.userId].rejected++;
  });
  
  return {
    total,
    pending,
    accepted,
    rejected,
    categoryStats,
    userStats
  };
};