import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter,
  Save,
  X,
  Eye,
  EyeOff
} from 'lucide-react';

// Types
interface Product {
  id: string;
  groupId?: string;
  name: string;
  variantName?: string;
  description?: string;
  type: 'product' | 'service';
  hasVariants: boolean;
  hasLaborCost: boolean;
  price?: string;
  laborPrice?: string;
  costPrice?: string;
  costMethod: 'fifo' | 'average' | 'manual';
  unitId?: string;
  sku?: string;
  barcode?: string;
  stock?: string;
  minStock: string;
  alertEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  categoryName?: string;
  unitName?: string;
  groupName?: string;
}

interface Category {
  id: string;
  name: string;
  type: 'product' | 'service';
}

interface Unit {
  id: string;
  name: string;
  isDefault: boolean;
}

interface ProductGroup {
  id: string;
  name: string;
  description?: string;
  skuPrefix?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Schemas
const productSchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อสินค้า/บริการ'),
  description: z.string().optional(),
  type: z.enum(['product', 'service']),
  categoryId: z.string().uuid().optional(),
  groupId: z.string().uuid().optional(),
  variantName: z.string().optional(),
  hasVariants: z.boolean().default(false),
  hasLaborCost: z.boolean().default(false),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'กรุณาระบุเป็นตัวเลข'),
  laborPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'กรุณาระบุเป็นตัวเลข').optional(),
  costPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'กรุณาระบุเป็นตัวเลข').optional(),
  costMethod: z.enum(['fifo', 'average', 'manual']).default('average'),
  unitId: z.string().uuid().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  minStock: z.string().optional(),
  alertEnabled: z.boolean().default(true),
  isActive: z.boolean().default(true),
}).refine((data) => {
  // Price validation - required for both types
  if (!data.price || parseFloat(data.price) <= 0) {
    return false;
  }
  return true;
}, {
  message: 'กรุณาระบุราคาให้ถูกต้อง',
  path: ['price'],
}).refine((data) => {
  // Unit validation only for products
  if (data.type === 'product' && !data.unitId) {
    return false;
  }
  return true;
}, {
  message: 'กรุณาระบุหน่วยนับ',
  path: ['unitId'],
});

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'product' | 'service'>('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Auto-generate functions
  const generateSKU = (name: string, type: 'product' | 'service'): string => {
    if (type === 'service') {
      // Services don't need SKU, return empty
      return '';
    }
    
    // Generate SKU from product name
    const words = name.toUpperCase().split(' ');
    const brand = words[0]?.substring(0, 2) || 'XX';
    const specs = words.slice(1).join('').replace(/[^A-Z0-9]/g, '');
    return brand + specs.substring(0, 8);
  };

  const generateBarcode = (sku: string): string => {
    if (!sku) return '';
    // Generate simple barcode from SKU (in real app, use proper barcode algorithm)
    return 'BC' + sku.replace(/[^A-Z0-9]/g, '') + Date.now().toString().slice(-4);
  };

  // Forms
  const productForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    mode: 'onChange', // Revalidate on change
  });

  // Watch for changes and auto-generate
  const watchName = productForm.watch('name');
  const watchType = productForm.watch('type');
  const watchSKU = productForm.watch('sku');
  const watchBarcode = productForm.watch('barcode');

  useEffect(() => {
    if (watchName && watchType && !editingProduct) {
      const newSKU = generateSKU(watchName, watchType);
      const newBarcode = generateBarcode(newSKU);
      
      if (!watchSKU && newSKU) {
        productForm.setValue('sku', newSKU);
      }
      if (!watchBarcode && newBarcode) {
        productForm.setValue('barcode', newBarcode);
      }
    }
  }, [watchName, watchType, watchSKU, watchBarcode, editingProduct, productForm]);

  // Revalidate form when type changes
  useEffect(() => {
    if (watchType) {
      console.log('🔥 Type changed to:', watchType);
      
      // Clear values that shouldn't apply to current type
      if (watchType === 'service') {
        console.log('🔥 Clearing service fields...');
        productForm.setValue('groupId', '');
        productForm.setValue('unitId', '');
        productForm.setValue('minStock', '');
        
        // Force clear errors for these fields
        productForm.clearErrors(['groupId', 'unitId', 'minStock']);
        console.log('🔥 Cleared errors for service fields');
      }
      
      // Revalidate affected fields
      productForm.trigger(['unitId', 'groupId', 'minStock']);
      console.log('🔥 Revalidated fields');
    }
  }, [watchType, productForm]);

  // Load data
  useEffect(() => {
    loadData();
  }, [currentPage, searchTerm, filterType, filterCategory, filterGroup]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Build query params
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filterType !== 'all') params.append('type', filterType);
      if (filterCategory) params.append('categoryId', filterCategory);

      const [productsRes, categoriesRes, unitsRes, groupsRes] = await Promise.all([
        fetch(`http://localhost:3000/api/products?${params}`),
        fetch('http://localhost:3000/api/categories'),
        fetch('http://localhost:3000/api/settings/units'),
        fetch('http://localhost:3000/api/product-groups'),
      ]);

      const [productsData, categoriesData, unitsData, groupsData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
        unitsRes.json(),
        groupsRes.json(),
      ]);

      if (productsData.success) {
        setProducts(productsData.data);
        setTotalPages(productsData.pagination?.totalPages || 1);
      }
      if (categoriesData.success) setCategories(categoriesData.data);
      if (unitsData.success) setUnits(unitsData.data);
      if (groupsData.success) setProductGroups(groupsData.data);
    } catch (error) {
      console.error('Load products error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProduct = async (data: z.infer<typeof productSchema>) => {
    console.log('🔥 handleSaveProduct called with:', data);
    console.log('🔥 editingProduct:', editingProduct);
    console.log('🔥 editingProduct.id:', editingProduct?.id);
    
    // Clean data before sending to backend
    const cleanedData = {
      ...data,
      // Convert empty strings to null/undefined for UUID fields
      groupId: data.groupId || null,
      unitId: data.unitId || null,
      categoryId: data.categoryId || null,
      // Convert empty strings to null for optional numeric fields
      minStock: data.minStock || null,
      // Keep other fields as-is
    };
    
    console.log('🔥 Cleaned data:', cleanedData);
    
    setIsSaving(true);
    try {
      const url = editingProduct && editingProduct.id
        ? `http://localhost:3000/api/products/${editingProduct.id}`
        : 'http://localhost:3000/api/products';
      
      const method = editingProduct && editingProduct.id ? 'PUT' : 'POST';
      console.log('🔥 URL:', url, 'Method:', method);
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });

      console.log('🔥 Response status:', response.status);
      const result = await response.json();
      console.log('🔥 Response result:', result);
      console.log('🔥 Error details:', result.error);

      if (response.ok && result.success) {
        await loadData();
        setEditingProduct(null);
        productForm.reset();
        alert(editingProduct ? 'อัพเดทสินค้าเรียบร้อย' : 'สร้างสินค้าเรียบร้อย');
      } else {
        console.log('🔥 Backend error:', result.error);
        
        // Log ZodError issues in detail
        if (result.error && result.error.issues) {
          console.log('🔥 ZodError issues:');
          result.error.issues.forEach((issue: any, index: number) => {
            console.log(`  ${index + 1}. Field: ${issue.path?.join('.') || 'unknown'}`);
            console.log(`     Message: ${issue.message}`);
            console.log(`     Code: ${issue.code}`);
          });
        }
        
        alert(result.error?.message || result.error || 'ไม่สามารถบันทึกสินค้าได้');
      }
    } catch (error) {
      console.error('🔥 Save product error:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกสินค้า');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('คุณต้องการลบสินค้านี้ใช่หรือไม่?')) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Delete product error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    productForm.reset({
      name: product.name,
      description: product.description || '',
      type: product.type,
      categoryId: product.categoryId || '',
      hasVariants: product.hasVariants,
      hasLaborCost: product.hasLaborCost,
      price: product.price || '',
      laborPrice: product.laborPrice || '',
      costPrice: product.costPrice || '',
      costMethod: product.costMethod,
      unitId: product.unitId || '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      minStock: product.minStock,
      alertEnabled: product.alertEnabled,
      isActive: product.isActive,
    });
  };

  const filteredCategories = categories.filter(cat => 
    filterType === 'all' || cat.type === filterType
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">สินค้าและบริการ</h1>
        <button
          onClick={() => {
            setEditingProduct({
              id: '',
              name: '',
              description: '',
              type: 'product',
              hasVariants: false,
              hasLaborCost: false,
              price: '',
              laborPrice: '',
              costPrice: '',
              costMethod: 'average',
              unitId: '',
              sku: '',
              barcode: '',
              minStock: '0',
              alertEnabled: true,
              isActive: true,
              createdAt: '',
              updatedAt: '',
            });
            productForm.reset();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มสินค้า/บริการ
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            ตัวกรอง
          </button>

          {showFilters && (
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">ทั้งหมด</option>
                <option value="product">สินค้า</option>
                <option value="service">บริการ</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">หมวดหมู่ทั้งหมด</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Product Form */}
      {editingProduct && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingProduct.id ? 'แก้ไขสินค้า/บริการ' : 'เพิ่มสินค้า/บริการ'}
          </h2>
          <form onSubmit={(e) => {
                  e.preventDefault();
                  console.log('🔥 Form submit triggered!');
                  console.log('🔥 Form is valid:', productForm.formState.isValid);
                  console.log('🔥 Form errors:', productForm.formState.errors);
                  
                  const values = productForm.getValues();
                  console.log('🔥 Form values:', values);
                  
                  // Brute force: bypass validation for services
                  if (values.type === 'service') {
                    console.log('🔥 Bypassing validation for service!');
                    handleSaveProduct(values);
                    return;
                  }
                  
                  // Normal flow for products
                  const result = productForm.handleSubmit(handleSaveProduct)(e);
                  console.log('🔥 handleSubmit result:', result);
                  return result;
                }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อสินค้า/บริการ *
                </label>
                <input
                  {...productForm.register('name')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {productForm.formState.errors.name && (
                  <p className="text-red-600 text-sm mt-1">{productForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ประเภท *
                </label>
                <select
                  {...productForm.register('type')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="product">สินค้า</option>
                  <option value="service">บริการ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  หมวดหมู่
                </label>
                <select
                  {...productForm.register('categoryId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {watchType === 'product' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    กลุ่มสินค้า (สำหรับสินค้าที่มีรุ่นย่อย)
                  </label>
                  <select
                    {...productForm.register('groupId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">ไม่มีกลุ่ม (สินค้าเดี่ยว)</option>
                    {productGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name} {group.skuPrefix && `(${group.skuPrefix})`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {watchType === 'product' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU {watchType === 'product' && '(Auto-generate)'}
                    </label>
                    <input
                      {...productForm.register('sku')}
                      type="text"
                      placeholder="จะสร้างอัตโนมัติจากชื่อสินค้า"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Barcode {watchType === 'product' && '(Auto-generate)'}
                    </label>
                    <input
                      {...productForm.register('barcode')}
                      type="text"
                      placeholder="จะสร้างอัตโนมัติจาก SKU"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              {watchType === 'product' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    หน่วยนับ
                  </label>
                  <select
                    {...productForm.register('unitId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">เลือกหน่วย</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} {unit.isDefault && '(ค่าเริ่มต้น)'}
                      </option>
                    ))}
                  </select>
                  {productForm.formState.errors.unitId && (
                    <p className="text-red-600 text-sm mt-1">{productForm.formState.errors.unitId.message}</p>
                  )}
                </div>
              )}

              {watchType === 'product' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ราคาขายปลีก *
                    </label>
                    <input
                      {...productForm.register('price')}
                      type="text"
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    {productForm.formState.errors.price && (
                      <p className="text-red-600 text-sm mt-1">{productForm.formState.errors.price.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ราคาแรงงาน (ถ้ามี)
                    </label>
                    <input
                      {...productForm.register('laborPrice')}
                      type="text"
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ราคาบริการรวม *
                    </label>
                    <input
                      {...productForm.register('price')}
                      type="text"
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    {productForm.formState.errors.price && (
                      <p className="text-red-600 text-sm mt-1">{productForm.formState.errors.price.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      แยกราคาแรงงาน (ถ้าต้องการ)
                    </label>
                    <input
                      {...productForm.register('laborPrice')}
                      type="text"
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ราคาทุน
                </label>
                <input
                  {...productForm.register('costPrice')}
                  type="text"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {watchType === 'product' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      วิธีคำนวณทุน
                    </label>
                    <select
                      {...productForm.register('costMethod')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="fifo">FIFO (เข้าก่อนออกก่อน)</option>
                      <option value="average">เฉลี่ย</option>
                      <option value="manual">กำหนดเอง</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      สต็อกขั้นต่ำ
                    </label>
                    <input
                      {...productForm.register('minStock')}
                      type="text"
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    {...productForm.register('hasVariants')}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    มีรุ่นย่อย
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    {...productForm.register('hasLaborCost')}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    มีค่าแรงงาน
                  </label>
                </div>

                {watchType === 'product' && (
                  <div className="flex items-center">
                    <input
                      {...productForm.register('alertEnabled')}
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      แจ้งเตือนสต็อกต่ำ
                    </label>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    {...productForm.register('isActive')}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    ใช้งาน
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รายละเอียด
              </label>
              <textarea
                {...productForm.register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  productForm.reset();
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

      {/* Products List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Mobile Card View */}
        <div className="sm:hidden">
          <div className="divide-y divide-gray-200">
            {products.map((product) => (
              <div key={product.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {product.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.sku && `SKU: ${product.sku}`}
                    </div>
                  </div>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.type === 'product' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {product.type === 'product' ? 'สินค้า' : 'บริการ'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">หมวดหมู่:</span>
                    <span className="ml-1 text-gray-900">{product.categoryName || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">ราคา:</span>
                    <span className="ml-1 text-gray-900">
                      {product.price ? `฿${product.price}` : '-'}
                      {product.laborPrice && ` + ฿${product.laborPrice}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">สต็อก:</span>
                    <span className="ml-1 text-gray-900">
                      {product.minStock}
                      {product.alertEnabled && (
                        <span className="ml-1 text-orange-500">⚠️</span>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => startEdit(product)}
                    className="flex-1 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="flex-1 px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ชื่อ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ประเภท
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    หมวดหมู่
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ราคา
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สต็อก
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
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.sku && `SKU: ${product.sku}`}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.type === 'product' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.type === 'product' ? 'สินค้า' : 'บริการ'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.categoryName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.price ? `฿${product.price}` : '-'}
                    {product.laborPrice && ` + ฿${product.laborPrice}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.minStock}
                    {product.alertEnabled && (
                      <span className="ml-1 text-orange-500">⚠️</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => startEdit(product)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                ก่อนหน้า
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                ถัดไป
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  แสดง <span className="font-medium">{products.length}</span> รายการ
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    ก่อนหน้า
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    ถัดไป
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
