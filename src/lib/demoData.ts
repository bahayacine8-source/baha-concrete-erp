import {
  Company,
  Worker,
  WorkerPayment,
  Vehicle,
  Supplier,
  SupplierPurchase,
  InventoryItem,
  ConcreteGrade,
  Customer,
  DispatchInvoice,
  CustomerPayment
} from '../types';

export const INITIAL_COMPANY: Company = {
  id: 'comp_baha_001',
  name: 'معمل بهاء للخرسانة الجاهزة - Baha Concrete ReadyMix',
  email: 'bahayacine8@gmail.com',
  phone: '06 61 23 45 67',
  address: 'المنطقة الصناعية - بسكرة / الجزائر',
  taxNumber: '001928374655432',
  commercialRegNumber: '26/00-0987654B19',
  status: 'active',
  trialStartDate: '2026-01-01',
  trialEndDate: '2027-01-01',
  createdAt: '2026-01-01T08:00:00Z',
};

export const INITIAL_WORKERS: Worker[] = [
  {
    id: 'w1',
    companyId: 'comp_baha_001',
    name: 'عماد الدين بن علي',
    role: 'plant_operator',
    phone: '06 62 11 22 33',
    salaryType: 'monthly',
    baseSalary: 65000,
    joinedDate: '2025-02-15',
    status: 'active'
  },
  {
    id: 'w2',
    companyId: 'comp_baha_001',
    name: 'عبد القادر سليماني',
    role: 'mixer_driver',
    phone: '06 71 44 55 66',
    salaryType: 'monthly',
    baseSalary: 52000,
    joinedDate: '2025-03-01',
    status: 'active'
  },
  {
    id: 'w3',
    companyId: 'comp_baha_001',
    name: 'محمد الهادي العايب',
    role: 'pump_operator',
    phone: '06 55 99 88 77',
    salaryType: 'monthly',
    baseSalary: 58000,
    joinedDate: '2025-04-10',
    status: 'active'
  },
  {
    id: 'w4',
    companyId: 'comp_baha_001',
    name: 'ياسين بومدين',
    role: 'lab_tech',
    phone: '06 63 77 11 22',
    salaryType: 'monthly',
    baseSalary: 60000,
    joinedDate: '2025-05-20',
    status: 'active'
  }
];

