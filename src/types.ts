export type SyncOperation = 'CREATE' | 'UPDATE' | 'DELETE';
export type SyncItemStatus = 'pending' | 'synced' | 'conflict' | 'failed';

export interface SyncQueueItem {
  id: string;
  deviceId: string;
  tableName: string;
  recordId: string;
  operation: SyncOperation;
  status: SyncItemStatus;
  createdAt: string;
  syncedAt: string | null;
  payload: any;
  updatedAt: string;
  companyId: string;
}

export type Language = 'ar' | 'fr' | 'en';

export type AccountStatus = 'trial' | 'active' | 'expired' | 'suspended';

export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxNumber?: string;
  commercialRegNumber?: string;
  logoUrl?: string;
  status: AccountStatus;
  trialStartDate?: string;
  trialEndDate?: string;
  createdAt: string;
}

export type UserRole = 
  | 'admin' 
  | 'manager' 
  | 'accountant' 
  | 'production_operator' 
  | 'warehouse_operator' 
  | 'scale_operator' 
  | 'superadmin' 
  | 'company_owner';

export type StationWorkstation = 'manager_pc' | 'production_pc' | 'warehouse_pc' | 'scale_pc' | 'accounting_pc' | 'all';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  companyId: string;
  workstation?: StationWorkstation;
  permissions?: string[];
  status?: 'active' | 'disabled';
}

export type WorkerRole = 
  | 'mixer_driver' 
  | 'pump_operator' 
  | 'loader_operator' 
  | 'lab_tech' 
  | 'plant_operator' 
  | 'mechanic' 
  | 'admin' 
  | 'general_worker';

export type SalaryType = 'monthly' | 'daily' | 'per_trip';

export interface Worker {
  id: string;
  companyId: string;
  name: string;
  role: WorkerRole;
  phone: string;
  salaryType: SalaryType;
  baseSalary: number; // e.g. monthly rate or daily rate
  joinedDate: string;
  status: 'active' | 'inactive';
  nationalId?: string;
  notes?: string;
}

export interface WorkerPayment {
  id: string;
  companyId: string;
  workerId: string;
  workerName: string;
  monthYear: string; // e.g. "2026-07"
  type: 'salary' | 'advance' | 'bonus' | 'deduction';
  amount: number;
  date: string;
  notes?: string;
}

export interface WorkerPayrollSummary {
  workerId: string;
  workerName: string;
  role: WorkerRole;
  monthYear: string;
  baseSalary: number;
  totalAdvances: number;
  totalBonuses: number;
  totalDeductions: number;
  netPayable: number;
  paidAmount: number;
  remainingAmount: number;
}

export type VehicleType = 'concrete_mixer' | 'concrete_pump' | 'tipper_truck' | 'wheel_loader' | 'service_car';

export interface Vehicle {
  id: string;
  companyId: string;
  plateNumber: string;
  codeName: string; // e.g., "Mixer #01"
  type: VehicleType;
  capacityM3?: number; // capacity in m³ for mixers/pumps
  driverName?: string;
  status: 'active' | 'maintenance' | 'out_of_service';
  insuranceExpiry?: string;
  techInspectionExpiry?: string;
  totalTrips?: number;
  lastServiceDate?: string;
  notes?: string;
}

export interface FuelLog {
  id: string;
  companyId: string;
  vehicleId: string;
  vehicleCode: string;
  date: string;
  liters: number;
  cost: number;
  odometer: number;
  notes?: string;
}

export interface Supplier {
  id: string;
  companyId: string;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  suppliedMaterials: string[]; // e.g. ['Cement', 'Sika Chemical']
  totalPurchasesAmount: number;
  totalPaidAmount: number;
  balanceDue: number;
}

export interface SupplierPurchase {
  id: string;
  companyId: string;
  supplierId: string;
  supplierName: string;
  invoiceNumber: string;
  date: string;
  itemName: string;
  itemCategory: InventoryCategory;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  paidAmount: number;
  notes?: string;
}

export type InventoryCategory = 
  | 'cement'       // أسمنت
  | 'sand'         // رمل
  | 'gravel'       // حصى (3/8, 8/15, 15/25)
  | 'chemical'     // مواد كيميائية (سيكا, ملينات, مسرعات)
  | 'water'        // ماء
  | 'other';       // أخرى

export interface InventoryItem {
  id: string;
  companyId: string;
  name: string;
  category: InventoryCategory;
  currentStock: number;
  minThreshold: number;
  unit: 'ton' | 'm3' | 'liter' | 'kg' | 'bag';
  unitCost: number;
  supplierName?: string;
  lastRestockDate?: string;
}

export interface MixFormulaComponent {
  itemId: string;
  itemName: string;
  category: InventoryCategory;
  kgPerM3: number; // e.g., 350 kg cement per m³
}

export interface ConcreteGrade {
  id: string;
  companyId: string;
  code: string; // e.g., "C25/30", "C30/37", "C20/25", "Sika-Waterproof C30"
  description: string;
  pricePerM3: number;
  recipe: MixFormulaComponent[];
}

export interface CustomerProject {
  id: string;
  name: string;
  siteAddress?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  companyId: string;
  name: string;
  companyName?: string;
  phone: string;
  address: string;
  taxNumber?: string;
  projects?: CustomerProject[];
  totalOrdersCount: number;
  totalVolumeM3: number;
  totalBilledAmount: number;
  totalPaidAmount: number;
  balanceDue: number; // الباقي المستحق
}

export interface InventoryMovement {
  id: string;
  companyId: string;
  itemId: string;
  itemName: string;
  category: InventoryCategory;
  type: 'in' | 'out'; // دخول شحنة أو خروج استهلاك
  quantity: number;
  unit: string;
  date: string;
  supplierName?: string;
  truckPlate?: string;
  notes?: string;
  recordedBy?: string;
}

export interface CustomerPayment {
  id: string;
  companyId: string;
  customerId: string;
  customerName: string;
  date: string;
  amount: number;
  paymentMethod: 'cash' | 'check' | 'bank_transfer';
  referenceNumber?: string;
  notes?: string;
}

export interface DispatchInvoice {
  id: string;
  companyId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  deliverySite: string; // مكان الإرسال
  deliveryDate: string; // تاريخ الإرسال
  deliveryTime?: string;
  concreteGradeCode: string; // نوع الخرسانة
  volumeM3: number; // الكمية بالتر
  numberOfTrucks?: number; // عدد الشاحنات / الرحلات المرسلة
  pricePerM3: number;
  pumpPrice?: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number; // الباقي
  vehicleCode?: string; // الشاحنة المرسلة
  driverName?: string;
  slumpMm?: number;
  status: 'pending' | 'dispatched' | 'delivered' | 'cancelled';
  notes?: string;
}

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  companyId: string;
  customerId: string;
  customerName: string;
  projectName?: string;
  concreteGradeCode: string;
  quantityM3: number;
  numberOfTrucks?: number; // عدد الشاحنات / الرحلات المرسلة
  plantName?: string; // e.g. "محطة الخلط الرئيسية #01"
  driverName: string;
  truckPlate: string;
  date: string;
  time?: string;
  status: 'draft' | 'in_production' | 'completed' | 'cancelled';
  materialsDeducted?: boolean;
  notes?: string;
}

export interface DailyReportSummary {
  totalConcreteSoldM3: number;
  totalSalesRevenue: number;
  totalMaterialCost: number;
  totalWorkerSalaryCost: number;
  totalFuelCost: number;
  netProfit: number;
}

export interface AuditLog {
  id: string;
  companyId: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: string;
}
