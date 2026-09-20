import React from 'react';
import { useApp } from '../../context/AppContext';
import { ReportStatus, Role } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, FileText, AlertCircle, Clock } from 'lucide-react';
import { STATUS_COLORS } from '../../constants';

export const AdminDashboard: React.FC = () => {
  const { reports, users } = useApp();

  const totalReports = reports.length;
  const pendingReports = reports.filter(r => r.status === ReportStatus.PENDING).length;
  const totalPetugas = users.filter(u => u.role === Role.PETUGAS).length;

  const data = [
    { name: 'Pending', value: pendingReports, color: '#d97706' },
    { name: 'Diterima', value: reports.filter(r => r.status === ReportStatus.ACCEPTED).length, color: '#16a34a' },
    { name: 'Ditolak', value: reports.filter(r => r.status === ReportStatus.REJECTED).length, color: '#dc2626' },
  ];

  const officersWithLastReport = users
    .filter(u => u.role === Role.PETUGAS)
    .map(user => {
        const userReports = reports
            .filter(r => r.userId === user.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        return {
            user,
            lastReport: userReports[0] || null
        };
    })
    .sort((a, b) => {
        if (!a.lastReport) return 1;
        if (!b.lastReport) return -1;
        return new Date(b.lastReport.createdAt).getTime() - new Date(a.lastReport.createdAt).getTime();
    });

  const officerStats = users
    .filter(u => u.role === Role.PETUGAS)
    .map(user => ({
      name: user.name,
      total: reports.filter(r => r.userId === user.id).length,
      avatar: user.avatarUrl
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      {/* Stats Cards - High Contrast */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-800 rounded-lg">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Total Laporan</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalReports}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-yellow-100 text-yellow-800 rounded-lg">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Perlu Review</p>
            <h3 className="text-2xl font-bold text-gray-900">{pendingReports}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-800 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Petugas Aktif</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalPetugas}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Statistik Laporan</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontWeight: 600}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#4b5563'}} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

           {/* Total Reports Per Officer */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">Total Laporan per Petugas</h3>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[300px] p-0 no-scrollbar">
                  <div className="divide-y divide-gray-100">
                      {officerStats.map((stat, idx) => (
                          <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50">
                              <div className="flex items-center gap-3">
                                  <div className="relative">
                                     <img src={stat.avatar} alt={stat.name} className="w-10 h-10 rounded-full bg-gray-200 border border-gray-100" />
                                     <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold flex items-center justify-center border border-white">
                                        #{idx + 1}
                                     </div>
                                  </div>
                                  <p className="text-sm font-bold text-gray-900">{stat.name}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                  <span className="text-lg font-bold text-orange-700">{stat.total}</span>
                                  <span className="text-xs font-medium text-gray-500">Laporan</span>
                              </div>
                          </div>
                      ))}
                      {officerStats.length === 0 && (
                          <div className="p-8 text-center text-gray-500 text-sm">Belum ada data petugas.</div>
                      )}
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Officer Status List (Latest Activity) */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">Status Terkini Petugas</h3>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[300px] p-0 no-scrollbar">
                  {officersWithLastReport.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                          {officersWithLastReport.map(({ user, lastReport }) => (
                              <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                  <div className="flex items-center gap-3">
                                      <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full bg-gray-200 border border-gray-100" />
                                      <div>
                                          <p className="text-sm font-bold text-gray-900">{user.name}</p>
                                          {lastReport ? (
                                              <p className="text-xs text-gray-600 font-medium">Laporan terakhir: {new Date(lastReport.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                          ) : (
                                              <p className="text-xs text-gray-400 italic">Belum ada laporan</p>
                                          )}
                                      </div>
                                  </div>
                                  {lastReport ? (
                                      <div className="text-right">
                                           <span className={`text-[10px] px-2 py-1 rounded-full font-bold border border-transparent ${STATUS_COLORS[lastReport.status]}`}>
                                              {lastReport.status}
                                           </span>
                                           <p className="text-[10px] text-gray-500 font-semibold mt-1">{lastReport.category}</p>
                                      </div>
                                  ) : (
                                     <span className="text-[10px] bg-gray-100 text-gray-600 font-medium px-2 py-1 rounded-full border border-gray-200">Inactive</span>
                                  )}
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="p-8 text-center text-gray-500 text-sm">Belum ada data petugas.</div>
                  )}
              </div>
          </div>

          {/* Recent Activity Feed (All) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Aktivitas Laporan Terbaru</h3>
            </div>
            <div className="divide-y divide-gray-100 flex-1 overflow-y-auto max-h-[300px] no-scrollbar">
              {reports.slice(0, 5).map(report => (
                <div key={report.id} className="p-4 flex gap-4 items-center hover:bg-gray-50">
                  <img src={report.imageUrl && report.imageUrl.startsWith('data:') ? report.imageUrl : report.imageUrl ? `${report.imageUrl}?status=${report.status}&t=${new Date(report.createdAt).getTime()}&f=${report.feedback || 'none'}` : ''} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">
                      {report.userName} <span className="text-gray-500 font-medium">mengirim laporan</span> {report.category}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">{new Date(report.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${STATUS_COLORS[report.status]}`}>
                    {report.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
      </div>
    </div>
  );
};