// src/config/database.js - SOMENTE NEON DATABASE (SEM MODO OFFLINE)
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

// Validar formato da URL
DATABASE_URL = DATABASE_URL.trim();

if (!DATABASE_URL.startsWith('postgresql://') && !DATABASE_URL.startsWith('postgres://')) {
  console.error('❌ ERRO CRÍTICO: Connection string inválida!');
  console.error('❌ Formato atual:', DATABASE_URL.substring(0, 20) + '...');
  console.error('❌ Formato esperado: postgresql://user:pass@host.neon.tech/dbname');
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

// Função para criar tabelas (OBRIGATÓRIA)
const createTables = async () => {
  console.log('🔄 Criando estrutura OBRIGATÓRIA do banco...');
  
  try {
    // Verificar tabelas existentes
    const existingTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'floors', 'rooms', 'laptops')
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
    
    // Criar tabela floors
    console.log('📝 Criando tabela floors...');
    await sql`
      CREATE TABLE IF NOT EXISTS floors (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Criar tabela rooms
    console.log('📝 Criando tabela rooms...');
    await sql`
      CREATE TABLE IF NOT EXISTS rooms (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        floor_id BIGINT REFERENCES floors(id) ON DELETE CASCADE,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Criar tabela laptops
    console.log('📝 Criando tabela laptops...');
    await sql`
      CREATE TABLE IF NOT EXISTS laptops (
        id BIGSERIAL PRIMARY KEY,
        model VARCHAR(255) NOT NULL,
        serial_number VARCHAR(255) NOT NULL,
        service_tag VARCHAR(255),
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
        floor_id BIGINT REFERENCES floors(id) ON DELETE SET NULL,
        room_id BIGINT REFERENCES rooms(id) ON DELETE SET NULL,
        photo TEXT,
        damage_analysis JSONB,
        purchase_date DATE,
        purchase_price DECIMAL(10,2),
        assigned_user VARCHAR(255),
        notes TEXT,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(serial_number, user_id)
      )
    `;
    
    // Criar índices para performance
    console.log('📝 Criando índices...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_floors_user_id ON floors(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_rooms_user_id ON rooms(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_rooms_floor_id ON rooms(floor_id)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_user_id ON laptops(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_serial ON laptops(serial_number)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_status ON laptops(status)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_floor_id ON laptops(floor_id)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_room_id ON laptops(room_id)'
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

// Função para inserir dados iniciais (OBRIGATÓRIA)
const insertInitialData = async (userId) => {
  console.log('🔄 Inserindo dados iniciais OBRIGATÓRIOS para usuário:', userId);
  
  try {
    // Verificar se já existem dados para este usuário
    const existingFloors = await sql`
      SELECT id FROM floors WHERE user_id = ${userId} LIMIT 1
    `;
    
    if (existingFloors.length > 0) {
      console.log('ℹ️ Dados iniciais já existem para este usuário');
      return true;
    }
    
    console.log('📝 Inserindo dados iniciais no banco...');
    
    // Inserir andares
    const floors = await sql`
      INSERT INTO floors (name, description, user_id) VALUES
        ('Térreo', 'Recepção e atendimento', ${userId}),
        ('1º Andar', 'Área administrativa', ${userId}),
        ('2º Andar', 'Setor de TI', ${userId})
      RETURNING id, name
    `;
    
    console.log('🏢 Andares criados:', floors.map(f => f.name));
    
    // Inserir salas para cada andar
    const roomsData = [
      // Térreo
      { name: 'Recepção', description: 'Área de atendimento ao cliente', floor_id: floors[0].id },
      { name: 'Sala de Espera', description: 'Área de espera para clientes', floor_id: floors[0].id },
      { name: 'Almoxarifado', description: 'Estoque de equipamentos', floor_id: floors[0].id },
      // 1º Andar
      { name: 'Escritório Admin', description: 'Administração geral', floor_id: floors[1].id },
      { name: 'Sala de Reuniões', description: 'Reuniões e apresentações', floor_id: floors[1].id },
      { name: 'RH', description: 'Recursos Humanos', floor_id: floors[1].id },
      // 2º Andar
      { name: 'Sala de TI', description: 'Departamento de Tecnologia', floor_id: floors[2].id },
      { name: 'Lab de Testes', description: 'Testes de equipamentos', floor_id: floors[2].id },
      { name: 'Suporte Técnico', description: 'Atendimento técnico', floor_id: floors[2].id }
    ];
    
    let roomsCreated = 0;
    for (const room of roomsData) {
      await sql`
        INSERT INTO rooms (name, description, floor_id, user_id)
        VALUES (${room.name}, ${room.description}, ${room.floor_id}, ${userId})
      `;
      roomsCreated++;
    }
    
    console.log(`✅ DADOS INICIAIS INSERIDOS: ${floors.length} andares, ${roomsCreated} salas`);
    return true;
  } catch (error) {
    console.error('❌ ERRO CRÍTICO ao inserir dados iniciais:', error);
    
    // Diagnóstico específico
    if (error.message.includes('duplicate key')) {
      console.error('🔧 DIAGNÓSTICO: Chave duplicada');
      console.error('   ❌ Dados já existem para este usuário');
      console.error('   ❌ Verificar constraint UNIQUE');
    } else if (error.message.includes('foreign key')) {
      console.error('🔧 DIAGNÓSTICO: Violação de foreign key');
      console.error('   ❌ Referência para tabela inexistente');
      console.error('   ❌ Verificar se as tabelas foram criadas');
    }
    
    // ❌ FALHA CRÍTICA - NÃO CONTINUA SEM DADOS INICIAIS
    throw new Error(`FALHA CRÍTICA: Não é possível inserir dados iniciais. ${error.message}`);
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
console.log('🔄 === STATUS FINAL - SOMENTE NEON ===');
console.log('✅ Connection string configurada');
console.log('✅ Cliente Neon inicializado');
console.log('✅ Modo: SOMENTE BANCO NEON');
console.log('❌ Modo offline: DESABILITADO');
console.log('=====================================');

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
