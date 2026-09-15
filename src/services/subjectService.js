import prisma from '../config/database.js';

const includeProfessor = {
  professor: {
    select: { id: true, nome: true, email: true },
  },
};

export const createSubjectService = async ({ nome, professorId, ativa }) => {
  const numericProfessorId = Number(professorId);

  const professorExists = await prisma.user.findUnique({
    where: { id: numericProfessorId },
  });

  if (!professorExists) {
    const error = new Error('Professor informado não existe.');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.subject.create({
    data: {
      nome,
      professorId: numericProfessorId,
      ativa: ativa ?? true,
    },
    include: includeProfessor,
  });
};

export const getSubjectsService = async () => {
  return await prisma.subject.findMany({
    include: includeProfessor,
  });
};

export const getSubjectByIdService = async id => {
  const numericId = Number(id);

  return await prisma.subject.findUnique({
    where: { id: numericId },
    include: includeProfessor,
  });
};

export const updateSubjectService = async (
  id,
  { nome, ativa, professorId },
) => {
  const numericId = Number(id);

  const subjectExists = await prisma.subject.findUnique({
    where: { id: numericId },
  });

  if (!subjectExists) {
    const error = new Error('Matéria não encontrada.');
    error.statusCode = 404;
    throw error;
  }

  if (professorId !== undefined) {
    const numericProfessorId = Number(professorId);
    const professorExists = await prisma.user.findUnique({
      where: { id: numericProfessorId },
    });

    if (!professorExists) {
      const error = new Error('Professor informado não existe.');
      error.statusCode = 404;
      throw error;
    }
  }

  const updateData = {};
  if (nome !== undefined) updateData.nome = nome;
  if (ativa !== undefined) updateData.ativa = ativa;
  if (professorId !== undefined) updateData.professorId = Number(professorId);

  return await prisma.subject.update({
    where: { id: numericId },
    data: updateData,
    include: includeProfessor,
  });
};

export const deleteSubjectService = async id => {
  const numericId = Number(id);

  const subjectExists = await prisma.subject.findUnique({
    where: { id: numericId },
    include: { questions: true },
  });

  if (!subjectExists) {
    const error = new Error('Matéria não encontrada.');
    error.statusCode = 404;
    throw error;
  }

  if (subjectExists.questions && subjectExists.questions.length > 0) {
    const error = new Error('Matéria possui questões vinculadas.');
    error.statusCode = 409;
    throw error;
  }

  return await prisma.subject.delete({
    where: { id: numericId },
    include: includeProfessor,
  });
};
