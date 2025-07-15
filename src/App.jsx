// ============= ARQUIVO COMPLETO ATUALIZADO: App.jsx =============

import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import AuthComponent from './components/AuthComponent';
import { authService } from './services/authService';
import { dataService } from './services/dataService';
import database from './config/database';

const { testConnection, createTables, insertInitialData, isDatabaseAvailable, getConnectionStatus } = database;

// =================== CONTEXT DE AUTENTICAÇÃO (INALTERADO) ===================
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
      const status = getConnectionStatus();
      setConnectionStatus(status);
      console.log('📊 Connection status:', status);

      const savedUser = localStorage.getItem('dellLaptopUser');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          console.log('👤 Usuário encontrado no localStorage:', userData.email);
          
          const userExists = await authService.getUserById(userData.id);
          if (userExists) {
            setUser(userData);
            console.log('✅ Usuário validado no banco');
          } else {
            console.log('⚠️ Usuário não existe mais no banco, removendo do localStorage');
            localStorage.removeItem('dellLaptopUser');
          }
        } catch (error) {
          console.error('❌ Erro ao verificar usuário:', error);
          localStorage.removeItem('dellLaptopUser');
        }
      }

      if (isDatabaseAvailable()) {
        console.log('🔄 Banco disponível, iniciando inicialização...');
        
        setTimeout(async () => {
          try {
            console.log('🔄 Tentando conectar com Neon...');
            const connected = await testConnection();
            
            if (connected) {
              console.log('✅ Conectado ao Neon! Criando estrutura...');
              await createTables();
              console.log('✅ Sistema totalmente inicializado com Neon!');
            } else {
              console.log('⚠️ Neon não conectado, funcionando em modo offline');
            }
          } catch (error) {
            console.error('❌ Erro na inicialização do banco:', error);
            console.log('📱 Continuando em modo offline');
          }
        }, 500);
      } else {
        console.log('📱 Banco não disponível, funcionando em modo offline');
      }

    } catch (error) {
      console.error('❌ Erro na inicialização:', error);
    } finally {
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
      
      console.log('✅ Login realizado com sucesso!');
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

// =================== SIMULAÇÃO DE ANÁLISE DE IA (INALTERADO) ===================
const AIAnalysisService = {
  async analyzeLaptopDamage(imageData) {
    console.log('🤖 Iniciando análise de IA do laptop...');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
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
      }
    ];
    
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

// =================== ÍCONES SVG (INALTERADO) ===================
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
  // NOVOS ÍCONES PARA CHAMADOS DELL
  Phone: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Wrench: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
};

