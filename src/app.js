// src/app.js
import express from 'express';
import prisma from './config/database.js';

import userRoutes from './routes/userRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import questionRoutes from './routes/questionRoutes.js';

const app = express();

// Middleware para receber JSON
app.use(express.json());

/**
 * Health check da API e do banco de dados.
 */
app.get('/health', async (req, res) => {
  let databaseStatus = 'OK';
  let databaseMessage =
    'Conexão com banco de dados funcionando';

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    databaseStatus = 'ERROR';
    databaseMessage =
      'Falha na conexão com banco de dados';

    console.error(
      'Erro na verificação do banco:',
      error
    );
  }

  const httpStatus =
    databaseStatus === 'OK' ? 200 : 503;

  return res.status(httpStatus).json({
    status:
      databaseStatus === 'OK'
        ? 'OK'
        : 'DEGRADED',

    message: 'API do Gerador de Provas',

    timestamp: new Date().toISOString(),

    version: '1.0.0',

    services: {
      api: 'OK',

      database: {
        status: databaseStatus,
        message: databaseMessage,
      },
    },
  });
});

// ==========================================
// ROTAS DA API
// ==========================================

// Usuários
app.use('/users', userRoutes);

// Matérias
app.use('/subjects', subjectRoutes);

// Questões
app.use('/questions', questionRoutes);

// ==========================================
// ROTA NÃO ENCONTRADA - 404
// ==========================================

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Rota ${req.method} ${req.originalUrl} não encontrada`,
  });
});

// Exportação
export default app;