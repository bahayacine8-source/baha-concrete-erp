import React, { useState } from 'react';
import { 
  DispatchInvoice, 
  SupplierPurchase, 
  WorkerPayment, 
  Worker, 
  Language, 
  ConcreteGrade 
} from '../types';
import { getTranslation } from '../lib/translations';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Printer, 
  Calendar, 
  PieChart, 
  Layers, 
  Users, 
  Truck 
} from 'lucide-react';

interface ReportsViewProps {
  dispatches: DispatchInvoice[];
  purchases: SupplierPurchase[];
  payments: WorkerPayment[];
  workers: Worker[];
  concreteGrades: ConcreteGrade[];
  currentLang: Language;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  dispatches,
  purchases,
  payments,
  workers,
  concreteGrades,
  currentLang,
}) => {
  const t = getTranslation(currentLang);
  const [selectedMonth, setSelectedMonth] = useState('2026-07');

  // Calculations
  const totalSalesRevenue = dispatches.reduce((acc, d) => acc + d.totalAmount, 0);
  const totalRawMaterialPurchases = purchases.reduce((acc, p) => acc + p.totalAmount, 0);
  const totalWorkerAdvancesAndSalary = payments.reduce((acc, p) => acc + p.amount, 0);
  const estimatedFuelFleetExpenses = Math.round(totalSalesRevenue * 0.08); // 8% operating fuel estimate

  const totalExpenses = totalRawMaterialPurchases + totalWorkerAdvancesAndSalary + estimatedFuelFleetExpenses;
  const netProfit = totalSalesRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-orange-600" />
            <span>{t.financialReports}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            جدول حساب الأرباح والخسائر، تكاليف المواد الخام والرواتب والوقود
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
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{t.exportReport}</span>
          </button>
        </div>
      </div>

      {/* P&L Cards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">{t.totalRevenue}</span>
          <div className="text-2xl font-black text-emerald-600">
            {totalSalesRevenue.toLocaleString()} دج
          </div>
          <p className="text-xs text-slate-400">مجموع المبيعات والفواتير الصادرة</p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">إجمالي المصاريف والمشتروات</span>
          <div className="text-2xl font-black text-rose-600">
            {totalExpenses.toLocaleString()} دج
          </div>
          <p className="text-xs text-slate-400">مواد خام + رواتب عمال + وقود وصيانة</p>
        </div>

        {/* Net Profit */}
        <div className={`p-5 rounded-2xl border shadow-xs space-y-2 ${
          netProfit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
        }`}>
          <span className="text-xs font-semibold text-slate-700 uppercase">{t.netProfit}</span>
          <div className={`text-2xl font-black ${netProfit >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
            {netProfit.toLocaleString()} دج
          </div>
          <p className="text-xs text-slate-600">الفائض النهائي الصافي للشركة</p>
        </div>

      </div>

      {/* Detailed Expense & Revenue Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base">تفاصيل جدول الحسابات والأرباح/الخسائر (P&L):</h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between p-3 bg-emerald-50 text-emerald-900 rounded-xl font-bold">
            <span>1. إجمالي مبيعات الخرسانة الجاهزة (+):</span>
            <span>{totalSalesRevenue.toLocaleString()} دج</span>
          </div>

          <div className="flex justify-between p-3 bg-slate-50 text-slate-800 rounded-xl">
            <span>2. مشتريات المواد الخام (أسمنت، رمل، حصى، سيكا) (-):</span>
            <span className="font-bold text-rose-600">-{totalRawMaterialPurchases.toLocaleString()} دج</span>
          </div>

          <div className="flex justify-between p-3 bg-slate-50 text-slate-800 rounded-xl">
            <span>3. أجور ورواتب والدفعات للعمال (-):</span>
            <span className="font-bold text-rose-600">-{totalWorkerAdvancesAndSalary.toLocaleString()} دج</span>
          </div>

          <div className="flex justify-between p-3 bg-slate-50 text-slate-800 rounded-xl">
            <span>4. تقديرات الوقود والصيانة للأسطول (-):</span>
            <span className="font-bold text-rose-600">-{estimatedFuelFleetExpenses.toLocaleString()} دج</span>
          </div>

          <div className="pt-3 border-t-2 border-slate-200 flex justify-between p-4 bg-orange-600 text-white rounded-xl font-black text-base">
            <span>الربح الصافي النظيف المستخلص:</span>
            <span>{netProfit.toLocaleString()} دج</span>
          </div>
        </div>
      </div>

    </div>
  );
};
