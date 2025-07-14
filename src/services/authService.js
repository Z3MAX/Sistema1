import database from '../config/database';
import bcrypt from 'bcryptjs';

const { sql } = database;

// Serviço de autenticação
export const authService = {
  // Registrar novo usuário
  async register(userData) {
    try {
      const { name, email, password, company } = userData;
      
      console.log('🔄 Tentando registrar usuário:', email);
      
      // Verificar se o email já existe
      try {
        const existingUser = await sql`
          SELECT id FROM users WHERE email = ${email}
        `;
        
        if (existingUser.length > 0) {
          throw new Error('Email já cadastrado');
        }
      } catch (dbError) {
        console.warn('⚠️ Erro ao verificar email existente, continuando...', dbError.message);
      }
      
      // Criptografar senha
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // Tentar inserir usuário no banco
      try {
        const result = await sql`
          INSERT INTO users (name, email, password_hash, company)
          VALUES (${name}, ${email}, ${passwordHash}, ${company || ''})
          RETURNING id, name, email, company, role, created_at
        `;
        
        console.log('✅ Usuário registrado no banco:', result[0]);
        return {
          success: true,
          user: result[0]
        };
      } catch (dbError) {
        console.warn('⚠️ Erro ao inserir no banco, criando usuário temporário...', dbError.message);
        
        // Fallback: usuário temporário
        const tempUser = {
          id: Date.now(),
          name,
          email,
          company: company || '',
          role: 'user',
          created_at: new Date().toISOString(),
          password_hash: passwordHash // Salvar para o login funcionar
        };
        
        // Salvar no localStorage como backup
        localStorage.setItem(`tempUser_${email}`, JSON.stringify(tempUser));
        
        return {
          success: true,
          user: tempUser
        };
      }
    } catch (error) {
      console.error('❌ Erro ao registrar usuário:', error);
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
      
      console.log('🔄 Tentando fazer login:', email);
      
      // Tentar buscar usuário no banco primeiro
      try {
        const users = await sql`
          SELECT id, name, email, password_hash, company, role
          FROM users 
          WHERE email = ${email}
        `;
        
        if (users.length > 0) {
          const user = users[0];
          console.log('👤 Usuário encontrado no banco');
          
          // Verificar senha
          const isPasswordValid = await bcrypt.compare(password, user.password_hash);
          
          if (!isPasswordValid) {
            throw new Error('Email ou senha incorretos');
          }
          
          // Remover hash da senha do retorno
          const { password_hash, ...userWithoutPassword } = user;
          
          console.log('✅ Login realizado com sucesso');
          return {
            success: true,
            user: userWithoutPassword
          };
        } else {
          console.log('❌ Usuário não encontrado no banco');
          throw new Error('Email ou senha incorretos');
        }
      } catch (dbError) {
        console.warn('⚠️ Erro ao acessar banco, tentando usuário temporário...', dbError.message);
        
        // Fallback: buscar usuário temporário no localStorage
        const tempUserData = localStorage.getItem(`tempUser_${email}`);
        if (tempUserData) {
          const tempUser = JSON.parse(tempUserData);
          console.log('👤 Usuário temporário encontrado');
          
          // Verificar senha
          const isPasswordValid = await bcrypt.compare(password, tempUser.password_hash);
          
          if (!isPasswordValid) {
            throw new Error('Email ou senha incorretos');
          }
          
          // Remover hash da senha do retorno
          const { password_hash, ...userWithoutPassword } = tempUser;
          
          console.log('✅ Login temporário realizado com sucesso');
          return {
            success: true,
            user: userWithoutPassword
          };
        }
        
        // Se não encontrou nem no banco nem no localStorage
        throw new Error('Email ou senha incorretos');
      }
    } catch (error) {
      console.error('❌ Erro ao fazer login:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Verificar se usuário existe
  async getUserById(id) {
    try {
      console.log('🔄 Buscando usuário por ID:', id);
      
      // Tentar buscar no banco primeiro
      try {
        const users = await sql`
          SELECT id, name, email, company, role, created_at
          FROM users 
          WHERE id = ${id}
        `;
        
        if (users.length > 0) {
          console.log('👤 Usuário encontrado no banco por ID');
          return users[0];
        }
      } catch (dbError) {
        console.warn('⚠️ Erro ao buscar usuário por ID no banco:', dbError.message);
      }
      
      // Fallback: buscar em usuários temporários
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith('tempUser_')) {
          try {
            const tempUser = JSON.parse(localStorage.getItem(key));
            if (tempUser.id === id) {
              console.log('👤 Usuário temporário encontrado por ID');
              return tempUser;
            }
          } catch (e) {
            // Ignorar erros de parsing
          }
        }
      }
      
      console.log('❌ Usuário não encontrado por ID');
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar usuário por ID:', error);
      return null;
    }
  },

  // Atualizar perfil do usuário
  async updateProfile(userId, userData) {
    try {
      const { name, company } = userData;
      
      // Tentar atualizar no banco
      try {
        const result = await sql`
          UPDATE users 
          SET name = ${name}, company = ${company}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${userId}
          RETURNING id, name, email, company, role, created_at
        `;
        
        if (result.length > 0) {
          return {
            success: true,
            user: result[0]
          };
        }
      } catch (dbError) {
        console.warn('⚠️ Erro ao atualizar no banco, tentando localStorage...', dbError.message);
      }
      
      // Fallback: atualizar usuário temporário
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith('tempUser_')) {
          try {
            const tempUser = JSON.parse(localStorage.getItem(key));
            if (tempUser.id === userId) {
              tempUser.name = name;
              tempUser.company = company;
              localStorage.setItem(key, JSON.stringify(tempUser));
              
              return {
                success: true,
                user: tempUser
              };
            }
          } catch (e) {
            // Ignorar erros de parsing
          }
        }
      }
      
      throw new Error('Usuário não encontrado');
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Alterar senha
  async changePassword(userId, oldPassword, newPassword) {
    try {
      // Buscar usuário primeiro
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      // Tentar buscar senha atual do banco ou localStorage
      let currentPasswordHash = null;
      
      // Tentar banco primeiro
      try {
        const users = await sql`
          SELECT password_hash FROM users WHERE id = ${userId}
        `;
        
        if (users.length > 0) {
          currentPasswordHash = users[0].password_hash;
        }
      } catch (dbError) {
        console.warn('⚠️ Erro ao buscar senha do banco, tentando localStorage...', dbError.message);
        
        // Buscar no localStorage
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          if (key.startsWith('tempUser_')) {
            try {
              const tempUser = JSON.parse(localStorage.getItem(key));
              if (tempUser.id === userId) {
                currentPasswordHash = tempUser.password_hash;
                break;
              }
            } catch (e) {
              // Ignorar erros de parsing
            }
          }
        }
      }
      
      if (!currentPasswordHash) {
        throw new Error('Não foi possível verificar a senha atual');
      }
      
      // Verificar senha atual
      const isOldPasswordValid = await bcrypt.compare(oldPassword, currentPasswordHash);
      
      if (!isOldPasswordValid) {
        throw new Error('Senha atual incorreta');
      }
      
      // Criptografar nova senha
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
      
      // Tentar atualizar no banco
      try {
        await sql`
          UPDATE users 
          SET password_hash = ${newPasswordHash}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${userId}
        `;
        
        return {
          success: true,
          message: 'Senha alterada com sucesso'
        };
      } catch (dbError) {
        console.warn('⚠️ Erro ao atualizar senha no banco, tentando localStorage...', dbError.message);
        
        // Atualizar no localStorage
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          if (key.startsWith('tempUser_')) {
            try {
              const tempUser = JSON.parse(localStorage.getItem(key));
              if (tempUser.id === userId) {
                tempUser.password_hash = newPasswordHash;
                localStorage.setItem(key, JSON.stringify(tempUser));
                
                return {
                  success: true,
                  message: 'Senha alterada com sucesso'
                };
              }
            } catch (e) {
              // Ignorar erros de parsing
            }
          }
        }
        
        throw new Error('Não foi possível atualizar a senha');
      }
    } catch (error) {
      console.error('❌ Erro ao alterar senha:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default authService;
