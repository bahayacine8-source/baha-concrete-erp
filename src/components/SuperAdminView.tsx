import React, { useState } from 'react';
import { Company, AccountStatus, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { 
  ShieldCheck, 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Mail, 
  Search,
  Sparkles,
  Calendar
} from 'lucide-react';

interface SuperAdminViewProps {
  companies: Company[];
  currentLang: Language;
  onUpdateCompanyStatus: (companyId: string, status: AccountStatus, trialDays?: number) => void;
  onRegisterCompanyByAdmin: (company: Omit<Company, 'id'>) => void;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  companies,
  currentLang,
  onUpdateCompanyStatus,
  onRegisterCompanyByAdmin,
}) => {
  const t = getTranslation(currentLang);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);

  const [newCompany, setNewCompany] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active' as AccountStatus,
  });

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.name || !newCompany.email) return;

    onRegisterCompanyByAdmin({
      ...newCompany,
      createdAt: new Date().toISOString(),
      trialStartDate: new Date().toISOString().split('T')[0],
      trialEndDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
    });

    setShowAddCompanyModal(false);
    setNewCompany({
      name: '',
      email: '',
      phone: '',
      address: '',
      status: 'active',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>لوحة التحكم الخاصة بصاحب البرنامج</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-1">
            {t.superAdminPanel}
          </h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.ownerContact}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddCompanyModal(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t.register}</span>
        </button>
      </div>

      {/* Global Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">إجمالي الشركات</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{companies.length}</div>
          </div>
          <Building2 className="w-8 h-8 text-slate-400" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">الشركات المفعلة</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {companies.filter((c) => c.status === 'active').length}
            </div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">الشركات في التجربة</span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {companies.filter((c) => c.status === 'trial').length}
            </div>
          </div>
          <Clock className="w-8 h-8 text-amber-500" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute top-3.5 start-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="البحث باسم الشركة أو البريد..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full ps-10 pe-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-amber-500"
        />
      </div>

      {/* Companies List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs overflow-x-auto">
        <h3 className="font-bold text-slate-900 text-base mb-4">{t.registeredCompanies}</h3>

        <table className="w-full text-sm text-start">
          <thead>
            <tr className="text-xs text-slate-400 border-b border-slate-100 text-start">
              <th className="pb-3 font-semibold text-start">{t.companyName}</th>
              <th className="pb-3 font-semibold text-start">{t.email} / {t.phone}</th>
              <th className="pb-3 font-semibold text-start">الحالة الحالية</th>
              <th className="pb-3 font-semibold text-start">تاريخ نهاية التجربة</th>
              <th className="pb-3 font-semibold text-start">إجراءات التفعيل (صاحب البرنامج)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCompanies.map((comp) => {
              return (
                <tr key={comp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-bold text-slate-900">{comp.name}</td>
                  <td className="py-3 text-xs text-slate-600">
                    <div>{comp.email}</div>
                    <div className="text-slate-400">{comp.phone}</div>
                  </td>
                  <td className="py-3 font-bold">
                    {comp.status === 'active' ? (
                      <span className="px-2.5 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {t.activeAccount}
                      </span>
                    ) : comp.status === 'trial' ? (
                      <span className="px-2.5 py-1 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200">
                        {t.trialPeriod}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs bg-rose-50 text-rose-700 border border-rose-200">
                        {t.suspendedAccount}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-xs font-mono text-slate-600">
                    {comp.trialEndDate || 'تفعيل دائم'}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onUpdateCompanyStatus(comp.id, 'active')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors"
                      >
                        {t.activateCompany}
                      </button>

                      <button
                        type="button"
                        onClick={() => onUpdateCompanyStatus(comp.id, 'trial', 30)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg transition-colors"
                      >
                        تجربة 30 يوم
                      </button>

                      <button
                        type="button"
                        onClick={() => onUpdateCompanyStatus(comp.id, 'suspended')}
                        className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs rounded-lg transition-colors"
                      >
                        تعليق
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
