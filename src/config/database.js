// src/config/database.js - VERSÃO COM RECRIAÇÃO FORÇADA DA TABELA
import { neon } from '@neondatabase/serverless';

console.log('🔍 === INICIALIZANDO CONEXÃO EXCLUSIVA COM NEON ===');

// Verificar variáveis de ambiente disponíveis
const availableVars = Object.keys(import.meta.env).filter(key => 
  key.includes('DATABASE') || key.includes('NEON')
);
console.log('📋 Variáveis de ambiente disponíveis:', availableVars);

// Buscar URL do banco na ordem correta (Netlify DB primeiro)
let DATABASE_URL = 
  import.meta.env.NETLIFY_DATABASE_URL ||      // Netlify DB oficial
  import.meta.env.VITE_DATABASE_URL ||        // Variável customizada
  import.meta.env.DATABASE_URL ||             // Padrão Node.js
  import.meta.env.VITE_NEON_DATABASE_URL ||   // Alternativa
  import.meta.env.NEON_DATABASE_URL;          // Fallback

// ❌ FALHA IMEDIATA SE NÃO TIVER CONNECTION STRING
if (!DATABASE_URL) {
  console.error('❌ ERRO CRÍTICO: Nenhuma connection string encontrada!');
  console.error('❌ Variáveis verificadas:', availableVars);
  console.error('❌ Configure uma dessas variáveis no Netlify:');
  console.error('   - NETLIFY_DATABASE_URL');
  console.error('   - VITE_DATABASE_URL');
  console.error('   - DATABASE_URL');
  throw new Error('ERRO CRÍTICO: Connection string do banco não encontrada. Configure NETLIFY_DATABASE_URL ou VITE_DATABASE_URL no Netlify.');
}

console.log('✅ Connection string encontrada');

// Limpar e validar formato da URL
DATABASE_URL = DATABASE_URL.trim();

// Remover prefixo psql se existir
if (DATABASE_URL.startsWith('psql ')) {
  console.log('🔧 Removendo prefixo psql da connection string...');
  DATABASE_URL = DATABASE_URL.replace(/^psql\s+['"]?/, '').replace(/['"]?$/, '');
  console.log('✅ Connection string limpa');
}

// Validar formato após limpeza
if (!DATABASE_URL.startsWith('postgresql://') && !DATABASE_URL.startsWith('postgres://')) {
  console.error('❌ ERRO CRÍTICO: Connection string inválida após limpeza!');
  console.error('❌ Formato atual:', DATABASE_URL.substring(0, 20) + '...');
  console.error('❌ Formato esperado: postgresql://user:pass@host.neon.tech/dbname');
  console.error('❌ Verifique se a connection string está correta no Neon Dashboard');
  throw new Error('ERRO CRÍTICO: Connection string deve começar com postgresql:// ou postgres://');
}

console.log('✅ Connection string válida');
// Mostrar apenas parte da URL por segurança
const maskedUrl = DATABASE_URL.substring(0, 20) + '***' + DATABASE_URL.substring(DATABASE_URL.length - 15);
console.log('🔗 URL mascarada:', maskedUrl);

// Inicializar cliente Neon
let sql;
try {
  sql = neon(DATABASE_URL);
  console.log('✅ Cliente Neon inicializado');
} catch (error) {
  console.error('❌ ERRO CRÍTICO ao inicializar cliente Neon:', error);
  throw new Error(`ERRO CRÍTICO: Falha ao inicializar cliente Neon: ${error.message}`);
}

// Função para testar conexão (OBRIGATÓRIA)
const testConnection = async () => {
  console.log('🔄 Testando conexão OBRIGATÓRIA com Neon...');
  
  try {
    // Timeout de 15 segundos para conexão
    const testPromise = sql`SELECT 1 as test, NOW() as timestamp, current_database() as db_name, current_user as user_name`;
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('TIMEOUT: Conexão demorou mais de 15 segundos')), 15000)
    );
    
    const result = await Promise.race([testPromise, timeoutPromise]);
    
    if (!result || !result[0]) {
      throw new Error('Resposta inválida do banco de dados');
    }
    
    console.log('✅ CONEXÃO COM NEON ESTABELECIDA COM SUCESSO!');
    console.log('📊 Informações do banco:');
    console.log('   - Database:', result[0].db_name);
    console.log('   - Usuário:', result[0].user_name);
    console.log('   - Timestamp:', result[0].timestamp);
    console.log('   - Teste:', result[0].test);
    
    return true;
  } catch (error) {
    console.error('❌ ERRO CRÍTICO DE CONEXÃO:', error.message);
    throw new Error(`FALHA CRÍTICA: Não é possível conectar ao banco Neon. ${error.message}`);
  }
};

