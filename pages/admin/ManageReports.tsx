import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ReportStatus, Report, Role } from '../../types';
import { Check, X, MapPin, Download, AlertTriangle, Eye, Calendar, User, Clock, FileText, ArrowUpDown, ChevronDown, Filter, Search, SlidersHorizontal } from 'lucide-react';
import { CATEGORY_COLORS, STATUS_COLORS } from '../../constants';
import jsPDF from 'jspdf';

type SortOption = 'NEWEST' | 'OLDEST' | 'STATUS';

export const ManageReports: React.FC = () => {
  const { reports, updateReportStatus, users } = useApp();
  const [filter, setFilter] = useState<ReportStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [petugasFilter, setPetugasFilter] = useState<string>('ALL');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  
  const [viewReport, setViewReport] = useState<Report | null>(null);

  const sortRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sortRef, exportRef]);

  const filteredReports = reports
    .filter(r => {
        if (filter !== 'ALL' && r.status !== filter) return false;

        if (petugasFilter !== 'ALL' && r.userId !== petugasFilter) return false;
        
        const reportDate = new Date(r.createdAt);
        reportDate.setHours(0,0,0,0);
        
        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0,0,0,0);
            if (reportDate < start) return false;
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(0,0,0,0);
            if (reportDate > end) return false;
        }

        return true;
    })
    .sort((a, b) => {
        if (sortBy === 'NEWEST') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'OLDEST') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === 'STATUS') return a.status.localeCompare(b.status);
        return 0;
    });

  const openRejectModal = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedReportId(id);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const openAcceptModal = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedReportId(id);
    setIsAcceptModalOpen(true);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReportId && rejectReason) {
      updateReportStatus(selectedReportId, ReportStatus.REJECTED, rejectReason);
      setIsRejectModalOpen(false);
      setSelectedReportId(null);
      setViewReport(null); 
    }
  };

  const handleConfirmAccept = () => {
    if (selectedReportId) {
      updateReportStatus(selectedReportId, ReportStatus.ACCEPTED);
      setIsAcceptModalOpen(false);
      setSelectedReportId(null);
      setViewReport(null); 
    }
  };

  const handleExport = (format: 'csv' | 'pdf' = 'csv') => {
    if (format === 'csv') {
      const headers = ["ID", "Petugas", "Kategori", "Lokasi", "Deskripsi", "Status", "Waktu", "Catatan"];
      const rows = filteredReports.map(r => [
        r.id,
        r.userName,
        r.category,
        r.location,
        `"${r.description}"`,
        r.status,
        new Date(r.createdAt).toLocaleString(),
        `"${r.feedback || ''}"`
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `laporan_ppsu_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text('Laporan PPSU Kelurahan', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      const dateText = startDate && endDate ? 
        `Periode: ${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}` :
        `Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID')}`;
      doc.text(dateText, 105, 30, { align: 'center' });
      
      doc.setFontSize(10);
      const headers = ["No", "Petugas", "Kategori", "Lokasi", "Deskripsi", "Status", "Tanggal"];
      const tableTop = 40;
      
      const pageWidth = doc.internal.pageSize.width;
      const margin = 10;
      const colWidths = [
        10,                    
        35,                    
        25,                    
        40,                    
        50,                    
        20,                    
        25                     
      ];
      
      let x = margin;
      headers.forEach((header, index) => {
        doc.setFillColor(230, 230, 230);
        doc.rect(x, tableTop, colWidths[index], 10, 'F');
        doc.setTextColor(0, 0, 0);
        doc.text(header, x + 2, tableTop + 6);
        x += colWidths[index];
      });
      
      let y = tableTop + 10;
      filteredReports.forEach((report, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
          
          let headerX = margin;
          headers.forEach((header, headerIndex) => {
            doc.setFillColor(230, 230, 230);
            doc.rect(headerX, y - 10, colWidths[headerIndex], 10, 'F');
            doc.setTextColor(0, 0, 0);
            doc.text(header, headerX + 2, y - 4);
            headerX += colWidths[headerIndex];
          });
          y = 20;
        }
        
        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(margin, y, pageWidth - 2 * margin, 10, 'F');
        }
        
        doc.setTextColor(0, 0, 0);
        x = margin;
        
        doc.text((index + 1).toString(), x + 2, y + 6);
        x += colWidths[0];

        doc.text(report.userName, x + 2, y + 6);
        x += colWidths[1];

        doc.text(report.category, x + 2, y + 6);
        x += colWidths[2];

        const truncatedLocation = doc.splitTextToSize(report.location, colWidths[3] - 4);
        doc.text(truncatedLocation, x + 2, y + 6);
        x += colWidths[3];

        const truncatedDesc = doc.splitTextToSize(report.description, colWidths[4] - 4);
        doc.text(truncatedDesc, x + 2, y + 6);
        x += colWidths[4];
        

        if (report.status === ReportStatus.ACCEPTED) {
          doc.setTextColor(0, 128, 0);
        } else if (report.status === ReportStatus.PENDING) {
          doc.setTextColor(255, 165, 0);
        } else if (report.status === ReportStatus.REJECTED) {
          doc.setTextColor(255, 0, 0);
        }
        doc.text(report.status, x + 2, y + 6);
        doc.setTextColor(0, 0, 0);
        x += colWidths[5];
        
        doc.text(new Date(report.createdAt).toLocaleDateString('id-ID'), x + 2, y + 6);
        
        y += 10;
      });
      
      y += 20;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Ringkasan Data', margin, y);
      
      y += 8;
      doc.setFontSize(12);
      doc.text(`Total Laporan: ${filteredReports.length}`, margin, y);
      
      y += 6;
      doc.text(`Laporan Disetujui: ${filteredReports.filter(r => r.status === ReportStatus.ACCEPTED).length}`, margin, y);
      
      y += 6;
      doc.text(`Laporan Ditolak: ${filteredReports.filter(r => r.status === ReportStatus.REJECTED).length}`, margin, y);
      
      y += 6;
      doc.text(`Laporan Menunggu: ${filteredReports.filter(r => r.status === ReportStatus.PENDING).length}`, margin, y);
      
      doc.save(`laporan_ppsu_${new Date().toISOString().slice(0,10)}.pdf`);
    }
  };

  const handleSortSelect = (option: SortOption) => {
    setSortBy(option);
    setIsSortOpen(false);
  };

  const petugasList = users.filter(u => u.role === Role.PETUGAS);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 md:pb-0">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-end">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Kelola Laporan</h2>
                <p className="text-gray-500 mt-1">Pantau dan verifikasi laporan kinerja petugas.</p>
            </div>
            
            <div className="relative" ref={exportRef}>
              <button 
                  onClick={() => setIsExportOpen(!isExportOpen)}
                  className="bg-green-600 text-white px-4 py-2.5 rounded-xl shadow-sm hover:bg-green-700 flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-95"
              >
                  <Download size={16} /> <span className="hidden md:inline">Export Data</span>
              </button>
              
              {isExportOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <button 
                    onClick={() => { handleExport('csv'); setIsExportOpen(false); }}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 border-b border-gray-100 flex items-center gap-2"
                  >
                    <Download size={16} /> Ekspor ke CSV
                  </button>
                  <button 
                    onClick={() => { handleExport('pdf'); setIsExportOpen(false); }}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 flex items-center gap-2"
                  >
                    <Download size={16} /> Ekspor ke PDF
                  </button>
                </div>
              )}
            </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col xl:flex-row gap-5">
            <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto no-scrollbar flex-shrink-0">
              {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${filter === f ? 'bg-white text-orange-600 shadow-md transform scale-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                >
                  {f === 'ALL' ? 'Semua' : f}
                </button>
              ))}
            </div>

            <div className="w-px h-auto bg-gray-200 hidden xl:block mx-2"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                <div className="relative group">
                    <User className="absolute left-3 top-3 text-gray-400 group-hover:text-orange-500 transition-colors" size={16} />
                    <select
                        value={petugasFilter}
                        onChange={(e) => setPetugasFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all appearance-none cursor-pointer text-gray-700 font-medium"
                    >
                        <option value="ALL">Semua Petugas</option>
                        {petugasList.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
                </div>

                <div className="relative group">
                    <div className="absolute left-3 top-2.5 text-gray-400 font-bold text-[10px] uppercase pointer-events-none">Dari</div>
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full pl-3 pr-3 pt-5 pb-1 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-gray-800 font-medium h-[42px]"
                    />
                </div>

                <div className="relative group">
                    <div className="absolute left-3 top-2.5 text-gray-400 font-bold text-[10px] uppercase pointer-events-none">Sampai</div>
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full pl-3 pr-3 pt-5 pb-1 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-gray-800 font-medium h-[42px]"
                    />
                </div>
            </div>

            <div className="relative" ref={sortRef}>
                <button 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="w-full xl:w-auto bg-white border border-gray-200 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-orange-200 hover:text-orange-600 transition-colors h-full"
                >
                    <ArrowUpDown size={16} />
                    <span>{sortBy === 'NEWEST' ? 'Terbaru' : sortBy === 'OLDEST' ? 'Terlama' : 'Status'}</span>
                </button>
                {isSortOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="p-1">
                        <button onClick={() => handleSortSelect('NEWEST')} className={`w-full text-left px-3 py-2 text-xs rounded-lg ${sortBy === 'NEWEST' ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>Terbaru</button>
                        <button onClick={() => handleSortSelect('OLDEST')} className={`w-full text-left px-3 py-2 text-xs rounded-lg ${sortBy === 'OLDEST' ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>Terlama</button>
                        <button onClick={() => handleSortSelect('STATUS')} className={`w-full text-left px-3 py-2 text-xs rounded-lg ${sortBy === 'STATUS' ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>Status</button>
                      </div>
                  </div>
                )}
            </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredReports.map(report => (
          <div 
            key={report.id} 
            onClick={() => setViewReport(report)}
            className="group bg-white rounded-2xl p-3 border border-gray-200 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all cursor-pointer flex flex-col md:flex-row gap-4 md:items-center"
          >
            <div className="relative w-full md:w-32 h-32 md:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
              <img
                src={report.imageUrl && report.imageUrl.startsWith('data:') ? report.imageUrl : report.imageUrl ?
                  `${report.imageUrl}?status=${report.status}&t=${new Date(report.createdAt).getTime()}&f=${report.feedback || 'none'}` : ''}
                alt="Bukti"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
            </div>
            
            <div className="flex-1 flex flex-col gap-1">
               <div className="flex justify-between items-start">
                   <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${CATEGORY_COLORS[report.category]}`}>
                        {report.category}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(report.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'})}
                      </span>
                   </div>
               </div>
               
               <h3 className="text-base font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                  {report.description}
               </h3>
               
               <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-xs text-gray-500 mt-1">
                   <div className="flex items-center gap-1.5">
                      <User size={14} className="text-gray-400" />
                      <span className="font-medium text-gray-700">{report.userName}</span>
                   </div>
                   <div className="hidden md:block w-1 h-1 bg-gray-300 rounded-full"></div>
                   <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="truncate max-w-[200px]">{report.location}</span>
                   </div>
               </div>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 border-gray-100 pt-3 md:pt-0 pl-0 md:pl-4 md:border-l md:border-gray-100 min-w-[140px]">
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${report.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : report.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {report.status}
                </div>
                
                {report.status === ReportStatus.PENDING ? (
                   <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                       <button 
                         onClick={(e) => openRejectModal(report.id, e)}
                         className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm"
                         title="Tolak"
                       >
                           <X size={18} />
                       </button>
                       <button 
                         onClick={(e) => openAcceptModal(report.id, e)}
                         className="w-9 h-9 flex items-center justify-center rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm shadow-green-200 transition-transform active:scale-95"
                         title="Terima"
                       >
                           <Check size={18} />
                       </button>
                   </div>
                ) : (
                    <button className="text-xs font-bold text-gray-400 flex items-center gap-1 hover:text-gray-600 transition-colors">
                        <Eye size={14} /> Lihat Detail
                    </button>
                )}
            </div>
          </div>
        ))}
        {filteredReports.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
               <SlidersHorizontal className="text-gray-300" size={32} />
            </div>
            <h3 className="text-gray-900 font-bold mb-1">Tidak ada data</h3>
            <p className="text-gray-500 text-sm">Coba sesuaikan filter pencarian Anda.</p>
          </div>
        )}
      </div>

      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
            <div className="bg-red-50 p-6 border-b border-red-100 flex items-start gap-4">
                <div className="bg-red-100 p-2 rounded-full text-red-600">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-red-900">Tolak Laporan</h3>
                    <p className="text-sm text-red-700 mt-1">Tindakan ini akan mengembalikan status laporan ke petugas untuk diperbaiki.</p>
                </div>
            </div>
            <div className="p-6">
                <form onSubmit={handleConfirmReject}>
                <label className="block text-sm font-bold text-gray-700 mb-2">Alasan Penolakan <span className="text-red-500"> *</span></label>
                <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-red-50 focus:border-red-500 outline-none text-sm min-h-[120px] text-gray-900 bg-white placeholder:text-gray-400 resize-none transition-shadow"
                    placeholder="Jelaskan secara spesifik apa yang perlu diperbaiki (contoh: Foto terlalu gelap, Lokasi kurang akurat)..."
                    required
                    autoFocus
                ></textarea>
                <div className="flex gap-3 mt-8">
                    <button
                    type="button"
                    onClick={() => setIsRejectModalOpen(false)}
                    className="flex-1 py-3 text-gray-700 font-bold text-sm bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                    Batal
                    </button>
                    <button
                    type="submit"
                    className="flex-1 py-3 text-white font-bold text-sm bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-200 transition-transform active:scale-[0.98]"
                    >
                    Tolak Laporan
                    </button>
                </div>
                </form>
            </div>
          </div>
        </div>
      )}

      {isAcceptModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-8 scale-100 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 mx-auto border-4 border-green-50 shadow-inner">
               <Check size={32} strokeWidth={3} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Terima Laporan?</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Pastikan data laporan sudah valid. Status akan diubah menjadi <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">DITERIMA</span> dan tidak dapat diubah kembali.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsAcceptModalOpen(false)}
                className="flex-1 py-3 text-gray-700 font-bold text-sm bg-white border border-gray-200 hover:bg-gray-50 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmAccept}
                className="flex-1 py-3 text-white font-bold text-sm bg-green-600 hover:bg-green-700 rounded-xl shadow-lg shadow-green-200 transition-transform active:scale-[0.98]"
              >
                Ya, Terima
              </button>
            </div>
          </div>
        </div>
      )}

      {viewReport && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                 <div>
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                       Detail Laporan
                       <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-md"></span>
                    </h3>
                 </div>
                 <button 
                   onClick={() => setViewReport(null)}
                   className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                 >
                   <X size={18} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-0 md:flex bg-gray-50">
                 <div className="w-full md:w-3/5 bg-black flex items-center justify-center relative min-h-[400px]">
                    <img
                      src={viewReport.imageUrl && viewReport.imageUrl.startsWith('data:') ? viewReport.imageUrl : viewReport.imageUrl ? `${viewReport.imageUrl}?status=${viewReport.status}&t=${new Date(viewReport.createdAt).getTime()}&f=${viewReport.feedback || 'none'}` : ''}
                      alt="Full Evidence"
                      className="w-full h-full object-contain max-h-[600px]"
                    />
                 </div>

                 <div className="w-full md:w-2/5 p-6 md:p-8 space-y-8 bg-white overflow-y-auto">
                    <div className="flex justify-between items-center">
                        <span className={`text-xs px-3 py-1.5 rounded-lg font-bold tracking-wide uppercase ${CATEGORY_COLORS[viewReport.category]}`}>
                           {viewReport.category}
                        </span>
                        <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-bold border ${viewReport.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : viewReport.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            <div className={`w-2 h-2 rounded-full ${viewReport.status === 'PENDING' ? 'bg-yellow-500' : viewReport.status === 'ACCEPTED' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                           {viewReport.status}
                        </span>
                    </div>

                    <div>
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Deskripsi</label>
                       <h2 className="text-lg font-bold text-gray-900 leading-relaxed">{viewReport.description}</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="flex gap-4 items-start">
                             <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                                <User size={20} />
                             </div>
                             <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Petugas</p>
                                <p className="font-bold text-gray-800">{viewReport.userName}</p>
                             </div>
                        </div>

                        <div className="flex gap-4 items-start">
                             <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                                <MapPin size={20} />
                             </div>
                             <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Lokasi</p>
                                <p className="font-medium text-gray-800">{viewReport.location}</p>
                             </div>
                        </div>

                        <div className="flex gap-4 items-start">
                             <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                                <Calendar size={20} />
                             </div>
                             <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Waktu Laporan</p>
                                <p className="font-medium text-gray-800">{new Date(viewReport.createdAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p className="text-sm text-gray-500">{new Date(viewReport.createdAt).toLocaleTimeString('id-ID')}</p>
                             </div>
                        </div>
                    </div>

                    {viewReport.feedback && (
                      <div className="bg-red-50 border border-red-100 p-5 rounded-2xl animate-in fade-in slide-in-from-bottom-4">
                         <div className="flex items-center gap-2 text-red-700 font-bold mb-2">
                            <AlertTriangle size={18} /> Alasan Penolakan
                         </div>
                         <p className="text-sm text-red-600 leading-relaxed">{viewReport.feedback}</p>
                      </div>
                    )}
                 </div>
              </div>

              {viewReport.status === ReportStatus.PENDING && (
                 <div className="p-5 border-t border-gray-100 bg-white flex gap-4 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)] z-20">
                    <button 
                      onClick={(e) => openRejectModal(viewReport.id, e)}
                      className="flex-1 bg-white text-red-600 border border-red-200 py-3.5 rounded-xl font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <X size={18} /> Tolak
                    </button>
                    <button 
                      onClick={(e) => openAcceptModal(viewReport.id, e)}
                      className="flex-[2] bg-green-600 text-white py-3.5 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-200"
                    >
                      <Check size={18} /> Terima Laporan
                    </button>
                 </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};