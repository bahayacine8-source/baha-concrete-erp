import React, { useState } from 'react';
import { Supplier, SupplierPurchase, InventoryCategory, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { 
  exportSupplierInvoicesToExcel, 
  importSupplierInvoicesFromExcel 
} from '../lib/excelUtils';
import { 
  Store, 
  Plus, 
  Search, 
  ShoppingBag, 
  DollarSign, 
  Phone, 
  MapPin, 
  FileText, 
  Trash2,
  X,
  Download,
  Upload
} from 'lucide-react';

interface SuppliersViewProps {
  suppliers: Supplier[];
  purchases: SupplierPurchase[];
  currentLang: Language;
  onAddSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  onRecordPurchase: (purchase: Omit<SupplierPurchase, 'id'>) => void;
  onDeleteSupplier: (supplierId: string) => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  purchases,
  currentLang,
  onAddSupplier,
  onRecordPurchase,
  onDeleteSupplier,
}) => {
  const t = getTranslation(currentLang);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedSupplierForPurchase, setSelectedSupplierForPurchase] = useState<Supplier | null>(null);

  // New Supplier form
  const [newSupplier, setNewSupplier] = useState<Omit<Supplier, 'id' | 'companyId' | 'totalPurchasesAmount' | 'totalPaidAmount' | 'balanceDue'>>({
    name: '',
    contactPerson: '',
    phone: '',
    address: '',
    suppliedMaterials: ['أسمنت'],
  });

  // Purchase Form
  const [newPurchase, setNewPurchase] = useState({
    invoiceNumber: `INV-SUP-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    itemName: 'أسمنت CPJ 42.5',
    itemCategory: 'cement' as InventoryCategory,
    quantity: 50,
    unit: 'ton',
    unitPrice: 18000,
    paidAmount: 500000,
    notes: '',
  });

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm)
  );

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name) return;
    onAddSupplier({
      ...newSupplier,
      companyId: '',
      totalPurchasesAmount: 0,
      totalPaidAmount: 0,
      balanceDue: 0,
    });
    setShowAddSupplierModal(false);
    setNewSupplier({
      name: '',
      contactPerson: '',
      phone: '',
      address: '',
      suppliedMaterials: ['أسمنت'],
    });
  };

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierForPurchase) return;

    const totalAmount = newPurchase.quantity * newPurchase.unitPrice;

    onRecordPurchase({
      companyId: '',
      supplierId: selectedSupplierForPurchase.id,
      supplierName: selectedSupplierForPurchase.name,
      invoiceNumber: newPurchase.invoiceNumber,
      date: newPurchase.date,
      itemName: newPurchase.itemName,
      itemCategory: newPurchase.itemCategory,
      quantity: Number(newPurchase.quantity),
      unit: newPurchase.unit,
      unitPrice: Number(newPurchase.unitPrice),
      totalAmount,
      paidAmount: Number(newPurchase.paidAmount),
      notes: newPurchase.notes,
    });

    setShowPurchaseModal(false);
    setSelectedSupplierForPurchase(null);
  };

  const handleExportExcel = () => {
    exportSupplierInvoicesToExcel(purchases, 'فواتير_المشتريات_والموردين.xlsx');
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importSupplierInvoicesFromExcel(file);
      imported.forEach((pur) => {
        const matchingSupplier = suppliers.find(
          (s) => s.name.toLowerCase() === pur.supplierName?.toLowerCase()
        ) || suppliers[0];

        if (matchingSupplier) {
          onRecordPurchase({
            companyId: '',
            supplierId: matchingSupplier.id,
            supplierName: matchingSupplier.name,
            invoiceNumber: pur.invoiceNumber || `SUP-IMP-${Math.floor(Math.random() * 9000)}`,
            date: pur.date || new Date().toISOString().split('T')[0],
            itemName: pur.itemName || 'مادة خام',
            itemCategory: pur.itemCategory || 'cement',
            quantity: Number(pur.quantity || 10),
            unit: pur.unit || 'ton',
            unitPrice: Number(pur.unitPrice || 18000),
            totalAmount: Number(pur.totalAmount || 180000),
            paidAmount: Number(pur.paidAmount || 0),
            notes: pur.notes || 'مستورد من Excel',
          });
        }
      });
      alert(`تم استيراد ${imported.length} فاتورة توريد بنجاح!`);
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
            <Store className="w-6 h-6 text-orange-600" />
            <span>{t.suppliersManagement}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة موردي المواد الخام (الأسمنت، الرمل، الحصى، المواد الكيميائية السيكا) وفواتير الشراء
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Excel Export Button */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="تصدير فواتير الموردين إلى Excel"
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
            onClick={() => setShowAddSupplierModal(true)}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addSupplier}</span>
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

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredSuppliers.map((supplier) => {
          return (
            <div
              key={supplier.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-orange-200 transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{supplier.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{supplier.contactPerson}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteSupplier(supplier.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title={t.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700">{supplier.phone}</span>
                </div>

                {/* Balance Financials */}
                <div className="bg-slate-50 rounded-xl p-3 mt-4 space-y-2 border border-slate-100 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>إجمالي المشتريات:</span>
                    <span className="font-bold text-slate-900">{supplier.totalPurchasesAmount.toLocaleString()} دج</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{t.totalPaidToSupplier}:</span>
                    <span className="font-bold text-emerald-600">{supplier.totalPaidAmount.toLocaleString()} دج</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold">
                    <span>{t.balanceOwedToSupplier}:</span>
                    <span className={supplier.balanceDue > 0 ? 'text-rose-600' : 'text-slate-700'}>
                      {supplier.balanceDue.toLocaleString()} دج
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSupplierForPurchase(supplier);
                    setShowPurchaseModal(true);
                  }}
                  className="w-full py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t.recordPurchase}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal 1: Add Supplier */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">{t.addSupplier}</h3>
              <button 
                type="button" 
                onClick={() => setShowAddSupplierModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.supplierName}</label>
                <input
                  type="text"
                  required
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  placeholder="مثال: مجمع الأسمنت GICA"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.contactPerson}</label>
                <input
                  type="text"
                  value={newSupplier.contactPerson}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                  placeholder="اسم الشخص المسؤول..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.phone}</label>
                <input
                  type="text"
                  required
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  placeholder="033 XX XX XX"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.address}</label>
                <input
                  type="text"
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                  placeholder="العنوان..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="pt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(false)}
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

      {/* Modal 2: Record Purchase */}
      {showPurchaseModal && selectedSupplierForPurchase && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{t.recordPurchase}</h3>
                <p className="text-xs text-orange-600 font-bold">{selectedSupplierForPurchase.name}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowPurchaseModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePurchase} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.invoiceNo}</label>
                <input
                  type="text"
                  required
                  value={newPurchase.invoiceNumber}
                  onChange={(e) => setNewPurchase({ ...newPurchase, invoiceNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.itemCategory}</label>
                  <select
                    value={newPurchase.itemCategory}
                    onChange={(e) => setNewPurchase({ ...newPurchase, itemCategory: e.target.value as InventoryCategory })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white font-bold text-slate-800"
                  >
                    <option value="cement">{t.cement}</option>
                    <option value="sand">{t.sand}</option>
                    <option value="gravel">{t.gravel}</option>
                    <option value="chemical">{t.chemical}</option>
                    <option value="water">{t.water}</option>
                    <option value="other">{t.other}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.itemName}</label>
                  <input
                    type="text"
                    required
                    value={newPurchase.itemName}
                    onChange={(e) => setNewPurchase({ ...newPurchase, itemName: e.target.value })}
                    placeholder="اسم المادة..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الكمية</label>
                  <input
                    type="number"
                    required
                    value={newPurchase.quantity}
                    onChange={(e) => setNewPurchase({ ...newPurchase, quantity: Number(e.target.value) })}
                    className="w-full px-2 py-2 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الوحدة</label>
                  <input
                    type="text"
                    value={newPurchase.unit}
                    onChange={(e) => setNewPurchase({ ...newPurchase, unit: e.target.value })}
                    placeholder="ton / m3 / liter"
                    className="w-full px-2 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">سعر الوحدة</label>
                  <input
                    type="number"
                    required
                    value={newPurchase.unitPrice}
                    onChange={(e) => setNewPurchase({ ...newPurchase, unitPrice: Number(e.target.value) })}
                    className="w-full px-2 py-2 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 flex justify-between items-center text-xs">
                <span className="font-bold text-orange-900">المجموع الكلي للفاتورة:</span>
                <span className="font-black text-orange-900 text-sm">
                  {(newPurchase.quantity * newPurchase.unitPrice).toLocaleString()} دج
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">المبلغ المدفوع للمورد الآن</label>
                <input
                  type="number"
                  required
                  value={newPurchase.paidAmount}
                  onChange={(e) => setNewPurchase({ ...newPurchase, paidAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-emerald-700"
                />
              </div>

              <div className="pt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
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

    </div>
  );
};
