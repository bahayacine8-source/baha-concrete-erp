import React, { useRef } from 'react';
import { DispatchInvoice, Customer, Company } from '../types';
import { 
  Printer, 
  X, 
  FileText, 
  CheckCircle2, 
  Building2, 
  Phone, 
  MapPin, 
  QrCode, 
  Receipt, 
  Download,
  Factory
} from 'lucide-react';

interface PrintInvoiceModalProps {
  invoice: DispatchInvoice | null;
  customer?: Customer;
  company: Company;
  onClose: () => void;
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({
  invoice,
  customer,
  company,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-sm">نظام الطباعة الاحترافي — Baha Concrete ERP (A4 / وصل التسليم)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الفاتورة الآن (Print)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
          <div
            ref={printRef}
            id="printable-document"
            className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs max-w-2xl mx-auto space-y-6 text-slate-800 text-xs font-sans print:p-0 print:border-none print:shadow-none"
          >
            {/* Header / Company Letterhead */}
            <div className="flex justify-between items-start border-b-2 border-orange-600 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-600 text-white rounded-xl">
                    <Factory className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-lg font-black text-slate-900">{company.name || 'مصنع الخرسانة الجاهزة BPE'}</h1>
                    <p className="text-[10px] text-slate-500 font-semibold">BAHA READY-MIX CONCRETE FACTORY</p>
                  </div>
                </div>
                <div className="text-[10px] text-slate-600 space-y-0.5 pt-1">
                  <div>📍 العنوان: {company.address || 'المنطقة الصناعية - الجزائر'}</div>
                  <div>📞 الهاتف: {company.phone || '0550 00 00 00'} | البريد: {company.email}</div>
                  {company.commercialRegNumber && (
                    <div>📑 السجل التجاري: {company.commercialRegNumber} | NIF: {company.taxNumber || '002012345678'}</div>
                  )}
                </div>
              </div>

              <div className="text-end space-y-1">
                <div className="px-3 py-1 bg-orange-100 text-orange-900 rounded-lg text-sm font-black font-mono border border-orange-200 inline-block">
                  {invoice.invoiceNumber}
                </div>
                <div className="text-[11px] font-bold text-slate-700">وصل تسليم خرسانة (Bon de Livraison)</div>
                <div className="text-[10px] text-slate-500 font-mono">
                  التاريخ: {invoice.deliveryDate} {invoice.deliveryTime}
                </div>
              </div>
            </div>

            {/* Customer & Delivery Site Info */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="space-y-1 border-e border-slate-200 pe-3">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">معلومات العميل المستلم</span>
                <div className="font-bold text-slate-900 text-sm">{invoice.customerName}</div>
                {customer?.phone && <div>📞 {customer.phone}</div>}
                {customer?.taxNumber && <div>الرقم الضريبي: {customer.taxNumber}</div>}
              </div>

              <div className="space-y-1 ps-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">موقع التفريغ والورشة</span>
                <div className="font-bold text-slate-900">{invoice.deliverySite}</div>
                <div>عدد الشاحنات/الرحلات المرسلة: <span className="font-black text-orange-900">{invoice.numberOfTrucks || 1} شاحنات (رحلات)</span></div>
                <div>رمز الشاحنة: <span className="font-mono font-bold text-slate-800">{invoice.vehicleCode}</span> | السائق: <span className="font-semibold">{invoice.driverName}</span></div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-start">
                <thead className="bg-slate-900 text-white font-bold text-[11px]">
                  <tr>
                    <th className="p-2.5 text-start">الوصف / درجة الخرسانة</th>
                    <th className="p-2.5 text-center">الكمية (m³)</th>
                    <th className="p-2.5 text-end">سعر المتر³ (دج)</th>
                    <th className="p-2.5 text-end">المجموع الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs font-semibold">
                  <tr>
                    <td className="p-3 font-bold text-slate-900">
                      خرسانة جاهزة BPE — درجة {invoice.concreteGradeCode}
                      <p className="text-[10px] text-slate-500 font-normal">تفريغ مضخة بالموقع مع إضافة الملدنات المعيارية</p>
                    </td>
                    <td className="p-3 text-center font-black font-mono text-slate-900">{invoice.volumeM3} م³</td>
                    <td className="p-3 text-end font-mono text-slate-700">{invoice.pricePerM3.toLocaleString('ar-DZ')} دج</td>
                    <td className="p-3 text-end font-mono font-black text-slate-900">{invoice.totalAmount.toLocaleString('ar-DZ')} دج</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Financial Totals & Payments */}
            <div className="flex justify-between items-end pt-2">
              <div className="space-y-2 max-w-xs">
                <div className="p-2 bg-slate-100 rounded-lg text-[10px] text-slate-600 space-y-1">
                  <div>* تعتبر الخرسانة المسلمة مطابقة للمواصفات المعيارية بعد التفريغ.</div>
                  <div>* المرجو توقيع وصل التسليم وإعادته للسائق.</div>
                </div>
                <div className="flex items-center gap-3 pt-2 text-[10px]">
                  <div>توقيع واستلام العميل: ...................</div>
                  <div>ختم المصنع: ...................</div>
                </div>
              </div>

              <div className="w-56 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>المبلغ الصافي HT:</span>
                  <span className="font-mono">{invoice.totalAmount.toLocaleString('ar-DZ')} دج</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>المدفوع تسبيقاً:</span>
                  <span className="font-mono font-bold text-emerald-600">{(invoice.paidAmount || 0).toLocaleString('ar-DZ')} دج</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 border-t border-slate-300 pt-1 text-sm">
                  <span>المتبقي (الذمة):</span>
                  <span className="font-mono text-rose-600">{(invoice.remainingAmount || 0).toLocaleString('ar-DZ')} دج</span>
                </div>
              </div>
            </div>

            {/* Footer Bar */}
            <div className="border-t border-slate-200 pt-3 text-center text-[10px] text-slate-400 space-y-0.5">
              <div>برنامج باحة لإدارة مصانع الخرسانة J2EE & React Enterprise Edition v3.5</div>
              <div>طباعة معتمدة تلقائياً برقم المعاملة الفريد: {invoice.id}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
