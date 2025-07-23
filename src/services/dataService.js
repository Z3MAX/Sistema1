// src/services/dataService.js - VERSÃO COMPLETA CORRIGIDA
import database from '../config/database';

const { sql } = database;

// Função para tratar erros de banco
const handleDatabaseError = (operation, error) => {
  console.error(`❌ ERRO de banco na operação: ${operation}`, error);
  
  if (error.message.includes('connection')) {
    console.error('🔧 DIAGNÓSTICO: Problema de conexão com banco');
  } else if (error.message.includes('duplicate key') || error.message.includes('unique')) {
    console.error('🔧 DIAGNÓSTICO: Registro duplicado');
  } else if (error.message.includes('not found') || error.message.includes('does not exist')) {
    console.error('🔧 DIAGNÓSTICO: Registro não encontrado');
  }
  
  return {
    success: false,
    error: `Erro no banco de dados: ${error.message}`,
    operation: operation
  };
};

// Serviço de dados principal
export const dataService = {
  // Seção de Laptops
  laptops: {
    // Buscar todos os laptops
    async getAll() {
      console.log('🔄 Buscando todos os laptops...');
      
      if (!sql) {
        console.log('⚠️ SQL não disponível, retornando array vazio');
        return { success: true, data: [] };
      }
      
      try {
        const laptops = await sql`
          SELECT l.*, 
                 u.name as created_by_name,
                 uu.name as last_updated_by_name
          FROM laptops l
          LEFT JOIN users u ON l.created_by = u.id
          LEFT JOIN users uu ON l.last_updated_by = uu.id
          ORDER BY l.created_at DESC
        `;
        
        // Processar damage_analysis se existir
        const processedLaptops = laptops.map(laptop => ({
          ...laptop,
          damage_analysis: laptop.damage_analysis ? 
            (typeof laptop.damage_analysis === 'string' ? 
              JSON.parse(laptop.damage_analysis) : 
              laptop.damage_analysis) 
            : null
        }));
        
        console.log(`✅ ${processedLaptops.length} laptops encontrados`);
        return { success: true, data: processedLaptops };
      } catch (error) {
        return handleDatabaseError('laptops.getAll', error);
      }
    },

    // Criar novo laptop
    async create(laptopData, userId) {
      console.log('🔄 Criando laptop:', laptopData.model);
      
      if (!sql) {
        return { success: false, error: 'Banco de dados não disponível' };
      }
      
      try {
        const {
          model, service_tag, processor, ram, storage, graphics,
          screen_size, color, warranty_end, condition, condition_score, status,
          photo, damage_analysis, purchase_date, purchase_price,
          assigned_user, notes,
          // Campos Dell Support
          dell_support_ticket, dell_support_status, dell_support_opened_date,
          dell_support_description, dell_support_priority, dell_support_estimated_resolution,
          dell_support_notes
        } = laptopData;
        
        if (!model || !service_tag || !userId) {
          throw new Error('Campos obrigatórios não preenchidos: model, service_tag, userId');
        }
        
        const result = await sql`
          INSERT INTO laptops (
            model, service_tag, processor, ram, storage, graphics,
            screen_size, color, warranty_end, condition, condition_score, status,
            photo, damage_analysis, purchase_date, purchase_price,
            assigned_user, notes, user_id, created_by, last_updated_by,
            dell_support_ticket, dell_support_status, dell_support_opened_date,
            dell_support_description, dell_support_priority, dell_support_estimated_resolution,
            dell_support_notes
          )
          VALUES (
            ${model}, ${service_tag}, ${processor || null}, ${ram || null}, 
            ${storage || null}, ${graphics || null}, ${screen_size || null},
            ${color || null}, ${warranty_end || null}, ${condition || 'Excelente'}, 
            ${condition_score || 100}, ${status || 'Disponível'},
            ${photo || null}, ${damage_analysis ? JSON.stringify(damage_analysis) : null},
            ${purchase_date || null}, ${purchase_price || null}, 
            ${assigned_user || null}, ${notes || null}, 
            ${userId}, ${userId}, ${userId},
            ${dell_support_ticket || null}, ${dell_support_status || null},
            ${dell_support_opened_date || null}, ${dell_support_description || null},
            ${dell_support_priority || null}, ${dell_support_estimated_resolution || null},
            ${dell_support_notes || null}
          )
          RETURNING *
        `;
        
        console.log('✅ Laptop criado com sucesso! ID:', result[0]?.id);
        return { success: true, data: result[0] };
        
      } catch (error) {
        if (error.message.includes('duplicate key') || error.message.includes('unique')) {
          return { success: false, error: 'Service tag já existe' };
        }
        return handleDatabaseError('laptops.create', error);
      }
    },

    // Atualizar laptop
    async update(id, updates, userId) {
      console.log('🔄 Atualizando laptop. ID:', id);
      
      if (!sql) {
        return { success: false, error: 'Banco de dados não disponível' };
      }
      
      try {
        const {
          model, service_tag, processor, ram, storage, graphics,
          screen_size, color, warranty_end, condition, condition_score, status,
          photo, damage_analysis, purchase_date, purchase_price,
          assigned_user, notes,
          // Campos Dell Support
          dell_support_ticket, dell_support_status, dell_support_opened_date,
          dell_support_description, dell_support_priority, dell_support_estimated_resolution,
          dell_support_notes
        } = updates;
        
        const result = await sql`
          UPDATE laptops 
          SET model = ${model}, 
              service_tag = ${service_tag},
              processor = ${processor || null}, 
              ram = ${ram || null}, 
              storage = ${storage || null},
              graphics = ${graphics || null}, 
              screen_size = ${screen_size || null},
              color = ${color || null}, 
              warranty_end = ${warranty_end || null},
              condition = ${condition || 'Excelente'}, 
              condition_score = ${condition_score || 100}, 
              status = ${status || 'Disponível'},
              photo = ${photo || null},
              damage_analysis = ${damage_analysis ? JSON.stringify(damage_analysis) : null},
              purchase_date = ${purchase_date || null}, 
              purchase_price = ${purchase_price || null},
              assigned_user = ${assigned_user || null}, 
              notes = ${notes || null},
              dell_support_ticket = ${dell_support_ticket || null},
              dell_support_status = ${dell_support_status || null},
              dell_support_opened_date = ${dell_support_opened_date || null},
              dell_support_description = ${dell_support_description || null},
              dell_support_priority = ${dell_support_priority || null},
              dell_support_estimated_resolution = ${dell_support_estimated_resolution || null},
              dell_support_notes = ${dell_support_notes || null},
              last_updated_by = ${userId}, 
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *
        `;
        
        if (result.length === 0) {
          throw new Error('Laptop não encontrado');
        }
        
        console.log('✅ Laptop atualizado');
        return { success: true, data: result[0] };
      } catch (error) {
        if (error.message.includes('duplicate key') || error.message.includes('unique')) {
          return { success: false, error: 'Service tag já existe' };
        }
        return handleDatabaseError('laptops.update', error);
      }
    },

    // Deletar laptop
    async delete(id, userId) {
      console.log('🔄 Deletando laptop. ID:', id);
      
      if (!sql) {
        return { success: false, error: 'Banco de dados não disponível' };
      }
      
      try {
        const result = await sql`
          DELETE FROM laptops 
          WHERE id = ${id}
          RETURNING id
        `;
        
        if (result.length === 0) {
          throw new Error('Laptop não encontrado');
        }
        
        console.log('✅ Laptop deletado');
        return { success: true, message: 'Laptop deletado com sucesso' };
      } catch (error) {
        return handleDatabaseError('laptops.delete', error);
      }
    },

    // Verificar se service tag existe
    async checkServiceTagExists(serviceTag, excludeId = null) {
      console.log('🔄 Verificando service tag:', serviceTag);
      
      if (!sql) {
        return { success: true, exists: false };
      }
      
      try {
        let query;
        if (excludeId) {
          query = await sql`
            SELECT id FROM laptops 
            WHERE service_tag = ${serviceTag} AND id != ${excludeId}
          `;
        } else {
          query = await sql`
            SELECT id FROM laptops 
            WHERE service_tag = ${serviceTag}
          `;
        }
        
        const exists = query.length > 0;
        console.log(`✅ Service tag ${exists ? 'existe' : 'não existe'}`);
        return { success: true, exists: exists };
      } catch (error) {
        return handleDatabaseError('laptops.checkServiceTagExists', error);
      }
    },

    // Atualizar chamado Dell Support
    async updateDellSupport(laptopId, dellSupportData, userId) {
      console.log('🔄 Atualizando chamado Dell para laptop ID:', laptopId);
      
      if (!sql) {
        return { success: false, error: 'Banco de dados não disponível' };
      }
      
      try {
        const {
          dell_support_ticket,
          dell_support_status,
          dell_support_opened_date,
          dell_support_description,
          dell_support_priority,
          dell_support_estimated_resolution,
          dell_support_notes
        } = dellSupportData;
        
        const result = await sql`
          UPDATE laptops 
          SET dell_support_ticket = ${dell_support_ticket || null},
              dell_support_status = ${dell_support_status || null},
              dell_support_opened_date = ${dell_support_opened_date || null},
              dell_support_description = ${dell_support_description || null},
              dell_support_priority = ${dell_support_priority || null},
              dell_support_estimated_resolution = ${dell_support_estimated_resolution || null},
              dell_support_notes = ${dell_support_notes || null},
              last_updated_by = ${userId},
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${laptopId}
          RETURNING *
        `;
        
        if (result.length === 0) {
          throw new Error('Laptop não encontrado');
        }
        
        console.log('✅ Chamado Dell atualizado com sucesso');
        return { success: true, data: result[0] };
      } catch (error) {
        return handleDatabaseError('laptops.updateDellSupport', error);
      }
    },

    // Buscar laptops com chamados Dell
    async getWithDellSupport() {
      console.log('🔄 Buscando laptops com chamados Dell...');
      
      if (!sql) {
        return { success: true, data: [] };
      }
      
      try {
        const laptops = await sql`
          SELECT l.*, 
                 u.name as created_by_name,
                 uu.name as last_updated_by_name
          FROM laptops l
          LEFT JOIN users u ON l.created_by = u.id
          LEFT JOIN users uu ON l.last_updated_by = uu.id
          WHERE l.dell_support_ticket IS NOT NULL 
            AND l.dell_support_status NOT IN ('Fechado', 'Resolvido')
          ORDER BY l.dell_support_opened_date DESC
        `;
        
        console.log(`✅ ${laptops.length} laptops com chamados Dell encontrados`);
        return { success: true, data: laptops };
      } catch (error) {
        return handleDatabaseError('laptops.getWithDellSupport', error);
      }
    },

    // Estatísticas de chamados Dell
    async getDellSupportStats() {
      console.log('🔄 Buscando estatísticas de chamados Dell...');
      
      if (!sql) {
        return { 
          success: true, 
          data: {
            total_tickets: 0,
            open_tickets: 0,
            in_progress_tickets: 0,
            waiting_parts_tickets: 0,
            closed_tickets: 0,
            high_priority_tickets: 0,
            overdue_tickets: 0
          }
        };
      }
      
      try {
        const stats = await sql`
          SELECT 
            COUNT(CASE WHEN dell_support_ticket IS NOT NULL THEN 1 END) as total_tickets,
            COUNT(CASE WHEN dell_support_status = 'Aberto' THEN 1 END) as open_tickets,
            COUNT(CASE WHEN dell_support_status = 'Em Andamento' THEN 1 END) as in_progress_tickets,
            COUNT(CASE WHEN dell_support_status = 'Aguardando Peças' THEN 1 END) as waiting_parts_tickets,
            COUNT(CASE WHEN dell_support_status IN ('Fechado', 'Resolvido') THEN 1 END) as closed_tickets,
            COUNT(CASE WHEN dell_support_priority = 'Alta' THEN 1 END) as high_priority_tickets,
            COUNT(CASE WHEN dell_support_estimated_resolution < CURRENT_DATE THEN 1 END) as overdue_tickets
          FROM laptops
        `;
        
        console.log('✅ Estatísticas de chamados Dell obtidas');
        return { success: true, data: stats[0] };
      } catch (error) {
        return handleDatabaseError('laptops.getDellSupportStats', error);
      }
    }
  },

  // Estatísticas gerais
  async getStatistics() {
    console.log('🔄 Buscando estatísticas gerais...');
    
    if (!sql) {
      return { 
        success: true, 
        data: {
          total_laptops: 0,
          available_laptops: 0,
          in_use_laptops: 0,
          maintenance_laptops: 0,
          discarded_laptops: 0,
          total_value: 0,
          avg_condition: 0
        }
      };
    }
    
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
      `;
      
      console.log('✅ Estatísticas gerais obtidas');
      return { success: true, data: stats[0] };
    } catch (error) {
      return handleDatabaseError('getStatistics', error);
    }
  }
};

console.log('✅ dataService inicializado');

export default dataService;
