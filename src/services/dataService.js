// src/services/dataService.js - SOMENTE NEON DATABASE (SEM LOCALSTORAGE)
import database from '../config/database';

const { sql } = database;

// ❌ FALHA IMEDIATA SE NÃO TIVER CONEXÃO COM BANCO
if (!sql) {
  console.error('❌ ERRO CRÍTICO: Conexão com banco não disponível!');
  console.error('❌ dataService.js requer conexão obrigatória com Neon');
  throw new Error('ERRO CRÍTICO: dataService não pode funcionar sem conexão com o banco Neon');
}

console.log('✅ dataService inicializado com conexão Neon obrigatória');

// Função para tratar erros de banco
const handleDatabaseError = (operation, error) => {
  console.error(`❌ ERRO de banco na operação: ${operation}`, error);
  
  // Diagnóstico específico
  if (error.message.includes('connection')) {
    console.error('🔧 DIAGNÓSTICO: Problema de conexão com banco');
    console.error('   ❌ Verificar se o banco Neon está ativo');
    console.error('   ❌ Verificar connection string');
  } else if (error.message.includes('duplicate key')) {
    console.error('🔧 DIAGNÓSTICO: Tentativa de inserir dados duplicados');
  } else if (error.message.includes('foreign key')) {
    console.error('🔧 DIAGNÓSTICO: Violação de foreign key');
  } else if (error.message.includes('not found') || error.message.includes('does not exist')) {
    console.error('🔧 DIAGNÓSTICO: Registro não encontrado');
  }
  
  return {
    success: false,
    error: `Erro no banco de dados: ${error.message}`,
    operation: operation
  };
};

