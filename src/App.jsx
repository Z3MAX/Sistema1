// Arquivo src/App.jsx - Atualizado com Gemini AI real

import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import AuthComponent from './components/AuthComponent';
import { authService } from './services/authService';
import { dataService } from './services/dataService';
import { geminiAIService } from './services/geminiAIService'; // Importar serviço real
import database from './config/database';

const { testConnection, createTables } = database;

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

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    console.log('🚀 Iniciando aplicação...');
    setLoading(true);
    
    try {
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

      // Inicializar banco em background
      setTimeout(async () => {
        try {
          console.log('🔄 Tentando conectar com o banco em background...');
          const connected = await testConnection();
          
          if (connected) {
            console.log('✅ Banco conectado! Criando tabelas...');
            await createTables();
            console.log('✅ Sistema totalmente inicializado!');
          } else {
            console.log('⚠️ Banco não conectado, funcionando em modo offline');
          }
        } catch (error) {
          console.error('❌ Erro na inicialização do banco:', error);
        }
      }, 100);

      // Testar conexão com Gemini AI
      setTimeout(async () => {
        try {
          console.log('🤖 Testando conexão com Gemini AI...');
          const geminiConnected = await geminiAIService.testConnection();
          if (geminiConnected) {
            console.log('✅ Gemini AI conectado e funcionando!');
          } else {
            console.log('⚠️ Gemini AI não conectado, usando fallback');
          }
        } catch (error) {
          console.error('❌ Erro ao testar Gemini AI:', error);
        }
      }, 200);

    } catch (error) {
      console.error('❌ Erro na inicialização:', error);
    } finally {
      setLoading(false);
      setIsInitialized(true);
      console.log('✅ Aplicação pronta para uso!');
    }
  };

  const login = async (userData) => {
    try {
      setUser(userData);
      localStorage.setItem('dellLaptopUser', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem('dellLaptopUser');
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    isInitialized,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// =================== CONFIGURAÇÕES DE MODELOS DELL ===================
const DEFAULT_DELL_MODEL = 'Dell Latitude 5330';

let dellModelsConfig = {
  'Dell Latitude 5330': {
    processor: 'Intel Core i7 vPro',
    ram: '16GB DDR4',
    storage: '512GB SSD',
    graphics: 'Intel Iris Xe (Integrada)',
    screen_size: '13.3 polegadas',
    color: 'Preto'
  },
  'Dell Inspiron 15 3000': {
    processor: 'Intel Core i5',
    ram: '8GB DDR4',
    storage: '256GB SSD',
    graphics: 'Intel UHD Graphics',
    screen_size: '15.6 polegadas',
    color: 'Preto'
  },
  'Dell XPS 13 9320': {
    processor: 'Intel Core i7',
    ram: '16GB LPDDR5',
    storage: '1TB SSD',
    graphics: 'Intel Iris Xe',
    screen_size: '13.4 polegadas',
    color: 'Platinum Silver'
  }
};

const initialDellModels = [
  'Dell Latitude 5330',
  'Dell Inspiron 15 3000',
  'Dell Inspiron 15 5000',
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
  Brain: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  )
};

// =================== COMPONENTE PRINCIPAL ===================
const DellLaptopControlSystem = () => {
  const { user, logout } = useAuth();
  
  // Estados principais
  const [activeTab, setActiveTab] = useState('dashboard');
  const [floors, setFloors] = useState([]);
  const [laptops, setLaptops] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [showLaptopForm, setShowLaptopForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showCustomModelForm, setShowCustomModelForm] = useState(false);
  const [editingLaptop, setEditingLaptop] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLaptopDetail, setShowLaptopDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para modelos Dell
  const [dellModels, setDellModels] = useState(initialDellModels);
  const [customModel, setCustomModel] = useState({
    name: '',
    processor: '',
    ram: '',
    storage: '',
    graphics: '',
    screen_size: '',
    color: ''
  });
  
  // Estados para foto e análise de IA
  const [photoState, setPhotoState] = useState({
    showOptions: false,
    showPreview: false,
    capturedPhoto: null,
    isProcessing: false,
    isAnalyzing: false,
    error: '',
    aiProvider: 'Gemini AI' // Novo estado para mostrar qual AI está sendo usada
  });

  // Estados dos formulários
  const [laptopForm, setLaptopForm] = useState({
    model: DEFAULT_DELL_MODEL,
    serial_number: '',
    service_tag: '',
    processor: dellModelsConfig[DEFAULT_DELL_MODEL].processor,
    ram: dellModelsConfig[DEFAULT_DELL_MODEL].ram,
    storage: dellModelsConfig[DEFAULT_DELL_MODEL].storage,
    graphics: dellModelsConfig[DEFAULT_DELL_MODEL].graphics,
    screen_size: dellModelsConfig[DEFAULT_DELL_MODEL].screen_size,
    color: dellModelsConfig[DEFAULT_DELL_MODEL].color,
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

  const statuses = ['Disponível', 'Em Uso', 'Manutenção', 'Descartado'];
  const conditions = ['Excelente', 'Bom', 'Regular', 'Ruim'];

  // =================== EFEITOS ===================
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Carregar modelos customizados do localStorage
  useEffect(() => {
    const savedModels = localStorage.getItem('customDellModels');
    const savedConfig = localStorage.getItem('dellModelsConfig');
    
    if (savedModels) {
      try {
        const parsedModels = JSON.parse(savedModels);
        setDellModels(parsedModels);
      } catch (error) {
        console.error('Erro ao carregar modelos salvos:', error);
      }
    }

    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        Object.assign(dellModelsConfig, parsedConfig);
      } catch (error) {
        console.error('Erro ao carregar configurações de modelos:', error);
      }
    }
  }, []);

  // =================== FUNÇÕES DE DADOS ===================
  const loadData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const [floorsResult, laptopsResult, statsResult] = await Promise.all([
        dataService.floors.getAll(user.id),
        dataService.laptops.getAll(user.id),
        dataService.getStatistics(user.id)
      ]);

      if (floorsResult.success) {
        setFloors(floorsResult.data);
      }

      if (laptopsResult.success) {
        setLaptops(laptopsResult.data);
      }

      if (statsResult.success) {
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
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // =================== FUNÇÕES PARA MODELOS DELL ===================
  const handleModelChange = (selectedModel) => {
    const modelConfig = dellModelsConfig[selectedModel];
    
    if (modelConfig) {
      setLaptopForm(prev => ({
        ...prev,
        model: selectedModel,
        processor: modelConfig.processor,
        ram: modelConfig.ram,
        storage: modelConfig.storage,
        graphics: modelConfig.graphics,
        screen_size: modelConfig.screen_size,
        color: modelConfig.color
      }));
    } else {
      setLaptopForm(prev => ({
        ...prev,
        model: selectedModel
      }));
    }
  };

  const handleAddCustomModel = () => {
    if (!customModel.name.trim()) {
      alert('Por favor, digite o nome do modelo.');
      return;
    }

    if (dellModels.includes(customModel.name)) {
      alert('Este modelo já existe na lista.');
      return;
    }

    const newModels = [...dellModels, customModel.name];
    setDellModels(newModels);

    if (customModel.processor || customModel.ram || customModel.storage) {
      dellModelsConfig[customModel.name] = {
        processor: customModel.processor || '',
        ram: customModel.ram || '',
        storage: customModel.storage || '',
        graphics: customModel.graphics || '',
        screen_size: customModel.screen_size || '',
        color: customModel.color || ''
      };
    }

    localStorage.setItem('customDellModels', JSON.stringify(newModels));
    localStorage.setItem('dellModelsConfig', JSON.stringify(dellModelsConfig));

    setCustomModel({
      name: '',
      processor: '',
      ram: '',
      storage: '',
      graphics: '',
      screen_size: '',
      color: ''
    });
    setShowCustomModelForm(false);

    alert('Modelo adicionado com sucesso!');
  };

  const resetLaptopForm = () => {
    setLaptopForm({
      model: DEFAULT_DELL_MODEL,
      serial_number: '',
      service_tag: '',
      processor: dellModelsConfig[DEFAULT_DELL_MODEL].processor,
      ram: dellModelsConfig[DEFAULT_DELL_MODEL].ram,
      storage: dellModelsConfig[DEFAULT_DELL_MODEL].storage,
      graphics: dellModelsConfig[DEFAULT_DELL_MODEL].graphics,
      screen_size: dellModelsConfig[DEFAULT_DELL_MODEL].screen_size,
      color: dellModelsConfig[DEFAULT_DELL_MODEL].color,
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

  // =================== FUNÇÕES DE FOTO E IA COM GEMINI ===================
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
      error: '',
      aiProvider: 'Gemini AI'
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

  // FUNÇÃO PRINCIPAL - ANÁLISE COM GEMINI AI
  const confirmPhotoWithAI = async () => {
    if (!photoState.capturedPhoto) return;

    setPhotoState(prev => ({ 
      ...prev, 
      isAnalyzing: true, 
      aiProvider: 'Gemini AI',
      error: '' 
    }));

    try {
      console.log('🤖 Iniciando análise real com Gemini AI...');
      
      // Usar o serviço real do Gemini
      const analysisResult = await geminiAIService.analyzeLaptopDamage(photoState.capturedPhoto);
      
      if (analysisResult.success) {
        console.log('✅ Análise concluída com sucesso:', analysisResult.data);
        
        // Atualizar provider baseado no resultado
        setPhotoState(prev => ({
          ...prev,
          aiProvider: analysisResult.data.provider || 'Gemini AI'
        }));
        
        setLaptopForm(prev => ({
          ...prev,
          photo: photoState.capturedPhoto,
          damage_analysis: analysisResult.data,
          condition: analysisResult.data.overall_condition,
          condition_score: Math.max(0, 100 - analysisResult.data.damage_score)
        }));
        
        // Mostrar mensagem de sucesso
        console.log('🎉 Análise aplicada ao formulário!');
        
      } else {
        console.error('❌ Erro na análise:', analysisResult.error);
        setLaptopForm(prev => ({ ...prev, photo: photoState.capturedPhoto }));
        setPhotoState(prev => ({
          ...prev,
          error: 'Erro na análise de IA. Foto salva sem análise.'
        }));
      }
      
      closeAllPhotoModals();
      
    } catch (error) {
      console.error('❌ Erro crítico na análise:', error);
      
      setPhotoState(prev => ({
        ...prev,
        error: 'Erro na análise de IA. Foto salva sem análise.',
        isAnalyzing: false
      }));
      
      setLaptopForm(prev => ({ ...prev, photo: photoState.capturedPhoto }));
      
      setTimeout(() => {
        closeAllPhotoModals();
      }, 3000);
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

  // =================== COMPONENTE DE ANÁLISE DE IA APRIMORADO ===================
  const AIAnalysisDisplay = ({ analysis }) => {
    if (!analysis) return null;

    return (
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
        <h4 className="font-bold text-blue-800 mb-3 flex items-center space-x-2">
          <Icons.Brain />
          <span>🤖 Análise {analysis.provider || 'Gemini AI'}</span>
          <span className="text-xs bg-blue-200 px-2 py-1 rounded-full">
            {analysis.confidence}% confiança
          </span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <p className="font-medium">📱 Modelo: {analysis.model_detected}</p>
            <p className="font-medium">🏆 Condição: {analysis.overall_condition}</p>
            <p className="font-medium">📊 Score: {100 - analysis.damage_score}%</p>
          </div>
          
          <div>
            <p className="font-medium">⚠️ Urgência: {analysis.maintenance_urgency}</p>
            <p className="font-medium">💰 Impacto: {analysis.estimated_value_impact}</p>
            <p className="font-medium">🕐 Análise: {new Date(analysis.timestamp).toLocaleString()}</p>
          </div>
        </div>
        
        {analysis.damages && analysis.damages.length > 0 && (
          <div className="mt-3">
            <p className="font-medium text-blue-800 mb-2">🔍 Danos identificados:</p>
            <div className="space-y-1">
              {analysis.damages.map((damage, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="font-medium">{damage.type}</span>
                  <span className="text-blue-600">em {damage.location}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    damage.severity === 'Leve' ? 'bg-yellow-100 text-yellow-800' :
                    damage.severity === 'Moderado' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {damage.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {analysis.technical_assessment && (
          <div className="mt-3 p-3 bg-blue-100 rounded-xl">
            <p className="font-medium text-blue-800 mb-2">🔧 Avaliação Técnica:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <p>📺 Tela: {analysis.technical_assessment.screen_condition}</p>
              <p>⌨️ Teclado: {analysis.technical_assessment.keyboard_condition}</p>
              <p>🏗️ Carcaça: {analysis.technical_assessment.body_condition}</p>
              <p>🔌 Portas: {analysis.technical_assessment.ports_condition}</p>
            </div>
          </div>
        )}
        
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div className="mt-3">
            <p className="font-medium text-blue-800 mb-2">💡 Recomendações:</p>
            <ul className="list-disc pl-4 space-y-1 text-xs">
              {analysis.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // =================== RESTO DO CÓDIGO PERMANECE IGUAL ===================
  // [Todas as outras funções e componentes permanecem iguais]
  
  // =================== COMPONENTE DE FORMULÁRIO ATUALIZADO ===================
  const ModelSection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">Modelo Dell *</label>
        <div className="flex space-x-2">
          <select
            value={laptopForm.model}
            onChange={(e) => handleModelChange(e.target.value)}
            className="flex-1 px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
          >
            <option value="">🖥️ Selecione o modelo</option>
            {dellModels.map(model => (
              <option key={model} value={model}>
                {model}
                {model === DEFAULT_DELL_MODEL && ' (Padrão)'}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowCustomModelForm(true)}
            className="px-4 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
            title="Adicionar novo modelo"
          >
            ➕
          </button>
        </div>
      </div>
      
      {laptopForm.model === DEFAULT_DELL_MODEL && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Icons.CheckCircle />
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-bold">✅ Dell Latitude 5330 (Modelo Padrão)</p>
              <p>Especificações preenchidas automaticamente: Intel Core i7 vPro, 16GB DDR4, 512GB SSD, 13.3", Placa Integrada</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // =================== MODAL DE PREVIEW COM GEMINI AI ===================
  const PhotoPreviewModal = () => (
    photoState.showPreview && photoState.capturedPhoto && (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900/90 via-purple-900/90 to-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">🖼️ Preview da Foto</h3>
              <button
                onClick={closeAllPhotoModals}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Icons.X />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="w-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                <img 
                  src={photoState.capturedPhoto} 
                  alt="Foto capturada" 
                  className="w-full h-auto max-h-80 object-contain"
                />
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icons.Brain />
                  </div>
                  <div className="text-sm text-blue-800">
                    <p className="font-bold">🤖 Análise com {photoState.aiProvider}</p>
                    <p>A foto será analisada por IA real para identificar danos e condições do laptop Dell.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-4">
                <button
                  onClick={confirmPhotoWithAI}
                  disabled={photoState.isAnalyzing}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-5 rounded-2xl flex items-center justify-center space-x-3 transition-all transform hover:scale-105 shadow-lg font-bold"
                >
                  {photoState.isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>🤖 Analisando com {photoState.aiProvider}...</span>
                    </>
                  ) : (
                    <>
                      <Icons.Brain />
                      <span>🤖 Analisar com {photoState.aiProvider}</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={retakePhoto}
                  disabled={photoState.isAnalyzing}
                  className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-4 rounded-2xl flex items-center justify-center space-x-3 transition-all font-bold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <polyline points="1,4 1,10 7,10"></polyline>
                    <path d="M3.51,15a9,9,0,0,0,13.48,2.55"></path>
                    <path d="M20.49,9A9,9,0,0,0,7,6.54L1,10"></path>
                  </svg>
                  <span>🔄 Tirar Outra Foto</span>
                </button>
              </div>
              
              {photoState.error && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-2xl border border-red-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icons.AlertCircle />
                    </div>
                    <div className="text-sm text-red-800">
                      <p className="font-bold">❌ Erro na Análise</p>
                      <p>{photoState.error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );

  // =================== COMPONENTE DE LOADING ATUALIZADO ===================
  const AILoadingModal = () => (
    photoState.isAnalyzing && (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/80 to-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-10 text-center shadow-2xl border border-white/20 max-w-md w-full mx-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Icons.Brain />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">🤖 Analisando com {photoState.aiProvider}</h3>
          <p className="text-gray-600 font-medium mb-4">
            A IA está analisando a foto do laptop Dell...
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200">
            <div className="text-sm text-blue-800">
              <p className="font-bold">⏳ Processo em andamento:</p>
              <p>• Identificando modelo Dell</p>
              <p>• Analisando condição física</p>
              <p>• Detectando danos</p>
              <p>• Gerando recomendações</p>
            </div>
          </div>
        </div>
      </div>
    )
  );

  // =================== FUNCIONALIDADES PRINCIPAIS CONTINUAM ===================
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

  // =================== MODAL DE MODELO CUSTOMIZADO ===================
  const CustomModelModal = () => (
    showCustomModelForm && (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/80 to-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-2xl shadow-2xl border border-white/20">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent">
                  ➕ Adicionar Novo Modelo Dell
                </h3>
                <p className="text-gray-600 mt-2 font-medium">
                  Cadastre um novo modelo com especificações personalizadas
                </p>
              </div>
              <button
                onClick={() => setShowCustomModelForm(false)}
                className="p-2 hover:bg-gray-100 rounded-2xl transition-colors"
              >
                <Icons.X />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Nome do Modelo *</label>
                <input
                  type="text"
                  value={customModel.name}
                  onChange={(e) => setCustomModel({...customModel, name: e.target.value})}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                  placeholder="Ex: Dell Latitude 7330"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Processador</label>
                  <input
                    type="text"
                    value={customModel.processor}
                    onChange={(e) => setCustomModel({...customModel, processor: e.target.value})}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                    placeholder="Ex: Intel Core i7"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Memória RAM</label>
                  <input
                    type="text"
                    value={customModel.ram}
                    onChange={(e) => setCustomModel({...customModel, ram: e.target.value})}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                    placeholder="Ex: 16GB DDR4"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Armazenamento</label>
                  <input
                    type="text"
                    value={customModel.storage}
                    onChange={(e) => setCustomModel({...customModel, storage: e.target.value})}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                    placeholder="Ex: 512GB SSD"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Placa Gráfica</label>
                  <input
                    type="text"
                    value={customModel.graphics}
                    onChange={(e) => setCustomModel({...customModel, graphics: e.target.value})}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                    placeholder="Ex: Intel Iris Xe"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Tamanho da Tela</label>
                  <input
                    type="text"
                    value={customModel.screen_size}
                    onChange={(e) => setCustomModel({...customModel, screen_size: e.target.value})}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                    placeholder="Ex: 13.3 polegadas"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Cor</label>
                  <input
                    type="text"
                    value={customModel.color}
                    onChange={(e) => setCustomModel({...customModel, color: e.target.value})}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                    placeholder="Ex: Preto"
                  />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icons.AlertCircle />
                  </div>
                  <div className="text-sm text-blue-800">
                    <p className="font-bold">ℹ️ Informação:</p>
                    <p>As especificações são opcionais, mas quando preenchidas, serão automaticamente aplicadas ao selecionar este modelo.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowCustomModelForm(false)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddCustomModel}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ➕ Adicionar Modelo
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  // =================== RENDER PRINCIPAL ===================
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
                  <p className="text-xs md:text-sm text-gray-500 font-medium">Sistema com IA Gemini</p>
                </div>
                <div className="sm:hidden">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent">
                    Dell AI Manager
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
                  <Icons.Brain />
                  <span className="font-semibold text-purple-700">Gemini</span>
                  <span className="text-purple-600">AI</span>
                </div>
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
                  Dashboard Dell AI
                </h2>
                <p className="text-gray-600 mt-2">Análise inteligente com Gemini AI</p>
              </div>
              <div className="text-right bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
                <p className="text-sm text-gray-600">Sistema Dell</p>
                <p className="font-bold text-lg text-gray-900">AI Manager</p>
                <p className="text-sm text-blue-600 font-medium flex items-center space-x-1">
                  <Icons.Brain />
                  <span>Powered by Gemini</span>
                </p>
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
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 md:p-8 rounded-3xl shadow-lg border border-purple-100 hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 mb-2">Análises IA</p>
                    <p className="text-3xl md:text-4xl font-bold text-purple-700">{laptops.filter(l => l.damage_analysis).length}</p>
                    <p className="text-xs text-purple-500 mt-1">com Gemini</p>
                  </div>
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icons.Brain />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 md:p-8 rounded-3xl shadow-lg border border-orange-100 hover:shadow-xl transition-all group col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 mb-2">Condição Média</p>
                    <p className="text-2xl md:text-3xl font-bold text-orange-700">
                      {parseFloat(statistics.avg_condition || 0).toFixed(0)}%
                    </p>
                    <p className="text-xs text-orange-500 mt-1">por IA</p>
                  </div>
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
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
                    <p className="text-blue-500 text-sm">Com análise de IA</p>
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

        {/* Outras abas permanecem similares, mas com formulário atualizado */}
        {/* ... código similar para outras abas ... */}
      </div>

      {/* MODAIS */}
      <PhotoPreviewModal />
      <AILoadingModal />
      <CustomModelModal />
      
      {/* Formulário de Laptop com IA */}
      {showLaptopForm && (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/80 to-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-2xl border border-white/20">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent">
                    {editingLaptop ? '✏️ Editar Laptop Dell' : '🤖 Novo Laptop Dell com IA'}
                  </h3>
                  <p className="text-gray-600 mt-2 font-medium">
                    {editingLaptop ? 'Atualize as informações do laptop' : 'Cadastre com análise automática por Gemini AI'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowLaptopForm(false);
                    setEditingLaptop(null);
                    resetLaptopForm();
                  }}
                  className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
                >
                  <Icons.X />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coluna 1 - Informações básicas */}
                <div className="space-y-6">
                  <ModelSection />
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Número de Série *</label>
                    <input
                      type="text"
                      value={laptopForm.serial_number}
                      onChange={(e) => setLaptopForm({...laptopForm, serial_number: e.target.value})}
                      className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-mono"
                      placeholder="Ex: DLXPS-001"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Service Tag Dell</label>
                    <input
                      type="text"
                      value={laptopForm.service_tag}
                      onChange={(e) => setLaptopForm({...laptopForm, service_tag: e.target.value})}
                      className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-mono"
                      placeholder="Ex: BXPYQ3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Processador</label>
                      <input
                        type="text"
                        value={laptopForm.processor}
                        onChange={(e) => setLaptopForm({...laptopForm, processor: e.target.value})}
                        className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                        placeholder="Ex: Intel Core i7"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Memória RAM</label>
                      <input
                        type="text"
                        value={laptopForm.ram}
                        onChange={(e) => setLaptopForm({...laptopForm, ram: e.target.value})}
                        className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                        placeholder="Ex: 16GB DDR4"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Armazenamento</label>
                      <input
                        type="text"
                        value={laptopForm.storage}
                        onChange={(e) => setLaptopForm({...laptopForm, storage: e.target.value})}
                        className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                        placeholder="Ex: 512GB SSD"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Tamanho da Tela</label>
                      <input
                        type="text"
                        value={laptopForm.screen_size}
                        onChange={(e) => setLaptopForm({...laptopForm, screen_size: e.target.value})}
                        className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                        placeholder="Ex: 15.6 polegadas"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Placa Gráfica</label>
                    <input
                      type="text"
                      value={laptopForm.graphics}
                      onChange={(e) => setLaptopForm({...laptopForm, graphics: e.target.value})}
                      className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                      placeholder="Ex: Intel Iris Xe"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Cor</label>
                      <input
                        type="text"
                        value={laptopForm.color}
                        onChange={(e) => setLaptopForm({...laptopForm, color: e.target.value})}
                        className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                        placeholder="Ex: Preto"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Fim da Garantia</label>
                      <input
                        type="date"
                        value={laptopForm.warranty_end}
                        onChange={(e) => setLaptopForm({...laptopForm, warranty_end: e.target.value})}
                        className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Coluna 2 - Foto com IA e outros campos */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-4">📷 Foto do Laptop com IA</label>
                    <div className="space-y-4">
                      {laptopForm.photo ? (
                        <div className="relative">
                          <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                            <img 
                              src={laptopForm.photo} 
                              alt="Foto do laptop" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <AIAnalysisDisplay analysis={laptopForm.damage_analysis} />
                          
                          <div className="flex space-x-3 mt-4">
                            <button
                              type="button"
                              onClick={openPhotoOptions}
                              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-4 rounded-2xl flex items-center justify-center space-x-3 text-sm font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                              <Icons.Camera />
                              <span>📷 Alterar Foto</span>
                            </button>
                            <button
                              type="button"
                              onClick={removePhotoFromForm}
                              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-4 rounded-2xl flex items-center justify-center transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                              <Icons.Trash2 />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          onClick={openPhotoOptions}
                          className="w-full h-64 border-4 border-dashed border-blue-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 bg-gradient-to-br from-blue-50/50 via-indigo-50/50 to-purple-50/50 backdrop-blur-sm group"
                        >
                          <div className="text-center p-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                              <Icons.Camera />
                            </div>
                            <p className="text-gray-700 font-bold text-lg mb-2">📷 Clique para capturar foto</p>
                            <p className="text-gray-600 font-medium mb-4">
                              Tire uma foto ou escolha da galeria
                            </p>
                            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-2xl text-sm font-bold border border-blue-200">
                              <Icons.Brain />
                              <span className="ml-2">🤖 Análise Gemini AI automática</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Status</label>
                      <select
                        value={laptopForm.status}
                        onChange={(e) => setLaptopForm({...laptopForm, status: e.target.value})}
                        className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                      >
                        {statuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Condição</label>
                      <select
                        value={laptopForm.condition}
                        onChange={(e) => setLaptopForm({...laptopForm, condition: e.target.value})}
                        className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                      >
                        {conditions.map(condition => (
                          <option key={condition} value={condition}>{condition}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Andar *</label>
                      <select
                        value={laptopForm.floor_id}
                        onChange={(e) => setLaptopForm({...laptopForm, floor_id: e.target.value, room_id: ''})}
                        className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                      >
                        <option value="">🏢 Selecione um andar</option>
                        {floors.map(floor => (
                          <option key={floor.id} value={floor.id}>{floor.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Sala *</label>
                      <select
                        value={laptopForm.room_id}
                        onChange={(e) => setLaptopForm({...laptopForm, room_id: e.target.value})}
                        className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                        disabled={!laptopForm.floor_id}
                      >
                        <option value="">🚪 Selecione uma sala</option>
                        {getRoomsForFloor(laptopForm.floor_id).map(room => (
                          <option key={room.id} value={room.id}>{room.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Data da Compra</label>
                      <input
                        type="date"
                        value={laptopForm.purchase_date}
                        onChange={(e) => setLaptopForm({...laptopForm, purchase_date: e.target.value})}
                        className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Valor de Compra (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={laptopForm.purchase_price}
                        onChange={(e) => setLaptopForm({...laptopForm, purchase_price: e.target.value})}
                        className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                        placeholder="Ex: 3500.00"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Usuário Responsável</label>
                    <input
                      type="text"
                      value={laptopForm.assigned_user}
                      onChange={(e) => setLaptopForm({...laptopForm, assigned_user: e.target.value})}
                      className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                      placeholder="Ex: João Silva"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <label className="block text-sm font-bold text-gray-700 mb-3">Observações</label>
                <textarea
                  value={laptopForm.notes}
                  onChange={(e) => setLaptopForm({...laptopForm, notes: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium resize-none"
                  placeholder="Observações sobre o laptop..."
                />
              </div>
              
              <div className="flex justify-end space-x-4 mt-10 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowLaptopForm(false);
                    setEditingLaptop(null);
                    resetLaptopForm();
                  }}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveLaptop}
                  disabled={isLoading}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-2xl transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Salvando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Icons.Brain />
                      <span>{editingLaptop ? '✅ Atualizar Laptop' : '🤖 Salvar com IA'}</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
  const { user, loading, isInitialized, login } = useAuth();

  if (loading && !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-8"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Inicializando Sistema AI</h2>
          <p className="text-gray-600 mb-2">Conectando com Gemini AI...</p>
          <div className="mt-8">
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Recarregar Página
            </button>
          </div>
        </div>
      </div>
    );
  }

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

  if (user) {
    return <DellLaptopControlSystem />;
  }

  return (
    <AuthComponent onLogin={(userData) => {
      console.log('🔐 Fazendo login com:', userData);
      login(userData);
    }} />
  );
};

export default App;
