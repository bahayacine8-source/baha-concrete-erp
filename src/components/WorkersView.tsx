import React, { useState } from 'react';
import { Worker, WorkerPayment, WorkerRole, SalaryType, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { 
  Users, 
  UserPlus, 
  DollarSign, 
  Calendar, 
  Printer, 
  FileText, 
  Plus, 
  Trash2, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  X
} from 'lucide-react';

interface WorkersViewProps {
  workers: Worker[];
  payments: WorkerPayment[];
  currentLang: Language;
  onAddWorker: (worker: Omit<Worker, 'id'>) => void;
  onRecordPayment: (payment: Omit<WorkerPayment, 'id'>) => void;
  onDeleteWorker: (workerId: string) => void;
}

export const WorkersView: React.FC<WorkersViewProps> = ({
  workers,
  payments,
  currentLang,
  onAddWorker,
  onRecordPayment,
  onDeleteWorker,
}) => {
  const t = getTranslation(currentLang);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2026-07');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedWorkerForPay, setSelectedWorkerForPay] = useState<Worker | null>(null);
  const [selectedWorkerForPayslip, setSelectedWorkerForPayslip] = useState<Worker | null>(null);

  // New Worker Form state
  const [newWorker, setNewWorker] = useState<Omit<Worker, 'id' | 'companyId'>>({
    name: '',
    role: 'mixer_driver',
    phone: '',
    salaryType: 'monthly',
    baseSalary: 50000,
    joinedDate: new Date().toISOString().split('T')[0],
    status: 'active',
  });

  // Payment Form state
  const [newPayment, setNewPayment] = useState({
    type: 'advance' as 'salary' | 'advance' | 'bonus' | 'deduction',
    amount: 10000,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const filteredWorkers = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.phone.includes(searchTerm)
  );

  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorker.name) return;
    onAddWorker({
      ...newWorker,
      companyId: '',
    });
    setShowAddModal(false);
    setNewWorker({
      name: '',
      role: 'mixer_driver',
      phone: '',
      salaryType: 'monthly',
      baseSalary: 50000,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'active',
    });
  };

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerForPay || newPayment.amount <= 0) return;
    onRecordPayment({
      companyId: '',
      workerId: selectedWorkerForPay.id,
      workerName: selectedWorkerForPay.name,
      monthYear: selectedMonth,
      type: newPayment.type,
      amount: Number(newPayment.amount),
      date: newPayment.date,
      notes: newPayment.notes,
    });
    setShowPaymentModal(false);
    setSelectedWorkerForPay(null);
  };

  // Helper calculation for worker salary in month
  const getWorkerPayrollDetails = (workerId: string, baseSalary: number) => {
    const workerPays = payments.filter(
      (p) => p.workerId === workerId && p.monthYear === selectedMonth
    );

    const totalAdvances = workerPays
      .filter((p) => p.type === 'advance')
      .reduce((acc, p) => acc + p.amount, 0);

    const totalBonuses = workerPays
      .filter((p) => p.type === 'bonus')
      .reduce((acc, p) => acc + p.amount, 0);

    const totalDeductions = workerPays
      .filter((p) => p.type === 'deduction')
      .reduce((acc, p) => acc + p.amount, 0);

    const totalSalaryPaid = workerPays
      .filter((p) => p.type === 'salary')
      .reduce((acc, p) => acc + p.amount, 0);

    const netPayable = baseSalary + totalBonuses - totalDeductions;
    const remainingSalary = netPayable - (totalAdvances + totalSalaryPaid);

    return {
      totalAdvances,
      totalBonuses,
      totalDeductions,
      totalSalaryPaid,
      netPayable,
      remainingSalary,
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-600" />
            <span>{t.workerManagement}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة عمال المصنع، تسجيل الدفعات والتسليفات وكشف راتب الشهر المتبقي
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          />
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.addWorker}</span>
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="relative">
        <Search className="w-4 h-4 absolute top-3.5 start-3.5 text-slate-400" />
        <input
          type="text"
          placeholder={t.search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full ps-10 pe-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-orange-500"
        />
      </div>

      {/* Workers Cards & Payroll Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredWorkers.map((worker) => {
          const payroll = getWorkerPayrollDetails(worker.id, worker.baseSalary);

          return (
            <div
              key={worker.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-orange-200 transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{worker.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-100">
                        {t[worker.role as WorkerRole] || worker.role}
                      </span>
                      <span className="text-xs text-slate-400">{worker.phone}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteWorker(worker.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title={t.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Salary & Payroll Breakdown */}
                <div className="bg-slate-50 rounded-xl p-3 mt-4 space-y-2 border border-slate-100 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>{t.baseSalary} ({t[worker.salaryType as SalaryType]}):</span>
                    <span className="font-bold text-slate-900">{worker.baseSalary.toLocaleString()} دج</span>
                  </div>
                  
                  <div className="flex justify-between text-slate-600">
                    <span>{t.totalAdvances} ({selectedMonth}):</span>
                    <span className="font-bold text-amber-600">
                      -{payroll.totalAdvances.toLocaleString()} دج
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm">
                    <span className="font-bold text-slate-800">{t.remainingSalary}:</span>
                    <span
                      className={`font-black ${
                        payroll.remainingSalary <= 0
                          ? 'text-emerald-600'
                          : 'text-orange-600'
                      }`}
                    >
                      {payroll.remainingSalary.toLocaleString()} دج
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedWorkerForPay(worker);
                    setShowPaymentModal(true);
                  }}
                  className="flex-1 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>{t.registerPaymentAdvance}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedWorkerForPayslip(worker)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  title={t.printPayslip}
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal 1: Add Worker */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">{t.addWorker}</h3>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorker} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.workerName}</label>
                <input
                  type="text"
                  required
                  value={newWorker.name}
                  onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                  placeholder="مثال: أحمد عبد الله"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.workerRole}</label>
                <select
                  value={newWorker.role}
                  onChange={(e) => setNewWorker({ ...newWorker, role: e.target.value as WorkerRole })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                >
                  <option value="mixer_driver">{t.mixer_driver}</option>
                  <option value="pump_operator">{t.pump_operator}</option>
                  <option value="plant_operator">{t.plant_operator}</option>
                  <option value="lab_tech">{t.lab_tech}</option>
                  <option value="loader_operator">{t.loader_operator}</option>
                  <option value="mechanic">{t.mechanic}</option>
                  <option value="admin">{t.admin}</option>
                  <option value="general_worker">{t.general_worker}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.salaryType}</label>
                  <select
                    value={newWorker.salaryType}
                    onChange={(e) => setNewWorker({ ...newWorker, salaryType: e.target.value as SalaryType })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                  >
                    <option value="monthly">{t.monthly}</option>
                    <option value="daily">{t.daily}</option>
                    <option value="per_trip">{t.perTrip}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.baseSalary}</label>
                  <input
                    type="number"
                    required
                    value={newWorker.baseSalary}
                    onChange={(e) => setNewWorker({ ...newWorker, baseSalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.phone}</label>
                <input
                  type="text"
                  value={newWorker.phone}
                  onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                  placeholder="06 XX XX XX XX"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="pt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Record Payment / Advance */}
      {showPaymentModal && selectedWorkerForPay && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{t.registerPaymentAdvance}</h3>
                <p className="text-xs text-orange-600 font-bold">{selectedWorkerForPay.name}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowPaymentModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">نوع الدفعة</label>
                <select
                  value={newPayment.type}
                  onChange={(e) => setNewPayment({ ...newPayment, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                >
                  <option value="advance">تسليفة / دفعة مسبقة (Advance)</option>
                  <option value="salary">دفع راتب الشهر (Salary Pay)</option>
                  <option value="bonus">مكافأة / علاوة (Bonus)</option>
                  <option value="deduction">خصم (Deduction)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">المبلغ (دج)</label>
                <input
                  type="number"
                  required
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.date}</label>
                <input
                  type="date"
                  required
                  value={newPayment.date}
                  onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.notes}</label>
                <input
                  type="text"
                  value={newPayment.notes}
                  onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                  placeholder="ملاحظات..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="pt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payslip View Modal */}
      {selectedWorkerForPayslip && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 print:p-0 print:shadow-none">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
              <h3 className="font-bold text-slate-900 text-base">{t.payrollSummary}</h3>
              <button 
                type="button" 
                onClick={() => setSelectedWorkerForPayslip(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Payslip Layout */}
            <div id="payslip-print-content" className="p-4 border border-slate-200 rounded-xl space-y-4">
              <div className="text-center border-b border-slate-200 pb-3">
                <h2 className="font-black text-lg text-slate-900">كشف راتب شهر {selectedMonth}</h2>
                <p className="text-xs text-slate-500">معمل الخرسانة الجاهزة ReadyMix Concrete</p>
              </div>

              <div className="grid grid-cols-2 text-xs gap-2 bg-slate-50 p-3 rounded-lg">
                <div><strong>اسم العامل:</strong> {selectedWorkerForPayslip.name}</div>
                <div><strong>الوظيفة:</strong> {t[selectedWorkerForPayslip.role as WorkerRole] || selectedWorkerForPayslip.role}</div>
                <div><strong>الهاتف:</strong> {selectedWorkerForPayslip.phone}</div>
                <div><strong>تاريخ التعيين:</strong> {selectedWorkerForPayslip.joinedDate}</div>
              </div>

              {(() => {
                const pay = getWorkerPayrollDetails(selectedWorkerForPayslip.id, selectedWorkerForPayslip.baseSalary);
                return (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>الراتب الأساسي:</span>
                      <span className="font-bold">{selectedWorkerForPayslip.baseSalary.toLocaleString()} دج</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 text-amber-600">
                      <span>إجمالي التسليفات والدفعات المسبقة:</span>
                      <span className="font-bold">-{pay.totalAdvances.toLocaleString()} دج</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-600">
                      <span>المكافآت:</span>
                      <span className="font-bold">+{pay.totalBonuses.toLocaleString()} دج</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 text-rose-600">
                      <span>الخصومات:</span>
                      <span className="font-bold">-{pay.totalDeductions.toLocaleString()} دج</span>
                    </div>
                    <div className="flex justify-between py-2 bg-orange-50 px-3 rounded-lg text-sm font-black text-orange-900">
                      <span>الباقي المستحق الصافي:</span>
                      <span>{pay.remainingSalary.toLocaleString()} دج</span>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-6 flex justify-between text-[11px] text-slate-400">
                <div>توقيع العامل: .........................</div>
                <div>توقيع وإمضاء الإدارة: .........................</div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>{t.print}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