// Serviço de dados que funciona APENAS com banco Neon
export const dataService = {
  // ===== FLOORS =====
  floors: {
    async getAll(userId) {
      console.log('🔄 Buscando andares no banco para usuário:', userId);
      
      try {
        const floors = await sql`
          SELECT f.*, 
                 COALESCE(
                   JSON_AGG(
                     CASE 
                       WHEN r.id IS NOT NULL 
                       THEN JSON_BUILD_OBJECT(
                         'id', r.id,
                         'name', r.name,
                         'description', r.description,
                         'floor_id', r.floor_id,
                         'created_at', r.created_at,
                         'updated_at', r.updated_at
                       )
                       ELSE NULL 
                     END
                   ) FILTER (WHERE r.id IS NOT NULL), 
                   '[]'
                 ) as rooms
          FROM floors f
          LEFT JOIN rooms r ON f.id = r.floor_id
          WHERE f.user_id = ${userId}
          GROUP BY f.id
          ORDER BY f.name
        `;
        
        console.log(`✅ ${floors.length} andares encontrados no banco`);
        return { success: true, data: floors };
      } catch (error) {
        return handleDatabaseError('floors.getAll', error);
      }
    },

    async create(floorData, userId) {
      console.log('🔄 Criando andar no banco:', floorData.name);
      
      try {
        const { name, description } = floorData;
        
        const result = await sql`
          INSERT INTO floors (name, description, user_id)
          VALUES (${name}, ${description || ''}, ${userId})
          RETURNING *
        `;
        
        // Adicionar array vazio de rooms para compatibilidade
        const floor = { ...result[0], rooms: [] };
        
        console.log('✅ Andar criado no banco com ID:', floor.id);
        return { success: true, data: floor };
      } catch (error) {
        return handleDatabaseError('floors.create', error);
      }
    },

    async update(id, updates, userId) {
      console.log('🔄 Atualizando andar no banco. ID:', id);
      
      try {
        const { name, description } = updates;
        
        const result = await sql`
          UPDATE floors 
          SET name = ${name}, description = ${description || ''}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id} AND user_id = ${userId}
          RETURNING *
        `;
        
        if (result.length === 0) {
          throw new Error('Andar não encontrado ou não pertence ao usuário');
        }
        
        console.log('✅ Andar atualizado no banco');
        return { success: true, data: result[0] };
      } catch (error) {
        return handleDatabaseError('floors.update', error);
      }
    },

    async delete(id, userId) {
      console.log('🔄 Deletando andar do banco. ID:', id);
      
      try {
        const result = await sql`
          DELETE FROM floors 
          WHERE id = ${id} AND user_id = ${userId}
          RETURNING id
        `;
        
        if (result.length === 0) {
          throw new Error('Andar não encontrado ou não pertence ao usuário');
        }
        
        console.log('✅ Andar deletado do banco');
        return { success: true };
      } catch (error) {
        return handleDatabaseError('floors.delete', error);
      }
    }
  },

  // ===== ROOMS =====
  rooms: {
    async create(roomData, userId) {
      console.log('🔄 Criando sala no banco:', roomData.name);
      
      try {
        const { name, description, floor_id } = roomData;
        
        const result = await sql`
          INSERT INTO rooms (name, description, floor_id, user_id)
          VALUES (${name}, ${description || ''}, ${floor_id}, ${userId})
          RETURNING *
        `;
        
        console.log('✅ Sala criada no banco com ID:', result[0].id);
        return { success: true, data: result[0] };
      } catch (error) {
        return handleDatabaseError('rooms.create', error);
      }
    },

    async update(id, updates, userId) {
      console.log('🔄 Atualizando sala no banco. ID:', id);
      
      try {
        const { name, description, floor_id } = updates;
        
        const result = await sql`
          UPDATE rooms 
          SET name = ${name}, description = ${description || ''}, floor_id = ${floor_id}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id} AND user_id = ${userId}
          RETURNING *
        `;
        
        if (result.length === 0) {
          throw new Error('Sala não encontrada ou não pertence ao usuário');
        }
        
        console.log('✅ Sala atualizada no banco');
        return { success: true, data: result[0] };
      } catch (error) {
        return handleDatabaseError('rooms.update', error);
      }
    },

    async delete(id, userId) {
      console.log('🔄 Deletando sala do banco. ID:', id);
      
      try {
        const result = await sql`
          DELETE FROM rooms 
          WHERE id = ${id} AND user_id = ${userId}
          RETURNING id
        `;
        
        if (result.length === 0) {
          throw new Error('Sala não encontrada ou não pertence ao usuário');
        }
        
        console.log('✅ Sala deletada do banco');
        return { success: true };
      } catch (error) {
        return handleDatabaseError('rooms.delete', error);
      }
    }
  },

  // ===== LAPTOPS =====
  laptops: {
    async getAll(userId) {
      console.log('🔄 Buscando laptops no banco para usuário:', userId);
      
      try {
        const laptops = await sql`
          SELECT * FROM laptops 
          WHERE user_id = ${userId}
          ORDER BY created_at DESC
        `;
        
        console.log(`✅ ${laptops.length} laptops encontrados no banco`);
        return { success: true, data: laptops };
      } catch (error) {
        return handleDatabaseError('laptops.getAll', error);
      }
    },

    async create(laptopData, userId) {
      console.log('🔄 Criando laptop no banco:', laptopData.model);
      
      try {
        const {
          model, serial_number, service_tag, processor, ram, storage, graphics,
          screen_size, color, warranty_end, condition, condition_score, status,
          floor_id, room_id, photo, damage_analysis, purchase_date, purchase_price,
          assigned_user, notes
        } = laptopData;
        
        const result = await sql`
          INSERT INTO laptops (
            model, serial_number, service_tag, processor, ram, storage, graphics,
            screen_size, color, warranty_end, condition, condition_score, status,
            floor_id, room_id, photo, damage_analysis, purchase_date, purchase_price,
            assigned_user, notes, user_id
          )
          VALUES (
            ${model}, ${serial_number}, ${service_tag || null}, ${processor || null},
            ${ram || null}, ${storage || null}, ${graphics || null}, ${screen_size || null},
            ${color || null}, ${warranty_end || null}, ${condition}, ${condition_score},
            ${status}, ${floor_id || null}, ${room_id || null}, ${photo || null},
            ${damage_analysis ? JSON.stringify(damage_analysis) : null},
            ${purchase_date || null}, ${purchase_price || null}, ${assigned_user || null},
            ${notes || null}, ${userId}
          )
          RETURNING *
        `;
        
        console.log('✅ Laptop criado no banco com ID:', result[0].id);
        return { success: true, data: result[0] };
      } catch (error) {
        if (error.message.includes('duplicate key') || error.message.includes('unique')) {
          return { success: false, error: 'Número de série já existe' };
        }
        return handleDatabaseError('laptops.create', error);
      }
    },

    async update(id, updates, userId) {
      console.log('🔄 Atualizando laptop no banco. ID:', id);
      
      try {
        const {
          model, serial_number, service_tag, processor, ram, storage, graphics,
          screen_size, color, warranty_end, condition, condition_score, status,
          floor_id, room_id, photo, damage_analysis, purchase_date, purchase_price,
          assigned_user, notes
        } = updates;
        
        const result = await sql`
          UPDATE laptops 
          SET model = ${model}, serial_number = ${serial_number}, service_tag = ${service_tag || null},
              processor = ${processor || null}, ram = ${ram || null}, storage = ${storage || null},
              graphics = ${graphics || null}, screen_size = ${screen_size || null},
              color = ${color || null}, warranty_end = ${warranty_end || null},
              condition = ${condition}, condition_score = ${condition_score}, status = ${status},
              floor_id = ${floor_id || null}, room_id = ${room_id || null}, photo = ${photo || null},
              damage_analysis = ${damage_analysis ? JSON.stringify(damage_analysis) : null},
              purchase_date = ${purchase_date || null}, purchase_price = ${purchase_price || null},
              assigned_user = ${assigned_user || null}, notes = ${notes || null},
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id} AND user_id = ${userId}
          RETURNING *
        `;
        
        if (result.length === 0) {
          throw new Error('Laptop não encontrado ou não pertence ao usuário');
        }
        
        console.log('✅ Laptop atualizado no banco');
        return { success: true, data: result[0] };
      } catch (error) {
        if (error.message.includes('duplicate key') || error.message.includes('unique')) {
          return { success: false, error: 'Número de série já existe' };
        }
        return handleDatabaseError('laptops.update', error);
      }
    },

    async delete(id, userId) {
      console.log('🔄 Deletando laptop do banco. ID:', id);
      
      try {
        const result = await sql`
          DELETE FROM laptops 
          WHERE id = ${id} AND user_id = ${userId}
          RETURNING id
        `;
        
        if (result.length === 0) {
          throw new Error('Laptop não encontrado ou não pertence ao usuário');
        }
        
        console.log('✅ Laptop deletado do banco');
        return { success: true };
      } catch (error) {
        return handleDatabaseError('laptops.delete', error);
      }
    },

    async checkSerialExists(serial, userId, excludeId = null) {
      console.log('🔄 Verificando serial no banco:', serial);
      
      try {
        let query;
        if (excludeId) {
          query = sql`
            SELECT id FROM laptops 
            WHERE serial_number = ${serial} AND user_id = ${userId} AND id != ${excludeId}
          `;
        } else {
          query = sql`
            SELECT id FROM laptops 
            WHERE serial_number = ${serial} AND user_id = ${userId}
          `;
        }
        
        const result = await query;
        
        console.log(`✅ Verificação de serial: ${result.length > 0 ? 'EXISTS' : 'NOT_EXISTS'}`);
        return { success: true, exists: result.length > 0 };
      } catch (error) {
        return handleDatabaseError('laptops.checkSerialExists', error);
      }
    }
  },

  // ===== STATISTICS =====
  async getStatistics(userId) {
    console.log('🔄 Buscando estatísticas no banco para usuário:', userId);
    
    try {
      const stats = await sql`
        SELECT 
          COUNT(*) as total_laptops,
          COUNT(CASE WHEN status = 'Disponível' THEN 1 END) as available_laptops,
          COUNT(CASE WHEN status = 'Em Uso' THEN 1 END) as in_use_laptops,
          COUNT(CASE WHEN status = 'Manutenção' THEN 1 END) as maintenance_laptops,
          COUNT(CASE WHEN status = 'Descartado' THEN 1 END) as discarded_laptops,
          COALESCE(SUM(purchase_price), 0) as total_value,
          COALESCE(AVG(condition_score), 0) as avg_condition
        FROM laptops 
        WHERE user_id = ${userId}
      `;
      
      const floorStats = await sql`
        SELECT COUNT(*) as total_floors
        FROM floors 
        WHERE user_id = ${userId}
      `;
      
      const roomStats = await sql`
        SELECT COUNT(*) as total_rooms
        FROM rooms 
        WHERE user_id = ${userId}
      `;
      
      const finalStats = {
        ...stats[0],
        total_floors: parseInt(floorStats[0].total_floors),
        total_rooms: parseInt(roomStats[0].total_rooms)
      };
      
      console.log('✅ Estatísticas obtidas do banco:', finalStats);
      return { success: true, data: finalStats };
    } catch (error) {
      return handleDatabaseError('getStatistics', error);
    }
  }
};

// Log final
console.log('✅ === dataService CONFIGURADO PARA SOMENTE NEON ===');
console.log('✅ Todas as operações são realizadas no banco');
console.log('❌ localStorage: DESABILITADO');
console.log('❌ Modo offline: DESABILITADO');
console.log('================================================');

export default dataService;
