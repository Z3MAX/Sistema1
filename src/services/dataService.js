// src/services/dataService.js - VERSÃO DEBUG COMPLETA
import database from '../config/database';

const { sql } = database;

// ❌ FALHA IMEDIATA SE NÃO TIVER CONEXÃO COM BANCO
if (!sql) {
  console.error('❌ ERRO CRÍTICO: Conexão com banco não disponível!');
  console.error('❌ dataService.js requer conexão obrigatória com Neon');
  throw new Error('ERRO CRÍTICO: dataService não pode funcionar sem conexão com o banco Neon');
}

console.log('✅ dataService inicializado com conexão Neon COMPARTILHADA');

// Função para tratar erros de banco
const handleDatabaseError = (operation, error) => {
  console.error(`❌ ERRO de banco na operação: ${operation}`, error);
  console.error('❌ Detalhes do erro:', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    cause: error.cause
  });
  
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
  } else if (error.message.includes('column') && error.message.includes('does not exist')) {
    console.error('🔧 DIAGNÓSTICO: Coluna não existe na tabela');
  } else if (error.message.includes('syntax error')) {
    console.error('🔧 DIAGNÓSTICO: Erro de sintaxe SQL');
  } else if (error.message.includes('400')) {
    console.error('🔧 DIAGNÓSTICO: Erro 400 Bad Request');
    console.error('   ❌ Possível problema na estrutura da query');
    console.error('   ❌ Verificar tipos de dados');
  }
  
  return {
    success: false,
    error: `Erro no banco de dados: ${error.message}`,
    operation: operation
  };
};

