// src/services/authService.js
import database from '../config/database';

const { sql } = database;

console.log('✅ authService inicializado', sql ? 'com Neon' : '(modo offline)');

// Função simples para hash de senha (substitui bcrypt)
const simpleHash = (password) => {
  return btoa(password + 'dell_laptop_salt_2024'); // Base64 encoding com salt
};

const verifyPassword = (password, hash) => {
  return simpleHash(password) === hash;
};

// Função para tratar erros de banco
const handleDatabaseError = (operation, error) => {
  console.error(`❌ ERRO de banco na operação: ${operation}`, error);
  
  // Diagnóstico específico
  if (error.message.includes('connection')) {
    console.error('🔧 DIAGNÓSTICO: Problema de conexão com banco');
    console.error('   ❌ Verificar se o banco Neon está ativo');
  } else if (error.message.includes('duplicate key') || error.message.includes('unique')) {
    console.error('🔧 DIAGNÓSTICO: Email já existe');
  } else if (error.message.includes('not found') || error.message.includes('does not exist')) {
    console.error('🔧 DIAGNÓSTICO: Usuário não encontrado');
  }
  
  return {
    success: false,
    error: `Erro no banco de dados: ${error.message}`,
    operation: operation
  };
};

// Serviço de autenticação que funciona APENAS com banco Neon
export const authService = {
  // Registrar novo usuário
  async register(userData) {
    if (!sql) return { success: false, error: 'Banco de dados não configurado. Configure VITE_NEON_DATABASE_URL.' };
    try {
      const { name, email, password, company } = userData;
      
      // Verificar se o email já existe
      console.log('🔍 Verificando se email já existe...');
      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${email}
      `;
      console.log('📊 Resultado da verificação:', existingUser.length, 'usuários encontrados');
      
      if (existingUser.length > 0) {
        console.log('⚠️ Email já existe no banco');
        return { success: false, error: 'Email já cadastrado' };
      }
      
      // Criptografar senha
      console.log('🔐 Criptografando senha...');
      const passwordHash = simpleHash(password);
      console.log('✅ Senha criptografada');
      
      // Inserir usuário no banco (deixar PostgreSQL auto-gerar ID)
      console.log('📝 Inserindo usuário no banco...');
      console.log('📋 Dados para inserção:', {
        name: name,
        email: email,
        company: company || '',
        passwordHash: passwordHash ? '[HASH_GERADO]' : '[ERRO_NO_HASH]'
      });
      
      const result = await sql`
        INSERT INTO users (name, email, password_hash, company)
        VALUES (${name}, ${email}, ${passwordHash}, ${company || ''})
        RETURNING id, name, email, company, role, created_at
      `;
      
      console.log('✅ USUÁRIO INSERIDO COM SUCESSO!');
      console.log('📊 Resultado da inserção:', result);
      console.log('🆔 ID gerado:', result[0].id);
      console.log('👤 Nome salvo:', result[0].name);
      console.log('📧 Email salvo:', result[0].email);
      console.log('🏢 Empresa salva:', result[0].company);
      
      // Verificar se realmente inseriu
      console.log('🔍 Verificando se usuário foi realmente inserido...');
      const verification = await sql`
        SELECT id, name, email, company FROM users WHERE email = ${email}
      `;
      console.log('📊 Verificação:', verification.length, 'usuários encontrados');
      if (verification.length > 0) {
        console.log('✅ CONFIRMADO: Usuário existe no banco!');
        console.log('📋 Dados verificados:', verification[0]);
      } else {
        console.error('❌ ERRO: Usuário não foi encontrado após inserção!');
      }
      
      return { success: true, user: result[0] };
      
    } catch (error) {
      console.error('❌ ERRO CRÍTICO NO REGISTRO:', error);
      console.error('❌ Tipo do erro:', error.constructor.name);
      console.error('❌ Mensagem:', error.message);
      console.error('❌ Stack:', error.stack);
      return handleDatabaseError('register', error);
    }
  },

  // Fazer login
  async login(credentials) {
    if (!sql) return { success: false, error: 'Banco de dados não configurado. Configure VITE_NEON_DATABASE_URL.' };
    try {
      const { email, password } = credentials;
      
      // Buscar usuário no banco
      const users = await sql`
        SELECT id, name, email, password_hash, company, role, created_at
        FROM users 
        WHERE email = ${email}
      `;
      
      if (users.length === 0) {
        console.log('❌ Usuário não encontrado no banco');
        return { success: false, error: 'Email ou senha incorretos' };
      }
      
      const user = users[0];
      console.log('✅ Usuário encontrado no banco:', user.id);
      
      // Verificar senha
      const isPasswordValid = verifyPassword(password, user.password_hash);
      
      if (!isPasswordValid) {
        console.log('❌ Senha incorreta para usuário:', user.id);
        return { success: false, error: 'Email ou senha incorretos' };
      }
      
      // Remover hash da senha do retorno
      const { password_hash, ...userWithoutPassword } = user;
      
      console.log('✅ Login realizado com sucesso:', userWithoutPassword.id);
      return { success: true, user: userWithoutPassword };
      
    } catch (error) {
      return handleDatabaseError('login', error);
    }
  },

  // Buscar usuário por ID
  async getUserById(id) {
    if (!sql) return null;
    try {
      const users = await sql`
        SELECT id, name, email, company, role, created_at
        FROM users 
        WHERE id = ${id}
      `;
      
      if (users.length === 0) {
        console.log('❌ Usuário não encontrado no banco');
        return null;
      }
      
      console.log('✅ Usuário encontrado no banco');
      return users[0];
      
    } catch (error) {
      console.error('❌ Erro ao buscar usuário por ID:', error);
      return null;
    }
  },

  // Atualizar perfil do usuário
  async updateProfile(userId, userData) {
    console.log('🔄 Atualizando perfil no banco. ID:', userId);
    
    try {
      const { name, company } = userData;
      
      const result = await sql`
        UPDATE users 
        SET name = ${name}, company = ${company}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
        RETURNING id, name, email, company, role, created_at
      `;
      
      if (result.length === 0) {
        throw new Error('Usuário não encontrado');
      }
      
      console.log('✅ Perfil atualizado no banco');
      return { success: true, user: result[0] };
      
    } catch (error) {
      return handleDatabaseError('updateProfile', error);
    }
  },

  // Alterar senha
  async changePassword(userId, oldPassword, newPassword) {
    console.log('🔄 Alterando senha no banco. ID:', userId);
    
    try {
      // Buscar senha atual
      const users = await sql`
        SELECT password_hash FROM users WHERE id = ${userId}
      `;
      
      if (users.length === 0) {
        throw new Error('Usuário não encontrado');
      }
      
      const currentPasswordHash = users[0].password_hash;
      
      // Verificar senha atual
      const isOldPasswordValid = verifyPassword(oldPassword, currentPasswordHash);
      
      if (!isOldPasswordValid) {
        console.log('❌ Senha atual incorreta');
        return { success: false, error: 'Senha atual incorreta' };
      }
      
      // Criptografar nova senha
      const newPasswordHash = simpleHash(newPassword);
      
      // Atualizar senha no banco
      await sql`
        UPDATE users 
        SET password_hash = ${newPasswordHash}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
      `;
      
      console.log('✅ Senha alterada no banco');
      return { success: true, message: 'Senha alterada com sucesso' };
      
    } catch (error) {
      return handleDatabaseError('changePassword', error);
    }
  },

  // Buscar usuários (para admin)
  async getAllUsers() {
    console.log('🔄 Buscando todos os usuários no banco');
    
    try {
      const users = await sql`
        SELECT id, name, email, company, role, created_at
        FROM users 
        ORDER BY created_at DESC
      `;
      
      console.log(`✅ ${users.length} usuários encontrados no banco`);
      return { success: true, users: users };
      
    } catch (error) {
      return handleDatabaseError('getAllUsers', error);
    }
  },

  // Deletar usuário
  async deleteUser(userId) {
    console.log('🔄 Deletando usuário do banco. ID:', userId);
    
    try {
      const result = await sql`
        DELETE FROM users 
        WHERE id = ${userId}
        RETURNING id
      `;
      
      if (result.length === 0) {
        throw new Error('Usuário não encontrado');
      }
      
      console.log('✅ Usuário deletado do banco');
      return { success: true, message: 'Usuário deletado com sucesso' };
      
    } catch (error) {
      return handleDatabaseError('deleteUser', error);
    }
  },

  // Verificar se email existe
  async checkEmailExists(email) {
    console.log('🔄 Verificando se email existe no banco:', email);
    
    try {
      const users = await sql`
        SELECT id FROM users WHERE email = ${email}
      `;
      
      const exists = users.length > 0;
      console.log(`✅ Email ${exists ? 'EXISTS' : 'NOT_EXISTS'} no banco`);
      return { success: true, exists: exists };
      
    } catch (error) {
      return handleDatabaseError('checkEmailExists', error);
    }
  }
};


export default authService;