export const INITIAL_WORKER_PAYMENTS: WorkerPayment[] = [
  {
    id: 'wp1',
    companyId: 'comp_baha_001',
    workerId: 'w2',
    workerName: 'عبد القادر سليماني',
    monthYear: '2026-07',
    type: 'advance',
    amount: 15000,
    date: '2026-07-10',
    notes: 'تسليفة منتصف الشهر'
  },
  {
    id: 'wp2',
    companyId: 'comp_baha_001',
    workerId: 'w1',
    workerName: 'عماد الدين بن علي',
    monthYear: '2026-07',
    type: 'advance',
    amount: 20000,
    date: '2026-07-12',
    notes: 'دفعة سلفة على الحساب'
  }
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    companyId: 'comp_baha_001',
    plateNumber: '01234-325-07',
    codeName: 'خلاطة خرسانة #01 (Mixer Truck 10m³)',
    type: 'concrete_mixer',
    capacityM3: 10,
    driverName: 'عبد القادر سليماني',
    status: 'active',
    insuranceExpiry: '2026-11-30',
    techInspectionExpiry: '2026-10-15',
    totalTrips: 142
  },
  {
    id: 'v2',
    companyId: 'comp_baha_001',
    plateNumber: '05678-325-07',
    codeName: 'خلاطة خرسانة #02 (Mixer Truck 12m³)',
    type: 'concrete_mixer',
    capacityM3: 12,
    driverName: 'سفيان قاسمي',
    status: 'active',
    insuranceExpiry: '2026-12-20',
    techInspectionExpiry: '2026-09-01',
    totalTrips: 118
  },
  {
    id: 'v3',
    companyId: 'comp_baha_001',
    plateNumber: '09911-325-07',
    codeName: 'مضخة خرسانة 36م (Concrete Pump 36m)',
    type: 'concrete_pump',
    capacityM3: 36,
    driverName: 'محمد الهادي العايب',
    status: 'active',
    insuranceExpiry: '2027-01-10',
    techInspectionExpiry: '2026-12-05',
    totalTrips: 85
  },
  {
    id: 'v4',
    companyId: 'comp_baha_001',
    plateNumber: '00442-325-07',
    codeName: 'جرافة شحن CAT 950 (Wheel Loader)',
    type: 'wheel_loader',
    status: 'active',
    insuranceExpiry: '2026-08-30',
    techInspectionExpiry: '2026-08-15',
    totalTrips: 0
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup1',
    companyId: 'comp_baha_001',
    name: 'مجمع الأسمنت الجزائري GICA - عين التوتة',
    contactPerson: 'السيد طارق زياني',
    phone: '033 88 77 66',
    address: 'مصنع الأسمنت - باتنة / الجزائر',
    suppliedMaterials: ['أسمنت CPJ 42.5', 'أسمنت مقاوم للكبريتات CRS'],
    totalPurchasesAmount: 3800000,
    totalPaidAmount: 3000000,
    balanceDue: 800000
  },
  {
    id: 'sup2',
    companyId: 'comp_baha_001',
    name: 'شركة سيكا الجزائر Sika Algeria (مواد كيميائية)',
    contactPerson: 'المهندس أمين حماني',
    phone: '021 55 44 33',
    address: 'المنطقة الصناعية - الجزائر العاصمة',
    suppliedMaterials: ['ملينات Sika Plastiment', 'مسرعات التصلب Sika-1'],
    totalPurchasesAmount: 650000,
    totalPaidAmount: 500000,
    balanceDue: 150000
  },
  {
    id: 'sup3',
    companyId: 'comp_baha_001',
    name: 'مقالع ومحجرة الأطلس للحصى والرمل الممتاز',
    contactPerson: 'السيد رابح معوش',
    phone: '033 92 10 20',
    address: 'طريق القنطرة - بسكرة',
    suppliedMaterials: ['رمل مغسول', 'حصى 8/15', 'حصى 15/25'],
    totalPurchasesAmount: 2100000,
    totalPaidAmount: 1900000,
    balanceDue: 200000
  }
];

