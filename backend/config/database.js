import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { resolve } from "path";

if (!process.env.MYSQL_DATABASE) {
  dotenv.config({ path: resolve(process.cwd(), '../.env') });
}

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    dialect: 'mysql',
    logging: false,
  }
);

// Función asíncrona para probar conexión y crear las tablas
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    // Esta línea crea automáticamente las tablas en Clever Cloud si no existen
    await sequelize.sync(); 
    console.log('Conexión a MySQL establecida y tablas sincronizadas.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
};

export { testConnection, sequelize };