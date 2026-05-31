import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  Search, 
  User,
  CreditCard,
  DollarSign,
  Receipt,
  Package,
  Wrench,
  Calculator,
  Printer,
  Save,
  AlertCircle
} from 'lucide-react';

// Types
interface Product {
  id: string;
  name: string;
  sku?: string;
  type: 'product' | 'service';
  basePrice: number;
  laborPrice?: number;
  costPrice: number;
  unitId?: string;
  minStock: number;
  currentStock: number;
  imageUrl?: string;
  barcode?: string;
}

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSku?: string;
  type: 'product' | 'service';
  quantity: number;
  unitPrice: number;
  laborPrice?: number;
  totalPrice: number;
  discount?: number;
  notes?: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  vehicle?: string;
}

// Schemas
const paymentSchema = z.object({
  paymentMethod: z.string(),
  cashAmount: z.number().min(0),
  discount: z.number().min(0).max(100),
  vatRate: z.number().min(0).max(100),
});

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'product' | 'service'>('all');

  // Payment form
  const paymentForm = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: 'cash',
      cashAmount: 0,
      discount: 0,
      vatRate: 7,
    },
  });

  // Load data
  useEffect(() => {
    loadProducts();
    loadCustomers();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/pos/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Load products error:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await fetch('/api/pos/customers');
      const data = await response.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (error) {
      console.error('Load customers error:', error);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const discount = subtotal * (paymentForm.watch('discount') / 100);
    const afterDiscount = subtotal - discount;
    const vat = afterDiscount * (paymentForm.watch('vatRate') / 100);
    const total = afterDiscount + vat;
    
    return { subtotal, discount, vat, total };
  };

  // Cart operations
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      updateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const newItem: CartItem = {
        id: crypto.randomUUID(),
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        type: product.type,
        quantity: 1,
        unitPrice: product.basePrice || 0,
        laborPrice: product.laborPrice,
        totalPrice: (product.basePrice || 0) + (product.laborPrice || 0),
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const itemTotal = (item.unitPrice * quantity) + (item.laborPrice || 0);
        return { ...item, quantity, totalPrice: itemTotal };
      }
      return item;
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    paymentForm.reset();
  };

  // Payment processing
  const processPayment = async (data: z.infer<typeof paymentSchema>) => {
    setIsProcessing(true);
    
    try {
      const { subtotal, discount, vat, total } = calculateTotals();
      
      const transactionData = {
        customerId: selectedCustomer?.id,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          laborPrice: item.laborPrice,
          discount: item.discount,
          notes: item.notes,
        })),
        discount: data.discount,
        vatRate: data.vatRate,
        paymentMethod: data.paymentMethod,
        paymentDetails: {
          cashAmount: data.cashAmount,
          changeAmount: data.cashAmount - total,
        },
      };

      const response = await fetch('/api/pos/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });

      if (response.ok) {
        const result = await response.json();
        setLastTransaction(result.data);
        setShowPayment(false);
        setShowReceipt(true);
        clearCart();
      } else {
        throw new Error('Processing failed');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('การชำระเงินล้มเหลว กรุณาลองใหม่');
    } finally {
      setIsProcessing(false);
    }
  };

  const { subtotal, discount, vat, total } = calculateTotals();

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || product.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">จุดขาย (POS)</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-md text-sm ${
                  filterType === 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setFilterType('product')}
                className={`px-3 py-1 rounded-md text-sm ${
                  filterType === 'product' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                สินค้า
              </button>
              <button
                onClick={() => setFilterType('service')}
                className={`px-3 py-1 rounded-md text-sm ${
                  filterType === 'service' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                บริการ
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {product.type === 'product' ? (
                      <Package className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <Wrench className="h-4 w-4 text-purple-600 mr-1" />
                    )}
                    <span className="text-xs text-gray-500">{product.type === 'product' ? 'สินค้า' : 'บริการ'}</span>
                  </div>
                  {product.currentStock <= product.minStock && (
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  )}
                </div>
                
                <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                  {product.name}
                </h3>
                
                {product.sku && (
                  <p className="text-xs text-gray-500 mb-2">SKU: {product.sku}</p>
                )}
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">ราคา:</span>
                    <span className="text-sm font-semibold text-green-600">
                      ฿{product.basePrice?.toLocaleString() || 0}
                    </span>
                  </div>
                  
                  {product.laborPrice && product.laborPrice > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">แรงงาน:</span>
                      <span className="text-xs text-blue-600">
                        ฿{product.laborPrice.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  {product.type === 'product' && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">สต็อก:</span>
                      <span className={`text-xs ${
                        product.currentStock <= product.minStock 
                          ? 'text-orange-600 font-medium' 
                          : 'text-gray-600'
                      }`}>
                        {product.currentStock}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-96 bg-white border-l flex flex-col">
          {/* Cart Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">ตะกร้า</h2>
              <button
                onClick={clearCart}
                className="text-sm text-red-600 hover:text-red-700"
              >
                ล้างตะกร้า
              </button>
            </div>

            {/* Customer Selection */}
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-400" />
              <select
                value={selectedCustomer?.id || ''}
                onChange={(e) => {
                  const customer = customers.find(c => c.id === e.target.value);
                  setSelectedCustomer(customer || null);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">ลูกค้าทั่วไป</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} {customer.phone && `(${customer.phone})`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>ตะกร้าว่าง</p>
                <p className="text-sm mt-2">เลือกสินค้าเพื่อเริ่มขาย</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900">
                          {item.productName}
                        </h4>
                        {item.productSku && (
                          <p className="text-xs text-gray-500">SKU: {item.productSku}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          ฿{item.totalPrice.toLocaleString()}
                        </div>
                        {item.laborPrice && (
                          <div className="text-xs text-gray-500">
                            ฿{item.unitPrice} + ฿{item.laborPrice}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          <div className="border-t p-4 space-y-3">
            {/* Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">รวม:</span>
                <span className="font-medium">฿{subtotal.toLocaleString()}</span>
              </div>
              
              {paymentForm.watch('discount') > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ส่วนลด:</span>
                  <span className="font-medium text-red-600">
                    -฿{discount.toLocaleString()}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">VAT {paymentForm.watch('vatRate')}%:</span>
                <span className="font-medium">฿{vat.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-lg font-semibold">
                <span>รวมทั้งหมด:</span>
                <span className="text-green-600">฿{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => setShowPayment(true)}
                disabled={cart.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                ชำระเงิน
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ชำระเงิน</h3>
            
            <form onSubmit={paymentForm.handleSubmit(processPayment)} className="space-y-4">
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>รวม:</span>
                  <span>฿{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ส่วนลด:</span>
                  <span className="text-red-600">-฿{discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>VAT:</span>
                  <span>฿{vat.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>รวมทั้งหมด:</span>
                  <span className="text-green-600">฿{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  วิธีการชำระเงิน
                </label>
                <select
                  {...paymentForm.register('paymentMethod')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cash">เงินสด</option>
                  <option value="transfer">โอนเงิน</option>
                  <option value="card">บัตรเครดิต</option>
                  <option value="qr">QR Code</option>
                </select>
              </div>

              {/* Cash Amount (for cash payment) */}
              {paymentForm.watch('paymentMethod') === 'cash' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    จำนวนเงินที่รับ
                  </label>
                  <input
                    {...paymentForm.register('cashAmount', { valueAsNumber: true })}
                    type="number"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  {paymentForm.watch('cashAmount') > total && (
                    <p className="text-sm text-green-600 mt-1">
                      เงินทอน: ฿{(paymentForm.watch('cashAmount') - total).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ส่วนลด (%)
                </label>
                <input
                  {...paymentForm.register('discount', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPayment(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isProcessing ? 'กำลังดำเนินการ...' : 'ยืนยันการชำระเงิน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">ใบเสร็จรับเงิน</h3>
              <p className="text-sm text-gray-600">Transaction ID: {lastTransaction.transactionId}</p>
            </div>

            {/* Receipt content would go here */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-center text-gray-600">ใบเสร็จจะแสดงที่นี่</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowReceipt(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                เสร็จสิ้น
              </button>
              <button className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center">
                <Printer className="h-4 w-4 mr-2" />
                พิมพ์
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
