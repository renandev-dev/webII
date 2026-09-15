import request from 'supertest';
import { describe, it, expect, afterAll } from 'vitest'; // ou 'jest'
import app from '../src/app.js';
import prisma from '../src/config/database.js';

describe('Suíte de Testes da API (Subjects & Questions)', () => {
  let createdProfessorId;
  let createdSubjectId;
  let createdQuestionId;

  // Limpeza final do banco na ordem estrita: Questões -> Matérias -> Usuários
  afterAll(async () => {
    await prisma.question.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  // --- PREPARAÇÃO DADOS BASE ---
  it('Deve criar um usuário/professor base para os testes', async () => {
    const res = await request(app)
      .post('/users')
      .send({ nome: 'Professor Teste', email: `prof_${Date.now()}@teste.com` });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    createdProfessorId = res.body.data.id;
  });

  // --- SUBJECTS ---
  describe('Endpoints /subjects', () => {
    it('Deve criar uma matéria', async () => {
      const res = await request(app)
        .post('/subjects')
        .send({ nome: 'Matemática', professorId: createdProfessorId });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      createdSubjectId = res.body.data.id;
    });

    it('Deve listar matérias', async () => {
      const res = await request(app).get('/subjects');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('Deve buscar matéria por ID', async () => {
      const res = await request(app).get(`/subjects/${createdSubjectId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdSubjectId);
    });

    it('Deve atualizar parcialmente a matéria preservando campos não enviados', async () => {
      const res = await request(app)
        .patch(`/subjects/${createdSubjectId}`)
        .send({ ativa: false });

      expect(res.status).toBe(200);
      expect(res.body.data.nome).toBe('Matemática'); // Preservado
      expect(res.body.data.ativa).toBe(false);      // Atualizado
    });

    it('Deve retornar 400 para ID inválido ou corpo de PATCH vazio', async () => {
      const resId = await request(app).patch('/subjects/abc').send({ nome: 'Nova' });
      expect(resId.status).toBe(400);

      const resBody = await request(app).patch(`/subjects/${createdSubjectId}`).send({});
      expect(resBody.status).toBe(400);
    });

    it('Deve retornar 404 para professor inexistente', async () => {
      const res = await request(app)
        .post('/subjects')
        .send({ nome: 'Física', professorId: 999999 });

      expect(res.status).toBe(404);
    });
  });

  // --- QUESTIONS ---
  describe('Endpoints /questions', () => {
    it('Deve criar uma questão', async () => {
      const res = await request(app)
        .post('/questions')
        .send({
          enunciado: 'Quanto é 2 + 2?',
          respostaCorreta: '4',
          dificuldade: 1,
          subjectId: createdSubjectId,
          authorId: createdProfessorId,
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      createdQuestionId = res.body.data.id;
    });

    it('Deve listar questões e buscar por ID', async () => {
      const resList = await request(app).get('/questions');
      expect(resList.status).toBe(200);

      const resGet = await request(app).get(`/questions/${createdQuestionId}`);
      expect(resGet.status).toBe(200);
      expect(resGet.body.data.id).toBe(createdQuestionId);
    });

    it('Deve atualizar parcialmente mantendo os outros campos', async () => {
      const res = await request(app)
        .patch(`/questions/${createdQuestionId}`)
        .send({ dificuldade: 3 });

      expect(res.status).toBe(200);
      expect(res.body.data.enunciado).toBe('Quanto é 2 + 2?');
      expect(res.body.data.dificuldade).toBe(3);
    });

    it('Deve retornar 409 ao tentar excluir matéria com questão vinculada', async () => {
      const res = await request(app).delete(`/subjects/${createdSubjectId}`);
      expect(res.status).toBe(409);
    });

    it('Deve excluir a questão e confirmar exclusão com 404', async () => {
      const resDelete = await request(app).delete(`/questions/${createdQuestionId}`);
      expect(resDelete.status).toBe(200);

      const resGet = await request(app).get(`/questions/${createdQuestionId}`);
      expect(resGet.status).toBe(404);
    });

    it('Deve excluir a matéria com sucesso após remover as questões vinculadas', async () => {
      const resDelete = await request(app).delete(`/subjects/${createdSubjectId}`);
      expect(resDelete.status).toBe(200);

      const resGet = await request(app).get(`/subjects/${createdSubjectId}`);
      expect(resGet.status).toBe(404);
    });
  });
});