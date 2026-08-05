import React, { useState } from 'react';
import { 
  Customer, 
  DispatchInvoice, 
  CustomerPayment, 
  ConcreteGrade, 
  Vehicle, 
  Language 
} from '../types';
import { getTranslation } from '../lib/translations';
import { 
  exportCustomerInvoicesToExcel, 
  importCustomerInvoicesFromExcel 
} from '../lib/excelUtils';
import { 
  Users2, 
  Plus, 
  Search, 
  Printer, 
  FileText, 
  DollarSign, 
  MapPin, 
  Truck, 
  Layers, 
  Calendar, 
  CheckCircle2, 
  Trash2,
  X,
  CreditCard,
  Building,
  Download,
  Upload,
  FileSpreadsheet
} from 'lucide-react';

interface CustomersViewProps {
  customers: Customer[];
  dispatches: DispatchInvoice[];
  customerPayments: CustomerPayment[];
  concreteGrades: ConcreteGrade[];
  vehicles: Vehicle[];
  currentLang: Language;
  onAddCustomer: (customer: Omit<Customer, 'id'>) => void;
  onCreateDispatch: (dispatch: Omit<DispatchInvoice, 'id'>) => void;
  onRecordCustomerPayment: (payment: Omit<CustomerPayment, 'id'>) => void;
  onDeleteCustomer: (customerId: string) => void;
  quickDispatchOpen?: boolean;
  onCloseQuickDispatch?: () => void;
  onPrintInvoice?: (invoice: DispatchInvoice) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  dispatches,
  customerPayments,
  concreteGrades,
  vehicles,
  currentLang,
  onAddCustomer,
  onCreateDispatch,
  onRecordCustomerPayment,
  onDeleteCustomer,
  quickDispatchOpen = false,
  onCloseQuickDispatch,
  onPrintInvoice,
}) => {
  const t = getTranslation(currentLang);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(quickDispatchOpen);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCustomerForReport, setSelectedCustomerForReport] = useState<Customer | null>(null);
  const [selectedCustomerForPay, setSelectedCustomerForPay] = useState<Customer | null>(null);

  // New Customer State
  const [newCustomer, setNewCustomer] = useState<Omit<Customer, 'id' | 'companyId' | 'totalOrdersCount' | 'totalVolumeM3' | 'totalBilledAmount' | 'totalPaidAmount' | 'balanceDue'>>({
    name: '',
    companyName: '',
    phone: '',
    address: '',
    taxNumber: '',
    projects: [],
  });

  const [newProjectName, setNewProjectName] = useState('');
  const [selectedCustForProject, setSelectedCustForProject] = useState<Customer | null>(null);

  // Dispatch State
  const [newDispatch, setNewDispatch] = useState({
    customerId: customers[0]?.id || '',
    projectName: '',
    deliverySite: 'ورشة مشروع البناء',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryTime: '08:00',
    concreteGradeCode: concreteGrades[0]?.code || 'خرسانة مسلحة C25/30 (B25)',
    volumeM3: 30,
    numberOfTrucks: 3,
    pricePerM3: concreteGrades[0]?.pricePerM3 || 9800,
    pumpPrice: 15000,
    paidAmount: 200000,
    vehicleCode: vehicles[0]?.codeName || 'خلاطة #01',
    driverName: vehicles[0]?.driverName || '',
    slumpMm: 160,
    notes: '',
  });

  // Customer Payment State
  const [newPay, setNewPay] = useState({
    amount: 100000,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash' as 'cash' | 'check' | 'bank_transfer',
    referenceNumber: '',
    notes: '',
  });

  // Keep internal dispatch modal sync with quickDispatchOpen prop
  React.useEffect(() => {
    if (quickDispatchOpen) {
      setShowDispatchModal(true);
    }
  }, [quickDispatchOpen]);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.phone.includes(searchTerm)
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name) return;
    onAddCustomer({
      ...newCustomer,
      companyId: '',
      totalOrdersCount: 0,
      totalVolumeM3: 0,
      totalBilledAmount: 0,
      totalPaidAmount: 0,
      balanceDue: 0,
    });
    setShowAddCustomerModal(false);
    setNewCustomer({
      name: '',
      companyName: '',
      phone: '',
      address: '',
      taxNumber: '',
    });
  };

  const handleCreateDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === newDispatch.customerId);
    if (!cust) return;

    const totalInvoice = newDispatch.volumeM3 * newDispatch.pricePerM3 + (newDispatch.pumpPrice || 0);
    const remaining = totalInvoice - newDispatch.paidAmount;

    onCreateDispatch({
      companyId: '',
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: cust.id,
      customerName: cust.name,
      deliverySite: newDispatch.deliverySite,
      deliveryDate: newDispatch.deliveryDate,
      deliveryTime: newDispatch.deliveryTime,
      concreteGradeCode: newDispatch.concreteGradeCode,
      volumeM3: Number(newDispatch.volumeM3),
      numberOfTrucks: Number(newDispatch.numberOfTrucks) || 1,
      pricePerM3: Number(newDispatch.pricePerM3),
      pumpPrice: Number(newDispatch.pumpPrice),
      totalAmount: totalInvoice,
      paidAmount: Number(newDispatch.paidAmount),
      remainingAmount: remaining,
      vehicleCode: newDispatch.vehicleCode,
      driverName: newDispatch.driverName,
      slumpMm: Number(newDispatch.slumpMm),
      status: 'delivered',
      notes: newDispatch.notes,
    });

    setShowDispatchModal(false);
    if (onCloseQuickDispatch) onCloseQuickDispatch();
  };

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerForPay || newPay.amount <= 0) return;

    onRecordCustomerPayment({
      companyId: '',
      customerId: selectedCustomerForPay.id,
      customerName: selectedCustomerForPay.name,
      date: newPay.date,
      amount: Number(newPay.amount),
      paymentMethod: newPay.paymentMethod,
      referenceNumber: newPay.referenceNumber,
      notes: newPay.notes,
    });

    setShowPaymentModal(false);
    setSelectedCustomerForPay(null);
  };

  const handleExportExcel = () => {
    exportCustomerInvoicesToExcel(dispatches, 'فواتير_العملاء_والإرساليات.xlsx');
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importCustomerInvoicesFromExcel(file);
      imported.forEach((inv) => {
        const matchingCustomer = customers.find(
          (c) => c.name.toLowerCase() === inv.customerName?.toLowerCase()
        ) || customers[0];

        if (matchingCustomer) {
          onCreateDispatch({
            companyId: '',
            invoiceNumber: inv.invoiceNumber || `INV-IMP-${Math.floor(Math.random() * 9000)}`,
            customerId: matchingCustomer.id,
            customerName: matchingCustomer.name,
            deliverySite: inv.deliverySite || 'ورشة مستوردة',
            deliveryDate: inv.deliveryDate || new Date().toISOString().split('T')[0],
            deliveryTime: inv.deliveryTime || '08:00',
            concreteGradeCode: inv.concreteGradeCode || 'خرسانة مسلحة C25/30',
            volumeM3: Number(inv.volumeM3 || 10),
            pricePerM3: Number(inv.pricePerM3 || 9500),
            pumpPrice: Number(inv.pumpPrice || 0),
            totalAmount: Number(inv.totalAmount || 95000),
            paidAmount: Number(inv.paidAmount || 0),
            remainingAmount: Number((inv.totalAmount || 95000) - (inv.paidAmount || 0)),
            vehicleCode: inv.vehicleCode || 'خلاطة #01',
            driverName: inv.driverName || '',
            slumpMm: 160,
            status: 'delivered',
            notes: inv.notes || 'مستورد من Excel',
          });
        }
      });
      alert(`تم استيراد ${imported.length} فاتورة بنجاح!`);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء قراءة ملف Excel');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users2 className="w-6 h-6 text-orange-600" />
            <span>{t.customersAndSales}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة العملاء والطلبيات، تواريخ ومكان ورشات الإرسال، طباعة التقارير وحساب الدفعات والباقي
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Excel Export Button */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="تصدير جميع الفواتير إلى Excel"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>تصدير Excel</span>
          </button>

          {/* Excel Import Button */}
          <label className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>استيراد Excel</span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleImportExcel}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => setShowAddCustomerModal(true)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addCustomer}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDispatchModal(true)}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors"
          >
            <Truck className="w-4 h-4" />
            <span>{t.newDispatchInvoice}</span>
          </button>
        </div>
      </div>

      {/* Search */}
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

      {/* Customers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => {
          const custDispatches = dispatches.filter((d) => d.customerId === customer.id);
          const custPayments = customerPayments.filter((p) => p.customerId === customer.id);

          return (
            <div
              key={customer.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-orange-200 transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{customer.name}</h3>
                    {customer.companyName && (
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">{customer.companyName}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteCustomer(customer.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title={t.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-slate-600 space-y-1 mt-3">
                  <div><strong>الهاتف:</strong> {customer.phone}</div>
                  <div><strong>العنوان:</strong> {customer.address}</div>
                </div>

                {/* Customer Projects Section */}
                <div className="mt-3 pt-2 border-t border-slate-100 space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
                    <span>المشاريع المرتبطة ({customer.projects?.length || 1}):</span>
                    <button
                      type="button"
                      onClick={() => setSelectedCustForProject(customer)}
                      className="text-[10px] text-orange-600 font-bold hover:underline"
                    >
                      + مشروع جديد
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(customer.projects && customer.projects.length > 0 ? customer.projects : [
                      { id: 'p1', name: 'مشروع ورشة البناء المركزية' }
                    ]).map((prj) => (
                      <span key={prj.id} className="px-2 py-0.5 bg-orange-50 text-orange-800 border border-orange-200 text-[10px] font-bold rounded-md">
                        🏗️ {prj.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-slate-50 rounded-xl p-3 mt-4 space-y-2 border border-slate-100 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>عدد الشحنات:</span>
                    <span className="font-bold text-slate-900">{custDispatches.length} إرسالية</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>إجمالي الخرسانة (م³):</span>
                    <span className="font-bold text-orange-700">
                      {custDispatches.reduce((acc, d) => acc + d.volumeM3, 0)} م³
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>المجموع الكلي المفلتر:</span>
                    <span className="font-bold text-slate-900">
                      {custDispatches.reduce((acc, d) => acc + d.totalAmount, 0).toLocaleString()} دج
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{t.financialPaymentsReceived}:</span>
                    <span className="font-bold text-emerald-600">
                      {(
                        custDispatches.reduce((acc, d) => acc + d.paidAmount, 0) +
                        custPayments.reduce((acc, p) => acc + p.amount, 0)
                      ).toLocaleString()} دج
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold">
                    <span>{t.remainingBalanceDue}:</span>
                    <span className={customer.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                      {customer.balanceDue.toLocaleString()} دج
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomerForPay(customer);
                    setShowPaymentModal(true);
                  }}
                  className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>تسجيل دفعة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCustomerForReport(customer)}
                  className="py-2 px-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  title={t.printStatement}
                >
                  <Printer className="w-4 h-4" />
                  <span>{t.printCustomerReport}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal 1: Add Customer */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">{t.addCustomer}</h3>
              <button 
                type="button" 
                onClick={() => setShowAddCustomerModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.customerName}</label>
                <input
                  type="text"
                  required
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="مثال: كوسيدار / المقاول بن أحمد"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">اسم المؤسسة / الشركة</label>
                <input
                  type="text"
                  value={newCustomer.companyName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, companyName: e.target.value })}
                  placeholder="اسم الشركة إن وجد..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.phone}</label>
                <input
                  type="text"
                  required
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="06 XX XX XX XX"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.address}</label>
                <input
                  type="text"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  placeholder="العنوان..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="pt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
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

      {/* Modal 2: Create Dispatch / Concrete Sales Invoice */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">{t.newDispatchInvoice}</h3>
              <button 
                type="button" 
                onClick={() => {
                  setShowDispatchModal(false);
                  if (onCloseQuickDispatch) onCloseQuickDispatch();
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDispatch} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.customerName}</label>
                <select
                  value={newDispatch.customerId}
                  onChange={(e) => setNewDispatch({ ...newDispatch, customerId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white font-bold"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.companyName || c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.deliverySite}</label>
                <input
                  type="text"
                  required
                  value={newDispatch.deliverySite}
                  onChange={(e) => setNewDispatch({ ...newDispatch, deliverySite: e.target.value })}
                  placeholder="مثال: مشروع 500 سكن ورشة B1"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.deliveryDate}</label>
                  <input
                    type="date"
                    required
                    value={newDispatch.deliveryDate}
                    onChange={(e) => setNewDispatch({ ...newDispatch, deliveryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">وقت الإرسال</label>
                  <input
                    type="time"
                    value={newDispatch.deliveryTime}
                    onChange={(e) => setNewDispatch({ ...newDispatch, deliveryTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.concreteGrade}</label>
                <select
                  value={newDispatch.concreteGradeCode}
                  onChange={(e) => {
                    const grade = concreteGrades.find((g) => g.code === e.target.value);
                    setNewDispatch({
                      ...newDispatch,
                      concreteGradeCode: e.target.value,
                      pricePerM3: grade ? grade.pricePerM3 : newDispatch.pricePerM3,
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white font-bold text-orange-900"
                >
                  {concreteGrades.map((g) => (
                    <option key={g.id} value={g.code}>
                      {g.code} ({g.pricePerM3.toLocaleString()} دج/م³)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الكمية (م³)</label>
                  <input
                    type="number"
                    required
                    value={newDispatch.volumeM3}
                    onChange={(e) => {
                      const vol = Number(e.target.value);
                      setNewDispatch({ 
                        ...newDispatch, 
                        volumeM3: vol,
                        numberOfTrucks: Math.max(1, Math.ceil(vol / 10)) 
                      });
                    }}
                    className="w-full px-2 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">عدد الشاحنات (رحلات)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newDispatch.numberOfTrucks}
                    onChange={(e) => setNewDispatch({ ...newDispatch, numberOfTrucks: Math.max(1, Number(e.target.value)) })}
                    className="w-full px-2 py-2 border border-orange-300 bg-orange-50/50 rounded-xl text-sm font-extrabold text-orange-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">سعر م³ (دج)</label>
                  <input
                    type="number"
                    required
                    value={newDispatch.pricePerM3}
                    onChange={(e) => setNewDispatch({ ...newDispatch, pricePerM3: Number(e.target.value) })}
                    className="w-full px-2 py-2 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">تكلفة المضخة</label>
                  <input
                    type="number"
                    value={newDispatch.pumpPrice}
                    onChange={(e) => setNewDispatch({ ...newDispatch, pumpPrice: Number(e.target.value) })}
                    className="w-full px-2 py-2 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div className="bg-orange-50 p-3 rounded-xl border border-orange-200 flex justify-between items-center text-xs">
                <span className="font-bold text-orange-900">المجموع الكلي للإرسالية:</span>
                <span className="font-black text-orange-900 text-sm">
                  {(newDispatch.volumeM3 * newDispatch.pricePerM3 + newDispatch.pumpPrice).toLocaleString()} دج
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الدفعات المالية المستلمة الآن</label>
                  <input
                    type="number"
                    value={newDispatch.paidAmount}
                    onChange={(e) => setNewDispatch({ ...newDispatch, paidAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الباقي المستحق</label>
                  <div className="px-3 py-2 bg-slate-100 rounded-xl text-sm font-black text-rose-600 border border-slate-200">
                    {(
                      newDispatch.volumeM3 * newDispatch.pricePerM3 +
                      newDispatch.pumpPrice -
                      newDispatch.paidAmount
                    ).toLocaleString()} دج
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDispatchModal(false);
                    if (onCloseQuickDispatch) onCloseQuickDispatch();
                  }}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  تأكيد وإرسال الفاتورة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Customer Financial Payment */}
      {showPaymentModal && selectedCustomerForPay && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{t.recordCustomerPayment}</h3>
                <p className="text-xs text-orange-600 font-bold">{selectedCustomerForPay.name}</p>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">المبلغ المستلم (دج)</label>
                <input
                  type="number"
                  required
                  value={newPay.amount}
                  onChange={(e) => setNewPay({ ...newPay, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.date}</label>
                <input
                  type="date"
                  required
                  value={newPay.date}
                  onChange={(e) => setNewPay({ ...newPay, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">طريقة الدفع</label>
                <select
                  value={newPay.paymentMethod}
                  onChange={(e) => setNewPay({ ...newPay, paymentMethod: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white font-semibold"
                >
                  <option value="cash">نقداً (Cash)</option>
                  <option value="check">صك بنكي (Check)</option>
                  <option value="bank_transfer">تحويل بنكي (Bank Transfer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">رقم الوصل / الصك / التحويل</label>
                <input
                  type="text"
                  value={newPay.referenceNumber}
                  onChange={(e) => setNewPay({ ...newPay, referenceNumber: e.target.value })}
                  placeholder="رقم المرجع..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono"
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
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                >
                  تأكيد الدفعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: PRINT DETAILED CUSTOMER REPORT & STATEMENT */}
      {selectedCustomerForReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative space-y-4 max-h-[92vh] overflow-y-auto print:p-0 print:shadow-none print:max-h-none">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
              <h3 className="font-bold text-slate-900 text-base">{t.printCustomerReport}</h3>
              <button 
                type="button" 
                onClick={() => setSelectedCustomerForReport(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Print Document Content */}
            <div id="customer-statement-print" className="p-6 border border-slate-200 rounded-xl space-y-6">
              
              {/* Header Header */}
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <div>
                  <h1 className="font-black text-xl text-slate-900">معمل الخرسانة الجاهزة ReadyMix Concrete</h1>
                  <p className="text-xs text-slate-500">تقرير كشف حساب وطلبيات الخرسانة الموردة</p>
                </div>
                <div className="text-end text-xs text-slate-600">
                  <div><strong>تاريخ التقرير:</strong> {new Date().toISOString().split('T')[0]}</div>
                  <div><strong>العميل:</strong> {selectedCustomerForReport.name}</div>
                  <div><strong>الهاتف:</strong> {selectedCustomerForReport.phone}</div>
                </div>
              </div>

              {/* Delivery Dispatches Table */}
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">جدول تفاصيل إرساليات الخرسانة:</h3>
                <table className="w-full text-xs text-start border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr className="border-b border-slate-200">
                      <th className="p-2 text-start">تاريخ الإرسال</th>
                      <th className="p-2 text-start">مكان الإرسال (المكان المرسل إليه)</th>
                      <th className="p-2 text-start">نوع الخرسانة</th>
                      <th className="p-2 text-start">الكمية (م³)</th>
                      <th className="p-2 text-start">المبلغ الإجمالي</th>
                      <th className="p-2 text-start">الدفعات المالية</th>
                      <th className="p-2 text-start">الباقي المستحق</th>
                      <th className="p-2 text-center no-print">طباعة الوصل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {dispatches
                      .filter((d) => d.customerId === selectedCustomerForReport.id)
                      .map((disp) => (
                        <tr key={disp.id} className="hover:bg-slate-50">
                          <td className="p-2 font-mono font-semibold">{disp.deliveryDate}</td>
                          <td className="p-2 font-medium">{disp.deliverySite}</td>
                          <td className="p-2 font-semibold text-orange-700">{disp.concreteGradeCode}</td>
                          <td className="p-2 font-bold">{disp.volumeM3} م³</td>
                          <td className="p-2 font-bold">{disp.totalAmount.toLocaleString()} دج</td>
                          <td className="p-2 font-bold text-emerald-600">{disp.paidAmount.toLocaleString()} دج</td>
                          <td className="p-2 font-bold text-rose-600">{disp.remainingAmount.toLocaleString()} دج</td>
                          <td className="p-2 text-center no-print">
                            {onPrintInvoice && (
                              <button
                                type="button"
                                onClick={() => onPrintInvoice(disp)}
                                className="p-1 text-orange-600 hover:bg-orange-50 rounded-lg font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer"
                                title="طباعة الفاتورة والوصل"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>وصل BPE</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              {(() => {
                const cDispatches = dispatches.filter((d) => d.customerId === selectedCustomerForReport.id);
                const cPayments = customerPayments.filter((p) => p.customerId === selectedCustomerForReport.id);
                const totalM3 = cDispatches.reduce((acc, d) => acc + d.volumeM3, 0);
                const totalBilled = cDispatches.reduce((acc, d) => acc + d.totalAmount, 0);
                const totalPaid = cDispatches.reduce((acc, d) => acc + d.paidAmount, 0) + cPayments.reduce((acc, p) => acc + p.amount, 0);
                const balanceDue = totalBilled - totalPaid;

                return (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block">إجمالي الخرسانة الموردة:</span>
                      <strong className="text-base text-slate-900">{totalM3} م³</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">المجموع الكلي المستحق:</span>
                      <strong className="text-base text-slate-900">{totalBilled.toLocaleString()} دج</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">إجمالي الدفعات المالية:</span>
                      <strong className="text-base text-emerald-600">{totalPaid.toLocaleString()} دج</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">الباقي المستحق الإجمالي:</span>
                      <strong className="text-base text-rose-600">{balanceDue.toLocaleString()} دج</strong>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-8 flex justify-between text-xs text-slate-500 border-t border-slate-200">
                <div>ختم وإمضاء الإدارة: .........................</div>
                <div>توقيع العميل / المقاول: .........................</div>
              </div>

            </div>

            <div className="pt-2 flex justify-end gap-2 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
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
