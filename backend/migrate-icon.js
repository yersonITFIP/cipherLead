const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'diario'
  });

  try {
    console.log('Conectando a la base de datos...');
    
    // Check if icon column exists
    const [columns] = await connection.execute(
      `SHOW COLUMNS FROM subjects LIKE 'icon'`
    );

    if (columns.length === 0) {
      console.log('Agregando columna icon a la tabla subjects...');
      await connection.execute(
        `ALTER TABLE subjects 
         ADD COLUMN icon VARCHAR(50) NOT NULL DEFAULT 'Book' AFTER description_encrypted`
      );
      console.log('✓ Columna icon agregada exitosamente');
    } else {
      console.log('✓ La columna icon ya existe en la tabla subjects');
    }

    console.log('Normalizando iconos vacios o nulos...');
    await connection.execute(
      `UPDATE subjects
       SET icon = 'Book'
       WHERE icon IS NULL OR TRIM(icon) = ''`
    );

    console.log('\n✓ Migración completada exitosamente');
  } catch (error) {
    console.error('Error durante la migración:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrateDatabase();
