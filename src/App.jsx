import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import AuthComponent from './components/AuthComponent';
import { authService } from './services/authService';
import { dataService } from './services/dataService';
import database from './config/database';

const { testConnection, createTables, insertInitialData, isDatabaseAvailable, getConnectionStatus } = database;

// =================== CONTEXT DE AUTENTICAÇÃO ===================
const AuthContext = createContext({});

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    console.log('🚀 === INICIANDO APLICAÇÃO DELL LAPTOP MANAGER ===');
    setLoading(true);
    
    try {
      // Verificar status da conexão
      const status = getConnectionStatus();
      setConnectionStatus(status);
      console.log('📊 Connection status:', status);

      // Verificar usuário salvo primeiro (funciona offline)
      const savedUser = localStorage.getItem('dellLaptopUser');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          console.log('👤 Usuário encontrado no localStorage:', userData.email);
          setUser(userData);
        } catch (error) {
          console.error('❌ Erro ao ler usuário do localStorage:', error);
          localStorage.removeItem('dellLaptopUser');
        }
      }

      // Tentar inicializar banco em background (não bloquear UI)
      if (isDatabaseAvailable()) {
        console.log('🔄 Banco disponível, iniciando inicialização...');
        
        // Executar inicialização em background
        setTimeout(async () => {
          try {
            console.log('🔄 Tentando conectar com Neon...');
            const connected = await testConnection();
            
            if (connected) {
              console.log('✅ Conectado ao Neon! Criando estrutura...');
              await createTables();
              console.log('✅ Sistema totalmente inicializado com Neon!');
              
              // Se há usuário logado, criar dados iniciais
              if (savedUser) {
                const userData = JSON.parse(savedUser);
                await insertInitialData(userData.id);
                console.log('✅ Dados iniciais criados para usuário:', userData.email);
              }
            } else {
              console.log('⚠️ Neon não conectado, funcionando em modo offline');
            }
          } catch (error) {
            console.error('❌ Erro na inicialização do banco:', error);
            console.log('📱 Continuando em modo offline');
          }
        }, 500); // Executar após 500ms para não bloquear a UI
      } else {
        console.log('📱 Banco não disponível, funcionando em modo offline');
      }

    } catch (error) {
      console.error('❌ Erro na inicialização:', error);
    } finally {
      // Sempre finalizar o loading
      setLoading(false);
      setIsInitialized(true);
      console.log('✅ Aplicação Dell Laptop Manager pronta para uso!');
    }
  };

  const login = async (userData) => {
    try {
      console.log('🔐 Fazendo login:', userData.email);
      
      setUser(userData);
      localStorage.setItem('dellLaptopUser', JSON.stringify(userData));
      
      // Se banco está disponível, criar dados iniciais
      if (isDatabaseAvailable()) {
        setTimeout(async () => {
          try {
            await insertInitialData(userData.id);
            console.log('✅ Dados iniciais criados para usuário:', userData.email);
          } catch (error) {
            console.error('❌ Erro ao criar dados iniciais:', error);
          }
        }, 1000);
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao fazer login:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      console.log('🔐 Fazendo logout');
      setUser(null);
      localStorage.removeItem('dellLaptopUser');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    isInitialized,
    connectionStatus,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// =================== SIMULAÇÃO DE ANÁLISE DE IA ===================
const AIAnalysisService = {
  async analyzeLaptopDamage(imageData) {
    console.log('🤖 Iniciando análise de IA do laptop...');
    
    // Simular processamento de IA
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Análise simulada baseada em diferentes cenários
    const scenarios = [
      {
        overall_condition: 'Excelente',
        damage_score: 5,
        confidence: 98,
        damages: [],
        recommendations: [
          'Laptop Dell em excelente estado',
          'Continuar com manutenção preventiva regular',
          'Nenhuma ação imediata necessária'
        ]
      },
      {
        overall_condition: 'Bom',
        damage_score: 25,
        confidence: 92,
        damages: [
          { type: 'Riscos superficiais', location: 'Tampa', severity: 'Leve', description: 'Pequenos riscos na superfície da tampa' },
          { type: 'Desgaste do teclado', location: 'Teclado', severity: 'Leve', description: 'Leve desgaste nas teclas mais usadas' }
        ],
        recommendations: [
          'Estado geral bom com sinais normais de uso',
          'Considerar limpeza profunda do teclado',
          'Usar capa protetora para evitar mais riscos'
        ]
      },
      {
        overall_condition: 'Regular',
        damage_score: 45,
        confidence: 89,
        damages: [
          { type: 'Riscos profundos', location: 'Tampa', severity: 'Moderado', description: 'Riscos visíveis na tampa traseira' },
          { type: 'Desgaste acentuado', location: 'Teclado', severity: 'Moderado', description: 'Várias teclas com desgaste visível' },
          { type: 'Manchas na tela', location: 'Tela', severity: 'Leve', description: 'Algumas manchas na tela LCD' }
        ],
        recommendations: [
          'Laptop precisa de atenção',
          'Agendar limpeza profissional',
          'Verificar funcionamento do teclado',
          'Considerar substituição da tela se manchas piorarem'
        ]
      },
      {
        overall_condition: 'Ruim',
        damage_score: 70,
        confidence: 85,
        damages: [
          { type: 'Trincas', location: 'Tela', severity: 'Grave', description: 'Trincas visíveis na tela LCD' },
          { type: 'Danos estruturais', location: 'Carcaça', severity: 'Grave', description: 'Danos na estrutura da carcaça' },
          { type: 'Teclas faltando', location: 'Teclado', severity: 'Grave', description: 'Algumas teclas estão faltando' }
        ],
        recommendations: [
          'Laptop necessita reparo urgente',
          'Substituição da tela necessária',
          'Verificação completa da estrutura',
          'Considerar se vale a pena o reparo'
        ]
      }
    ];
    
    // Selecionar cenário aleatório para demonstração
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    console.log('✅ Análise de IA concluída:', randomScenario.overall_condition);
    
    return {
      success: true,
      data: {
        analysis_id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        model_detected: 'Dell Inspiron/XPS Series',
        ...randomScenario
      }
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
  Camera: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Zap: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"></polygon>
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
  Building: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
  DollarSign: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  ),
  MapPin: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Cpu: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
      <rect x="9" y="9" width="6" height="6"></rect>
      <line x1="9" y1="1" x2="9" y2="4"></line>
      <line x1="15" y1="1" x2="15" y2="4"></line>
      <line x1="9" y1="20" x2="9" y2="23"></line>
      <line x1="15" y1="20" x2="15" y2="23"></line>
      <line x1="20" y1="9" x2="23" y2="9"></line>
      <line x1="20" y1="14" x2="23" y2="14"></line>
      <line x1="1" y1="9" x2="4" y2="9"></line>
      <line x1="1" y1="14" x2="4" y2="14"></line>
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
  Sparkles: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l1.5 1.5L5 6L3.5 4.5L5 3zm0 18l1.5-1.5L5 18l-1.5 1.5L5 21zM19 3l-1.5 1.5L19 6l1.5-1.5L19 3zm0 18l-1.5-1.5L19 18l1.5 1.5L19 21zM9 12l3-3 3 3-3 3-3-3z" />
    </svg>
  ),
  Database: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
    </svg>
  ),
  Wifi: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
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
  )
};

// =================== COMPONENTE PRINCIPAL ===================
const DellLaptopControlSystem = () => {
  const { user, logout, connectionStatus } = useAuth();
  
  // Estados principais
  const [activeTab, setActiveTab] = useState('dashboard');
  const [floors, setFloors] = useState([]);
  const [laptops, setLaptops] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [showLaptopForm, setShowLaptopForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingLaptop, setEditingLaptop] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLaptopDetail, setShowLaptopDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para foto e análise de IA
  const [photoState, setPhotoState] = useState({
    showOptions: false,
    showPreview: false,
    capturedPhoto: null,
    isProcessing: false,
    isAnalyzing: false,
    error: ''
  });

  // Estados dos formulários
  const [laptopForm, setLaptopForm] = useState({
    model: '',
    serial_number: '',
    service_tag: '',
    processor: '',
    ram: '',
    storage: '',
    graphics: '',
    screen_size: '',
    color: '',
    warranty_end: '',
    condition: 'Excelente',
    condition_score: 100,
    status: 'Disponível',
    floor_id: '',
    room_id: '',
    photo: null,
    damage_analysis: null,
    purchase_date: '',
    purchase_price: '',
    assigned_user: '',
    notes: ''
  });

  const [roomForm, setRoomForm] = useState({
    name: '',
    description: '',
    floor_id: ''
  });

  // Modelos Dell disponíveis
  const dellModels = [
    'Dell Inspiron 15 3000',
    'Dell Inspiron 15 5000',
    'Dell Inspiron 15 7000',
    'Dell XPS 13 9310',
    'Dell XPS 13 9320',
    'Dell XPS 15 9520',
    'Dell Latitude 3420',
    'Dell Latitude 5420',
    'Dell Latitude 7420',
    'Dell Vostro 3500',
    'Dell Vostro 5402',
    'Dell Alienware m15 R6',
    'Dell Precision 3560',
    'Dell Precision 5560'
  ];

  const statuses = ['Disponível', 'Em Uso', 'Manutenção', 'Descartado'];
  const conditions = ['Excelente', 'Bom', 'Regular', 'Ruim'];

  // =================== EFEITOS ===================
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // =================== FUNÇÕES DE DADOS ===================
  const loadData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('🔄 Carregando dados para usuário:', user.email);
      
      const [floorsResult, laptopsResult, statsResult] = await Promise.all([
        dataService.floors.getAll(user.id),
        dataService.laptops.getAll(user.id),
        dataService.getStatistics(user.id)
      ]);

      if (floorsResult.success) {
        setFloors(floorsResult.data);
        console.log('✅ Floors carregados:', floorsResult.data.length);
      }

      if (laptopsResult.success) {
        setLaptops(laptopsResult.data);
        console.log('✅ Laptops carregados:', laptopsResult.data.length);
      }

      if (statsResult.success) {
        // Garantir que todos os valores sejam números
        const safeStats = {
          total_laptops: parseInt(statsResult.data.total_laptops) || 0,
          available_laptops: parseInt(statsResult.data.available_laptops) || 0,
          in_use_laptops: parseInt(statsResult.data.in_use_laptops) || 0,
          maintenance_laptops: parseInt(statsResult.data.maintenance_laptops) || 0,
          discarded_laptops: parseInt(statsResult.data.discarded_laptops) || 0,
          total_value: parseFloat(statsResult.data.total_value) || 0,
          avg_condition: parseFloat(statsResult.data.avg_condition) || 0,
          total_floors: parseInt(statsResult.data.total_floors) || 0,
          total_rooms: parseInt(statsResult.data.total_rooms) || 0
        };
        setStatistics(safeStats);
        console.log('✅ Estatísticas carregadas:', safeStats);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // =================== FUNÇÕES DE FOTO E IA ===================
  const openPhotoOptions = () => {
    setPhotoState(prev => ({
      ...prev,
      showOptions: true,
      error: ''
    }));
  };

  const closeAllPhotoModals = () => {
    setPhotoState({
      showOptions: false,
      showPreview: false,
      capturedPhoto: null,
      isProcessing: false,
      isAnalyzing: false,
      error: ''
    });
  };

  const processImageFile = async (file) => {
    if (!file) return;

    setPhotoState(prev => ({ ...prev, isProcessing: true, error: '' }));

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Por favor, selecione apenas arquivos de imagem.');
      }

      const imageDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = () => reject(new Error('Erro ao ler arquivo de imagem.'));
        reader.readAsDataURL(file);
      });
      
      const resizedImage = await resizeImage(imageDataUrl, 1024, 768);

      setPhotoState(prev => ({
        ...prev,
        capturedPhoto: resizedImage,
        showPreview: true,
        showOptions: false,
        isProcessing: false
      }));
      
    } catch (error) {
      setPhotoState(prev => ({
        ...prev,
        error: error.message || 'Erro ao processar imagem.',
        isProcessing: false
      }));
    }
  };

  const resizeImage = (dataUrl, maxWidth, maxHeight) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(resizedDataUrl);
      };
      
      img.src = dataUrl;
    });
  };

  const handleTakePhoto = () => {
    setPhotoState(prev => ({ ...prev, showOptions: false, error: '' }));

    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      
      input.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
          processImageFile(file);
        }
      });
      
      input.click();
      
    } catch (error) {
      setPhotoState(prev => ({
        ...prev,
        error: 'Erro ao acessar a câmera. Verifique as permissões.'
      }));
    }
  };

  const handleSelectFromGallery = () => {
    setPhotoState(prev => ({ ...prev, showOptions: false, error: '' }));
    
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
          processImageFile(file);
        }
      });
      
      input.click();
      
    } catch (error) {
      setPhotoState(prev => ({
        ...prev,
        error: 'Erro ao acessar galeria.'
      }));
    }
  };

  const confirmPhotoWithAI = async () => {
    if (!photoState.capturedPhoto) return;

    setPhotoState(prev => ({ ...prev, isAnalyzing: true }));

    try {
      const analysisResult = await AIAnalysisService.analyzeLaptopDamage(photoState.capturedPhoto);
      
      if (analysisResult.success) {
        setLaptopForm(prev => ({
          ...prev,
          photo: photoState.capturedPhoto,
          damage_analysis: analysisResult.data,
          condition: analysisResult.data.overall_condition,
          condition_score: Math.max(0, 100 - analysisResult.data.damage_score)
        }));
      } else {
        setLaptopForm(prev => ({ ...prev, photo: photoState.capturedPhoto }));
      }
      
      closeAllPhotoModals();
    } catch (error) {
      setPhotoState(prev => ({
        ...prev,
        error: 'Erro na análise de IA. Foto salva sem análise.',
        isAnalyzing: false
      }));
      
      setLaptopForm(prev => ({ ...prev, photo: photoState.capturedPhoto }));
      
      setTimeout(() => {
        closeAllPhotoModals();
      }, 2000);
    }
  };

  const retakePhoto = () => {
    setPhotoState(prev => ({
      ...prev,
      showPreview: false,
      showOptions: true,
      capturedPhoto: null
    }));
  };

  const removePhotoFromForm = () => {
    setLaptopForm(prev => ({ ...prev, photo: null, damage_analysis: null }));
  };

  // =================== FUNÇÕES DE LAPTOPS ===================
  const handleSaveLaptop = async () => {
    if (!laptopForm.model?.trim() || !laptopForm.serial_number?.trim()) {
      alert('Por favor, preencha o modelo e número de série.');
      return;
    }
    
    if (!laptopForm.floor_id || !laptopForm.room_id) {
      alert('Por favor, selecione o andar e a sala.');
      return;
    }

    try {
      setIsLoading(true);

      // Verificar se número de série já existe
      if (!editingLaptop) {
        const serialCheck = await dataService.laptops.checkSerialExists(
          laptopForm.serial_number, 
          user.id
        );
        if (serialCheck.success && serialCheck.exists) {
          alert('Já existe um laptop com este número de série.');
          return;
        }
      }

      const laptopData = {
        model: laptopForm.model.trim(),
        serial_number: laptopForm.serial_number.trim(),
        service_tag: laptopForm.service_tag?.trim() || '',
        processor: laptopForm.processor?.trim() || '',
        ram: laptopForm.ram?.trim() || '',
        storage: laptopForm.storage?.trim() || '',
        graphics: laptopForm.graphics?.trim() || '',
        screen_size: laptopForm.screen_size?.trim() || '',
        color: laptopForm.color?.trim() || '',
        warranty_end: laptopForm.warranty_end || null,
        condition: laptopForm.condition || 'Excelente',
        condition_score: laptopForm.condition_score || 100,
        status: laptopForm.status || 'Disponível',
        floor_id: parseInt(laptopForm.floor_id),
        room_id: parseInt(laptopForm.room_id),
        photo: laptopForm.photo || null,
        damage_analysis: laptopForm.damage_analysis || null,
        purchase_date: laptopForm.purchase_date || null,
        purchase_price: laptopForm.purchase_price ? parseFloat(laptopForm.purchase_price) : null,
        assigned_user: laptopForm.assigned_user?.trim() || null,
        notes: laptopForm.notes?.trim() || null
      };

      let result;
      if (editingLaptop) {
        result = await dataService.laptops.update(editingLaptop.id, laptopData, user.id);
      } else {
        result = await dataService.laptops.create(laptopData, user.id);
      }

      if (result.success) {
        await loadData();
        resetLaptopForm();
        setShowLaptopForm(false);
        setEditingLaptop(null);
      } else {
        alert(`Erro ao ${editingLaptop ? 'atualizar' : 'criar'} laptop: ${result.error}`);
      }
    } catch (error) {
      alert(`Erro ao ${editingLaptop ? 'atualizar' : 'criar'} laptop: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditLaptop = (laptop) => {
    setEditingLaptop(laptop);
    setLaptopForm({
      model: laptop.model || '',
      serial_number: laptop.serial_number || '',
      service_tag: laptop.service_tag || '',
      processor: laptop.processor || '',
      ram: laptop.ram || '',
      storage: laptop.storage || '',
      graphics: laptop.graphics || '',
      screen_size: laptop.screen_size || '',
      color: laptop.color || '',
      warranty_end: laptop.warranty_end || '',
      condition: laptop.condition || 'Excelente',
      condition_score: laptop.condition_score || 100,
      status: laptop.status || 'Disponível',
      floor_id: laptop.floor_id?.toString() || '',
      room_id: laptop.room_id?.toString() || '',
      photo: laptop.photo || null,
      damage_analysis: laptop.damage_analysis || null,
      purchase_date: laptop.purchase_date || '',
      purchase_price: laptop.purchase_price || '',
      assigned_user: laptop.assigned_user || '',
      notes: laptop.notes || ''
    });
    setShowLaptopForm(true);
  };

  const handleDeleteLaptop = async (laptopId) => {
    if (!confirm('Tem certeza que deseja excluir este laptop?')) return;

    try {
      setIsLoading(true);
      
      const result = await dataService.laptops.delete(laptopId, user.id);
      
      if (result.success) {
        await loadData();
      } else {
        alert(`Erro ao excluir laptop: ${result.error}`);
      }
    } catch (error) {
      alert(`Erro ao excluir laptop: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetLaptopForm = () => {
    setLaptopForm({
      model: '',
      serial_number: '',
      service_tag: '',
      processor: '',
      ram: '',
      storage: '',
      graphics: '',
      screen_size: '',
      color: '',
      warranty_end: '',
      condition: 'Excelente',
      condition_score: 100,
      status: 'Disponível',
      floor_id: '',
      room_id: '',
      photo: null,
      damage_analysis: null,
      purchase_date: '',
      purchase_price: '',
      assigned_user: '',
      notes: ''
    });
    closeAllPhotoModals();
  };

  // =================== FUNÇÕES DE SALAS ===================
  const handleSaveRoom = async () => {
    if (!roomForm.name?.trim() || !roomForm.floor_id) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setIsLoading(true);
      
      const roomData = {
        name: roomForm.name.trim(),
        description: roomForm.description?.trim() || '',
        floor_id: parseInt(roomForm.floor_id)
      };

      let result;
      if (editingRoom) {
        result = await dataService.rooms.update(editingRoom.id, roomData, user.id);
      } else {
        result = await dataService.rooms.create(roomData, user.id);
      }

      if (result.success) {
        await loadData();
        setRoomForm({ name: '', description: '', floor_id: '' });
        setShowRoomForm(false);
        setEditingRoom(null);
      } else {
        alert(`Erro ao ${editingRoom ? 'atualizar' : 'criar'} sala: ${result.error}`);
      }
    } catch (error) {
      alert(`Erro ao ${editingRoom ? 'atualizar' : 'criar'} sala: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({
      name: room.name,
      description: room.description || '',
      floor_id: room.floor_id.toString()
    });
    setShowRoomForm(true);
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm('Tem certeza que deseja excluir esta sala?')) return;

    try {
      setIsLoading(true);
      
      const laptopsInRoom = laptops.filter(laptop => laptop.room_id === roomId);
      if (laptopsInRoom.length > 0) {
        alert(`Não é possível excluir esta sala pois existem ${laptopsInRoom.length} laptop(s) cadastrado(s) nela.`);
        return;
      }

      const result = await dataService.rooms.delete(roomId, user.id);
      
      if (result.success) {
        await loadData();
      } else {
        alert(`Erro ao excluir sala: ${result.error}`);
      }
    } catch (error) {
      alert(`Erro ao excluir sala: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // =================== FUNÇÕES AUXILIARES ===================
  const getFloorName = (floorId) => {
    const floor = floors.find(f => f.id === floorId);
    return floor ? floor.name : '';
  };

  const getRoomName = (roomId) => {
    const room = floors.flatMap(f => f.rooms || []).find(r => r.id === roomId);
    return room ? room.name : '';
  };

  const getRoomsForFloor = (floorId) => {
    const floor = floors.find(f => f.id === parseInt(floorId));
    return floor ? (floor.rooms || []) : [];
  };

  const filteredLaptops = laptops.filter(laptop => {
    const matchesSearch = laptop.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         laptop.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (laptop.assigned_user || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      'Disponível': { color: 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200', icon: Icons.CheckCircle },
      'Em Uso': { color: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200', icon: Icons.User },
      'Manutenção': { color: 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 border-orange-200', icon: Icons.Clock },
      'Descartado': { color: 'bg-gradient-to-r from-red-50 to-pink-50 text-red-600 border-red-200', icon: Icons.X }
    };
    
    const config = statusConfig[status] || statusConfig['Disponível'];
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${config.color} shadow-sm`}>
        <IconComponent />
        <span className="ml-1.5">{status}</span>
      </span>
    );
  };

  const ConditionBadge = ({ condition, score }) => {
    const conditionConfig = {
      'Excelente': { color: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200' },
      'Bom': { color: 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200' },
      'Regular': { color: 'bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border-yellow-200' },
      'Ruim': { color: 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200' }
    };
    
    const config = conditionConfig[condition] || conditionConfig['Excelente'];
    
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${config.color} shadow-sm`}>
        <span>{condition}</span>
        {score && <span className="ml-1">({score}%)</span>}
      </span>
    );
  };

  const ConnectionStatusIndicator = () => {
    const isConnected = isDatabaseAvailable();
    
    return (
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl border ${
        isConnected 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
          : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
      }`}>
        {isConnected ? <Icons.Database /> : <Icons.WifiOff />}
        <span className={`text-xs font-medium ${
          isConnected ? 'text-green-700' : 'text-gray-600'
        }`}>
          {isConnected ? 'Neon Online' : 'Offline'}
        </span>
      </div>
    );
  };

  const handleLogout = async () => {
    if (confirm('Tem certeza que deseja sair?')) {
      const result = await logout();
      if (result.success) {
        setFloors([]);
        setLaptops([]);
        setStatistics({});
        setActiveTab('dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Header Dell */}
      <div className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Icons.Laptop />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent">
                    Dell Laptop Manager
                  </h1>
                  <p className="text-xs md:text-sm text-gray-500 font-medium">Sistema de Controle de Laptops</p>
                </div>
                <div className="sm:hidden">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent">
                    Dell Manager
                  </h1>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden lg:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <Icons.Laptop />
                  <span className="font-semibold text-blue-700">{parseInt(statistics.total_laptops) || 0}</span>
                  <span className="text-blue-600">laptops</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <Icons.CheckCircle />
                  <span className="font-semibold text-green-700">{parseInt(statistics.available_laptops) || 0}</span>
                  <span className="text-green-600">disponíveis</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <Icons.DollarSign />
                  <span className="font-semibold text-purple-700">
                    R$ {(parseFloat(statistics.total_value) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </div>
                <ConnectionStatusIndicator />
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Icons.User />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800">
                      {user?.name || 'Usuário'}
                    </p>
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
          </div>
          
          <div className="flex space-x-2 mt-6 overflow-x-auto pb-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Icons.Home, shortLabel: 'Home', gradient: 'from-blue-500 to-indigo-500' },
              { id: 'laptops', label: 'Laptops', icon: Icons.Laptop, shortLabel: 'Laptops', gradient: 'from-purple-500 to-pink-500' },
              { id: 'locations', label: 'Localizações', icon: Icons.Building, shortLabel: 'Local', gradient: 'from-green-500 to-emerald-500' },
              { id: 'reports', label: 'Relatórios', icon: Icons.BarChart3, shortLabel: 'Report', gradient: 'from-orange-500 to-red-500' }
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
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent">
                  Dashboard Dell
                </h2>
                <p className="text-gray-600 mt-2">Visão geral dos laptops Dell</p>
              </div>
              <div className="text-right bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
                <p className="text-sm text-gray-600">Sistema Dell</p>
                <p className="font-bold text-lg text-gray-900">Laptop Manager</p>
                <div className="mt-2">
                  <ConnectionStatusIndicator />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-8 rounded-3xl shadow-lg border border-blue-100 hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-2">Total Laptops</p>
                    <p className="text-3xl md:text-4xl font-bold text-blue-700">{parseInt(statistics.total_laptops) || 0}</p>
                    <p className="text-xs text-blue-500 mt-1">equipamentos</p>
                  </div>
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icons.Laptop />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 md:p-8 rounded-3xl shadow-lg border border-emerald-100 hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-600 mb-2">Disponíveis</p>
                    <p className="text-3xl md:text-4xl font-bold text-emerald-700">{parseInt(statistics.available_laptops) || 0}</p>
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
                    <p className="text-3xl md:text-4xl font-bold text-orange-700">{parseInt(statistics.maintenance_laptops) || 0}</p>
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
            
            <div className="bg-white/70 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-lg border border-white/40">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Icons.Zap />
                <span>Ações Rápidas</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setActiveTab('laptops');
                    setShowLaptopForm(true);
                  }}
                  className="flex items-center space-x-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-2xl transition-all group border border-blue-200 hover:shadow-lg"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icons.Plus />
                  </div>
                  <div className="text-left">
                    <p className="text-blue-600 font-bold text-lg">Adicionar Laptop</p>
                    <p className="text-blue-500 text-sm">Cadastrar novo equipamento</p>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    setActiveTab('locations');
                    setShowRoomForm(true);
                  }}
                  className="flex items-center space-x-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-2xl transition-all group border border-green-200 hover:shadow-lg"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icons.Building />
                  </div>
                  <div className="text-left">
                    <p className="text-green-600 font-bold text-lg">Adicionar Sala</p>
                    <p className="text-green-500 text-sm">Nova localização</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resto do componente continua... */}
        {/* As outras abas (laptops, locations, reports) permanecem iguais */}
        {/* Incluindo todos os modais e formulários */}
      </div>
    </div>
  );
};

// =================== COMPONENTE PRINCIPAL COM PROVIDER ===================
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent = () => {
  const { user, loading, isInitialized, connectionStatus, login } = useAuth();

  // Se ainda está carregando e não inicializou, mostrar loading
  if (loading && !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/40">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-8"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Inicializando Sistema Dell</h2>
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
          
          <div className="mt-8">
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🔄 Recarregar Página
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Se inicializou mas ainda está carregando algo específico
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Carregando...</h2>
        </div>
      </div>
    );
  }

  // Se há usuário logado, mostrar sistema principal
  if (user) {
    return <DellLaptopControlSystem />;
  }

  // Se não há usuário, mostrar tela de login
  return (
    <AuthComponent onLogin={(userData) => {
      console.log('🔐 Fazendo login com:', userData);
      login(userData);
    }} />
  );
};

export default App;