export const INITIAL_SUPPLIER_PURCHASES: SupplierPurchase[] = [
  {
    id: 'sp1',
    companyId: 'comp_baha_001',
    supplierId: 'sup1',
    supplierName: 'مجمع الأسمنت الجزائري GICA - عين التوتة',
    invoiceNumber: 'GICA-2026-882',
    date: '2026-07-02',
    itemName: 'أسمنت فائق الجودة CPJ 42.5',
    itemCategory: 'cement',
    quantity: 60,
    unit: 'ton',
    unitPrice: 18000,
    totalAmount: 1080000,
    paidAmount: 800000,
    notes: 'شحنة أسمنت صومعة رقم 1'
  },
  {
    id: 'sp2',
    companyId: 'comp_baha_001',
    supplierId: 'sup2',
    supplierName: 'شركة سيكا الجزائر Sika Algeria (مواد كيميائية)',
    invoiceNumber: 'SIKA-INV-441',
    date: '2026-07-10',
    itemName: 'مادة كيميائية سيكا بلاستيمنت Sika Plastiment',
    itemCategory: 'chemical',
    quantity: 1200,
    unit: 'liter',
    unitPrice: 250,
    totalAmount: 300000,
    paidAmount: 300000,
    notes: 'براميل مادة مسيلة ومخفضة للماء'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv1',
    companyId: 'comp_baha_001',
    name: 'أسمنت بورتلاندي CPJ 42.5 (Cement)',
    category: 'cement',
    currentStock: 145, // tons
    minThreshold: 30,
    unit: 'ton',
    unitCost: 18000, // DZD per ton
    supplierName: 'GICA',
    lastRestockDate: '2026-07-02'
  },
  {
    id: 'inv2',
    companyId: 'comp_baha_001',
    name: 'رمل وادي مغسول ممتاز 0/4 (Sand)',
    category: 'sand',
    currentStock: 420, // m³
    minThreshold: 80,
    unit: 'm3',
    unitCost: 1400,
    supplierName: 'محجرة الأطلس',
    lastRestockDate: '2026-07-05'
  },
  {
    id: 'inv3',
    companyId: 'comp_baha_001',
    name: 'حصى زلط مكسر 8/15 (Gravel 8/15)',
    category: 'gravel',
    currentStock: 350, // m³
    minThreshold: 60,
    unit: 'm3',
    unitCost: 1600,
    supplierName: 'محجرة الأطلس',
    lastRestockDate: '2026-07-08'
  },
  {
    id: 'inv4',
    companyId: 'comp_baha_001',
    name: 'حصى زلط مكسر 15/25 (Gravel 15/25)',
    category: 'gravel',
    currentStock: 280, // m³
    minThreshold: 50,
    unit: 'm3',
    unitCost: 1650,
    supplierName: 'محجرة الأطلس',
    lastRestockDate: '2026-07-08'
  },
  {
    id: 'inv5',
    companyId: 'comp_baha_001',
    name: 'إضافة كيميائية سيكا بلاستيمنت (Sika Chemical Admixture)',
    category: 'chemical',
    currentStock: 1800, // liters
    minThreshold: 300,
    unit: 'liter',
    unitCost: 250,
    supplierName: 'Sika Algeria',
    lastRestockDate: '2026-07-10'
  },
  {
    id: 'inv6',
    companyId: 'comp_baha_001',
    name: 'ماء الخلط النقي (Mixing Water)',
    category: 'water',
    currentStock: 50000, // liters
    minThreshold: 10000,
    unit: 'liter',
    unitCost: 2,
    supplierName: 'خزان المصنع المركز'
  }
];

