import React, { useState, useEffect, createContext, useContext } from 'react';
import AuthComponent from './components/AuthComponent';
import { authService } from './services/authService';
import { dataService } from './services/dataService';
import database from './config/database';

const { testConnection, createTables, insertInitialData, isDatabaseAvailable, getConnectionStatus } = database;

// =================== CONTEXT DE AUTENTICAÇÃO ===================
const AuthContext = createContext({});

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  useEffect(() => { initializeApp(); }, []);

  const initializeApp = async () => {
    setLoading(true);
    try {
      const status = getConnectionStatus();
      setConnectionStatus(status);

      const savedUser = localStorage.getItem('dellLaptopUser');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          const userExists = await authService.getUserById(userData.id);
          if (userExists) {
            setUser(userData);
          } else {
            localStorage.removeItem('dellLaptopUser');
          }
        } catch (error) {
          localStorage.removeItem('dellLaptopUser');
        }
      }

      if (isDatabaseAvailable()) {
        setTimeout(async () => {
          try {
            const connected = await testConnection();
            if (connected) {
              await createTables();
              await insertInitialData();
            }
          } catch (error) {
            console.error('❌ Erro na inicialização do banco:', error);
          }
        }, 500);
      }
    } catch (error) {
      console.error('❌ Erro na inicialização:', error);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  const login = async (userData) => {
    try {
      setUser(userData);
      localStorage.setItem('dellLaptopUser', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem('dellLaptopUser');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isInitialized, connectionStatus, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// =================== SIMULAÇÃO DE ANÁLISE DE IA ===================
const AIAnalysisService = {
  async analyzeLaptopDamage(imageData) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    const scenarios = [
      {
        overall_condition: 'Excelente', damage_score: 5, confidence: 98, damages: [],
        recommendations: ['Ativo em excelente estado', 'Continuar com manutenção preventiva regular']
      },
      {
        overall_condition: 'Bom', damage_score: 25, confidence: 92,
        damages: [{ type: 'Riscos superficiais', location: 'Tampa', severity: 'Leve', description: 'Pequenos riscos na superfície' }],
        recommendations: ['Estado geral bom com sinais normais de uso', 'Considerar limpeza profunda']
      }
    ];
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    return {
      success: true,
      data: { analysis_id: Date.now().toString(), timestamp: new Date().toISOString(), ...randomScenario }
    };
  }
};

// =================== ÍCONES SVG ===================
const Icons = {
  Laptop: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
  ),
  Desktop: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="3" width="20" height="14" rx="2"></rect>
      <path d="M8 21h8M12 17v4"></path>
    </svg>
  ),
  Monitor: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="3" width="20" height="14" rx="2"></rect>
      <path d="M8 21h8M12 17v4"></path>
      <circle cx="12" cy="10" r="1" fill="currentColor"></circle>
    </svg>
  ),
  Printer: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polyline points="6,9 6,2 18,2 18,9"></polyline>
      <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"></path>
      <rect x="6" y="14" width="12" height="8"></rect>
    </svg>
  ),
  Server: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="8" rx="2"></rect>
      <rect x="2" y="14" width="20" height="8" rx="2"></rect>
      <line x1="6" y1="6" x2="6.01" y2="6"></line>
      <line x1="6" y1="18" x2="6.01" y2="18"></line>
    </svg>
  ),
  Switch: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="8" width="20" height="8" rx="2"></rect>
      <line x1="6" y1="12" x2="6.01" y2="12"></line>
      <line x1="10" y1="12" x2="10.01" y2="12"></line>
      <line x1="14" y1="12" x2="14.01" y2="12"></line>
      <line x1="18" y1="12" x2="18.01" y2="12"></line>
    </svg>
  ),
  Tablet: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="4" y="2" width="16" height="20" rx="2"></rect>
      <line x1="12" y1="18" x2="12.01" y2="18"></line>
    </svg>
  ),
  Camera: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Trash2: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  X: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  AlertCircle: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12,6 12,12 16,14"></polyline>
    </svg>
  ),
  Home: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  BarChart3: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  User: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  LogOut: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Database: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
    </svg>
  ),
  WifiOff: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <line x1="1" y1="1" x2="23" y2="23"></line>
      <path d="M16.72 11.06A10.94 10.94 0 0119 12.55"></path>
      <path d="M5 12.55a10.94 10.94 0 015.17-2.39"></path>
      <path d="M10.71 5.05A16 16 0 0122.58 9"></path>
      <path d="M1.42 9a15.91 15.91 0 014.7-2.88"></path>
      <path d="M8.53 16.11a6 6 0 016.95 0"></path>
      <line x1="12" y1="20" x2="12.01" y2="20"></line>
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  MapPin: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Briefcase: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="7" width="20" height="14" rx="2"></rect>
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"></path>
    </svg>
  ),
  Upload: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  Download: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Wrench: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Zap: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"></polygon>
    </svg>
  ),
  Package: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"></path>
    </svg>
  ),
  Filter: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"></polygon>
    </svg>
  )
};

// =================== TIPOS DE ATIVO ===================
const ASSET_TYPES = [
  { value: 'Notebook', label: 'Notebook', icon: Icons.Laptop, color: 'from-blue-500 to-indigo-500' },
  { value: 'Desktop', label: 'Desktop', icon: Icons.Desktop, color: 'from-purple-500 to-violet-500' },
  { value: 'Monitor', label: 'Monitor', icon: Icons.Monitor, color: 'from-cyan-500 to-teal-500' },
  { value: 'Impressora', label: 'Impressora', icon: Icons.Printer, color: 'from-orange-500 to-amber-500' },
  { value: 'Servidor', label: 'Servidor', icon: Icons.Server, color: 'from-red-500 to-rose-500' },
  { value: 'Switch', label: 'Switch/Roteador', icon: Icons.Switch, color: 'from-green-500 to-emerald-500' },
  { value: 'Tablet', label: 'Tablet', icon: Icons.Tablet, color: 'from-pink-500 to-fuchsia-500' },
  { value: 'Outro', label: 'Outro', icon: Icons.Package, color: 'from-gray-500 to-slate-500' }
];

