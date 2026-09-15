import prisma from '../config/database.js';

class SubjectServiceError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// CREATE
export const createSubject = async ({ nome, professorId }) => {
  const professorExists = await prisma.user.findUnique({
    where: {
      id: professorId
    }
  });

  if (!professorExists) {
    throw new SubjectServiceError(
      'Professor informado não existe.',
      404
    );
  }

  return prisma.subject.create({
    data: {
      nome,
      professorId
    },
    select: {
      id: true,
      nome: true,
      ativa: true,
      createdAt: true,
      professor: {
        select: {
          id: true,
          nome: true,
          email: true
        }
      }
    }
  });
};

// GET ALL
export const getSubjects = async () => {
  return prisma.subject.findMany({
    select: {
      id: true,
      nome: true,
      ativa: true,
      createdAt: true,
      professor: {
        select: {
          id: true,
          nome: true,
          email: true
        }
      }
    }
  });
};

// GET BY ID
export const getSubjectById = async (id) => {
  return prisma.subject.findUnique({
    where: {
      id
    },
    select: {
      id: true,
      nome: true,
      ativa: true,
      createdAt: true,
      professor: {
        select: {
          id: true,
          nome: true,
          email: true
        }
      }
    }
  });
};

// UPDATE
export const updateSubject = async (id, data) => {
  const existingSubject = await prisma.subject.findUnique({
    where: {
      id
    }
  });

  if (!existingSubject) {
    throw new SubjectServiceError(
      'Matéria não encontrada.',
      404
    );
  }

  if (data.professorId !== undefined) {
    const professorExists = await prisma.user.findUnique({
      where: {
        id: data.professorId
      }
    });

    if (!professorExists) {
      throw new SubjectServiceError(
        'Professor informado não existe.',
        404
      );
    }
  }

  return prisma.subject.update({
    where: {
      id
    },
    data,
    select: {
      id: true,
      nome: true,
      ativa: true,
      createdAt: true,
      professor: {
        select: {
          id: true,
          nome: true,
          email: true
        }
      }
    }
  });
};

// DELETE
export const deleteSubject = async (id) => {
  const subject = await prisma.subject.findUnique({
    where: {
      id
    }
  });

  if (!subject) {
    throw new SubjectServiceError(
      'Matéria não encontrada.',
      404
    );
  }

  // Verifica se existem questões vinculadas.
  const questionsCount = await prisma.question.count({
    where: {
      subjectId: id
    }
  });

  if (questionsCount > 0) {
    throw new SubjectServiceError(
      'Não é possível excluir uma matéria que possui questões vinculadas.',
      409
    );
  }

  await prisma.subject.delete({
    where: {
      id
    }
  });

  return true;
};

export { SubjectServiceError };