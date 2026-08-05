import React, { useState } from 'react';
import { AppUser, UserRole, StationWorkstation, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { 
  Users, 
  UserPlus, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Monitor, 
  Edit3, 
  UserX, 
  UserCheck, 
  Search, 
  X,
  Key,
  Laptop
} from 'lucide-react';

interface UsersViewProps {
  users: AppUser[];
  currentLang: Language;
  onAddUser: (user: Omit<AppUser, 'uid'> & { password?: string }) => void;
  onUpdateUser: (uid: string, updates: Partial<AppUser>) => void;
  onToggleUserStatus: (uid: string, currentStatus?: 'active' | 'disabled') => void;
}

export const ALL_PERMISSIONS = [
  { id: 'manage_company', label: 'إدارة بيانات المصنع والشركة' },
  { id: 'manage_users', label: 'إدارة المستخدمين والصلاحيات' },
  { id: 'view_customers', label: 'استعراض العملاء والمشاريع' },
  { id: 'manage_customers', label: 'إضافة وتعديل العملاء والمشاريع' },
  { id: 'manage_inventory', label: 'إدارة المواد الأولية والمخزون' },
  { id: 'record_inventory_movements', label: 'تسجيل دخول وخروج شحنات المواد' },
  { id: 'view_dispatches', label: 'استعراض فواتير وإرساليات الخرسانة' },
  { id: 'create_dispatches', label: 'إنشاء وطباعة فواتير الخرسانة الجاهزة' },
  { id: 'scale_weighing', label: 'استخدام الميزان الجسري والوزنات' },
  { id: 'manage_vehicles', label: 'إدارة الميكسرات والشاحنات والمحروقات' },
  { id: 'manage_payroll', label: 'إدارة العمال والرواتب والتسليفات' },
  { id: 'view_financials', label: 'استعراض التقارير المالية والأرباح' },
];

export const WORKSTATION_OPTIONS: { id: StationWorkstation; name: string; desc: string }[] = [
  { id: 'all', name: 'جميع أجهزة المصنع', desc: 'صلاحيات كاملة للوصول من أي حاسوب' },
  { id: 'manager_pc', name: 'جهاز الإدارة (Manager PC)', desc: 'شاشة التحكم العامة والمتابعة والتقارير' },
  { id: 'production_pc', name: 'جهاز الإنتاج (Production PC)', desc: 'شاشة محطة الخلط ومتابعة طلبات الميكسرات' },
  { id: 'warehouse_pc', name: 'جهاز المخزن (Warehouse PC)', desc: 'شاشة حركات الأسمنت والمواد الأولية' },
  { id: 'scale_pc', name: 'جهاز الميزان (Scale PC)', desc: 'شاشة الميزان الجسري ووزنات الصهاريج' },
  { id: 'accounting_pc', name: 'جهاز المحاسبة (Accounting PC)', desc: 'شاشة الفواتير والمقبوضات ورواتب العمال' },
];

export const ROLE_OPTIONS: { id: UserRole; name: string; badgeColor: string }[] = [
  { id: 'admin', name: 'مدير عام (Admin)', badgeColor: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'manager', name: 'مدير مصنع (Manager)', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'accountant', name: 'محاسب (Accountant)', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'production_operator', name: 'مشغل خرسانة (Production)', badgeColor: 'bg-orange-100 text-orange-800 border-orange-200' },
  { id: 'warehouse_operator', name: 'أمين مخزن (Warehouse)', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'scale_operator', name: 'مشغل ميزان (Scale Operator)', badgeColor: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'company_owner', name: 'مالك المؤسسة (Owner)', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
];

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  currentLang,
  onAddUser,
  onUpdateUser,
  onToggleUserStatus,
}) => {
  const t = getTranslation(currentLang);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  // New User Form State
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    role: 'manager' as UserRole,
    workstation: 'all' as StationWorkstation,
    permissions: [
      'view_customers',
      'manage_customers',
      'view_dispatches',
      'create_dispatches',
      'manage_inventory',
    ] as string[],
  });

  const filteredUsers = users.filter(
    (u) =>
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePermissionToggle = (permId: string) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(permId);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== permId)
          : [...prev.permissions, permId],
      };
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName || !formData.email) return;

    onAddUser({
      displayName: formData.displayName,
      email: formData.email,
      password: formData.password || '12345678',
      role: formData.role,
      companyId: '',
      workstation: formData.workstation,
      permissions: formData.permissions,
      status: 'active',
    });

    setShowAddModal(false);
    setFormData({
      displayName: '',
      email: '',
      password: '',
      role: 'manager',
      workstation: 'all',
      permissions: ['view_customers', 'manage_customers', 'view_dispatches', 'create_dispatches'],
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    onUpdateUser(editingUser.uid, {
      displayName: editingUser.displayName,
      role: editingUser.role,
      workstation: editingUser.workstation,
      permissions: editingUser.permissions,
    });

    setEditingUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-600" />
            <span>إدارة مستخدمي المصنع والصلاحيات</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            ربط المستخدمين بالأدوار (Admin, Manager, Accountant, Operator)، وتحديد أجهزة المصنع (PCs) وتفعيل/تعطيل الحسابات
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>إنشاء مستخدم جديد</span>
        </button>
      </div>

      {/* Networked Workstations Overview */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Laptop className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">توزيع أجهزة شبكة المصنع (Factory Workstations)</h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-950 px-2.5 py-0.5 rounded-md border border-emerald-800">
            5 PCs Connected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          {WORKSTATION_OPTIONS.filter((w) => w.id !== 'all').map((st) => (
            <div key={st.id} className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-orange-400 font-bold text-xs">
                <Monitor className="w-3.5 h-3.5" />
                <span className="truncate">{st.name.split(' ')[0]} {st.name.split(' ')[1]}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute top-3.5 start-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="البحث باسم المستخدم، البريد، أو الدور..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full ps-10 pe-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-orange-500"
        />
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const roleObj = ROLE_OPTIONS.find((r) => r.id === user.role) || {
            name: user.role,
            badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
          };
          const isDisabled = user.status === 'disabled';

          return (
            <div
              key={user.uid}
              className={`bg-white rounded-2xl border p-5 shadow-xs space-y-4 flex flex-col justify-between transition-all ${
                isDisabled ? 'opacity-60 bg-slate-50 border-slate-300' : 'border-slate-200 hover:border-orange-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${roleObj.badgeColor}`}>
                        {roleObj.name}
                      </span>
                      {isDisabled && (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-md">
                          معطل
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-slate-900">{user.displayName}</h3>
                    <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingUser(user)}
                      className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                      title="تعديل الصلاحيات والأجهزة"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleUserStatus(user.uid, user.status)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isDisabled
                          ? 'text-emerald-600 hover:bg-emerald-50'
                          : 'text-rose-500 hover:bg-rose-50'
                      }`}
                      title={isDisabled ? 'تفعيل الحساب' : 'تعطيل الحساب'}
                    >
                      {isDisabled ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-4 bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-500">الجهاز المسموح:</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <Monitor className="w-3.5 h-3.5 text-orange-600" />
                      <span>
                        {WORKSTATION_OPTIONS.find((w) => w.id === user.workstation)?.name || 'جميع الأجهزة'}
                      </span>
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-500 block mb-1">الصلاحيات المخصصة:</span>
                    <div className="flex flex-wrap gap-1">
                      {(user.permissions && user.permissions.length > 0
                        ? user.permissions
                        : ['الافتراضية حسب الدور']
                      ).map((p, idx) => {
                        const pName = ALL_PERMISSIONS.find((ap) => ap.id === p)?.label || p;
                        return (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 text-[10px] rounded-md font-medium"
                          >
                            {pName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>حالة الحساب:</span>
                <span className={isDisabled ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                  {isDisabled ? 'موقف مؤقتاً' : 'نشط وجاهز'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-slate-900 text-base">إنشاء حساب مستخدم جديد</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="مثال: أحمد المحاسب / محمد المشغل"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@factory.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">كلمة المرور الأولية *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الدور والمنصب (Role) *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white font-bold text-slate-900"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">جهاز الحاسوب المخصص (Workstation)</label>
                <select
                  value={formData.workstation}
                  onChange={(e) => setFormData({ ...formData, workstation: e.target.value as StationWorkstation })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white font-semibold text-orange-900"
                >
                  {WORKSTATION_OPTIONS.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} — {w.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Permissions Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">الصلاحيات المخصصة للمستخدم (Permissions):</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {ALL_PERMISSIONS.map((perm) => {
                    const isChecked = formData.permissions.includes(perm.id);
                    return (
                      <label key={perm.id} className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handlePermissionToggle(perm.id)}
                          className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                        />
                        <span>{perm.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  إنشاء وتفعيل المستخدم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">تعديل بيانات {editingUser.displayName}</h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={editingUser.displayName}
                  onChange={(e) => setEditingUser({ ...editingUser, displayName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الدور (Role)</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white font-bold"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">جهاز المصنع المسموح (Workstation)</label>
                <select
                  value={editingUser.workstation || 'all'}
                  onChange={(e) => setEditingUser({ ...editingUser, workstation: e.target.value as StationWorkstation })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white font-semibold"
                >
                  {WORKSTATION_OPTIONS.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  حفظ التغييرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
