import React from 'react';
import { Report, ReportCategory, ReportStatus } from '../types';
import { calculateReportStats } from '../lib/reportExport';
import { BarChart3, CheckCircle, Clock, User, XCircle, FileText } from 'lucide-react';

interface ReportStatsProps {
  reports: Report[];
}

export const ReportStats: React.FC<ReportStatsProps> = ({ reports }) => {
  const stats = calculateReportStats(reports);

  const topCategories = Object.entries(stats.categoryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topUsers = Object.entries(stats.userStats)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileText className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Laporan</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
              <Clock className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Menunggu</p>
              <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Diterima</p>
              <p className="text-xl font-bold text-gray-900">{stats.accepted}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <XCircle className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Ditolak</p>
              <p className="text-xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-blue-600" size={20} />
          <h3 className="font-bold text-gray-900">Statistik Berdasarkan Kategori</h3>
        </div>
        
        <div className="space-y-3">
          {topCategories.map(([category, count]) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{category}</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(count / Math.max(stats.total, 1)) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-900 w-8">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <User className="text-green-600" size={20} />
          <h3 className="font-bold text-gray-900">Statistik Petugas</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 font-bold border-b border-gray-200">
                <th className="pb-3">Petugas</th>
                <th className="pb-3 text-right">Total</th>
                <th className="pb-3 text-right">Diterima</th>
                <th className="pb-3 text-right">Ditolak</th>
                <th className="pb-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topUsers.map(([userId, userStat]) => {
                const user = reports.find(r => r.userId === userId)?.userName || 'Petugas Tidak Dikenal';
                const acceptanceRate = userStat.total > 0 ? Math.round((userStat.accepted / userStat.total) * 100) : 0;
                
                return (
                  <tr key={userId} className="text-sm">
                    <td className="py-3 font-medium text-gray-900">{user}</td>
                    <td className="py-3 text-right">{userStat.total}</td>
                    <td className="py-3 text-right">{userStat.accepted}</td>
                    <td className="py-3 text-right">{userStat.rejected}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        acceptanceRate >= 80 ? 'bg-green-100 text-green-800' :
                        acceptanceRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {acceptanceRate}% diterima
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};