// =================== COMPONENTES PARA CHAMADOS DELL ===================
const DellSupportBadge = ({ laptop }) => {
  if (!laptop.dell_support_ticket) return null;
  
  const statusConfig = {
    'Aberto': { color: 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200', icon: '🔴' },
    'Em Andamento': { color: 'bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border-yellow-200', icon: '🟡' },
    'Aguardando Peças': { color: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200', icon: '🔵' },
    'Resolvido': { color: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200', icon: '🟢' },
    'Fechado': { color: 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200', icon: '⚫' }
  };
  
  const config = statusConfig[laptop.dell_support_status] || statusConfig['Aberto'];
  
  return (
    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${config.color} shadow-sm`}>
      <span className="mr-1">{config.icon}</span>
      <span>Dell: {laptop.dell_support_status}</span>
    </div>
  );
};

const DellSupportModal = ({ laptop, isOpen, onClose, onSave }) => {
  const [dellSupportForm, setDellSupportForm] = useState({
    dell_support_ticket: laptop?.dell_support_ticket || '',
    dell_support_status: laptop?.dell_support_status || 'Aberto',
    dell_support_opened_date: laptop?.dell_support_opened_date || new Date().toISOString().split('T')[0],
    dell_support_description: laptop?.dell_support_description || '',
    dell_support_priority: laptop?.dell_support_priority || 'Média',
    dell_support_estimated_resolution: laptop?.dell_support_estimated_resolution || '',
    dell_support_notes: laptop?.dell_support_notes || ''
  });
  
  const statuses = ['Aberto', 'Em Andamento', 'Aguardando Peças', 'Resolvido', 'Fechado'];
  const priorities = ['Baixa', 'Média', 'Alta', 'Crítica'];
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(dellSupportForm);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Icons.Phone className="mr-2 text-blue-600" />
              Chamado Dell
            </h2>
            <p className="text-sm text-gray-600">{laptop?.model} - {laptop?.service_tag}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
          >
            <Icons.X />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Número do Chamado Dell *
              </label>
              <input
                type="text"
                value={dellSupportForm.dell_support_ticket}
                onChange={(e) => setDellSupportForm(prev => ({ ...prev, dell_support_ticket: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ex: 12345678"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Status do Chamado
              </label>
              <select
                value={dellSupportForm.dell_support_status}
                onChange={(e) => setDellSupportForm(prev => ({ ...prev, dell_support_status: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Data de Abertura
              </label>
              <input
                type="date"
                value={dellSupportForm.dell_support_opened_date}
                onChange={(e) => setDellSupportForm(prev => ({ ...prev, dell_support_opened_date: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Prioridade
              </label>
              <select
                value={dellSupportForm.dell_support_priority}
                onChange={(e) => setDellSupportForm(prev => ({ ...prev, dell_support_priority: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Previsão de Resolução
              </label>
              <input
                type="date"
                value={dellSupportForm.dell_support_estimated_resolution}
                onChange={(e) => setDellSupportForm(prev => ({ ...prev, dell_support_estimated_resolution: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Descrição do Problema
            </label>
            <textarea
              value={dellSupportForm.dell_support_notes}
              onChange={(e) => setDellSupportForm(prev => ({ ...prev, dell_support_notes: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              rows="3"
              placeholder="Atualizações, observações, etc..."
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              Salvar Chamado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MaintenanceFields = ({ laptopForm, setLaptopForm, onOpenDellSupport }) => {
  if (laptopForm.status !== 'Manutenção') return null;
  
  return (
    <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
      <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center">
        <Icons.Wrench className="mr-2" />
        Informações de Manutenção
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Tipo de Manutenção
          </label>
          <select 
            value={laptopForm.maintenance_type || 'interna'}
            onChange={(e) => setLaptopForm(prev => ({ ...prev, maintenance_type: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          >
            <option value="interna">Manutenção Interna</option>
            <option value="garantia">Garantia Dell</option>
            <option value="terceirizada">Terceirizada</option>
          </select>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Chamado Dell Aberto?</p>
            <p className="text-xs text-gray-500">Para manutenção em garantia</p>
          </div>
          <button
            type="button"
            onClick={onOpenDellSupport}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm"
          >
            {laptopForm.dell_support_ticket ? 'Editar Chamado' : 'Abrir Chamado'}
          </button>
        </div>
        
        {laptopForm.dell_support_ticket && (
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Chamado Dell: {laptopForm.dell_support_ticket}
                </p>
                <p className="text-xs text-blue-600">
                  Status: {laptopForm.dell_support_status}
                </p>
                {laptopForm.dell_support_opened_date && (
                  <p className="text-xs text-blue-600">
                    Aberto em: {new Date(laptopForm.dell_support_opened_date).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              <DellSupportBadge laptop={laptopForm} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// =================== COMPONENTE PRINCIPAL ===================
const DellLaptopControlSystem = () => {
  const { user, logout, connectionStatus } = useAuth();
  
  // Estados principais
  const [activeTab, setActiveTab] = useState('dashboard');
  const [laptops, setLaptops] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [dellSupportStats, setDellSupportStats] = useState({});
  const [showLaptopForm, setShowLaptopForm] = useState(false);
  const [editingLaptop, setEditingLaptop] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLaptopDetail, setShowLaptopDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para chamados Dell
  const [showDellSupportModal, setShowDellSupportModal] = useState(false);
  const [selectedLaptopForSupport, setSelectedLaptopForSupport] = useState(null);
  
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
    photo: null,
    damage_analysis: null,
    purchase_date: '',
    purchase_price: '',
    assigned_user: '',
    notes: '',
    // Novos campos Dell Support
    dell_support_ticket: '',
    dell_support_status: 'Aberto',
    dell_support_opened_date: '',
    dell_support_description: '',
    dell_support_priority: 'Média',
    dell_support_estimated_resolution: '',
    dell_support_notes: ''
  });

  // Modelos Dell disponíveis
  const [dellModels, setDellModels] = useState([
    'Dell Latitude 5330'
  ]);
  
  const [showAddModel, setShowAddModel] = useState(false);
  const [newModel, setNewModel] = useState('');

  const statuses = ['Disponível', 'Em Uso', 'Manutenção', 'Descartado'];
  const conditions = ['Excelente', 'Bom', 'Regular', 'Ruim'];

  // =================== EFEITOS ===================
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // =================== FUNÇÕES AUXILIARES ===================
  const getWarrantyStatus = (warrantyEnd) => {
    if (!warrantyEnd) return { status: 'Não informado', color: 'text-gray-600' };
    
    const endDate = new Date(warrantyEnd);
    const today = new Date();
    const daysDiff = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) {
      return { status: 'Vencida', color: 'text-red-600' };
    } else if (daysDiff <= 30) {
      return { status: `Vence em ${daysDiff} dia(s)`, color: 'text-orange-600' };
    } else if (daysDiff <= 90) {
      return { status: `Vence em ${Math.ceil(daysDiff / 30)} mês(es)`, color: 'text-yellow-600' };
    } else {
      return { status: `Vence em ${endDate.toLocaleDateString('pt-BR')}`, color: 'text-green-600' };
    }
  };

  const handleModelChange = (selectedModel) => {
    setLaptopForm(prev => ({
      ...prev,
      model: selectedModel,
      processor: selectedModel === 'Dell Latitude 5330' ? 'Intel Core i7 vPro 12ª Geração' : prev.processor,
      ram: selectedModel === 'Dell Latitude 5330' ? '16GB DDR4' : prev.ram,
      storage: selectedModel === 'Dell Latitude 5330' ? '256GB SSD' : prev.storage
    }));
  };

  const handleAddNewModel = () => {
    if (newModel.trim()) {
      const trimmedModel = newModel.trim();
      if (!dellModels.includes(trimmedModel)) {
        setDellModels(prev => [...prev, trimmedModel]);
        setLaptopForm(prev => ({ ...prev, model: trimmedModel }));
      }
      setNewModel('');
      setShowAddModel(false);
    }
  };

  // =================== FUNÇÕES DE DADOS ===================
  const loadData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('🔄 Carregando dados para usuário:', user.email);
      
      const [laptopsResult, statsResult, dellStatsResult] = await Promise.all([
        dataService.laptops.getAll(),
        dataService.getStatistics(),
        dataService.laptops.getDellSupportStats()
      ]);

      if (laptopsResult.success) {
        setLaptops(laptopsResult.data);
        console.log('✅ Laptops carregados:', laptopsResult.data.length);
      }

      if (statsResult.success) {
        const safeStats = {
          total_laptops: parseInt(statsResult.data.total_laptops) || 0,
          available_laptops: parseInt(statsResult.data.available_laptops) || 0,
          in_use_laptops: parseInt(statsResult.data.in_use_laptops) || 0,
          maintenance_laptops: parseInt(statsResult.data.maintenance_laptops) || 0,
          discarded_laptops: parseInt(statsResult.data.discarded_laptops) || 0,
          total_value: parseFloat(statsResult.data.total_value) || 0,
          avg_condition: parseFloat(statsResult.data.avg_condition) || 0
        };
        setStatistics(safeStats);
        console.log('✅ Estatísticas carregadas:', safeStats);
      }

      if (dellStatsResult.success) {
        const safeDellStats = {
          total_tickets: parseInt(dellStatsResult.data.total_tickets) || 0,
          open_tickets: parseInt(dellStatsResult.data.open_tickets) || 0,
          in_progress_tickets: parseInt(dellStatsResult.data.in_progress_tickets) || 0,
          waiting_parts_tickets: parseInt(dellStatsResult.data.waiting_parts_tickets) || 0,
          closed_tickets: parseInt(dellStatsResult.data.closed_tickets) || 0,
          high_priority_tickets: parseInt(dellStatsResult.data.high_priority_tickets) || 0,
          overdue_tickets: parseInt(dellStatsResult.data.overdue_tickets) || 0
        };
        setDellSupportStats(safeDellStats);
        console.log('✅ Estatísticas Dell carregadas:', safeDellStats);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // =================== FUNÇÕES DE CHAMADOS DELL ===================
  const handleOpenDellSupport = (laptop = null) => {
    const targetLaptop = laptop || (editingLaptop ? { ...editingLaptop, ...laptopForm } : laptopForm);
    setSelectedLaptopForSupport(targetLaptop);
    setShowDellSupportModal(true);
  };

  const handleSaveDellSupport = async (dellSupportData) => {
    try {
      setIsLoading(true);
      
      // Se estamos editando um laptop existente
      if (selectedLaptopForSupport.id) {
        const result = await dataService.laptops.updateDellSupport(
          selectedLaptopForSupport.id,
          dellSupportData,
          user.id
        );
        
        if (result.success) {
          await loadData();
          alert('Chamado Dell atualizado com sucesso!');
        } else {
          alert(`Erro ao atualizar chamado: ${result.error}`);
        }
      } else {
        // Se estamos criando um novo laptop, apenas atualizar o formulário
        setLaptopForm(prev => ({
          ...prev,
          ...dellSupportData
        }));
        alert('Informações do chamado Dell adicionadas ao formulário!');
      }
      
      setShowDellSupportModal(false);
      setSelectedLaptopForSupport(null);
    } catch (error) {
      alert(`Erro ao salvar chamado: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // =================== FUNÇÕES DE FOTO E IA (MANTIDAS IGUAIS) ===================
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

  // =================== FUNÇÕES DE LAPTOPS (ATUALIZADA) ===================
  const handleSaveLaptop = async () => {
    if (!laptopForm.model?.trim() || !laptopForm.service_tag?.trim()) {
      alert('Por favor, preencha o modelo e service tag.');
      return;
    }

    try {
      setIsLoading(true);

      if (!editingLaptop) {
        const tagCheck = await dataService.laptops.checkServiceTagExists(
          laptopForm.service_tag
        );
        if (tagCheck.success && tagCheck.exists) {
          alert('Já existe um laptop com este service tag.');
          return;
        }
      }

      const laptopData = {
        model: laptopForm.model.trim(),
        service_tag: laptopForm.service_tag.trim(),
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
        photo: laptopForm.photo || null,
        damage_analysis: laptopForm.damage_analysis || null,
        purchase_date: laptopForm.purchase_date || null,
        purchase_price: laptopForm.purchase_price ? parseFloat(laptopForm.purchase_price) : null,
        assigned_user: laptopForm.assigned_user?.trim() || null,
        notes: laptopForm.notes?.trim() || null,
        // Novos campos Dell Support
        dell_support_ticket: laptopForm.dell_support_ticket?.trim() || null,
        dell_support_status: laptopForm.dell_support_status || null,
        dell_support_opened_date: laptopForm.dell_support_opened_date || null,
        dell_support_description: laptopForm.dell_support_description?.trim() || null,
        dell_support_priority: laptopForm.dell_support_priority || null,
        dell_support_estimated_resolution: laptopForm.dell_support_estimated_resolution || null,
        dell_support_notes: laptopForm.dell_support_notes?.trim() || null
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
        alert(`Laptop ${editingLaptop ? 'atualizado' : 'criado'} com sucesso!`);
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
      photo: laptop.photo || null,
      damage_analysis: laptop.damage_analysis || null,
      purchase_date: laptop.purchase_date || '',
      purchase_price: laptop.purchase_price || '',
      assigned_user: laptop.assigned_user || '',
      notes: laptop.notes || '',
      // Novos campos Dell Support
      dell_support_ticket: laptop.dell_support_ticket || '',
      dell_support_status: laptop.dell_support_status || 'Aberto',
      dell_support_opened_date: laptop.dell_support_opened_date || '',
      dell_support_description: laptop.dell_support_description || '',
      dell_support_priority: laptop.dell_support_priority || 'Média',
      dell_support_estimated_resolution: laptop.dell_support_estimated_resolution || '',
      dell_support_notes: laptop.dell_support_notes || ''
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
        alert('Laptop excluído com sucesso!');
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
      photo: null,
      damage_analysis: null,
      purchase_date: '',
      purchase_price: '',
      assigned_user: '',
      notes: '',
      dell_support_ticket: '',
      dell_support_status: 'Aberto',
      dell_support_opened_date: '',
      dell_support_description: '',
      dell_support_priority: 'Média',
      dell_support_estimated_resolution: '',
      dell_support_notes: ''
    });
    setShowAddModel(false);
    setNewModel('');
    closeAllPhotoModals();
  };

  const filteredLaptops = laptops.filter(laptop => {
    const matchesSearch = laptop.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         laptop.service_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    const status = getConnectionStatus();
    
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
          {isConnected ? 'Neon' : 'Offline'}
        </span>
      </div>
    );
  };

  const handleLogout = async () => {
    if (confirm('Tem certeza que deseja sair?')) {
      const result = await logout();
      if (result.success) {
        setLaptops([]);
        setStatistics({});
        setDellSupportStats({});
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
                  <p className="text-xs md:text-sm text-gray-500 font-medium">Sistema Corporativo</p>
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
                <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100">
                  <Icons.Phone />
                  <span className="font-semibold text-red-700">{parseInt(dellSupportStats.open_tickets) || 0}</span>
                  <span className="text-red-600">chamados</span>
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
                  Dashboard
                </h2>
                <p className="text-gray-600 mt-2">Visão geral do sistema</p>
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
            
            {/* Estatísticas Dell Support */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 md:p-8 rounded-3xl shadow-lg border border-red-100 hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 mb-2">Chamados Abertos</p>
                    <p className="text-3xl md:text-4xl font-bold text-red-700">{parseInt(dellSupportStats.open_tickets) || 0}</p>
                    <p className="text-xs text-red-500 mt-1">suporte Dell</p>
                  </div>
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-2xl">🔴</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 md:p-8 rounded-3xl shadow-lg border border-yellow-100 hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600 mb-2">Em Andamento</p>
                    <p className="text-3xl md:text-4xl font-bold text-yellow-700">{parseInt(dellSupportStats.in_progress_tickets) || 0}</p>
                    <p className="text-xs text-yellow-500 mt-1">sendo resolvidos</p>
                  </div>
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-2xl">🟡</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-8 rounded-3xl shadow-lg border border-blue-100 hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-2">Aguardando Peças</p>
                    <p className="text-3xl md:text-4xl font-bold text-blue-700">{parseInt(dellSupportStats.waiting_parts_tickets) || 0}</p>
                    <p className="text-xs text-blue-500 mt-1">componentes</p>
                  </div>
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-2xl">🔵</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 md:p-8 rounded-3xl shadow-lg border border-purple-100 hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 mb-2">Alta Prioridade</p>
                    <p className="text-3xl md:text-4xl font-bold text-purple-700">{parseInt(dellSupportStats.high_priority_tickets) || 0}</p>
                    <p className="text-xs text-purple-500 mt-1">críticos</p>
                  </div>
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-2xl">⚡</span>
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

        {/* Laptops */}
        {activeTab === 'laptops' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-900 via-pink-800 to-indigo-900 bg-clip-text text-transparent">
                  Laptops
                </h2>
                <p className="text-gray-600 mt-2">Gerenciar equipamentos</p>
              </div>
              <button
                onClick={() => {
                  resetLaptopForm();
                  setShowLaptopForm(true);
                }}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Icons.Plus />
                <span>Novo Laptop</span>
              </button>
            </div>

            {/* Barra de pesquisa */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
              <div className="relative">
                <Icons.Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por modelo, service tag ou usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Lista de laptops */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredLaptops.map((laptop) => (
                <div key={laptop.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/40 hover:shadow-lg transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icons.Laptop />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{laptop.model}</h3>
                        <p className="text-sm text-gray-600">{laptop.service_tag}</p>
                        {laptop.created_by_name && (
                          <p className="text-xs text-gray-500">Por: {laptop.created_by_name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowLaptopDetail(laptop)}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                        title="Ver detalhes"
                      >
                        <Icons.Eye />
                      </button>
                      <button
                        onClick={() => handleEditLaptop(laptop)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Editar"
                      >
                        <Icons.Edit />
                      </button>
                      <button
                        onClick={() => handleDeleteLaptop(laptop.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Excluir"
                      >
                        <Icons.Trash2 />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status:</span>
                      <StatusBadge status={laptop.status} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Condição:</span>
                      <ConditionBadge condition={laptop.condition} score={laptop.condition_score} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Garantia:</span>
                      <div className="flex items-center space-x-1">
                        <Icons.Calendar className="w-3 h-3" />
                        <span className={`text-sm font-medium ${getWarrantyStatus(laptop.warranty_end).color}`}>
                          {getWarrantyStatus(laptop.warranty_end).status}
                        </span>
                      </div>
                    </div>
                    {laptop.assigned_user && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Usuário:</span>
                        <span className="text-sm font-medium text-gray-900">{laptop.assigned_user}</span>
                      </div>
                    )}
                    {laptop.dell_support_ticket && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Chamado Dell:</span>
                        <DellSupportBadge laptop={laptop} />
                      </div>
                    )}
                  </div>

                  {laptop.photo && (
                    <div className="mt-4">
                      <img
                        src={laptop.photo}
                        alt="Foto do laptop"
                        className="w-full h-32 object-cover rounded-xl border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredLaptops.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Icons.Laptop className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum laptop encontrado</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? 'Tente ajustar os filtros de pesquisa' : 'Seja o primeiro a adicionar um laptop'}
                </p>
                <button
                  onClick={() => {
                    resetLaptopForm();
                    setShowLaptopForm(true);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Adicionar Primeiro Laptop
                </button>
              </div>
            )}
          </div>
        )}

        {/* Relatórios */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-900 via-red-800 to-pink-900 bg-clip-text text-transparent">
                Relatórios
              </h2>
              <p className="text-gray-600 mt-2">Análises e estatísticas</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Garantias</h3>
                  <Icons.Calendar className="text-orange-600" />
                </div>
                <div className="space-y-3">
                  {(() => {
                    const warrantyStats = {
                      vencidas: 0,
                      vencendo: 0,
                      ativas: 0,
                      naoInformado: 0
                    };
                    
                    laptops.forEach(laptop => {
                      const status = getWarrantyStatus(laptop.warranty_end);
                      if (status.status === 'Não informado') {
                        warrantyStats.naoInformado++;
                      } else if (status.status === 'Vencida') {
                        warrantyStats.vencidas++;
                      } else if (status.status.includes('Vence em') && (status.status.includes('dia') || status.status.includes('mês'))) {
                        warrantyStats.vencendo++;
                      } else {
                        warrantyStats.ativas++;
                      }
                    });
                    
                    return (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Vencidas:</span>
                          <span className="font-bold text-red-600">{warrantyStats.vencidas}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Vencendo em breve:</span>
                          <span className="font-bold text-orange-600">{warrantyStats.vencendo}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Ativas:</span>
                          <span className="font-bold text-green-600">{warrantyStats.ativas}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Não informado:</span>
                          <span className="font-bold text-gray-600">{warrantyStats.naoInformado}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
              <h3 className="font-bold text-gray-900 mb-4">Laptops por Status</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-600">Modelo</th>
                      <th className="text-left py-2 text-gray-600">Service Tag</th>
                      <th className="text-center py-2 text-gray-600">Status</th>
                      <th className="text-center py-2 text-gray-600">Condição</th>
                      <th className="text-center py-2 text-gray-600">Garantia</th>
                      <th className="text-center py-2 text-gray-600">Chamado Dell</th>
                      <th className="text-left py-2 text-gray-600">Usuário</th>
                    </tr>
                  </thead>
                  <tbody>
                    {laptops.map((laptop) => (
                      <tr key={laptop.id} className="border-b border-gray-100">
                        <td className="py-2 font-medium text-gray-900">{laptop.model}</td>
                        <td className="py-2 text-gray-700">{laptop.service_tag}</td>
                        <td className="py-2 text-center">
                          <StatusBadge status={laptop.status} />
                        </td>
                        <td className="py-2 text-center">
                          <ConditionBadge condition={laptop.condition} score={laptop.condition_score} />
                        </td>
                        <td className="py-2 text-center">
                          <span className={`text-xs font-medium ${getWarrantyStatus(laptop.warranty_end).color}`}>
                            {getWarrantyStatus(laptop.warranty_end).status}
                          </span>
                        </td>
                        <td className="py-2 text-center">
                          {laptop.dell_support_ticket ? (
                            <DellSupportBadge laptop={laptop} />
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-2 text-gray-700">{laptop.assigned_user || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Formulário de Laptop */}
      {showLaptopForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingLaptop ? 'Editar Laptop' : 'Novo Laptop'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {editingLaptop ? 'Atualizar informações' : 'Cadastrar novo equipamento'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowLaptopForm(false);
                  setEditingLaptop(null);
                  resetLaptopForm();
                }}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
              >
                <Icons.X />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveLaptop(); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Modelo Dell *
                  </label>
                  <div className="space-y-2">
                    <select
                      value={laptopForm.model}
                      onChange={(e) => handleModelChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Selecione o modelo</option>
                      {dellModels.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                    
                    {!showAddModel ? (
                      <button
                        type="button"
                        onClick={() => setShowAddModel(true)}
                        className="w-full px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all text-sm"
                      >
                        + Adicionar Novo Modelo
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newModel}
                          onChange={(e) => setNewModel(e.target.value)}
                          placeholder="Digite o novo modelo..."
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                        <button
                          type="button"
                          onClick={handleAddNewModel}
                          className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all text-sm"
                        >
                          Adicionar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddModel(false);
                            setNewModel('');
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Service Tag *
                  </label>
                  <input
                    type="text"
                    value={laptopForm.service_tag}
                    onChange={(e) => setLaptopForm(prev => ({ ...prev, service_tag: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Digite o service tag"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Processador
                    {laptopForm.model === 'Dell Latitude 5330' && <span className="text-purple-600 text-xs ml-1">(Auto-preenchido)</span>}
                  </label>
                  <input
                    type="text"
                    value={laptopForm.processor}
                    onChange={(e) => setLaptopForm(prev => ({ ...prev, processor: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Ex: Intel Core i7-11800H"
                    readOnly={laptopForm.model === 'Dell Latitude 5330'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Memória RAM
                    {laptopForm.model === 'Dell Latitude 5330' && <span className="text-purple-600 text-xs ml-1">(Auto-preenchido)</span>}
                  </label>
                  <input
                    type="text"
                    value={laptopForm.ram}
                    onChange={(e) => setLaptopForm(prev => ({ ...prev, ram: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Ex: 16GB DDR4"
                    readOnly={laptopForm.model === 'Dell Latitude 5330'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Armazenamento
                    {laptopForm.model === 'Dell Latitude 5330' && <span className="text-purple-600 text-xs ml-1">(Auto-preenchido)</span>}
                  </label>
                  <input
                    type="text"
                    value={laptopForm.storage}
                    onChange={(e) => setLaptopForm(prev => ({ ...prev, storage: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Ex: 512GB SSD"
                    readOnly={laptopForm.model === 'Dell Latitude 5330'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={laptopForm.status}
                    onChange={(e) => setLaptopForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Condição
                  </label>
                  <select
                    value={laptopForm.condition}
                    onChange={(e) => setLaptopForm(prev => ({ ...prev, condition: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    {conditions.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Usuário Responsável
                  </label>
                  <input
                    type="text"
                    value={laptopForm.assigned_user}
                    onChange={(e) => setLaptopForm(prev => ({ ...prev, assigned_user: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Nome do usuário responsável"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Data de Compra
                  </label>
                  <input
                    type="date"
                    value={laptopForm.purchase_date}
                    onChange={(e) => setLaptopForm(prev => ({ ...prev, purchase_date: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Preço de Compra (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={laptopForm.purchase_price}
                    onChange={(e) => setLaptopForm(prev => ({ ...prev, purchase_price: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Fim da Garantia
                  </label>
                  <input
                    type="date"
                    value={laptopForm.warranty_end}
                    onChange={(e) => setLaptopForm(prev => ({ ...prev, warranty_end: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={laptopForm.notes}
                  onChange={(e) => setLaptopForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  rows="3"
                  placeholder="Observações adicionais..."
                ></textarea>
              </div>

              {/* Campos de Manutenção */}
              <MaintenanceFields 
                laptopForm={laptopForm}
                setLaptopForm={setLaptopForm}
                onOpenDellSupport={() => handleOpenDellSupport()}
              />

              {/* Foto do laptop */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Foto do Laptop
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6">
                  {laptopForm.photo ? (
                    <div className="relative">
                      <img
                        src={laptopForm.photo}
                        alt="Foto do laptop"
                        className="w-full h-64 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={removePhotoFromForm}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                      >
                        <Icons.X />
                      </button>
                      {laptopForm.damage_analysis && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                          <h4 className="font-bold text-blue-900 mb-2">Análise de IA</h4>
                          <p className="text-sm text-blue-800">
                            Condição: {laptopForm.damage_analysis.overall_condition} 
                            ({laptopForm.damage_analysis.confidence}% confiança)
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <Icons.Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Adicione uma foto do laptop</p>
                      <button
                        type="button"
                        onClick={openPhotoOptions}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all"
                      >
                        Adicionar Foto
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowLaptopForm(false);
                    setEditingLaptop(null);
                    resetLaptopForm();
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Salvando...' : editingLaptop ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Chamado Dell */}
      <DellSupportModal
        laptop={selectedLaptopForSupport}
        isOpen={showDellSupportModal}
        onClose={() => {
          setShowDellSupportModal(false);
          setSelectedLaptopForSupport(null);
        }}
        onSave={handleSaveDellSupport}
      />

      {/* Modal de Opções de Foto */}
      {photoState.showOptions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Adicionar Foto</h2>
              <button
                onClick={closeAllPhotoModals}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
              >
                <Icons.X />
              </button>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleTakePhoto}
                className="w-full flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl hover:from-blue-100 hover:to-indigo-100 transition-all"
              >
                <Icons.Camera className="text-blue-600" />
                <span className="font-medium text-blue-800">Tirar Foto</span>
              </button>

              <button
                onClick={handleSelectFromGallery}
                className="w-full flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl hover:from-green-100 hover:to-emerald-100 transition-all"
              >
                <Icons.Plus className="text-green-600" />
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

      {/* Modal de Preview da Foto */}
      {photoState.showPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Confirmar Foto</h2>
              <button
                onClick={closeAllPhotoModals}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
              >
                <Icons.X />
              </button>
            </div>

            {photoState.capturedPhoto && (
              <div className="space-y-6">
                <div className="relative">
                  <img
                    src={photoState.capturedPhoto}
                    alt="Preview da foto"
                    className="w-full h-64 object-cover rounded-xl"
                  />
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
                  <button
                    onClick={retakePhoto}
                    disabled={photoState.isAnalyzing}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tirar Novamente
                  </button>
                  <button
                    onClick={confirmPhotoWithAI}
                    disabled={photoState.isAnalyzing}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {photoState.isAnalyzing ? 'Analisando...' : 'Confirmar e Analisar'}
                  </button>
                </div>

                {photoState.error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <p className="text-red-700 text-sm">{photoState.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Laptop */}
      {showLaptopDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Detalhes do Laptop</h2>
                {showLaptopDetail.created_by_name && (
                  <p className="text-sm text-gray-600 mt-1">
                    Criado por: {showLaptopDetail.created_by_name}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowLaptopDetail(null)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
              >
                <Icons.X />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Informações Básicas</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Modelo:</span>
                      <span className="font-medium">{showLaptopDetail.model}</span>
                    </div>
                    {showLaptopDetail.service_tag && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Tag:</span>
                        <span className="font-medium">{showLaptopDetail.service_tag}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <StatusBadge status={showLaptopDetail.status} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Condição:</span>
                      <ConditionBadge condition={showLaptopDetail.condition} score={showLaptopDetail.condition_score} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Garantia:</span>
                      <div className="flex items-center space-x-1">
                        <Icons.Calendar className="w-4 h-4" />
                        <span className={`font-medium ${getWarrantyStatus(showLaptopDetail.warranty_end).color}`}>
                          {getWarrantyStatus(showLaptopDetail.warranty_end).status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {(showLaptopDetail.processor || showLaptopDetail.ram || showLaptopDetail.storage) && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">Especificações Técnicas</h3>
                    <div className="space-y-3">
                      {showLaptopDetail.processor && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Processador:</span>
                          <span className="font-medium">{showLaptopDetail.processor}</span>
                        </div>
                      )}
                      {showLaptopDetail.ram && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">RAM:</span>
                          <span className="font-medium">{showLaptopDetail.ram}</span>
                        </div>
                      )}
                      {showLaptopDetail.storage && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Armazenamento:</span>
                          <span className="font-medium">{showLaptopDetail.storage}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {showLaptopDetail.assigned_user && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">Usuário Responsável</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Usuário:</span>
                        <span className="font-medium">{showLaptopDetail.assigned_user}</span>
                      </div>
                    </div>
                  </div>
                )}

                {showLaptopDetail.dell_support_ticket && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">Chamado Dell</h3>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-blue-600">Número:</span>
                          <span className="font-medium text-blue-800">{showLaptopDetail.dell_support_ticket}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">Status:</span>
                          <DellSupportBadge laptop={showLaptopDetail} />
                        </div>
                        {showLaptopDetail.dell_support_priority && (
                          <div className="flex justify-between">
                            <span className="text-blue-600">Prioridade:</span>
                            <span className="font-medium text-blue-800">{showLaptopDetail.dell_support_priority}</span>
                          </div>
                        )}
                        {showLaptopDetail.dell_support_opened_date && (
                          <div className="flex justify-between">
                            <span className="text-blue-600">Aberto em:</span>
                            <span className="font-medium text-blue-800">
                              {new Date(showLaptopDetail.dell_support_opened_date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                        {showLaptopDetail.dell_support_description && (
                          <div className="mt-3">
                            <p className="text-blue-600 text-sm font-medium mb-1">Descrição:</p>
                            <p className="text-blue-800 text-sm">{showLaptopDetail.dell_support_description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {showLaptopDetail.photo && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">Foto</h3>
                    <img
                      src={showLaptopDetail.photo}
                      alt="Foto do laptop"
                      className="w-full h-64 object-cover rounded-xl border border-gray-200"
                    />
                  </div>
                )}

                {showLaptopDetail.damage_analysis && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">Análise de IA</h3>
                    <div className="bg-blue-50 rounded-2xl p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-blue-600">Condição:</span>
                          <span className="font-medium text-blue-800">{showLaptopDetail.damage_analysis.overall_condition}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">Confiança:</span>
                          <span className="font-medium text-blue-800">{showLaptopDetail.damage_analysis.confidence}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">Score de Dano:</span>
                          <span className="font-medium text-blue-800">{showLaptopDetail.damage_analysis.damage_score}</span>
                        </div>
                      </div>
                      
                      {showLaptopDetail.damage_analysis.damages && showLaptopDetail.damage_analysis.damages.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium text-blue-900 mb-2">Danos Identificados:</h4>
                          <div className="space-y-2">
                            {showLaptopDetail.damage_analysis.damages.map((damage, index) => (
                              <div key={index} className="bg-blue-100 rounded-xl p-3">
                                <div className="flex justify-between items-start">
                                  <span className="font-medium text-blue-900">{damage.type}</span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    damage.severity === 'Grave' ? 'bg-red-100 text-red-700' :
                                    damage.severity === 'Moderado' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {damage.severity}
                                  </span>
                                </div>
                                <p className="text-sm text-blue-700 mt-1">{damage.location}</p>
                                <p className="text-xs text-blue-600 mt-1">{damage.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {showLaptopDetail.damage_analysis.recommendations && showLaptopDetail.damage_analysis.recommendations.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium text-blue-900 mb-2">Recomendações:</h4>
                          <ul className="space-y-1">
                            {showLaptopDetail.damage_analysis.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm text-blue-700">• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {showLaptopDetail.notes && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">Observações</h3>
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-gray-700">{showLaptopDetail.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowLaptopDetail(null)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  handleEditLaptop(showLaptopDetail);
                  setShowLaptopDetail(null);
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                Editar
              </button>
              {showLaptopDetail.status === 'Manutenção' && (
                <button
                  onClick={() => {
                    handleOpenDellSupport(showLaptopDetail);
                    setShowLaptopDetail(null);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl hover:from-red-700 hover:to-pink-700 transition-all"
                >
                  Gerenciar Chamado Dell
                </button>
              )}
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

// =================== COMPONENTE PRINCIPAL COM PROVIDER (INALTERADO) ===================
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent = () => {
  const { user, loading, isInitialized, connectionStatus, login } = useAuth();

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

export default App; border border-white/40">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Estatísticas Gerais</h3>
                  <Icons.BarChart3 className="text-blue-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total de Laptops:</span>
                    <span className="font-bold text-blue-600">{statistics.total_laptops || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Disponíveis:</span>
                    <span className="font-bold text-green-600">{statistics.available_laptops || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Em Uso:</span>
                    <span className="font-bold text-blue-600">{statistics.in_use_laptops || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Em Manutenção:</span>
                    <span className="font-bold text-orange-600">{statistics.maintenance_laptops || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Chamados Dell</h3>
                  <Icons.Phone className="text-red-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total de Chamados:</span>
                    <span className="font-bold text-blue-600">{dellSupportStats.total_tickets || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Abertos:</span>
                    <span className="font-bold text-red-600">{dellSupportStats.open_tickets || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Em Andamento:</span>
                    <span className="font-bold text-yellow-600">{dellSupportStats.in_progress_tickets || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fechados:</span>
                    <span className="font-bold text-green-600">{dellSupportStats.closed_tickets || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6dellSupportForm.dell_support_description}
              onChange={(e) => setDellSupportForm(prev => ({ ...prev, dell_support_description: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              rows="3"
              placeholder="Descreva o problema reportado..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Anotações do Chamado
            </label>
            <textarea
              value={
