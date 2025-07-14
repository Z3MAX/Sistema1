import React, { useState, useRef, useEffect } from 'react';

// =================== COMPONENTE DE AUTENTICAÇÃO ===================
const AuthComponent = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email e senha são obrigatórios');
      return false;
    }

    if (!isLogin) {
      if (!formData.name || !formData.company) {
        setError('Nome e empresa são obrigatórios');
        return false;
      }
      
      if (formData.password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const existingUsers = JSON.parse(localStorage.getItem('dellUsers') || '[]');
        const user = existingUsers.find(u => u.email === formData.email);
        
        if (user && user.password === formData.password) {
          onLogin(user);
        } else {
          const demoUser = {
            id: Date.now(),
            email: formData.email,
            name: 'Usuário Demo',
            company: 'Dell Technologies',
            password: formData.password
          };
          
          existingUsers.push(demoUser);
          localStorage.setItem('dellUsers', JSON.stringify(existingUsers));
          onLogin(demoUser);
        }
      } else {
        const existingUsers = JSON.parse(localStorage.getItem('dellUsers') || '[]');
        
        if (existingUsers.some(u => u.email === formData.email)) {
          setError('Email já cadastrado');
          return;
        }
        
        const newUser = {
          id: Date.now(),
          email: formData.email,
          name: formData.name,
          company: formData.company,
          password: formData.password
        };
        
        existingUsers.push(newUser);
        localStorage.setItem('dellUsers', JSON.stringify(existingUsers));
        
        setSuccess('Conta criada com sucesso! Fazendo login...');
        
        setTimeout(() => {
          onLogin(newUser);
        }, 1000);
      }
    } catch (error) {
      console.error('Erro na autenticação:', error);
      setError('Erro interno. Usando modo demonstração.');
      
      setTimeout(() => {
        const demoUser = {
          id: 1,
          email: formData.email,
          name: isLogin ? 'Usuário Demo' : formData.name,
          company: isLogin ? 'Dell Technologies' : formData.company
        };
        onLogin(demoUser);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Logo e Título */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent">
              Dell Laptop Manager
            </h1>
            <p className="text-gray-600 mt-2 font-medium">
              {isLogin ? 'Faça login para continuar' : 'Crie sua conta'}
            </p>
          </div>

          {/* Mensagens de erro e sucesso */}
          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl">
              <p className="text-red-700 font-medium text-sm">❌ {error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
              <p className="text-green-700 font-medium text-sm">✅ {success}</p>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome - apenas no cadastro */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                    placeholder="Digite seu nome completo"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                  placeholder="Digite seu email"
                  required
                />
              </div>
            </div>

            {/* Empresa - apenas no cadastro */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Empresa
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                    placeholder="Digite o nome da empresa"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Senha */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M18.364 18.364L16.95 16.95M18.364 18.364L20.05 20.05M16.95 16.95L13.414 13.414" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar Senha - apenas no cadastro */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                    placeholder="Confirme sua senha"
                    required={!isLogin}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M18.364 18.364L16.95 16.95M18.364 18.364L20.05 20.05M16.95 16.95L13.414 13.414" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Botão de submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-4 rounded-2xl transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{isLogin ? 'Entrando...' : 'Criando conta...'}</span>
                </div>
              ) : (
                <span>{isLogin ? '🚀 Fazer Login' : '✨ Criar Conta'}</span>
              )}
            </button>
          </form>

          {/* Link para alternar entre login e cadastro */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600 font-medium">
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            </p>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
                setFormData({
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  company: ''
                });
              }}
              className="mt-2 text-blue-600 hover:text-blue-800 font-bold transition-colors"
            >
              {isLogin ? '📝 Criar nova conta' : '🔐 Fazer login'}
            </button>
          </div>
        </div>

        {/* Informações sobre o sistema */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            Sistema de Controle de Laptops Dell com IA
          </p>
          <p className="text-xs mt-2">
            Versão 2.0 - Funciona totalmente no navegador
          </p>
        </div>
      </div>
    </div>
  );
};

// =================== SIMULAÇÃO DE SERVIÇOS ===================
const dataService = {
  laptops: {
    getAll: async (userId) => {
      const laptops = JSON.parse(localStorage.getItem(`laptops_${userId}`) || '[]');
      return { success: true, data: laptops };
    },
    
    create: async (laptopData, userId) => {
      const laptops = JSON.parse(localStorage.getItem(`laptops_${userId}`) || '[]');
      const newLaptop = {
        id: Date.now(),
        ...laptopData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      laptops.push(newLaptop);
      localStorage.setItem(`laptops_${userId}`, JSON.stringify(laptops));
      return { success: true, data: newLaptop };
    },
    
    update: async (id, updates, userId) => {
      const laptops = JSON.parse(localStorage.getItem(`laptops_${userId}`) || '[]');
      const index = laptops.findIndex(l => l.id === id);
      if (index !== -1) {
        laptops[index] = { ...laptops[index], ...updates, updated_at: new Date().toISOString() };
        localStorage.setItem(`laptops_${userId}`, JSON.stringify(laptops));
        return { success: true, data: laptops[index] };
      }
      return { success: false, error: 'Laptop não encontrado' };
    },
    
    delete: async (id, userId) => {
      const laptops = JSON.parse(localStorage.getItem(`laptops_${userId}`) || '[]');
      const filtered = laptops.filter(l => l.id !== id);
      localStorage.setItem(`laptops_${userId}`, JSON.stringify(filtered));
      return { success: true };
    }
  },
  
  floors: {
    getAll: async (userId) => {
      const floors = JSON.parse(localStorage.getItem(`floors_${userId}`) || '[]');
      return { success: true, data: floors };
    },
    
    create: async (floorData, userId) => {
      const floors = JSON.parse(localStorage.getItem(`floors_${userId}`) || '[]');
      const newFloor = {
        id: Date.now(),
        ...floorData,
        rooms: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      floors.push(newFloor);
      localStorage.setItem(`floors_${userId}`, JSON.stringify(floors));
      return { success: true, data: newFloor };
    },
    
    update: async (id, updates, userId) => {
      const floors = JSON.parse(localStorage.getItem(`floors_${userId}`) || '[]');
      const index = floors.findIndex(f => f.id === id);
      if (index !== -1) {
        floors[index] = { ...floors[index], ...updates, updated_at: new Date().toISOString() };
        localStorage.setItem(`floors_${userId}`, JSON.stringify(floors));
        return { success: true, data: floors[index] };
      }
      return { success: false, error: 'Andar não encontrado' };
    },
    
    delete: async (id, userId) => {
      const floors = JSON.parse(localStorage.getItem(`floors_${userId}`) || '[]');
      const filtered = floors.filter(f => f.id !== id);
      localStorage.setItem(`floors_${userId}`, JSON.stringify(filtered));
      return { success: true };
    }
  },
  
  rooms: {
    create: async (roomData, userId) => {
      const floors = JSON.parse(localStorage.getItem(`floors_${userId}`) || '[]');
      const floorIndex = floors.findIndex(f => f.id === roomData.floor_id);
      if (floorIndex !== -1) {
        const newRoom = {
          id: Date.now(),
          ...roomData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        floors[floorIndex].rooms.push(newRoom);
        localStorage.setItem(`floors_${userId}`, JSON.stringify(floors));
        return { success: true, data: newRoom };
      }
      return { success: false, error: 'Andar não encontrado' };
    },
    
    update: async (id, updates, userId) => {
      const floors = JSON.parse(localStorage.getItem(`floors_${userId}`) || '[]');
      for (let floor of floors) {
        const roomIndex = floor.rooms.findIndex(r => r.id === id);
        if (roomIndex !== -1) {
          floor.rooms[roomIndex] = { ...floor.rooms[roomIndex], ...updates, updated_at: new Date().toISOString() };
          localStorage.setItem(`floors_${userId}`, JSON.stringify(floors));
          return { success: true, data: floor.rooms[roomIndex] };
        }
      }
      return { success: false, error: 'Sala não encontrada' };
    },
    
    delete: async (id, userId) => {
      const floors = JSON.parse(localStorage.getItem(`floors_${userId}`) || '[]');
      for (let floor of floors) {
        floor.rooms = floor.rooms.filter(r => r.id !== id);
      }
      localStorage.setItem(`floors_${userId}`, JSON.stringify(floors));
      return { success: true };
    }
  }
};

// Simulação de análise de IA
const AIAnalysisService = {
  async analyzeLaptopDamage(imageData) {
    // Simular delay da análise
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
      },
      {
        overall_condition: 'Regular',
        damage_score: 45,
        confidence: 85,
        damages: [
          { type: 'Riscos visíveis', location: 'Carcaça', severity: 'Moderado', description: 'Riscos visíveis na carcaça lateral' },
          { type: 'Desgaste acentuado', location: 'Teclado', severity: 'Moderado', description: 'Teclas com desgaste acentuado' },
          { type: 'Manchas na tela', location: 'Tela', severity: 'Leve', description: 'Pequenas manchas na tela' }
        ],
        recommendations: [
          'Necessária manutenção preventiva',
          'Considerar troca do teclado',
          'Limpeza profunda da tela'
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

const dellModelsConfig = {
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

// =================== DADOS INICIAIS ===================
const initializeUserData = (userId) => {
  const floorsKey = `floors_${userId}`;
  const laptopsKey = `laptops_${userId}`;
  
  if (!localStorage.getItem(floorsKey)) {
    const defaultFloors = [
      {
        id: 1,
        name: 'Térreo',
        description: 'Recepção e atendimento',
        rooms: [
          { id: 1, name: 'Recepção', description: 'Área de atendimento ao cliente' },
          { id: 2, name: 'Sala de Suporte', description: 'Suporte técnico' }
        ]
      },
      {
        id: 2,
        name: '1º Andar',
        description: 'Área administrativa',
        rooms: [
          { id: 3, name: 'Escritório Admin', description: 'Administração' },
          { id: 4, name: 'Sala de TI', description: 'Departamento de TI' }
        ]
      }
    ];
    localStorage.setItem(floorsKey, JSON.stringify(defaultFloors));
  }
  
  if (!localStorage.getItem(laptopsKey)) {
    localStorage.setItem(laptopsKey, JSON.stringify([]));
  }
};

// =================== COMPONENTE PRINCIPAL ===================
const MainApp = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('laptops');
  const [laptops, setLaptops] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para modais
  const [showAddLaptop, setShowAddLaptop] = useState(false);
  const [showAddFloor, setShowAddFloor] = useState(false);
  const [showLaptopDetails, setShowLaptopDetails] = useState(false);
  const [selectedLaptop, setSelectedLaptop] = useState(null);
  const [editingLaptop, setEditingLaptop] = useState(null);
  const [editingFloor, setEditingFloor] = useState(null);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [floorFilter, setFloorFilter] = useState('');
  
  // Carregar dados iniciais
  useEffect(() => {
    if (user?.id) {
      initializeUserData(user.id);
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [laptopsResult, floorsResult] = await Promise.all([
        dataService.laptops.getAll(user.id),
        dataService.floors.getAll(user.id)
      ]);
      
      if (laptopsResult.success) {
        setLaptops(laptopsResult.data);
      }
      
      if (floorsResult.success) {
        setFloors(floorsResult.data);
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const filteredLaptops = laptops.filter(laptop => {
    const matchesSearch = laptop.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         laptop.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (laptop.assigned_user && laptop.assigned_user.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || laptop.status === statusFilter;
    const matchesFloor = !floorFilter || laptop.floor_id === parseInt(floorFilter);
    
    return matchesSearch && matchesStatus && matchesFloor;
  });

  const handleAddLaptop = async (laptopData) => {
    try {
      const result = await dataService.laptops.create(laptopData, user.id);
      
      if (result.success) {
        setLaptops(prev => [result.data, ...prev]);
        setShowAddLaptop(false);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Erro ao adicionar laptop:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  };

  const handleEditLaptop = async (laptopData) => {
    try {
      const result = await dataService.laptops.update(editingLaptop.id, laptopData, user.id);
      
      if (result.success) {
        setLaptops(prev => prev.map(laptop => 
          laptop.id === editingLaptop.id ? result.data : laptop
        ));
        setEditingLaptop(null);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Erro ao editar laptop:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  };

  const handleDeleteLaptop = async (laptopId) => {
    if (!confirm('Tem certeza que deseja excluir este laptop?')) return;
    
    try {
      const result = await dataService.laptops.delete(laptopId, user.id);
      
      if (result.success) {
        setLaptops(prev => prev.filter(laptop => laptop.id !== laptopId));
      } else {
        alert('Erro ao excluir laptop: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao deletar laptop:', error);
      alert('Erro interno do servidor');
    }
  };

  const handleAddFloor = async (floorData) => {
    try {
      const result = await dataService.floors.create(floorData, user.id);
      
      if (result.success) {
        setFloors(prev => [...prev, result.data]);
        setShowAddFloor(false);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Erro ao adicionar andar:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  };

  const handleLogout = async () => {
    if (confirm('Tem certeza que deseja sair?')) {
      onLogout();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  Dell Laptop Manager
                </h1>
                <p className="text-sm text-gray-600">
                  Olá, {user.name} - {user.company}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white/60 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('laptops')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'laptops'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              💻 Laptops
            </button>
            <button
              onClick={() => setActiveTab('locations')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'locations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🏢 Localizações
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Relatórios
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {activeTab === 'laptops' && (
          <LaptopsTab 
            laptops={filteredLaptops}
            floors={floors}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            floorFilter={floorFilter}
            setFloorFilter={setFloorFilter}
            onAddLaptop={() => setShowAddLaptop(true)}
            onEditLaptop={setEditingLaptop}
            onDeleteLaptop={handleDeleteLaptop}
            onViewDetails={(laptop) => {
              setSelectedLaptop(laptop);
              setShowLaptopDetails(true);
            }}
          />
        )}

        {activeTab === 'locations' && (
          <LocationsTab 
            floors={floors}
            onAddFloor={() => setShowAddFloor(true)}
            onEditFloor={setEditingFloor}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsTab 
            laptops={laptops}
            floors={floors}
          />
        )}
      </main>

      {/* Modais */}
      {showAddLaptop && (
        <LaptopModal
          isOpen={showAddLaptop}
          onClose={() => setShowAddLaptop(false)}
          onSubmit={handleAddLaptop}
          floors={floors}
          title="Adicionar Novo Laptop"
        />
      )}

      {editingLaptop && (
        <LaptopModal
          isOpen={!!editingLaptop}
          onClose={() => setEditingLaptop(null)}
          onSubmit={handleEditLaptop}
          floors={floors}
          initialData={editingLaptop}
          title="Editar Laptop"
        />
      )}

      {showAddFloor && (
        <FloorModal
          isOpen={showAddFloor}
          onClose={() => setShowAddFloor(false)}
          onSubmit={handleAddFloor}
          title="Adicionar Novo Andar"
        />
      )}

      {showLaptopDetails && selectedLaptop && (
        <LaptopDetailsModal
          isOpen={showLaptopDetails}
          onClose={() => {
            setShowLaptopDetails(false);
            setSelectedLaptop(null);
          }}
          laptop={selectedLaptop}
          floors={floors}
        />
      )}
    </div>
  );
};

// =================== COMPONENTES DE ABAS ===================

// Componente da aba de laptops
const LaptopsTab = ({ 
  laptops, 
  floors, 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter, 
  floorFilter, 
  setFloorFilter, 
  onAddLaptop, 
  onEditLaptop, 
  onDeleteLaptop, 
  onViewDetails 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Disponível': return 'bg-green-100 text-green-800';
      case 'Em Uso': return 'bg-blue-100 text-blue-800';
      case 'Manutenção': return 'bg-yellow-100 text-yellow-800';
      case 'Descartado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'Excelente': return 'text-green-600';
      case 'Bom': return 'text-blue-600';
      case 'Regular': return 'text-yellow-600';
      case 'Ruim': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getFloorName = (floorId) => {
    const floor = floors.find(f => f.id === floorId);
    return floor ? floor.name : 'Não definido';
  };

  const getRoomName = (floorId, roomId) => {
    const floor = floors.find(f => f.id === floorId);
    if (!floor) return 'Não definido';
    const room = floor.rooms.find(r => r.id === roomId);
    return room ? room.name : 'Não definido';
  };

  return (
    <div className="space-y-6">
      {/* Filtros e Busca */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por modelo, serial ou usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
            >
              <option value="">Todos os status</option>
              <option value="Disponível">Disponível</option>
              <option value="Em Uso">Em Uso</option>
              <option value="Manutenção">Manutenção</option>
              <option value="Descartado">Descartado</option>
            </select>
            
            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
            >
              <option value="">Todos os andares</option>
              {floors.map(floor => (
                <option key={floor.id} value={floor.id}>
                  {floor.name}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={onAddLaptop}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Novo Laptop</span>
          </button>
        </div>
      </div>

      {/* Lista de Laptops */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {laptops.map(laptop => (
          <div key={laptop.id} className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {laptop.model}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  S/N: {laptop.serial_number}
                </p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(laptop.status)}`}>
                  {laptop.status}
                </span>
              </div>
              
              {laptop.photo && (
                <img 
                  src={laptop.photo} 
                  alt={laptop.model}
                  className="w-16 h-16 object-cover rounded-2xl ml-4"
                />
              )}
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Condição:</span>
                <span className={`text-sm font-medium ${getConditionColor(laptop.condition)}`}>
                  {laptop.condition}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Andar:</span>
                <span className="text-sm font-medium text-gray-900">
                  {getFloorName(laptop.floor_id)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sala:</span>
                <span className="text-sm font-medium text-gray-900">
                  {getRoomName(laptop.floor_id, laptop.room_id)}
                </span>
              </div>
              
              {laptop.assigned_user && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Usuário:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {laptop.assigned_user}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => onViewDetails(laptop)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  title="Ver detalhes"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  onClick={() => onEditLaptop(laptop)}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                  title="Editar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDeleteLaptop(laptop.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Excluir"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              {laptop.condition_score && (
                <div className="text-right">
                  <div className="text-xs text-gray-500">Score</div>
                  <div className="text-sm font-bold text-gray-900">
                    {laptop.condition_score}%
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {laptops.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum laptop encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            Comece adicionando seu primeiro laptop ao sistema.
          </p>
          <button
            onClick={onAddLaptop}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Adicionar Laptop</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Componente da aba de localizações
const LocationsTab = ({ floors, onAddFloor, onEditFloor }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Andares e Salas
        </h2>
        <button
          onClick={onAddFloor}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg hover:shadow-xl"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Novo Andar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {floors.map(floor => (
          <div key={floor.id} className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {floor.name}
                </h3>
                {floor.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {floor.description}
                  </p>
                )}
                <span className="text-xs text-gray-500">
                  {floor.rooms.length} sala(s)
                </span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => onEditFloor(floor)}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                  title="Editar andar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              {floor.rooms.map(room => (
                <div key={room.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{room.name}</div>
                    {room.description && (
                      <div className="text-sm text-gray-600">{room.description}</div>
                    )}
                  </div>
                </div>
              ))}
              
              {floor.rooms.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">Nenhuma sala cadastrada</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {floors.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum andar cadastrado
          </h3>
          <p className="text-gray-600 mb-4">
            Comece criando o primeiro andar do seu prédio.
          </p>
          <button
            onClick={onAddFloor}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Adicionar Andar</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Componente da aba de relatórios
const ReportsTab = ({ laptops, floors }) => {
  const getStatusStats = () => {
    const total = laptops.length;
    const available = laptops.filter(l => l.status === 'Disponível').length;
    const inUse = laptops.filter(l => l.status === 'Em Uso').length;
    const maintenance = laptops.filter(l => l.status === 'Manutenção').length;
    const discarded = laptops.filter(l => l.status === 'Descartado').length;

    return [
      { label: 'Disponível', value: available, color: 'bg-green-500', percentage: total > 0 ? ((available / total) * 100).toFixed(1) : 0 },
      { label: 'Em Uso', value: inUse, color: 'bg-blue-500', percentage: total > 0 ? ((inUse / total) * 100).toFixed(1) : 0 },
      { label: 'Manutenção', value: maintenance, color: 'bg-yellow-500', percentage: total > 0 ? ((maintenance / total) * 100).toFixed(1) : 0 },
      { label: 'Descartado', value: discarded, color: 'bg-red-500', percentage: total > 0 ? ((discarded / total) * 100).toFixed(1) : 0 }
    ];
  };

  const statusStats = getStatusStats();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Relatórios e Estatísticas
      </h2>

      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Laptops</p>
              <p className="text-2xl font-bold text-gray-900">{laptops.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Disponíveis</p>
              <p className="text-2xl font-bold text-gray-900">{statusStats[0].value}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Em Manutenção</p>
              <p className="text-2xl font-bold text-gray-900">{statusStats[2].value}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Andares</p>
              <p className="text-2xl font-bold text-gray-900">{floors.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de status */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Status dos Laptops</h3>
        <div className="space-y-3">
          {statusStats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                <span className="text-sm font-medium text-gray-700">{stat.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{stat.value}</span>
                <span className="text-xs text-gray-500">({stat.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// =================== COMPONENTES DE MODAIS ===================

// Modal para adicionar/editar laptop
const LaptopModal = ({ isOpen, onClose, onSubmit, floors, initialData, title }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    model: initialData?.model || DEFAULT_DELL_MODEL,
    serial_number: initialData?.serial_number || '',
    service_tag: initialData?.service_tag || '',
    processor: initialData?.processor || '',
    ram: initialData?.ram || '',
    storage: initialData?.storage || '',
    graphics: initialData?.graphics || '',
    screen_size: initialData?.screen_size || '',
    color: initialData?.color || '',
    warranty_end: initialData?.warranty_end || '',
    condition: initialData?.condition || 'Excelente',
    condition_score: initialData?.condition_score || 100,
    status: initialData?.status || 'Disponível',
    floor_id: initialData?.floor_id || '',
    room_id: initialData?.room_id || '',
    photo: initialData?.photo || '',
    purchase_date: initialData?.purchase_date || '',
    purchase_price: initialData?.purchase_price || '',
    assigned_user: initialData?.assigned_user || '',
    notes: initialData?.notes || ''
  });

  useEffect(() => {
    if (formData.model && dellModelsConfig[formData.model]) {
      const config = dellModelsConfig[formData.model];
      setFormData(prev => ({
        ...prev,
        processor: prev.processor || config.processor,
        ram: prev.ram || config.ram,
        storage: prev.storage || config.storage,
        graphics: prev.graphics || config.graphics,
        screen_size: prev.screen_size || config.screen_size,
        color: prev.color || config.color
      }));
    }
  }, [formData.model]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'floor_id') {
      setFormData(prev => ({
        ...prev,
        room_id: ''
      }));
    }
  };

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoData = e.target.result;
        setFormData(prev => ({
          ...prev,
          photo: photoData
        }));
        
        // Analisar com IA automaticamente
        analyzeWithAI(photoData);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeWithAI = async (imageData) => {
    try {
      setAiAnalyzing(true);
      setError('');
      
      const result = await AIAnalysisService.analyzeLaptopDamage(imageData);
      
      if (result.success) {
        setAiResult(result.data);
        
        // Atualizar formData com os resultados da IA
        setFormData(prev => ({
          ...prev,
          model: result.data.model_detected || prev.model,
          condition: result.data.overall_condition || prev.condition,
          condition_score: result.data.damage_score || prev.condition_score,
          notes: result.data.recommendations ? 
            result.data.recommendations.join('\n') : prev.notes
        }));
      } else {
        setError('Erro na análise de IA: ' + result.error);
      }
    } catch (error) {
      console.error('Erro na análise de IA:', error);
      setError('Erro ao analisar imagem');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.model || !formData.serial_number) {
      setError('Modelo e número de série são obrigatórios');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const submitData = {
        ...formData,
        floor_id: formData.floor_id || null,
        room_id: formData.room_id || null,
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
        condition_score: parseInt(formData.condition_score) || 100,
        damage_analysis: aiResult || null
      };
      
      const result = await onSubmit(submitData);
      
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Erro ao salvar laptop');
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      setError('Erro interno do servidor');
    } finally {
      setLoading(false);
    }
  };

  const selectedFloor = floors.find(f => f.id === parseInt(formData.floor_id));
  const availableRooms = selectedFloor ? selectedFloor.rooms : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Foto e Análise de IA */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📸 Foto e Análise de IA
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capturar Foto
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center">
                  {formData.photo ? (
                    <div className="relative">
                      <img 
                        src={formData.photo} 
                        alt="Laptop" 
                        className="w-full h-48 object-cover rounded-xl mb-4"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        Alterar Foto
                      </button>
                    </div>
                  ) : (
                    <div className="py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        Capturar Foto
                      </button>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoCapture}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Análise de IA
                </label>
                <div className="bg-white border border-gray-200 rounded-2xl p-4 h-full">
                  {aiAnalyzing && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Analisando imagem...</p>
                      </div>
                    </div>
                  )}
                  
                  {aiResult && !aiAnalyzing && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Condição:</span>
                        <span className="text-sm text-gray-900">{aiResult.overall_condition}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Score:</span>
                        <span className="text-sm text-gray-900">{aiResult.damage_score}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Confiança:</span>
                        <span className="text-sm text-gray-900">{aiResult.confidence}%</span>
                      </div>
                      {aiResult.damages && aiResult.damages.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Danos:</span>
                          <ul className="text-sm text-gray-600 mt-1">
                            {aiResult.damages.map((damage, index) => (
                              <li key={index} className="text-xs">
                                • {damage.type} ({damage.severity})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!aiResult && !aiAnalyzing && (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-gray-500 text-center">
                        Capture uma foto para análise automática com IA
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo *
              </label>
              <select
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {initialDellModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Série *
              </label>
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Tag
              </label>
              <input
                type="text"
                name="service_tag"
                value={formData.service_tag}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuário Atribuído
              </label>
              <input
                type="text"
                name="assigned_user"
                value={formData.assigned_user}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status e Localização */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Disponível">Disponível</option>
                <option value="Em Uso">Em Uso</option>
                <option value="Manutenção">Manutenção</option>
                <option value="Descartado">Descartado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condição
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Excelente">Excelente</option>
                <option value="Bom">Bom</option>
                <option value="Regular">Regular</option>
                <option value="Ruim">Ruim</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Andar
              </label>
              <select
                name="floor_id"
                value={formData.floor_id}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione o andar</option>
                {floors.map(floor => (
                  <option key={floor.id} value={floor.id}>
                    {floor.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sala
              </label>
              <select
                name="room_id"
                value={formData.room_id}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!formData.floor_id}
              >
                <option value="">Selecione a sala</option>
                {availableRooms.map(room => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 transition-all font-medium shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Salvando...</span>
                </div>
              ) : (
                'Salvar Laptop'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para adicionar/editar andar
const FloorModal = ({ isOpen, onClose, onSubmit, initialData, title }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      setError('Nome do andar é obrigatório');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await onSubmit(formData);
      
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Erro ao salvar andar');
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      setError('Erro interno do servidor');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Andar *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Térreo, 1º Andar, 2º Andar"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descrição opcional do andar..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 transition-all font-medium"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Salvando...</span>
                </div>
              ) : (
                'Salvar Andar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para visualizar detalhes do laptop
const LaptopDetailsModal = ({ isOpen, onClose, laptop, floors }) => {
  if (!isOpen || !laptop) return null;

  const getFloorName = (floorId) => {
    const floor = floors.find(f => f.id === floorId);
    return floor ? floor.name : 'Não definido';
  };

  const getRoomName = (floorId, roomId) => {
    const floor = floors.find(f => f.id === floorId);
    if (!floor) return 'Não definido';
    const room = floor.rooms.find(r => r.id === roomId);
    return room ? room.name : 'Não definido';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Disponível': return 'bg-green-100 text-green-800';
      case 'Em Uso': return 'bg-blue-100 text-blue-800';
      case 'Manutenção': return 'bg-yellow-100 text-yellow-800';
      case 'Descartado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'Excelente': return 'text-green-600';
      case 'Bom': return 'text-blue-600';
      case 'Regular': return 'text-yellow-600';
      case 'Ruim': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Detalhes do Laptop</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Informações Básicas */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📋 Informações Básicas
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Modelo:</span>
                    <span className="text-sm text-gray-900">{laptop.model}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Número de Série:</span>
                    <span className="text-sm text-gray-900">{laptop.serial_number}</span>
                  </div>
                  {laptop.service_tag && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Service Tag:</span>
                      <span className="text-sm text-gray-900">{laptop.service_tag}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(laptop.status)}`}>
                      {laptop.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Condição:</span>
                    <span className={`text-sm font-medium ${getConditionColor(laptop.condition)}`}>
                      {laptop.condition}
                    </span>
                  </div>
                  {laptop.condition_score && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Score:</span>
                      <span className="text-sm text-gray-900">{laptop.condition_score}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Localização */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📍 Localização
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Andar:</span>
                    <span className="text-sm text-gray-900">{getFloorName(laptop.floor_id)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Sala:</span>
                    <span className="text-sm text-gray-900">{getRoomName(laptop.floor_id, laptop.room_id)}</span>
                  </div>
                  {laptop.assigned_user && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Usuário:</span>
                      <span className="text-sm text-gray-900">{laptop.assigned_user}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Foto e Análise */}
            <div className="space-y-6">
              {/* Foto */}
              {laptop.photo && (
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    📸 Foto
                  </h3>
                  <img 
                    src={laptop.photo} 
                    alt={laptop.model}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>
              )}

              {/* Análise de IA */}
              {laptop.damage_analysis && (
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    🤖 Análise de IA
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Confiança:</span>
                      <span className="text-sm text-gray-900">{laptop.damage_analysis.confidence}%</span>
                    </div>
                    
                    {laptop.damage_analysis.damages && laptop.damage_analysis.damages.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Danos Detectados:</span>
                        <ul className="mt-2 space-y-1">
                          {laptop.damage_analysis.damages.map((damage, index) => (
                            <li key={index} className="text-sm text-gray-700 bg-white p-2 rounded-lg">
                              <span className="font-medium">{damage.type}</span> - {damage.location}
                              <span className="text-xs text-gray-500 ml-2">({damage.severity})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {laptop.damage_analysis.recommendations && laptop.damage_analysis.recommendations.length > 0 && (
                      <div>
                        <ul className="mt-2 space-y-1">
                          {laptop.damage_analysis.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-gray-700 bg-white p-2 rounded-lg">
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          {laptop.notes && (
            <div className="mt-6 bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📝 Observações
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{laptop.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =================== COMPONENTE APP PRINCIPAL ===================
const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário logado
    const savedUser = localStorage.getItem('dellLaptopUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Erro ao ler usuário do localStorage:', error);
        localStorage.removeItem('dellLaptopUser');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('dellLaptopUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('dellLaptopUser');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {user ? (
        <MainApp user={user} onLogout={handleLogout} />
      ) : (
        <AuthComponent onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
