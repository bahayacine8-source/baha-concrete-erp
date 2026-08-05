import React, { useState } from 'react';
import { Vehicle, VehicleType, FuelLog, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { 
  Truck, 
  Plus, 
  Search, 
  Fuel, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Calendar, 
  Trash2,
  X,
  Droplets
} from 'lucide-react';

interface VehiclesViewProps {
  vehicles: Vehicle[];
  currentLang: Language;
  onAddVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  onDeleteVehicle: (vehicleId: string) => void;
  onUpdateVehicleStatus: (vehicleId: string, status: Vehicle['status']) => void;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({
  vehicles,
  currentLang,
  onAddVehicle,
  onDeleteVehicle,
  onUpdateVehicleStatus,
}) => {
  const t = getTranslation(currentLang);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newVehicle, setNewVehicle] = useState<Omit<Vehicle, 'id' | 'companyId'>>({
    plateNumber: '',
    codeName: '',
    type: 'concrete_mixer',
    capacityM3: 10,
    driverName: '',
    status: 'active',
    insuranceExpiry: '',
    techInspectionExpiry: '',
    totalTrips: 0,
  });

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.codeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.plateNumber.includes(searchTerm) ||
      (v.driverName && v.driverName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.codeName || !newVehicle.plateNumber) return;
    onAddVehicle({
      ...newVehicle,
      companyId: '',
    });
    setShowAddModal(false);
    setNewVehicle({
      plateNumber: '',
      codeName: '',
      type: 'concrete_mixer',
      capacityM3: 10,
      driverName: '',
      status: 'active',
      insuranceExpiry: '',
      techInspectionExpiry: '',
      totalTrips: 0,
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-orange-600" />
            <span>{t.vehicleManagement}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة أسطول خلاطات ومضخات الخرسانة الجاهزة وتتبع المراقبة التقنية والتأمين
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addVehicle}</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute top-3.5 start-3.5 text-slate-400" />
        <input
          type="text"
          placeholder={t.search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full ps-10 pe-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-orange-500"
        />
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredVehicles.map((vehicle) => {
          return (
            <div
              key={vehicle.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-orange-200 transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-100">
                      {t[vehicle.type as VehicleType] || vehicle.type}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 mt-2">{vehicle.codeName}</h3>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">رقم اللوحة: {vehicle.plateNumber}</p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => onDeleteVehicle(vehicle.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title={t.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Details Breakdown */}
                <div className="mt-4 space-y-2 text-xs">
                  {vehicle.capacityM3 && (
                    <div className="flex justify-between text-slate-600">
                      <span>سعة الخرسانة:</span>
                      <span className="font-bold text-slate-900">{vehicle.capacityM3} م³</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>{t.assignedDriver}:</span>
                    <span className="font-semibold text-slate-800">{vehicle.driverName || 'غير محدد'}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>عدد رحلات التوصيل:</span>
                    <span className="font-bold text-slate-900">{vehicle.totalTrips || 0} رحلة</span>
                  </div>

                  {vehicle.insuranceExpiry && (
                    <div className="flex justify-between text-slate-600">
                      <span>{t.insuranceExpiry}:</span>
                      <span className="font-mono font-semibold text-slate-700">{vehicle.insuranceExpiry}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Switcher & Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">{t.vehicleStatus}:</span>
                <select
                  value={vehicle.status}
                  onChange={(e) => onUpdateVehicleStatus(vehicle.id, e.target.value as Vehicle['status'])}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                    vehicle.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : vehicle.status === 'maintenance'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  <option value="active">{t.statusActive}</option>
                  <option value="maintenance">{t.statusMaintenance}</option>
                  <option value="out_of_service">{t.statusOut}</option>
                </select>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal: Add Vehicle */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">{t.addVehicle}</h3>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.vehicleCode}</label>
                <input
                  type="text"
                  required
                  value={newVehicle.codeName}
                  onChange={(e) => setNewVehicle({ ...newVehicle, codeName: e.target.value })}
                  placeholder="مثال: خلاطة خرسانة #03"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.plateNumber}</label>
                <input
                  type="text"
                  required
                  value={newVehicle.plateNumber}
                  onChange={(e) => setNewVehicle({ ...newVehicle, plateNumber: e.target.value })}
                  placeholder="01234-325-07"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.vehicleType}</label>
                  <select
                    value={newVehicle.type}
                    onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value as VehicleType })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                  >
                    <option value="concrete_mixer">{t.concrete_mixer}</option>
                    <option value="concrete_pump">{t.concrete_pump}</option>
                    <option value="tipper_truck">{t.tipper_truck}</option>
                    <option value="wheel_loader">{t.wheel_loader}</option>
                    <option value="service_car">{t.service_car}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.capacityM3}</label>
                  <input
                    type="number"
                    value={newVehicle.capacityM3 || 0}
                    onChange={(e) => setNewVehicle({ ...newVehicle, capacityM3: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.assignedDriver}</label>
                <input
                  type="text"
                  value={newVehicle.driverName}
                  onChange={(e) => setNewVehicle({ ...newVehicle, driverName: e.target.value })}
                  placeholder="اسم السائق..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.insuranceExpiry}</label>
                  <input
                    type="date"
                    value={newVehicle.insuranceExpiry}
                    onChange={(e) => setNewVehicle({ ...newVehicle, insuranceExpiry: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.techInspection}</label>
                  <input
                    type="date"
                    value={newVehicle.techInspectionExpiry}
                    onChange={(e) => setNewVehicle({ ...newVehicle, techInspectionExpiry: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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

    </div>
  );
};