// Função para verificar estrutura da tabela
const checkTableStructure = async () => {
  try {
    console.log('🔍 Verificando estrutura da tabela laptops...');
    
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'laptops'
      ORDER BY ordinal_position
    `;
    
    console.log('📋 Estrutura atual da tabela laptops:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    return columns;
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura da tabela:', error);
    return [];
  }
};

// Serviço de dados COMPARTILHADOS entre todos os usuários
export const dataService = {
  // ===== LAPTOPS (COMPARTILHADOS COM SERVICE_TAG) =====
  laptops: {
    async getAll() {
      console.log('🔄 Buscando TODOS os laptops compartilhados...');
      
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
        
        console.log(`✅ ${laptops.length} laptops COMPARTILHADOS encontrados`);
        return { success: true, data: laptops };
      } catch (error) {
        return handleDatabaseError('laptops.getAll', error);
      }
    },

    async create(laptopData, userId) {
      console.log('🔄 Criando laptop COMPARTILHADO:', laptopData.model);
      console.log('🔍 Dados recebidos:', {
        model: laptopData.model,
        service_tag: laptopData.service_tag,
        userId: userId
      });
      
      try {
        // Verificar estrutura da tabela primeiro
        await checkTableStructure();
        
        const {
          model, service_tag, processor, ram, storage, graphics,
          screen_size, color, warranty_end, condition, condition_score, status,
          photo, damage_analysis, purchase_date, purchase_price,
          assigned_user, notes
        } = laptopData;
        
        // Verificar se todos os campos obrigatórios estão presentes
        if (!model || !service_tag || !userId) {
          throw new Error('Campos obrigatórios não preenchidos: model, service_tag, userId');
        }
        
        // Preparar dados para inserção
        const insertData = {
          model: model,
          service_tag: service_tag,
          processor: processor || null,
          ram: ram || null,
          storage: storage || null,
          graphics: graphics || null,
          screen_size: screen_size || null,
          color: color || null,
          warranty_end: warranty_end || null,
          condition: condition || 'Excelente',
          condition_score: condition_score || 100,
          status: status || 'Disponível',
          photo: photo || null,
          damage_analysis: damage_analysis ? JSON.stringify(damage_analysis) : null,
          purchase_date: purchase_date || null,
          purchase_price: purchase_price || null,
          assigned_user: assigned_user || null,
          notes: notes || null,
          user_id: userId,
          created_by: userId,
          last_updated_by: userId
        };
        
        console.log('📝 Dados preparados para inserção:', insertData);
        
        // Tentar inserção mais simples primeiro
        console.log('🔄 Tentando inserção simples...');
        
        const result = await sql`
          INSERT INTO laptops (
            model, service_tag, processor, ram, storage, graphics,
            screen_size, color, warranty_end, condition, condition_score, status,
            photo, damage_analysis, purchase_date, purchase_price,
            assigned_user, notes, user_id, created_by, last_updated_by
          )
          VALUES (
            ${insertData.model}, 
            ${insertData.service_tag}, 
            ${insertData.processor},
            ${insertData.ram}, 
            ${insertData.storage}, 
            ${insertData.graphics}, 
            ${insertData.screen_size},
            ${insertData.color}, 
            ${insertData.warranty_end}, 
            ${insertData.condition}, 
            ${insertData.condition_score},
            ${insertData.status}, 
            ${insertData.photo},
            ${insertData.damage_analysis},
            ${insertData.purchase_date}, 
            ${insertData.purchase_price}, 
            ${insertData.assigned_user},
            ${insertData.notes}, 
            ${insertData.user_id}, 
            ${insertData.created_by}, 
            ${insertData.last_updated_by}
          )
          RETURNING *
        `;
        
        console.log('✅ Laptop COMPARTILHADO criado com sucesso! ID:', result[0]?.id);
        console.log('🌍 Visível para TODOS os usuários!');
        return { success: true, data: result[0] };
        
      } catch (error) {
        console.error('❌ Erro detalhado ao criar laptop:', error);
        console.error('❌ Stack trace:', error.stack);
        console.error('❌ Erro name:', error.name);
        
        // Tentar inserção com campos mínimos se falhar
        if (error.message.includes('400') || error.message.includes('Bad Request')) {
          console.log('🔄 Tentando inserção com campos mínimos...');
          
          try {
            const minimalResult = await sql`
              INSERT INTO laptops (model, service_tag, user_id, created_by, last_updated_by)
              VALUES (${laptopData.model}, ${laptopData.service_tag}, ${userId}, ${userId}, ${userId})
              RETURNING *
            `;
            
            console.log('✅ Laptop criado com campos mínimos! ID:', minimalResult[0]?.id);
            return { success: true, data: minimalResult[0] };
            
          } catch (minimalError) {
            console.error('❌ Erro na inserção mínima:', minimalError);
            return handleDatabaseError('laptops.create.minimal', minimalError);
          }
        }
        
        if (error.message.includes('duplicate key') || error.message.includes('unique')) {
          return { success: false, error: 'Service tag já existe' };
        }
        return handleDatabaseError('laptops.create', error);
      }
    },

    async update(id, updates, userId) {
      console.log('🔄 Atualizando laptop COMPARTILHADO. ID:', id);
      
      try {
        const {
          model, service_tag, processor, ram, storage, graphics,
          screen_size, color, warranty_end, condition, condition_score, status,
          photo, damage_analysis, purchase_date, purchase_price,
          assigned_user, notes
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
              last_updated_by = ${userId}, 
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *
        `;
        
        if (result.length === 0) {
          throw new Error('Laptop não encontrado');
        }
        
        console.log('✅ Laptop COMPARTILHADO atualizado');
        return { success: true, data: result[0] };
      } catch (error) {
        if (error.message.includes('duplicate key') || error.message.includes('unique')) {
          return { success: false, error: 'Service tag já existe' };
        }
        return handleDatabaseError('laptops.update', error);
      }
    },

    async delete(id, userId) {
      console.log('🔄 Deletando laptop COMPARTILHADO. ID:', id);
      
      try {
        const result = await sql`
          DELETE FROM laptops 
          WHERE id = ${id}
          RETURNING id
        `;
        
        if (result.length === 0) {
          throw new Error('Laptop não encontrado');
        }
        
        console.log('✅ Laptop COMPARTILHADO deletado');
        return { success: true };
      } catch (error) {
        return handleDatabaseError('laptops.delete', error);
      }
    },

    async checkServiceTagExists(serviceTag, excludeId = null) {
      console.log('🔄 Verificando service tag no banco COMPARTILHADO:', serviceTag);
      
      try {
        let query;
        if (excludeId) {
          query = sql`
            SELECT id FROM laptops 
            WHERE service_tag = ${serviceTag} AND id != ${excludeId}
          `;
        } else {
          query = sql`
            SELECT id FROM laptops 
            WHERE service_tag = ${serviceTag}
          `;
        }
        
        const result = await query;
        
        console.log(`✅ Verificação de service tag: ${result.length > 0 ? 'EXISTS' : 'NOT_EXISTS'}`);
        return { success: true, exists: result.length > 0 };
      } catch (error) {
        return handleDatabaseError('laptops.checkServiceTagExists', error);
      }
    },

    // Manter função de serial_number para compatibilidade (mas usar service_tag)
    async checkSerialExists(serial, excludeId = null) {
      console.log('🔄 Verificando service tag (compatibilidade):', serial);
      return this.checkServiceTagExists(serial, excludeId);
    }
  },

  // ===== STATISTICS (COMPARTILHADAS) =====
  async getStatistics() {
    console.log('🔄 Buscando estatísticas COMPARTILHADAS...');
    
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
      
      const finalStats = {
        ...stats[0]
      };
      
      console.log('✅ Estatísticas COMPARTILHADAS obtidas:', finalStats);
      return { success: true, data: finalStats };
    } catch (error) {
      return handleDatabaseError('getStatistics', error);
    }
  },

  // ===== AUDITORIA (NOVOS MÉTODOS) =====
  async getRecentActivity(limit = 20) {
    console.log('🔄 Buscando atividade recente...');
    
    try {
      const activities = await sql`
        SELECT 
          'laptop' as type,
          l.id,
          l.model as title,
          l.service_tag as subtitle,
          u.name as user_name,
          l.created_at as timestamp,
          'created' as action
        FROM laptops l
        LEFT JOIN users u ON l.created_by = u.id
        ORDER BY timestamp DESC
        LIMIT ${limit}
      `;
      
      console.log(`✅ ${activities.length} atividades recentes encontradas`);
      return { success: true, data: activities };
    } catch (error) {
      return handleDatabaseError('getRecentActivity', error);
    }
  },

  async getUserContributions(userId) {
    console.log('🔄 Buscando contribuições do usuário:', userId);
    
    try {
      const contributions = await sql`
        SELECT 
          COUNT(*) as total_laptops_created,
          COUNT(CASE WHEN l.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as laptops_last_30_days,
          COUNT(CASE WHEN l.last_updated_by = ${userId} AND l.created_by != ${userId} THEN 1 END) as laptops_updated
        FROM laptops l
        WHERE l.created_by = ${userId}
      `;
      
      console.log('✅ Contribuições do usuário obtidas');
      return { success: true, data: contributions[0] };
    } catch (error) {
      return handleDatabaseError('getUserContributions', error);
    }
  }
};

// Log final
console.log('✅ === dataService CONFIGURADO - VERSÃO DEBUG COMPLETA ===');
console.log('✅ Logging detalhado habilitado');
console.log('✅ Verificação de estrutura da tabela');
console.log('✅ Fallback para inserção mínima');
console.log('✅ Tratamento robusto de erros');
console.log('================================================================');

export default dataService;
