// ============= ATUALIZAÇÕES PARA src/services/dataService.js =============
// Adicione estas funções no objeto dataService.laptops:

// Nova função para atualizar chamado Dell
async updateDellSupport(laptopId, dellSupportData, userId) {
  console.log('🔄 Atualizando chamado Dell para laptop ID:', laptopId);
  
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

// Função para buscar laptops com chamados Dell abertos
async getWithDellSupport() {
  console.log('🔄 Buscando laptops com chamados Dell...');
  
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

// Função para obter estatísticas de chamados Dell
async getDellSupportStats() {
  console.log('🔄 Buscando estatísticas de chamados Dell...');
  
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
},

// Atualize também a função create() para incluir os novos campos:
async create(laptopData, userId) {
  console.log('🔄 Criando laptop COMPARTILHADO:', laptopData.model);
  
  try {
    const {
      model, service_tag, processor, ram, storage, graphics,
      screen_size, color, warranty_end, condition, condition_score, status,
      photo, damage_analysis, purchase_date, purchase_price,
      assigned_user, notes,
      // Novos campos Dell Support
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
    
    console.log('✅ Laptop COMPARTILHADO criado com sucesso! ID:', result[0]?.id);
    return { success: true, data: result[0] };
    
  } catch (error) {
    if (error.message.includes('duplicate key') || error.message.includes('unique')) {
      return { success: false, error: 'Service tag já existe' };
    }
    return handleDatabaseError('laptops.create', error);
  }
},

// Atualize também a função update() para incluir os novos campos:
async update(id, updates, userId) {
  console.log('🔄 Atualizando laptop COMPARTILHADO. ID:', id);
  
  try {
    const {
      model, service_tag, processor, ram, storage, graphics,
      screen_size, color, warranty_end, condition, condition_score, status,
      photo, damage_analysis, purchase_date, purchase_price,
      assigned_user, notes,
      // Novos campos Dell Support
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
    
    console.log('✅ Laptop COMPARTILHADO atualizado');
    return { success: true, data: result[0] };
  } catch (error) {
    if (error.message.includes('duplicate key') || error.message.includes('unique')) {
      return { success: false, error: 'Service tag já existe' };
    }
    return handleDatabaseError('laptops.update', error);
  }
}
