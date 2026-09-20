
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ReportCategory } from '../../types';
import MapPicker from '../../components/MapPicker';
import { Camera, MapPin, Send, AlertCircle, X, Check, Crosshair, Link as LinkIcon, Image as ImageIcon, Trash2, Map as MapIcon } from 'lucide-react';

export const CreateReport: React.FC<{ navigate: (p: string) => void }> = ({ navigate }) => {
  const { addReport, activeDraft, setActiveDraft, addNotification, auth } = useApp();
  const [loading, setLoading] = useState(false);
  
  const [showCamera, setShowCamera] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [draftId, setDraftId] = useState<string | undefined>(undefined);

  const [form, setForm] = useState({
    category: ReportCategory.KEBERSIHAN,
    description: '',
    location: '',
    image: null as string | null
  });

  const [imageUrlInput, setImageUrlInput] = useState('');

  const [errors, setErrors] = useState<{
      description?: string;
      location?: string;
      image?: string;
  }>({});

  useEffect(() => {
    if (activeDraft) {
      setDraftId(activeDraft.id);
      setForm({
        category: activeDraft.category || ReportCategory.KEBERSIHAN,
        description: activeDraft.description || '',
        location: activeDraft.location || '',
        image: activeDraft.imageUrl || null
      });
    }
  }, [activeDraft]);

  const handleCancelFix = () => {
     setActiveDraft(null);
     setDraftId(undefined);
     setForm({
        category: ReportCategory.KEBERSIHAN,
        description: '',
        location: '',
        image: null
     });
     setErrors({});
     if(auth.user) addNotification(auth.user.id, "Perbaikan laporan dibatalkan", "INFO");
  };

  const validateField = (field: string, value: string) => {
      let error = '';
      if (field === 'description') {
          if (value.length > 0 && value.length < 10) error = 'Deskripsi terlalu singkat (min 10 karakter)';
      }
      if (field === 'location') {
          if (value.length > 0 && value.length < 5) error = 'Lokasi harus jelas';
      }
      setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setForm(prev => ({ ...prev, description: val }));
      validateField('description', val);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setForm(prev => ({ ...prev, location: val }));
      validateField('location', val);
  };

  const startCamera = async () => {
      setShowCamera(true);
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
          }
      } catch (err) {
          alert("Gagal membuka kamera. Pastikan izin diberikan.");
          setShowCamera(false);
      }
  };

  const capturePhoto = () => {
      if (videoRef.current) {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0);
              const url = canvas.toDataURL('image/jpeg');
              setForm(prev => ({ ...prev, image: url }));
              setErrors(prev => ({ ...prev, image: undefined }));
              stopCamera();
          }
      }
  };

  const stopCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
      }
      setShowCamera(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setForm(prev => ({ ...prev, image: url }));
      setErrors(prev => ({ ...prev, image: undefined }));
    }
  };

  const handleUrlSubmit = () => {
      if (imageUrlInput) {
          setForm(prev => ({ ...prev, image: imageUrlInput }));
          setErrors(prev => ({ ...prev, image: undefined }));
          setShowUrlInput(false);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: any = {};
    if (!form.description || form.description.length < 10) newErrors.description = 'Deskripsi wajib diisi (min 10 karakter)';
    if (!form.location) newErrors.location = 'Lokasi wajib diisi';
    if (!form.image) newErrors.image = 'Foto bukti wajib ada';
    
    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    setLoading(true);
    setTimeout(() => {
      addReport({
        category: form.category,
        description: form.description,
        location: form.location,
        imageUrl: form.image!,
      }, draftId);
      
      setActiveDraft(null);
      setLoading(false);
      navigate('petugas-home');
    }, 1000);
  };

  const isFormValid = !errors.description && !errors.location && !errors.image && form.description.length >= 10 && form.location.length > 0 && form.image;



  return (
    <div className="bg-white min-h-[80vh] rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-gray-800">
          {activeDraft ? 'Perbaiki & Kirim Ulang' : 'Buat Laporan'}
        </h2>
        {activeDraft && (
            <button 
                onClick={handleCancelFix}
                className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 flex items-center gap-1"
            >
                <Trash2 size={12} /> Batal
            </button>
        )}
      </div>
      
      {activeDraft && (
        <div className="bg-blue-50 text-blue-700 p-3 rounded-lg mb-6 text-sm flex gap-2 items-start border border-blue-100">
           <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
           <p>Laporan sebelumnya akan <strong>digantikan</strong> oleh laporan revisi ini.</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bidang Pekerjaan</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(ReportCategory).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, category: cat }))}
                className={`text-xs py-2 px-3 rounded-lg border transition-all ${form.category === cat ? 'bg-orange-50 border-orange-500 text-orange-700 font-bold' : 'border-gray-200 text-gray-600'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Pekerjaan</label>
          <textarea
            value={form.description}
            onChange={handleDescriptionChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 outline-none text-sm transition-colors ${errors.description ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-orange-500'}`}
            rows={3}
            placeholder="Contoh: Membersihkan selokan mampet..."
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
               <input
                type="text"
                value={form.location}
                onChange={handleLocationChange}
                className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:ring-2 outline-none transition-colors ${errors.location ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-orange-500'}`}
                placeholder="Alamat / Nama Jalan"
              />
              <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
            </div>
            <button
              type="button"
              onClick={() => setShowMap(true)}
              className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-200 flex items-center gap-1 border border-gray-200"
            >
              <MapPin size={14} /> Peta
            </button>
          </div>
          {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
        </div>

        {/* Photo Upload */}
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">Foto Bukti</label>
           <div className={`relative border-2 border-dashed rounded-xl bg-gray-50 h-48 flex flex-col items-center justify-center overflow-hidden transition-colors ${errors.image ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
              {form.image ? (
                <>
                  <img src={form.image} className="w-full h-full object-cover" alt="Preview" />
                  <div className="absolute bottom-2 right-2 flex gap-2">
                     <button 
                        type="button"
                        onClick={startCamera}
                        className="bg-white/90 text-gray-700 p-2 rounded-full shadow-sm"
                     >
                        <Camera size={16} />
                     </button>
                     <button 
                        type="button"
                        onClick={() => setForm(prev => ({...prev, image: null}))}
                        className="bg-white/90 text-red-600 p-2 rounded-full shadow-sm"
                     >
                        <X size={16} />
                     </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="flex gap-3 mb-2">
                      <button 
                        type="button"
                        onClick={startCamera}
                        className="bg-orange-100 text-orange-600 p-3 rounded-full hover:bg-orange-200 transition-colors"
                        title="Kamera"
                      >
                        <Camera size={24} />
                      </button>
                      <button 
                         type="button"
                         onClick={() => setShowUrlInput(true)}
                         className="bg-blue-100 text-blue-600 p-3 rounded-full hover:bg-blue-200 transition-colors"
                         title="Link URL"
                      >
                         <LinkIcon size={24} />
                      </button>
                  </div>
                  
                  <p className="text-xs text-gray-500">Ambil foto atau tempel URL</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                     <span className="h-px w-8 bg-gray-300"></span>
                     <span className="text-[10px] text-gray-400">ATAU</span>
                     <span className="h-px w-8 bg-gray-300"></span>
                  </div>
                  
                  <label className="mt-2 text-xs text-blue-600 font-medium cursor-pointer hover:underline flex items-center gap-1">
                      <ImageIcon size={12} /> Upload dari Galeri
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                  </label>
                </div>
              )}
           </div>
           {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
        </div>

        {/* Submit */}
        <div className="flex flex-col gap-2">
            <button
            type="submit"
            disabled={loading || !isFormValid}
            className={`w-full font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all ${loading || !isFormValid ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-orange-600 text-white shadow-orange-500/30 active:scale-[0.98]'}`}
            >
            {loading ? 'Mengirim...' : (
                <>
                <Send size={18} /> {activeDraft ? 'Kirim Perbaikan' : 'Kirim Laporan'}
                </>
            )}
            </button>
            {activeDraft && (
                 <button
                    type="button"
                    onClick={handleCancelFix}
                    className="w-full font-bold py-3.5 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                    Batal Perbaikan
                </button>
            )}
        </div>
      </form>

      {/* Live Camera Modal */}
      {showCamera && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
              <div className="p-4 flex justify-between items-center text-white">
                  <h3 className="font-medium">Ambil Foto</h3>
                  <button onClick={stopCamera}><X size={24} /></button>
              </div>
              <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
                  <video 
                     ref={videoRef} 
                     autoPlay 
                     playsInline 
                     className="absolute w-full h-full object-cover"
                  />
              </div>
              <div className="p-8 bg-black flex justify-center pb-12">
                  <button 
                    onClick={capturePhoto}
                    className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 active:bg-white/50 transition-colors"
                  >
                      <div className="w-12 h-12 bg-white rounded-full"></div>
                  </button>
              </div>
          </div>
      )}

      {/* URL Input Modal */}
      {showUrlInput && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in-95">
                  <h3 className="font-bold text-gray-800 mb-4">Masukkan Link Gambar</h3>
                  <input 
                    type="url" 
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none mb-4"
                  />
                  <div className="flex gap-2">
                      <button 
                        onClick={() => setShowUrlInput(false)}
                        className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                      >
                          Batal
                      </button>
                      <button 
                        onClick={handleUrlSubmit}
                        className="flex-1 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold"
                      >
                          Gunakan
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* MapPicker Component */}
      <MapPicker
        isVisible={showMap}
        initialPosition={[-6.195, 106.865]}
        onLocationSelected={(location) => {
          setForm(prev => ({ ...prev, location: location.address || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` }));
          setErrors(prev => ({ ...prev, location: undefined }));
          setShowMap(false);
        }}
        onClose={() => setShowMap(false)}
        showLocateButton={true}
      />
    </div>
  );
};
