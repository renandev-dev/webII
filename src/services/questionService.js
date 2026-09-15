import prisma from '../config/database.js';

class QuestionServiceError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
};

// CREATE
export const createQuestion = async ({
  enunciado,
  dificuldade,
  respostaCorreta,
  subjectId,
  authorId
}) => {
  const [subjectExists, authorExists] = await Promise.all([
    prisma.subject.findUnique({
      where: {
        id: subjectId
      }
    }),
    prisma.user.findUnique({
      where: {
        id: authorId
      }
    })
  ]);

  if (!subjectExists) {
    throw new QuestionServiceError(
      'Matéria informada não existe.',
      404
    );
  }

  if (!authorExists) {
    throw new QuestionServiceError(
      'Autor informado não existe.',
      404
    );
  }

  return prisma.question.create({
    data: {
      enunciado,
      dificuldade,
      respostaCorreta,
      subjectId,
      authorId
    },
    select: {
      id: true,
      enunciado: true,
      dificuldade: true,
      respostaCorreta: true,
      ativa: true,
      createdAt: true,
      subject: {
        select: {
          id: true,
          nome: true
        }
      },
      author: {
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
export const getQuestions = async () => {
  return prisma.question.findMany({
    select: {
      id: true,
      enunciado: true,
      dificuldade: true,
      respostaCorreta: true,
      ativa: true,
      createdAt: true,
      subject: {
        select: {
          id: true,
          nome: true
        }
      },
      author: {
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
export const getQuestionById = async (id) => {
  return prisma.question.findUnique({
    where: {
      id
    },
    select: {
      id: true,
      enunciado: true,
      dificuldade: true,
      respostaCorreta: true,
      ativa: true,
      createdAt: true,
      subject: {
        select: {
          id: true,
          nome: true
        }
      },
      author: {
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
export const updateQuestion = async (id, data) => {
  const existingQuestion = await prisma.question.findUnique({
    where: {
      id
    }
  });

  if (!existingQuestion) {
    throw new QuestionServiceError(
      'Questão não encontrada.',
      404
    );
  }

  // Verifica se a matéria informada existe
  if (data.subjectId !== undefined) {
    const subjectExists = await prisma.subject.findUnique({
      where: {
        id: data.subjectId
      }
    });

    if (!subjectExists) {
      throw new QuestionServiceError(
        'Matéria informada não existe.',
        404
      );
    }
  }

  // Verifica se o autor informado existe
  if (data.authorId !== undefined) {
    const authorExists = await prisma.user.findUnique({
      where: {
        id: data.authorId
      }
    });

    if (!authorExists) {
      throw new QuestionServiceError(
        'Autor informado não existe.',
        404
      );
    }
  }

  return prisma.question.update({
    where: {
      id
    },
    data,
    select: {
      id: true,
      enunciado: true,
      dificuldade: true,
      respostaCorreta: true,
      ativa: true,
      createdAt: true,
      subject: {
        select: {
          id: true,
          nome: true
        }
      },
      author: {
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
export const deleteQuestion = async (id) => {
  const question = await prisma.question.findUnique({
    where: {
      id
    }
  });

  if (!question) {
    throw new QuestionServiceError(
      'Questão não encontrada.',
      404
    );
  }

  await prisma.question.delete({
    where: {
      id
    }
  });

  return true;
};

export { QuestionServiceError };