import React from 'react';
import { useApp } from '../../context/AppContext';
import { ReportStatus, Role } from '../../types';
import { STATUS_COLORS } from '../../constants';
import { Plus, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export const PetugasHome: React.FC<{ navigate: (p: string) => void }> = ({ navigate }) => {
  const { auth, reports } = useApp();
  
  const myReports = reports.filter(r => r.userId === auth.user?.id);
  const pending = myReports.filter(r => r.status === ReportStatus.PENDING).length;
  const accepted = myReports.filter(r => r.status === ReportStatus.ACCEPTED).length;
  const rejected = myReports.filter(r => r.status === ReportStatus.REJECTED).length;
  const todayReports = myReports.filter(r => {
    const reportDate = new Date(r.createdAt).toDateString();
    const today = new Date().toDateString();
    return reportDate === today;
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-1">Halo, {auth.user?.name.split(' ')[0]}!</h2>
          <p className="text-orange-100 text-sm mb-4">Siap untuk melaporkan pekerjaan hari ini?</p>
          <button 
            onClick={() => navigate('petugas-create')}
            className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-sm active:scale-95 transition-transform"
          >
            <Plus size={18} />
            Buat Laporan Baru
          </button>
        </div>
        {/* Decor */}
        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* Stats Cards */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Ringkasan Kinerja</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mb-2">
              <Clock size={16} />
            </div>
            <span className="text-xl font-bold text-gray-800">{pending}</span>
            <span className="text-[10px] text-gray-500">Pending</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-2">
              <CheckCircle size={16} />
            </div>
            <span className="text-xl font-bold text-gray-800">{accepted}</span>
            <span className="text-[10px] text-gray-500">Diterima</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-2">
              <XCircle size={16} />
            </div>
            <span className="text-xl font-bold text-gray-800">{rejected}</span>
            <span className="text-[10px] text-gray-500">Ditolak</span>
          </div>
        </div>
      </div>

      {/* Today's Activity */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-800">Laporan Hari Ini</h3>
          <button 
            onClick={() => navigate('petugas-history')}
            className="text-xs text-orange-600 font-medium flex items-center gap-1"
          >
            Lihat Semua <ArrowRight size={12} />
          </button>
        </div>
        
        {todayReports.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-300">
            <p className="text-gray-400 text-sm">Belum ada laporan hari ini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayReports.map(report => (
              <div key={report.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex gap-3">
                <img src={report.imageUrl && report.imageUrl.startsWith('data:') ? report.imageUrl : report.imageUrl ? `${report.imageUrl}?status=${report.status}&t=${new Date(report.createdAt).getTime()}&f=${report.feedback || 'none'}` : ''} className="w-16 h-16 rounded-lg object-cover bg-gray-200" alt="Work" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                     <h4 className="font-medium text-sm text-gray-900 truncate">{report.category}</h4>
                     <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[report.status]}`}>
                       {report.status}
                     </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{report.description}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(report.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};