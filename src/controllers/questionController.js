import {
  createQuestion as createQuestionService,
  getQuestions as getQuestionsService,
  getQuestionById as getQuestionByIdService,
  updateQuestion as updateQuestionService,
  deleteQuestion as deleteQuestionService,
  QuestionServiceError
} from '../services/questionService.js';

const parseId = (value) => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
};

// CREATE
export const createQuestion = async (req, res) => {
  try {
    const {
      enunciado,
      dificuldade,
      respostaCorreta,
      subjectId,
      authorId
    } = req.body;

    if (
      enunciado === undefined ||
      dificuldade === undefined ||
      subjectId === undefined ||
      authorId === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Enunciado, dificuldade, subjectId e authorId são obrigatórios.'
      });
    }

    if (
      typeof enunciado !== 'string' ||
      enunciado.trim() === ''
    ) {
      return res.status(400).json({
        success: false,
        message: 'O enunciado não pode ser vazio.'
      });
    }

    const parsedSubjectId = parseId(subjectId);
    const parsedAuthorId = parseId(authorId);
    const parsedDificuldade = Number(dificuldade);

    if (!parsedSubjectId) {
      return res.status(400).json({
        success: false,
        message: 'O subjectId deve ser um número inteiro positivo.'
      });
    }

    if (!parsedAuthorId) {
      return res.status(400).json({
        success: false,
        message: 'O authorId deve ser um número inteiro positivo.'
      });
    }

    if (
      !Number.isInteger(parsedDificuldade) ||
      ![1, 2, 3].includes(parsedDificuldade)
    ) {
      return res.status(400).json({
        success: false,
        message: 'A dificuldade deve ser 1 (Fácil), 2 (Média) ou 3 (Difícil).'
      });
    }

    const question = await createQuestionService({
      enunciado: enunciado.trim(),
      dificuldade: parsedDificuldade,
      respostaCorreta:
        respostaCorreta === undefined
          ? null
          : respostaCorreta,
      subjectId: parsedSubjectId,
      authorId: parsedAuthorId
    });

    return res.status(201).json({
      success: true,
      data: question
    });

  } catch (error) {
    console.error(error);

    if (error instanceof QuestionServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erro interno no servidor.'
    });
  }
};

// GET ALL
export const getQuestions = async (req, res) => {
  try {
    const questions = await getQuestionsService();

    return res.status(200).json({
      success: true,
      data: questions,
      total: questions.length
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Erro interno no servidor.'
    });
  }
};

// GET BY ID
export const getQuestionById = async (req, res) => {
  try {
    const parsedId = parseId(req.params.id);

    if (!parsedId) {
      return res.status(400).json({
        success: false,
        message: 'O ID deve ser um número inteiro positivo.'
      });
    }

    const question = await getQuestionByIdService(parsedId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Questão não encontrada.'
      });
    }

    return res.status(200).json({
      success: true,
      data: question
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Erro interno no servidor.'
    });
  }
};

// PATCH
export const updateQuestion = async (req, res) => {
  try {
    const parsedId = parseId(req.params.id);

    if (!parsedId) {
      return res.status(400).json({
        success: false,
        message: 'O ID deve ser um número inteiro positivo.'
      });
    }

    const allowedFields = [
      'enunciado',
      'dificuldade',
      'respostaCorreta',
      'subjectId',
      'authorId',
      'ativa'
    ];

    const receivedFields = Object.keys(req.body);

    const hasAllowedField = receivedFields.some((field) =>
      allowedFields.includes(field)
    );

    if (!hasAllowedField) {
      return res.status(400).json({
        success: false,
        message: 'Informe pelo menos um campo permitido para atualizar.'
      });
    }

    const {
      enunciado,
      dificuldade,
      respostaCorreta,
      subjectId,
      authorId,
      ativa
    } = req.body;

    const data = {};

    // ENUNCIADO
    if (enunciado !== undefined) {
      if (
        typeof enunciado !== 'string' ||
        enunciado.trim() === ''
      ) {
        return res.status(400).json({
          success: false,
          message: 'O enunciado não pode ser vazio.'
        });
      }

      data.enunciado = enunciado.trim();
    }

    // DIFICULDADE
    if (dificuldade !== undefined) {
      const parsedDificuldade = Number(dificuldade);

      if (
        !Number.isInteger(parsedDificuldade) ||
        ![1, 2, 3].includes(parsedDificuldade)
      ) {
        return res.status(400).json({
          success: false,
          message: 'A dificuldade deve ser 1 (Fácil), 2 (Média) ou 3 (Difícil).'
        });
      }

      data.dificuldade = parsedDificuldade;
    }

    // RESPOSTA CORRETA
    if (respostaCorreta !== undefined) {
      data.respostaCorreta = respostaCorreta;
    }

    // ATIVA
    if (ativa !== undefined) {
      if (typeof ativa !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'O campo ativa deve ser booleano.'
        });
      }

      data.ativa = ativa;
    }

    // SUBJECT ID
    if (subjectId !== undefined) {
      const parsedSubjectId = parseId(subjectId);

      if (!parsedSubjectId) {
        return res.status(400).json({
          success: false,
          message: 'O subjectId deve ser um número inteiro positivo.'
        });
      }

      data.subjectId = parsedSubjectId;
    }

    // AUTHOR ID
    if (authorId !== undefined) {
      const parsedAuthorId = parseId(authorId);

      if (!parsedAuthorId) {
        return res.status(400).json({
          success: false,
          message: 'O authorId deve ser um número inteiro positivo.'
        });
      }

      data.authorId = parsedAuthorId;
    }

    const question = await updateQuestionService(
      parsedId,
      data
    );

    return res.status(200).json({
      success: true,
      data: question
    });

  } catch (error) {
    console.error(error);

    if (error instanceof QuestionServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erro interno no servidor.'
    });
  }
};

// DELETE
export const deleteQuestion = async (req, res) => {
  try {
    const parsedId = parseId(req.params.id);

    if (!parsedId) {
      return res.status(400).json({
        success: false,
        message: 'O ID deve ser um número inteiro positivo.'
      });
    }

    await deleteQuestionService(parsedId);

    return res.status(200).json({
      success: true,
      message: 'Questão excluída com sucesso.'
    });

  } catch (error) {
    console.error(error);

    if (error instanceof QuestionServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erro interno no servidor.'
    });
  }
};