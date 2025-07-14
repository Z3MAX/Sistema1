import { sql } from '../config/database';
import bcrypt from 'bcryptjs';

// Serviço de autenticação
export const authService = {
  // Registrar novo usuário
  async register(userData) {
    try {
      const { name, email, password, company } = userData;
      
      // Verificar se o email já existe
      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${email}
      `;
      
      if (existingUser.length > 0) {
        throw new Error('Email já cadastrado');
      }
      
      // Criptografar senha
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // Inserir usuário
      const result = await sql`
        INSERT INTO users (name, email, password_hash, company)
        VALUES (${name}, ${email}, ${passwordHash}, ${company})
        RETURNING id, name, email, company, role, created_at
      `;
      
      return {
        success: true,
        user: result[0]
      };
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Fazer login
  async login(credentials) {
    try {
      const { email, password } = credentials;
      
      // Buscar usuário por email
      const users = await sql`
        SELECT id, name, email, password_hash, company, role
        FROM users 
        WHERE email = ${email}
      `;
      
      if (users.length === 0) {
        throw new Error('Email ou senha incorretos');
      }
      
      const user = users[0];
      
      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isPasswordValid) {
        throw new Error('Email ou senha incorretos');
      }
      
      // Remover hash da senha do retorno
      const { password_hash, ...userWithoutPassword } = user;
      
      return {
        success: true,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Verificar se usuário existe
  async getUserById(id) {
    try {
      const users = await sql`
        SELECT id, name, email, company, role, created_at
        FROM users 
        WHERE id = ${id}
      `;
      
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  },

  // Atualizar perfil do usuário
  async updateProfile(userId, userData) {
    try {
      const { name, company } = userData;
      
      const result = await sql`
        UPDATE users 
        SET name = ${name}, company = ${company}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
        RETURNING id, name, email, company, role, created_at
      `;
      
      return {
        success: true,
        user: result[0]
      };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Alterar senha
  async changePassword(userId, oldPassword, newPassword) {
    try {
      // Buscar usuário
      const users = await sql`
        SELECT password_hash FROM users WHERE id = ${userId}
      `;
      
      if (users.length === 0) {
        throw new Error('Usuário não encontrado');
      }
      
      // Verificar senha atual
      const isOldPasswordValid = await bcrypt.compare(oldPassword, users[0].password_hash);
      
      if (!isOldPasswordValid) {
        throw new Error('Senha atual incorreta');
      }
      
      // Criptografar nova senha
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
      
      // Atualizar senha
      await sql`
        UPDATE users 
        SET password_hash = ${newPasswordHash}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
      `;
      
      return {
        success: true,
        message: 'Senha alterada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default authService;