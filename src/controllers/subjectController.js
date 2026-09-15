import {
  createSubject as createSubjectService,
  getSubjects as getSubjectsService,
  getSubjectById as getSubjectByIdService,
  updateSubject as updateSubjectService,
  deleteSubject as deleteSubjectService,
  SubjectServiceError
} from '../services/subjectService.js';

const parseId = (value) => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
};

// CREATE
export const createSubject = async (req, res) => {
  try {
    const { nome, professorId } = req.body;

    if (!nome || professorId === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Nome e professorId são obrigatórios.'
      });
    }

    if (typeof nome !== 'string' || nome.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'O nome da matéria não pode ser vazio.'
      });
    }

    const parsedProfessorId = parseId(professorId);

    if (!parsedProfessorId) {
      return res.status(400).json({
        success: false,
        message: 'O professorId deve ser um número inteiro positivo.'
      });
    }

    const subject = await createSubjectService({
      nome: nome.trim(),
      professorId: parsedProfessorId
    });

    return res.status(201).json({
      success: true,
      data: subject
    });

  } catch (error) {
    console.error(error);

    if (error instanceof SubjectServiceError) {
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
export const getSubjects = async (req, res) => {
  try {
    const subjects = await getSubjectsService();

    return res.status(200).json({
      success: true,
      data: subjects,
      total: subjects.length
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
export const getSubjectById = async (req, res) => {
  try {
    const parsedId = parseId(req.params.id);

    if (!parsedId) {
      return res.status(400).json({
        success: false,
        message: 'O ID deve ser um número inteiro positivo.'
      });
    }

    const subject = await getSubjectByIdService(parsedId);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Matéria não encontrada.'
      });
    }

    return res.status(200).json({
      success: true,
      data: subject
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
export const updateSubject = async (req, res) => {
  try {
    const parsedId = parseId(req.params.id);

    if (!parsedId) {
      return res.status(400).json({
        success: false,
        message: 'O ID deve ser um número inteiro positivo.'
      });
    }

    const allowedFields = ['nome', 'ativa', 'professorId'];

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

    const { nome, professorId, ativa } = req.body;

    const data = {};

    // nome
    if (nome !== undefined) {
      if (typeof nome !== 'string' || nome.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'O nome da matéria não pode ser vazio.'
        });
      }

      data.nome = nome.trim();
    }

    // professorId
    if (professorId !== undefined) {
      const parsedProfessorId = parseId(professorId);

      if (!parsedProfessorId) {
        return res.status(400).json({
          success: false,
          message: 'O professorId deve ser um número inteiro positivo.'
        });
      }

      data.professorId = parsedProfessorId;
    }

    // ativa
    if (ativa !== undefined) {
      if (typeof ativa !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'O campo ativa deve ser booleano.'
        });
      }

      data.ativa = ativa;
    }

    const subject = await updateSubjectService(
      parsedId,
      data
    );

    return res.status(200).json({
      success: true,
      data: subject
    });

  } catch (error) {
    console.error(error);

    if (error instanceof SubjectServiceError) {
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
export const deleteSubject = async (req, res) => {
  try {
    const parsedId = parseId(req.params.id);

    if (!parsedId) {
      return res.status(400).json({
        success: false,
        message: 'O ID deve ser um número inteiro positivo.'
      });
    }

    await deleteSubjectService(parsedId);

    return res.status(200).json({
      success: true,
      message: 'Matéria excluída com sucesso.'
    });

  } catch (error) {
    console.error(error);

    if (error instanceof SubjectServiceError) {
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