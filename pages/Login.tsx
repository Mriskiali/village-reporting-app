import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { Shield, User, X, CheckCircle, AlertCircle } from 'lucide-react';

interface LoginProps {
  onSuccess: (role: Role) => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { login } = useApp();
  const [role, setRole] = useState<Role>(Role.PETUGAS);
  const [pjlp, setPjlp] = useState('');
  const [password, setPassword] = useState('');
  
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(pjlp, role, password);
    
    if (success) {
      setToast({ message: 'Login Berhasil!', type: 'success' });
      setTimeout(() => {
         onSuccess(role);
      }, 800);
    } else {
      setToast({ message: 'ID, Peran, atau Kata Sandi salah.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-orange-600 flex items-center justify-center p-4 relative overflow-hidden">
      {toast && (
        <div 
          className={`absolute top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-xl flex items-center gap-2 animate-in slide-in-from-top-4 fade-in ${toast.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}
          role="alert"
          aria-live="polite"
        >
           {toast.type === 'success' ? <CheckCircle size={18} aria-hidden="true" /> : <AlertCircle size={18} aria-hidden="true" />}
           <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden z-10" role="form" aria-label="Form login">
        <div className="p-8 text-center bg-orange-50 border-b border-orange-100">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-orange-600" aria-hidden="true">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">SPKPPSU</h1>
          <p className="text-gray-600">Kelurahan</p>
        </div>

        <div className="p-8">
          <div className="flex bg-gray-100 p-1 rounded-lg mb-6" role="tablist" aria-label="Pilih peran">
            <button
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${role === Role.PETUGAS ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'}`}
              onClick={() => setRole(Role.PETUGAS)}
              role="tab"
              aria-selected={role === Role.PETUGAS}
              aria-controls="petugas-panel"
            >
              Petugas
            </button>
            <button
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${role === Role.ADMIN ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'}`}
              onClick={() => setRole(Role.ADMIN)}
              role="tab"
              aria-selected={role === Role.ADMIN}
              aria-controls="admin-panel"
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="pjlp-input" className="block text-sm font-medium text-gray-700 mb-1">
                {role === Role.PETUGAS ? 'Nomor PJLP' : 'Username Admin'}
              </label>
              <div className="relative">
                <input
                  id="pjlp-input"
                  type="text"
                  onChange={(e) => setPjlp(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors text-gray-900 bg-white"
                  placeholder={role === Role.PETUGAS ? "Nomor PJLP" : "admin"}
                  autoFocus
                />
                <User className="absolute left-3 top-3.5 text-gray-400" size={18} aria-hidden="true" />
              </div>
            </div>
            
            <div>
              <label htmlFor="password-input" className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
              <input
                id="password-input"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors text-gray-900 bg-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-orange-500/30 transition-all active:scale-[0.98]"
              aria-label="Masuk ke akun"
            >
              Masuk
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-gray-400">
            <p>Sistem Pelaporan dan Pengelolaan Pelayanan Umum</p>
          </div>
        </div>
      </div>
    </div>
  );
};