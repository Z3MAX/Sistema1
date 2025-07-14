// src/config/database.js - VERSÃO ATUALIZADA PARA NETLIFY + NEON
import { neon } from '@neondatabase/serverless';

// 🔧 DEBUG: Verificar todas as possíveis variáveis de ambiente
console.log('🔍 === DEBUG DATABASE CONNECTION ===');
console.log('Environment mode:', import.meta.env.MODE);
console.log('Environment variables available:', Object.keys(import.meta.env));

// Verificar diferentes variáveis possíveis (em ordem de prioridade)
const possibleVars = [
  'VITE_DATABASE_URL',
  'NETLIFY_DATABASE_URL',
  'VITE_NEON_DATABASE_URL', 
  'DATABASE_URL',
  'NEON_DATABASE_URL'
];

possibleVars.forEach(varName => {
  const value = import.meta.env[varName];
  console.log(`${varName}:`, value ? '✅ CONFIGURADA' : '❌ NÃO ENCONTRADA');
  if (value) {
    // Mostrar apenas parte da string por segurança
    const masked = value.substring(0, 30) + '...' + value.substring(value.length - 20);
    console.log(`  -> ${masked}`);
  }
});

// Tentar obter a URL do banco (prioridade para VITE_ em builds)
let DATABASE_URL = 
  import.meta.env.VITE_DATABASE_URL || 
  import.meta.env.NETLIFY_DATABASE_URL ||
  import.meta.env.VITE_NEON_DATABASE_URL || 
  import.meta.env.DATABASE_URL ||
  import.meta.env.NEON_DATABASE_URL;

// Limpar a URL se estiver com prefixo psql
if (DATABASE_URL) {
  // Remover prefixo psql ' e sufixo '
  DATABASE_URL = DATABASE_URL.replace(/^psql\s*['"]?/, '').replace(/['"]?$/, '');
  
  // Garantir que começa com postgresql://
  if (!DATABASE_URL.startsWith('postgresql://')) {
    console.warn('⚠️ Connection string não começa com postgresql://, tentando corrigir...');
    if (DATABASE_URL.includes('postgresql://')) {
      DATABASE_URL = DATABASE_URL.substring(DATABASE_URL.indexOf('postgresql://'));
    }
  }
}

console.log('🔗 Selected DATABASE_URL:', DATABASE_URL ? '✅ ENCONTRADA' : '❌ NÃO ENCONTRADA');

if (DATABASE_URL) {
  console.log('🔗 Database URL preview:', DATABASE_URL.substring(0, 40) + '...');
  console.log('🔗 URL validation:');
  console.log('  - Starts with postgresql://:', DATABASE_URL.startsWith('postgresql://'));
  console.log('  - Contains neondb_owner:', DATABASE_URL.includes('neondb_owner'));
  console.log('  - Contains pooler:', DATABASE_URL.includes('pooler'));
  console.log('  - Contains sslmode:', DATABASE_URL.includes('sslmode'));
  console.log('  - Contains neon domain:', DATABASE_URL.includes('aws.neon.tech'));
} else {
  console.error('❌ NO DATABASE_URL FOUND!');
  console.log('🔧 Will run in offline mode');
}

// Inicializar conexão apenas se houver URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

if (sql) {
  console.log('✅ Neon client created successfully');
} else {
  console.log('⚠️ No Neon client - running in offline mode');
}

// Função melhorada para testar conexão
const testConnection = async () => {
  console.log('🔄 === STARTING CONNECTION TEST ===');
  
  if (!DATABASE_URL) {
    console.log('⚠️ No DATABASE_URL - running in offline mode');
    return false;
  }

  if (!sql) {
    console.log('⚠️ No SQL client - running in offline mode');
    return false;
  }

  try {
    console.log('🔄 Testing Neon connection...');
    console.log('🔄 Using URL:', DATABASE_URL.substring(0, 40) + '...');
    
    // Teste com timeout de 10 segundos
    const testPromise = sql`SELECT 1 as test, NOW() as timestamp, current_database() as db_name, current_user as user_name`;
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
    );
    
    const result = await Promise.race([testPromise, timeoutPromise]);
    
    console.log('✅ Connection successful!');
    console.log('📊 Test result:', result[0]);
    console.log('🏢 Database name:', result[0].db_name);
    console.log('👤 User name:', result[0].user_name);
    console.log('⏰ Server time:', result[0].timestamp);
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('❌ Error type:', error.constructor.name);
    console.error('❌ Error message:', error.message);
    
    // Diagnóstico específico por tipo de erro
    if (error.message.includes('timeout')) {
      console.log('🔧 DIAGNOSIS: Connection timeout - check network or Neon status');
    } else if (error.message.includes('authentication') || error.message.includes('password')) {
      console.log('🔧 DIAGNOSIS: Authentication failed - check credentials in connection string');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('🔧 DIAGNOSIS: Database not found - check database name in connection string');
    } else if (error.message.includes('connection') || error.message.includes('refused')) {
      console.log('🔧 DIAGNOSIS: Connection refused - check host/port in connection string');
    } else {
      console.log('🔧 DIAGNOSIS: Unknown error - check Neon project status');
    }
    
    console.log('📱 Falling back to offline mode');
    return false;
  }
};

// Função para criar tabelas com debug melhorado
const createTables = async () => {
  console.log('🔄 === STARTING TABLE CREATION ===');
  
  if (!sql) {
    console.log('📱 Offline mode - tables not needed');
    return false;
  }

  try {
    console.log('🔄 Creating database structure...');
    
    // Verificar se já existem tabelas
    const existingTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'floors', 'rooms', 'laptops')
    `;
    
    console.log('📋 Existing tables:', existingTables.map(t => t.table_name));
    
    // Criar tabelas uma por uma com logs detalhados
    const tables = [
      {
        name: 'users',
        sql: `CREATE TABLE IF NOT EXISTS users (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          company VARCHAR(255),
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'floors',
        sql: `CREATE TABLE IF NOT EXISTS floors (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'rooms',
        sql: `CREATE TABLE IF NOT EXISTS rooms (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          floor_id BIGINT REFERENCES floors(id) ON DELETE CASCADE,
          user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'laptops',
        sql: `CREATE TABLE IF NOT EXISTS laptops (
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
        )`
      }
    ];

    for (const table of tables) {
      try {
        console.log(`📝 Creating table: ${table.name}`);
        await sql([table.sql]);
        console.log(`✅ Table ${table.name} created successfully`);
      } catch (error) {
        console.error(`❌ Error creating table ${table.name}:`, error);
        throw error;
      }
    }

    // Criar índices para performance
    console.log('📝 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_laptops_user_id ON laptops(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_serial ON laptops(serial_number)',
      'CREATE INDEX IF NOT EXISTS idx_laptops_status ON laptops(status)',
      'CREATE INDEX IF NOT EXISTS idx_floors_user_id ON floors(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_rooms_user_id ON rooms(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_rooms_floor_id ON rooms(floor_id)',
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)'
    ];

    for (const indexSql of indexes) {
      try {
        await sql([indexSql]);
        console.log(`✅ Index created: ${indexSql.split(' ')[5]}`);
      } catch (error) {
        console.warn(`⚠️ Index creation warning:`, error.message);
      }
    }

    console.log('✅ All tables and indexes created successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      severity: error.severity
    });
    return false;
  }
};

