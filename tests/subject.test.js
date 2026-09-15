import request from 'supertest';
import app from '../src/app.js';
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
} from 'vitest';
import prisma from '../src/config/database.js';

describe('Suíte de Testes para /subjects', () => {
  let teacherId;
  let subjectId;

  // Prepara o banco antes de rodar os testes
  beforeAll(async () => {
    // Cria um professor para associar às matérias
    const teacher = await prisma.user.create({
      data: {
        nome: 'Professor Teste',
        email: `prof_${Date.now()}@test.com`,
        senha: 'password123',
      },
    });
    teacherId = teacher.id;
  });

  beforeEach(async () => {
    // Cria uma matéria base para testar PATCH e DELETE
    const subject = await prisma.subject.create({
      data: {
        nome: 'Matéria Inicial',
        ativa: true,
        professorId: teacherId,
      },
    });
    subjectId = subject.id;
  });

  afterEach(async () => {
    // Limpa os registros criados durante os testes
    await prisma.question.deleteMany();
    await prisma.subject.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  // ==========================================
  // TESTES DE ATUALIZAÇÃO (PATCH /subjects/:id)
  // ==========================================
  describe('PATCH /subjects/:id', () => {
    it('deve atualizar a matéria com sucesso (status 200)', async () => {
      const response = await request(app)
        .patch(`/subjects/${subjectId}`)
        .send({ nome: 'Matéria Atualizada', ativa: false });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.nome).toBe('Matéria Atualizada');
      expect(response.body.data.ativa).toBe(false);
    });

    it('deve retornar 400 se o ID não for um inteiro positivo', async () => {
      const response = await request(app)
        .patch('/subjects/abc')
        .send({ nome: 'Novo Nome' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar 400 se o corpo do PATCH for vazio', async () => {
      const response = await request(app)
        .patch(`/subjects/${subjectId}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar 400 se o nome for uma string vazia', async () => {
      const response = await request(app)
        .patch(`/subjects/${subjectId}`)
        .send({ nome: '   ' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar 400 se o campo ativa não for booleano', async () => {
      const response = await request(app)
        .patch(`/subjects/${subjectId}`)
        .send({ ativa: 'true' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar 404 se tentar associar a um professor que não existe', async () => {
      const response = await request(app)
        .patch(`/subjects/${subjectId}`)
        .send({ professorId: 999999 });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================
  // TESTES DE EXCLUSÃO (DELETE /subjects/:id)
  // ==========================================
  describe('DELETE /subjects/:id', () => {
    it('deve remover matéria sem questões vinculadas (status 200)', async () => {
      const response = await request(app).delete(`/subjects/${subjectId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('deve retornar 400 se o ID for inválido', async () => {
      const response = await request(app).delete('/subjects/abc');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar 404 se a matéria não existir', async () => {
      const response = await request(app).delete('/subjects/999999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar 409 ao tentar excluir matéria com questões vinculadas', async () => {
      // Vincula uma questão à matéria
      await prisma.question.create({
        data: {
          enunciado: 'Qual a resposta?',
          materiaId: subjectId,
        },
      });

      const response = await request(app).delete(`/subjects/${subjectId}`);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Matéria possui questões vinculadas.');
    });
  });
});