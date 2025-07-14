import database from '../config/database';

const { sql } = database;

// Serviço de dados para gerenciar laptops, andares e salas
export const dataService = {
  // ===== FLOORS =====
  floors: {
    async getAll(userId) {
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
        
        return { success: true, data: floors };
      } catch (error) {
        console.error('Erro ao buscar andares:', error);
        return { success: false, error: error.message };
      }
    },

    async create(floorData, userId) {
      try {
        const { name, description } = floorData;
        
        const result = await sql`
          INSERT INTO floors (name, description, user_id)
          VALUES (${name}, ${description || ''}, ${userId})
          RETURNING *
        `;
        
        // Adicionar array vazio de rooms
        const floor = { ...result[0], rooms: [] };
        
        return { success: true, data: floor };
      } catch (error) {
        console.error('Erro ao criar andar:', error);
        return { success: false, error: error.message };
      }
    },

    async update(id, updates, userId) {
      try {
        const { name, description } = updates;
        
        const result = await sql`
          UPDATE floors 
          SET name = ${name}, description = ${description || ''}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id} AND user_id = ${userId}
          RETURNING *
        `;
        
        if (result.length === 0) {
          throw new Error('Andar não encontrado');
        }
        
        return { success: true, data: result[0] };
      } catch (error) {
        console.error('Erro ao atualizar andar:', error);
        return { success: false, error: error.message };
      }
    },

    async delete(id, userId) {
      try {
        const result = await sql`
          DELETE FROM floors 
          WHERE id = ${id} AND user_id = ${userId}
          RETURNING id
        `;
        
        if (result.length === 0) {
          throw new Error('Andar não encontrado');
        }
        
        return { success: true };
      } catch (error) {
        console.error('Erro ao excluir andar:', error);
        return { success: false, error: error.message };
      }
    }
  },

  // ===== ROOMS =====
  rooms: {
    async create(roomData, userId) {
      try {
        const { name, description, floor_id } = roomData;
        
        const result = await sql`
          INSERT INTO rooms (name, description, floor_id, user_id)
          VALUES (${name}, ${description || ''}, ${floor_id}, ${userId})
          RETURNING *
        `;
        
        return { success: true, data: result[0] };
      } catch (error) {
        console.error('Erro ao criar sala:', error);
        return { success: false, error: error.message };
      }
    },

    async update(id, updates, userId) {
      try {
        const { name, description, floor_id } = updates;
        
        const result = await sql`
          UPDATE rooms 
          SET name = ${name}, description = ${description || ''}, floor_id = ${floor_id}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id} AND user_id = ${userId}
          RETURNING *
        `;
        
        if (result.length === 0) {
          throw new Error('Sala não encontrada');
        }
        
        return { success: true, data: result[0] };
      } catch (error) {
        console.error('Erro ao atualizar sala:', error);
        return { success: false, error: error.message };
      }
    },

    async delete(id, userId) {
      try {
        const result = await sql`
          DELETE FROM rooms 
          WHERE id = ${id} AND user_id = ${userId}
          RETURNING id
        `;
        
        if (result.length === 0) {
          throw new Error('Sala não encontrada');
        }
        
        return { success: true };
      } catch (error) {
        console.error('Erro ao excluir sala:', error);
        return { success: false, error: error.message };
      }
    }
  },

  // ===== LAPTOPS =====
  laptops: {
    async getAll(userId) {
      try {
        const laptops = await sql`
          SELECT * FROM laptops 
          WHERE user_id = ${userId}
          ORDER BY created_at DESC
        `;
        
        return { success: true, data: laptops };
      } catch (error) {
        console.error('Erro ao buscar laptops:', error);
        return { success: false, error: error.message };
      }
    },

    async create(laptopData, userId) {
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
        
        return { success: true, data: result[0] };
      } catch (error) {
        console.error('Erro ao criar laptop:', error);
        if (error.message.includes('duplicate key')) {
          return { success: false, error: 'Número de série já existe' };
        }
        return { success: false, error: error.message };
      }
    },

    async update(id, updates, userId) {
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
          throw new Error('Laptop não encontrado');
        }
        
        return { success: true, data: result[0] };
      } catch (error) {
        console.error('Erro ao atualizar laptop:', error);
        if (error.message.includes('duplicate key')) {
          return { success: false, error: 'Número de série já existe' };
        }
        return { success: false, error: error.message };
      }
    },

    async delete(id, userId) {
      try {
        const result = await sql`
          DELETE FROM laptops 
          WHERE id = ${id} AND user_id = ${userId}
          RETURNING id
        `;
        
        if (result.length === 0) {
          throw new Error('Laptop não encontrado');
        }
        
        return { success: true };
      } catch (error) {
        console.error('Erro ao excluir laptop:', error);
        return { success: false, error: error.message };
      }
    },

    async checkSerialExists(serial, userId, excludeId = null) {
      try {
        let query = sql`
          SELECT id FROM laptops 
          WHERE serial_number = ${serial} AND user_id = ${userId}
        `;
        
        if (excludeId) {
          query = sql`
            SELECT id FROM laptops 
            WHERE serial_number = ${serial} AND user_id = ${userId} AND id != ${excludeId}
          `;
        }
        
        const result = await query;
        
        return { success: true, exists: result.length > 0 };
      } catch (error) {
        console.error('Erro ao verificar serial:', error);
        return { success: false, error: error.message };
      }
    }
  },

  // ===== STATISTICS =====
  async getStatistics(userId) {
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
      
      return {
        success: true,
        data: {
          ...stats[0],
          total_floors: parseInt(floorStats[0].total_floors),
          total_rooms: parseInt(roomStats[0].total_rooms)
        }
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return { success: false, error: error.message };
    }
  }
};

export default dataService;
