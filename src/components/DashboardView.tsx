import React from 'react';
import { 
  DispatchInvoice, 
  InventoryItem, 
  Customer, 
  Language, 
  Vehicle 
} from '../types';
import { getTranslation } from '../lib/translations';
import { 
  Building2, 
  Truck, 
  PlusCircle, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Layers, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  ArrowUpRight,
  Droplets,
  PackageCheck
} from 'lucide-react';

interface DashboardViewProps {
  dispatches: DispatchInvoice[];
  inventory: InventoryItem[];
  customers: Customer[];
  vehicles: Vehicle[];
  currentLang: Language;
  onNavigateTab: (tab: any) => void;
  onOpenQuickDispatch: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  dispatches,
  inventory,
  customers,
  vehicles,
  currentLang,
  onNavigateTab,
  onOpenQuickDispatch,
}) => {
  const t = getTranslation(currentLang);

  // Calculations
  const totalVolumeM3 = dispatches.reduce((acc, d) => acc + (d.volumeM3 || 0), 0);
  const totalRevenue = dispatches.reduce((acc, d) => acc + (d.totalAmount || 0), 0);
  const totalUnpaidBalances = customers.reduce((acc, c) => acc + (c.balanceDue || 0), 0);
  const todayDispatchesCount = dispatches.filter(d => {
    const todayStr = new Date().toISOString().split('T')[0];
    return d.deliveryDate === todayStr;
  }).length;

  const lowStockItems = inventory.filter(i => i.currentStock <= i.minThreshold);
  const activeMixersCount = vehicles.filter(v => v.type === 'concrete_mixer' && v.status === 'active').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Welcome Action */}
      <div className="bg-orange-500 rounded-2xl shadow-md p-6 text-white relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative z-10">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {t.appTitle}
          </h2>
          <p className="text-orange-100 text-sm mt-1 font-medium max-w-xl">
            {t.subTitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenQuickDispatch}
          className="relative z-10 px-5 py-3 bg-white text-orange-600 hover:bg-orange-50 font-bold rounded-xl shadow-md transition-all hover:scale-[1.02] flex items-center gap-2 shrink-0 cursor-pointer text-sm"
        >
          <PlusCircle className="w-5 h-5 text-orange-600" />
          <span>{t.quickDispatch}</span>
        </button>

        {/* Decorative background circle */}
        <div className="absolute -end-10 -bottom-10 w-48 h-48 bg-orange-400/30 rounded-full pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Concrete Volume */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              {t.totalConcreteSold}
            </span>
            <div className="text-2xl font-black text-gray-800 mt-1">
              {totalVolumeM3.toLocaleString()} <span className="text-xs font-bold text-gray-400">{t.m3Unit}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 font-bold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12% {t.monthly}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              {t.monthlyRevenue}
            </span>
            <div className="text-2xl font-black text-gray-800 mt-1">
              {totalRevenue.toLocaleString()} <span className="text-xs font-bold text-gray-400">{t.dzdCurrency}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 font-bold mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{dispatches.length} {t.activeDispatches}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Unpaid Customer Balances */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              {t.unpaidBalances}
            </span>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {totalUnpaidBalances.toLocaleString()} <span className="text-xs font-bold text-gray-400">{t.dzdCurrency}</span>
            </div>
            <span className="text-xs text-gray-500 font-semibold mt-1 block">
              {customers.filter(c => c.balanceDue > 0).length} {t.customers}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
            <TrendingUp className="w-6 h-6 rotate-180" />
          </div>
        </div>

        {/* KPI 4: Active Fleet */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              {t.concrete_mixer}
            </span>
            <div className="text-2xl font-black text-gray-800 mt-1">
              {activeMixersCount} / {vehicles.length}
            </div>
            <span className="text-xs text-green-600 font-bold mt-1 block">
              {t.statusActive}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Grid: Dispatches vs Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dispatches Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-800 text-base">{t.recentDeliveries}</h3>
              <p className="text-xs text-gray-400">فواتير وإرساليات الخرسانة الجاهزة ومواقع التسليم</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('customers')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
            >
              <span>{t.customersAndSales}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-start border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase sticky top-0">
                  <th className="p-3 text-start rounded-s-xl">{t.invoiceNo}</th>
                  <th className="p-3 text-start">{t.customerName}</th>
                  <th className="p-3 text-start">{t.deliverySite}</th>
                  <th className="p-3 text-start">{t.concreteGrade}</th>
                  <th className="p-3 text-start">{t.volumeM3Sent}</th>
                  <th className="p-3 text-start rounded-e-xl">{t.remainingBalanceDue}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dispatches.slice(0, 5).map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-bold text-gray-800">{d.invoiceNumber}</td>
                    <td className="p-3 font-bold text-gray-800">{d.customerName}</td>
                    <td className="p-3 text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span className="truncate max-w-[140px] text-xs">{d.deliverySite}</span>
                    </td>
                    <td className="p-3 font-bold text-orange-600">{d.concreteGradeCode}</td>
                    <td className="p-3 font-extrabold text-gray-800">{d.volumeM3} م³</td>
                    <td className="p-3">
                      {d.remainingAmount > 0 ? (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold">
                          {d.remainingAmount.toLocaleString()} دج
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">
                          خالص
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Widget: Low Stock & Raw Material Levels */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
              <Droplets className="w-5 h-5 text-orange-500" />
              <span>{t.inventoryManagement}</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('inventory')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
            >
              {t.inventory}
            </button>
          </div>

          {lowStockItems.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-rose-800">{t.lowStockAlerts}</p>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  يرجى إعادة تزويد الشحنات لتفادي توقف خلاطة الخرسانة الجاهزة.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {inventory.slice(0, 5).map((item) => {
              const percent = Math.min(100, Math.round((item.currentStock / (item.minThreshold * 3)) * 100));
              const isLow = item.currentStock <= item.minThreshold;

              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-gray-700">{item.name}</span>
                    <span className={`font-extrabold ${isLow ? 'text-rose-600' : 'text-gray-800'}`}>
                      {item.currentStock} {item.unit}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${isLow ? 'bg-rose-500' : 'bg-orange-500'}`} 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => onNavigateTab('inventory')}
              className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PackageCheck className="w-4 h-4 text-gray-500" />
              <span>إدارة وتزويد المواد الخام</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
