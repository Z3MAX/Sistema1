import React, { useState } from 'react';

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
    
    // Limpar erros ao digitar
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
        // Simular login
        console.log('🔐 Fazendo login...');
        
        // Verificar se usuário existe no localStorage
        const existingUsers = JSON.parse(localStorage.getItem('dellUsers') || '[]');
        const user = existingUsers.find(u => u.email === formData.email);
        
        if (user && user.password === formData.password) {
          console.log('✅ Login realizado com sucesso');
          onLogin(user);
        } else {
          // Criar usuário demo se não existir
          const demoUser = {
            id: Date.now(),
            email: formData.email,
            name: 'Usuário Demo',
            company: 'Dell Technologies',
            password: formData.password
          };
          
          // Salvar usuário
          existingUsers.push(demoUser);
          localStorage.setItem('dellUsers', JSON.stringify(existingUsers));
          
          onLogin(demoUser);
        }
      } else {
        // Registrar usuário
        console.log('📝 Registrando usuário...');
        
        const existingUsers = JSON.parse(localStorage.getItem('dellUsers') || '[]');
        
        // Verificar se email já existe
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
      console.error('❌ Erro na autenticação:', error);
      setError('Erro interno. Usando modo demonstração.');
      
      // Modo demonstração em caso de erro
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

  const Icons = {
    Eye: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    EyeOff: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M18.364 18.364L16.95 16.95M18.364 18.364L20.05 20.05M16.95 16.95L13.414 13.414" />
      </svg>
    ),
    Mail: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    Lock: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    User: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    Building: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    Laptop: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
    )
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
              <Icons.Laptop />
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
                    <Icons.User />
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
                  <Icons.Mail />
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
                    <Icons.Building />
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
                  <Icons.Lock />
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
                  {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
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
                    <Icons.Lock />
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
                    {showConfirmPassword ? <Icons.EyeOff /> : <Icons.Eye />}
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

export default AuthComponent;
