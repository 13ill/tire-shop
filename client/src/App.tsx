import { useState, useEffect } from 'react';
import { AuthService, User } from './lib/auth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import ProductsPage from './pages/ProductsPage';
import StockPage from './pages/StockPage';
import POSPage from './pages/POSPage';
import CustomersPage from './pages/CustomersPage';
import { initOfflineDB } from './lib/db';
import { SyncService } from './lib/sync';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    // Initialize app
    const initializeApp = async () => {
      try {
        // Initialize offline database
        await initOfflineDB();
        
        // Start auto-sync
        SyncService.startAutoSync();

        // Check authentication
        const { token, user: storedUser } = AuthService.getStoredAuth();
        
        if (token && storedUser) {
          // Verify token is still valid
          const currentUser = await AuthService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          } else {
            // Token invalid, clear it
            AuthService.clearAuth();
          }
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'settings':
        return <SettingsPage />;
      case 'products':
        return <ProductsPage />;
      case 'stock':
        return <StockPage />;
      case 'pos':
        return <POSPage />;
      case 'customers':
        return <CustomersPage />;
      default:
        return (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                ยินดีต้อนรับสู่ระบบ POS+Stock
              </h1>
              <p className="text-gray-600 mb-6">
                ระบบจัดการร้านยางครบวงจรสำหรับธุรกิจของคุณ
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900">วันนี้</h3>
                  <p className="text-2xl font-bold text-blue-600">฿0</p>
                  <p className="text-sm text-blue-700">ยอดขาย</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900">สินค้า</h3>
                  <p className="text-2xl font-bold text-green-600">0</p>
                  <p className="text-sm text-green-700">รายการ</p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-900">ลูกค้า</h3>
                  <p className="text-2xl font-bold text-yellow-600">0</p>
                  <p className="text-sm text-yellow-700">คน</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-900">ใบสั่งซ่อม</h3>
                  <p className="text-2xl font-bold text-purple-600">0</p>
                  <p className="text-sm text-purple-700">รายการ</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">การดำเนินงานล่าสุด</h2>
              <div className="text-gray-500 text-center py-8">
                <p>ยังไม่มีข้อมูลการดำเนินงาน</p>
                <p className="text-sm mt-2">เริ่มต้นการขายหรือบันทึกข้อมูลเพื่อแสดงที่นี่</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
