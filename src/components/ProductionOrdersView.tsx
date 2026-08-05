import React, { useState } from 'react';
import { 
  ProductionOrder, 
  Customer, 
  ConcreteGrade, 
  Vehicle, 
  Worker, 
  InventoryItem, 
  Language 
} from '../types';
import { getTranslation } from '../lib/translations';
import { 
  Factory, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Play, 
  XCircle, 
  AlertTriangle, 
  Truck, 
  User, 
  Boxes, 
  FileText, 
  X,
  Layers,
  ArrowDownRight,
  Flame,
  Printer
} from 'lucide-react';
import { DispatchInvoice } from '../types';

interface ProductionOrdersViewProps {
  orders: ProductionOrder[];
  customers: Customer[];
  concreteGrades: ConcreteGrade[];
  vehicles: Vehicle[];
  workers: Worker[];
  inventoryItems: InventoryItem[];
  currentLang: Language;
  onCreateOrder: (order: Omit<ProductionOrder, 'id'>) => void;
  onExecuteOrder: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
  onPrintInvoice?: (invoice: DispatchInvoice) => void;
}

export const ProductionOrdersView: React.FC<ProductionOrdersViewProps> = ({
  orders,
  customers,
  concreteGrades,
  vehicles,
  workers,
  inventoryItems,
  currentLang,
  onCreateOrder,
  onExecuteOrder,
  onCancelOrder,
  onPrintInvoice,
}) => {
  const t = getTranslation(currentLang);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'in_production' | 'completed'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [executingOrder, setExecutingOrder] = useState<ProductionOrder | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    orderNumber: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    customerId: customers[0]?.id || '',
    projectName: customers[0]?.projects?.[0]?.name || 'مشروع ورشة البناء المركزية',
    concreteGradeCode: concreteGrades[0]?.code || 'C25/30',
    quantityM3: 10,
    numberOfTrucks: 1,
    plantName: 'محطة الخلط الرئيسية #01',
    driverName: workers.find(w => w.role === 'mixer_driver')?.name || 'علي سائق الخرسانة',
    truckPlate: vehicles.find(v => v.type === 'concrete_mixer')?.plateNumber || '01234-325-07',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    notes: '',
  });

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.concreteGradeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.truckPlate.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedCustomer = customers.find((c) => c.id === formData.customerId);
  const selectedGrade = concreteGrades.find((g) => g.code === formData.concreteGradeCode);

 const handleCreateSubmit = async (
  e: React.FormEvent
) => {

  e.preventDefault();

  try {

    const response =
      await window.productionAPI.createOrder({
    company_id: "company_001",
    customer_id: formData.customerId,
    concrete_grade: formData.concreteGradeCode,
    quantity: Number(formData.quantityM3),
    mixer: formData.plantName,
    driver: formData.driverName,
    truck: formData.truckPlate
});

    console.log(
      "Production created:",
      response
    );

    if (!response.success) {

      alert(response.error);

      return;

    }

    setShowCreateModal(false);

  } catch (error) {

    console.error(error);

  }

};

  const calculateDeductionBreakdown = (order: ProductionOrder) => {
    const grade = concreteGrades.find((g) => g.code === order.concreteGradeCode);
    if (!grade || !grade.recipe) return [];

    return grade.recipe.map((ingredient) => {
      const totalKg = ingredient.kgPerM3 * order.quantityM3;
      // Find matching inventory item
      const item = inventoryItems.find((inv) => inv.category === ingredient.category) || {
        name: ingredient.itemName,
        unit: 'ton',
        currentStock: 100,
      };

      let requiredInUnit = totalKg;
      if (item.unit === 'ton') {
        requiredInUnit = totalKg / 1000;
      }

      return {
        itemName: ingredient.itemName,
        category: ingredient.category,
        requiredInUnit: Number(requiredInUnit.toFixed(2)),
        unit: item.unit,
        currentStock: item.currentStock,
        sufficient: item.currentStock >= requiredInUnit,
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Factory className="w-6 h-6 text-orange-600" />
            <span>إدارة أوامر الإنتاج ومحطة الخلط (Production Orders)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إصدار أوردرات الإنتاج اليومية، توجيه شاحنات الخرسانة، والخصم التلقائي لكميات الأسمنت والرمل والحصى من المستودع
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء أمر إنتاج جديد</span>
        </button>
      </div>

      {/* Production Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">إجمالي أوامر اليوم</div>
            <div className="text-lg font-black text-slate-900">{orders.length} أمر</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">قيد الخلط والتحميل</div>
            <div className="text-lg font-black text-amber-600">
              {orders.filter((o) => o.status === 'in_production').length} أمر
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">أوامر مكتملة ومخصومة</div>
            <div className="text-lg font-black text-emerald-600">
              {orders.filter((o) => o.status === 'completed').length} أمر
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">إجمالي حجم الخرسانة m³</div>
            <div className="text-lg font-black text-blue-600">
              {orders.reduce((acc, o) => acc + o.quantityM3, 0)} م³
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute top-3.5 start-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="البحث برقم الأمر، اسم العميل، درجة الخرسانة، أو شاحنة BPE..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full ps-10 pe-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              statusFilter === 'all' ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            الكل ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('in_production')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              statusFilter === 'in_production' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            جار الخلط ({orders.filter((o) => o.status === 'in_production').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              statusFilter === 'completed' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            مكتمل ({orders.filter((o) => o.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Orders List / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map((order) => {
          const isCompleted = order.status === 'completed';
          const isInProd = order.status === 'in_production';

          return (
            <div
              key={order.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs space-y-4 flex flex-col justify-between transition-all ${
                isCompleted ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 hover:border-orange-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="font-mono font-bold text-orange-600 text-sm">{order.orderNumber}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : isInProd
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    {isCompleted ? '✓ مكتمل ومخصوم' : isInProd ? '⏳ جاري الخلط والتحميل' : 'مسودة'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900">{order.customerName}</h3>
                  <p className="text-xs text-slate-500 font-medium">🏗️ {order.projectName}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-500">نوع الخرسانة:</span>
                    <span className="font-bold text-slate-900 px-2 py-0.5 bg-orange-100 text-orange-900 rounded-md">
                      {order.concreteGradeCode}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-500">الحجم المطلوب:</span>
                    <span className="font-black text-slate-900 text-sm">{order.quantityM3} م³</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-500">محطة الخلط:</span>
                    <span className="font-semibold text-slate-800">{order.plantName || 'المحطة الرئيسية'}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-500">السائق والشاحنة:</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-orange-600" />
                      <span>{order.driverName} ({order.truckPlate})</span>
                    </span>
                  </div>
                </div>

                {order.materialsDeducted && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-100/70 p-2 rounded-lg font-bold border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>تم خصم الأسمنت والحصى والرمل تلقائياً من المستودع.</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                {!isCompleted ? (
                  <button
                    type="button"
                    onClick={() => setExecutingOrder(order)}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>تنفيذ الأمر وخصم الخلطة</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="flex-1 py-2 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تم التنفيذ وتوليد الفاتورة</span>
                  </button>
                )}

                {onPrintInvoice && (
                  <button
                    type="button"
                    onClick={() => {
                      const mockDispatch: DispatchInvoice = {
                        id: `disp_${order.id}`,
                        invoiceNumber: order.orderNumber.replace('PO-', 'FAC-'),
                        companyId: order.companyId,
                        customerId: order.customerId,
                        customerName: order.customerName,
                        deliverySite: order.projectName || 'ورشة البناء',
                        deliveryDate: order.date,
                        deliveryTime: order.time,
                        concreteGradeCode: order.concreteGradeCode,
                        volumeM3: order.quantityM3,
                        pricePerM3: 9800,
                        pumpPrice: 15000,
                        totalAmount: order.quantityM3 * 9800 + 15000,
                        paidAmount: order.quantityM3 * 9800 + 15000,
                        remainingAmount: 0,
                        vehicleCode: order.truckPlate,
                        driverName: order.driverName,
                        status: 'delivered',
                      };
                      onPrintInvoice(mockDispatch);
                    }}
                    className="py-2 px-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                    title="طباعة وصل الخرسانة والفاتورة"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة</span>
                  </button>
                )}

                {isInProd && (
                  <button
                    type="button"
                    onClick={() => onCancelOrder(order.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="إلغاء أمر الإنتاج"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Factory className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-slate-900 text-base">إصدار أمر إنتاج جديد (Production Order)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">رقم أمر الإنتاج *</label>
                  <input
                    type="text"
                    required
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono font-bold text-orange-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">العميل المستلم *</label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => {
                      const cust = customers.find((c) => c.id === e.target.value);
                      setFormData({
                        ...formData,
                        customerId: e.target.value,
                        projectName: cust?.projects?.[0]?.name || 'مشروع ورشة البناء',
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white font-semibold"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">المشروع / الورشة *</label>
                  <input
                    type="text"
                    required
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    placeholder="اسم ورشة أو مشروع العميل"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">نوع وتركيبة الخرسانة *</label>
                  <select
                    value={formData.concreteGradeCode}
                    onChange={(e) => setFormData({ ...formData, concreteGradeCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white font-bold text-orange-900"
                  >
                    {concreteGrades.map((g) => (
                      <option key={g.id} value={g.code}>
                        {g.code} — {g.description} ({g.pricePerM3} دج/م³)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الكمية (m³) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantityM3}
                    onChange={(e) => {
                      const qty = Number(e.target.value);
                      setFormData({ 
                        ...formData, 
                        quantityM3: qty,
                        numberOfTrucks: Math.max(1, Math.ceil(qty / 10))
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-black text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">عدد الشاحنات (رحلات)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.numberOfTrucks}
                    onChange={(e) => setFormData({ ...formData, numberOfTrucks: Math.max(1, Number(e.target.value)) })}
                    className="w-full px-3 py-2 border border-orange-300 bg-orange-50/50 rounded-xl text-sm font-extrabold text-orange-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">محطة الخلط</label>
                  <select
                    value={formData.plantName}
                    onChange={(e) => setFormData({ ...formData, plantName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white font-semibold"
                  >
                    <option value="محطة الخلط الرئيسية #01">محطة الخلط الرئيسية #01</option>
                    <option value="محطة الخلط الثانوية #02">محطة الخلط الثانوية #02</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">التاريخ *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">السائق المكلف (Driver)</label>
                  <input
                    type="text"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    placeholder="اسم سائق الميكسر..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">شاحنة الخرسانة (Mixer Truck)</label>
                  <input
                    type="text"
                    value={formData.truckPlate}
                    onChange={(e) => setFormData({ ...formData, truckPlate: e.target.value })}
                    placeholder="رقم اللوحة..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  إصدار وإرسال لمحطة الخلط
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Execute Order Confirmation Modal with Calculated Material Deductions */}
      {executingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <Boxes className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-base">تأكيد خلط وخصم المواد التلقائي</h3>
              </div>
              <button
                type="button"
                onClick={() => setExecutingOrder(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              سيتم تأكيد إنتاج أوردر <strong>{executingOrder.orderNumber}</strong> لحجم <strong>{executingOrder.quantityM3} م³</strong> من درجة <strong>{executingOrder.concreteGradeCode}</strong>، وخصم كميات المواد الأولية التالية فوراً من داتابيز المخزون:
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-1 flex justify-between">
                <span>المادة الأولية</span>
                <span>الكمية المخصومة</span>
              </div>

              {calculateDeductionBreakdown(executingOrder).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">{item.itemName}</span>
                  <span className="font-mono font-bold text-rose-600">
                    -{item.requiredInUnit} {item.unit}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExecutingOrder(null)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  onExecuteOrder(executingOrder.id);
                  setExecutingOrder(null);
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                تأكيد الخلط وتوليد الفاتورة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
