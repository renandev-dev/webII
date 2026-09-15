import * as questionService from '../services/questionService.js';

export const createQuestion = async (req, res) => {
  try {
    const { enunciado, respostaCorreta, dificuldade, subjectId, authorId } = req.body;

    if (!enunciado || dificuldade === undefined || !subjectId || !authorId) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios ausentes.',
      });
    }

    if (typeof enunciado === 'string' && enunciado.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'O enunciado não pode ser vazio.',
      });
    }

    const parsedDificuldade = Number(dificuldade);
    if (!Number.isInteger(parsedDificuldade) || parsedDificuldade < 1 || parsedDificuldade > 3) {
      return res.status(400).json({
        success: false,
        message: 'A dificuldade deve ser um inteiro entre 1 e 3.',
      });
    }

    const parsedSubjectId = Number(subjectId);
    const parsedAuthorId = Number(authorId);

    if (!Number.isInteger(parsedSubjectId) || parsedSubjectId <= 0 ||
        !Number.isInteger(parsedAuthorId) || parsedAuthorId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'subjectId e authorId devem ser inteiros positivos.',
      });
    }

    const question = await questionService.createQuestionService({
      enunciado: enunciado.trim(),
      respostaCorreta: respostaCorreta !== undefined ? respostaCorreta : null,
      dificuldade: parsedDificuldade,
      subjectId: parsedSubjectId,
      authorId: parsedAuthorId,
    });

    return res.status(201).json({ success: true, data: question });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
};

export const getQuestions = async (req, res) => {
  try {
    const questions = await questionService.getQuestionsService();
    return res.status(200).json({
      success: true,
      data: questions,
      total: questions.length,
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
      return res.status(400).json({
        success: false,
        message: 'O ID deve ser um número inteiro positivo.',
      });
    }

    const question = await questionService.getQuestionByIdService(parsedId);

    if (!question) {
      return res.status(404).json({ success: false, message: 'Questão não encontrada.' });
    }

    return res.status(200).json({ success: true, data: question });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'O ID deve ser um número inteiro positivo.',
      });
    }

    const { enunciado, respostaCorreta, dificuldade, ativa, subjectId, authorId } = req.body;

    // Regra: pelo menos um campo permitido no PATCH
    if (
      enunciado === undefined &&
      respostaCorreta === undefined &&
      dificuldade === undefined &&
      ativa === undefined &&
      subjectId === undefined &&
      authorId === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'O corpo do PATCH deve ter ao menos um campo permitido.',
      });
    }

    if (enunciado !== undefined && (typeof enunciado !== 'string' || enunciado.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'O enunciado, quando enviado, não pode ser vazio.',
      });
    }

    if (
      respostaCorreta !== undefined &&
      respostaCorreta !== null &&
      typeof respostaCorreta !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'A respostaCorreta deve ser um texto ou null.',
      });
    }

    let parsedDificuldade;
    if (dificuldade !== undefined) {
      parsedDificuldade = Number(dificuldade);
      if (!Number.isInteger(parsedDificuldade) || parsedDificuldade < 1 || parsedDificuldade > 3) {
        return res.status(400).json({
          success: false,
          message: 'A dificuldade deve ser um inteiro entre 1 e 3.',
        });
      }
    }

    if (ativa !== undefined && typeof ativa !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'O campo ativa, quando enviado, deve ser booleano.',
      });
    }

    let parsedSubjectId;
    if (subjectId !== undefined) {
      parsedSubjectId = Number(subjectId);
      if (!Number.isInteger(parsedSubjectId) || parsedSubjectId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'O subjectId deve ser um número inteiro positivo.',
        });
      }
    }

    let parsedAuthorId;
    if (authorId !== undefined) {
      parsedAuthorId = Number(authorId);
      if (!Number.isInteger(parsedAuthorId) || parsedAuthorId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'O authorId deve ser um número inteiro positivo.',
        });
      }
    }

    // Montagem dinâmica enviando apenas campos realmente definidos
    const updatePayload = {};
    if (enunciado !== undefined) updatePayload.enunciado = enunciado.trim();
    if (respostaCorreta !== undefined) updatePayload.respostaCorreta = respostaCorreta;
    if (parsedDificuldade !== undefined) updatePayload.dificuldade = parsedDificuldade;
    if (ativa !== undefined) updatePayload.ativa = ativa;
    if (parsedSubjectId !== undefined) updatePayload.subjectId = parsedSubjectId;
    if (parsedAuthorId !== undefined) updatePayload.authorId = parsedAuthorId;

    const updatedQuestion = await questionService.updateQuestionService(parsedId, updatePayload);

    return res.status(200).json({ success: true, data: updatedQuestion });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'O ID deve ser um número inteiro positivo.',
      });
    }

    const deletedQuestion = await questionService.deleteQuestionService(parsedId);

    // Retorna a propriedade `data` contendo o registro excluído
    return res.status(200).json({
      success: true,
      data: deletedQuestion,
      message: 'Questão removida com sucesso.',
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
};