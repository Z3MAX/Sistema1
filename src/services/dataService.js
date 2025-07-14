import database from '../config/database';

const { sql } = database;

// Funções auxiliares para localStorage
const getFromLocalStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erro ao ler localStorage:', error);
    return null;
  }
};

const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
  }
};

// Serviço de dados para gerenciar laptops, andares e salas
export const dataService = {
  // ===== FLOORS =====
  floors: {
    async getAll(userId) {
      try {
        if (!sql) {
          // Modo offline - usar localStorage
          const floorsKey = `floors_${userId}`;
          const floors = getFromLocalStorage(floorsKey) || [];
          return { success: true, data: floors };
        }
        
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
        
        // Fallback para localStorage
        const floorsKey = `floors_${userId}`;
        const floors = getFromLocalStorage(floorsKey) || [];
        return { success: true, data: floors };
      }
    },

    async create(floorData, userId) {
      try {
        const { name, description } = floorData;
        
        if (!sql) {
          // Modo offline - usar localStorage
          const floorsKey = `floors_${userId}`;
          const floors = getFromLocalStorage(floorsKey) || [];
          
          const newFloor = {
            id: Date.now(),
            name,
            description: description || '',
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            rooms: []
          };
          
          floors.push(newFloor);
          saveToLocalStorage(floorsKey, floors);
          
          return { success: true, data: newFloor };
        }
        
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
        
        if (!sql) {
          // Modo offline - usar localStorage
          const floorsKey = `floors_${userId}`;
          const floors = getFromLocalStorage(floorsKey) || [];
          
          const floorIndex = floors.findIndex(f => f.id === id);
          if (floorIndex === -1) {
            throw new Error('Andar não encontrado');
          }
          
          floors[floorIndex] = {
            ...floors[floorIndex],
            name,
            description: description || '',
            updated_at: new Date().toISOString()
          };
          
          saveToLocalStorage(floorsKey, floors);
          
          return { success: true, data: floors[floorIndex] };
        }
        
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
        if (!sql) {
          // Modo offline - usar localStorage
          const floorsKey = `floors_${userId}`;
          const floors = getFromLocalStorage(floorsKey) || [];
          
          const floorIndex = floors.findIndex(f => f.id === id);
          if (floorIndex === -1) {
            throw new Error('Andar não encontrado');
          }
          
          floors.splice(floorIndex, 1);
          saveToLocalStorage(floorsKey, floors);
          
          return { success: true };
        }
        
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
        
        if (!sql) {
          // Modo offline - usar localStorage
          const floorsKey = `floors_${userId}`;
          const floors = getFromLocalStorage(floorsKey) || [];
          
          const floorIndex = floors.findIndex(f => f.id === floor_id);
          if (floorIndex === -1) {
            throw new Error('Andar não encontrado');
          }
          
          const newRoom = {
            id: Date.now(),
            name,
            description: description || '',
            floor_id,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          if (!floors[floorIndex].rooms) {
            floors[floorIndex].rooms = [];
          }
          
          floors[floorIndex].rooms.push(newRoom);
          saveToLocalStorage(floorsKey, floors);
          
          return { success: true, data: newRoom };
        }
        
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
        
        if (!sql) {
          // Modo offline - usar localStorage
          const floorsKey = `floors_${userId}`;
          const floors = getFromLocalStorage(floorsKey) || [];
          
          let roomFound = false;
          
          for (const floor of floors) {
            if (floor.rooms) {
              const roomIndex = floor.rooms.findIndex(r => r.id === id);
              if (roomIndex !== -1) {
                floor.rooms[roomIndex] = {
                  ...floor.rooms[roomIndex],
                  name,
                  description: description || '',
                  floor_id,
                  updated_at: new Date().toISOString()
                };
                roomFound = true;
                break;
              }
            }
          }
          
          if (!roomFound) {
            throw new Error('Sala não encontrada');
          }
          
          saveToLocalStorage(floorsKey, floors);
          
          return { success: true, data: { id, name, description, floor_id } };
        }
        
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
        if (!sql) {
          // Modo offline - usar localStorage
          const floorsKey = `floors_${userId}`;
          const floors = getFromLocalStorage(floorsKey) || [];
          
          let roomFound = false;
          
          for (const floor of floors) {
            if (floor.rooms) {
              const roomIndex = floor.rooms.findIndex(r => r.id === id);
              if (roomIndex !== -1) {
                floor.rooms.splice(roomIndex, 1);
                roomFound = true;
                break;
              }
            }
          }
          
          if (!roomFound) {
            throw new Error('Sala não encontrada');
          }
          
          saveToLocalStorage(floorsKey, floors);
          
          return { success: true };
        }
        
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
        if (!sql) {
          // Modo offline - usar localStorage
          const laptopsKey = `laptops_${userId}`;
          const laptops = getFromLocalStorage(laptopsKey) || [];
          return { success: true, data: laptops };
        }
        
        const laptops = await sql`
          SELECT * FROM laptops 
          WHERE user_id = ${userId}
          ORDER BY created_at DESC
        `;
        
        return { success: true, data: laptops };
      } catch (error) {
        console.error('Erro ao buscar laptops:', error);
        
        // Fallback para localStorage
        const laptopsKey = `laptops_${userId}`;
        const laptops = getFromLocalStorage(laptopsKey) || [];
        return { success: true, data: laptops };
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
        
        if (!sql) {
          // Modo offline - usar localStorage
          const laptopsKey = `laptops_${userId}`;
          const laptops = getFromLocalStorage(laptopsKey) || [];
          
          // Verificar se serial já existe
          const existingLaptop = laptops.find(l => l.serial_number === serial_number);
          if (existingLaptop) {
            throw new Error('Número de série já existe');
          }
          
          const newLaptop = {
            id: Date.now(),
            model, serial_number, service_tag: service_tag || null, processor: processor || null,
            ram: ram || null, storage: storage || null, graphics: graphics || null, 
            screen_size: screen_size || null, color: color || null, warranty_end: warranty_end || null,
            condition, condition_score, status, floor_id: floor_id || null, room_id: room_id || null,
            photo: photo || null, damage_analysis, purchase_date: purchase_date || null,
            purchase_price: purchase_price || null, assigned_user: assigned_user || null,
            notes: notes || null, user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          laptops.push(newLaptop);
          saveToLocalStorage(laptopsKey, laptops);
          
          return { success: true, data: newLaptop };
        }
        
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
        if (error.message.includes('duplicate key') || error.message.includes('já existe')) {
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
        
        if (!sql) {
          // Modo offline - usar localStorage
          const laptopsKey = `laptops_${userId}`;
          const laptops = getFromLocalStorage(laptopsKey) || [];
          
          const laptopIndex = laptops.findIndex(l => l.id === id);
          if (laptopIndex === -1) {
            throw new Error('Laptop não encontrado');
          }
          
          // Verificar se serial já existe em outro laptop
          const existingLaptop = laptops.find(l => l.serial_number === serial_number && l.id !== id);
          if (existingLaptop) {
            throw new Error('Número de série já existe');
          }
          
          laptops[laptopIndex] = {
            ...laptops[laptopIndex],
            model, serial_number, service_tag: service_tag || null, processor: processor || null,
            ram: ram || null, storage: storage || null, graphics: graphics || null,
            screen_size: screen_size || null, color: color || null, warranty_end: warranty_end || null,
            condition, condition_score, status, floor_id: floor_id || null, room_id: room_id || null,
            photo: photo || null, damage_analysis, purchase_date: purchase_date || null,
            purchase_price: purchase_price || null, assigned_user: assigned_user || null,
            notes: notes || null, updated_at: new Date().toISOString()
          };
          
          saveToLocalStorage(laptopsKey, laptops);
          
          return { success: true, data: laptops[laptopIndex] };
        }
        
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
        if (error.message.includes('duplicate key') || error.message.includes('já existe')) {
          return { success: false, error: 'Número de série já existe' };
        }
        return { success: false, error: error.message };
      }
    },

    async delete(id, userId) {
      try {
        if (!sql) {
          // Modo offline - usar localStorage
          const laptopsKey = `laptops_${userId}`;
          const laptops = getFromLocalStorage(laptopsKey) || [];
          
          const laptopIndex = laptops.findIndex(l => l.id === id);
          if (laptopIndex === -1) {
            throw new Error('Laptop não encontrado');
          }
          
          laptops.splice(laptopIndex, 1);
          saveToLocalStorage(laptopsKey, laptops);
          
          return { success: true };
        }
        
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
        if (!sql) {
          // Modo offline - usar localStorage
          const laptopsKey = `laptops_${userId}`;
          const laptops = getFromLocalStorage(laptopsKey) || [];
          
          const existingLaptop = laptops.find(l => 
            l.serial_number === serial && l.user_id === userId && l.id !== excludeId
          );
          
          return { success: true, exists: !!existingLaptop };
        }
        
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
      if (!sql) {
        // Modo offline - usar localStorage
        const laptopsKey = `laptops_${userId}`;
        const floorsKey = `floors_${userId}`;
        const laptops = getFromLocalStorage(laptopsKey) || [];
        const floors = getFromLocalStorage(floorsKey) || [];
        
        const stats = {
          total_laptops: laptops.length,
          available_laptops: laptops.filter(l => l.status === 'Disponível').length,
          in_use_laptops: laptops.filter(l => l.status === 'Em Uso').length,
          maintenance_laptops: laptops.filter(l => l.status === 'Manutenção').length,
          discarded_laptops: laptops.filter(l => l.status === 'Descartado').length,
          total_value: laptops.reduce((sum, l) => sum + (parseFloat(l.purchase_price) || 0), 0),
          avg_condition: laptops.length > 0 ? 
            laptops.reduce((sum, l) => sum + (l.condition_score || 0), 0) / laptops.length : 0,
          total_floors: floors.length,
          total_rooms: floors.reduce((sum, f) => sum + (f.rooms ? f.rooms.length : 0), 0)
        };
        
        return { success: true, data: stats };
      }
      
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
      
      // Fallback para localStorage
      const laptopsKey = `laptops_${userId}`;
      const floorsKey = `floors_${userId}`;
      const laptops = getFromLocalStorage(laptopsKey) || [];
      const floors = getFromLocalStorage(floorsKey) || [];
      
      const stats = {
        total_laptops: laptops.length,
        available_laptops: laptops.filter(l => l.status === 'Disponível').length,
        in_use_laptops: laptops.filter(l => l.status === 'Em Uso').length,
        maintenance_laptops: laptops.filter(l => l.status === 'Manutenção').length,
        discarded_laptops: laptops.filter(l => l.status === 'Descartado').length,
        total_value: laptops.reduce((sum, l) => sum + (parseFloat(l.purchase_price) || 0), 0),
        avg_condition: laptops.length > 0 ? 
          laptops.reduce((sum, l) => sum + (l.condition_score || 0), 0) / laptops.length : 0,
        total_floors: floors.length,
        total_rooms: floors.reduce((sum, f) => sum + (f.rooms ? f.rooms.length : 0), 0)
      };
      
      return { success: true, data: stats };
    }
  }
};

export default dataService;
