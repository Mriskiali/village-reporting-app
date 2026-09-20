
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role, User } from '../../types';
import { Plus, Search, Edit2, Trash2, Power, PowerOff, Save, X, AlertTriangle } from 'lucide-react';

export const ManageUsers: React.FC = () => {
  const { users, addUser, editUser, permanentDeleteUser, auth, addNotification } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    pjlpNumber: '',
    phone: '',
    role: Role.PETUGAS,
    password: '',
    avatarUrl: 'https://picsum.photos/200'
  });

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.pjlpNumber.includes(searchTerm)
  );

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        pjlpNumber: '',
        phone: '',
        role: Role.PETUGAS,
        password: 'password123',
        isActive: true,
        avatarUrl: `https://picsum.photos/seed/${Date.now()}/200`
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) return;

    if (editingUser) {
      editUser(editingUser.id, formData);
      addNotification(auth.user.id, `Data ${formData.name} berhasil diperbarui`, 'SUCCESS');
    } else {
      if (!formData.name || !formData.pjlpNumber) {
        addNotification(auth.user.id, "Nama dan Nomor PJLP wajib diisi", 'ERROR');
        return;
      }
      addUser(formData as User);
      addNotification(auth.user.id, `Petugas ${formData.name} berhasil ditambahkan`, 'SUCCESS');
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (user: User) => {
    if (!auth.user) return;
    if (confirm(`Apakah anda yakin ingin mengubah status ${user.name}?`)) {
      editUser(user.id, { isActive: !user.isActive });
      addNotification(auth.user.id, `Status ${user.name} diubah menjadi ${!user.isActive ? 'Aktif' : 'Nonaktif'}`, 'SUCCESS');
    }
  };

  const handleDeleteClick = (user: User) => {
    if (!auth.user) return;
    if (user.id === auth.user.id) {
        addNotification(auth.user.id, "Anda tidak dapat menghapus akun sendiri.", 'ERROR');
        return;
    }
    setUserToDelete(user);
    setDeleteConfirmationText('');
  };

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userToDelete && auth.user && deleteConfirmationText === 'HAPUS') {
        await permanentDeleteUser(userToDelete.id);
        addNotification(auth.user.id, `Petugas ${userToDelete.name} dan datanya telah dihapus permanen.`, 'SUCCESS');
        setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Manajemen Petugas</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Cari Nama atau ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 bg-white"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-orange-700 transition-colors"
          >
            <Plus size={18} /> <span className="hidden md:inline">Tambah Petugas</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Petugas</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Kontak</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Peran</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full bg-gray-200 object-cover" />
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">ID: {user.pjlpNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.phone || '-'}</td>
                  <td className="px-6 py-4">
                     <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${user.role === Role.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {user.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(user)}
                        className="p-2 text-gray-500 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => toggleStatus(user)}
                        className={`p-2 rounded-lg transition-colors ${user.isActive ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                        title={user.isActive ? "Nonaktifkan" : "Aktifkan"}
                      >
                        {user.isActive ? <Power size={16} /> : <PowerOff size={16} />}
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(user)}
                        className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                        title="Hapus Permanen"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">{editingUser ? 'Edit Petugas' : 'Tambah Petugas Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Nomor PJLP (Login ID)</label>
                  <input
                    type="text"
                    required
                    value={formData.pjlpNumber}
                    onChange={e => setFormData({...formData, pjlpNumber: e.target.value})}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none ${editingUser ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-900'}`}
                    disabled={!!editingUser}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Nomor Telepon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-gray-900 bg-white"
                />
              </div>

              <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">Peran</label>
                 <select 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value as Role})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none bg-white text-gray-900"
                 >
                   <option value={Role.PETUGAS}>Petugas Lapangan</option>
                   <option value={Role.ADMIN}>Admin Kelurahan</option>
                 </select>
              </div>

              <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">{editingUser ? 'Reset Kata Sandi (Opsional)' : 'Kata Sandi'}</label>
                 <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-gray-900 bg-white placeholder-gray-400"
                  placeholder={editingUser ? "Biarkan kosong jika tidak diubah" : "Masukkan kata sandi"}
                  required={!editingUser}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 font-medium text-sm hover:bg-gray-100 rounded-lg"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white font-medium text-sm rounded-lg hover:bg-orange-700 shadow-sm flex items-center gap-2"
                >
                  <Save size={16} /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW: Dangerous Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 border border-red-100">
            {/* Header */}
            <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100">
               <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                  <AlertTriangle size={32} />
               </div>
               <h3 className="text-xl font-bold text-red-900">Hapus Permanen Akun?</h3>
               <p className="text-sm text-red-700 mt-2 px-4 leading-relaxed">
                 Tindakan ini <span className="font-bold underline">TIDAK DAPAT</span> dibatalkan. Akun petugas dan seluruh riwayat laporannya akan dihapus dari database.
               </p>
            </div>

            <form onSubmit={handleConfirmDelete} className="p-6 bg-white">
                <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Ketik <span className="text-red-600">HAPUS</span> untuk konfirmasi
                    </label>
                    <input 
                      type="text" 
                      value={deleteConfirmationText}
                      onChange={(e) => setDeleteConfirmationText(e.target.value)}
                      placeholder="HAPUS"
                      className="w-full p-3 border-2 border-red-100 rounded-xl text-center font-bold tracking-widest text-red-600 focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none transition-all placeholder:text-red-100/50"
                      autoFocus
                    />
                </div>

                <div className="flex gap-3">
                   <button 
                     type="button"
                     onClick={() => setUserToDelete(null)}
                     className="flex-1 py-3 bg-white text-gray-700 font-bold text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                   >
                     Batal
                   </button>
                   <button 
                     type="submit"
                     disabled={deleteConfirmationText !== 'HAPUS'}
                     className={`flex-1 py-3 font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all ${
                         deleteConfirmationText === 'HAPUS' 
                         ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-200 active:scale-95 cursor-pointer' 
                         : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                     }`}
                   >
                     <Trash2 size={18} /> HAPUS
                   </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

