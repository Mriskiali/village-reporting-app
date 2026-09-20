import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { LogOut, User, Phone, Lock, Save, X, Edit2, Camera, Upload } from 'lucide-react';

export const PetugasProfile: React.FC = () => {
  const { auth, logout, editUser, addNotification } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState(auth.user?.name || '');
  const [phone, setPhone] = useState(auth.user?.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) return;

    if (password && password !== confirmPassword) {
      addNotification(auth.user.id, "Konfirmasi kata sandi tidak cocok!", 'ERROR');
      return;
    }

    const updates: any = { name, phone };
    if (password) updates.password = password;

    editUser(auth.user.id, updates);
    setIsEditing(false);
    setPassword('');
    setConfirmPassword('');
    addNotification(auth.user.id, "Profil berhasil diperbarui!", 'SUCCESS');
  };

  const handleCancel = () => {
    if (auth.user) {
        setIsEditing(false);
        setName(auth.user.name || '');
        setPhone(auth.user.phone || '');
        setPassword('');
        addNotification(auth.user.id, "Perubahan dibatalkan", 'INFO');
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && auth.user) {
      if (file.size > 2 * 1024 * 1024) {
        addNotification(auth.user.id, "Ukuran foto terlalu besar (Maks 2MB)", 'ERROR');
        return;
      }

      try {
        const base64String = await convertFileToBase64(file);
        editUser(auth.user.id, { avatarUrl: base64String });
        addNotification(auth.user.id, "Foto profil berhasil diperbarui!", 'SUCCESS');
      } catch (error) {
        console.error("Error converting image", error);
        addNotification(auth.user.id, "Gagal memproses gambar", 'ERROR');
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-orange-400 to-orange-600"></div>
          
          <div className="relative mt-12 mb-4 inline-block group">
             <img src={auth.user?.avatarUrl} className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-gray-200" alt="Profile" />
             
             {/* Always allow image edit in edit mode, or show icon if not editing but clickable */}
             <button 
               onClick={triggerFileInput}
               className="absolute bottom-0 right-0 bg-gray-800 text-white p-2 rounded-full hover:bg-black transition-colors shadow-lg z-10"
               title="Ubah Foto Profil"
             >
               <Camera size={16} />
             </button>
             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleImageUpload} 
               accept="image/*" 
               className="hidden" 
             />
          </div>
          
          {!isEditing ? (
            <>
              <h2 className="text-xl font-bold text-gray-800">{auth.user?.name}</h2>
              <p className="text-gray-500 text-sm">PJLP: {auth.user?.pjlpNumber}</p>
              <div className="flex justify-center mt-4">
                 <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-sm font-medium hover:bg-orange-100 transition-colors"
                 >
                   <Edit2 size={14} /> Edit Profil
                 </button>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500 font-bold text-orange-600 animate-pulse">Mode Edit Aktif</div>
          )}
       </div>

       <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
            <h3 className="font-bold text-gray-800">Informasi Akun</h3>
            {isEditing && <span className="text-xs text-gray-400">Silakan ubah data dibawah ini</span>}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-1">
                <User size={14} /> Nama Lengkap
              </label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
                className={`w-full p-3 rounded-lg border text-sm transition-all outline-none 
                  ${isEditing 
                    ? 'border-orange-300 focus:ring-2 focus:ring-orange-200 bg-white text-gray-900 placeholder-gray-400 font-medium' 
                    : 'border-transparent bg-gray-50 text-gray-600'
                  }`}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-1">
                <Phone size={14} /> Nomor Telepon
              </label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!isEditing}
                className={`w-full p-3 rounded-lg border text-sm transition-all outline-none
                  ${isEditing 
                    ? 'border-orange-300 focus:ring-2 focus:ring-orange-200 bg-white text-gray-900 placeholder-gray-400 font-medium' 
                    : 'border-transparent bg-gray-50 text-gray-600'
                  }`}
              />
            </div>

            {isEditing && (
              <div className="pt-4 border-t border-gray-100 mt-4 bg-orange-50/50 p-4 rounded-xl">
                 <h4 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2"><Lock size={14}/> Ganti Kata Sandi</h4>
                 <div className="space-y-3">
                   <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Kata Sandi Baru</label>
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Kosongkan jika tidak ingin mengubah"
                        className="w-full p-3 rounded-lg border border-orange-200 text-sm focus:ring-2 focus:ring-orange-200 bg-white text-gray-900 outline-none placeholder-gray-400"
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Konfirmasi Kata Sandi</label>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi kata sandi baru"
                        className="w-full p-3 rounded-lg border border-orange-200 text-sm focus:ring-2 focus:ring-orange-200 bg-white text-gray-900 outline-none placeholder-gray-400"
                      />
                   </div>
                 </div>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex flex-col md:flex-row gap-3 mt-8 pt-2">
              <button 
                type="button"
                onClick={handleCancel}
                className="order-2 md:order-1 flex-1 py-3.5 text-gray-700 bg-gray-100 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 border border-gray-200"
              >
                <X size={18} /> Batal
              </button>
              <button 
                type="submit"
                className="order-1 md:order-2 flex-1 py-3.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-200 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              >
                <Save size={18} /> Simpan Perubahan
              </button>
            </div>
          )}
       </form>

       <button 
         onClick={logout} 
         className="w-full py-4 bg-white text-red-600 border border-red-100 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors shadow-sm"
       >
         <LogOut size={20} /> Keluar Aplikasi
       </button>
    </div>
  );
};