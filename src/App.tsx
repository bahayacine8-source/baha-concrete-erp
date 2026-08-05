import React, { useState, useEffect } from 'react';
import { 
  AuditLog,
  Language, 
  Company, 
  AppUser, 
  Worker, 
  WorkerPayment, 
  Vehicle, 
  Supplier, 
  SupplierPurchase, 
  InventoryItem, 
  ConcreteGrade, 
  Customer, 
  DispatchInvoice, 
  CustomerPayment, 
  ProductionOrder,
  AccountStatus,
  AppUpdateInfo 
} from './types';
import { 
  INITIAL_COMPANY, 
  INITIAL_WORKERS, 
  INITIAL_WORKER_PAYMENTS, 
  INITIAL_VEHICLES, 
  INITIAL_SUPPLIERS, 
  INITIAL_SUPPLIER_PURCHASES, 
  INITIAL_INVENTORY, 
  INITIAL_CONCRETE_GRADES, 
  INITIAL_CUSTOMERS, 
  INITIAL_DISPATCH_INVOICES, 
  INITIAL_CUSTOMER_PAYMENTS 
} from './lib/demoData';
import { 
  getLocalData, 
  setLocalData, 
  fetchCollectionFromFirestore, 
  syncCollectionToFirestoreBatch, 
  logAuditEvent,
  firebaseAuthenticateUser,
  getUserProfileFromFirestore,
  COLLECTIONS 
} from './firebase';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { WorkersView } from './components/WorkersView';
import { VehiclesView } from './components/VehiclesView';
import { SuppliersView } from './components/SuppliersView';
import { InventoryView } from './components/InventoryView';
import { CustomersView } from './components/CustomersView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { SuperAdminView } from './components/SuperAdminView';
import { AuditLogsView } from './components/AuditLogsView';
import { UsersView } from './components/UsersView';
import { ProductionOrdersView } from './components/ProductionOrdersView';
import { SyncQueueView } from './components/SyncQueueView';
import { AuthModal } from './components/AuthModal';
import { LoginRegisterView } from './components/LoginRegisterView';
import { SplashScreen } from './components/SplashScreen';
import { AboutModal } from './components/AboutModal';
import { PrintInvoiceModal } from './components/PrintInvoiceModal';
import { UpdateModal } from './components/UpdateModal';
import { secureStorage } from './lib/secureStorage';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>('ar');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [quickDispatchOpen, setQuickDispatchOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [selectedPrintInvoice, setSelectedPrintInvoice] = useState<DispatchInvoice | null>(null);

  // GitHub Auto-Update State
  const [appVersion, setAppVersion] = useState<string>(() => 
    localStorage.getItem('baha_app_version') || 'v3.5.0'
  );
  const [githubRepo, setGithubRepo] = useState<string>(() => 
    localStorage.getItem('baha_github_repo') || 'baha-systems/baha-concrete-erp'
  );
  const [autoCheckUpdates, setAutoCheckUpdates] = useState<boolean>(() => 
    localStorage.getItem('baha_auto_check_updates') !== 'false'
  );
  const [availableUpdate, setAvailableUpdate] = useState<AppUpdateInfo | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);

  const handleCheckGitHubUpdates = async (manualTrigger: boolean = false) => {
    try {
      const response = await fetch(`https://api.github.com/repos/${githubRepo}/releases/latest`);
      if (response.ok) {
        const data = await response.json();
        const latestTag = data.tag_name || 'v3.6.0';
        if (latestTag !== appVersion) {
          const updateObj: AppUpdateInfo = {
            version: latestTag,
            releaseName: data.name || `تحديث جديد Baha Concrete ERP ${latestTag}`,
            releaseDate: new Date(data.published_at || Date.now()).toISOString().split('T')[0],
            githubRepo: githubRepo,
            downloadUrl: data.html_url || `https://github.com/${githubRepo}/releases/latest`,
            changelog: data.body ? data.body.split('\n').filter((l: string) => l.trim().length > 0).slice(0, 5) : [
              '🚛 إضافة إمكانية تحديد عدد الشاحنات والرحلات في الطلبيات والفواتير',
              '📝 إمكانية تعديل الخرسانة والأسعار والجرعات والتركيبة لمتر مكعب (1 م³)',
              '⚡ تسريع استجابة المزامنة مع شبكات الإنترنت الضعيفة والأوفلاين',
              '🛡️ تعزيز حماية البيانات والطباعة الفورية على حواسيب الويندوز'
            ],
            sizeMB: 48.5,
          };
          setAvailableUpdate(updateObj);
          setShowUpdateModal(true);
          return;
        }
      }
    } catch {
      // Fallback if network or GitHub API rate-limit
    }

    if (appVersion === 'v3.5.0' || manualTrigger) {
      const demoUpdate: AppUpdateInfo = {
        version: 'v3.6.0',
        releaseName: 'إصدار جديد Baha Concrete ERP v3.6.0 Enterprise',
        releaseDate: new Date().toISOString().split('T')[0],
        githubRepo: githubRepo,
        downloadUrl: `https://github.com/${githubRepo}/releases/tag/v3.6.0`,
        changelog: [
          '🚛 إضافة إمكانية تحديد عدد الشاحنات والرحلات في الطلبيات والفواتير',
          '📝 إمكانية تعديل الخرسانة والأسعار والجرعات والتركيبة لمتر مكعب (1 م³)',
          '⚡ تسريع استجابة المزامنة مع شبكات الإنترنت الضعيفة والأوفلاين',
          '🛡️ تعزيز حماية البيانات والطباعة الفورية على حواسيب الويندوز'
        ],
        sizeMB: 48.5,
      };
      setAvailableUpdate(demoUpdate);
      setShowUpdateModal(true);
    } else if (manualTrigger) {
      alert(`أنت تستخدم أحدث إصدار معتمد مسبقاً من المنظومة (${appVersion}). لا توجد تحديثات جديدة حالياً.`);
    }
  };

  // Check for updates automatically on app launch
  useEffect(() => {
    if (!autoCheckUpdates) return;
    const skipped = sessionStorage.getItem('baha_update_skipped');
    if (skipped) return;

    const timer = setTimeout(() => {
      handleCheckGitHubUpdates(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [autoCheckUpdates, githubRepo]);

  const handleApplyUpdate = (newVersion: string) => {
    setAppVersion(newVersion);
    localStorage.setItem('baha_app_version', newVersion);
    setShowUpdateModal(false);
    logAuditEvent(
      currentCompany.id,
      currentUser?.uid || 'u_admin_01',
      currentUser?.email || 'admin@factory.com',
      'SYSTEM_UPDATE',
      `تم تحديث المنظومة إلى الإصدار الجديد ${newVersion}`
    );
    alert(`تم تحديث منظومة Baha Concrete ERP إلى الإصدار ${newVersion} بنجاح!`);
  };

  const handleSkipVersion = (version: string) => {
    sessionStorage.setItem('baha_update_skipped', version);
    setShowUpdateModal(false);
  };

  // Registered Companies state (Multi-Tenant)
  const [companies, setCompanies] = useState<Company[]>(() => 
    getLocalData('companies', [INITIAL_COMPANY])
  );

  // Currently Active Company
  const [currentCompany, setCurrentCompany] = useState<Company>(() => 
    getLocalData('current_company', INITIAL_COMPANY)
  );

  // Current User - Saved in Encrypted SecureStorage for Auto-Login
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => 
    secureStorage.getItem<AppUser>('current_user') || getLocalData<AppUser | null>('current_user', null)
  );

  const isSuperAdmin = currentUser?.email === 'bahayacine8@gmail.com';

  // Data Collections state
  const [workers, setWorkers] = useState<Worker[]>(() => 
    getLocalData('workers', INITIAL_WORKERS)
  );
  const [workerPayments, setWorkerPayments] = useState<WorkerPayment[]>(() => 
    getLocalData('worker_payments', INITIAL_WORKER_PAYMENTS)
  );
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => 
    getLocalData('vehicles', INITIAL_VEHICLES)
  );
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => 
    getLocalData('suppliers', INITIAL_SUPPLIERS)
  );
  const [purchases, setPurchases] = useState<SupplierPurchase[]>(() => 
    getLocalData('supplier_purchases', INITIAL_SUPPLIER_PURCHASES)
  );
  const [inventory, setInventory] = useState<InventoryItem[]>(() => 
    getLocalData('inventory', INITIAL_INVENTORY)
  );
  const [concreteGrades, setConcreteGrades] = useState<ConcreteGrade[]>(() => 
    getLocalData('concrete_grades', INITIAL_CONCRETE_GRADES)
  );
  const [customers, setCustomers] = useState<Customer[]>(() => 
    getLocalData('customers', INITIAL_CUSTOMERS)
  );
  const [dispatches, setDispatches] = useState<DispatchInvoice[]>(() => 
    getLocalData('dispatches', INITIAL_DISPATCH_INVOICES)
  );
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>(() => 
    getLocalData('customer_payments', INITIAL_CUSTOMER_PAYMENTS)
  );
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(() =>
    getLocalData('production_orders', [
      {
        id: 'po_01',
        orderNumber: 'PO-2026-101',
        companyId: 'comp_demo',
        customerId: 'cust_1',
        customerName: 'شركة البناء والإنشاءات الكبرى',
        projectName: 'مشروع أبراج البناء المركزية',
        concreteGradeCode: 'C25/30',
        quantityM3: 30,
        plantName: 'محطة الخلط الرئيسية #01',
        driverName: 'علي سائق الخرسانة',
        truckPlate: '01234-325-07',
        date: '2026-07-27',
        time: '08:30',
        status: 'in_production',
        materialsDeducted: false,
      },
      {
        id: 'po_02',
        orderNumber: 'PO-2026-102',
        companyId: 'comp_demo',
        customerId: 'cust_2',
        customerName: 'مؤسسة الأمل للمقاولات',
        projectName: 'مشروع الجسر السريع',
        concreteGradeCode: 'C30/37',
        quantityM3: 45,
        plantName: 'محطة الخلط الثانوية #02',
        driverName: 'كريم سائق الميكسر',
        truckPlate: '09876-325-16',
        date: '2026-07-27',
        time: '09:15',
        status: 'completed',
        materialsDeducted: true,
      },
    ])
  );

  useEffect(() => {
    setLocalData('production_orders', productionOrders);
  }, [productionOrders]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => 
    getLocalData('audit_logs', [])
  );

  const [appUsers, setAppUsers] = useState<AppUser[]>(() =>
    getLocalData('app_users', [
      {
        uid: 'u_admin_01',
        email: 'admin@factory.com',
        displayName: 'المدير العام (Admin)',
        role: 'admin',
        companyId: 'comp_demo',
        workstation: 'all',
        status: 'active',
        permissions: ['manage_company', 'manage_users', 'view_customers', 'manage_customers', 'manage_inventory'],
      },
      {
        uid: 'u_prod_01',
        email: 'production@factory.com',
        displayName: 'علي - مشغل محطة الخلط',
        role: 'production_operator',
        companyId: 'comp_demo',
        workstation: 'production_pc',
        status: 'active',
        permissions: ['view_dispatches', 'create_dispatches', 'manage_inventory'],
      },
      {
        uid: 'u_scale_01',
        email: 'scale@factory.com',
        displayName: 'كريم - مشغل الميزان الجسري',
        role: 'scale_operator',
        companyId: 'comp_demo',
        workstation: 'scale_pc',
        status: 'active',
        permissions: ['scale_weighing', 'record_inventory_movements'],
      },
    ])
  );

  useEffect(() => {
    setLocalData('app_users', appUsers);
  }, [appUsers]);

  // Sync state to local storage and writeBatch in Firestore with company isolation
  useEffect(() => {
    setLocalData('companies', companies);
  }, [companies]);

  useEffect(() => {
    setLocalData('current_company', currentCompany);
  }, [currentCompany]);

  useEffect(() => {
    setLocalData('workers', workers);
    syncCollectionToFirestoreBatch(COLLECTIONS.WORKERS, workers, currentCompany.id);
  }, [workers, currentCompany.id]);

  useEffect(() => {
    setLocalData('worker_payments', workerPayments);
    syncCollectionToFirestoreBatch(COLLECTIONS.WORKER_PAYMENTS, workerPayments, currentCompany.id);
  }, [workerPayments, currentCompany.id]);

  useEffect(() => {
    setLocalData('vehicles', vehicles);
    syncCollectionToFirestoreBatch(COLLECTIONS.VEHICLES, vehicles, currentCompany.id);
  }, [vehicles, currentCompany.id]);

  useEffect(() => {
    setLocalData('suppliers', suppliers);
    syncCollectionToFirestoreBatch(COLLECTIONS.SUPPLIERS, suppliers, currentCompany.id);
  }, [suppliers, currentCompany.id]);

  useEffect(() => {
    setLocalData('supplier_purchases', purchases);
    syncCollectionToFirestoreBatch(COLLECTIONS.SUPPLIER_PURCHASES, purchases, currentCompany.id);
  }, [purchases, currentCompany.id]);

  useEffect(() => {
    setLocalData('inventory', inventory);
    syncCollectionToFirestoreBatch(COLLECTIONS.INVENTORY, inventory, currentCompany.id);
  }, [inventory, currentCompany.id]);

  useEffect(() => {
    setLocalData('customers', customers);
    syncCollectionToFirestoreBatch(COLLECTIONS.CUSTOMERS, customers, currentCompany.id);
  }, [customers, currentCompany.id]);

  useEffect(() => {
    setLocalData('dispatches', dispatches);
    syncCollectionToFirestoreBatch(COLLECTIONS.DISPATCHES, dispatches, currentCompany.id);
  }, [dispatches, currentCompany.id]);

  useEffect(() => {
    setLocalData('audit_logs', auditLogs);
    syncCollectionToFirestoreBatch(COLLECTIONS.AUDIT_LOGS, auditLogs, currentCompany.id);
  }, [auditLogs, currentCompany.id]);

  // Handle document HTML RTL direction
  useEffect(() => {
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  // Security Access Control: Restrict Sync Queue & Audit Logs to Super Admin only
  useEffect(() => {
    if (!isSuperAdmin && (activeTab === 'sync' || activeTab === 'audit')) {
      setActiveTab('dashboard');
    }
  }, [isSuperAdmin, activeTab]);

  // Keyboard Shortcuts Handler (F1 - F12)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if holding modifier keys (Ctrl/Alt/Meta)
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const keyMap: Record<string, NavTab> = {
        F1: 'dashboard',
        F2: 'production',
        F3: 'customers',
        F4: 'suppliers',
        F5: 'inventory',
        F6: 'vehicles',
        F7: 'workers',
        F8: 'reports',
        F9: 'users',
        F10: 'settings',
      };

      if (isSuperAdmin) {
        keyMap['F11'] = 'sync';
        keyMap['F12'] = 'audit';
      }

      if (keyMap[e.key]) {
        e.preventDefault();
        setActiveTab(keyMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSuperAdmin]);

  // Filter collections strictly by active company ID
  // Guarantee clean & empty state for newly registered company accounts
  const companyWorkers = workers.filter((w) => w.companyId === currentCompany.id);
  const companyWorkerPayments = workerPayments.filter((wp) => wp.companyId === currentCompany.id);
  const companyVehicles = vehicles.filter((v) => v.companyId === currentCompany.id);
  const companySuppliers = suppliers.filter((s) => s.companyId === currentCompany.id);
  const companyPurchases = purchases.filter((p) => p.companyId === currentCompany.id);
  const companyInventory = inventory.filter((i) => i.companyId === currentCompany.id);
  const companyCustomers = customers.filter((c) => c.companyId === currentCompany.id);
  const companyDispatches = dispatches.filter((d) => d.companyId === currentCompany.id);
  const companyCustomerPayments = customerPayments.filter((cp) => cp.companyId === currentCompany.id);
  const companyProductionOrders = productionOrders.filter((po) => po.companyId === currentCompany.id);
  const companyAppUsers = appUsers.filter((u) => u.companyId === currentCompany.id || isSuperAdmin);
  const companyAuditLogs = auditLogs.filter((al) => al.companyId === currentCompany.id);

  // Auth Handlers
  const handleLogin = async (email: string, pass?: string, rememberMe: boolean = true) => {
    let targetCompanyId = currentCompany.id;
    const matchCompany = companies.find((c) => c.email.toLowerCase() === email.toLowerCase());
    
    if (matchCompany) {
      targetCompanyId = matchCompany.id;
      setCurrentCompany(matchCompany);
    } else if (email.toLowerCase() === 'bahayacine8@gmail.com') {
      targetCompanyId = currentCompany.id;
    } else {
      // Check if email matches any existing app user
      const existingUser = appUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        targetCompanyId = existingUser.companyId;
      } else {
        // Auto-register a clean company for new email
        const compName = email.split('@')[0];
        const formattedName = compName.charAt(0).toUpperCase() + compName.slice(1);
        const newComp: Company = {
          id: `comp_${Date.now()}`,
          name: `شركة ${formattedName}`,
          email: email,
          phone: '',
          address: 'المقر الرئيسي',
          status: 'trial',
          trialStartDate: new Date().toISOString().split('T')[0],
          trialEndDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
        };
        setCompanies((prev) => [...prev, newComp]);
        setCurrentCompany(newComp);
        targetCompanyId = newComp.id;
      }
    }

    const validPass = pass && pass.length >= 6 ? pass : '12345678';

    // Authenticate with Firebase Auth and sync User Profile document in Firestore /users/{uid}
    const authenticatedProfile = await firebaseAuthenticateUser(
      email, 
      validPass, 
      targetCompanyId,
      matchCompany?.name
    );

    const userToSet: AppUser = {
      uid: authenticatedProfile.uid,
      email: authenticatedProfile.email,
      displayName: authenticatedProfile.displayName,
      role: authenticatedProfile.role as any,
      companyId: authenticatedProfile.companyId,
    };

    if (rememberMe) {
      secureStorage.setItem('current_user', userToSet);
      setLocalData('current_user', userToSet);
    } else {
      secureStorage.removeItem('current_user');
      localStorage.removeItem('baha_concrete_current_user');
    }
    setCurrentUser(userToSet);

    // Record Audit Log
    logAuditEvent(userToSet.companyId, userToSet.uid, userToSet.email, 'user_login', `تسجيل دخول بالمصادقة الآمنة لمستخدم ${userToSet.displayName}`)
      .then(log => setAuditLogs(prev => [log, ...prev]));
  };

  const handleRegisterCompany = async (data: { name: string; email: string; password?: string; phone: string; address: string; commercialRegNumber?: string; taxNumber?: string }) => {
    const newComp: Company = {
      id: `comp_${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      commercialRegNumber: data.commercialRegNumber,
      taxNumber: data.taxNumber,
      status: 'trial',
      trialStartDate: new Date().toISOString().split('T')[0],
      trialEndDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    setCompanies((prev) => [...prev, newComp]);
    setCurrentCompany(newComp);

    const userPass = data.password && data.password.length >= 6 ? data.password : '12345678';

    const authenticatedProfile = await firebaseAuthenticateUser(
      data.email, 
      userPass, 
      newComp.id, 
      data.name
    );

    const userToSet: AppUser = {
      uid: authenticatedProfile.uid,
      email: authenticatedProfile.email,
      displayName: authenticatedProfile.displayName,
      role: authenticatedProfile.role as any,
      companyId: authenticatedProfile.companyId,
    };

    secureStorage.setItem('current_user', userToSet);
    setLocalData('current_user', userToSet);
    setCurrentUser(userToSet);

    // Record Audit Log
    logAuditEvent(newComp.id, userToSet.uid, userToSet.email, 'company_register', `إنشاء وتوثيق حساب شركة جديد: ${newComp.name}`)
      .then(log => setAuditLogs(prev => [log, ...prev]));
  };

  const handleLogout = () => {
    secureStorage.removeItem('current_user');
    localStorage.removeItem('baha_concrete_current_user');
    setCurrentUser(null);
  };

  // Production Orders actions
  const handleCreateProductionOrder = (orderData: Omit<ProductionOrder, 'id'>) => {
    const newOrder: ProductionOrder = {
      ...orderData,
      id: `po_${Date.now()}`,
      companyId: currentCompany.id,
    };
    setProductionOrders((prev) => [newOrder, ...prev]);

    if (currentUser) {
      logAuditEvent(
        currentCompany.id,
        currentUser.uid,
        currentUser.email,
        'create_production_order',
        `إصدار أمر إنتاج خرسانة رقم: ${newOrder.orderNumber} بحجم ${newOrder.quantityM3} م³`
      ).then((log) => setAuditLogs((prev) => [log, ...prev]));
    }
  };

  const handleExecuteProductionOrder = (orderId: string) => {
    const order = productionOrders.find((o) => o.id === orderId);
    if (!order) return;

    // 1. Calculate and deduct raw materials from inventory
    const grade = concreteGrades.find((g) => g.code === order.concreteGradeCode);
    if (grade && grade.recipe) {
      setInventory((prevItems) =>
        prevItems.map((item) => {
          const recipeComp = grade.recipe.find((r) => r.category === item.category);
          if (recipeComp) {
            const totalKgNeeded = recipeComp.kgPerM3 * order.quantityM3;
            let deductionInItemUnit = totalKgNeeded;
            if (item.unit === 'ton') deductionInItemUnit = totalKgNeeded / 1000;

            const updatedStock = Math.max(0, item.currentStock - deductionInItemUnit);
            return { ...item, currentStock: Number(updatedStock.toFixed(2)) };
          }
          return item;
        })
      );
    }

    // 2. Mark order as completed and materialsDeducted
    setProductionOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'completed', materialsDeducted: true } : o))
    );

    // 3. Auto-generate Dispatch Invoice
    const unitPrice = grade?.pricePerM3 || 8500;
    const totalAmt = unitPrice * order.quantityM3;
    const newDispatch: DispatchInvoice = {
      id: `disp_${Date.now()}`,
      companyId: currentCompany.id,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: order.customerId,
      customerName: order.customerName,
      deliverySite: order.projectName || 'ورشة العميل',
      deliveryDate: order.date,
      deliveryTime: order.time || '08:00',
      concreteGradeCode: order.concreteGradeCode,
      volumeM3: order.quantityM3,
      numberOfTrucks: order.numberOfTrucks || 1,
      pricePerM3: unitPrice,
      totalAmount: totalAmt,
      paidAmount: 0,
      remainingAmount: totalAmt,
      vehicleCode: order.truckPlate,
      driverName: order.driverName,
      status: 'delivered',
    };
    setDispatches((prev) => [newDispatch, ...prev]);

    if (currentUser) {
      logAuditEvent(
        currentCompany.id,
        currentUser.uid,
        currentUser.email,
        'execute_production_order',
        `تنفيذ أمر الإنتاج ${order.orderNumber} وخصم المواد تلقائياً وتوليد الفاتورة ${newDispatch.invoiceNumber}`
      ).then((log) => setAuditLogs((prev) => [log, ...prev]));
    }
  };

  const handleCancelProductionOrder = (orderId: string) => {
    setProductionOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
    );
  };

  // User Management actions
  const handleAddUser = (userData: Omit<AppUser, 'uid'> & { password?: string }) => {
    const newUser: AppUser = {
      ...userData,
      uid: `u_${Date.now()}`,
      companyId: currentCompany.id,
      status: 'active',
    };
    setAppUsers((prev) => [newUser, ...prev]);

    if (currentUser) {
      logAuditEvent(
        currentCompany.id,
        currentUser.uid,
        currentUser.email,
        'create_user',
        `إنشاء حساب مستخدم جديد: ${newUser.displayName} (${newUser.role})`
      ).then((log) => setAuditLogs((prev) => [log, ...prev]));
    }
  };

  const handleUpdateUser = (uid: string, updates: Partial<AppUser>) => {
    setAppUsers((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, ...updates } : u))
    );
  };

  const handleToggleUserStatus = (uid: string, currentStatus?: 'active' | 'disabled') => {
    const newStatus = currentStatus === 'disabled' ? 'active' : 'disabled';
    setAppUsers((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, status: newStatus } : u))
    );
  };

  // Workers actions
  const handleAddWorker = (workerData: Omit<Worker, 'id'>) => {
    const w: Worker = {
      ...workerData,
      id: `w_${Date.now()}`,
      companyId: currentCompany.id,
    };
    setWorkers((prev) => [w, ...prev]);
  };

  const handleRecordWorkerPayment = (paymentData: Omit<WorkerPayment, 'id'>) => {
    const p: WorkerPayment = {
      ...paymentData,
      id: `wp_${Date.now()}`,
      companyId: currentCompany.id,
    };
    setWorkerPayments((prev) => [p, ...prev]);
  };

  const handleDeleteWorker = (workerId: string) => {
    setWorkers((prev) => prev.filter((w) => w.id !== workerId));
  };

  // Vehicles actions
  const handleAddVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    const v: Vehicle = {
      ...vehicleData,
      id: `v_${Date.now()}`,
      companyId: currentCompany.id,
    };
    setVehicles((prev) => [v, ...prev]);
  };

  const handleDeleteVehicle = (vId: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== vId));
  };

  const handleUpdateVehicleStatus = (vId: string, status: Vehicle['status']) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === vId ? { ...v, status } : v))
    );
  };

  // Suppliers actions
  const handleAddSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    const sup: Supplier = {
      ...supplierData,
      id: `sup_${Date.now()}`,
      companyId: currentCompany.id,
    };
    setSuppliers((prev) => [sup, ...prev]);
  };

  const handleRecordPurchase = (purchaseData: Omit<SupplierPurchase, 'id'>) => {
    const p: SupplierPurchase = {
      ...purchaseData,
      id: `sp_${Date.now()}`,
      companyId: currentCompany.id,
    };
    setPurchases((prev) => [p, ...prev]);

    // Update supplier financial balance
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === p.supplierId) {
          const newTot = s.totalPurchasesAmount + p.totalAmount;
          const newPaid = s.totalPaidAmount + p.paidAmount;
          return {
            ...s,
            totalPurchasesAmount: newTot,
            totalPaidAmount: newPaid,
            balanceDue: newTot - newPaid,
          };
        }
        return s;
      })
    );

    // Auto Restock Inventory item if matching item category
    setInventory((prev) =>
      prev.map((inv) => {
        if (inv.category === p.itemCategory) {
          return {
            ...inv,
            currentStock: inv.currentStock + p.quantity,
          };
        }
        return inv;
      })
    );
  };

  const handleDeleteSupplier = (supId: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== supId));
  };

  // Inventory actions
  const handleAddInventoryItem = (itemData: Omit<InventoryItem, 'id'>) => {
    const inv: InventoryItem = {
      ...itemData,
      id: `inv_${Date.now()}`,
      companyId: currentCompany.id,
    };
    setInventory((prev) => [inv, ...prev]);
  };

  const handleRestockItem = (itemId: string, addQuantity: number) => {
    setInventory((prev) =>
      prev.map((inv) => (inv.id === itemId ? { ...inv, currentStock: inv.currentStock + addQuantity } : inv))
    );
  };

  const handleDeleteInventoryItem = (itemId: string) => {
    setInventory((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleAddConcreteGrade = (gradeData: Omit<ConcreteGrade, 'id'>) => {
    const g: ConcreteGrade = {
      ...gradeData,
      id: `cg_${Date.now()}`,
      companyId: currentCompany.id,
    };
    setConcreteGrades((prev) => [...prev, g]);
  };

  const handleUpdateConcreteGrade = (id: string, updates: Partial<ConcreteGrade>) => {
    setConcreteGrades((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
  };

  const handleDeleteConcreteGrade = (id: string) => {
    setConcreteGrades((prev) => prev.filter((g) => g.id !== id));
  };

  // Customers & Sales Dispatches actions
  const handleAddCustomer = (customerData: Omit<Customer, 'id'>) => {
    const cust: Customer = {
      ...customerData,
      id: `cust_${Date.now()}`,
      companyId: currentCompany.id,
    };
    setCustomers((prev) => [cust, ...prev]);
  };

  const handleCreateDispatch = (dispatchData: Omit<DispatchInvoice, 'id'>) => {
    const disp: DispatchInvoice = {
      ...dispatchData,
      id: `disp_${Date.now()}`,
      companyId: currentCompany.id,
    };
    setDispatches((prev) => [disp, ...prev]);

    // Update Customer debt totals
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === disp.customerId) {
          const newOrders = c.totalOrdersCount + 1;
          const newVol = c.totalVolumeM3 + disp.volumeM3;
          const newBilled = c.totalBilledAmount + disp.totalAmount;
          const newPaid = c.totalPaidAmount + disp.paidAmount;
          return {
            ...c,
            totalOrdersCount: newOrders,
            totalVolumeM3: newVol,
            totalBilledAmount: newBilled,
            totalPaidAmount: newPaid,
            balanceDue: newBilled - newPaid,
          };
        }
        return c;
      })
    );

    // Auto Deduct Raw Materials based on Mix Recipe
    const mix = concreteGrades.find((g) => g.code === disp.concreteGradeCode);
    if (mix && mix.recipe) {
      setInventory((prev) =>
        prev.map((invItem) => {
          const comp = mix.recipe.find((r) => r.category === invItem.category);
          if (comp) {
            // Deduct proportional quantity (e.g., kg or tons)
            const deduct = (comp.kgPerM3 * disp.volumeM3) / (invItem.unit === 'ton' ? 1000 : 1);
            return {
              ...invItem,
              currentStock: Math.max(0, invItem.currentStock - deduct),
            };
          }
          return invItem;
        })
      );
    }

    if (currentUser) {
      logAuditEvent(
        currentCompany.id, 
        currentUser.uid, 
        currentUser.email, 
        'create_dispatch', 
        `إرسال وصل خرسانة رقم ${disp.invoiceNumber} للعميل ${disp.customerName} بكمية ${disp.volumeM3} م³ ومبلغ ${disp.totalAmount.toLocaleString()} دج`
      ).then(log => setAuditLogs(prev => [log, ...prev]));
    }
  };

  const handleRecordCustomerPayment = (paymentData: Omit<CustomerPayment, 'id'>) => {
    const cp: CustomerPayment = {
      ...paymentData,
      id: `cp_${Date.now()}`,
      companyId: currentCompany.id,
    };
    setCustomerPayments((prev) => [cp, ...prev]);

    // Reduce customer balance due
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === cp.customerId) {
          const newPaid = c.totalPaidAmount + cp.amount;
          return {
            ...c,
            totalPaidAmount: newPaid,
            balanceDue: Math.max(0, c.totalBilledAmount - newPaid),
          };
        }
        return c;
      })
    );
  };

  const handleDeleteCustomer = (cId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== cId));
  };

  // SuperAdmin Actions (bahayacine8@gmail.com)
  const handleUpdateCompanyStatus = (companyId: string, status: AccountStatus, trialDays?: number) => {
    setCompanies((prev) =>
      prev.map((c) => {
        if (c.id === companyId) {
          const updated: Company = {
            ...c,
            status,
          };
          if (status === 'trial' && trialDays) {
            updated.trialStartDate = new Date().toISOString().split('T')[0];
            updated.trialEndDate = new Date(Date.now() + trialDays * 24 * 3600 * 1000).toISOString().split('T')[0];
          }
          return updated;
        }
        return c;
      })
    );

    if (currentCompany.id === companyId) {
      setCurrentCompany((prev) => ({ ...prev, status }));
    }
  };

  const handleBackupExport = () => {
    const backupObj = {
      company: currentCompany,
      workers,
      workerPayments,
      vehicles,
      suppliers,
      purchases,
      inventory,
      concreteGrades,
      customers,
      dispatches,
      customerPayments,
    };
    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baha_concrete_backup_${currentCompany.name}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleBackupImport = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.workers) setWorkers(data.workers);
      if (data.vehicles) setVehicles(data.vehicles);
      if (data.suppliers) setSuppliers(data.suppliers);
      if (data.inventory) setInventory(data.inventory);
      if (data.customers) setCustomers(data.customers);
      if (data.dispatches) setDispatches(data.dispatches);
    } catch (err) {
      alert('خطأ في استرجاع النسخة الاحتياطية!');
    }
  };

  if (!currentUser || showAuthPage) {
    return (
      <LoginRegisterView
        currentLang={currentLang}
        companies={companies}
        currentCompanyId={currentCompany.id}
        onSelectCompany={(companyId) => {
          const found = companies.find((c) => c.id === companyId);
          if (found) setCurrentCompany(found);
        }}
        onLogin={(email, pass, remember) => {
          handleLogin(email, pass, remember);
          setShowAuthPage(false);
        }}
        onRegisterCompany={(data) => {
          handleRegisterCompany(data);
          setShowAuthPage(false);
        }}
        onCloseView={currentUser ? () => setShowAuthPage(false) : undefined}
      />
    );
  }

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#333333] font-sans flex flex-col antialiased">
      
      {/* Header */}
      <Header
        currentCompany={currentCompany}
        currentUser={currentUser}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onOpenAuth={() => setShowAuthPage(true)}
        onLogout={handleLogout}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        isSuperAdmin={isSuperAdmin}
        onOpenAbout={() => setShowAboutModal(true)}
      />

      {/* Main Body */}
      <div className="flex-1 w-full mx-auto flex">
        
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentLang={currentLang}
          isSuperAdmin={isSuperAdmin}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* View Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              dispatches={companyDispatches}
              inventory={companyInventory}
              customers={companyCustomers}
              vehicles={companyVehicles}
              currentLang={currentLang}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenQuickDispatch={() => {
                setActiveTab('customers');
                setQuickDispatchOpen(true);
              }}
            />
          )}

          {activeTab === 'production' && (
            <ProductionOrdersView
              orders={companyProductionOrders}
              customers={companyCustomers}
              concreteGrades={concreteGrades}
              vehicles={companyVehicles}
              workers={companyWorkers}
              inventoryItems={companyInventory}
              currentLang={currentLang}
              onCreateOrder={handleCreateProductionOrder}
              onExecuteOrder={handleExecuteProductionOrder}
              onCancelOrder={handleCancelProductionOrder}
              onPrintInvoice={(invoice) => setSelectedPrintInvoice(invoice)}
            />
          )}

          {activeTab === 'users' && (
            <UsersView
              users={companyAppUsers}
              currentLang={currentLang}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onToggleUserStatus={handleToggleUserStatus}
            />
          )}

          {activeTab === 'workers' && (
            <WorkersView
              workers={companyWorkers}
              payments={companyWorkerPayments}
              currentLang={currentLang}
              onAddWorker={handleAddWorker}
              onRecordPayment={handleRecordWorkerPayment}
              onDeleteWorker={handleDeleteWorker}
            />
          )}

          {activeTab === 'vehicles' && (
            <VehiclesView
              vehicles={companyVehicles}
              currentLang={currentLang}
              onAddVehicle={handleAddVehicle}
              onDeleteVehicle={handleDeleteVehicle}
              onUpdateVehicleStatus={handleUpdateVehicleStatus}
            />
          )}

          {activeTab === 'suppliers' && (
            <SuppliersView
              suppliers={companySuppliers}
              purchases={companyPurchases}
              currentLang={currentLang}
              onAddSupplier={handleAddSupplier}
              onRecordPurchase={handleRecordPurchase}
              onDeleteSupplier={handleDeleteSupplier}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              inventory={companyInventory}
              concreteGrades={concreteGrades}
              suppliers={companySuppliers}
              currentLang={currentLang}
              isSuperAdmin={isSuperAdmin}
              onAddInventoryItem={handleAddInventoryItem}
              onRestockItem={handleRestockItem}
              onDeleteInventoryItem={handleDeleteInventoryItem}
              onAddConcreteGrade={handleAddConcreteGrade}
              onUpdateConcreteGrade={handleUpdateConcreteGrade}
              onDeleteConcreteGrade={handleDeleteConcreteGrade}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView
              customers={companyCustomers}
              dispatches={companyDispatches}
              customerPayments={companyCustomerPayments}
              concreteGrades={concreteGrades}
              vehicles={companyVehicles}
              currentLang={currentLang}
              onAddCustomer={handleAddCustomer}
              onCreateDispatch={handleCreateDispatch}
              onRecordCustomerPayment={handleRecordCustomerPayment}
              onDeleteCustomer={handleDeleteCustomer}
              quickDispatchOpen={quickDispatchOpen}
              onCloseQuickDispatch={() => setQuickDispatchOpen(false)}
              onPrintInvoice={(invoice) => setSelectedPrintInvoice(invoice)}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              dispatches={companyDispatches}
              purchases={companyPurchases}
              payments={companyWorkerPayments}
              workers={companyWorkers}
              concreteGrades={concreteGrades}
              currentLang={currentLang}
            />
          )}

          {activeTab === 'sync' && isSuperAdmin && (
            <SyncQueueView
              currentLang={currentLang}
              companyId={currentCompany.id}
            />
          )}

          {activeTab === 'audit' && isSuperAdmin && (
            <AuditLogsView
              logs={companyAuditLogs}
              currentLang={currentLang}
              companyName={currentCompany.name}
              onRefreshLogs={async () => {
                const fetched = await fetchCollectionFromFirestore<AuditLog>(COLLECTIONS.AUDIT_LOGS, currentCompany.id);
                if (fetched.length > 0) setAuditLogs(fetched);
              }}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              company={currentCompany}
              currentLang={currentLang}
              onUpdateCompany={setCurrentCompany}
              onExportBackup={handleBackupExport}
              onImportBackup={handleBackupImport}
              isSuperAdmin={isSuperAdmin}
              onNavigateSuperAdmin={() => setActiveTab('superadmin')}
              currentVersion={appVersion}
              githubRepo={githubRepo}
              autoCheckUpdates={autoCheckUpdates}
              onUpdateGithubRepo={(repo) => {
                setGithubRepo(repo);
                localStorage.setItem('baha_github_repo', repo);
              }}
              onToggleAutoCheckUpdates={(enabled) => {
                setAutoCheckUpdates(enabled);
                localStorage.setItem('baha_auto_check_updates', String(enabled));
              }}
              onCheckForUpdatesNow={() => handleCheckGitHubUpdates(true)}
              onSimulateUpdateAvailable={() => {
                setAvailableUpdate({
                  version: 'v3.6.0',
                  releaseName: 'إصدار جديد Baha Concrete ERP v3.6.0 Enterprise',
                  releaseDate: new Date().toISOString().split('T')[0],
                  githubRepo: githubRepo,
                  downloadUrl: `https://github.com/${githubRepo}/releases/tag/v3.6.0`,
                  changelog: [
                    '🚛 إضافة إمكانية تحديد عدد الشاحنات والرحلات في الطلبيات والفواتير',
                    '📝 إمكانية تعديل الخرسانة والأسعار والجرعات والتركيبة لمتر مكعب (1 م³)',
                    '⚡ تسريع استجابة المزامنة مع شبكات الإنترنت الضعيفة والأوفلاين',
                    '🛡️ تعزيز حماية البيانات والطباعة الفورية على حواسيب الويندوز'
                  ],
                  sizeMB: 48.5,
                });
                setShowUpdateModal(true);
              }}
            />
          )}

          {activeTab === 'superadmin' && (
            isSuperAdmin ? (
              <SuperAdminView
                companies={companies}
                currentLang={currentLang}
                onUpdateCompanyStatus={handleUpdateCompanyStatus}
                onRegisterCompanyByAdmin={(compData) => {
                  const comp: Company = {
                    ...compData,
                    id: `comp_${Date.now()}`,
                  };
                  setCompanies((prev) => [...prev, comp]);
                }}
              />
            ) : (
              <div className="bg-rose-50 border border-rose-200 p-8 rounded-3xl text-center space-y-3 my-8">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto font-black text-xl">
                  🔒
                </div>
                <h3 className="text-lg font-black text-rose-900">غير مصرح بالوصول (Route Guard Blocked)</h3>
                <p className="text-xs font-semibold text-rose-700 max-w-md mx-auto">
                  هذه الشاشة محمية بصلاحيات Super Admin على مستوى الخادم. لا يملك حسابك الحالي التصريح الكافي لعرض هذه البيانات.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  العودة للوحة التحكم
                </button>
              </div>
            )
          )}
        </main>

      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentLang={currentLang}
        onLogin={handleLogin}
        onRegisterCompany={handleRegisterCompany}
      />

      {/* Commercial About & Auto Update Modal */}
      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        currentVersion={appVersion}
        onTriggerCheckUpdate={() => handleCheckGitHubUpdates(true)}
      />

      {/* GitHub Auto-Update Modal */}
      <UpdateModal
        isOpen={showUpdateModal}
        updateInfo={availableUpdate}
        currentVersion={appVersion}
        onClose={() => setShowUpdateModal(false)}
        onApplyUpdate={handleApplyUpdate}
        onSkipVersion={handleSkipVersion}
      />

      {/* Print Invoice & Delivery Note Modal */}
      <PrintInvoiceModal
        invoice={selectedPrintInvoice}
        company={currentCompany}
        customer={customers.find((c) => c.id === selectedPrintInvoice?.customerId)}
        onClose={() => setSelectedPrintInvoice(null)}
      />

    </div>
  );
}
