// src/config/database.js
import { neon } from '@neondatabase/serverless';

// Configuração do banco de dados Neon
const DATABASE_URL = import.meta.env.VITE_DATABASE_URL;

// Verificar se a URL do banco está disponível
if (!DATABASE_URL) {
  console.warn('⚠️ VITE_DATABASE_URL não encontrada, funcionando em modo offline');
}

// Inicializar conexão apenas se houver URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

// Função para testar a conexão
const testConnection = async () => {
  if (!sql) {
    console.log('📱 Modo offline - usando localStorage');
    return false;
  }

  try {
    console.log('🔄 Testando conexão com o banco de dados...');
    
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
    console.log('📱 Continuando em modo offline...');
    return false;
  }
};

// Função para criar as tabelas necessárias
const createTables = async () => {
  if (!sql) {
    console.log('📱 Modo offline - tabelas não são necessárias');
    return false;
  }

  try {
    console.log('🔄 Iniciando criação de tabelas...');
    
    // Criar tabela de usuários
    console.log('📝 Criando tabela users...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Criar tabela de andares
    console.log('📝 Criando tabela floors...');
    await sql`
      CREATE TABLE IF NOT EXISTS floors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Criar tabela de salas
    console.log('📝 Criando tabela rooms...');
    await sql`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        floor_id INTEGER REFERENCES floors(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Criar tabela de laptops
    console.log('📝 Criando tabela laptops...');
    await sql`
      CREATE TABLE IF NOT EXISTS laptops (
        id SERIAL PRIMARY KEY,
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
        floor_id INTEGER REFERENCES floors(id) ON DELETE SET NULL,
        room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
        photo TEXT,
        damage_analysis JSONB,
        purchase_date DATE,
        purchase_price DECIMAL(10,2),
        assigned_user VARCHAR(255),
        notes TEXT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(serial_number, user_id)
      )
    `;

    // Criar índices para melhor performance
    console.log('📝 Criando índices...');
    await sql`CREATE INDEX IF NOT EXISTS idx_laptops_user_id ON laptops(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_laptops_serial ON laptops(serial_number)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_laptops_status ON laptops(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_floors_user_id ON floors(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_rooms_user_id ON rooms(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_rooms_floor_id ON rooms(floor_id)`;

    console.log('✅ Tabelas criadas com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    return false;
  }
};

// Função para inserir dados iniciais
const insertInitialData = async (userId) => {
  if (!sql) {
    console.log('📱 Modo offline - dados iniciais gerenciados pelo localStorage');
    return false;
  }

  try {
    console.log('🔄 Verificando dados iniciais para usuário:', userId);
    
    // Verificar se já existem dados para este usuário
    const existingFloors = await sql`
      SELECT id FROM floors WHERE user_id = ${userId}
    `;

    if (existingFloors.length > 0) {
      console.log('ℹ️ Dados iniciais já existem para este usuário');
      return true;
    }

    console.log('📝 Inserindo dados iniciais...');

    // Inserir andares padrão
    const floor1 = await sql`
      INSERT INTO floors (name, description, user_id)
      VALUES ('Térreo', 'Recepção e atendimento', ${userId})
      RETURNING id
    `;

    const floor2 = await sql`
      INSERT INTO floors (name, description, user_id)
      VALUES ('1º Andar', 'Área administrativa', ${userId})
      RETURNING id
    `;

    // Inserir salas padrão
    await sql`
      INSERT INTO rooms (name, description, floor_id, user_id)
      VALUES 
        ('Recepção', 'Área de atendimento ao cliente', ${floor1[0].id}, ${userId}),
        ('Sala de Suporte', 'Suporte técnico', ${floor1[0].id}, ${userId}),
        ('Escritório Admin', 'Administração', ${floor2[0].id}, ${userId}),
        ('Sala de TI', 'Departamento de TI', ${floor2[0].id}, ${userId})
    `;

    console.log('✅ Dados iniciais inseridos com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inserir dados iniciais:', error);
    return false;
  }
};

// Função para verificar se o banco está disponível
const isDatabaseAvailable = () => {
  return sql !== null;
};

// Exportar tudo usando named exports
export { sql, testConnection, createTables, insertInitialData, isDatabaseAvailable };

// Exportação padrão para compatibilidade
export default {
  sql,
  testConnection,
  createTables,
  insertInitialData,
  isDatabaseAvailable
};
