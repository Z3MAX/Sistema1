import React, { useState, useRef, useEffect, createContext, useContext } from 'react';

// =================== CONFIGURAÇÃO SUPABASE (SIMULADA) ===================
const supabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: () => Promise.resolve({ data: null, error: null }),
    signInWithPassword: () => Promise.resolve({ data: null, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    getUser: () => Promise.resolve({ data: { user: null } })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null }),
        order: () => Promise.resolve({ data: [], error: null })
      }),
      order: () => Promise.resolve({ data: [], error: null })
    }),
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: null })
      })
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: null })
        })
      })
    }),
    delete: () => ({
      eq: () => Promise.resolve({ error: null })
    })
  })
};

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
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular usuário logado automaticamente para demo
    const mockUser = {
      id: '1',
      email: 'admin@dell.com',
      user_metadata: { name: 'Admin Dell', company: 'Dell Technologies' }
    };
    
    setUser(mockUser);
    setProfile({
      id: '1',
      name: 'Admin Dell',
      company: 'Dell Technologies'
    });
    setLoading(false);
  }, []);

  const signUp = async (email, password, name, company = '') => {
    try {
      setLoading(true);
      const mockUser = {
        id: Date.now().toString(),
        email: email,
        user_metadata: { name, company }
      };
      
      setUser(mockUser);
      setProfile({ id: mockUser.id, name, company });
      
      return { success: true, data: { user: mockUser } };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const mockUser = {
        id: Date.now().toString(),
        email: email,
        user_metadata: { name: 'Admin Dell', company: 'Dell Technologies' }
      };
      
      setUser(mockUser);
      setProfile({ id: mockUser.id, name: 'Admin Dell', company: 'Dell Technologies' });
      
      return { success: true, data: { user: mockUser } };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setUser(null);
      setProfile(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// =================== SERVIÇOS DE DADOS (SIMULADOS) ===================
const dataService = {
  mockFloors: [
    {
      id: 1,
      name: 'Térreo',
      description: 'Recepção e atendimento',
      rooms: [
        { id: 1, name: 'Recepção', description: 'Área de atendimento ao cliente', floor_id: 1 },
        { id: 2, name: 'Sala de Suporte', description: 'Suporte técnico', floor_id: 1 }
      ]
    },
    {
      id: 2,
      name: '1º Andar',
      description: 'Área administrativa',
      rooms: [
        { id: 3, name: 'Escritório Admin', description: 'Administração', floor_id: 2 },
        { id: 4, name: 'Sala de TI', description: 'Departamento de TI', floor_id: 2 }
      ]
    }
  ],

  mockLaptops: [
    {
      id: 1,
      model: 'Dell Inspiron 15 3000',
      serial_number: 'DL3000-001',
      service_tag: 'BXPYQ3',
      processor: 'Intel Core i5-1135G7',
      ram: '8GB DDR4',
      storage: '256GB SSD',
      graphics: 'Intel Iris Xe',
      screen_size: '15.6"',
      color: 'Preto',
      warranty_end: '2025-12-31',
      condition: 'Excelente',
      condition_score: 95,
      status: 'Disponível',
      floor_id: 1,
      room_id: 1,
      photo: null,
      damage_analysis: null,
      purchase_date: '2024-01-15',
      purchase_price: 2500.00,
      assigned_user: null,
      notes: 'Novo na caixa',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      model: 'Dell XPS 13 9310',
      serial_number: 'DLXPS-002',
      service_tag: 'HWPYQ4',
      processor: 'Intel Core i7-1165G7',
      ram: '16GB LPDDR4x',
      storage: '512GB SSD',
      graphics: 'Intel Iris Xe',
      screen_size: '13.3"',
      color: 'Prata',
      warranty_end: '2025-08-15',
      condition: 'Bom',
      condition_score: 80,
      status: 'Em Uso',
      floor_id: 2,
      room_id: 3,
      photo: null,
      damage_analysis: {
        overall_condition: 'Bom',
        damage_score: 20,
        damages: [
          { type: 'Riscos leves', location: 'Tampa', severity: 'Leve' },
          { type: 'Desgaste', location: 'Teclado', severity: 'Moderado' }
        ]
      },
      purchase_date: '2024-02-20',
      purchase_price: 4200.00,
      assigned_user: 'João Silva',
      notes: 'Pequenos sinais de uso',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],

  // ===== FLOORS =====
  floors: {
    async getAll() {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, data: dataService.mockFloors };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    async create(floor) {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        const newFloor = {
          ...floor,
          id: Date.now(),
          rooms: []
        };
        dataService.mockFloors.push(newFloor);
        return { success: true, data: newFloor };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    async update(id, updates) {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        const floorIndex = dataService.mockFloors.findIndex(f => f.id === id);
        if (floorIndex >= 0) {
          dataService.mockFloors[floorIndex] = { ...dataService.mockFloors[floorIndex], ...updates };
          return { success: true, data: dataService.mockFloors[floorIndex] };
        }
        throw new Error('Andar não encontrado');
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    async delete(id) {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        const floorIndex = dataService.mockFloors.findIndex(f => f.id === id);
        if (floorIndex >= 0) {
          dataService.mockFloors.splice(floorIndex, 1);
          return { success: true };
        }
        throw new Error('Andar não encontrado');
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },

  // ===== ROOMS =====
  rooms: {
    async create(room) {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        const newRoom = {
          ...room,
          id: Date.now()
        };
        
        const floor = dataService.mockFloors.find(f => f.id === room.floor_id);
        if (floor) {
          if (!floor.rooms) floor.rooms = [];
          floor.rooms.push(newRoom);
        }
        
        return { success: true, data: newRoom };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    async update(id, updates) {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        for (let floor of dataService.mockFloors) {
          if (floor.rooms) {
            const roomIndex = floor.rooms.findIndex(r => r.id === id);
            if (roomIndex >= 0) {
              floor.rooms[roomIndex] = { ...floor.rooms[roomIndex], ...updates };
              return { success: true, data: floor.rooms[roomIndex] };
            }
          }
        }
        throw new Error('Sala não encontrada');
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    async delete(id) {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        for (let floor of dataService.mockFloors) {
          if (floor.rooms) {
            const roomIndex = floor.rooms.findIndex(r => r.id === id);
            if (roomIndex >= 0) {
              floor.rooms.splice(roomIndex, 1);
              return { success: true };
            }
          }
        }
        throw new Error('Sala não encontrada');
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },

  // ===== LAPTOPS =====
  laptops: {
    async getAll() {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, data: dataService.mockLaptops };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    async create(laptop) {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        const newLaptop = {
          ...laptop,
          id: Date.now(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        dataService.mockLaptops.push(newLaptop);
        return { success: true, data: newLaptop };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    async update(id, updates) {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        const laptopIndex = dataService.mockLaptops.findIndex(l => l.id === id);
        if (laptopIndex >= 0) {
          dataService.mockLaptops[laptopIndex] = {
            ...dataService.mockLaptops[laptopIndex],
            ...updates,
            updated_at: new Date().toISOString()
          };
          return { success: true, data: dataService.mockLaptops[laptopIndex] };
        }
        throw new Error('Laptop não encontrado');
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    async delete(id) {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        const laptopIndex = dataService.mockLaptops.findIndex(l => l.id === id);
        if (laptopIndex >= 0) {
          dataService.mockLaptops.splice(laptopIndex, 1);
          return { success: true };
        }
        throw new Error('Laptop não encontrado');
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    async checkSerialExists(serial, excludeId = null) {
      try {
        await new Promise(resolve => setTimeout(resolve, 200));
        const exists = dataService.mockLaptops.some(l => l.serial_number === serial && l.id !== excludeId);
        return { success: true, exists };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  }
};

// =================== SIMULAÇÃO DE ANÁLISE DE IA ===================
const AIAnalysisService = {
  async analyzeLaptopDamage(imageData) {
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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
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
  HardDrive: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <line x1="22" y1="12" x2="2" y2="12"></line>
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"></path>
      <line x1="6" y1="16" x2="6.01" y2="16"></line>
      <line x1="10" y1="16" x2="10.01" y2="16"></line>
    </svg>
  ),
  Monitor: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
  ),
  User: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
  LogOut: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l1.5 1.5L5 6L3.5 4.5L5 3zm0 18l1.5-1.5L5 18l-1.5 1.5L5 21zM19 3l-1.5 1.5L19 6l1.5-1.5L19 3zm0 18l-1.5-1.5L19 18l1.5 1.5L19 21zM9 12l3-3 3 3-3 3-3-3z" />
    </svg>
  )
};

// =================== COMPONENTE PRINCIPAL ===================
const DellLaptopControlSystem = () => {
  const { user, profile, signOut } = useAuth();
  
  // Estados principais
  const [activeTab, setActiveTab] = useState('dashboard');
  const [floors, setFloors] = useState([]);
  const [laptops, setLaptops] = useState([]);
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
    setIsLoading(true);
    try {
      const [floorsResult, laptopsResult] = await Promise.all([
        dataService.floors.getAll(),
        dataService.laptops.getAll()
      ]);

      if (floorsResult.success) {
        setFloors(floorsResult.data);
      }

      if (laptopsResult.success) {
        setLaptops(laptopsResult.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
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
        const serialCheck = await dataService.laptops.checkSerialExists(laptopForm.serial_number);
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
        result = await dataService.laptops.update(editingLaptop.id, laptopData);
      } else {
        result = await dataService.laptops.create(laptopData);
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
      
      const result = await dataService.laptops.delete(laptopId);
      
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
        result = await dataService.rooms.update(editingRoom.id, roomData);
      } else {
        result = await dataService.rooms.create(roomData);
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

      const result = await dataService.rooms.delete(roomId);
      
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

  const getDashboardStats = () => {
    const total = laptops.length;
    const available = laptops.filter(l => l.status === 'Disponível').length;
    const inUse = laptops.filter(l => l.status === 'Em Uso').length;
    const maintenance = laptops.filter(l => l.status === 'Manutenção').length;
    const totalValue = laptops.reduce((sum, laptop) => sum + (parseFloat(laptop.purchase_price) || 0), 0);
    const avgCondition = laptops.length > 0 ? laptops.reduce((sum, laptop) => sum + (laptop.condition_score || 0), 0) / laptops.length : 0;

    return {
      total,
      available,
      inUse,
      maintenance,
      totalValue,
      avgCondition,
      totalRooms: floors.reduce((sum, floor) => sum + (floor.rooms?.length || 0), 0)
    };
  };

  const stats = getDashboardStats();

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
      const result = await signOut();
      if (result.success) {
        setFloors([]);
        setLaptops([]);
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
                  <span className="font-semibold text-blue-700">{stats.total}</span>
                  <span className="text-blue-600">laptops</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <Icons.CheckCircle />
                  <span className="font-semibold text-green-700">{stats.available}</span>
                  <span className="text-green-600">disponíveis</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <Icons.DollarSign />
                  <span className="font-semibold text-purple-700">
                    R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Icons.User />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800">
                      {profile?.name || 'Dell Admin'}
                    </p>
                    <p className="text-xs text-gray-500">Dell Technologies</p>
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
                <p className="text-sm text-blue-600 font-medium">Controle Inteligente</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-8 rounded-3xl shadow-lg border border-blue-100 hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-2">Total Laptops</p>
                    <p className="text-3xl md:text-4xl font-bold text-blue-700">{stats.total}</p>
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
                    <p className="text-3xl md:text-4xl font-bold text-emerald-700">{stats.available}</p>
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
                    <p className="text-3xl md:text-4xl font-bold text-orange-700">{stats.maintenance}</p>
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
                      {stats.avgCondition.toFixed(0)}%
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

        {/* Laptops */}
        {activeTab === 'laptops' && (
          <div className="space-y-6">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent">
                    Gestão de Laptops Dell
                  </h2>
                  <p className="text-gray-600 mt-2">Controle completo dos equipamentos Dell</p>
                </div>
                
                <button
                  onClick={() => setShowLaptopForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-2xl flex items-center justify-center space-x-3 text-sm font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Icons.Plus />
                  <span>Novo Laptop</span>
                  <Icons.Sparkles />
                </button>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/40">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Icons.Search />
                  </div>
                  <input
                    type="text"
                    placeholder="🔍 Buscar por modelo, serial ou usuário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {isLoading ? (
                <div className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-3xl border border-white/40">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="text-gray-500 font-medium">Carregando laptops...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLaptops.map(laptop => (
                    <div key={laptop.id} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/40 p-6 hover:shadow-xl transition-all group">
                      <div className="flex items-start space-x-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                          {laptop.photo ? (
                            <img src={laptop.photo} alt={laptop.model} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-200 to-indigo-300 text-blue-700">
                              <Icons.Laptop />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 truncate mb-1">{laptop.model}</h3>
                          <p className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded-lg inline-block mb-2">
                            {laptop.serial_number}
                          </p>
                          {laptop.service_tag && (
                            <p className="text-xs text-blue-600 font-medium mb-2">
                              Service Tag: {laptop.service_tag}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between mb-2">
                            <StatusBadge status={laptop.status} />
                          </div>
                          
                          <div className="flex items-center justify-between mb-3">
                            <ConditionBadge condition={laptop.condition} score={laptop.condition_score} />
                          </div>
                          
                          {laptop.assigned_user && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                              <Icons.User />
                              <span className="font-medium">{laptop.assigned_user}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Icons.MapPin />
                              <span className="font-medium">{getFloorName(laptop.floor_id)} - {getRoomName(laptop.room_id)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setShowLaptopDetail(laptop)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-110"
                                title="Ver detalhes"
                              >
                                <Icons.Eye />
                              </button>
                              <button
                                onClick={() => handleEditLaptop(laptop)}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-all hover:scale-110"
                                title="Editar"
                              >
                                <Icons.Edit />
                              </button>
                              <button
                                onClick={() => handleDeleteLaptop(laptop.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-110"
                                title="Excluir"
                              >
                                <Icons.Trash2 />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredLaptops.length === 0 && !isLoading && (
                    <div className="col-span-full text-center py-16 bg-white/70 backdrop-blur-sm rounded-3xl border border-white/40">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Icons.Laptop />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum laptop encontrado</h3>
                      <p className="text-gray-500 mb-6">Comece adicionando seu primeiro laptop Dell</p>
                      <button
                        onClick={() => setShowLaptopForm(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <div className="flex items-center space-x-2">
                          <Icons.Plus />
                          <span>Adicionar Primeiro Laptop</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Localizações */}
        {activeTab === 'locations' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-900 via-emerald-800 to-teal-900 bg-clip-text text-transparent">
                  Gestão de Localizações
                </h2>
                <p className="text-gray-600 mt-2">Organize espaços e localizações</p>
              </div>
              <button
                onClick={() => setShowRoomForm(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-4 rounded-2xl flex items-center justify-center space-x-3 font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Icons.Plus />
                <span>Nova Sala</span>
                <Icons.Building />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {floors.map(floor => (
                <div key={floor.id} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/40 overflow-hidden hover:shadow-xl transition-all group">
                  <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-6 py-6">
                    <h3 className="font-bold text-white text-xl flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Icons.Building />
                      </div>
                      <span>{floor.name}</span>
                    </h3>
                    {floor.description && (
                      <p className="text-green-100 text-sm mt-2 font-medium">{floor.description}</p>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <Icons.Building />
                        <span className="text-sm font-bold text-blue-700">{floor.rooms?.length || 0}</span>
                        <span className="text-xs text-blue-600">sala(s)</span>
                      </div>
                      <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                        <Icons.Laptop />
                        <span className="text-sm font-bold text-purple-700">{laptops.filter(l => l.floor_id === floor.id).length}</span>
                        <span className="text-xs text-purple-600">laptop(s)</span>
                      </div>
                    </div>
                    
                    {!floor.rooms || floor.rooms.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Icons.Building />
                        </div>
                        <p className="text-gray-500 font-medium">Nenhuma sala cadastrada</p>
                        <p className="text-gray-400 text-sm mt-1">Adicione salas para este andar</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {floor.rooms.map(room => (
                          <div key={room.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-200 hover:shadow-md transition-all group">
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-gray-900 truncate">{room.name}</div>
                              {room.description && (
                                <div className="text-sm text-gray-500 mt-1 truncate">{room.description}</div>
                              )}
                              <div className="flex items-center space-x-2 mt-2">
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                  {laptops.filter(l => l.room_id === room.id).length} laptops
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4 flex-shrink-0">
                              <button
                                onClick={() => handleEditRoom(room)}
                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all hover:scale-110"
                                title="Editar sala"
                              >
                                <Icons.Edit />
                              </button>
                              <button
                                onClick={() => handleDeleteRoom(room.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-110"
                                title="Excluir sala"
                              >
                                <Icons.Trash2 />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Relatórios */}
        {activeTab === 'reports' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-900 via-red-800 to-pink-900 bg-clip-text text-transparent">
                Relatórios Dell
              </h2>
              <p className="text-gray-600 mt-2">Análise detalhada dos laptops Dell</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-white/40">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Icons.BarChart3 />
                </div>
                <span>Resumo por Status</span>
              </h3>
              <div className="space-y-6">
                {statuses.map(status => {
                  const count = laptops.filter(l => l.status === status).length;
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={status} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-200">
                      <div className="flex items-center space-x-4">
                        <StatusBadge status={status} />
                        <span className="font-semibold text-gray-700">{count} laptops</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 md:w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-600 w-12 text-right">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-white/40">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Icons.Shield />
                </div>
                <span>Análise de Condição</span>
              </h3>
              <div className="space-y-6">
                {conditions.map(condition => {
                  const count = laptops.filter(l => l.condition === condition).length;
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  
                  if (count === 0) return null;
                  
                  return (
                    <div key={condition} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-200">
                      <div className="flex items-center space-x-4">
                        <ConditionBadge condition={condition} />
                        <span className="text-sm font-semibold text-gray-600">{count} laptops</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 md:w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-green-600 w-12 text-right">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAIS */}
      
      {/* Modal de Opções de Foto */}
      {photoState.showOptions && (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/80 to-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 rounded-3xl"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Icons.Camera />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">📷 Capturar Foto</h3>
                <p className="text-gray-600 font-medium">Como você gostaria de adicionar a foto do laptop?</p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={handleTakePhoto}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-5 px-6 rounded-2xl flex items-center justify-center space-x-4 transition-all transform hover:scale-105 shadow-lg font-bold"
                >
                  <Icons.Camera />
                  <div className="text-left">
                    <div className="font-bold">📷 Tirar Foto</div>
                    <div className="text-sm opacity-90">Usar câmera do dispositivo</div>
                  </div>
                </button>
                
                <button
                  onClick={handleSelectFromGallery}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-5 px-6 rounded-2xl flex items-center justify-center space-x-4 transition-all transform hover:scale-105 shadow-lg font-bold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21,15 16,10 5,21"></polyline>
                  </svg>
                  <div className="text-left">
                    <div className="font-bold">🖼️ Galeria</div>
                    <div className="text-sm opacity-90">Escolher foto existente</div>
                  </div>
                </button>
                
                <button
                  onClick={closeAllPhotoModals}
                  className="w-full bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white py-4 px-6 rounded-2xl transition-all font-bold"
                >
                  ❌ Cancelar
                </button>
              </div>
              
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icons.AlertCircle />
                  </div>
                  <div className="text-sm text-blue-800">
                    <p className="font-bold">🤖 Análise com IA:</p>
                    <p>A foto será automaticamente analisada para identificar danos no laptop Dell.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Preview da Foto com Análise de IA */}
      {photoState.showPreview && photoState.capturedPhoto && (
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
                
                <div className="flex flex-col space-y-4">
                  <button
                    onClick={confirmPhotoWithAI}
                    disabled={photoState.isAnalyzing}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-5 rounded-2xl flex items-center justify-center space-x-3 transition-all transform hover:scale-105 shadow-lg font-bold"
                  >
                    {photoState.isAnalyzing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>🤖 Analisando com IA...</span>
                      </>
                    ) : (
                      <>
                        <Icons.Sparkles />
                        <span>🤖 Analisar e Usar Foto</span>
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading de Processamento */}
      {photoState.isProcessing && (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/80 to-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-10 text-center shadow-2xl border border-white/20">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">🔄 Processando Foto</h3>
            <p className="text-gray-600 font-medium">Preparando imagem...</p>
          </div>
        </div>
      )}

      {/* Erro de Foto */}
      {photoState.error && (
        <div className="fixed top-6 right-6 bg-gradient-to-r from-red-500 to-pink-500 text-white p-6 rounded-2xl shadow-2xl z-[9999] max-w-sm border border-red-400">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Icons.AlertCircle />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">❌ Erro</p>
              <p className="text-sm opacity-90">{photoState.error}</p>
            </div>
            <button
              onClick={() => setPhotoState(prev => ({ ...prev, error: '' }))}
              className="ml-2 hover:bg-white/20 rounded-xl p-1 transition-colors"
            >
              <Icons.X />
            </button>
          </div>
        </div>
      )}

      {/* Modal de Formulário de Laptop */}
      {showLaptopForm && (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/80 to-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-2xl border border-white/20">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent">
                    {editingLaptop ? '✏️ Editar Laptop Dell' : '💻 Novo Laptop Dell'}
                  </h3>
                  <p className="text-gray-600 mt-2 font-medium">
                    {editingLaptop ? 'Atualize as informações do laptop' : 'Cadastre um novo laptop Dell no sistema'}
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
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Modelo Dell *</label>
                    <select
                      value={laptopForm.model}
                      onChange={(e) => setLaptopForm({...laptopForm, model: e.target.value})}
                      className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                    >
                      <option value="">🖥️ Selecione o modelo</option>
                      {dellModels.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                  
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
                
                {/* Coluna 2 - Foto, status e localização */}
                <div className="space-y-6">
                  {/* SEÇÃO DE FOTO COM ANÁLISE DE IA */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-4">📷 Foto do Laptop</label>
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
                          
                          {/* Análise de IA */}
                          {laptopForm.damage_analysis && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                              <h4 className="font-bold text-blue-800 mb-2 flex items-center space-x-2">
                                <Icons.Sparkles />
                                <span>🤖 Análise de IA</span>
                              </h4>
                              <div className="text-sm text-blue-700">
                                <p className="font-medium">Condição: {laptopForm.damage_analysis.overall_condition}</p>
                                <p className="font-medium">Confiança: {laptopForm.damage_analysis.confidence}%</p>
                                {laptopForm.damage_analysis.damages && laptopForm.damage_analysis.damages.length > 0 && (
                                  <div className="mt-2">
                                    <p className="font-medium">Danos identificados:</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                      {laptopForm.damage_analysis.damages.map((damage, index) => (
                                        <li key={index}>
                                          <span className="font-medium">{damage.type}</span> em {damage.location} 
                                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                            damage.severity === 'Leve' ? 'bg-yellow-100 text-yellow-800' :
                                            damage.severity === 'Moderado' ? 'bg-orange-100 text-orange-800' :
                                            'bg-red-100 text-red-800'
                                          }`}>
                                            {damage.severity}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
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
                              <Icons.Sparkles />
                              <span className="ml-2">🤖 Análise de IA automática</span>
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
                    editingLaptop ? '✅ Atualizar Laptop' : '💾 Salvar Laptop'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Formulário de Sala */}
      {showRoomForm && (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/80 to-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-md shadow-2xl border border-white/20">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-green-900 via-emerald-800 to-teal-900 bg-clip-text text-transparent">
                    {editingRoom ? '✏️ Editar Sala' : '🏢 Nova Sala'}
                  </h3>
                  <p className="text-gray-600 mt-2 font-medium">
                    {editingRoom ? 'Atualize as informações da sala' : 'Adicione uma nova sala ao sistema'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowRoomForm(false);
                    setEditingRoom(null);
                    setRoomForm({ name: '', description: '', floor_id: '' });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-2xl transition-colors"
                >
                  <Icons.X />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Nome da Sala *</label>
                  <input
                    type="text"
                    value={roomForm.name}
                    onChange={(e) => setRoomForm({...roomForm, name: e.target.value})}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                    placeholder="Ex: Sala de TI"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Andar *</label>
                  <select
                    value={roomForm.floor_id}
                    onChange={(e) => setRoomForm({...roomForm, floor_id: e.target.value})}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium"
                  >
                    <option value="">🏢 Selecione um andar</option>
                    {floors.map(floor => (
                      <option key={floor.id} value={floor.id}>{floor.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Descrição</label>
                  <textarea
                    value={roomForm.description}
                    onChange={(e) => setRoomForm({...roomForm, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm font-medium resize-none"
                    placeholder="Descrição da sala..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowRoomForm(false);
                    setEditingRoom(null);
                    setRoomForm({ name: '', description: '', floor_id: '' });
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveRoom}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-2xl transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Salvando...</span>
                    </div>
                  ) : (
                    editingRoom ? '✅ Atualizar Sala' : '💾 Salvar Sala'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Laptop */}
      {showLaptopDetail && (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/80 to-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-2xl border border-white/20">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent">
                    💻 Detalhes do Laptop Dell
                  </h3>
                  <p className="text-gray-600 mt-2 font-medium">Informações completas do equipamento</p>
                </div>
                <button
                  onClick={() => setShowLaptopDetail(null)}
                  className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
                >
                  <Icons.X />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                    <label className="block text-sm font-bold text-blue-700 mb-2">Modelo</label>
                    <p className="text-xl font-bold text-blue-900">{showLaptopDetail.model}</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                    <label className="block text-sm font-bold text-purple-700 mb-2">Número de Série</label>
                    <p className="text-lg font-mono font-bold text-purple-900 bg-white/70 px-3 py-2 rounded-xl inline-block">
                      {showLaptopDetail.serial_number}
                    </p>
                  </div>
                  
                  {showLaptopDetail.service_tag && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
                      <label className="block text-sm font-bold text-indigo-700 mb-2">Service Tag Dell</label>
                      <p className="text-lg font-mono font-bold text-indigo-900 bg-white/70 px-3 py-2 rounded-xl inline-block">
                        {showLaptopDetail.service_tag}
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                    <label className="block text-sm font-bold text-green-700 mb-3">Status</label>
                    <StatusBadge status={showLaptopDetail.status} />
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100">
                    <label className="block text-sm font-bold text-orange-700 mb-3">Condição</label>
                    <ConditionBadge condition={showLaptopDetail.condition} score={showLaptopDetail.condition_score} />
                  </div>
                  
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-2xl border border-cyan-100">
                    <label className="block text-sm font-bold text-cyan-700 mb-2">Localização</label>
                    <div className="flex items-center space-x-2 text-cyan-900">
                      <Icons.MapPin />
                      <p className="font-bold text-lg">
                        {getFloorName(showLaptopDetail.floor_id)} - {getRoomName(showLaptopDetail.room_id)}
                      </p>
                    </div>
                  </div>

                  {showLaptopDetail.assigned_user && (
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-2xl border border-teal-100">
                      <label className="block text-sm font-bold text-teal-700 mb-2">Usuário Responsável</label>
                      <div className="flex items-center space-x-2 text-teal-900">
                        <Icons.User />
                        <p className="font-bold text-lg">{showLaptopDetail.assigned_user}</p>
                      </div>
                    </div>
                  )}
                  
                  {showLaptopDetail.purchase_price && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-100">
                      <label className="block text-sm font-bold text-yellow-700 mb-2">Valor de Compra</label>
                      <div className="flex items-center space-x-2">
                        <Icons.DollarSign />
                        <p className="text-xl font-bold text-yellow-900">
                          R$ {parseFloat(showLaptopDetail.purchase_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-4">📷 Foto do Laptop</label>
                    <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                      {showLaptopDetail.photo ? (
                        <img 
                          src={showLaptopDetail.photo} 
                          alt={showLaptopDetail.model} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-200 to-indigo-300 text-blue-700">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <Icons.Laptop />
                            </div>
                            <span className="text-blue-800 font-bold">Nenhuma foto disponível</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Análise de Danos por IA */}
                  {showLaptopDetail.damage_analysis && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                      <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center space-x-2">
                        <Icons.Sparkles />
                        <span>🤖 Análise de IA - Danos Identificados</span>
                      </h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/70 p-4 rounded-xl">
                            <p className="text-sm font-bold text-blue-700">Condição Geral</p>
                            <p className="text-lg font-bold text-blue-900">{showLaptopDetail.damage_analysis.overall_condition}</p>
                          </div>
                          <div className="bg-white/70 p-4 rounded-xl">
                            <p className="text-sm font-bold text-blue-700">Pontuação de Danos</p>
                            <p className="text-lg font-bold text-blue-900">{showLaptopDetail.damage_analysis.damage_score}%</p>
                          </div>
                        </div>
                        
                        {showLaptopDetail.damage_analysis.damages && showLaptopDetail.damage_analysis.damages.length > 0 && (
                          <div>
                            <p className="font-bold text-blue-800 mb-3">Danos Detectados:</p>
                            <div className="space-y-2">
                              {showLaptopDetail.damage_analysis.damages.map((damage, index) => (
                                <div key={index} className="bg-white/70 p-3 rounded-xl">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-bold text-gray-800">{damage.type}</p>
                                      <p className="text-sm text-gray-600">{damage.location}</p>
                                      {damage.description && (
                                        <p className="text-sm text-gray-500 mt-1">{damage.description}</p>
                                      )}
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                      damage.severity === 'Leve' ? 'bg-yellow-100 text-yellow-800' :
                                      damage.severity === 'Moderado' ? 'bg-orange-100 text-orange-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {damage.severity}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {showLaptopDetail.damage_analysis.recommendations && (
                          <div>
                            <p className="font-bold text-blue-800 mb-3">Recomendações:</p>
                            <ul className="space-y-2">
                              {showLaptopDetail.damage_analysis.recommendations.map((rec, index) => (
                                <li key={index} className="bg-white/70 p-3 rounded-xl text-sm text-gray-700">
                                  • {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Especificações Técnicas */}
                  <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 rounded-2xl border border-slate-200">
                    <h4 className="text-lg font-bold text-slate-700 mb-4 flex items-center space-x-2">
                      <Icons.Cpu />
                      <span>⚙️ Especificações Técnicas</span>
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {showLaptopDetail.processor && (
                        <div className="bg-white/70 p-3 rounded-xl">
                          <p className="text-sm font-bold text-gray-600">Processador</p>
                          <p className="text-gray-900 font-medium">{showLaptopDetail.processor}</p>
                        </div>
                      )}
                      {showLaptopDetail.ram && (
                        <div className="bg-white/70 p-3 rounded-xl">
                          <p className="text-sm font-bold text-gray-600">Memória RAM</p>
                          <p className="text-gray-900 font-medium">{showLaptopDetail.ram}</p>
                        </div>
                      )}
                      {showLaptopDetail.storage && (
                        <div className="bg-white/70 p-3 rounded-xl">
                          <p className="text-sm font-bold text-gray-600">Armazenamento</p>
                          <p className="text-gray-900 font-medium">{showLaptopDetail.storage}</p>
                        </div>
                      )}
                      {showLaptopDetail.graphics && (
                        <div className="bg-white/70 p-3 rounded-xl">
                          <p className="text-sm font-bold text-gray-600">Placa Gráfica</p>
                          <p className="text-gray-900 font-medium">{showLaptopDetail.graphics}</p>
                        </div>
                      )}
                      {showLaptopDetail.screen_size && (
                        <div className="bg-white/70 p-3 rounded-xl">
                          <p className="text-sm font-bold text-gray-600">Tamanho da Tela</p>
                          <p className="text-gray-900 font-medium">{showLaptopDetail.screen_size}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {showLaptopDetail.notes && (
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-2xl border border-amber-200">
                      <label className="block text-sm font-bold text-amber-700 mb-3">📝 Observações</label>
                      <p className="text-amber-900 font-medium leading-relaxed">{showLaptopDetail.notes}</p>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-2xl border border-gray-200">
                    <label className="block text-sm font-bold text-gray-700 mb-4">🔧 Informações do Sistema</label>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between p-3 bg-white/80 rounded-xl">
                        <span className="font-bold text-gray-600">Criado em:</span>
                        <span className="font-mono text-gray-900">
                          {new Date(showLaptopDetail.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/80 rounded-xl">
                        <span className="font-bold text-gray-600">Última atualização:</span>
                        <span className="font-mono text-gray-900">
                          {new Date(showLaptopDetail.updated_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {showLaptopDetail.warranty_end && (
                        <div className="flex items-center justify-between p-3 bg-white/80 rounded-xl">
                          <span className="font-bold text-gray-600">Fim da garantia:</span>
                          <span className="font-mono text-gray-900">
                            {new Date(showLaptopDetail.warranty_end).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-10 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowLaptopDetail(null);
                    handleEditLaptop(showLaptopDetail);
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <div className="flex items-center space-x-2">
                    <Icons.Edit />
                    <span>✏️ Editar Laptop</span>
                  </div>
                </button>
                <button
                  onClick={() => setShowLaptopDetail(null)}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all font-bold"
                >
                  Fechar
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
      <DellLaptopControlSystem />
    </AuthProvider>
  );
};

export default App;
