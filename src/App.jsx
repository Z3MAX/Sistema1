// ============= ATUALIZAÇÕES PARA src/config/database.js =============
// Substitua a função createTables() pela versão atualizada abaixo:

const createTables = async () => {
  console.log('🔄 Criando estrutura OBRIGATÓRIA do banco...');
  
  try {
    // Criar tabela users
    console.log('📝 Criando tabela users...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // RECRIAR tabela laptops com campos de chamado Dell
    console.log('🔄 Recriando tabela laptops com campos de chamado Dell...');
    
    // Backup dos dados existentes
    let backupData = [];
    try {
      backupData = await sql`SELECT * FROM laptops`;
      console.log(`📋 Backup de ${backupData.length} laptops realizado`);
    } catch (error) {
      console.log('ℹ️ Nenhum dado existente para backup');
    }
    
    // Dropar e recriar tabela
    await sql`DROP TABLE IF EXISTS laptops CASCADE`;
    console.log('🗑️ Tabela laptops removida');
    
    console.log('📝 Criando nova tabela laptops com campos de chamado Dell...');
    await sql`
      CREATE TABLE laptops (
        id BIGSERIAL PRIMARY KEY,
        model VARCHAR(255) NOT NULL,
        service_tag VARCHAR(255) NOT NULL UNIQUE,
        processor VARCHAR(255),
        ram VARCHAR(255),
        storage VARCHAR(255),
        graphics VARCHAR(255),
        screen_size VARCHAR(255),
        color VARCHAR(255),
        warranty_end DATE,
        condition VARCHAR(50) DEFAULT 'Excelente',
        condition_score INTEGER DEFAULT 100,
        status VARCHAR(50) DEFAULT 'Disponível',
        
        -- NOVOS CAMPOS PARA CHAMADO DELL
        dell_support_ticket VARCHAR(255),
        dell_support_status VARCHAR(50),
        dell_support_opened_date DATE,
        dell_support_description TEXT,
        dell_support_priority VARCHAR(20),
        dell_support_estimated_resolution DATE,
        dell_support_notes TEXT,
        
        photo TEXT,
        damage_analysis JSONB,
        purchase_date DATE,
        purchase_price DECIMAL(10,2),
        assigned_user VARCHAR(255),
        notes TEXT,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
        last_updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Restaurar dados com campos novos como null
    if (backupData.length > 0) {
      console.log('🔄 Restaurando dados do backup...');
      let restoredCount = 0;
      
      for (const laptop of backupData) {
        try {
          await sql`
            INSERT INTO laptops (
              model, service_tag, processor, ram, storage, graphics,
              screen_size, color, warranty_end, condition, condition_score, status,
              photo, damage_analysis, purchase_date, purchase_price,
              assigned_user, notes, user_id, created_by, last_updated_by,
              dell_support_ticket, dell_support_status, dell_support_opened_date,
              dell_support_description, dell_support_priority, dell_support_estimated_resolution,
              dell_support_notes
            ) VALUES (
              ${laptop.model}, ${laptop.service_tag}, ${laptop.processor},
              ${laptop.ram}, ${laptop.storage}, ${laptop.graphics},
              ${laptop.screen_size}, ${laptop.color}, ${laptop.warranty_end},
              ${laptop.condition}, ${laptop.condition_score}, ${laptop.status},
              ${laptop.photo}, ${laptop.damage_analysis}, ${laptop.purchase_date},
              ${laptop.purchase_price}, ${laptop.assigned_user}, ${laptop.notes},
              ${laptop.user_id}, ${laptop.created_by}, ${laptop.last_updated_by},
              null, null, null, null, null, null, null
            )
          `;
          restoredCount++;
        } catch (restoreError) {
          console.log(`⚠️ Erro ao restaurar laptop ${laptop.id}:`, restoreError.message);
        }
      }
      
      console.log(`✅ ${restoredCount}/${backupData.length} laptops restaurados`);
    }
    
    // Remover tabelas de floors e rooms se existirem
    console.log('📝 Removendo tabelas floors e rooms se existirem...');
    try {
      await sql`DROP TABLE IF EXISTS rooms CASCADE`;
      await sql`DROP TABLE IF EXISTS floors CASCADE`;
      console.log('✅ Tabelas floors e rooms removidas');
    } catch (error) {
      console.log('ℹ️ Tabelas floors/rooms não existiam');
    }
    
    // Criar índices incluindo os novos campos
    console.log('📝 Criando índices...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_user_id ON laptops(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_service_tag ON laptops(service_tag)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_status ON laptops(status)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_dell_support_ticket ON laptops(dell_support_ticket)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_dell_support_status ON laptops(dell_support_status)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_created_by ON laptops(created_by)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_last_updated_by ON laptops(last_updated_by)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_warranty_end ON laptops(warranty_end)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_condition ON laptops(condition)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_assigned_user ON laptops(assigned_user)'
    ];
    
    for (const indexSql of indexes) {
      try {
        await sql([indexSql]);
        const indexName = indexSql.split(' ')[5];
        console.log(`✅ Índice criado: ${indexName}`);
      } catch (error) {
        const indexName = indexSql.split(' ')[5];
        console.log(`ℹ️ Índice já existe: ${indexName}`);
      }
    }
    
    console.log('✅ ESTRUTURA DO BANCO ATUALIZADA COM CAMPOS DE CHAMADO DELL!');
    return true;
    
  } catch (error) {
    console.error('❌ ERRO CRÍTICO ao criar estrutura do banco:', error);
    throw new Error(`FALHA CRÍTICA: Não é possível criar estrutura do banco. ${error.message}`);
  }
};
