import { neon } from '@neondatabase/serverless';
import { INITIAL_ASSETS } from '../data/initialAssets';

const NEON_DATABASE_URL = import.meta.env.VITE_NEON_DATABASE_URL;

const isDatabaseAvailable = () => {
  return !!(NEON_DATABASE_URL && NEON_DATABASE_URL.length > 10 && NEON_DATABASE_URL !== 'your-neon-url-here');
};

const getConnectionStatus = () => {
  return {
    hasUrl: !!(NEON_DATABASE_URL && NEON_DATABASE_URL.length > 10),
    isValid: isDatabaseAvailable(),
    message: isDatabaseAvailable() ? 'Conectado ao Neon' : 'URL não configurada'
  };
};

let sql = null;
if (isDatabaseAvailable()) {
  try {
    sql = neon(NEON_DATABASE_URL);
    console.log('✅ Conexão Neon inicializada');
  } catch (error) {
    console.error('❌ Erro ao inicializar Neon:', error);
    sql = null;
  }
} else {
  console.log('⚠️ Banco Neon não configurado - funcionando em modo offline');
}

const testConnection = async () => {
  if (!sql) return false;
  try {
    await sql`SELECT NOW() as current_time`;
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão com Neon:', error);
    return false;
  }
};

const createTables = async () => {
  console.log('🔄 Criando/atualizando estrutura do banco...');

  try {
    // Tabela users
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

    // Tabela assets (inventário de TI)
    await sql`
      CREATE TABLE IF NOT EXISTS laptops (
        id BIGSERIAL PRIMARY KEY,
        -- Identificação
        asset_type VARCHAR(50) DEFAULT 'Notebook',
        model VARCHAR(255) NOT NULL,
        service_tag VARCHAR(255) NOT NULL UNIQUE,
        hostname VARCHAR(255),
        patrimony_number VARCHAR(100),
        -- Localização/Projeto
        location VARCHAR(255),
        project VARCHAR(255),
        department VARCHAR(255),
        -- Usuários
        assigned_user VARCHAR(255),
        responsible VARCHAR(255),
        purchase_company VARCHAR(255),
        term_signed VARCHAR(20),
        -- Rede
        mac_address VARCHAR(50),
        teamviewer_id VARCHAR(50),
        -- Hardware
        processor VARCHAR(255),
        ram VARCHAR(255),
        storage VARCHAR(255),
        graphics VARCHAR(255),
        screen_size VARCHAR(255),
        color VARCHAR(255),
        operating_system VARCHAR(255),
        software_list TEXT,
        -- Financeiro
        purchase_date DATE,
        delivery_date DATE,
        purchase_price DECIMAL(10,2),
        purchase_invoice VARCHAR(100),
        warranty_end DATE,
        -- Estado
        condition VARCHAR(50) DEFAULT 'Bom',
        condition_score INTEGER DEFAULT 70,
        status VARCHAR(50) DEFAULT 'Em Uso',
        -- Suporte Dell
        dell_support_ticket VARCHAR(255),
        dell_support_status VARCHAR(50),
        dell_support_opened_date DATE,
        dell_support_description TEXT,
        dell_support_priority VARCHAR(20),
        dell_support_estimated_resolution DATE,
        dell_support_notes TEXT,
        -- Mídia
        photo TEXT,
        damage_analysis JSONB,
        notes TEXT,
        -- Auditoria
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
        last_updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Adicionar colunas novas em tabelas existentes (migração segura)
    const newColumns = [
      "ALTER TABLE laptops ADD COLUMN IF NOT EXISTS asset_type VARCHAR(50) DEFAULT 'Notebook'",
      "ALTER TABLE laptops ADD COLUMN IF NOT EXISTS hostname VARCHAR(255)",
      "ALTER TABLE laptops ADD COLUMN IF NOT EXISTS patrimony_number VARCHAR(100)",
      "ALTER TABLE laptops ADD COLUMN IF NOT EXISTS location VARCHAR(255)",
      "ALTER TABLE laptops ADD COLUMN IF NOT EXISTS project VARCHAR(255)",
      "ALTER TABLE laptops ADD COLUMN IF NOT EXISTS department VARCHAR(255)",
      "ALTER TABLE laptops ADD COLUMN IF NOT EXISTS responsible VARCHAR(255)",
      "ALTER TABLE laptops ADD COLUMN IF NOT EXISTS purchase_company VARCHAR(255)",
      "ALTER TABLE laptops ADD COLUMN IF NOT EXISTS term_signed VARCHAR(20)",
      "ALTER TABLE laptops ADD COLUMN IF NOT EXISTS mac_address VARCHAR(50)",
      "ALTER TABLE laptops ADD COLUMN IF NOT EXISTS teamviewer_id VARCHAR(50)",
      "ALTER TABLE laptops ADD COLUMN IF NOT EXISTS operating_system VARCHAR(255)",
      "ALTER TABLE laptops ADD COLUMN IF NOT EXISTS software_list TEXT",
      "ALTER TABLE laptops ADD COLUMN IF NOT EXISTS delivery_date DATE",
      "ALTER TABLE laptops ADD COLUMN IF NOT EXISTS purchase_invoice VARCHAR(100)"
    ];

    for (const colSql of newColumns) {
      try {
        await sql([colSql]);
      } catch (e) {
        // Column already exists - ignore
      }
    }

    // Índices
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_user_id ON laptops(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_service_tag ON laptops(service_tag)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_status ON laptops(status)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_asset_type ON laptops(asset_type)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_location ON laptops(location)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_project ON laptops(project)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_assigned_user ON laptops(assigned_user)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_dell_support_ticket ON laptops(dell_support_ticket)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_dell_support_status ON laptops(dell_support_status)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_warranty_end ON laptops(warranty_end)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_condition ON laptops(condition)'
    ];

    for (const indexSql of indexes) {
      try {
        await sql([indexSql]);
      } catch (e) {
        // Already exists
      }
    }

    console.log('✅ Estrutura do banco atualizada!');
    return true;

  } catch (error) {
    console.error('❌ ERRO ao criar estrutura do banco:', error);
    throw new Error(`Falha ao criar estrutura: ${error.message}`);
  }
};

const insertInitialData = async () => {
  if (!sql) return;

  try {
    // Criar admin se não existir
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    if (parseInt(userCount[0].count) === 0) {
      const adminUser = await sql`
        INSERT INTO users (name, email, password_hash, company, role)
        VALUES ('Admin', 'admin@rtt.com', ${btoa('admin123' + 'dell_laptop_salt_2024')}, 'RTT Soluções', 'admin')
        RETURNING id
      `;
      console.log('✅ Usuário admin criado:', adminUser[0].id);
    }

    // Importar ativos do Excel se tabela estiver vazia
    const assetCount = await sql`SELECT COUNT(*) as count FROM laptops`;
    if (parseInt(assetCount[0].count) === 0) {
      console.log(`🔄 Importando ${INITIAL_ASSETS.length} ativos do inventário RTT...`);

      // Buscar id do admin
      const admin = await sql`SELECT id FROM users LIMIT 1`;
      const adminId = admin[0]?.id;

      // Inserir em lotes de 50
      const batchSize = 50;
      let inserted = 0;

      for (let i = 0; i < INITIAL_ASSETS.length; i += batchSize) {
        const batch = INITIAL_ASSETS.slice(i, i + batchSize);

        for (const asset of batch) {
          try {
            await sql`
              INSERT INTO laptops (
                asset_type, model, service_tag, hostname, patrimony_number,
                location, project, department, assigned_user, responsible,
                purchase_company, term_signed, mac_address, teamviewer_id,
                processor, ram, storage, graphics, operating_system,
                software_list, purchase_date, delivery_date, purchase_invoice,
                condition, condition_score, status,
                user_id, created_by, last_updated_by
              ) VALUES (
                ${asset.asset_type || 'Notebook'},
                ${asset.model},
                ${asset.service_tag},
                ${asset.hostname || null},
                ${asset.patrimony_number || null},
                ${asset.location || null},
                ${asset.project || null},
                ${asset.department || null},
                ${asset.assigned_user || null},
                ${asset.responsible || null},
                ${asset.purchase_company || null},
                ${asset.term_signed || null},
                ${asset.mac_address || null},
                ${asset.teamviewer_id || null},
                ${asset.processor || null},
                ${asset.ram || null},
                ${asset.storage || null},
                ${asset.graphics || null},
                ${asset.operating_system || null},
                ${asset.software_list || null},
                ${asset.purchase_date || null},
                ${asset.delivery_date || null},
                ${asset.purchase_invoice || null},
                ${asset.condition || 'Bom'},
                ${asset.condition_score || 70},
                ${asset.status || 'Em Uso'},
                ${adminId}, ${adminId}, ${adminId}
              )
              ON CONFLICT (service_tag) DO NOTHING
            `;
            inserted++;
          } catch (e) {
            // Skip duplicate or invalid records
          }
        }
        console.log(`📦 Progresso: ${Math.min(i + batchSize, INITIAL_ASSETS.length)}/${INITIAL_ASSETS.length}`);
      }

      console.log(`✅ ${inserted} ativos importados com sucesso!`);
    } else {
      console.log(`ℹ️ Banco já contém ${assetCount[0].count} ativos, pulando importação inicial.`);
    }

  } catch (error) {
    console.error('❌ Erro ao inserir dados iniciais:', error);
  }
};

export default {
  sql,
  testConnection,
  createTables,
  insertInitialData,
  isDatabaseAvailable,
  getConnectionStatus
};
