import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Car, 
  Phone, 
  Mail, 
  MapPin, 
  Search,
  X,
  Save,
  User,
  Calendar
} from 'lucide-react';

// Types
interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
  zipcode?: string;
  taxId?: string;
  note?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  vehicles?: Vehicle[];
}

interface Vehicle {
  id: string;
  customerId: string;
  brand?: string;
  model?: string;
  year?: string;
  color?: string;
  licensePlate?: string;
  vin?: string;
  engineNumber?: string;
  mileage?: string;
  note?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Schemas
const customerSchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อลูกค้า'),
  phone: z.string().optional(),
  email: z.string().email('กรุณาระบุอีเมลให้ถูกต้อง').optional(),
  address: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  subdistrict: z.string().optional(),
  zipcode: z.string().optional(),
  taxId: z.string().optional(),
  note: z.string().optional(),
  isActive: z.boolean().default(true),
});

const vehicleSchema = z.object({
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.string().optional(),
  color: z.string().optional(),
  licensePlate: z.string().optional(),
  vin: z.string().optional(),
  engineNumber: z.string().optional(),
  mileage: z.string().regex(/^\d+(\.\d{1,2})?$/, 'กรุณาระบุเป็นตัวเลข').optional(),
  note: z.string().optional(),
  isActive: z.boolean().default(true),
});