const getAssetTypeConfig = (type) =>
  ASSET_TYPES.find(t => t.value === type) || ASSET_TYPES[ASSET_TYPES.length - 1];

// =================== COMPONENTE PRINCIPAL ===================
const ITInventorySystem = () => {
  const { user, logout, connectionStatus } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [assets, setAssets] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [dellSupportStats, setDellSupportStats] = useState({});
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [assetTypeFilter, setAssetTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showAssetDetail, setShowAssetDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [photoState, setPhotoState] = useState({
    showOptions: false, showPreview: false, capturedPhoto: null,
    isProcessing: false, isAnalyzing: false, error: ''
  });

  const emptyForm = {
    asset_type: 'Notebook', model: '', service_tag: '', hostname: '',
    patrimony_number: '', location: '', project: '', department: '',
    assigned_user: '', responsible: '', purchase_company: '',
    term_signed: '', mac_address: '', teamviewer_id: '',
    processor: '', ram: '', storage: '', graphics: '', screen_size: '', color: '',
    operating_system: '', software_list: '',
    purchase_date: '', delivery_date: '', purchase_price: '', purchase_invoice: '',
    warranty_end: '', condition: 'Bom', condition_score: 70, status: 'Em Uso',
    photo: null, damage_analysis: null, notes: ''
  };

  const [assetForm, setAssetForm] = useState(emptyForm);

  const statuses = ['Disponível', 'Em Uso', 'Manutenção', 'Descartado'];
  const conditions = ['Excelente', 'Bom', 'Regular', 'Ruim'];

  useEffect(() => { if (user) loadData(); }, [user]);

  // =================== FUNÇÕES AUXILIARES ===================
  const getWarrantyStatus = (warrantyEnd) => {
    if (!warrantyEnd) return { status: 'Não informado', color: 'text-gray-600' };
    const endDate = new Date(warrantyEnd);
    const today = new Date();
    const daysDiff = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    if (daysDiff < 0) return { status: 'Vencida', color: 'text-red-600' };
    if (daysDiff <= 30) return { status: `Vence em ${daysDiff} dia(s)`, color: 'text-orange-600' };
    if (daysDiff <= 90) return { status: `Vence em ${Math.ceil(daysDiff / 30)} mês(es)`, color: 'text-yellow-600' };
    return { status: `Vence em ${endDate.toLocaleDateString('pt-BR')}`, color: 'text-green-600' };
  };

  // =================== FUNÇÕES DE DADOS ===================
  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [assetsResult, statsResult, dellStatsResult] = await Promise.all([
        dataService.laptops.getAll(),
        dataService.getStatistics(),
        dataService.laptops.getDellSupportStats()
      ]);

      if (assetsResult.success) setAssets(assetsResult.data);

      if (statsResult.success) {
        const d = statsResult.data;
        setStatistics({
          total_assets: parseInt(d.total_assets || d.total_laptops) || 0,
          available_assets: parseInt(d.available_assets || d.available_laptops) || 0,
          in_use_assets: parseInt(d.in_use_assets || d.in_use_laptops) || 0,
          maintenance_assets: parseInt(d.maintenance_assets || d.maintenance_laptops) || 0,
          discarded_assets: parseInt(d.discarded_assets || d.discarded_laptops) || 0,
          total_value: parseFloat(d.total_value) || 0,
          avg_condition: parseFloat(d.avg_condition) || 0,
          notebooks: parseInt(d.notebooks) || 0,
          desktops: parseInt(d.desktops) || 0,
          monitors: parseInt(d.monitors) || 0,
          impressoras: parseInt(d.impressoras) || 0,
          outros: parseInt(d.outros) || 0
        });
      }

      if (dellStatsResult.success) {
        setDellSupportStats({
          total_tickets: parseInt(dellStatsResult.data.total_tickets) || 0,
          open_tickets: parseInt(dellStatsResult.data.open_tickets) || 0,
          in_progress_tickets: parseInt(dellStatsResult.data.in_progress_tickets) || 0,
          high_priority_tickets: parseInt(dellStatsResult.data.high_priority_tickets) || 0,
          overdue_tickets: parseInt(dellStatsResult.data.overdue_tickets) || 0
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // =================== FUNÇÕES DE FOTO E IA ===================
  const openPhotoOptions = () => setPhotoState(p => ({ ...p, showOptions: true, error: '' }));

  const closeAllPhotoModals = () => setPhotoState({
    showOptions: false, showPreview: false, capturedPhoto: null,
    isProcessing: false, isAnalyzing: false, error: ''
  });

  const processImageFile = async (file) => {
    if (!file) return;
    setPhotoState(p => ({ ...p, isProcessing: true, error: '' }));
    try {
      if (!file.type.startsWith('image/')) throw new Error('Selecione apenas arquivos de imagem.');
      const imageDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Erro ao ler arquivo.'));
        reader.readAsDataURL(file);
      });
      const resized = await resizeImage(imageDataUrl, 1024, 768);
      setPhotoState(p => ({ ...p, capturedPhoto: resized, showPreview: true, showOptions: false, isProcessing: false }));
    } catch (error) {
      setPhotoState(p => ({ ...p, error: error.message, isProcessing: false }));
    }
  };

  const resizeImage = (dataUrl, maxW, maxH) => new Promise(resolve => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > height) { if (width > maxW) { height = (height * maxW) / width; width = maxW; } }
      else { if (height > maxH) { width = (width * maxH) / height; height = maxH; } }
      canvas.width = width; canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = dataUrl;
  });

  const handleSelectPhoto = () => {
    setPhotoState(p => ({ ...p, showOptions: false, error: '' }));
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', (e) => { if (e.target.files[0]) processImageFile(e.target.files[0]); });
    input.click();
  };

  const handleTakePhoto = () => {
    setPhotoState(p => ({ ...p, showOptions: false, error: '' }));
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.addEventListener('change', (e) => { if (e.target.files[0]) processImageFile(e.target.files[0]); });
    input.click();
  };

  const confirmPhotoWithAI = async () => {
    if (!photoState.capturedPhoto) return;
    setPhotoState(p => ({ ...p, isAnalyzing: true }));
    try {
      const result = await AIAnalysisService.analyzeLaptopDamage(photoState.capturedPhoto);
      if (result.success) {
        setAssetForm(p => ({
          ...p, photo: photoState.capturedPhoto,
          damage_analysis: result.data,
          condition: result.data.overall_condition,
          condition_score: Math.max(0, 100 - result.data.damage_score)
        }));
      } else {
        setAssetForm(p => ({ ...p, photo: photoState.capturedPhoto }));
      }
      closeAllPhotoModals();
    } catch (error) {
      setAssetForm(p => ({ ...p, photo: photoState.capturedPhoto }));
      setTimeout(closeAllPhotoModals, 1500);
    }
  };

  // =================== FUNÇÕES DE ATIVOS ===================
  const handleSaveAsset = async () => {
    if (!assetForm.model?.trim() || !assetForm.service_tag?.trim()) {
      alert('Por favor, preencha o modelo e service tag.');
      return;
    }
    try {
      setIsLoading(true);
      if (!editingAsset) {
        const tagCheck = await dataService.laptops.checkServiceTagExists(assetForm.service_tag);
        if (tagCheck.success && tagCheck.exists) {
          alert('Já existe um ativo com este service tag.');
          return;
        }
      }
      const assetData = {
        ...assetForm,
        service_tag: assetForm.service_tag.trim(),
        model: assetForm.model.trim(),
        purchase_price: assetForm.purchase_price ? parseFloat(assetForm.purchase_price) : null
      };
      let result;
      if (editingAsset) {
        result = await dataService.laptops.update(editingAsset.id, assetData, user.id);
      } else {
        result = await dataService.laptops.create(assetData, user.id);
      }
      if (result.success) {
        await loadData();
        resetForm();
        setShowAssetForm(false);
        setEditingAsset(null);
        alert(`Ativo ${editingAsset ? 'atualizado' : 'cadastrado'} com sucesso!`);
      } else {
        alert(`Erro: ${result.error}`);
      }
    } catch (error) {
      alert(`Erro: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setAssetForm({
      asset_type: asset.asset_type || 'Notebook',
      model: asset.model || '',
      service_tag: asset.service_tag || '',
      hostname: asset.hostname || '',
      patrimony_number: asset.patrimony_number || '',
      location: asset.location || '',
      project: asset.project || '',
      department: asset.department || '',
      assigned_user: asset.assigned_user || '',
      responsible: asset.responsible || '',
      purchase_company: asset.purchase_company || '',
      term_signed: asset.term_signed || '',
      mac_address: asset.mac_address || '',
      teamviewer_id: asset.teamviewer_id || '',
      processor: asset.processor || '',
      ram: asset.ram || '',
      storage: asset.storage || '',
      graphics: asset.graphics || '',
      screen_size: asset.screen_size || '',
      color: asset.color || '',
      operating_system: asset.operating_system || '',
      software_list: asset.software_list || '',
      purchase_date: asset.purchase_date ? asset.purchase_date.toString().split('T')[0] : '',
      delivery_date: asset.delivery_date ? asset.delivery_date.toString().split('T')[0] : '',
      purchase_price: asset.purchase_price || '',
      purchase_invoice: asset.purchase_invoice || '',
      warranty_end: asset.warranty_end ? asset.warranty_end.toString().split('T')[0] : '',
      condition: asset.condition || 'Bom',
      condition_score: asset.condition_score || 70,
      status: asset.status || 'Em Uso',
      photo: asset.photo || null,
      damage_analysis: asset.damage_analysis || null,
      notes: asset.notes || ''
    });
    setShowAssetForm(true);
  };

  const handleDeleteAsset = async (assetId) => {
    if (!confirm('Tem certeza que deseja excluir este ativo?')) return;
    try {
      setIsLoading(true);
      const result = await dataService.laptops.delete(assetId, user.id);
      if (result.success) {
        await loadData();
        alert('Ativo excluído com sucesso!');
      } else {
        alert(`Erro: ${result.error}`);
      }
    } catch (error) {
      alert(`Erro: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAssetForm(emptyForm);
    closeAllPhotoModals();
  };

  const filteredAssets = assets.filter(asset => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      (asset.model || '').toLowerCase().includes(term) ||
      (asset.service_tag || '').toLowerCase().includes(term) ||
      (asset.assigned_user || '').toLowerCase().includes(term) ||
      (asset.location || '').toLowerCase().includes(term) ||
      (asset.project || '').toLowerCase().includes(term) ||
      (asset.hostname || '').toLowerCase().includes(term);
    const matchesType = !assetTypeFilter || asset.asset_type === assetTypeFilter;
    const matchesLocation = !locationFilter || asset.location === locationFilter;
    return matchesSearch && matchesType && matchesLocation;
  });

  const uniqueLocations = [...new Set(assets.map(a => a.location).filter(Boolean))].sort();

  // =================== BADGES ===================
  const StatusBadge = ({ status }) => {
    const configs = {
      'Disponível': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Em Uso': 'bg-blue-50 text-blue-700 border-blue-200',
      'Manutenção': 'bg-orange-50 text-orange-700 border-orange-200',
      'Descartado': 'bg-red-50 text-red-600 border-red-200'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${configs[status] || configs['Em Uso']}`}>
        {status}
      </span>
    );
  };

  const ConditionBadge = ({ condition, score }) => {
    const configs = {
      'Excelente': 'bg-green-50 text-green-700 border-green-200',
      'Bom': 'bg-blue-50 text-blue-700 border-blue-200',
      'Regular': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Ruim': 'bg-red-50 text-red-700 border-red-200'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${configs[condition] || configs['Bom']}`}>
        {condition}{score ? ` (${score}%)` : ''}
      </span>
    );
  };

  const ConnectionStatusIndicator = () => {
    const isConnected = isDatabaseAvailable();
    return (
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl border ${isConnected ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
        {isConnected ? <Icons.Database /> : <Icons.WifiOff />}
        <span className={`text-xs font-medium ${isConnected ? 'text-green-700' : 'text-gray-600'}`}>
          {isConnected ? 'Neon' : 'Offline'}
        </span>
      </div>
    );
  };

  const handleLogout = async () => {
    if (confirm('Tem certeza que deseja sair?')) {
      const result = await logout();
      if (result.success) {
        setAssets([]);
        setStatistics({});
        setDellSupportStats({});
        setActiveTab('dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Icons.Package />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent">
                  Controle de Inventário de TI
                </h1>
                <p className="text-xs md:text-sm text-gray-500 font-medium">Sistema Corporativo - RTT</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent">
                  Inv. TI
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden lg:flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-xl border border-blue-100">
                  <Icons.Package />
                  <span className="font-semibold text-blue-700">{statistics.total_assets || 0}</span>
                  <span className="text-blue-600">ativos</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-xl border border-green-100">
                  <Icons.CheckCircle />
                  <span className="font-semibold text-green-700">{statistics.available_assets || 0}</span>
                  <span className="text-green-600">disponíveis</span>
                </div>
                <ConnectionStatusIndicator />
              </div>

              <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Icons.User />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800">{user?.name || 'Usuário'}</p>
                  <p className="text-xs text-gray-500">{user?.company || 'Empresa'}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-all border border-transparent hover:border-red-200"
                title="Sair"
              >
                <Icons.LogOut />
                <span className="hidden md:inline font-medium">Sair</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mt-6 overflow-x-auto pb-2">
            {[
              { id: 'dashboard', label: 'Dashboard', shortLabel: 'Home', icon: Icons.Home, gradient: 'from-blue-500 to-indigo-500' },
              { id: 'assets', label: 'Ativos de TI', shortLabel: 'Ativos', icon: Icons.Package, gradient: 'from-purple-500 to-pink-500' },
              { id: 'reports', label: 'Relatórios', shortLabel: 'Report', icon: Icons.BarChart3, gradient: 'from-orange-500 to-red-500' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 md:px-6 py-3 rounded-2xl font-semibold transition-all whitespace-nowrap border ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-105 border-white/20`
                    : 'text-gray-600 hover:bg-white/70 hover:text-gray-800 border-gray-200 bg-white/40'
                }`}
              >
                <tab.icon />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">

        {/* =================== DASHBOARD =================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent">
                  Dashboard
                </h2>
                <p className="text-gray-600 mt-2">Visão geral do inventário de TI</p>
              </div>
              <div className="text-right bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
                <p className="text-sm text-gray-600">Inventário de TI</p>
                <p className="font-bold text-lg text-gray-900">RTT Soluções</p>
                <div className="mt-2">
                  <ConnectionStatusIndicator />
                </div>
              </div>
            </div>

            {/* Cards de totais */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-8 rounded-3xl shadow-lg border border-blue-100 hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-2">Total Ativos</p>
                    <p className="text-3xl md:text-4xl font-bold text-blue-700">{statistics.total_assets || 0}</p>
                    <p className="text-xs text-blue-500 mt-1">equipamentos</p>
                  </div>
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icons.Package />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 md:p-8 rounded-3xl shadow-lg border border-emerald-100 hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-600 mb-2">Disponíveis</p>
                    <p className="text-3xl md:text-4xl font-bold text-emerald-700">{statistics.available_assets || 0}</p>
                    <p className="text-xs text-emerald-500 mt-1">prontos para uso</p>
                  </div>
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icons.CheckCircle />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 md:p-8 rounded-3xl shadow-lg border border-orange-100 hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 mb-2">Em Manutenção</p>
                    <p className="text-3xl md:text-4xl font-bold text-orange-700">{statistics.maintenance_assets || 0}</p>
                    <p className="text-xs text-orange-500 mt-1">em reparo</p>
                  </div>
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icons.Clock />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 md:p-8 rounded-3xl shadow-lg border border-purple-100 hover:shadow-xl transition-all group col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 mb-2">Condição Média</p>
                    <p className="text-2xl md:text-3xl font-bold text-purple-700">
                      {parseFloat(statistics.avg_condition || 0).toFixed(0)}%
                    </p>
                    <p className="text-xs text-purple-500 mt-1">estado geral</p>
                  </div>
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icons.Shield />
                  </div>
                </div>
              </div>
            </div>

            {/* Por tipo de ativo */}
            <div className="bg-white/70 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-lg border border-white/40">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Ativos por Tipo</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Notebooks', value: statistics.notebooks || 0, type: 'Notebook', icon: Icons.Laptop, color: 'blue' },
                  { label: 'Desktops', value: statistics.desktops || 0, type: 'Desktop', icon: Icons.Desktop, color: 'purple' },
                  { label: 'Monitores', value: statistics.monitors || 0, type: 'Monitor', icon: Icons.Monitor, color: 'cyan' },
                  { label: 'Impressoras', value: statistics.impressoras || 0, type: 'Impressora', icon: Icons.Printer, color: 'orange' },
                  { label: 'Outros', value: statistics.outros || 0, type: 'Outro', icon: Icons.Package, color: 'gray' }
                ].map(item => (
                  <button
                    key={item.type}
                    onClick={() => { setActiveTab('assets'); setAssetTypeFilter(item.type); }}
                    className={`flex flex-col items-center p-4 bg-${item.color}-50 border border-${item.color}-200 rounded-2xl hover:shadow-md transition-all group`}
                  >
                    <div className={`w-10 h-10 bg-${item.color}-100 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                      <item.icon />
                    </div>
                    <span className={`text-2xl font-bold text-${item.color}-700`}>{item.value}</span>
                    <span className={`text-xs text-${item.color}-600 mt-1`}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ações rápidas */}
            <div className="bg-white/70 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-lg border border-white/40">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Icons.Zap />
                <span>Ações Rápidas</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => { setActiveTab('assets'); resetForm(); setShowAssetForm(true); }}
                  className="flex items-center space-x-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-2xl transition-all group border border-blue-200 hover:shadow-lg"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icons.Plus />
                  </div>
                  <div className="text-left">
                    <p className="text-blue-600 font-bold text-lg">Adicionar Ativo</p>
                    <p className="text-blue-500 text-sm">Cadastrar novo equipamento</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className="flex items-center space-x-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-2xl transition-all group border border-green-200 hover:shadow-lg"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icons.BarChart3 />
                  </div>
                  <div className="text-left">
                    <p className="text-green-600 font-bold text-lg">Ver Relatórios</p>
                    <p className="text-green-500 text-sm">Análises e estatísticas</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================== ATIVOS DE TI =================== */}
        {activeTab === 'assets' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-900 via-pink-800 to-indigo-900 bg-clip-text text-transparent">
                  Ativos de TI
                </h2>
                <p className="text-gray-600 mt-2">Gerenciar equipamentos e dispositivos</p>
              </div>
              <button
                onClick={() => { resetForm(); setShowAssetForm(true); }}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Icons.Plus />
                <span>Novo Ativo</span>
              </button>
            </div>

            {/* Filtros */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/40 space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Icons.Search />
                </div>
                <input
                  type="text"
                  placeholder="Pesquisar por modelo, tag, usuário, projeto, local..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center space-x-2">
                  <Icons.Filter />
                  <span className="text-sm font-medium text-gray-600">Filtrar:</span>
                </div>
                <select
                  value={assetTypeFilter}
                  onChange={(e) => setAssetTypeFilter(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="">Todos os tipos</option>
                  {ASSET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="">Todos os locais</option>
                  {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
                {(assetTypeFilter || locationFilter || searchTerm) && (
                  <button
                    onClick={() => { setAssetTypeFilter(''); setLocationFilter(''); setSearchTerm(''); }}
                    className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm hover:bg-red-100 transition-all"
                  >
                    Limpar filtros
                  </button>
                )}
                <span className="ml-auto px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-sm font-medium">
                  {filteredAssets.length} ativo(s)
                </span>
              </div>
            </div>

            {/* Lista de ativos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAssets.map((asset) => {
                const typeConfig = getAssetTypeConfig(asset.asset_type);
                const IconComponent = typeConfig.icon;
                return (
                  <div key={asset.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/40 hover:shadow-lg transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 bg-gradient-to-br ${typeConfig.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <IconComponent />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">{asset.model}</h3>
                          <p className="text-xs text-gray-500">{asset.service_tag}</p>
                          <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{asset.asset_type || 'Notebook'}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button onClick={() => setShowAssetDetail(asset)} className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all" title="Ver detalhes">
                          <Icons.Eye />
                        </button>
                        <button onClick={() => handleEditAsset(asset)} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Editar">
                          <Icons.Edit />
                        </button>
                        <button onClick={() => handleDeleteAsset(asset.id)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Excluir">
                          <Icons.Trash2 />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Status:</span>
                        <StatusBadge status={asset.status} />
                      </div>
                      {asset.location && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Local:</span>
                          <span className="text-xs font-medium text-gray-700 flex items-center space-x-1">
                            <Icons.MapPin />
                            <span>{asset.location}</span>
                          </span>
                        </div>
                      )}
                      {asset.project && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Projeto:</span>
                          <span className="text-xs font-medium text-indigo-700 flex items-center space-x-1">
                            <Icons.Briefcase />
                            <span>{asset.project}</span>
                          </span>
                        </div>
                      )}
                      {asset.assigned_user && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Usuário:</span>
                          <span className="text-xs font-medium text-gray-700">{asset.assigned_user}</span>
                        </div>
                      )}
                      {asset.operating_system && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">SO:</span>
                          <span className="text-xs font-medium text-gray-600">{asset.operating_system}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredAssets.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Icons.Package />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum ativo encontrado</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || assetTypeFilter || locationFilter ? 'Tente ajustar os filtros' : 'Adicione o primeiro ativo de TI'}
                </p>
                <button
                  onClick={() => { resetForm(); setShowAssetForm(true); }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                >
                  Adicionar Primeiro Ativo
                </button>
              </div>
            )}
          </div>
        )}

        {/* =================== RELATÓRIOS =================== */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-900 via-red-800 to-pink-900 bg-clip-text text-transparent">
                Relatórios
              </h2>
              <p className="text-gray-600 mt-2">Análises e estatísticas do inventário</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Por tipo */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Icons.Package />
                  </div>
                  <h3 className="font-bold text-gray-900">Por Tipo de Ativo</h3>
                </div>
                <div className="space-y-3">
                  {ASSET_TYPES.map(type => {
                    const count = assets.filter(a => a.asset_type === type.value).length;
                    return count > 0 ? (
                      <div key={type.value} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{type.label}:</span>
                        <span className="font-bold text-gray-900">{count}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Por status */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Icons.CheckCircle />
                  </div>
                  <h3 className="font-bold text-gray-900">Por Status</h3>
                </div>
                <div className="space-y-3">
                  {statuses.map(status => {
                    const count = assets.filter(a => a.status === status).length;
                    return (
                      <div key={status} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{status}:</span>
                        <span className="font-bold text-gray-900">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Garantias */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Icons.Calendar />
                  </div>
                  <h3 className="font-bold text-gray-900">Garantias</h3>
                </div>
                <div className="space-y-3">
                  {(() => {
                    let vencidas = 0, vencendo = 0, ativas = 0, naoInformado = 0;
                    assets.forEach(a => {
                      const ws = getWarrantyStatus(a.warranty_end);
                      if (ws.status === 'Não informado') naoInformado++;
                      else if (ws.status === 'Vencida') vencidas++;
                      else if (ws.status.includes('dia') || ws.status.includes('mês')) vencendo++;
                      else ativas++;
                    });
                    return (
                      <>
                        <div className="flex justify-between"><span className="text-sm text-gray-600">Vencidas:</span><span className="font-bold text-red-600">{vencidas}</span></div>
                        <div className="flex justify-between"><span className="text-sm text-gray-600">Vencendo em breve:</span><span className="font-bold text-orange-600">{vencendo}</span></div>
                        <div className="flex justify-between"><span className="text-sm text-gray-600">Ativas:</span><span className="font-bold text-green-600">{ativas}</span></div>
                        <div className="flex justify-between"><span className="text-sm text-gray-600">Não informado:</span><span className="font-bold text-gray-600">{naoInformado}</span></div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Por projeto */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/40 md:col-span-2 lg:col-span-1">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Icons.Briefcase />
                  </div>
                  <h3 className="font-bold text-gray-900">Por Projeto/Cliente</h3>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(() => {
                    const projectCounts = {};
                    assets.forEach(a => {
                      const proj = a.project || 'Não informado';
                      projectCounts[proj] = (projectCounts[proj] || 0) + 1;
                    });
                    return Object.entries(projectCounts)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 15)
                      .map(([proj, count]) => (
                        <div key={proj} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 truncate mr-2">{proj}:</span>
                          <span className="font-bold text-gray-900 flex-shrink-0">{count}</span>
                        </div>
                      ));
                  })()}
                </div>
              </div>

              {/* Por local */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/40 md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                    <Icons.MapPin />
                  </div>
                  <h3 className="font-bold text-gray-900">Por Localização</h3>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(() => {
                    const locCounts = {};
                    assets.forEach(a => {
                      const loc = a.location || 'Não informado';
                      locCounts[loc] = (locCounts[loc] || 0) + 1;
                    });
                    return Object.entries(locCounts)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 20)
                      .map(([loc, count]) => (
                        <div key={loc} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 truncate mr-2">{loc}:</span>
                          <span className="font-bold text-gray-900 flex-shrink-0">{count}</span>
                        </div>
                      ));
                  })()}
                </div>
              </div>
            </div>

            {/* Tabela completa */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
              <h3 className="font-bold text-gray-900 mb-4">Inventário Completo</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-600">Tipo</th>
                      <th className="text-left py-2 text-gray-600">Modelo</th>
                      <th className="text-left py-2 text-gray-600">Service Tag</th>
                      <th className="text-left py-2 text-gray-600">Local/Projeto</th>
                      <th className="text-center py-2 text-gray-600">Status</th>
                      <th className="text-left py-2 text-gray-600">Usuário</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.slice(0, 100).map((asset) => (
                      <tr key={asset.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2">
                          <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                            {asset.asset_type || 'Notebook'}
                          </span>
                        </td>
                        <td className="py-2 font-medium text-gray-900">{asset.model}</td>
                        <td className="py-2 text-gray-700 font-mono text-xs">{asset.service_tag}</td>
                        <td className="py-2 text-gray-600 text-xs">
                          {asset.location && <span className="block">{asset.location}</span>}
                          {asset.project && <span className="block text-indigo-600">{asset.project}</span>}
                        </td>
                        <td className="py-2 text-center">
                          <StatusBadge status={asset.status} />
                        </td>
                        <td className="py-2 text-gray-700 text-xs">{asset.assigned_user || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {assets.length > 100 && (
                  <p className="text-center text-sm text-gray-500 mt-4">
                    Mostrando 100 de {assets.length} ativos. Use os filtros para refinar.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =================== MODAL FORMULÁRIO =================== */}
      {showAssetForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingAsset ? 'Editar Ativo' : 'Novo Ativo de TI'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {editingAsset ? 'Atualizar informações' : 'Cadastrar novo equipamento'}
                </p>
              </div>
              <button
                onClick={() => { setShowAssetForm(false); setEditingAsset(null); resetForm(); }}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
              >
                <Icons.X />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveAsset(); }} className="space-y-6">

              {/* Tipo de Ativo */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Tipo de Ativo *</label>
                <div className="grid grid-cols-4 gap-2">
                  {ASSET_TYPES.map(type => {
                    const IconComp = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setAssetForm(p => ({ ...p, asset_type: type.value }))}
                        className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${
                          assetForm.asset_type === type.value
                            ? `bg-gradient-to-br ${type.color} text-white border-transparent shadow-md`
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <IconComp />
                        <span className="text-xs font-medium mt-1">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Identificação */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Identificação</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Modelo *</label>
                    <input type="text" value={assetForm.model} onChange={(e) => setAssetForm(p => ({ ...p, model: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Ex: Dell Latitude 5330, OptiPlex 3080..." required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Service Tag *</label>
                    <input type="text" value={assetForm.service_tag} onChange={(e) => setAssetForm(p => ({ ...p, service_tag: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Ex: 9HYXFV2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Hostname</label>
                    <input type="text" value={assetForm.hostname} onChange={(e) => setAssetForm(p => ({ ...p, hostname: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Ex: RTT-LAPTOP01" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nº Patrimônio</label>
                    <input type="text" value={assetForm.patrimony_number} onChange={(e) => setAssetForm(p => ({ ...p, patrimony_number: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Ex: 6953" />
                  </div>
                </div>
              </div>

              {/* Localização / Projeto */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Localização e Projeto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Local / Unidade</label>
                    <input type="text" value={assetForm.location} onChange={(e) => setAssetForm(p => ({ ...p, location: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Ex: Matriz, São Luis, Pernambuco" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Projeto / Cliente</label>
                    <input type="text" value={assetForm.project} onChange={(e) => setAssetForm(p => ({ ...p, project: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Ex: ALUMAR, Interno, ULTRACARGO" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Departamento</label>
                    <input type="text" value={assetForm.department} onChange={(e) => setAssetForm(p => ({ ...p, department: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Ex: TI, ADM, Almoxarifado" />
                  </div>
                </div>
              </div>

              {/* Usuários */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Usuários</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Usuário</label>
                    <input type="text" value={assetForm.assigned_user} onChange={(e) => setAssetForm(p => ({ ...p, assigned_user: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Nome do usuário" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Responsável</label>
                    <input type="text" value={assetForm.responsible} onChange={(e) => setAssetForm(p => ({ ...p, responsible: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Responsável pela entrega" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Empresa de Compra</label>
                    <input type="text" value={assetForm.purchase_company} onChange={(e) => setAssetForm(p => ({ ...p, purchase_company: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Ex: RTT Soluções Industriais" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Termo de Uso Assinado?</label>
                    <select value={assetForm.term_signed} onChange={(e) => setAssetForm(p => ({ ...p, term_signed: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all">
                      <option value="">Não informado</option>
                      <option value="SIM">SIM</option>
                      <option value="NÃO">NÃO</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Rede */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Rede e Acesso Remoto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">MAC Address</label>
                    <input type="text" value={assetForm.mac_address} onChange={(e) => setAssetForm(p => ({ ...p, mac_address: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono"
                      placeholder="Ex: 48-5F-99-DE-8E-1F" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">ID TeamViewer</label>
                    <input type="text" value={assetForm.teamviewer_id} onChange={(e) => setAssetForm(p => ({ ...p, teamviewer_id: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono"
                      placeholder="Ex: 1 458 565 802" />
                  </div>
                </div>
              </div>

              {/* Hardware */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Hardware e Software</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Processador</label>
                    <input type="text" value={assetForm.processor} onChange={(e) => setAssetForm(p => ({ ...p, processor: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Ex: Intel Core i5" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Memória RAM</label>
                    <input type="text" value={assetForm.ram} onChange={(e) => setAssetForm(p => ({ ...p, ram: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Ex: 8GB, 16GB DDR4" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Armazenamento</label>
                    <input type="text" value={assetForm.storage} onChange={(e) => setAssetForm(p => ({ ...p, storage: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Ex: SSD 256GB" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Sistema Operacional</label>
                    <input type="text" value={assetForm.operating_system} onChange={(e) => setAssetForm(p => ({ ...p, operating_system: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Ex: Windows 11 Pro" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Placa de Vídeo</label>
                    <input type="text" value={assetForm.graphics} onChange={(e) => setAssetForm(p => ({ ...p, graphics: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Ex: Intel Iris Xe" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Softwares Instalados</label>
                    <input type="text" value={assetForm.software_list} onChange={(e) => setAssetForm(p => ({ ...p, software_list: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Ex: Office 365, Autocad..." />
                  </div>
                </div>
              </div>

              {/* Compra e Status */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Compra e Estado</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Data de Compra</label>
                    <input type="date" value={assetForm.purchase_date} onChange={(e) => setAssetForm(p => ({ ...p, purchase_date: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Data de Entrega</label>
                    <input type="date" value={assetForm.delivery_date} onChange={(e) => setAssetForm(p => ({ ...p, delivery_date: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">NF de Compra</label>
                    <input type="text" value={assetForm.purchase_invoice} onChange={(e) => setAssetForm(p => ({ ...p, purchase_invoice: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Número da NF" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Preço de Compra (R$)</label>
                    <input type="number" step="0.01" value={assetForm.purchase_price} onChange={(e) => setAssetForm(p => ({ ...p, purchase_price: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="0,00" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Fim da Garantia</label>
                    <input type="date" value={assetForm.warranty_end} onChange={(e) => setAssetForm(p => ({ ...p, warranty_end: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                    <select value={assetForm.status} onChange={(e) => setAssetForm(p => ({ ...p, status: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all">
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Condição</label>
                    <select value={assetForm.condition} onChange={(e) => setAssetForm(p => ({ ...p, condition: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all">
                      {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Observações</label>
                <textarea value={assetForm.notes} onChange={(e) => setAssetForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  rows="3" placeholder="Observações adicionais..."></textarea>
              </div>

              {/* Foto */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Foto do Ativo</label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6">
                  {assetForm.photo ? (
                    <div className="relative">
                      <img src={assetForm.photo} alt="Foto" className="w-full h-48 object-cover rounded-xl" />
                      <button type="button" onClick={() => setAssetForm(p => ({ ...p, photo: null, damage_analysis: null }))}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all">
                        <Icons.X />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-12 h-12 text-gray-400 mx-auto mb-4"><Icons.Camera /></div>
                      <button type="button" onClick={openPhotoOptions}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all">
                        Adicionar Foto
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => { setShowAssetForm(false); setEditingAsset(null); resetForm(); }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50">
                  {isLoading ? 'Salvando...' : editingAsset ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================== MODAL FOTO - OPÇÕES =================== */}
      {photoState.showOptions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Adicionar Foto</h2>
              <button onClick={closeAllPhotoModals} className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl"><Icons.X /></button>
            </div>
            <div className="space-y-4">
              <button onClick={handleTakePhoto} className="w-full flex items-center justify-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl hover:bg-blue-100 transition-all">
                <Icons.Camera />
                <span className="font-medium text-blue-800">Tirar Foto</span>
              </button>
              <button onClick={handleSelectPhoto} className="w-full flex items-center justify-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-2xl hover:bg-green-100 transition-all">
                <Icons.Upload />
                <span className="font-medium text-green-800">Selecionar da Galeria</span>
              </button>
            </div>
            {photoState.error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-red-700 text-sm">{photoState.error}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================== MODAL FOTO - PREVIEW =================== */}
      {photoState.showPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Confirmar Foto</h2>
              <button onClick={closeAllPhotoModals} className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl"><Icons.X /></button>
            </div>
            {photoState.capturedPhoto && (
              <div className="space-y-6">
                <div className="relative">
                  <img src={photoState.capturedPhoto} alt="Preview" className="w-full h-64 object-cover rounded-xl" />
                  {photoState.isAnalyzing && (
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm font-medium">Analisando com IA...</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-center space-x-4">
                  <button onClick={() => setPhotoState(p => ({ ...p, showPreview: false, showOptions: true, capturedPhoto: null }))}
                    disabled={photoState.isAnalyzing}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all disabled:opacity-50">
                    Tirar Novamente
                  </button>
                  <button onClick={confirmPhotoWithAI} disabled={photoState.isAnalyzing}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50">
                    {photoState.isAnalyzing ? 'Analisando...' : 'Confirmar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================== MODAL DETALHES =================== */}
      {showAssetDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Detalhes do Ativo</h2>
                <p className="text-sm text-gray-500 mt-1">{showAssetDetail.asset_type || 'Notebook'}</p>
              </div>
              <button onClick={() => setShowAssetDetail(null)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl"><Icons.X /></button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Identificação</h3>
                  <div className="space-y-2 bg-gray-50 rounded-2xl p-4">
                    {[
                      ['Tipo', showAssetDetail.asset_type],
                      ['Modelo', showAssetDetail.model],
                      ['Service Tag', showAssetDetail.service_tag],
                      ['Hostname', showAssetDetail.hostname],
                      ['Patrimônio', showAssetDetail.patrimony_number]
                    ].filter(([, v]) => v).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-gray-500 text-sm">{k}:</span>
                        <span className="font-medium text-sm text-right">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Localização e Projeto</h3>
                  <div className="space-y-2 bg-gray-50 rounded-2xl p-4">
                    {[
                      ['Local', showAssetDetail.location],
                      ['Projeto/Cliente', showAssetDetail.project],
                      ['Departamento', showAssetDetail.department],
                      ['Usuário', showAssetDetail.assigned_user],
                      ['Responsável', showAssetDetail.responsible],
                      ['Empresa de Compra', showAssetDetail.purchase_company]
                    ].filter(([, v]) => v).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-gray-500 text-sm">{k}:</span>
                        <span className="font-medium text-sm text-right">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Estado</h3>
                  <div className="space-y-2 bg-gray-50 rounded-2xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Status:</span>
                      <StatusBadge status={showAssetDetail.status} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Condição:</span>
                      <ConditionBadge condition={showAssetDetail.condition} score={showAssetDetail.condition_score} />
                    </div>
                    {showAssetDetail.warranty_end && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">Garantia:</span>
                        <span className={`font-medium text-sm ${getWarrantyStatus(showAssetDetail.warranty_end).color}`}>
                          {getWarrantyStatus(showAssetDetail.warranty_end).status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {(showAssetDetail.processor || showAssetDetail.ram || showAssetDetail.storage || showAssetDetail.operating_system) && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Hardware</h3>
                    <div className="space-y-2 bg-gray-50 rounded-2xl p-4">
                      {[
                        ['Processador', showAssetDetail.processor],
                        ['RAM', showAssetDetail.ram],
                        ['Armazenamento', showAssetDetail.storage],
                        ['GPU', showAssetDetail.graphics],
                        ['SO', showAssetDetail.operating_system],
                        ['MAC Address', showAssetDetail.mac_address],
                        ['TeamViewer ID', showAssetDetail.teamviewer_id]
                      ].filter(([, v]) => v).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-gray-500 text-sm">{k}:</span>
                          <span className="font-medium text-sm font-mono text-right">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showAssetDetail.photo && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Foto</h3>
                    <img src={showAssetDetail.photo} alt="Foto" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
                  </div>
                )}

                {showAssetDetail.notes && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Observações</h3>
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-gray-700 text-sm">{showAssetDetail.notes}</p>
                    </div>
                  </div>
                )}

                {showAssetDetail.software_list && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Softwares</h3>
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-gray-700 text-sm">{showAssetDetail.software_list}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button onClick={() => setShowAssetDetail(null)} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all">
                Fechar
              </button>
              <button onClick={() => { handleEditAsset(showAssetDetail); setShowAssetDetail(null); }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all">
                Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 flex items-center space-x-4">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-gray-700 font-medium">Carregando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// =================== ERROR BOUNDARY ===================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'monospace', background: '#fff1f0', minHeight: '100vh' }}>
          <h2 style={{ color: '#c0392b' }}>Erro ao carregar o sistema</h2>
          <pre style={{ background: '#fff', padding: '20px', borderRadius: '8px', overflow: 'auto', fontSize: '13px', border: '1px solid #fca5a5' }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// =================== COMPONENTE PRINCIPAL COM PROVIDER ===================
const App = () => (
  <ErrorBoundary>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </ErrorBoundary>
);

const AppContent = () => {
  const { user, loading, isInitialized, connectionStatus, login } = useAuth();

  if (loading && !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/40">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-8"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Inicializando Inventário de TI</h2>
          <p className="text-gray-600 mb-6">Preparando aplicação...</p>
          {connectionStatus && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200 mb-6">
              <div className="flex items-center justify-center space-x-3">
                {connectionStatus.hasUrl ? <Icons.Database /> : <Icons.WifiOff />}
                <span className="text-sm font-medium text-blue-700">
                  {connectionStatus.hasUrl ? 'Conectando ao Neon...' : 'Modo Offline'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthComponent onLogin={login} />;
  }

  return <ITInventorySystem />;
};

export default App;
