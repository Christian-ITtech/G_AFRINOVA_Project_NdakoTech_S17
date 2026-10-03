import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
// import routes from './routes/index.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

// __dirname n'existe pas en modules ES : on le recrée
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Images locales : server/public/images -> http://localhost:5000/images/...
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
