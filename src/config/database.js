import { neon } from '@neondatabase/serverless';

// Configuração do banco de dados Neon
const DATABASE_URL = import.meta.env.VITE_DATABASE_URL || 'postgresql://neondb_owner:npg_AmSW1I0hOzHD@ep-plain-credit-aeb3lbiz-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

// Inicializar conexão
const sql = neon(DATABASE_URL);

// Função para testar a conexão
const testConnection = async () => {
  try {
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
    return false;
  }
};

// Função para criar as tabelas necessárias
const createTables = async () => {
  try {
    // Criar tabela de usuários
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
    throw error;
  }
};

// Função para inserir dados iniciais
const insertInitialData = async (userId) => {
  try {
    // Verificar se já existem dados para este usuário
    const existingFloors = await sql`
      SELECT id FROM floors WHERE user_id = ${userId}
    `;

    if (existingFloors.length > 0) {
      console.log('Dados iniciais já existem para este usuário');
      return;
    }

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
  } catch (error) {
    console.error('❌ Erro ao inserir dados iniciais:', error);
    throw error;
  }
};

// Exportar tudo usando named exports
export { sql, testConnection, createTables, insertInitialData };

// Exportação padrão para compatibilidade
export default {
  sql,
  testConnection,
  createTables,
  insertInitialData
};