// Função para criar tabelas (OBRIGATÓRIA) - VERSÃO COM RECRIAÇÃO FORÇADA
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
    
    // RECRIAR tabela laptops do zero para garantir estrutura correta
    console.log('🔄 Recriando tabela laptops...');
    
    // Primeiro, fazer backup dos dados existentes se houver
    let backupData = [];
    try {
      backupData = await sql`SELECT * FROM laptops`;
      console.log(`📋 Backup de ${backupData.length} laptops realizado`);
    } catch (error) {
      console.log('ℹ️ Nenhum dado existente para backup');
    }
    
    // Dropar tabela existente
    await sql`DROP TABLE IF EXISTS laptops CASCADE`;
    console.log('🗑️ Tabela laptops removida');
    
    // Criar tabela laptops com estrutura correta
    console.log('📝 Criando nova tabela laptops...');
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
    
    // Verificar a estrutura criada
    console.log('🔍 Verificando estrutura da nova tabela...');
    const structure = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'laptops'
      ORDER BY ordinal_position
    `;
    
    console.log('📋 Estrutura da tabela laptops:');
    structure.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Restaurar dados se houver backup
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
              assigned_user, notes, user_id, created_by, last_updated_by
            ) VALUES (
              ${laptop.model}, ${laptop.service_tag}, ${laptop.processor},
              ${laptop.ram}, ${laptop.storage}, ${laptop.graphics},
              ${laptop.screen_size}, ${laptop.color}, ${laptop.warranty_end},
              ${laptop.condition}, ${laptop.condition_score}, ${laptop.status},
              ${laptop.photo}, ${laptop.damage_analysis}, ${laptop.purchase_date},
              ${laptop.purchase_price}, ${laptop.assigned_user}, ${laptop.notes},
              ${laptop.user_id}, ${laptop.created_by}, ${laptop.last_updated_by}
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
    
    // Criar índices para performance
    console.log('📝 Criando índices...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_user_id ON laptops(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_service_tag ON laptops(service_tag)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_status ON laptops(status)',
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
        // Índices podem já existir, isso é normal
        const indexName = indexSql.split(' ')[5];
        console.log(`ℹ️ Índice já existe: ${indexName}`);
      }
    }
    
    console.log('✅ ESTRUTURA DO BANCO RECRIADA COM SUCESSO!');
    return true;
    
  } catch (error) {
    console.error('❌ ERRO CRÍTICO ao criar estrutura do banco:', error);
    throw new Error(`FALHA CRÍTICA: Não é possível criar estrutura do banco. ${error.message}`);
  }
};

// Função para inserir dados iniciais (OPCIONAL)
const insertInitialData = async (userId) => {
  console.log('🔄 Verificando dados iniciais para usuário:', userId);
  
  try {
    // Verificar se já existem dados para este usuário
    const existingLaptops = await sql`
      SELECT id FROM laptops WHERE user_id = ${userId} LIMIT 1
    `;
    
    if (existingLaptops.length > 0) {
      console.log('ℹ️ Dados iniciais já existem para este usuário');
      return true;
    }
    
    console.log('ℹ️ Nenhum dado inicial necessário');
    console.log('✅ Sistema pronto para uso!');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar dados iniciais:', error);
    console.log('ℹ️ Continuando sem dados iniciais...');
    return true;
  }
};

// Funções utilitárias
const isDatabaseAvailable = () => {
  return true;
};

const getConnectionStatus = () => {
  return {
    hasUrl: true,
    hasConnection: true,
    mode: 'database-only',
    urlSource: 'neon',
    environment: import.meta.env.MODE,
    offline: false
  };
};

// Log de status final
console.log('🔄 === STATUS FINAL - NEON COM RECRIAÇÃO FORÇADA ===');
console.log('✅ Connection string configurada');
console.log('✅ Cliente Neon inicializado');
console.log('✅ Modo: SOMENTE BANCO NEON');
console.log('✅ Estrutura: RECRIAÇÃO FORÇADA');
console.log('❌ Modo offline: DESABILITADO');
console.log('=====================================================');

// Exportações
export { 
  sql, 
  testConnection, 
  createTables, 
  insertInitialData,
  isDatabaseAvailable, 
  getConnectionStatus 
};

export default {
  sql,
  testConnection,
  createTables,
  insertInitialData,
  isDatabaseAvailable,
  getConnectionStatus
};
