import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Settings, 
  CreditCard, 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  Save,
  X
} from 'lucide-react';

// Types
interface Setting {
  key: string;
  value: string;
  description?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  surchargePercent: string;
  discountPercent: string;
  sortOrder: number;
  isActive: boolean;
}

interface Unit {
  id: string;
  name: string;
  isDefault: boolean;
}

// Schemas
const settingSchema = z.object({
  value: z.string().min(1, 'กรุณาระบุค่า'),
  description: z.string().optional(),
});

const paymentMethodSchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อวิธีการชำระเงิน'),
  surchargePercent: z.string().regex(/^\d+(\.\d{1,2})?$/, 'กรุณาระบุเป็นตัวเลข'),
  discountPercent: z.string().regex(/^\d+(\.\d{1,2})?$/, 'กรุณาระบุเป็นตัวเลข'),
  sortOrder: z.number().int().min(0),
});

const unitSchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อหน่วย'),
  isDefault: z.boolean(),
});

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'payment' | 'units'>('general');
  const [settings, setSettings] = useState<Setting[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  // Forms
  const settingForm = useForm<z.infer<typeof settingSchema>>();
  const paymentForm = useForm<z.infer<typeof paymentMethodSchema>>();
  const unitForm = useForm<z.infer<typeof unitSchema>>();

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsRes, paymentRes, unitsRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/settings/payment-methods'),
        fetch('/api/settings/units'),
      ]);

      const [settingsData, paymentData, unitsData] = await Promise.all([
        settingsRes.json(),
        paymentRes.json(),
        unitsRes.json(),
      ]);

      if (settingsData.success) setSettings(settingsData.data);
      if (paymentData.success) setPaymentMethods(paymentData.data);
      if (unitsData.success) setUnits(unitsData.data);
    } catch (error) {
      console.error('Load settings error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSetting = async (key: string, data: z.infer<typeof settingSchema>) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await loadData();
        settingForm.reset();
      }
    } catch (error) {
      console.error('Save setting error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePaymentMethod = async (data: z.infer<typeof paymentMethodSchema>) => {
    setIsSaving(true);
    try {
      const url = editingPayment 
        ? `/api/settings/payment-methods/${editingPayment.id}`
        : '/api/settings/payment-methods';
      
      const method = editingPayment ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await loadData();
        setEditingPayment(null);
        paymentForm.reset();
      }
    } catch (error) {
      console.error('Save payment method error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (!confirm('คุณต้องการลบวิธีการชำระเงินนี้ใช่หรือไม่?')) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/settings/payment-methods/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Delete payment method error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveUnit = async (data: z.infer<typeof unitSchema>) => {
    setIsSaving(true);
    try {
      const url = editingUnit 
        ? `/api/settings/units/${editingUnit.id}`
        : '/api/settings/units';
      
      const method = editingUnit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await loadData();
        setEditingUnit(null);
        unitForm.reset();
      }
    } catch (error) {
      console.error('Save unit error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUnit = async (id: string) => {
    if (!confirm('คุณต้องการลบหน่วยนับนี้ใช่หรือไม่?')) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/settings/units/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Delete unit error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">ตั้งค่าระบบ</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'general', label: 'ทั่วไป', icon: Settings },
            { key: 'payment', label: 'วิธีการชำระเงิน', icon: CreditCard },
            { key: 'units', label: 'หน่วยนับ', icon: Package },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลร้าน</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {settings
                .filter(s => ['shop_name', 'shop_address', 'shop_phone'].includes(s.key))
                .map((setting) => (
                  <div key={setting.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {setting.description || setting.key}
                    </label>
                    <form onSubmit={settingForm.handleSubmit((data) => handleSaveSetting(setting.key, data))}>
                      <div className="flex space-x-2">
                        <input
                          {...settingForm.register('value')}
                          type="text"
                          defaultValue={setting.value}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                      </div>
                    </form>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">การเงิน</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {settings
                .filter(s => ['vat_percent', 'currency_symbol', 'decimal_places'].includes(s.key))
                .map((setting) => (
                  <div key={setting.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {setting.description || setting.key}
                    </label>
                    <form onSubmit={settingForm.handleSubmit((data) => handleSaveSetting(setting.key, data))}>
                      <div className="flex space-x-2">
                        <input
                          {...settingForm.register('value')}
                          type="text"
                          defaultValue={setting.value}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                      </div>
                    </form>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods */}
      {activeTab === 'payment' && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">วิธีการชำระเงิน</h2>
            <button
              onClick={() => {
                setEditingPayment({ id: '', name: '', surchargePercent: '0', discountPercent: '0', sortOrder: 0, isActive: true });
                paymentForm.reset();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มวิธีการชำระเงิน
            </button>
          </div>

          {/* Payment Form */}
          {editingPayment && (
            <div className="border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">
                {editingPayment.id ? 'แก้ไขวิธีการชำระเงิน' : 'เพิ่มวิธีการชำระเงิน'}
              </h3>
              <form onSubmit={paymentForm.handleSubmit(handleSavePaymentMethod)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  {...paymentForm.register('name', { value: editingPayment.name })}
                  type="text"
                  placeholder="ชื่อ"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  {...paymentForm.register('surchargePercent', { value: editingPayment.surchargePercent })}
                  type="text"
                  placeholder="ค่าธรรมเนียม (%)"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  {...paymentForm.register('discountPercent', { value: editingPayment.discountPercent })}
                  type="text"
                  placeholder="ส่วนลด (%)"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  {...paymentForm.register('sortOrder', { value: editingPayment.sortOrder })}
                  type="number"
                  placeholder="ลำดับ"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="md:col-span-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPayment(null);
                      paymentForm.reset();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    บันทึก
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Payment List */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ชื่อ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ค่าธรรมเนียม
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ส่วนลด
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ลำดับ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentMethods.map((method) => (
                  <tr key={method.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {method.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {method.surchargePercent}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {method.discountPercent}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {method.sortOrder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        method.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {method.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingPayment(method);
                          paymentForm.reset(method);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePaymentMethod(method.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Units */}
      {activeTab === 'units' && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">หน่วยนับ</h2>
            <button
              onClick={() => {
                setEditingUnit({ id: '', name: '', isDefault: false });
                unitForm.reset();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มหน่วยนับ
            </button>
          </div>

          {/* Unit Form */}
          {editingUnit && (
            <div className="border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">
                {editingUnit.id ? 'แก้ไขหน่วยนับ' : 'เพิ่มหน่วยนับ'}
              </h3>
              <form onSubmit={unitForm.handleSubmit(handleSaveUnit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  {...unitForm.register('name', { value: editingUnit.name })}
                  type="text"
                  placeholder="ชื่อหน่วย"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex items-center">
                  <input
                    {...unitForm.register('isDefault', { value: editingUnit.isDefault })}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    เป็นค่าเริ่มต้น
                  </label>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUnit(null);
                      unitForm.reset();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    บันทึก
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Units List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {units.map((unit) => (
              <div key={unit.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{unit.name}</h3>
                    {unit.isDefault && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 mt-1">
                        ค่าเริ่มต้น
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingUnit(unit);
                        unitForm.reset(unit);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUnit(unit.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