// Função para gerar ID compatível com INTEGER do PostgreSQL (máximo 2,147,483,647)
const generateSafeId = () => {
  // Gerar um número entre 1 e 2,000,000,000 (menor que o limite do INTEGER)
  return Math.floor(Math.random() * 2000000000) + 1;
};

// Função para inserir dados iniciais
const insertInitialData = async (userId) => {
  console.log('🔄 === STARTING INITIAL DATA INSERTION ===');
  console.log('👤 User ID:', userId);
  
  if (!sql) {
    console.log('📱 Offline mode - using localStorage for initial data');
    return createOfflineInitialData(userId);
  }

  try {
    // Verificar se já existem dados
    const existingFloors = await sql`
      SELECT id, name FROM floors WHERE user_id = ${userId} LIMIT 1
    `;

    if (existingFloors.length > 0) {
      console.log('ℹ️ Initial data already exists for user');
      console.log('🏢 Existing floors:', existingFloors.length);
      return true;
    }

    console.log('📝 Inserting initial data...');

    // Gerar IDs seguros para os floors
    const floor1Id = generateSafeId();
    const floor2Id = generateSafeId();
    const floor3Id = generateSafeId();

    // Inserir andares com IDs específicos
    await sql`
      INSERT INTO floors (id, name, description, user_id) 
      VALUES 
        (${floor1Id}, 'Térreo', 'Recepção e atendimento', ${userId}),
        (${floor2Id}, '1º Andar', 'Área administrativa', ${userId}),
        (${floor3Id}, '2º Andar', 'Setor de TI', ${userId})
    `;

    console.log('🏢 Floors created with IDs:', [floor1Id, floor2Id, floor3Id]);

    // Inserir salas para cada andar
    const roomsData = [
      // Térreo
      [generateSafeId(), 'Recepção', 'Área de atendimento ao cliente', floor1Id, userId],
      [generateSafeId(), 'Sala de Espera', 'Área de espera para clientes', floor1Id, userId],
      [generateSafeId(), 'Almoxarifado', 'Estoque de equipamentos', floor1Id, userId],
      // 1º Andar
      [generateSafeId(), 'Escritório Admin', 'Administração geral', floor2Id, userId],
      [generateSafeId(), 'Sala de Reuniões', 'Reuniões e apresentações', floor2Id, userId],
      [generateSafeId(), 'RH', 'Recursos Humanos', floor2Id, userId],
      // 2º Andar
      [generateSafeId(), 'Sala de TI', 'Departamento de Tecnologia', floor3Id, userId],
      [generateSafeId(), 'Lab de Testes', 'Testes de equipamentos', floor3Id, userId],
      [generateSafeId(), 'Suporte Técnico', 'Atendimento técnico', floor3Id, userId]
    ];

    // Inserir todas as salas
    for (const [roomId, name, description, floorId, userId] of roomsData) {
      await sql`
        INSERT INTO rooms (id, name, description, floor_id, user_id)
        VALUES (${roomId}, ${name}, ${description}, ${floorId}, ${userId})
      `;
    }

    console.log(`✅ Initial data inserted successfully!`);
    console.log(`📊 Summary: 3 floors, ${roomsData.length} rooms`);
    return true;
  } catch (error) {
    console.error('❌ Error inserting initial data:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      severity: error.severity
    });
    console.log('📱 Falling back to offline initial data...');
    return createOfflineInitialData(userId);
  }
};

