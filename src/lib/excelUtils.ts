import * as XLSX from 'xlsx';
import { DispatchInvoice, SupplierPurchase } from '../types';

/**
 * Export Customer Dispatch Invoices to Excel (.xlsx)
 */
export const exportCustomerInvoicesToExcel = (
  dispatches: DispatchInvoice[],
  filename: string = 'فواتير_العملاء_والإرساليات.xlsx'
) => {
  const data = dispatches.map((d, index) => ({
    'رقم التسلسل': index + 1,
    'رقم الفاتورة': d.invoiceNumber,
    'اسم العميل': d.customerName,
    'مكان الإرسال (الورشة)': d.deliverySite,
    'تاريخ الإرسال': d.deliveryDate,
    'وقت الإرسال': d.deliveryTime || '',
    'نوع الخرسانة': d.concreteGradeCode,
    'الكمية (م³)': d.volumeM3,
    'سعر المتر المكعب (دج)': d.pricePerM3,
    'تكلفة المضخة (دج)': d.pumpPrice || 0,
    'المبلغ الإجمالي (دج)': d.totalAmount,
    'المبلغ المدفوع (دج)': d.paidAmount,
    'الباقي المستحق (دج)': d.remainingAmount,
    'رمز الشاحنة / الخلاطة': d.vehicleCode || '',
    'اسم السائق': d.driverName || '',
    'ملاحظات': d.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'فواتير العملاء');
  XLSX.writeFile(workbook, filename);
};

/**
 * Export Supplier Purchases / Invoices to Excel (.xlsx)
 */
export const exportSupplierInvoicesToExcel = (
  purchases: SupplierPurchase[],
  filename: string = 'فواتير_المشتريات_والموردين.xlsx'
) => {
  const data = purchases.map((p, index) => ({
    'رقم التسلسل': index + 1,
    'رقم الفاتورة': p.invoiceNumber,
    'اسم المورد': p.supplierName,
    'التاريخ': p.date,
    'اسم المادة': p.itemName,
    'التصنيف': p.itemCategory,
    'الكمية': p.quantity,
    'الوحدة': p.unit,
    'سعر الوحدة (دج)': p.unitPrice,
    'المبلغ الإجمالي (دج)': p.totalAmount,
    'المبلغ المدفوع (دج)': p.paidAmount,
    'الباقي للمورد (دج)': p.totalAmount - p.paidAmount,
    'ملاحظات': p.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'فواتير الموردين');
  XLSX.writeFile(workbook, filename);
};

/**
 * Export All Invoices (Customer & Supplier) in a Single Excel Workbook
 */
export const exportAllInvoicesToExcel = (
  dispatches: DispatchInvoice[],
  purchases: SupplierPurchase[],
  filename: string = 'فواتير_الشركة_الشاملة.xlsx'
) => {
  const workbook = XLSX.utils.book_new();

  // Customer Dispatches Sheet
  const customerData = dispatches.map((d, index) => ({
    'رقم التسلسل': index + 1,
    'رقم الفاتورة': d.invoiceNumber,
    'اسم العميل': d.customerName,
    'مكان الإرسال': d.deliverySite,
    'تاريخ الإرسال': d.deliveryDate,
    'نوع الخرسانة': d.concreteGradeCode,
    'الكمية (م³)': d.volumeM3,
    'المبلغ الإجمالي (دج)': d.totalAmount,
    'المبلغ المدفوع (دج)': d.paidAmount,
    'الباقي (دج)': d.remainingAmount,
    'رمز الشاحنة': d.vehicleCode || '',
  }));
  const customerSheet = XLSX.utils.json_to_sheet(customerData);
  XLSX.utils.book_append_sheet(workbook, customerSheet, 'فواتير_العملاء');

  // Supplier Purchases Sheet
  const supplierData = purchases.map((p, index) => ({
    'رقم التسلسل': index + 1,
    'رقم الفاتورة': p.invoiceNumber,
    'اسم المورد': p.supplierName,
    'التاريخ': p.date,
    'اسم المادة': p.itemName,
    'الكمية': p.quantity,
    'سعر الوحدة': p.unitPrice,
    'المبلغ الإجمالي (دج)': p.totalAmount,
    'المبلغ المدفوع (دج)': p.paidAmount,
    'الباقي للمورد (دج)': p.totalAmount - p.paidAmount,
  }));
  const supplierSheet = XLSX.utils.json_to_sheet(supplierData);
  XLSX.utils.book_append_sheet(workbook, supplierSheet, 'فواتير_الموردين');

  XLSX.writeFile(workbook, filename);
};

/**
 * Import Customer Dispatch Invoices from an uploaded Excel / CSV file
 */
export const importCustomerInvoicesFromExcel = (
  file: File
): Promise<Partial<DispatchInvoice>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        const importedInvoices: Partial<DispatchInvoice>[] = jsonData.map((row, idx) => {
          const volumeM3 = Number(row['الكمية (م³)'] || row['Volume'] || row['volumeM3'] || 10);
          const pricePerM3 = Number(row['سعر المتر المكعب (دج)'] || row['Price'] || row['pricePerM3'] || 9500);
          const pumpPrice = Number(row['تكلفة المضخة (دج)'] || row['pumpPrice'] || 0);
          const totalAmount = Number(row['المبلغ الإجمالي (دج)'] || row['Total'] || (volumeM3 * pricePerM3 + pumpPrice));
          const paidAmount = Number(row['المبلغ المدفوع (دج)'] || row['Paid'] || row['paidAmount'] || 0);

          return {
            invoiceNumber: row['رقم الفاتورة'] || row['InvoiceNo'] || `INV-IMP-${1000 + idx}`,
            customerName: row['اسم العميل'] || row['Customer'] || 'عميل مستورد',
            deliverySite: row['مكان الإرسال (الورشة)'] || row['Site'] || 'ورشة مستوردة',
            deliveryDate: row['تاريخ الإرسال'] || row['Date'] || new Date().toISOString().split('T')[0],
            deliveryTime: row['وقت الإرسال'] || '08:00',
            concreteGradeCode: row['نوع الخرسانة'] || row['ConcreteGrade'] || 'خرسانة مسلحة C25/30',
            volumeM3,
            pricePerM3,
            pumpPrice,
            totalAmount,
            paidAmount,
            remainingAmount: totalAmount - paidAmount,
            vehicleCode: row['رمز الشاحنة / الخلاطة'] || row['Vehicle'] || '',
            driverName: row['اسم السائق'] || '',
            notes: row['ملاحظات'] || 'مستورد من ملف Excel',
            status: 'delivered',
          };
        });

        resolve(importedInvoices);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};

/**
 * Import Supplier Purchases / Invoices from an uploaded Excel / CSV file
 */
export const importSupplierInvoicesFromExcel = (
  file: File
): Promise<Partial<SupplierPurchase>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        const importedPurchases: Partial<SupplierPurchase>[] = jsonData.map((row, idx) => {
          const quantity = Number(row['الكمية'] || row['Quantity'] || 1);
          const unitPrice = Number(row['سعر الوحدة (دج)'] || row['UnitPrice'] || 10000);
          const totalAmount = Number(row['المبلغ الإجمالي (دج)'] || row['Total'] || (quantity * unitPrice));
          const paidAmount = Number(row['المبلغ المدفوع (دج)'] || row['Paid'] || 0);

          return {
            invoiceNumber: row['رقم الفاتورة'] || row['InvoiceNo'] || `SUP-IMP-${1000 + idx}`,
            supplierName: row['اسم المورد'] || row['Supplier'] || 'مورد مستورد',
            date: row['التاريخ'] || row['Date'] || new Date().toISOString().split('T')[0],
            itemName: row['اسم المادة'] || row['Item'] || 'مادة خام',
            itemCategory: (row['التصنيف'] || row['Category'] || 'cement') as any,
            quantity,
            unit: row['الوحدة'] || row['Unit'] || 'ton',
            unitPrice,
            totalAmount,
            paidAmount,
            notes: row['ملاحظات'] || 'مستورد من ملف Excel',
          };
        });

        resolve(importedPurchases);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};