type CustomerFormData = z.infer<typeof customerSchema>;
type VehicleFormData = z.infer<typeof vehicleSchema>;

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [vehicleBrands, setVehicleBrands] = useState<any[]>([]);
  const [vehicleModels, setVehicleModels] = useState<any[]>([]);
  const [showCustomBrandInput, setShowCustomBrandInput] = useState(false);
  const [selectedBrandDisplay, setSelectedBrandDisplay] = useState('');
  const [filteredBrands, setFilteredBrands] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const customBrandInputRef = useRef<HTMLInputElement>(null);
  const [showCustomModelInput, setShowCustomModelInput] = useState(false);
  const [selectedModelDisplay, setSelectedModelDisplay] = useState('');
  const [filteredModels, setFilteredModels] = useState<any[]>([]);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const customModelInputRef = useRef<HTMLInputElement>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  const customerForm = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      province: '',
      district: '',
      subdistrict: '',
      zipcode: '',
      taxId: '',
      note: '',
      isActive: true,
    },
  });

  const vehicleForm = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      brand: '',
      model: '',
      year: '',
      color: '',
      licensePlate: '',
      vin: '',
      engineNumber: '',
      mileage: '',
      note: '',
      isActive: true,
    },
  });

  // Load vehicle brands
  const loadVehicleBrands = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/customers/vehicle-brands');
      const result = await response.json();
      if (result.success) {
        setVehicleBrands(result.data);
      }
    } catch (error) {
      console.error('Load vehicle brands error:', error);
    }
  };

  // Load vehicle models by brand
  const loadVehicleModels = async (brandId?: string) => {
    try {
      const url = brandId 
        ? `http://localhost:3000/api/customers/vehicle-models?brandId=${brandId}`
        : 'http://localhost:3000/api/customers/vehicle-models';
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setVehicleModels(result.data);
      }
    } catch (error) {
      console.error('Load vehicle models error:', error);
    }
  };

  // Add new brand function
  const addNewBrand = async (brandName: string, input: HTMLInputElement) => {
    try {
      const response = await fetch('http://localhost:3000/api/customers/vehicle-brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: brandName }),
      });
      const result = await response.json();
      if (result.success) {
        await loadVehicleBrands();
        setSelectedBrandDisplay(brandName); // Set display to new brand
        vehicleForm.setValue('brand', result.data.id);
        loadVehicleModels(result.data.id);
        setShowCustomBrandInput(false); // Hide custom input
        input.value = ''; // Clear input
      }
    } catch (error) {
      console.error('Add brand error:', error);
    }
  };

  // Add new model function
  const addNewModel = async (modelName: string, input: HTMLInputElement) => {
    try {
      const selectedBrandId = vehicleForm.getValues('brand');
      if (!selectedBrandId) {
        alert('กรุณาเลือกยี่ห้อรถก่อนเพิ่มรุ่นใหม่');
        return;
      }

      const response = await fetch('http://localhost:3000/api/customers/vehicle-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName, brandId: selectedBrandId }),
      });
      const result = await response.json();
      if (result.success) {
        await loadVehicleModels(selectedBrandId);
        setSelectedModelDisplay(modelName); // Set display to new model
        vehicleForm.setValue('model', result.data.id);
        setShowCustomModelInput(false); // Hide custom input
        input.value = ''; // Clear input
      }
    } catch (error) {
      console.error('Add model error:', error);
    }
  };

  // Load customers
  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (showInactive) params.append('active', 'false');
      
      const response = await fetch(`http://localhost:3000/api/customers?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setCustomers(result.data);
      } else {
        console.error('Load customers error:', result.error);
      }
    } catch (error) {
      console.error('Load customers error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load customer with vehicles
  const loadCustomerWithVehicles = async (customerId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/customers/${customerId}`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
    } catch (error) {
      console.error('Load customer error:', error);
    }
    return null;
  };

  // Save customer
  const handleSaveCustomer = async (data: CustomerFormData) => {
    try {
      const url = editingCustomer 
        ? `http://localhost:3000/api/customers/${editingCustomer.id}`
        : 'http://localhost:3000/api/customers';
      
      const method = editingCustomer ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await loadCustomers();
        setShowCustomerForm(false);
        setEditingCustomer(null);
        customerForm.reset();
        alert(editingCustomer ? 'อัพเดทลูกค้าเรียบร้อย' : 'สร้างลูกค้าเรียบร้อย');
      } else {
        alert(result.error || 'ไม่สามารถบันทึกลูกค้าได้');
      }
    } catch (error) {
      console.error('Save customer error:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกลูกค้า');
    }
  };

  // Save vehicle
  const handleSaveVehicle = async (data: VehicleFormData) => {
    if (!selectedCustomer) return;

    try {
      const response = await fetch(`http://localhost:3000/api/customers/${selectedCustomer.id}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Reload customer with vehicles
        const updatedCustomer = await loadCustomerWithVehicles(selectedCustomer.id);
        if (updatedCustomer) {
          setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? updatedCustomer : c));
          setSelectedCustomer(updatedCustomer);
        }
        setShowVehicleForm(false);
        vehicleForm.reset();
        alert('เพิ่มรถเรียบร้อย');
      } else {
        alert(result.error || 'ไม่สามารถเพิ่มรถได้');
      }
    } catch (error) {
      console.error('Save vehicle error:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มรถ');
    }
  };

  // Delete customer (soft delete)
  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('คุณต้องการลบลูกค้านี้ใช่หรือไม่?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/customers/${customerId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await loadCustomers();
        alert('ลบลูกค้าเรียบร้อย');
      } else {
        alert(result.error || 'ไม่สามารถลบลูกค้าได้');
      }
    } catch (error) {
      console.error('Delete customer error:', error);
      alert('เกิดข้อผิดพลาดในการลบลูกค้า');
    }
  };

  // Toggle customer details
  const toggleCustomerDetails = async (customerId: string) => {
    if (expandedCustomer === customerId) {
      setExpandedCustomer(null);
    } else {
      setExpandedCustomer(customerId);
      const customer = await loadCustomerWithVehicles(customerId);
      if (customer) {
        setSelectedCustomer(customer);
        setCustomers(prev => prev.map(c => c.id === customerId ? customer : c));
      }
    }
  };

  // Edit customer
  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    customerForm.reset({
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      province: customer.province || '',
      district: customer.district || '',
      subdistrict: customer.subdistrict || '',
      zipcode: customer.zipcode || '',
      taxId: customer.taxId || '',
      note: customer.note || '',
      isActive: customer.isActive,
    });
    setShowCustomerForm(true);
  };

  // Effects
  useEffect(() => {
    loadCustomers();
  }, [searchTerm, showInactive]);

  useEffect(() => {
    loadVehicleBrands();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" />
          จัดการลูกค้า
        </h1>
        <button
          onClick={() => {
            setEditingCustomer(null);
            customerForm.reset();
            setShowCustomerForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          เพิ่มลูกค้า
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาลูกค้า..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded"
            />
            <span>แสดงที่ไม่ใช้งาน</span>
          </label>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2">กำลังโหลดข้อมูล...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>ไม่พบข้อมูลลูกค้า</p>
          </div>
        ) : (
          <div className="divide-y">
            {customers.map((customer) => (
              <div key={customer.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{customer.name}</h3>
                      {!customer.isActive && (
                        <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs">
                          ไม่ใช้งาน
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      {customer.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {customer.phone}
                        </div>
                      )}
                      {customer.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {customer.email}
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-center gap-1 md:col-span-2">
                          <MapPin className="w-4 h-4" />
                          {customer.address}
                          {customer.district && `, ${customer.district}`}
                          {customer.province && `, ${customer.province}`}
                        </div>
                      )}
                    </div>
                    {customer.vehicles && customer.vehicles.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <Car className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {customer.vehicles.length} คัน
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleCustomerDetails(customer.id)}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="ดูรายละเอียด"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditCustomer(customer)}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="แก้ไข"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer.id)}
                      className="p-2 hover:bg-red-100 rounded text-red-600"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedCustomer === customer.id && selectedCustomer && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        รถยนต์ ({selectedCustomer.vehicles?.length || 0} คัน)
                      </h4>
                      {selectedCustomer.vehicles && selectedCustomer.vehicles.length > 0 ? (
                        <div className="space-y-2">
                          {selectedCustomer.vehicles.map((vehicle) => (
                            <div key={vehicle.id} className="bg-gray-50 p-3 rounded">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">
                                    {vehicle.brand} {vehicle.model}
                                  </p>
                                  <div className="text-sm text-gray-600 space-y-1">
                                    {vehicle.licensePlate && (
                                      <p>ทะเบียน: {vehicle.licensePlate}</p>
                                    )}
                                    {vehicle.year && <p>ปี: {vehicle.year}</p>}
                                    {vehicle.color && <p>สี: {vehicle.color}</p>}
                                    {vehicle.mileage && <p>ไมล์: {vehicle.mileage}</p>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">ไม่มีข้อมูลรถยนต์</p>
                      )}
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowVehicleForm(true);
                        }}
                        className="mt-2 text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        เพิ่มรถ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Form Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingCustomer ? 'แก้ไขลูกค้า' : 'เพิ่มลูกค้าใหม่'}
              </h2>
              <button
                onClick={() => setShowCustomerForm(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={customerForm.handleSubmit(handleSaveCustomer)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">ชื่อลูกค้า *</label>
                  <input
                    {...customerForm.register('name')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {customerForm.formState.errors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {customerForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">เบอร์โทรศัพท์</label>
                  <input
                    {...customerForm.register('phone')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">อีเมล</label>
                  <input
                    {...customerForm.register('email')}
                    type="email"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {customerForm.formState.errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {customerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">เลขประจำตัวผู้เสียภาษี</label>
                  <input
                    {...customerForm.register('taxId')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">ที่อยู่</label>
                <textarea
                  {...customerForm.register('address')}
                  rows={2}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">จังหวัด</label>
                  <input
                    {...customerForm.register('province')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">อำเภอ/เขต</label>
                  <input
                    {...customerForm.register('district')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">ตำบล/แขวง</label>
                  <input
                    {...customerForm.register('subdistrict')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">รหัสไปรษณีย์</label>
                  <input
                    {...customerForm.register('zipcode')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    {...customerForm.register('isActive')}
                    type="checkbox"
                    className="mr-2"
                  />
                  <label className="text-sm font-medium">ใช้งาน</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">หมายเหตุ</label>
                <textarea
                  {...customerForm.register('note')}
                  rows={3}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomerForm(false)}
                  className="w-full sm:w-auto px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vehicle Form Modal */}
      {showVehicleForm && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">เพิ่มรถยนต์</h2>
              <button
                onClick={() => setShowVehicleForm(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={vehicleForm.handleSubmit(handleSaveVehicle)} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-3">ยี่ห้อรถ</label>
                  
                  {/* SurveyJS-style Dropdown */}
                  <div className="relative">
                    {!showCustomBrandInput ? (
                      <>
                        <input
                          type="text"
                          placeholder="ค้นหาหรือเลือกยี่ห้อรถ..."
                          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={selectedBrandDisplay}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSelectedBrandDisplay(value);
                            
                            // Filter brands based on search
                            const filtered = vehicleBrands.filter(brand => 
                              brand.name.toLowerCase().includes(value.toLowerCase())
                            );
                            setFilteredBrands(filtered);
                            setShowDropdown(true);
                          }}
                          onFocus={() => {
                            setShowDropdown(true);
                            setFilteredBrands(vehicleBrands);
                          }}
                          onBlur={() => {
                            setTimeout(() => setShowDropdown(false), 200);
                          }}
                        />
                        
                        {/* Dropdown List */}
                        {showDropdown && (
                          <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredBrands.map((brand) => (
                              <div
                                key={brand.id}
                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                                onClick={() => {
                                  vehicleForm.setValue('brand', brand.id);
                                  setSelectedBrandDisplay(brand.name);
                                  loadVehicleModels(brand.id);
                                  setShowDropdown(false);
                                }}
                              >
                                <div className="flex items-center">
                                  <span className="text-lg mr-2">🚗</span>
                                  <span>{brand.name}</span>
                                </div>
                              </div>
                            ))}
                            
                            {/* "Other" Option */}
                            <div
                              className="px-3 py-2 hover:bg-green-50 cursor-pointer border-t bg-gray-50"
                              onClick={() => {
                                setShowDropdown(false);
                                setShowCustomBrandInput(true);
                                setSelectedBrandDisplay(''); // Clear existing value
                                setTimeout(() => {
                                  customBrandInputRef.current?.focus();
                                }, 100);
                              }}
                            >
                              <div className="flex items-center">
                                <span className="text-lg mr-2">✏️</span>
                                <span>เพิ่มยี่ห้อใหม่...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      /* Custom Brand Input */
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="ระบุยี่ห้อใหม่..."
                          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          ref={customBrandInputRef}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              const brandName = input.value.trim();
                              if (brandName) {
                                addNewBrand(brandName, input);
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          onClick={() => {
                            const input = customBrandInputRef.current;
                            if (input && input.value.trim()) {
                              addNewBrand(input.value.trim(), input);
                            }
                          }}
                        >
                          เพิ่ม
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                          onClick={() => {
                            setShowCustomBrandInput(false);
                            setSelectedBrandDisplay('');
                          }}
                        >
                          ยกเลิก
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">รุ่นรถ</label>
                  
                  {/* SurveyJS-style Dropdown for Model */}
                  <div className="relative">
                    {!showCustomModelInput ? (
                      <>
                        <input
                          type="text"
                          placeholder="ค้นหาหรือเลือกรุ่นรถ..."
                          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={selectedModelDisplay}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSelectedModelDisplay(value);
                            
                            // Filter models based on search
                            const filtered = vehicleModels.filter(model => 
                              model.name.toLowerCase().includes(value.toLowerCase())
                            );
                            setFilteredModels(filtered);
                            setShowModelDropdown(true);
                          }}
                          onFocus={() => {
                            setShowModelDropdown(true);
                            setFilteredModels(vehicleModels);
                          }}
                          onBlur={() => {
                            setTimeout(() => setShowModelDropdown(false), 200);
                          }}
                        />
                        
                        {/* Model Dropdown List */}
                        {showModelDropdown && (
                          <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredModels.map((model) => (
                              <div
                                key={model.id}
                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                                onClick={() => {
                                  vehicleForm.setValue('model', model.id);
                                  setSelectedModelDisplay(model.name);
                                  setShowModelDropdown(false);
                                }}
                              >
                                <div className="flex items-center">
                                  <span className="text-lg mr-2">🚙</span>
                                  <span>{model.name}</span>
                                </div>
                              </div>
                            ))}
                            
                            {/* "Other" Option */}
                            <div
                              className="px-3 py-2 hover:bg-green-50 cursor-pointer border-t bg-gray-50"
                              onClick={() => {
                                setShowModelDropdown(false);
                                setShowCustomModelInput(true);
                                setSelectedModelDisplay(''); // Clear existing value
                                setTimeout(() => {
                                  customModelInputRef.current?.focus();
                                }, 100);
                              }}
                            >
                              <div className="flex items-center">
                                <span className="text-lg mr-2">✏️</span>
                                <span>เพิ่มรุ่นใหม่...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      /* Custom Model Input */
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="ระบุรุ่นใหม่..."
                          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          ref={customModelInputRef}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              const modelName = input.value.trim();
                              if (modelName) {
                                addNewModel(modelName, input);
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          onClick={() => {
                            const input = customModelInputRef.current;
                            if (input && input.value.trim()) {
                              addNewModel(input.value.trim(), input);
                            }
                          }}
                        >
                          เพิ่ม
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                          onClick={() => {
                            setShowCustomModelInput(false);
                            setSelectedModelDisplay('');
                          }}
                        >
                          ยกเลิก
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">ปี</label>
                  <select
                    {...vehicleForm.register('year')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">เลือกปี</option>
                    {Array.from({ length: 51 }, (_, i) => 2025 - i).map((year) => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">สี</label>
                  <input
                    {...vehicleForm.register('color')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">ทะเบียนรถ</label>
                  <input
                    {...vehicleForm.register('licensePlate')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">เลขตัวถัง (VIN)</label>
                  <input
                    {...vehicleForm.register('vin')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">เลขเครื่อง</label>
                  <input
                    {...vehicleForm.register('engineNumber')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">เลขไมล์</label>
                  <input
                    {...vehicleForm.register('mileage')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {vehicleForm.formState.errors.mileage && (
                    <p className="text-red-500 text-xs mt-1">
                      {vehicleForm.formState.errors.mileage.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">หมายเหตุ</label>
                <textarea
                  {...vehicleForm.register('note')}
                  rows={3}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVehicleForm(false)}
                  className="w-full sm:w-auto px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