export const INITIAL_CONCRETE_GRADES: ConcreteGrade[] = [
  {
    id: 'cg1',
    companyId: 'comp_baha_001',
    code: 'خرسانة مسلحة C25/30 (B25)',
    description: 'خرسانة معيارية للأساسات والأعمدة والأرصفة',
    pricePerM3: 9800,
    recipe: [
      { itemId: 'inv1', itemName: 'أسمنت CPJ 42.5', category: 'cement', kgPerM3: 350 },
      { itemId: 'inv2', itemName: 'رمل مغسول', category: 'sand', kgPerM3: 780 },
      { itemId: 'inv3', itemName: 'حصى 8/15', category: 'gravel', kgPerM3: 420 },
      { itemId: 'inv4', itemName: 'حصى 15/25', category: 'gravel', kgPerM3: 650 },
      { itemId: 'inv5', itemName: 'إضافة سيكا Sika', category: 'chemical', kgPerM3: 2.5 },
      { itemId: 'inv6', itemName: 'ماء', category: 'water', kgPerM3: 175 }
    ]
  },
  {
    id: 'cg2',
    companyId: 'comp_baha_001',
    code: 'خرسانة عالية المقاومة C30/37 (B30)',
    description: 'خرسانة قوية للجسور والأبراج والأسقف المسلحة بكثافة',
    pricePerM3: 11200,
    recipe: [
      { itemId: 'inv1', itemName: 'أسمنت CPJ 42.5', category: 'cement', kgPerM3: 400 },
      { itemId: 'inv2', itemName: 'رمل مغسول', category: 'sand', kgPerM3: 750 },
      { itemId: 'inv3', itemName: 'حصى 8/15', category: 'gravel', kgPerM3: 450 },
      { itemId: 'inv4', itemName: 'حصى 15/25', category: 'gravel', kgPerM3: 620 },
      { itemId: 'inv5', itemName: 'إضافة سيكا Sika', category: 'chemical', kgPerM3: 4.0 },
      { itemId: 'inv6', itemName: 'ماء', category: 'water', kgPerM3: 170 }
    ]
  },
  {
    id: 'cg3',
    companyId: 'comp_baha_001',
    code: 'خرسانة عازلة ومقاومة للماء بالسيكا Sika-Waterproof C30',
    description: 'خصيصا للخزانات والمشروعات تحت الأرض وحمامات السباحة',
    pricePerM3: 12500,
    recipe: [
      { itemId: 'inv1', itemName: 'أسمنت CPJ 42.5', category: 'cement', kgPerM3: 400 },
      { itemId: 'inv2', itemName: 'رمل مغسول', category: 'sand', kgPerM3: 740 },
      { itemId: 'inv3', itemName: 'حصى 8/15', category: 'gravel', kgPerM3: 460 },
      { itemId: 'inv4', itemName: 'حصى 15/25', category: 'gravel', kgPerM3: 610 },
      { itemId: 'inv5', itemName: 'إضافة سيكا Sika Waterproof', category: 'chemical', kgPerM3: 6.5 },
      { itemId: 'inv6', itemName: 'ماء', category: 'water', kgPerM3: 165 }
    ]
  },
  {
    id: 'cg4',
    companyId: 'comp_baha_001',
    code: 'خرسانة نظافة C15/20 (B15)',
    description: 'لفرشة النظافة والتسوية الأرضية',
    pricePerM3: 8200,
    recipe: [
      { itemId: 'inv1', itemName: 'أسمنت CPJ 42.5', category: 'cement', kgPerM3: 250 },
      { itemId: 'inv2', itemName: 'رمل مغسول', category: 'sand', kgPerM3: 820 },
      { itemId: 'inv3', itemName: 'حصى 8/15', category: 'gravel', kgPerM3: 400 },
      { itemId: 'inv4', itemName: 'حصى 15/25', category: 'gravel', kgPerM3: 680 },
      { itemId: 'inv5', itemName: 'إضافة سيكا Sika', category: 'chemical', kgPerM3: 1.0 },
      { itemId: 'inv6', itemName: 'ماء', category: 'water', kgPerM3: 180 }
    ]
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust1',
    companyId: 'comp_baha_001',
    name: 'مؤسسة كوسيدار للبناء Cosider Construction',
    companyName: 'Cosider Groupe',
    phone: '033 71 88 99',
    address: 'مشروع 500 سكن عمومي - بسكرة',
    taxNumber: '099812345678912',
    totalOrdersCount: 8,
    totalVolumeM3: 320,
    totalBilledAmount: 3136000,
    totalPaidAmount: 2500000,
    balanceDue: 636000 // الباقي المستحق
  },
  {
    id: 'cust2',
    companyId: 'comp_baha_001',
    name: 'المقاول بن أحمد عبد الرزاق',
    companyName: 'مقاولات بن أحمد للمباني',
    phone: '06 61 99 22 11',
    address: 'حي المجاهدين - بسكرة',
    taxNumber: '001555222333444',
    totalOrdersCount: 4,
    totalVolumeM3: 95,
    totalBilledAmount: 981000,
    totalPaidAmount: 700000,
    balanceDue: 281000
  },
  {
    id: 'cust3',
    companyId: 'comp_baha_001',
    name: 'المركب الرياضي البلدي (المجلس الشعبي)',
    companyName: 'APC Biskra',
    phone: '033 72 00 11',
    address: 'شارع الاستقلال - وسط المدينة',
    taxNumber: '000011122233344',
    totalOrdersCount: 2,
    totalVolumeM3: 150,
    totalBilledAmount: 1680000,
    totalPaidAmount: 1680000,
    balanceDue: 0
  }
];

