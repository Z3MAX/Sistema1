// src/config/database.js - VERSÃO ATUALIZADA SEM FLOORS/ROOMS
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
    
    // Diagnóstico específico para falha crítica
    if (error.message.includes('authentication failed') || error.message.includes('password')) {
      console.error('🔧 DIAGNÓSTICO: Falha de autenticação');
      console.error('   ❌ Usuário ou senha incorretos na connection string');
      console.error('   ❌ Verificar credenciais no dashboard do Neon');
      console.error('   ❌ Verificar se o projeto Neon não foi deletado');
    } else if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
      console.error('🔧 DIAGNÓSTICO: Timeout de conexão');
      console.error('   ❌ Neon pode estar sobrecarregado');
      console.error('   ❌ Verificar status do Neon: https://neon.tech/status');
      console.error('   ❌ Verificar conectividade com a internet');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('host')) {
      console.error('🔧 DIAGNÓSTICO: Host não encontrado');
      console.error('   ❌ Hostname incorreto na connection string');
      console.error('   ❌ Verificar se o endpoint Neon está correto');
      console.error('   ❌ Verificar se o projeto Neon ainda existe');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.error('🔧 DIAGNÓSTICO: Database não encontrada');
      console.error('   ❌ Nome da database incorreto na connection string');
      console.error('   ❌ Verificar se a database foi criada no Neon');
    } else if (error.message.includes('too many connections')) {
      console.error('🔧 DIAGNÓSTICO: Muitas conexões simultâneas');
      console.error('   ❌ Limite de conexões atingido');
      console.error('   ❌ Aguardar alguns minutos ou usar connection pooling');
    } else {
      console.error('🔧 DIAGNÓSTICO: Erro desconhecido');
      console.error('   ❌ Verificar se o projeto Neon está ativo');
      console.error('   ❌ Verificar se não há limitações de rede');
      console.error('   ❌ Verificar status do Neon');
    }
    
    // ❌ FALHA CRÍTICA - NÃO CONTINUA SEM BANCO
    throw new Error(`FALHA CRÍTICA: Não é possível conectar ao banco Neon. ${error.message}`);
  }
};

