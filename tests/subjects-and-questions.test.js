import {
  describe,
  it,
  expect,
  afterEach,
} from 'vitest';

import request from 'supertest';

import app from '../src/app.js';
import prisma from '../src/config/database.js';

const createdUserIds = [];
const createdSubjectIds = [];
const createdQuestionIds = [];

const uniqueEmail = () =>
  `teste-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)}@teste.com`;

const createTestUser = async (nome = 'Usuário de Teste') => {
  const user = await prisma.user.create({
    data: {
      nome,
      email: uniqueEmail(),
      papel: 'PROFESSOR',
    },
  });

  createdUserIds.push(user.id);

  return user;
};

const createTestSubject = async (professorId) => {
  const response = await request(app)
    .post('/subjects')
    .send({
      nome: 'Matéria de Teste',
      professorId,
    });

  expect(response.status).toBe(201);

  const subjectId = response.body.data.id;

  createdSubjectIds.push(subjectId);

  return response;
};

const createTestQuestion = async (
  subjectId,
  authorId
) => {
  const response = await request(app)
    .post('/questions')
    .send({
      enunciado: 'Questão de teste automatizado',
      dificuldade: 2,
      respostaCorreta: 'Resposta de teste',
      subjectId,
      authorId,
    });

  expect(response.status).toBe(201);

  const questionId = response.body.data.id;

  createdQuestionIds.push(questionId);

  return response;
};

afterEach(async () => {
  // Limpeza: questões → matérias → usuários

  if (createdQuestionIds.length > 0) {
    await prisma.question.deleteMany({
      where: {
        id: {
          in: createdQuestionIds,
        },
      },
    });
  }

  if (createdSubjectIds.length > 0) {
    await prisma.subject.deleteMany({
      where: {
        id: {
          in: createdSubjectIds,
        },
      },
    });
  }

  if (createdUserIds.length > 0) {
    await prisma.user.deleteMany({
      where: {
        id: {
          in: createdUserIds,
        },
      },
    });
  }

  createdQuestionIds.length = 0;
  createdSubjectIds.length = 0;
  createdUserIds.length = 0;
});

