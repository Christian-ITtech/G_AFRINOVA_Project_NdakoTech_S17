// dotenv doit rester le PREMIER import : il charge le .env avant que
// app.js et database.js ne lisent process.env
import 'dotenv/config';

import app from './app.js';
import pool from './config/database.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);

  // Test de la connexion à la base au démarrage
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Connexion à la base de données réussie', res.rows[0]);
  } catch (err) {
    console.error('Erreur de connexion à la base de données :', err.message);
  }
});