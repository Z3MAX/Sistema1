// src/services/dataService.js
import database from '../config/database';

const { sql } = database;

const handleDatabaseError = (operation, error) => {
  console.error(`❌ ERRO de banco na operação: ${operation}`, error);
  return {
    success: false,
    error: `Erro no banco de dados: ${error.message}`,
    operation
  };
};

export const dataService = {
  laptops: {
    async getAll() {
      if (!sql) return { success: true, data: [] };
      try {
        const assets = await sql`
          SELECT l.*,
                 u.name as created_by_name,
                 uu.name as last_updated_by_name
          FROM laptops l
          LEFT JOIN users u ON l.created_by = u.id
          LEFT JOIN users uu ON l.last_updated_by = uu.id
          ORDER BY l.created_at DESC
        `;
        const processed = assets.map(a => ({
          ...a,
          damage_analysis: a.damage_analysis
            ? (typeof a.damage_analysis === 'string' ? JSON.parse(a.damage_analysis) : a.damage_analysis)
            : null
        }));
        return { success: true, data: processed };
      } catch (error) {
        return handleDatabaseError('assets.getAll', error);
      }
    },

    async create(assetData, userId) {
      if (!sql) return { success: false, error: 'Banco de dados não disponível' };
      try {
        const {
          asset_type, model, service_tag, hostname, patrimony_number,
          location, project, department, assigned_user, responsible,
          purchase_company, term_signed, mac_address, teamviewer_id,
          processor, ram, storage, graphics, screen_size, color,
          operating_system, software_list, purchase_date, delivery_date,
          purchase_price, purchase_invoice, warranty_end,
          condition, condition_score, status, photo, damage_analysis, notes,
          dell_support_ticket, dell_support_status, dell_support_opened_date,
          dell_support_description, dell_support_priority,
          dell_support_estimated_resolution, dell_support_notes
        } = assetData;

        if (!model || !service_tag || !userId) {
          throw new Error('Campos obrigatórios: model, service_tag, userId');
        }

        const result = await sql`
          INSERT INTO laptops (
            asset_type, model, service_tag, hostname, patrimony_number,
            location, project, department, assigned_user, responsible,
            purchase_company, term_signed, mac_address, teamviewer_id,
            processor, ram, storage, graphics, screen_size, color,
            operating_system, software_list, purchase_date, delivery_date,
            purchase_price, purchase_invoice, warranty_end,
            condition, condition_score, status, photo, damage_analysis, notes,
            dell_support_ticket, dell_support_status, dell_support_opened_date,
            dell_support_description, dell_support_priority,
            dell_support_estimated_resolution, dell_support_notes,
            user_id, created_by, last_updated_by
          ) VALUES (
            ${asset_type || 'Notebook'}, ${model}, ${service_tag},
            ${hostname || null}, ${patrimony_number || null},
            ${location || null}, ${project || null}, ${department || null},
            ${assigned_user || null}, ${responsible || null},
            ${purchase_company || null}, ${term_signed || null},
            ${mac_address || null}, ${teamviewer_id || null},
            ${processor || null}, ${ram || null}, ${storage || null},
            ${graphics || null}, ${screen_size || null}, ${color || null},
            ${operating_system || null}, ${software_list || null},
            ${purchase_date || null}, ${delivery_date || null},
            ${purchase_price || null}, ${purchase_invoice || null},
            ${warranty_end || null},
            ${condition || 'Bom'}, ${condition_score || 70},
            ${status || 'Em Uso'}, ${photo || null},
            ${damage_analysis ? JSON.stringify(damage_analysis) : null},
            ${notes || null},
            ${dell_support_ticket || null}, ${dell_support_status || null},
            ${dell_support_opened_date || null}, ${dell_support_description || null},
            ${dell_support_priority || null}, ${dell_support_estimated_resolution || null},
            ${dell_support_notes || null},
            ${userId}, ${userId}, ${userId}
          )
          RETURNING *
        `;
        return { success: true, data: result[0] };
      } catch (error) {
        if (error.message.includes('duplicate key') || error.message.includes('unique')) {
          return { success: false, error: 'Service tag já existe' };
        }
        return handleDatabaseError('assets.create', error);
      }
    },

    async update(id, updates, userId) {
      if (!sql) return { success: false, error: 'Banco de dados não disponível' };
      try {
        const {
          asset_type, model, service_tag, hostname, patrimony_number,
          location, project, department, assigned_user, responsible,
          purchase_company, term_signed, mac_address, teamviewer_id,
          processor, ram, storage, graphics, screen_size, color,
          operating_system, software_list, purchase_date, delivery_date,
          purchase_price, purchase_invoice, warranty_end,
          condition, condition_score, status, photo, damage_analysis, notes,
          dell_support_ticket, dell_support_status, dell_support_opened_date,
          dell_support_description, dell_support_priority,
          dell_support_estimated_resolution, dell_support_notes
        } = updates;

        const result = await sql`
          UPDATE laptops SET
            asset_type = ${asset_type || 'Notebook'},
            model = ${model},
            service_tag = ${service_tag},
            hostname = ${hostname || null},
            patrimony_number = ${patrimony_number || null},
            location = ${location || null},
            project = ${project || null},
            department = ${department || null},
            assigned_user = ${assigned_user || null},
            responsible = ${responsible || null},
            purchase_company = ${purchase_company || null},
            term_signed = ${term_signed || null},
            mac_address = ${mac_address || null},
            teamviewer_id = ${teamviewer_id || null},
            processor = ${processor || null},
            ram = ${ram || null},
            storage = ${storage || null},
            graphics = ${graphics || null},
            screen_size = ${screen_size || null},
            color = ${color || null},
            operating_system = ${operating_system || null},
            software_list = ${software_list || null},
            purchase_date = ${purchase_date || null},
            delivery_date = ${delivery_date || null},
            purchase_price = ${purchase_price || null},
            purchase_invoice = ${purchase_invoice || null},
            warranty_end = ${warranty_end || null},
            condition = ${condition || 'Bom'},
            condition_score = ${condition_score || 70},
            status = ${status || 'Em Uso'},
            photo = ${photo || null},
            damage_analysis = ${damage_analysis ? JSON.stringify(damage_analysis) : null},
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
        if (result.length === 0) throw new Error('Ativo não encontrado');
        return { success: true, data: result[0] };
      } catch (error) {
        if (error.message.includes('duplicate key') || error.message.includes('unique')) {
          return { success: false, error: 'Service tag já existe' };
        }
        return handleDatabaseError('assets.update', error);
      }
    },

    async delete(id, userId) {
      if (!sql) return { success: false, error: 'Banco de dados não disponível' };
      try {
        const result = await sql`DELETE FROM laptops WHERE id = ${id} RETURNING id`;
        if (result.length === 0) throw new Error('Ativo não encontrado');
        return { success: true, message: 'Ativo excluído com sucesso' };
      } catch (error) {
        return handleDatabaseError('assets.delete', error);
      }
    },

    async checkServiceTagExists(serviceTag, excludeId = null) {
      if (!sql) return { success: true, exists: false };
      try {
        let query;
        if (excludeId) {
          query = await sql`SELECT id FROM laptops WHERE service_tag = ${serviceTag} AND id != ${excludeId}`;
        } else {
          query = await sql`SELECT id FROM laptops WHERE service_tag = ${serviceTag}`;
        }
        return { success: true, exists: query.length > 0 };
      } catch (error) {
        return handleDatabaseError('assets.checkServiceTagExists', error);
      }
    },

    async updateDellSupport(assetId, dellSupportData, userId) {
      if (!sql) return { success: false, error: 'Banco de dados não disponível' };
      try {
        const {
          dell_support_ticket, dell_support_status, dell_support_opened_date,
          dell_support_description, dell_support_priority,
          dell_support_estimated_resolution, dell_support_notes
        } = dellSupportData;

        const result = await sql`
          UPDATE laptops SET
            dell_support_ticket = ${dell_support_ticket || null},
            dell_support_status = ${dell_support_status || null},
            dell_support_opened_date = ${dell_support_opened_date || null},
            dell_support_description = ${dell_support_description || null},
            dell_support_priority = ${dell_support_priority || null},
            dell_support_estimated_resolution = ${dell_support_estimated_resolution || null},
            dell_support_notes = ${dell_support_notes || null},
            last_updated_by = ${userId},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${assetId}
          RETURNING *
        `;
        if (result.length === 0) throw new Error('Ativo não encontrado');
        return { success: true, data: result[0] };
      } catch (error) {
        return handleDatabaseError('assets.updateDellSupport', error);
      }
    },

    async getWithDellSupport() {
      if (!sql) return { success: true, data: [] };
      try {
        const assets = await sql`
          SELECT l.*, u.name as created_by_name, uu.name as last_updated_by_name
          FROM laptops l
          LEFT JOIN users u ON l.created_by = u.id
          LEFT JOIN users uu ON l.last_updated_by = uu.id
          WHERE l.dell_support_ticket IS NOT NULL
            AND l.dell_support_status NOT IN ('Fechado', 'Resolvido')
          ORDER BY l.dell_support_opened_date DESC
        `;
        return { success: true, data: assets };
      } catch (error) {
        return handleDatabaseError('assets.getWithDellSupport', error);
      }
    },

    async getDellSupportStats() {
      if (!sql) {
        return {
          success: true,
          data: { total_tickets: 0, open_tickets: 0, in_progress_tickets: 0, waiting_parts_tickets: 0, closed_tickets: 0, high_priority_tickets: 0, overdue_tickets: 0 }
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
        return { success: true, data: stats[0] };
      } catch (error) {
        return handleDatabaseError('assets.getDellSupportStats', error);
      }
    }
  },

  async getStatistics() {
    if (!sql) {
      return {
        success: true,
        data: {
          total_assets: 0, available_assets: 0, in_use_assets: 0,
          maintenance_assets: 0, discarded_assets: 0,
          total_value: 0, avg_condition: 0,
          notebooks: 0, desktops: 0, monitors: 0, impressoras: 0, outros: 0
        }
      };
    }
    try {
      const stats = await sql`
        SELECT
          COUNT(*) as total_assets,
          COUNT(CASE WHEN status = 'Disponível' THEN 1 END) as available_assets,
          COUNT(CASE WHEN status = 'Em Uso' THEN 1 END) as in_use_assets,
          COUNT(CASE WHEN status = 'Manutenção' THEN 1 END) as maintenance_assets,
          COUNT(CASE WHEN status = 'Descartado' THEN 1 END) as discarded_assets,
          COALESCE(SUM(purchase_price), 0) as total_value,
          COALESCE(AVG(condition_score), 0) as avg_condition,
          COUNT(CASE WHEN asset_type = 'Notebook' THEN 1 END) as notebooks,
          COUNT(CASE WHEN asset_type = 'Desktop' THEN 1 END) as desktops,
          COUNT(CASE WHEN asset_type = 'Monitor' THEN 1 END) as monitors,
          COUNT(CASE WHEN asset_type = 'Impressora' THEN 1 END) as impressoras,
          COUNT(CASE WHEN asset_type NOT IN ('Notebook','Desktop','Monitor','Impressora') THEN 1 END) as outros
        FROM laptops
      `;
      // Keep backward compat aliases
      const d = stats[0];
      return {
        success: true,
        data: {
          ...d,
          total_laptops: d.total_assets,
          available_laptops: d.available_assets,
          in_use_laptops: d.in_use_assets,
          maintenance_laptops: d.maintenance_assets,
          discarded_laptops: d.discarded_assets
        }
      };
    } catch (error) {
      return handleDatabaseError('getStatistics', error);
    }
  }
};

console.log('✅ dataService inicializado');
export default dataService;
