import React, { useState, useEffect } from 'react';
import { syncEngine, SyncStatus } from '../lib/syncEngine';
import { SyncQueueItem, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Database, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Laptop, 
  PlusCircle, 
  Trash2,
  Lock
} from 'lucide-react';

interface SyncQueueViewProps {
  currentLang: Language;
  companyId: string;
}

export const SyncQueueView: React.FC<SyncQueueViewProps> = ({ currentLang, companyId }) => {
  const t = getTranslation(currentLang);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(syncEngine.getStatus());
  const [queueItems, setQueueItems] = useState<SyncQueueItem[]>(syncEngine.getQueue());
  const [syncMessage, setSyncMessage] = useState<string>('');

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((status) => {
      setSyncStatus(status);
      setQueueItems(syncEngine.getQueue());
    });
    return () => unsubscribe();
  }, []);

  const handleManualSync = async () => {
    setSyncMessage('جاري رفع قائمة المزامنة (sync_queue) إلى Firebase...');
    const result = await syncEngine.processSyncQueue();
    setSyncMessage(
      `تمت المزامنة بنجاح! السجلات المرفوعة: ${result.syncedCount}، حالات التعارض المعالجة: ${result.conflictCount}`
    );
    setTimeout(() => setSyncMessage(''), 4000);
  };

  const handleSimulateOfflineRecord = () => {
    const testRecordId = `rec_${Date.now()}`;
    syncEngine.enqueueOperation({
      tableName: 'inventory',
      recordId: testRecordId,
      operation: 'UPDATE',
      payload: {
        id: testRecordId,
        name: 'شحنة أسمنت مجدولة أوفلاين',
        category: 'cement',
        currentStock: 120,
        unit: 'ton',
        updatedAt: new Date().toISOString(),
      },
      companyId: companyId || 'c_demo',
    });
    setSyncMessage('تمت إضافة عملية جديدة إلى sync_queue بنجاح.');
    setTimeout(() => setSyncMessage(''), 3000);
  };

  const handleClearSynced = () => {
    syncEngine.clearSyncedItems();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <RefreshCw className={`w-6 h-6 text-orange-600 ${syncStatus.syncInProgress ? 'animate-spin' : ''}`} />
            <span>نظام المزامنة الأوفلاين (Sync Queue Engine)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            جدول sync_queue لحفظ العمليات محلياً عند انقطاع الشبكة، والمزامنة الذكية مع حل التعارضات (Conflict Resolution via updatedAt)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSimulateOfflineRecord}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-orange-600" />
            <span>تجربة إضافة عملية أوفلاين</span>
          </button>

          <button
            type="button"
            onClick={handleManualSync}
            disabled={syncStatus.syncInProgress || !syncStatus.isOnline}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${syncStatus.syncInProgress ? 'animate-spin' : ''}`} />
            <span>مزامنة مع Firebase الآن</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Network & Status Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Network Status */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>حالة الاتصال بالشبكة</span>
            {syncStatus.isOnline ? (
              <Wifi className="w-4 h-4 text-emerald-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-rose-500" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full animate-ping ${
                syncStatus.isOnline ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            <span className="text-base font-black text-slate-900">
              {syncStatus.isOnline ? 'متصل بالإنترنت (Online)' : 'منقطع - وضع الأوفلاين (Offline)'}
            </span>
          </div>
        </div>

        {/* Device ID */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>معرف الجهاز الحالي (deviceId)</span>
            <Laptop className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xs font-mono font-bold text-slate-900 bg-slate-50 p-1.5 rounded-lg border border-slate-100 truncate">
            {syncStatus.deviceId}
          </div>
        </div>

        {/* Pending Operations */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>العمليات المعلقة في الأوفلاين</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-600">
            {syncStatus.pendingOfflineChangesCount} عملية
          </div>
        </div>

        {/* Synced Records */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>السجلات المرفوعة والمزامنة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-emerald-600">
            {syncStatus.syncedQueueCount} عملية
          </div>
        </div>
      </div>

      {/* Security Criteria Assurance Panel */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <Lock className="w-5 h-5" />
            <h3 className="font-bold text-sm">معايير أمان نظام المزامنة والبيانات (Security Protocol)</h3>
          </div>
          <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono px-2.5 py-0.5 rounded-full font-bold">
            Verified & Encrypted
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>عدم حفظ كلمة السر</span>
            </div>
            <p className="text-[11px] text-slate-400">
              عدم تخزين كلمات المرور محلياً في sync_queue أو LocalStorage مطلقاً.
            </p>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Firebase Auth</span>
            </div>
            <p className="text-[11px] text-slate-400">
              تأكيد الهوية عبر Firebase Authentication مع إسناد التوكن للطلبات.
            </p>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>قواعد Firestore Rules</span>
            </div>
            <p className="text-[11px] text-slate-400">
              تصفية القراءة والكتابة بالاعتماد على companyId لضمان أمان البيانات.
            </p>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>عزل بيانات الشركات</span>
            </div>
            <p className="text-[11px] text-slate-400">
              كل شركة ترى وتزامن بياناتها فقط داخل مسار /companies/&#123;companyId&#125;/.
            </p>
          </div>
        </div>
      </div>

      {/* Sync Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-orange-600" />
            <h3 className="font-bold text-slate-900 text-sm">جدول طابور المزامنة (sync_queue)</h3>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-mono font-bold">
              {queueItems.length} عناصر
            </span>
          </div>

          <button
            type="button"
            onClick={handleClearSynced}
            className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>تنظيف العناصر المكتملة</span>
          </button>
        </div>

        {queueItems.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p>طابور المزامنة فارغ تماماً — جميع البيانات متطابقة ومحدثة مع Firebase!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5 text-start font-mono">ID</th>
                  <th className="p-2.5 text-start font-mono">DeviceId</th>
                  <th className="p-2.5 text-start">جدول البيانات (tableName)</th>
                  <th className="p-2.5 text-start">رقم السجل (recordId)</th>
                  <th className="p-2.5 text-start">نوع العملية (operation)</th>
                  <th className="p-2.5 text-start">الحالة (status)</th>
                  <th className="p-2.5 text-start">وقت الإنشاء (createdAt)</th>
                  <th className="p-2.5 text-start">وقت المزامنة (syncedAt)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queueItems.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2.5 font-mono text-[11px] text-slate-600 font-semibold">{item.id}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-500">{item.deviceId}</td>
                      <td className="p-2.5 font-bold text-slate-900">
                        <span className="px-2 py-0.5 bg-orange-50 text-orange-900 border border-orange-200 rounded-md">
                          {item.tableName}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-slate-700">{item.recordId}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] ${
                            item.operation === 'CREATE'
                              ? 'bg-blue-100 text-blue-800'
                              : item.operation === 'UPDATE'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.operation}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            item.status === 'synced'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : item.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : item.status === 'conflict'
                              ? 'bg-purple-100 text-purple-800 border-purple-200'
                              : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}
                        >
                          {item.status === 'synced'
                            ? '✓ Synced'
                            : item.status === 'pending'
                            ? '⏳ Pending'
                            : item.status === 'conflict'
                            ? '⚡ Conflict Resolved'
                            : '✕ Failed'}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-500">
                        {new Date(item.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-500">
                        {item.syncedAt
                          ? new Date(item.syncedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