// Função para criar tabelas (OBRIGATÓRIA) - VERSÃO SEM FLOORS/ROOMS
const createTables = async () => {
  console.log('🔄 Criando estrutura OBRIGATÓRIA do banco...');
  
  try {
    // Verificar tabelas existentes
    const existingTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'laptops')
    `;
    
    console.log('📋 Tabelas existentes:', existingTables.map(t => t.table_name));
    
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
    
    // Criar tabela laptops - VERSÃO SEM FLOORS/ROOMS
    console.log('📝 Criando tabela laptops...');
    await sql`
      CREATE TABLE IF NOT EXISTS laptops (
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
    
    // Verificar se as colunas created_by, last_updated_by e user_id existem
    console.log('📝 Verificando colunas created_by, last_updated_by e user_id...');
    
    const existingColumns = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'laptops'
      AND column_name IN ('created_by', 'last_updated_by', 'service_tag', 'user_id')
    `;
    
    const existingColumnNames = existingColumns.map(col => col.column_name);
    
    // Adicionar colunas se não existirem
    if (!existingColumnNames.includes('created_by')) {
      console.log('📝 Adicionando coluna created_by...');
      await sql`
        ALTER TABLE laptops 
        ADD COLUMN created_by BIGINT REFERENCES users(id) ON DELETE SET NULL
      `;
    }
    
    if (!existingColumnNames.includes('last_updated_by')) {
      console.log('📝 Adicionando coluna last_updated_by...');
      await sql`
        ALTER TABLE laptops 
        ADD COLUMN last_updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL
      `;
    }
    
    if (!existingColumnNames.includes('user_id')) {
      console.log('📝 Adicionando coluna user_id...');
      await sql`
        ALTER TABLE laptops 
        ADD COLUMN user_id BIGINT REFERENCES users(id) ON DELETE CASCADE
      `;
    }
    
    // Verificar e ajustar service_tag se necessário
    if (existingColumnNames.includes('service_tag')) {
      console.log('📝 Verificando constraint de service_tag...');
      
      // Verificar se service_tag já tem constraint unique
      const constraints = await sql`
        SELECT constraint_name
        FROM information_schema.table_constraints 
        WHERE table_name = 'laptops' 
        AND constraint_type = 'UNIQUE'
        AND constraint_name LIKE '%service_tag%'
      `;
      
      // Se não houver constraint unique no service_tag, adicionar
      if (constraints.length === 0) {
        console.log('📝 Adicionando constraint unique para service_tag...');
        try {
          await sql`
            ALTER TABLE laptops 
            ADD CONSTRAINT unique_service_tag UNIQUE (service_tag)
          `;
          console.log('✅ Constraint unique adicionada ao service_tag');
        } catch (error) {
          console.log('ℹ️ Constraint unique já existe ou erro:', error.message);
        }
      }
      
      // Tornar service_tag NOT NULL se ainda não for
      try {
        await sql`
          ALTER TABLE laptops 
          ALTER COLUMN service_tag SET NOT NULL
        `;
        console.log('✅ service_tag configurado como NOT NULL');
      } catch (error) {
        console.log('ℹ️ service_tag já é NOT NULL ou erro:', error.message);
      }
    }
    
    // Remover colunas de floors/rooms se existirem
    console.log('📝 Removendo colunas de floors/rooms se existirem...');
    
    try {
      await sql`
        ALTER TABLE laptops 
        DROP COLUMN IF EXISTS floor_id,
        DROP COLUMN IF EXISTS room_id
      `;
      console.log('✅ Colunas floor_id e room_id removidas');
    } catch (error) {
      console.log('ℹ️ Colunas floor_id/room_id não existiam');
    }
    
    // Remover constraint de serial_number se existir
    console.log('📝 Removendo constraint de serial_number se existir...');
    try {
      await sql`
        ALTER TABLE laptops 
        DROP CONSTRAINT IF EXISTS laptops_serial_number_user_id_key
      `;
      console.log('✅ Constraint de serial_number removida');
    } catch (error) {
      console.log('ℹ️ Constraint de serial_number não existia');
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
    
    console.log('✅ ESTRUTURA DO BANCO CRIADA COM SUCESSO!');
    return true;
  } catch (error) {
    console.error('❌ ERRO CRÍTICO ao criar estrutura do banco:', error);
    
    // Diagnóstico específico para falha crítica
    if (error.message.includes('permission denied')) {
      console.error('🔧 DIAGNÓSTICO: Permissão negada');
      console.error('   ❌ Usuário não tem permissão para CREATE TABLE');
      console.error('   ❌ Verificar role do usuário no Neon');
      console.error('   ❌ Verificar se está usando a role correta');
    } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.error('🔧 DIAGNÓSTICO: Tabela de referência não existe');
      console.error('   ❌ Problema com foreign keys');
      console.error('   ❌ Verificar ordem de criação das tabelas');
    } else if (error.message.includes('already exists') && !error.message.includes('IF NOT EXISTS')) {
      console.error('🔧 DIAGNÓSTICO: Tabela já existe');
      console.error('   ❌ Conflito na criação de tabelas');
      console.error('   ❌ Verificar se IF NOT EXISTS está funcionando');
    }
    
    // ❌ FALHA CRÍTICA - NÃO CONTINUA SEM ESTRUTURA
    throw new Error(`FALHA CRÍTICA: Não é possível criar estrutura do banco. ${error.message}`);
  }
};

// Função para inserir dados iniciais (OPCIONAL) - SEM FLOORS/ROOMS
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
    
    console.log('ℹ️ Nenhum dado inicial necessário (sem floors/rooms)');
    console.log('✅ Sistema pronto para uso!');
    
    return true;
  } catch (error) {
    console.error('❌ ERRO ao verificar dados iniciais:', error);
    
    // Não é crítico, sistema pode funcionar sem dados iniciais
    console.log('ℹ️ Continuando sem dados iniciais...');
    return true;
  }
};

// Funções utilitárias (sempre retornam true pois banco é obrigatório)
const isDatabaseAvailable = () => {
  return true; // Sempre true, pois sem banco o sistema falha
};

const getConnectionStatus = () => {
  return {
    hasUrl: true,
    hasConnection: true,
    mode: 'database-only',
    urlSource: 'neon',
    environment: import.meta.env.MODE,
    offline: false // Nunca offline
  };
};

// Log de status final
console.log('🔄 === STATUS FINAL - SOMENTE NEON SEM FLOORS/ROOMS ===');
console.log('✅ Connection string configurada');
console.log('✅ Cliente Neon inicializado');
console.log('✅ Modo: SOMENTE BANCO NEON');
console.log('✅ Estrutura: SEM FLOORS/ROOMS');
console.log('❌ Modo offline: DESABILITADO');
console.log('==================================================');

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
