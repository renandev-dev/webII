import prisma from '../config/database.js';

export const createQuestion = async (req, res) => {
  try {
    const { enunciado, dificuldade, respostaCorreta, subjectId, authorId } = req.body;

    // 1. Validação de campos obrigatórios
    if (!enunciado || dificuldade === undefined || subjectId === undefined || authorId === undefined) {
      return res.status(400).json({ success: false, message: 'Enunciado, dificuldade, subjectId e authorId são obrigatórios.' });
    }

    // 2. Validação de IDs e valores inteiros
    const parsedSubjectId = Number(subjectId);
    const parsedAuthorId = Number(authorId);
    const parsedDificuldade = Number(dificuldade);

    if (!Number.isInteger(parsedSubjectId) || parsedSubjectId <= 0) {
      return res.status(400).json({ success: false, message: 'O subjectId deve ser um número inteiro positivo.' });
    }

    if (!Number.isInteger(parsedAuthorId) || parsedAuthorId <= 0) {
      return res.status(400).json({ success: false, message: 'O authorId deve ser um número inteiro positivo.' });
    }

    if (![1, 2, 3].includes(parsedDificuldade)) {
      return res.status(400).json({ success: false, message: 'A dificuldade deve ser 1 (Fácil), 2 (Média) ou 3 (Difícil).' });
    }

    // 3. Confirmar que a matéria e o autor existem antes de criar
    const [subjectExists, authorExists] = await Promise.all([
      prisma.subject.findUnique({ where: { id: parsedSubjectId } }),
      prisma.user.findUnique({ where: { id: parsedAuthorId } })
    ]);

    if (!subjectExists) {
      return res.status(404).json({ success: false, message: 'Matéria informada não existe.' });
    }

    if (!authorExists) {
      return res.status(404).json({ success: false, message: 'Autor informado não existe.' });
    }

    // Criação da questão
    const question = await prisma.question.create({
      data: {
        enunciado,
        dificuldade: parsedDificuldade,
        respostaCorreta,
        subjectId: parsedSubjectId,
        authorId: parsedAuthorId
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

    return res.status(201).json({
      success: true,
      data: question
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
};

export const getQuestions = async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
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

    return res.status(200).json({
      success: true,
      data: questions,
      total: questions.length
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({ success: false, message: 'O ID deve ser um número inteiro positivo.' });
    }

    const question = await prisma.question.findUnique({
      where: { id: parsedId },
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

    if (!question) {
      return res.status(404).json({ success: false, message: 'Questão não encontrada.' });
    }

    return res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
};