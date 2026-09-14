import 'dotenv/config';
import app from './app.js';
import prisma from './config/database.js';

const PORT = Number(process.env.PORT) || 3000;

// Inicia o servidor HTTP e exibe no terminal os endereços úteis para desenvolvimento.
const server = app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT);
  console.log('Health check: http://localhost:' + PORT + '/health');
  console.log('Usuários: http://localhost:' + PORT + '/users');
});

/**
 * Encerra o servidor HTTP e fecha a conexão do Prisma após receber um sinal do sistema.
 * @param {string} signal - Sinal recebido, como `SIGINT` ou `SIGTERM`.
 * @returns {Promise<void>} Finaliza o processo depois de liberar os recursos do banco.
 */
async function shutdown(signal) {
  console.log('Recebido ' + signal + '. Encerrando...');

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
