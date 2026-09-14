//src/app.js
    import express from "express";
    import prisma from "./config/database.js";
    
    const app = express();
    
    app.use(express.json());
    
    /**
     * Verifica se a API consegue executar uma consulta simples no banco de dados.
     * @param {Object} req - Requisição Express recebida na rota de saúde.
     * @param {Object} res - Resposta Express que informa a disponibilidade dos serviços.
     * @returns {Promise<void>} Envia `200` quando o banco responde ou `503` quando há falha.
     */
    app.get("/health", async (req, res) => {
      try {
        await prisma.$queryRaw`SELECT 1`;
    
        res.status(200).json({
          status: "OK",
          message: "API do Gerador de Provas",
          timestamp: new Date().toISOString(),
          services: {
            api: "OK",
            database: { status: "OK" },
          },
        });
      } catch (error) {
        console.error("Erro na verificação do banco:", error);
    
        res.status(503).json({
          status: "DEGRADED",
          message: "API do Gerador de Provas",
          services: {
            api: "OK",
            database: { status: "ERROR" },
          },
        });
      }
    });
    
    /**
     * Busca todos os usuários e devolve somente os campos públicos.
     * @param {Object} req - Requisição Express recebida na rota de usuários.
     * @param {Object} res - Resposta Express usada para enviar a lista e o total.
     * @returns {Promise<void>} Envia `200` com os usuários ou `500` em caso de falha.
     */
    app.get("/users", async (req, res) => {
      try {
        const usuarios = await prisma.user.findMany({
          select: {
            id: true,
            nome: true,
            email: true,
            papel: true,
            foto: true,
            createdAt: true,
          },
          orderBy: { id: "asc" },
        });
    
        res.status(200).json({
          success: true,
          data: usuarios,
          total: usuarios.length,
        });
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
    
        res.status(500).json({
          success: false,
          message: "Erro ao buscar usuários",
        });
      }
    });
    
    /**
     * Responde requisições que não correspondem a nenhuma rota registrada.
     * @param {Object} req - Requisição Express com método e URL solicitados.
     * @param {Object} res - Resposta Express usada para devolver o erro `404`.
     * @returns {void} Envia uma mensagem JSON indicando a rota não encontrada.
     */
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: "Rota " + req.method + " " + req.originalUrl + " não encontrada",
      });
    });
    
    export default app;