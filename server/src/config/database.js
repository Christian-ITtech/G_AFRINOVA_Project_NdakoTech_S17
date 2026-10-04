import pg from 'pg';

const { Pool } = pg;

// Accepte soit DATABASE_URL, soit les variables séparées DB_*
const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      }
);

pool.on('error', (err) => {
  console.error('Erreur inattendue du pool PostgreSQL :', err.message);
});

export default pool;
