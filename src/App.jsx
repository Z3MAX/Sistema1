import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';

// =================== CONFIGURAÇÃO SUPABASE ===================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

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
    // Verificar sessão atual
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadProfile(session.user.id);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  // Registrar usuário
  const signUp = async (email, password, name, company = '') => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            company: company
          }
        }
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Fazer login
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Fazer logout
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Erro no logout:', error);
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
    signOut,
    loadProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// =================== SERVIÇOS DE DADOS ===================
const dataService = {
  // ===== FLOORS =====
  floors: {
    async getAll() {
      try {
        const { data, error } = await supabase
          .from('floors')
          .select(`
            *,
            rooms (*)
          `)
          .order('number', { ascending: true });

        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        console.error('Erro ao buscar andares:', error);
        return { success: false, error: error.message };
      }
    },

    async create(floor) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { data, error } = await supabase
          .from('floors')
          .insert([{ ...floor, user_id: user.id }])
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        console.error('Erro ao criar andar:', error);
        return { success: false, error: error.message };
      }
    },

    async update(id, updates) {
      try {
        const { data, error } = await supabase
          .from('floors')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        console.error('Erro ao atualizar andar:', error);
        return { success: false, error: error.message };
      }
    },

    async delete(id) {
      try {
        const { error } = await supabase
          .from('floors')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return { success: true };
      } catch (error) {
        console.error('Erro ao deletar andar:', error);
        return { success: false, error: error.message };
      }
    }
  },

  // ===== ROOMS =====
  rooms: {
    async create(room) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { data, error } = await supabase
          .from('rooms')
          .insert([{ ...room, user_id: user.id }])
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        console.error('Erro ao criar sala:', error);
        return { success: false, error: error.message };
      }
    },

    async update(id, updates) {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        console.error('Erro ao atualizar sala:', error);
        return { success: false, error: error.message };
      }
    },

    async delete(id) {
      try {
        const { error } = await supabase
          .from('rooms')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return { success: true };
      } catch (error) {
        console.error('Erro ao deletar sala:', error);
        return { success: false, error: error.message };
      }
    }
  },

  // ===== ASSETS =====
  assets: {
    async getAll() {
      try {
        const { data, error } = await supabase
          .from('assets')
          .select(`
            *,
            floors (name),
            rooms (name)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        console.error('Erro ao buscar ativos:', error);
        return { success: false, error: error.message };
      }
    },

    async create(asset) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { data, error } = await supabase
          .from('assets')
          .insert([{ ...asset, user_id: user.id }])
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        console.error('Erro ao criar ativo:', error);
        return { success: false, error: error.message };
      }
    },

    async update(id, updates) {
      try {
        const { data, error } = await supabase
          .from('assets')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        console.error('Erro ao atualizar ativo:', error);
        return { success: false, error: error.message };
      }
    },

    async delete(id) {
      try {
        const { error } = await supabase
          .from('assets')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return { success: true };
      } catch (error) {
        console.error('Erro ao deletar ativo:', error);
        return { success: false, error: error.message };
      }
    },

    async checkCodeExists(code, excludeId = null) {
      try {
        let query = supabase
          .from('assets')
          .select('id')
          .eq('code', code);

        if (excludeId) {
          query = query.neq('id', excludeId);
        }

        const { data, error } = await query;

        if (error) throw error;
        return { success: true, exists: data.length > 0 };
      } catch (error) {
        console.error('Erro ao verificar código:', error);
        return { success: false, error: error.message };
      }
    }
  }
};

// =================== ÍCONES SVG ===================
const Icons = {
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
  Building: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Package: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
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
  Database: () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
      <path d="m3 5 0 14c0 1.6 4 3 9 3s9-1.4 9-3V5"></path>
      <path d="m3 12c0 1.6 4 3 9 3s9-1.4 9-3"></path>
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
  DollarSign: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12,6 12,12 16,14"></polyline>
    </svg>
  ),
  XCircle: () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
  ),
  X: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Download: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  Tag: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  Image: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21,15 16,10 5,21"></polyline>
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polyline points="20,6 9,17 4,12"></polyline>
    </svg>
  ),
  RotateCcw: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polyline points="1,4 1,10 7,10"></polyline>
      <path d="M3.51,15a9,9,0,0,0,13.48,2.55"></path>
      <path d="M20.49,9A9,9,0,0,0,7,6.54L1,10"></path>
    </svg>
  ),
  AlertCircle: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  LogOut: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
};

// =================== COMPONENTE DE AUTENTICAÇÃO ===================
const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { signIn, signUp } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let result;
      
      if (isLogin) {
        result = await signIn(formData.email, formData.password);
      } else {
        if (formData.name.length < 2) {
          setMessage('❌ Nome deve ter pelo menos 2 caracteres');
          return;
        }
        result = await signUp(formData.email, formData.password, formData.name, formData.company);
      }

      if (result.success) {
        if (isLogin) {
          onClose();
        } else {
          setMessage('✅ Conta criada! Verifique seu e-mail para confirmação.');
        }
      } else {
        setMessage(`❌ ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icons.X />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.User />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isLogin ? '🔑 Entrar' : '📝 Criar Conta'}
          </h2>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Acesse sua conta' : 'Crie sua conta gratuita'}
          </p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${
            message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  minLength="2"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa (opcional)
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  placeholder="Nome da sua empresa"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha *
            </label>
            <input
              type="password"
              required
              minLength="6"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors transform hover:scale-105"
          >
            {loading ? '⏳ Processando...' : (isLogin ? '🔑 Entrar' : '📝 Criar Conta')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage('');
              setFormData({ email: '', password: '', name: '', company: '' });
            }}
            className="text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            {isLogin ? '📝 Não tem conta? Criar agora' : '🔑 Já tem conta? Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// =================== COMPONENTE PRINCIPAL ===================
const AssetControlSystem = () => {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  
  // Estados principais
  const [activeTab, setActiveTab] = useState('dashboard');
  const [floors, setFloors] = useState([]);
  const [assets, setAssets] = useState([]);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssetDetail, setShowAssetDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Estados específicos para foto
  const [photoState, setPhotoState] = useState({
    showOptions: false,
    showPreview: false,
    capturedPhoto: null,
    isProcessing: false,
    error: ''
  });

  // Estados dos formulários
  const [assetForm, setAssetForm] = useState({
    name: '',
    code: '',
    category: '',
    description: '',
    value: '',
    status: 'Ativo',
    floor_id: '',
    room_id: '',
    photo: null,
    supplier: '',
    serial_number: ''
  });

  const [roomForm, setRoomForm] = useState({
    name: '',
    description: '',
    floor_id: ''
  });

  const categories = [
    'Informática', 'Móveis', 'Equipamentos', 'Veículos', 
    'Eletroeletrônicos', 'Ferramentas', 'Segurança', 'Outros'
  ];

  const statuses = ['Ativo', 'Inativo', 'Manutenção', 'Descartado'];

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
      const [floorsResult, assetsResult] = await Promise.all([
        dataService.floors.getAll(),
        dataService.assets.getAll()
      ]);

      if (floorsResult.success) {
        setFloors(floorsResult.data);
      } else {
        console.error('Erro ao carregar andares:', floorsResult.error);
      }

      if (assetsResult.success) {
        setAssets(assetsResult.data);
      } else {
        console.error('Erro ao carregar ativos:', assetsResult.error);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // =================== FUNÇÕES DE FOTO ===================
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

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('A imagem deve ter no máximo 10MB.');
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

  const confirmPhoto = () => {
    if (photoState.capturedPhoto) {
      setAssetForm(prev => ({ ...prev, photo: photoState.capturedPhoto }));
      closeAllPhotoModals();
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
    setAssetForm(prev => ({ ...prev, photo: null }));
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
        await loadData(); // Recarregar dados
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
      
      // Verificar se há ativos na sala
      const assetsInRoom = assets.filter(asset => asset.room_id === roomId);
      if (assetsInRoom.length > 0) {
        alert(`Não é possível excluir esta sala pois existem ${assetsInRoom.length} ativo(s) cadastrado(s) nela.`);
        return;
      }

      const result = await dataService.rooms.delete(roomId);
      
      if (result.success) {
        await loadData(); // Recarregar dados
      } else {
        alert(`Erro ao excluir sala: ${result.error}`);
      }
    } catch (error) {
      alert(`Erro ao excluir sala: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // =================== FUNÇÕES DE ATIVOS ===================
  const handleSaveAsset = async () => {
    if (!assetForm.name?.trim()) {
      alert('Por favor, preencha o nome do ativo.');
      return;
    }
    
    if (!assetForm.code?.trim()) {
      alert('Por favor, preencha o código do ativo.');
      return;
    }
    
    if (!assetForm.floor_id || !assetForm.room_id) {
      alert('Por favor, selecione o andar e a sala.');
      return;
    }

    try {
      setIsLoading(true);

      // Verificar se código já existe
      if (!editingAsset) {
        const codeCheck = await dataService.assets.checkCodeExists(assetForm.code);
        if (codeCheck.success && codeCheck.exists) {
          alert('Já existe um ativo com este código.');
          return;
        }
      }

      const assetData = {
        name: assetForm.name.trim(),
        code: assetForm.code.trim(),
        category: assetForm.category || null,
        description: assetForm.description?.trim() || null,
        value: assetForm.value ? parseFloat(assetForm.value) : null,
        status: assetForm.status || 'Ativo',
        floor_id: parseInt(assetForm.floor_id),
        room_id: parseInt(assetForm.room_id),
        photo: assetForm.photo || null,
        supplier: assetForm.supplier?.trim() || null,
        serial_number: assetForm.serial_number?.trim() || null
      };

      let result;
      if (editingAsset) {
        result = await dataService.assets.update(editingAsset.id, assetData);
      } else {
        result = await dataService.assets.create(assetData);
      }

      if (result.success) {
        await loadData(); // Recarregar dados
        resetAssetForm();
        setShowAssetForm(false);
        setEditingAsset(null);
      } else {
        alert(`Erro ao ${editingAsset ? 'atualizar' : 'criar'} ativo: ${result.error}`);
      }
    } catch (error) {
      alert(`Erro ao ${editingAsset ? 'atualizar' : 'criar'} ativo: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setAssetForm({
      name: asset.name,
      code: asset.code,
      category: asset.category || '',
      description: asset.description || '',
      value: asset.value || '',
      status: asset.status || 'Ativo',
      floor_id: asset.floor_id?.toString() || '',
      room_id: asset.room_id?.toString() || '',
      photo: asset.photo || null,
      supplier: asset.supplier || '',
      serial_number: asset.serial_number || ''
    });
    setShowAssetForm(true);
  };

  const handleDeleteAsset = async (assetId) => {
    if (!confirm('Tem certeza que deseja excluir este ativo?')) return;

    try {
      setIsLoading(true);
      
      const result = await dataService.assets.delete(assetId);
      
      if (result.success) {
        await loadData(); // Recarregar dados
      } else {
        alert(`Erro ao excluir ativo: ${result.error}`);
      }
    } catch (error) {
      alert(`Erro ao excluir ativo: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAssetForm = () => {
    setAssetForm({
      name: '',
      code: '',
      category: '',
      description: '',
      value: '',
      status: 'Ativo',
      floor_id: '',
      room_id: '',
      photo: null,
      supplier: '',
      serial_number: ''
    });
    closeAllPhotoModals();
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

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (asset.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getDashboardStats = () => {
    const total = assets.length;
    const active = assets.filter(a => a.status === 'Ativo').length;
    const maintenance = assets.filter(a => a.status === 'Manutenção').length;
    const inactive = assets.filter(a => a.status === 'Inativo').length;
    const totalValue = assets.reduce((sum, asset) => sum + (parseFloat(asset.value) || 0), 0);

    return {
      total,
      active,
      maintenance,
      inactive,
      totalValue,
      totalRooms: floors.reduce((sum, floor) => sum + (floor.rooms?.length || 0), 0)
    };
  };

  const stats = getDashboardStats();

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      'Ativo': { color: 'bg-green-100 text-green-800', icon: Icons.CheckCircle },
      'Manutenção': { color: 'bg-red-100 text-red-800', icon: Icons.Clock },
      'Inativo': { color: 'bg-gray-100 text-gray-800', icon: Icons.XCircle },
      'Descartado': { color: 'bg-gray-100 text-gray-800', icon: Icons.X }
    };
    
    const config = statusConfig[status] || statusConfig['Ativo'];
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent />
        <span className="ml-1">{status}</span>
      </span>
    );
  };

  const handleLogout = async () => {
    if (confirm('Tem certeza que deseja sair?')) {
      const result = await signOut();
      if (result.success) {
        setFloors([]);
        setAssets([]);
        setActiveTab('dashboard');
      }
    }
  };

  // =================== LOADING DE AUTENTICAÇÃO ===================
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Icons.Database />
          </div>
          <p className="text-gray-600 text-lg">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  // =================== TELA DE LOGIN ===================
  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Icons.Package />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">AssetManager Pro</h1>
              <p className="text-gray-600">Sistema completo de controle de ativos com fotos</p>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Bem-vindo!</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3 text-gray-700">
                  <Icons.CheckCircle />
                  <span>📷 Fotos dos ativos com câmera</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Icons.CheckCircle />
                  <span>🏢 Gestão de localizações</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Icons.CheckCircle />
                  <span>📊 Relatórios automáticos</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Icons.CheckCircle />
                  <span>🔒 Dados seguros na nuvem</span>
                </div>
              </div>

              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
              >
                🚀 Começar Agora
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Gratuito para sempre • Sem cartão de crédito
              </p>
            </div>
          </div>
        </div>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  // =================== SISTEMA PRINCIPAL ===================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                  <Icons.Package />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg md:text-xl font-bold text-gray-900">AssetManager Pro</h1>
                  <p className="text-xs md:text-sm text-gray-500">Sistema de Controle de Ativos</p>
                </div>
                <div className="sm:hidden">
                  <h1 className="text-lg font-bold text-gray-900">AssetManager</h1>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Icons.Package />
                  <span>{stats.total} ativos</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icons.Building />
                  <span>{stats.totalRooms} salas</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icons.DollarSign />
                  <span>R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              
              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <Icons.User />
                  <span className="text-sm font-medium text-gray-700">
                    {profile?.name || user.email}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="Sair"
                >
                  <Icons.LogOut />
                  <span className="hidden md:inline">Sair</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-1 mt-4 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Icons.Home, shortLabel: 'Home' },
              { id: 'assets', label: 'Ativos', icon: Icons.Package, shortLabel: 'Ativos' },
              { id: 'locations', label: 'Localizações', icon: Icons.Building, shortLabel: 'Local' },
              { id: 'reports', label: 'Relatórios', icon: Icons.BarChart3, shortLabel: 'Report' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
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

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-6">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 md:space-y-6">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h2>
              {profile && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Bem-vindo,</p>
                  <p className="font-semibold text-gray-900">{profile.name}</p>
                  {profile.company && (
                    <p className="text-xs text-gray-500">{profile.company}</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Total de Ativos</p>
                    <p className="text-xl md:text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Icons.Package />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Ativos Ativos</p>
                    <p className="text-xl md:text-3xl font-bold text-green-600">{stats.active}</p>
                  </div>
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Icons.CheckCircle />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Em Manutenção</p>
                    <p className="text-xl md:text-3xl font-bold text-red-600">{stats.maintenance}</p>
                  </div>
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Icons.Clock />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Valor Total</p>
                    <p className="text-lg md:text-3xl font-bold text-red-600">
                      R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Icons.DollarSign />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-base md:text-lg font-semibold mb-4">Ações Rápidas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setActiveTab('assets');
                    setShowAssetForm(true);
                  }}
                  className="flex items-center space-x-3 p-3 md:p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Icons.Plus />
                  <span className="text-red-600 font-medium">Adicionar Ativo</span>
                </button>
                
                <button
                  onClick={() => {
                    setActiveTab('locations');
                    setShowRoomForm(true);
                  }}
                  className="flex items-center space-x-3 p-3 md:p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Icons.Building />
                  <span className="text-blue-600 font-medium">Adicionar Sala</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ativos */}
        {activeTab === 'assets' && (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Gestão de Ativos</h2>
                
                <button
                  onClick={() => setShowAssetForm(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 text-sm transition-colors"
                >
                  <Icons.Plus />
                  <span>Novo Ativo</span>
                </button>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Icons.Search />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por nome, código ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12 bg-white rounded-xl">
                  <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Carregando ativos...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAssets.map(asset => (
                    <div key={asset.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {asset.photo ? (
                            <img src={asset.photo} alt={asset.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icons.Package />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{asset.name}</h3>
                          <p className="text-xs text-gray-500 font-mono">{asset.code}</p>
                          {asset.category && (
                            <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                              {asset.category}
                            </span>
                          )}
                          
                          <div className="mt-2 flex items-center justify-between">
                            <StatusBadge status={asset.status} />
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => setShowAssetDetail(asset)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Icons.Eye />
                              </button>
                              <button
                                onClick={() => handleEditAsset(asset)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              >
                                <Icons.Edit />
                              </button>
                              <button
                                onClick={() => handleDeleteAsset(asset.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Icons.Trash2 />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredAssets.length === 0 && !isLoading && (
                    <div className="col-span-full text-center py-12 bg-white rounded-xl">
                      <Icons.Package />
                      <p className="mt-4 text-gray-500">Nenhum ativo encontrado</p>
                      <button
                        onClick={() => setShowAssetForm(true)}
                        className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Adicionar Primeiro Ativo
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
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Gestão de Localizações</h2>
              <button
                onClick={() => setShowRoomForm(true)}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <Icons.Plus />
                <span>Nova Sala</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {floors.map(floor => (
                <div key={floor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 md:px-6 py-4">
                    <h3 className="font-semibold text-white flex items-center space-x-2">
                      <Icons.Building />
                      <span className="text-sm md:text-base">{floor.name}</span>
                    </h3>
                    {floor.description && (
                      <p className="text-red-100 text-xs md:text-sm mt-1">{floor.description}</p>
                    )}
                  </div>
                  
                  <div className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs md:text-sm text-gray-500">
                        {floor.rooms?.length || 0} sala(s)
                      </span>
                      <span className="text-xs md:text-sm text-gray-500">
                        {assets.filter(a => a.floor_id === floor.id).length} ativo(s)
                      </span>
                    </div>
                    
                    {!floor.rooms || floor.rooms.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-8">Nenhuma sala cadastrada</p>
                    ) : (
                      <div className="space-y-3">
                        {floor.rooms.map(room => (
                          <div key={room.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{room.name}</div>
                              {room.description && (
                                <div className="text-xs text-gray-500 mt-1 truncate">{room.description}</div>
                              )}
                            </div>
                            <div className="flex space-x-1 ml-2 flex-shrink-0">
                              <button
                                onClick={() => handleEditRoom(room)}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              >
                                <Icons.Edit />
                              </button>
                              <button
                                onClick={() => handleDeleteRoom(room.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
              
              {floors.length === 0 && !isLoading && (
                <div className="col-span-full text-center py-12 bg-white rounded-xl">
                  <Icons.Building />
                  <p className="mt-4 text-gray-500">Nenhum andar encontrado</p>
                  <p className="text-sm text-gray-400 mt-2">Os andares padrão serão criados automaticamente</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Relatórios */}
        {activeTab === 'reports' && (
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 px-2">Relatórios</h2>
            
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-base md:text-lg font-semibold mb-4">Resumo por Status</h3>
              <div className="space-y-4">
                {statuses.map(status => {
                  const count = assets.filter(a => a.status === status).length;
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <StatusBadge status={status} />
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 md:w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-600 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8 md:w-12 text-right">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Relatório por Categoria */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-base md:text-lg font-semibold mb-4">Resumo por Categoria</h3>
              <div className="space-y-4">
                {categories.map(category => {
                  const count = assets.filter(a => a.category === category).length;
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  const value = assets
                    .filter(a => a.category === category)
                    .reduce((sum, asset) => sum + (parseFloat(asset.value) || 0), 0);
                  
                  if (count === 0) return null;
                  
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          {category}
                        </span>
                        <span className="text-sm text-gray-600">{count} itens</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 md:w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 font-medium w-20 text-right">
                          R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =================== MODAIS DE FOTO =================== */}
      
      {/* Modal de Opções de Foto */}
      {photoState.showOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl transform transition-all">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.Camera />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Adicionar Foto</h3>
              <p className="text-sm text-gray-600">Como você gostaria de adicionar a foto do ativo?</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleTakePhoto}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 px-4 rounded-xl flex items-center justify-center space-x-3 transition-all transform hover:scale-105 shadow-lg"
              >
                <Icons.Camera />
                <div className="text-left">
                  <div className="font-semibold">📷 Tirar Foto</div>
                  <div className="text-sm opacity-90">Usar câmera do celular</div>
                </div>
              </button>
              
              <button
                onClick={handleSelectFromGallery}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-4 rounded-xl flex items-center justify-center space-x-3 transition-all transform hover:scale-105 shadow-lg"
              >
                <Icons.Image />
                <div className="text-left">
                  <div className="font-semibold">🖼️ Galeria</div>
                  <div className="text-sm opacity-90">Escolher foto existente</div>
                </div>
              </button>
              
              <button
                onClick={closeAllPhotoModals}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-xl transition-all"
              >
                ❌ Cancelar
              </button>
            </div>
            
            <div className="mt-6 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start space-x-2">
                <Icons.AlertCircle />
                <div className="text-xs text-blue-800">
                  <p className="font-medium">💡 Dica:</p>
                  <p>Permita o acesso à câmera quando solicitado. Use boa iluminação para melhor qualidade.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Preview da Foto */}
      {photoState.showPreview && photoState.capturedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Preview da Foto</h3>
                <button
                  onClick={closeAllPhotoModals}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Icons.X />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="w-full bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
                  <img 
                    src={photoState.capturedPhoto} 
                    alt="Foto capturada" 
                    className="w-full h-auto max-h-80 object-contain"
                  />
                </div>
                
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={confirmPhoto}
                    className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-4 rounded-xl flex items-center justify-center space-x-2 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <Icons.Check />
                    <span className="font-semibold">✅ Usar Esta Foto</span>
                  </button>
                  
                  <button
                    onClick={retakePhoto}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all"
                  >
                    <Icons.RotateCcw />
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processando Foto</h3>
            <p className="text-gray-600">Aguarde um momento...</p>
          </div>
        </div>
      )}

      {/* Erro de Foto */}
      {photoState.error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-xl shadow-2xl z-[9999] max-w-sm animate-pulse">
          <div className="flex items-start space-x-2">
            <Icons.AlertCircle />
            <div>
              <p className="font-semibold">❌ Erro na Foto</p>
              <p className="text-sm">{photoState.error}</p>
            </div>
            <button
              onClick={() => setPhotoState(prev => ({ ...prev, error: '' }))}
              className="ml-auto hover:bg-red-600 rounded p-1 transition-colors"
            >
              <Icons.X />
            </button>
          </div>
        </div>
      )}

      {/* =================== MODAIS DE FORMULÁRIOS =================== */}

      {/* Modal de cadastro de ativo */}
      {showAssetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  {editingAsset ? 'Editar Ativo' : 'Novo Ativo'}
                </h3>
                <button
                  onClick={() => {
                    setShowAssetForm(false);
                    setEditingAsset(null);
                    resetAssetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Icons.X />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Ativo *</label>
                    <input
                      type="text"
                      value={assetForm.name}
                      onChange={(e) => setAssetForm({...assetForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      placeholder="Ex: Notebook Dell Inspiron"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Código *</label>
                    <input
                      type="text"
                      value={assetForm.code}
                      onChange={(e) => setAssetForm({...assetForm, code: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      placeholder="Ex: NB001"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                    <select
                      value={assetForm.category}
                      onChange={(e) => setAssetForm({...assetForm, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={assetForm.status}
                      onChange={(e) => setAssetForm({...assetForm, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Andar *</label>
                    <select
                      value={assetForm.floor_id}
                      onChange={(e) => setAssetForm({...assetForm, floor_id: e.target.value, room_id: ''})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                    >
                      <option value="">Selecione um andar</option>
                      {floors.map(floor => (
                        <option key={floor.id} value={floor.id}>{floor.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sala *</label>
                    <select
                      value={assetForm.room_id}
                      onChange={(e) => setAssetForm({...assetForm, room_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      disabled={!assetForm.floor_id}
                    >
                      <option value="">Selecione uma sala</option>
                      {getRoomsForFloor(assetForm.floor_id).map(room => (
                        <option key={room.id} value={room.id}>{room.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* SEÇÃO DE FOTO - FUNCIONAL E INTEGRADA */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">📷 Foto do Ativo</label>
                    <div className="space-y-3">
                      {assetForm.photo ? (
                        <div className="relative">
                          <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
                            <img 
                              src={assetForm.photo} 
                              alt="Foto do ativo" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex space-x-2 mt-3">
                            <button
                              type="button"
                              onClick={openPhotoOptions}
                              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 text-sm font-medium transition-colors"
                            >
                              <Icons.Camera />
                              <span>📷 Alterar Foto</span>
                            </button>
                            <button
                              type="button"
                              onClick={removePhotoFromForm}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg flex items-center justify-center transition-colors"
                            >
                              <Icons.Trash2 />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          onClick={openPhotoOptions}
                          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition-all duration-200 bg-gray-50"
                        >
                          <div className="text-center p-6">
                            <Icons.Camera />
                            <p className="text-gray-600 font-medium mt-3">📷 Clique para adicionar foto</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Tire uma foto ou escolha da galeria
                            </p>
                            <div className="mt-3 inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              <Icons.Camera />
                              <span className="ml-1">Recomendado</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={assetForm.value}
                      onChange={(e) => setAssetForm({...assetForm, value: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      placeholder="Ex: 2500.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fornecedor</label>
                    <input
                      type="text"
                      value={assetForm.supplier}
                      onChange={(e) => setAssetForm({...assetForm, supplier: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      placeholder="Ex: Dell Brasil"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Número de Série</label>
                    <input
                      type="text"
                      value={assetForm.serial_number}
                      onChange={(e) => setAssetForm({...assetForm, serial_number: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      placeholder="Ex: DL24001"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <textarea
                  value={assetForm.description}
                  onChange={(e) => setAssetForm({...assetForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  placeholder="Descrição detalhada do ativo..."
                />
              </div>
              
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => {
                    setShowAssetForm(false);
                    setEditingAsset(null);
                    resetAssetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveAsset}
                  disabled={isLoading}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {isLoading ? '⏳ Salvando...' : (editingAsset ? 'Atualizar' : 'Salvar')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cadastro de sala */}
      {showRoomForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  {editingRoom ? 'Editar Sala' : 'Nova Sala'}
                </h3>
                <button
                  onClick={() => {
                    setShowRoomForm(false);
                    setEditingRoom(null);
                    setRoomForm({ name: '', description: '', floor_id: '' });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Icons.X />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Sala *</label>
                  <input
                    type="text"
                    value={roomForm.name}
                    onChange={(e) => setRoomForm({...roomForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                    placeholder="Ex: Sala de Reuniões A"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Andar *</label>
                  <select
                    value={roomForm.floor_id}
                    onChange={(e) => setRoomForm({...roomForm, floor_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  >
                    <option value="">Selecione um andar</option>
                    {floors.map(floor => (
                      <option key={floor.id} value={floor.id}>{floor.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                  <textarea
                    value={roomForm.description}
                    onChange={(e) => setRoomForm({...roomForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                    placeholder="Descrição da sala..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowRoomForm(false);
                    setEditingRoom(null);
                    setRoomForm({ name: '', description: '', floor_id: '' });
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveRoom}
                  disabled={isLoading}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {isLoading ? '⏳ Salvando...' : (editingRoom ? 'Atualizar' : 'Salvar')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalhes do ativo */}
      {showAssetDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Detalhes do Ativo</h3>
                <button
                  onClick={() => setShowAssetDetail(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Icons.X />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <p className="text-base text-gray-900">{showAssetDetail.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                    <p className="text-base text-gray-900 font-mono">{showAssetDetail.code}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      {showAssetDetail.category || 'Sem categoria'}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <StatusBadge status={showAssetDetail.status} />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                    <p className="text-base text-gray-900">
                      {getFloorName(showAssetDetail.floor_id)} - {getRoomName(showAssetDetail.room_id)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                    <p className="text-base text-gray-900 font-semibold">
                      {showAssetDetail.value ? 
                        `R$ ${parseFloat(showAssetDetail.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
                        'Não informado'
                      }
                    </p>
                  </div>

                  {showAssetDetail.supplier && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                      <p className="text-base text-gray-900">{showAssetDetail.supplier}</p>
                    </div>
                  )}

                  {showAssetDetail.serial_number && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número de Série</label>
                      <p className="text-base text-gray-900 font-mono">{showAssetDetail.serial_number}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Foto</label>
                    <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden border">
                      {showAssetDetail.photo ? (
                        <img 
                          src={showAssetDetail.photo} 
                          alt={showAssetDetail.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <Icons.Camera />
                            <span className="text-gray-500 mt-2 block">Nenhuma foto disponível</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {showAssetDetail.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-base text-gray-900">{showAssetDetail.description}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Informações do Sistema</label>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm text-gray-600">
                      <p><strong>Criado em:</strong> {new Date(showAssetDetail.created_at).toLocaleDateString('pt-BR')}</p>
                      <p><strong>Última atualização:</strong> {new Date(showAssetDetail.updated_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => {
                    setShowAssetDetail(null);
                    handleEditAsset(showAssetDetail);
                  }}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => setShowAssetDetail(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
      <AssetControlSystem />
    </AuthProvider>
  );
};

export default App;
