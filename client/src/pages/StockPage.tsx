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
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

// Types
interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'return' | 'loss' | 'damage' | 'correction';
  quantity: string;
  costAtTime?: string;
  referenceType?: string;
  referenceId?: string;
  lossReason?: string;
  note?: string;
  createdAt: string;
  productName: string;
  productSku?: string;
}

interface StockBalance {
  productId: string;
  productName: string;
  productSku: string;
  currentQty: string;
  minStock: string;
  alertEnabled: boolean;
  lastUpdated: string;
}

interface StockAlert {
  productId: string;
  productName: string;
  productSku: string;
  currentQty: string;
  minStock: string;
  alertType: 'low_stock' | 'out_of_stock';
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  sku?: string;
}

// Schemas
const stockMovementSchema = z.object({
  productId: z.string().uuid('กรุณาเลือกสินค้า'),
  type: z.enum(['in', 'out', 'return', 'loss', 'damage', 'correction']),
  quantity: z.string().regex(/^\d+(\.\d{1,2})?$/, 'กรุณาระบุเป็นตัวเลข'),
  costAtTime: z.string().regex(/^\d+(\.\d{1,2})?$/, 'กรุณาระบุเป็นตัวเลข').optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  lossReason: z.string().optional(),
  note: z.string().optional(),
});

