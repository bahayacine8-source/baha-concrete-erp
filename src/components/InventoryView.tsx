import React, { useState } from 'react';
import { InventoryItem, InventoryCategory, ConcreteGrade, Supplier, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { 
  Boxes, 
  Plus, 
  Search, 
  PlusCircle, 
  AlertTriangle, 
  Droplets, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Trash2,
  Pencil,
  X,
  ShieldCheck,
  Store
} from 'lucide-react';

interface InventoryViewProps {
  inventory: InventoryItem[];
  concreteGrades: ConcreteGrade[];
  suppliers: Supplier[];
  isSuperAdmin?: boolean;
  currentLang: Language;
  onAddInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  onRestockItem: (itemId: string, addQuantity: number) => void;
  onDeleteInventoryItem: (itemId: string) => void;
  onAddConcreteGrade: (grade: Omit<ConcreteGrade, 'id'>) => void;
  onUpdateConcreteGrade?: (id: string, updates: Partial<ConcreteGrade>) => void;
  onDeleteConcreteGrade?: (id: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  concreteGrades,
  suppliers = [],
  isSuperAdmin = false,
  currentLang,
  onAddInventoryItem,
  onRestockItem,
  onDeleteInventoryItem,
  onAddConcreteGrade,
  onUpdateConcreteGrade,
  onDeleteConcreteGrade,
}) => {
  const t = getTranslation(currentLang);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [selectedItemForRestock, setSelectedItemForRestock] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState(10);

  // New Item State with supplier dropdown
  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id' | 'companyId'>>({
    name: '',
    category: 'cement',
    currentStock: 100,
    minThreshold: 20,
    unit: 'ton',
    unitCost: 18000,
    supplierName: suppliers[0]?.name || '',
  });

  // Custom supplier text mode if needed
  const [isCustomSupplier, setIsCustomSupplier] = useState(false);

  // New Concrete Grade State
  const [newGrade, setNewGrade] = useState({
    code: 'خرسانة مسلحة C30/37 (B30)',
    pricePerM3: 10800,
    description: 'خرسانة عالية المقاومة للأعمدة والجسور',
    cementKg: 380,
    sandKg: 750,
    gravelKg: 1100,
    chemicalKg: 3.5,
    waterKg: 180,
  });

  // Edit Concrete Grade State
  const [editingGrade, setEditingGrade] = useState<ConcreteGrade | null>(null);
  const [showEditGradeModal, setShowEditGradeModal] = useState(false);
  const [editGradeData, setEditGradeData] = useState({
    code: '',
    pricePerM3: 0,
    description: '',
    cementKg: 350,
    sandKg: 700,
    gravelKg: 1050,
    chemicalKg: 3.5,
    waterKg: 170,
  });

  const handleOpenEditGrade = (grade: ConcreteGrade) => {
    setEditingGrade(grade);
    const cement = grade.recipe.find((r) => r.category === 'cement' || r.itemName.includes('أسمنت'))?.kgPerM3 || 350;
    const sand = grade.recipe.find((r) => r.category === 'sand' || r.itemName.includes('رمل'))?.kgPerM3 || 700;
    const gravel = grade.recipe.find((r) => r.category === 'gravel' || r.itemName.includes('حصى'))?.kgPerM3 || 1050;
    const chemical = grade.recipe.find((r) => r.category === 'chemical' || r.itemName.includes('سيكا'))?.kgPerM3 || 3.5;
    const water = grade.recipe.find((r) => r.category === 'water' || r.itemName.includes('ماء'))?.kgPerM3 || 170;

    setEditGradeData({
      code: grade.code,
      pricePerM3: grade.pricePerM3,
      description: grade.description || '',
      cementKg: cement,
      sandKg: sand,
      gravelKg: gravel,
      chemicalKg: chemical,
      waterKg: water,
    });
    setShowEditGradeModal(true);
  };

  const categoriesList: { id: InventoryCategory; label: string }[] = [
    { id: 'cement', label: t.cement },
    { id: 'sand', label: t.sand },
    { id: 'gravel', label: t.gravel },
    { id: 'chemical', label: t.chemical },
    { id: 'water', label: t.water },
    { id: 'other', label: t.other },
  ];

  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.supplierName && item.supplierName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategoryFilter === 'all' || item.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name) return;
    onAddInventoryItem({
      ...newItem,
      companyId: '',
      lastRestockDate: new Date().toISOString().split('T')[0],
    });
    setShowAddItemModal(false);
    setNewItem({
      name: '',
      category: 'cement',
      currentStock: 100,
      minThreshold: 20,
      unit: 'ton',
      unitCost: 18000,
      supplierName: '',
    });
  };

  const handleApplyRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForRestock || restockQty <= 0) return;
    onRestockItem(selectedItemForRestock.id, Number(restockQty));
    setShowRestockModal(false);
    setSelectedItemForRestock(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-orange-600" />
            <span>{t.inventoryManagement}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إضافة المواد الخام وتحديد تصنيف نوع السلعة (أسمنت، رمل، حصى، مواد كيميائية سيكا، ماء)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddItemModal(true)}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addInventoryItem}</span>
        </button>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategoryFilter === 'all'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            الكل ({inventory.length})
          </button>
          {categoriesList.map((cat) => {
            const count = inventory.filter((i) => i.category === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategoryFilter === cat.id
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute top-3 start-3 text-slate-400" />
          <input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full ps-9 pe-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-orange-500"
          />
        </div>
      </div>

      {/* Raw Materials Inventory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isLow = item.currentStock <= item.minThreshold;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all space-y-4 flex flex-col justify-between ${
                isLow ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 hover:border-orange-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
                      {t[item.category as keyof typeof t] || item.category}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 mt-2">{item.name}</h3>
                    {item.supplierName && (
                      <p className="text-xs text-slate-500 mt-0.5">المورد: {item.supplierName}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteInventoryItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title={t.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Stock Level Card */}
                <div className="bg-slate-50 rounded-xl p-3 mt-4 space-y-2 border border-slate-100">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-semibold text-slate-600">{t.currentStock}:</span>
                    <span
                      className={`text-lg font-black ${
                        isLow ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {item.currentStock.toLocaleString()} {item.unit}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{t.minThreshold} (الأمان):</span>
                    <span className="font-bold">{item.minThreshold} {item.unit}</span>
                  </div>

                  {isLow && (
                    <div className="pt-2 flex items-center gap-1.5 text-xs text-rose-600 font-bold">
                      <AlertTriangle className="w-4 h-4" />
                      <span>تنبيه: مخزون منخفض يتطلب التزويد!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItemForRestock(item);
                    setShowRestockModal(true);
                  }}
                  className="w-full py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{t.restock} (شحنة جديدة)</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Stock Movements Log (حركات دخول وخروج المواد الأولية) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Boxes className="w-4 h-4 text-orange-600" />
            <span>سجل حركات المخزون (شحنات الدخول واستهلاك الخلطات)</span>
          </h3>
          <span className="text-xs text-slate-500">Log In / Out Movements</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-50 text-slate-700 font-bold">
              <tr>
                <th className="p-2 text-start">التاريخ</th>
                <th className="p-2 text-start">نوع الحركة</th>
                <th className="p-2 text-start">المادة الأولية</th>
                <th className="p-2 text-start">الكمية</th>
                <th className="p-2 text-start">المورد / الصهريج</th>
                <th className="p-2 text-start">بواسطة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="p-2 font-mono font-bold text-slate-700">2026-07-27 08:30</td>
                <td className="p-2"><span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">دخول شحنة (In)</span></td>
                <td className="p-2 font-bold text-slate-900">أسمنت CPJ 42.5</td>
                <td className="p-2 font-black text-emerald-600">+45 طن</td>
                <td className="p-2 font-semibold">مؤسسة عين الكبيرة (صهريج #04)</td>
                <td className="p-2 text-slate-500">أمين المخزن</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-2 font-mono font-bold text-slate-700">2026-07-27 10:15</td>
                <td className="p-2"><span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px]">خروج استهلاك (Out)</span></td>
                <td className="p-2 font-bold text-slate-900">رمل مقلع مغسول</td>
                <td className="p-2 font-black text-rose-600">-22.5 طن</td>
                <td className="p-2 font-semibold">إنتاج طلبية B25 (30 م³)</td>
                <td className="p-2 text-slate-500">مشغل الخرسانة</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Concrete Mix Formulas Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-600" />
              <span>{t.concreteMixes}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              صيغ خلط الخرسانة المستعملة للخصم التلقائي للمواد الخام من المخزون عند إصدار الفواتير
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddGradeModal(true)}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تعيين وتسمية نوع خرسانة جديد</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {concreteGrades.map((grade) => (
            <div key={grade.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 relative group">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h4 className="font-bold text-orange-900 text-sm flex items-center gap-2">
                    <span>{grade.code}</span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">{grade.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-orange-600 text-white">
                    {grade.pricePerM3.toLocaleString()} دج / م³
                  </span>
                  
                  {/* Action Edit & Delete Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditGrade(grade)}
                      className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                      title="تعديل الخرسانة والتركيبة"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {onDeleteConcreteGrade && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`هل أنت تأكد من حذف خرسانة ${grade.code}؟`)) {
                            onDeleteConcreteGrade(grade.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                        title="حذف نوع الخرسانة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-xs font-semibold text-slate-700">الجرعات والتركيبة لمتر مكعب واحد (1 م³):</div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {grade.recipe.map((ing, idx) => (
                  <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200 flex justify-between">
                    <span className="text-slate-700 font-medium">{ing.itemName}:</span>
                    <span className="font-bold text-orange-700">{ing.kgPerM3} كغ/لتر</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal 1: Add Item with Mandatory Category Selection & Supplier Dropdown */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">{t.addInventoryItem}</h3>
              <button 
                type="button" 
                onClick={() => setShowAddItemModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3">
              
              {/* Mandatory Category Picker */}
              <div>
                <label className="block text-xs font-bold text-orange-800 mb-1 bg-orange-50 p-1.5 rounded-lg border border-orange-100">
                  {t.selectCategory} (ضروري)
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value as InventoryCategory })}
                  className="w-full px-3 py-2 border-2 border-orange-400 rounded-xl text-sm bg-white font-bold text-slate-900 focus:outline-hidden focus:border-orange-600"
                >
                  <option value="cement">{t.cement} (أسمنت)</option>
                  <option value="sand">{t.sand} (رمل)</option>
                  <option value="gravel">{t.gravel} (حصى وزلط)</option>
                  <option value="chemical">{t.chemical} (مواد كيميائية مثل السيكا Sika)</option>
                  <option value="water">{t.water} (ماء)</option>
                  <option value="other">{t.other}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.itemName}</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="مثال: أسمنت CPJ 42.5 أو سيكا بلاستيمنت"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.currentStock}</label>
                  <input
                    type="number"
                    required
                    value={newItem.currentStock}
                    onChange={(e) => setNewItem({ ...newItem, currentStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.unit}</label>
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                  >
                    <option value="ton">طـن (Ton)</option>
                    <option value="m3">متر مكعب (m³)</option>
                    <option value="liter">لتـر (Liter)</option>
                    <option value="kg">كيلوغرام (Kg)</option>
                    <option value="bag">كيس (Bag)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.minThreshold}</label>
                  <input
                    type="number"
                    value={newItem.minThreshold}
                    onChange={(e) => setNewItem({ ...newItem, minThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                {/* Supplier Picker Dropdown Requirement */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-orange-600" />
                    <span>تحديد المورد *</span>
                  </label>
                  {suppliers.length > 0 && !isCustomSupplier ? (
                    <div className="space-y-1">
                      <select
                        value={newItem.supplierName}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setIsCustomSupplier(true);
                            setNewItem({ ...newItem, supplierName: '' });
                          } else {
                            setNewItem({ ...newItem, supplierName: e.target.value });
                          }
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white font-bold text-slate-800"
                      >
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name} ({s.suppliedMaterials?.join(', ') || 'مورد'})
                          </option>
                        ))}
                        <option value="__custom__">+ مورد جديد (كتابة يدوية)</option>
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={newItem.supplierName}
                        onChange={(e) => setNewItem({ ...newItem, supplierName: e.target.value })}
                        placeholder="اسم المورد..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold"
                      />
                      {suppliers.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setIsCustomSupplier(false)}
                          className="text-xs text-orange-600 underline font-semibold"
                        >
                          اختيار من القائمة
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
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

      {/* Modal 2: Restock Batch */}
      {showRestockModal && selectedItemForRestock && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{t.restock}</h3>
                <p className="text-xs text-orange-600 font-bold">{selectedItemForRestock.name}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowRestockModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyRestock} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الكمية المضافة إلى المخزون ({selectedItemForRestock.unit})</label>
                <input
                  type="number"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-orange-900"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex justify-between">
                <span>الكمية الجديدة بعد الإضافة:</span>
                <span className="font-black text-emerald-700">
                  {(selectedItemForRestock.currentStock + Number(restockQty)).toLocaleString()} {selectedItemForRestock.unit}
                </span>
              </div>

              <div className="pt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl"
                >
                  تأكيد الإضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Super Admin - Add Concrete Grade Formula */}
      {showAddGradeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">تعيين نوع خرسانة جديد (صاحب البرنامج)</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddGradeModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onAddConcreteGrade({
                  code: newGrade.code,
                  pricePerM3: Number(newGrade.pricePerM3),
                  description: newGrade.description,
                  recipe: [
                    { itemName: 'أسمنت', kgPerM3: Number(newGrade.cementKg) },
                    { itemName: 'رمل', kgPerM3: Number(newGrade.sandKg) },
                    { itemName: 'حصى', kgPerM3: Number(newGrade.gravelKg) },
                    { itemName: 'سيكا (مواد كيميائية)', kgPerM3: Number(newGrade.chemicalKg) },
                    { itemName: 'ماء', kgPerM3: Number(newGrade.waterKg) },
                  ],
                });
                setShowAddGradeModal(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">رمز نوع الخرسانة</label>
                <input
                  type="text"
                  required
                  value={newGrade.code}
                  onChange={(e) => setNewGrade({ ...newGrade, code: e.target.value })}
                  placeholder="مثال: خرسانة مسلحة C30/37 (B30)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-orange-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">سعر المتر المكعب (دج / م³)</label>
                  <input
                    type="number"
                    required
                    value={newGrade.pricePerM3}
                    onChange={(e) => setNewGrade({ ...newGrade, pricePerM3: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الوصف والاستعمال</label>
                  <input
                    type="text"
                    value={newGrade.description}
                    onChange={(e) => setNewGrade({ ...newGrade, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-2">
                <div className="text-xs font-bold text-amber-900">تركيبة ومكونات الخليط لمتر مكعب واحد (1 م³):</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-0.5">أسمنت (كغ/م³)</label>
                    <input
                      type="number"
                      value={newGrade.cementKg}
                      onChange={(e) => setNewGrade({ ...newGrade, cementKg: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5">رمل (كغ/م³)</label>
                    <input
                      type="number"
                      value={newGrade.sandKg}
                      onChange={(e) => setNewGrade({ ...newGrade, sandKg: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5">حصى وزلط (كغ/م³)</label>
                    <input
                      type="number"
                      value={newGrade.gravelKg}
                      onChange={(e) => setNewGrade({ ...newGrade, gravelKg: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5">مواد كيميائية - سيكا (لتر/م³)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newGrade.chemicalKg}
                      onChange={(e) => setNewGrade({ ...newGrade, chemicalKg: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddGradeModal(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  حفظ وتأكيد نوع الخرسانة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Edit Concrete Grade & Mix Recipe */}
      {showEditGradeModal && editingGrade && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">تعديل معلومات الخرسانة والتركيبة</h3>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setShowEditGradeModal(false);
                  setEditingGrade(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!onUpdateConcreteGrade || !editingGrade) return;
                onUpdateConcreteGrade(editingGrade.id, {
                  code: editGradeData.code,
                  pricePerM3: Number(editGradeData.pricePerM3),
                  description: editGradeData.description,
                  recipe: [
                    { itemName: 'أسمنت', category: 'cement', kgPerM3: Number(editGradeData.cementKg) },
                    { itemName: 'رمل', category: 'sand', kgPerM3: Number(editGradeData.sandKg) },
                    { itemName: 'حصى', category: 'gravel', kgPerM3: Number(editGradeData.gravelKg) },
                    { itemName: 'سيكا (مواد كيميائية)', category: 'chemical', kgPerM3: Number(editGradeData.chemicalKg) },
                    { itemName: 'ماء', category: 'water', kgPerM3: Number(editGradeData.waterKg) },
                  ],
                });
                setShowEditGradeModal(false);
                setEditingGrade(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">اسم وتسمية الخرسانة (الرمز)</label>
                <input
                  type="text"
                  required
                  value={editGradeData.code}
                  onChange={(e) => setEditGradeData({ ...editGradeData, code: e.target.value })}
                  placeholder="مثال: خرسانة مسلحة C30/37 (B30)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-orange-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">سعر المتر المكعب (دج / م³)</label>
                  <input
                    type="number"
                    required
                    value={editGradeData.pricePerM3}
                    onChange={(e) => setEditGradeData({ ...editGradeData, pricePerM3: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الوصف والاستعمال</label>
                  <input
                    type="text"
                    value={editGradeData.description}
                    onChange={(e) => setEditGradeData({ ...editGradeData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-2">
                <div className="text-xs font-bold text-amber-900">تركيبة وجرعات المواد للمتر المكعب (1 م³):</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-0.5">أسمنت (كغ/م³)</label>
                    <input
                      type="number"
                      value={editGradeData.cementKg}
                      onChange={(e) => setEditGradeData({ ...editGradeData, cementKg: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5">رمل (كغ/م³)</label>
                    <input
                      type="number"
                      value={editGradeData.sandKg}
                      onChange={(e) => setEditGradeData({ ...editGradeData, sandKg: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5">حصى وزلط (كغ/م³)</label>
                    <input
                      type="number"
                      value={editGradeData.gravelKg}
                      onChange={(e) => setEditGradeData({ ...editGradeData, gravelKg: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5">مواد كيميائية - سيكا (لتر/م³)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editGradeData.chemicalKg}
                      onChange={(e) => setEditGradeData({ ...editGradeData, chemicalKg: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-600 mb-0.5">ماء الخلط (لتر/م³)</label>
                    <input
                      type="number"
                      value={editGradeData.waterKg}
                      onChange={(e) => setEditGradeData({ ...editGradeData, waterKg: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditGradeModal(false);
                    setEditingGrade(null);
                  }}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
