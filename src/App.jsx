// Arquivo src/App.jsx completo com modificações para modelo padrão Dell Latitude 5330

import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import AuthComponent from './components/AuthComponent';
import { authService } from './services/authService';
import { dataService } from './services/dataService';
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

// =================== SIMULAÇÃO DE ANÁLISE DE IA ===================
const AIAnalysisService = {
  async analyzeLaptopDamage(imageData) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const scenarios = [
      {
        overall_condition: 'Excelente',
        damage_score: 5,
        confidence: 98,
        damages: [],
        recommendations: [
          'Laptop em excelente estado',
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
      }
    ];
    
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    return {
      success: true,
      data: {
        analysis_id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        model_detected: 'Dell Latitude 5330',
        ...randomScenario
      }
    };
  }
};

// =================== CONFIGURAÇÕES DE MODELOS DELL ===================
const DEFAULT_DELL_MODEL = 'Dell Latitude 5330';

// Configurações de modelos com especificações predefinidas
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

// Lista inicial de modelos Dell
const initialDellModels = [
  'Dell Latitude 5330', // Modelo padrão
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
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0
