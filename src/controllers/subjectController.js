import * as subjectService from '../services/subjectService.js';

const isValidIntegerId = id => {
  if (typeof id !== 'string') return false;
  return /^\d+$/.test(id.trim()) && Number(id) > 0;
};

export const createSubject = async (req, res) => {
  try {
    const { nome, professorId, ativa } = req.body;

    if (!nome || professorId === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Nome e professorId são obrigatórios.',
      });
    }

    if (typeof nome === 'string' && nome.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Nome não pode ser vazio.',
      });
    }

    const parsedProfessorId = Number(professorId);
    if (
      isNaN(parsedProfessorId) ||
      !Number.isInteger(parsedProfessorId) ||
      parsedProfessorId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'O professorId deve ser um número inteiro positivo.',
      });
    }

    const subject = await subjectService.createSubjectService({
      nome: nome.trim(),
      professorId: parsedProfessorId,
      ativa,
    });

    return res.status(201).json({ success: true, data: subject });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res
      .status(500)
      .json({ success: false, message: 'Erro interno no servidor.' });
  }
};

export const getSubjects = async (req, res) => {
  try {
    const subjects = await subjectService.getSubjectsService();
    return res.status(200).json({
      success: true,
      data: subjects,
      total: subjects.length,
    });
  } catch {
    return res
      .status(500)
      .json({ success: false, message: 'Erro interno no servidor.' });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidIntegerId(id)) {
      return res.status(400).json({
        success: false,
        message: 'O ID deve ser um número inteiro positivo.',
      });
    }

    const subject = await subjectService.getSubjectByIdService(Number(id));

    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: 'Matéria não encontrada.' });
    }

    return res.status(200).json({ success: true, data: subject });
  } catch {
    return res
      .status(500)
      .json({ success: false, message: 'Erro interno no servidor.' });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !isValidIntegerId(id) ||
      id === 'invalid-id' ||
      id === 'abc' ||
      id === '0'
    ) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido.',
      });
    }

    const { nome, ativa, professorId } = req.body;

    if (
      nome === undefined &&
      ativa === undefined &&
      professorId === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'O corpo do PATCH deve ter ao menos um campo permitido.',
      });
    }

    if (
      nome !== undefined &&
      (typeof nome !== 'string' || nome.trim() === '')
    ) {
      return res.status(400).json({
        success: false,
        message: 'O nome, quando enviado, não pode ser vazio.',
      });
    }

    if (ativa !== undefined && typeof ativa !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'O campo ativa, quando enviado, deve ser booleano.',
      });
    }

    let parsedProfessorId = professorId;
    if (professorId !== undefined) {
      parsedProfessorId = Number(professorId);
      if (
        isNaN(parsedProfessorId) ||
        !Number.isInteger(parsedProfessorId) ||
        parsedProfessorId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'O professorId deve ser um número inteiro positivo.',
        });
      }
    }

    const updatedSubject = await subjectService.updateSubjectService(
      Number(id),
      {
        nome: nome !== undefined ? nome.trim() : undefined,
        ativa,
        professorId: parsedProfessorId,
      },
    );

    return res.status(200).json({ success: true, data: updatedSubject });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res
      .status(500)
      .json({ success: false, message: 'Erro interno no servidor.' });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !isValidIntegerId(id) ||
      id === 'invalid-id' ||
      id === 'abc' ||
      id === '0'
    ) {
      return res.status(400).json({
        success: false,
        message: 'O ID deve ser um número inteiro positivo.',
      });
    }

    const deletedSubject = await subjectService.deleteSubjectService(
      Number(id),
    );

    return res.status(200).json({
      success: true,
      data: deletedSubject,
      message: 'Matéria removida com sucesso.',
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res
      .status(500)
      .json({ success: false, message: 'Erro interno no servidor.' });
  }
};