export const INITIAL_DISPATCH_INVOICES: DispatchInvoice[] = [
  {
    id: 'disp1',
    companyId: 'comp_baha_001',
    invoiceNumber: 'INV-2026-0101',
    customerId: 'cust1',
    customerName: 'مؤسسة كوسيدار للبناء Cosider Construction',
    deliverySite: 'مشروع 500 سكن عمومي - ورشة رقم 03',
    deliveryDate: '2026-07-20',
    deliveryTime: '08:30',
    concreteGradeCode: 'خرسانة مسلحة C25/30 (B25)',
    volumeM3: 40,
    pricePerM3: 9800,
    pumpPrice: 15000,
    totalAmount: 407000,
    paidAmount: 300000,
    remainingAmount: 107000,
    vehicleCode: 'خلاطة خرسانة #01',
    driverName: 'عبد القادر سليماني',
    slumpMm: 160,
    status: 'delivered',
    notes: 'صب أساسات العمارة A1 بحضور تقني المخبر'
  },
  {
    id: 'disp2',
    companyId: 'comp_baha_001',
    invoiceNumber: 'INV-2026-0102',
    customerId: 'cust1',
    customerName: 'مؤسسة كوسيدار للبناء Cosider Construction',
    deliverySite: 'مشروع 500 سكن عمومي - ورشة رقم 03',
    deliveryDate: '2026-07-22',
    deliveryTime: '09:15',
    concreteGradeCode: 'خرسانة عالية المقاومة C30/37 (B30)',
    volumeM3: 60,
    pricePerM3: 11200,
    pumpPrice: 20000,
    totalAmount: 692000,
    paidAmount: 500000,
    remainingAmount: 192000,
    vehicleCode: 'خلاطة خرسانة #02',
    driverName: 'سفيان قاسمي',
    slumpMm: 170,
    status: 'delivered',
    notes: 'صب أعمدة الطابق الأول'
  },
  {
    id: 'disp3',
    companyId: 'comp_baha_001',
    invoiceNumber: 'INV-2026-0103',
    customerId: 'cust2',
    customerName: 'المقاول بن أحمد عبد الرزاق',
    deliverySite: 'حي المجاهدين - فيلا قيد الإنجاز',
    deliveryDate: '2026-07-24',
    deliveryTime: '07:45',
    concreteGradeCode: 'خرسانة عازلة ومقاومة للماء بالسيكا Sika-Waterproof C30',
    volumeM3: 25,
    pricePerM3: 12500,
    pumpPrice: 12000,
    totalAmount: 324500,
    paidAmount: 200000,
    remainingAmount: 124500,
    vehicleCode: 'خلاطة خرسانة #01',
    driverName: 'عبد القادر سليماني',
    slumpMm: 150,
    status: 'delivered',
    notes: 'صب أرضية وردران الخزان الخرساني السفلي'
  },
  {
    id: 'disp4',
    companyId: 'comp_baha_001',
    invoiceNumber: 'INV-2026-0104',
    customerId: 'cust2',
    customerName: 'المقاول بن أحمد عبد الرزاق',
    deliverySite: 'حي المجاهدين - فيلا قيد الإنجاز',
    deliveryDate: '2026-07-26',
    deliveryTime: '10:00',
    concreteGradeCode: 'خرسانة مسلحة C25/30 (B25)',
    volumeM3: 30,
    pricePerM3: 9800,
    pumpPrice: 15000,
    totalAmount: 309000,
    paidAmount: 200000,
    remainingAmount: 109000,
    vehicleCode: 'خلاطة خرسانة #02',
    driverName: 'سفيان قاسمي',
    slumpMm: 160,
    status: 'delivered',
    notes: 'صب بلاطة السقف'
  }
];

export const INITIAL_CUSTOMER_PAYMENTS: CustomerPayment[] = [
  {
    id: 'cp1',
    companyId: 'comp_baha_001',
    customerId: 'cust1',
    customerName: 'مؤسسة كوسيدار للبناء Cosider Construction',
    date: '2026-07-21',
    amount: 1000000,
    paymentMethod: 'bank_transfer',
    referenceNumber: 'TRF-BNP-882190',
    notes: 'دفعة تحويل بنكي على حساب الشحنة الأولى والثانية'
  },
  {
    id: 'cp2',
    companyId: 'comp_baha_001',
    customerId: 'cust2',
    customerName: 'المقاول بن أحمد عبد الرزاق',
    date: '2026-07-25',
    amount: 300000,
    paymentMethod: 'cash',
    referenceNumber: 'REC-0012',
    notes: 'تسليم نقدي في مقر المصنع'
  }
];
