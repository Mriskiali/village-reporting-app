import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORY_COLORS, STATUS_COLORS } from '../../constants';
import { Filter, RotateCcw, AlertTriangle, ChevronDown, Calendar, Layers, CheckCircle, Clock, MapPin, X } from 'lucide-react';
import { Report, ReportStatus, ReportCategory } from '../../types';

export const PetugasHistory: React.FC<{ navigate?: (p: string) => void }> = ({ navigate }) => {
  const { reports, auth, setActiveDraft } = useApp();
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | 'ALL'>('ALL');
  const [dateFilter, setDateFilter] = useState('');
  
  const [displayCount, setDisplayCount] = useState(10);

  const myReports = reports.filter(r => r.userId === auth.user?.id);

  const filteredReports = myReports.filter(report => {
    if (statusFilter !== 'ALL' && report.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && report.category !== categoryFilter) return false;
    if (dateFilter) {
       const rDate = new Date(report.createdAt).toISOString().split('T')[0];
       if (rDate !== dateFilter) return false;
    }
    return true;
  });

  const groupedReports = filteredReports.slice(0, displayCount).reduce((groups, report) => {
    const date = new Date(report.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateKey = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    
    if (date.toDateString() === today.toDateString()) dateKey = "Hari Ini";
    else if (date.toDateString() === yesterday.toDateString()) dateKey = "Kemarin";

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(report);
    return groups;
  }, {} as Record<string, Report[]>);

  const hasMore = displayCount < filteredReports.length;

  const handleFixReport = (report: Report) => {
    setActiveDraft(report);
    if (navigate) navigate('petugas-create');
  };

  const clearFilters = () => {
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setDateFilter('');
    setIsFilterOpen(false);
  };

  const activeFilterCount = (statusFilter !== 'ALL' ? 1 : 0) + (categoryFilter !== 'ALL' ? 1 : 0) + (dateFilter ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center sticky top-0 bg-gray-50/95 backdrop-blur-sm py-2 z-10">
        <div>
           <h2 className="text-xl font-bold text-gray-900">Riwayat Laporan</h2>
           <p className="text-xs text-gray-500">Pantau status laporan kinerja Anda.</p>
        </div>
        <button 
          onClick={() => setIsFilterOpen(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm border text-xs font-bold transition-all active:scale-95 ${activeFilterCount > 0 ? 'bg-orange-600 text-white border-orange-600 shadow-orange-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'}`}
        >
           <Filter size={14} /> 
           Filter {activeFilterCount > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">{activeFilterCount}</span>}
        </button>
      </div>

      <div className="space-y-6 pb-20">
        {filteredReports.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 mx-2 shadow-sm">
             <div className="text-gray-200 mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-gray-50">
               <Layers size={32} />
             </div>
             <h3 className="font-bold text-gray-800">Tidak ada laporan</h3>
             <p className="text-gray-400 text-xs mt-1 max-w-[200px] text-center">Laporan yang Anda buat akan muncul di sini.</p>
             {activeFilterCount > 0 && (
               <button onClick={clearFilters} className="text-orange-600 text-sm font-bold mt-4 hover:underline">
                 Hapus Filter
               </button>
             )}
           </div>
        ) : (
          Object.keys(groupedReports).map((dateKey) => (
             <div key={dateKey} className="animate-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-3 mb-3 px-1">
                   <div className="h-px bg-gray-200 flex-1"></div>
                   <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2">{dateKey}</span>
                   <div className="h-px bg-gray-200 flex-1"></div>
                </div>
                
                <div className="space-y-3">
                   {groupedReports[dateKey].map(report => (
                     <div 
                        key={report.id} 
                        className={`bg-white rounded-xl shadow-sm border overflow-hidden relative group transition-all duration-300 ${
                            report.status === 'REJECTED' 
                            ? 'border-red-200 shadow-red-100' 
                            : 'border-gray-200 hover:shadow-md'
                        }`}
                     >
                        {/* Status Strip */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                            report.status === 'PENDING' ? 'bg-yellow-400' :
                            report.status === 'ACCEPTED' ? 'bg-green-500' :
                            'bg-red-500'
                        }`}></div>

                        <div className="pl-5 p-4 flex gap-4">
                           {/* Image */}
                           <div className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden relative">
                              <img src={report.imageUrl && report.imageUrl.startsWith('data:') ? report.imageUrl : report.imageUrl ? `${report.imageUrl}?status=${report.status}&t=${new Date(report.createdAt).getTime()}&f=${report.feedback || 'none'}` : ''} alt="" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                           </div>

                           <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wide ${CATEGORY_COLORS[report.category]}`}>
                                    {report.category}
                                  </span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                                      report.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' :
                                      report.status === 'ACCEPTED' ? 'bg-green-50 text-green-700' :
                                      'bg-red-50 text-red-700'
                                  }`}>
                                     {report.status === 'PENDING' && <Clock size={10} />}
                                     {report.status === 'ACCEPTED' && <CheckCircle size={10} />}
                                     {report.status === 'REJECTED' && <AlertTriangle size={10} />}
                                     {report.status}
                                  </span>
                              </div>
                              
                              <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1 truncate">{report.description}</h3>
                              
                              <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                                 <MapPin size={12} className="text-gray-400" />
                                 <span className="truncate">{report.location}</span>
                              </div>
                              
                              <p className="text-[10px] text-gray-400 font-medium">
                                 {new Date(report.createdAt).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} WIB
                              </p>
                           </div>
                        </div>

                        {/* Rejected Action Area */}
                        {report.status === ReportStatus.REJECTED && (
                          <div className="px-4 pb-4 pt-0 pl-5">
                             {report.feedback && (
                                <div className="bg-red-50 p-2.5 rounded-lg mb-2 text-xs text-red-700 border border-red-100 flex gap-2 items-start">
                                   <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                                   <span>{report.feedback}</span>
                                </div>
                             )}
                             <button 
                               onClick={() => handleFixReport(report)}
                               className="w-full bg-red-600 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-red-200 active:scale-95 transition-transform animate-pulse"
                             >
                               <RotateCcw size={14} /> PERBAIKI & KIRIM ULANG
                             </button>
                          </div>
                        )}
                     </div>
                   ))}
                </div>
             </div>
          ))
        )}

        {hasMore && (
          <button 
            onClick={() => setDisplayCount(prev => prev + 5)}
            className="w-full py-4 bg-white text-gray-500 font-bold text-sm rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
          >
            <ChevronDown size={16} /> Tampilkan Lebih Banyak
          </button>
        )}
      </div>

      {/* Filter Modal / Bottom Sheet */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in backdrop-blur-sm">
          <div className="bg-white w-full md:max-w-sm rounded-t-3xl md:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Filter Laporan</h3>
                <button onClick={() => setIsFilterOpen(false)} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200"><X size={18} /></button>
             </div>

             <div className="space-y-6">
                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Status Laporan</label>
                  <div className="flex flex-wrap gap-2">
                    {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'].map(s => (
                       <button
                         key={s}
                         onClick={() => setStatusFilter(s as any)}
                         className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                             statusFilter === s 
                             ? 'bg-orange-50 border-orange-500 text-orange-600 shadow-sm' 
                             : 'border-gray-200 text-gray-500 hover:border-gray-300'
                         }`}
                       >
                         {s === 'ALL' ? 'Semua' : s}
                       </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Kategori Pekerjaan</label>
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as any)}
                    className="w-full p-3.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 bg-gray-50 focus:bg-white focus:border-orange-500 outline-none transition-colors appearance-none"
                  >
                    <option value="ALL">Semua Kategori</option>
                    {Object.values(ReportCategory).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                   <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Tanggal Laporan</label>
                   <div className="relative">
                      <input 
                        type="date" 
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full p-3.5 pl-11 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 bg-gray-50 focus:bg-white focus:border-orange-500 outline-none transition-colors"
                      />
                      <Calendar className="absolute left-4 top-3.5 text-gray-400" size={18} />
                   </div>
                </div>

                <div className="pt-4 flex gap-3">
                   <button 
                     onClick={clearFilters}
                     className="flex-1 py-3.5 text-gray-600 font-bold text-sm bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                   >
                     Reset
                   </button>
                   <button 
                     onClick={() => setIsFilterOpen(false)}
                     className="flex-1 py-3.5 text-white font-bold text-sm bg-orange-600 rounded-xl hover:bg-orange-700 shadow-lg shadow-orange-200 transition-transform active:scale-95"
                   >
                     Terapkan Filter
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};