// Função para criar dados offline (fallback)
const createOfflineInitialData = (userId) => {
  console.log('📱 === CREATING OFFLINE INITIAL DATA ===');
  
  try {
    const floorsKey = `floors_${userId}`;
    const existingFloors = JSON.parse(localStorage.getItem(floorsKey) || '[]');
    
    if (existingFloors.length > 0) {
      console.log('ℹ️ Offline data already exists');
      return true;
    }

    const floors = [
      {
        id: 1,
        name: 'Térreo',
        description: 'Recepção e atendimento',
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        rooms: [
          {
            id: 1,
            name: 'Recepção',
            description: 'Área de atendimento ao cliente',
            floor_id: 1,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 2,
            name: 'Sala de Espera',
            description: 'Área de espera para clientes',
            floor_id: 1,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 3,
            name: 'Almoxarifado',
            description: 'Estoque de equipamentos',
            floor_id: 1,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      },
      {
        id: 2,
        name: '1º Andar',
        description: 'Área administrativa',
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        rooms: [
          {
            id: 4,
            name: 'Escritório Admin',
            description: 'Administração geral',
            floor_id: 2,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 5,
            name: 'Sala de Reuniões',
            description: 'Reuniões e apresentações',
            floor_id: 2,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 6,
            name: 'RH',
            description: 'Recursos Humanos',
            floor_id: 2,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      },
      {
        id: 3,
        name: '2º Andar',
        description: 'Setor de TI',
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        rooms: [
          {
            id: 7,
            name: 'Sala de TI',
            description: 'Departamento de Tecnologia',
            floor_id: 3,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 8,
            name: 'Lab de Testes',
            description: 'Testes de equipamentos',
            floor_id: 3,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 9,
            name: 'Suporte Técnico',
            description: 'Atendimento técnico',
            floor_id: 3,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      }
    ];

    localStorage.setItem(floorsKey, JSON.stringify(floors));
    
    // Inicializar laptops vazios
    const laptopsKey = `laptops_${userId}`;
    localStorage.setItem(laptopsKey, JSON.stringify([]));

    console.log('✅ Offline initial data created successfully!');
    console.log('📊 Created:', floors.length, 'floors with', floors.reduce((sum, f) => sum + f.rooms.length, 0), 'rooms');
    return true;
  } catch (error) {
    console.error('❌ Error creating offline data:', error);
    return false;
  }
};

// Função para verificar se o banco está disponível
const isDatabaseAvailable = () => {
  const available = sql !== null && DATABASE_URL !== null;
  console.log('🔍 Database available:', available);
  return available;
};

// Função para obter informações de status
const getConnectionStatus = () => {
  const status = {
    hasUrl: !!DATABASE_URL,
    hasConnection: !!sql,
    mode: import.meta.env.MODE || 'unknown',
    urlSource: DATABASE_URL ? 'configured' : 'none',
    environment: import.meta.env.MODE,
    variables: {
      VITE_DATABASE_URL: !!import.meta.env.VITE_DATABASE_URL,
      NETLIFY_DATABASE_URL: !!import.meta.env.NETLIFY_DATABASE_URL,
      VITE_NEON_DATABASE_URL: !!import.meta.env.VITE_NEON_DATABASE_URL,
      DATABASE_URL: !!import.meta.env.DATABASE_URL,
      NEON_DATABASE_URL: !!import.meta.env.NEON_DATABASE_URL
    }
  };
  
  console.log('📊 Connection status:', status);
  return status;
};

// Log final de inicialização
console.log('🔄 === DATABASE MODULE INITIALIZED ===');
console.log('Database URL found:', !!DATABASE_URL);
console.log('SQL client created:', !!sql);
console.log('Ready for connections:', isDatabaseAvailable());
console.log('Connection status:', getConnectionStatus());
console.log('===========================================');

// Exportar tudo
export { 
  sql, 
  testConnection, 
  createTables, 
  insertInitialData, 
  isDatabaseAvailable, 
  getConnectionStatus 
};

// Exportação padrão para compatibilidade
export default {
  sql,
  testConnection,
  createTables,
  insertInitialData,
  isDatabaseAvailable,
  getConnectionStatus
};
