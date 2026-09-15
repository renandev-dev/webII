import prisma from '../config/database.js';

// Objeto reutilizável para incluir os relacionamentos
const includeRelations = {
  subject: true,
  author: {
    select: { id: true, nome: true, email: true },
  },
};

export const createQuestionService = async data => {
  const { enunciado, respostaCorreta, dificuldade, subjectId, authorId } = data;

  const [subject, author] = await Promise.all([
    prisma.subject.findUnique({ where: { id: subjectId } }),
    prisma.user.findUnique({ where: { id: authorId } }),
  ]);

  if (!subject || !author) {
    const error = new Error('Matéria ou autor não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.question.create({
    data: {
      enunciado,
      respostaCorreta: respostaCorreta ?? null,
      dificuldade,
      subjectId,
      authorId,
    },
    include: includeRelations,
  });
};

export const getQuestionsService = async () => {
  return await prisma.question.findMany({
    include: includeRelations,
  });
};

export const getQuestionByIdService = async id => {
  return await prisma.question.findUnique({
    where: { id: Number(id) },
    include: includeRelations,
  });
};

export const updateQuestionService = async (id, data) => {
  const numericId = Number(id);

  const existingQuestion = await prisma.question.findUnique({
    where: { id: numericId },
  });
  if (!existingQuestion) {
    const error = new Error('Questão não encontrada.');
    error.statusCode = 404;
    throw error;
  }

  if (data.subjectId !== undefined) {
    const subject = await prisma.subject.findUnique({
      where: { id: Number(data.subjectId) },
    });
    if (!subject) {
      const error = new Error('Matéria não encontrada.');
      error.statusCode = 404;
      throw error;
    }
  }

  if (data.authorId !== undefined) {
    const author = await prisma.user.findUnique({
      where: { id: Number(data.authorId) },
    });
    if (!author) {
      const error = new Error('Autor não encontrado.');
      error.statusCode = 404;
      throw error;
    }
  }

  return await prisma.question.update({
    where: { id: numericId },
    data,
    include: includeRelations,
  });
};

export const deleteQuestionService = async id => {
  const numericId = Number(id);

  const existingQuestion = await prisma.question.findUnique({
    where: { id: numericId },
  });
  if (!existingQuestion) {
    const error = new Error('Questão não encontrada.');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.question.delete({
    where: { id: numericId },
    include: includeRelations,
  });
};