describe('Subjects', () => {
  it('deve criar uma matéria', async () => {
    const professor = await createTestUser();

    const response = await request(app)
      .post('/subjects')
      .send({
        nome: 'Banco de Dados',
        professorId: professor.id,
      });

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.nome).toBe(
      'Banco de Dados'
    );
    expect(response.body.data.professor.id).toBe(
      professor.id
    );

    createdSubjectIds.push(
      response.body.data.id
    );
  });

  it('deve listar matérias', async () => {
    const professor = await createTestUser();

    await createTestSubject(professor.id);

    const response = await request(app)
      .get('/subjects');

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(
      true
    );
    expect(response.body).toHaveProperty('total');
  });

  it('deve buscar uma matéria por ID', async () => {
    const professor = await createTestUser();

    const created = await createTestSubject(
      professor.id
    );

    const subjectId = created.body.data.id;

    const response = await request(app)
      .get(`/subjects/${subjectId}`);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(subjectId);
    expect(response.body.data.nome).toBe(
      'Matéria de Teste'
    );
  });

  it('deve atualizar parcialmente uma matéria', async () => {
    const professor = await createTestUser();

    const created = await createTestSubject(
      professor.id
    );

    const subjectId = created.body.data.id;

    const response = await request(app)
      .patch(`/subjects/${subjectId}`)
      .send({
        nome: 'Matéria Atualizada',
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.nome).toBe(
      'Matéria Atualizada'
    );
    expect(response.body.data.ativa).toBe(true);
  });

  it('deve preservar os campos não enviados no PATCH da matéria', async () => {
    const professor = await createTestUser();

    const created = await createTestSubject(
      professor.id
    );

    const subjectId = created.body.data.id;

    const response = await request(app)
      .patch(`/subjects/${subjectId}`)
      .send({
        nome: 'Somente Nome Alterado',
      });

    expect(response.status).toBe(200);

    expect(response.body.data.ativa).toBe(true);
    expect(response.body.data.professor.id).toBe(
      professor.id
    );
  });

  it('deve retornar 400 para ID inválido', async () => {
    const response = await request(app)
      .get('/subjects/abc');

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it('deve retornar 400 para PATCH sem campo permitido', async () => {
    const professor = await createTestUser();

    const created = await createTestSubject(
      professor.id
    );

    const subjectId = created.body.data.id;

    const response = await request(app)
      .patch(`/subjects/${subjectId}`)
      .send({
        campoInvalido: 'teste',
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it('deve retornar 404 para matéria inexistente', async () => {
    const response = await request(app)
      .get('/subjects/999999999');

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);
  });

  it('deve retornar 404 para professor inexistente', async () => {
    const response = await request(app)
      .post('/subjects')
      .send({
        nome: 'Matéria Teste',
        professorId: 999999999,
      });

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);
  });

  it('deve retornar 400 para corpo inválido', async () => {
    const response = await request(app)
      .post('/subjects')
      .send({
        nome: '',
        professorId: 1,
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it('deve retornar 409 ao excluir matéria com questão vinculada', async () => {
    const professor = await createTestUser();

    const subjectResponse =
      await createTestSubject(professor.id);

    const subjectId =
      subjectResponse.body.data.id;

    await createTestQuestion(
      subjectId,
      professor.id
    );

    const response = await request(app)
      .delete(`/subjects/${subjectId}`);

    expect(response.status).toBe(409);

    expect(response.body.success).toBe(false);

    // Confirma que a matéria continua existindo
    const confirmation = await request(app)
      .get(`/subjects/${subjectId}`);

    expect(confirmation.status).toBe(200);
  });

  it('deve excluir uma matéria sem questões', async () => {
    const professor = await createTestUser();

    const created = await createTestSubject(
      professor.id
    );

    const subjectId = created.body.data.id;

    const response = await request(app)
      .delete(`/subjects/${subjectId}`);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    // Evita tentar excluir novamente no afterEach
    const index =
      createdSubjectIds.indexOf(subjectId);

    if (index !== -1) {
      createdSubjectIds.splice(index, 1);
    }

    const confirmation = await request(app)
      .get(`/subjects/${subjectId}`);

    expect(confirmation.status).toBe(404);
  });
});

describe('Questions', () => {
  it('deve criar uma questão', async () => {
    const professor = await createTestUser();

    const subjectResponse =
      await createTestSubject(professor.id);

    const subjectId =
      subjectResponse.body.data.id;

    const response = await request(app)
      .post('/questions')
      .send({
        enunciado: 'O que é uma API?',
        dificuldade: 1,
        respostaCorreta:
          'Uma interface para comunicação entre sistemas.',
        subjectId,
        authorId: professor.id,
      });

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.enunciado).toBe(
      'O que é uma API?'
    );
    expect(response.body.data.dificuldade).toBe(1);

    createdQuestionIds.push(
      response.body.data.id
    );
  });

  it('deve listar questões', async () => {
    const professor = await createTestUser();

    const subjectResponse =
      await createTestSubject(professor.id);

    await createTestQuestion(
      subjectResponse.body.data.id,
      professor.id
    );

    const response = await request(app)
      .get('/questions');

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(
      true
    );
    expect(response.body).toHaveProperty('total');
  });

  it('deve buscar uma questão por ID', async () => {
    const professor = await createTestUser();

    const subjectResponse =
      await createTestSubject(professor.id);

    const questionResponse =
      await createTestQuestion(
        subjectResponse.body.data.id,
        professor.id
      );

    const questionId =
      questionResponse.body.data.id;

    const response = await request(app)
      .get(`/questions/${questionId}`);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(
      questionId
    );
  });

  it('deve atualizar parcialmente uma questão', async () => {
    const professor = await createTestUser();

    const subjectResponse =
      await createTestSubject(professor.id);

    const questionResponse =
      await createTestQuestion(
        subjectResponse.body.data.id,
        professor.id
      );

    const questionId =
      questionResponse.body.data.id;

    const response = await request(app)
      .patch(`/questions/${questionId}`)
      .send({
        dificuldade: 3,
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.dificuldade).toBe(
      3
    );
    expect(response.body.data.enunciado).toBe(
      'Questão de teste automatizado'
    );
  });

  it('deve preservar campos não enviados no PATCH da questão', async () => {
    const professor = await createTestUser();

    const subjectResponse =
      await createTestSubject(professor.id);

    const questionResponse =
      await createTestQuestion(
        subjectResponse.body.data.id,
        professor.id
      );

    const questionId =
      questionResponse.body.data.id;

    const response = await request(app)
      .patch(`/questions/${questionId}`)
      .send({
        ativa: false,
      });

    expect(response.status).toBe(200);

    expect(response.body.data.ativa).toBe(false);
    expect(response.body.data.dificuldade).toBe(2);
    expect(response.body.data.enunciado).toBe(
      'Questão de teste automatizado'
    );
  });

  it('deve retornar 400 para ID inválido', async () => {
    const response = await request(app)
      .get('/questions/abc');

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it('deve retornar 400 para dificuldade inválida', async () => {
    const professor = await createTestUser();

    const subjectResponse =
      await createTestSubject(professor.id);

    const questionResponse =
      await createTestQuestion(
        subjectResponse.body.data.id,
        professor.id
      );

    const questionId =
      questionResponse.body.data.id;

    const response = await request(app)
      .patch(`/questions/${questionId}`)
      .send({
        dificuldade: 5,
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it('deve retornar 400 para ativa que não seja boolean', async () => {
    const professor = await createTestUser();

    const subjectResponse =
      await createTestSubject(professor.id);

    const questionResponse =
      await createTestQuestion(
        subjectResponse.body.data.id,
        professor.id
      );

    const questionId =
      questionResponse.body.data.id;

    const response = await request(app)
      .patch(`/questions/${questionId}`)
      .send({
        ativa: 'true',
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it('deve retornar 404 para matéria inexistente', async () => {
    const professor = await createTestUser();

    const response = await request(app)
      .post('/questions')
      .send({
        enunciado: 'Questão inválida',
        dificuldade: 1,
        respostaCorreta: 'Teste',
        subjectId: 999999999,
        authorId: professor.id,
      });

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);
  });

  it('deve retornar 404 para autor inexistente', async () => {
    const professor = await createTestUser();

    const subjectResponse =
      await createTestSubject(professor.id);

    const response = await request(app)
      .post('/questions')
      .send({
        enunciado: 'Questão inválida',
        dificuldade: 1,
        respostaCorreta: 'Teste',
        subjectId:
          subjectResponse.body.data.id,
        authorId: 999999999,
      });

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);
  });

  it('deve retornar 404 para questão inexistente', async () => {
    const response = await request(app)
      .get('/questions/999999999');

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);
  });

  it('deve retornar 400 para corpo inválido', async () => {
    const professor = await createTestUser();

    const subjectResponse =
      await createTestSubject(professor.id);

    const response = await request(app)
      .post('/questions')
      .send({
        enunciado: '',
        dificuldade: 1,
        subjectId:
          subjectResponse.body.data.id,
        authorId: professor.id,
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it('deve excluir uma questão', async () => {
    const professor = await createTestUser();

    const subjectResponse =
      await createTestSubject(professor.id);

    const questionResponse =
      await createTestQuestion(
        subjectResponse.body.data.id,
        professor.id
      );

    const questionId =
      questionResponse.body.data.id;

    const response = await request(app)
      .delete(`/questions/${questionId}`);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    const questionIndex =
      createdQuestionIds.indexOf(questionId);

    if (questionIndex !== -1) {
      createdQuestionIds.splice(
        questionIndex,
        1
      );
    }

    const confirmation = await request(app)
      .get(`/questions/${questionId}`);

    expect(confirmation.status).toBe(404);
  });
});