export default function StockPage() {
  const [activeTab, setActiveTab] = useState<'balance' | 'movements' | 'alerts'>('balance');
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [balances, setBalances] = useState<StockBalance[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Forms
  const movementForm = useForm<z.infer<typeof stockMovementSchema>>({
    resolver: zodResolver(stockMovementSchema),
  });

  // Load data
  useEffect(() => {
    loadData();
  }, [activeTab, currentPage, searchTerm, filterType]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [productsRes] = await Promise.all([
        fetch('/api/products?limit=100'),
      ]);

      const productsData = await productsRes.json();
      if (productsData.success) {
        setProducts(productsData.data);
      }

      // Load tab-specific data
      if (activeTab === 'balance') {
        await loadBalances();
      } else if (activeTab === 'movements') {
        await loadMovements();
      } else if (activeTab === 'alerts') {
        await loadAlerts();
      }
    } catch (error) {
      console.error('Load stock data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMovements = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filterType !== 'all') params.append('type', filterType);

      const response = await fetch(`/api/stock/movements?${params}`);
      const data = await response.json();

      if (data.success) {
        setMovements(data.data);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Load movements error:', error);
    }
  };

  const loadBalances = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/stock/balance?${params}`);
      const data = await response.json();

      if (data.success) {
        setBalances(data.data);
      }
    } catch (error) {
      console.error('Load balances error:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await fetch('/api/stock/alerts');
      const data = await response.json();

      if (data.success) {
        setAlerts(data.data);
      }
    } catch (error) {
      console.error('Load alerts error:', error);
    }
  };

  const handleSaveMovement = async (data: z.infer<typeof stockMovementSchema>) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/stock/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await loadMovements();
        await loadBalances();
        setShowMovementForm(false);
        movementForm.reset();
      }
    } catch (error) {
      console.error('Save movement error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStockAdjustment = async (data: z.infer<typeof stockMovementSchema>) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/stock/adjustment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await loadMovements();
        await loadBalances();
        setShowMovementForm(false);
        movementForm.reset();
      }
    } catch (error) {
      console.error('Stock adjustment error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in': return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'out': return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      case 'return': return <RotateCcw className="h-4 w-4 text-blue-600" />;
      case 'loss': case 'damage': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'correction': return <Edit2 className="h-4 w-4 text-purple-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMovementLabel = (type: string) => {
    switch (type) {
      case 'in': return 'รับเข้า';
      case 'out': return 'เบิกออก';
      case 'return': return 'คืนสินค้า';
      case 'loss': return 'สูญเสีย';
      case 'damage': return 'เสียหาย';
      case 'correction': return 'ปรับปรุง';
      default: return type;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'in': return 'text-green-600 bg-green-50';
      case 'out': return 'text-red-600 bg-red-50';
      case 'return': return 'text-blue-600 bg-blue-50';
      case 'loss': case 'damage': return 'text-orange-600 bg-orange-50';
      case 'correction': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">จัดการสต็อก</h1>
        <button
          onClick={() => {
            setShowMovementForm(true);
            movementForm.reset();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          บันทึกการเคลื่อนไหวสต็อก
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'balance', label: 'คงเหลือปัจจุบัน', icon: Package },
            { key: 'movements', label: 'ประวัติการเคลื่อนไหว', icon: TrendingUp },
            { key: 'alerts', label: 'การแจ้งเตือน', icon: AlertTriangle },
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
              {tab.key === 'alerts' && alerts.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {alerts.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Movement Form */}
      {showMovementForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            บันทึกการเคลื่อนไหวสต็อก
          </h2>
          <form onSubmit={movementForm.handleSubmit(handleSaveMovement)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  สินค้า *
                </label>
                <select
                  {...movementForm.register('productId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">เลือกสินค้า</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} {product.sku && `(${product.sku})`}
                    </option>
                  ))}
                </select>
                {movementForm.formState.errors.productId && (
                  <p className="text-red-600 text-sm mt-1">{movementForm.formState.errors.productId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ประเภทการเคลื่อนไหว *
                </label>
                <select
                  {...movementForm.register('type')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="in">รับเข้า</option>
                  <option value="out">เบิกออก</option>
                  <option value="return">คืนสินค้า</option>
                  <option value="loss">สูญเสีย</option>
                  <option value="damage">เสียหาย</option>
                  <option value="correction">ปรับปรุง</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  จำนวน *
                </label>
                <input
                  {...movementForm.register('quantity')}
                  type="text"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {movementForm.formState.errors.quantity && (
                  <p className="text-red-600 text-sm mt-1">{movementForm.formState.errors.quantity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ราคาทุนขณะนั้น
                </label>
                <input
                  {...movementForm.register('costAtTime')}
                  type="text"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {['loss', 'damage', 'correction'].includes(movementForm.watch('type') || '') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เหตุผล *
                </label>
                <input
                  {...movementForm.register('lossReason')}
                  type="text"
                  placeholder="ระบุเหตุผลการเคลื่อนไหว"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {movementForm.formState.errors.lossReason && (
                  <p className="text-red-600 text-sm mt-1">{movementForm.formState.errors.lossReason.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หมายเหตุ
              </label>
              <textarea
                {...movementForm.register('note')}
                rows={2}
                placeholder="ระบุรายละเอียดเพิ่มเติม"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowMovementForm(false);
                  movementForm.reset();
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

      {/* Stock Balance */}
      {activeTab === 'balance' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
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
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สินค้า
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    คงเหลือ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ขั้นต่ำ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    อัพเดทล่าสุด
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {balances.map((balance) => (
                  <tr key={balance.productId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {balance.productName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {balance.productSku}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-lg font-semibold ${
                        parseFloat(balance.currentQty) < parseFloat(balance.minStock)
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}>
                        {balance.currentQty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {balance.minStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        parseFloat(balance.currentQty) < parseFloat(balance.minStock)
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {parseFloat(balance.currentQty) < parseFloat(balance.minStock) ? 'ต่ำ' : 'ปกติ'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(balance.lastUpdated).toLocaleDateString('th-TH')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Movements */}
      {activeTab === 'movements' && (
        <div className="space-y-4">
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
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">ทุกประเภท</option>
                <option value="in">รับเข้า</option>
                <option value="out">เบิกออก</option>
                <option value="return">คืนสินค้า</option>
                <option value="loss">สูญเสีย</option>
                <option value="damage">เสียหาย</option>
                <option value="correction">ปรับปรุง</option>
              </select>
            </div>
          </div>

          {/* Movements Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันที่
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สินค้า
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ประเภท
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      จำนวน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ราคาทุน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      หมายเหตุ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movements.map((movement) => (
                    <tr key={movement.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(movement.createdAt).toLocaleDateString('th-TH')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {movement.productName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {movement.productSku}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getMovementIcon(movement.type)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getMovementColor(movement.type)}`}>
                            {getMovementLabel(movement.type)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          movement.type === 'in' || movement.type === 'return'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {movement.type === 'in' || movement.type === 'return' ? '+' : '-'}{movement.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movement.costAtTime ? `฿${movement.costAtTime}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>
                          {movement.note && <div>{movement.note}</div>}
                          {movement.lossReason && (
                            <div className="text-orange-600">เหตุผล: {movement.lossReason}</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      แสดง <span className="font-medium">{movements.length}</span> รายการ
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
      )}

      {/* Stock Alerts */}
      {activeTab === 'alerts' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สินค้า
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    คงเหลือ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ขั้นต่ำ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ประเภทการแจ้งเตือน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่แจ้งเตือน
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alerts.map((alert) => (
                  <tr key={alert.productId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {alert.productName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {alert.productSku}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-semibold text-red-600">
                        {alert.currentQty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alert.minStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          {alert.alertType === 'low_stock' ? 'สต็อกต่ำ' : 'หมดสต็อก'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(alert.createdAt).toLocaleDateString('th-TH')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {alerts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>ไม่มีการแจ้งเตือนสต็อกในขณะนี้</p>
              <p className="text-sm mt-2">สต็อกทั้งหมดอยู่ในระดับปกติ</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
