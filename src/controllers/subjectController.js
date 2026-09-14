import prisma from '../config/database.js';

export const createSubject = async (req, res) => {
  try {
    const { nome, professorId } = req.body;

    if (!nome || professorId === undefined) {
      return res.status(400).json({ success: false, message: 'Nome e professorId são obrigatórios.' });
    }

    const parsedProfessorId = Number(professorId);
    if (!Number.isInteger(parsedProfessorId) || parsedProfessorId <= 0) {
      return res.status(400).json({ success: false, message: 'O professorId deve ser um número inteiro positivo.' });
    }

    const professorExists = await prisma.user.findUnique({
      where: { id: parsedProfessorId }
    });

    if (!professorExists) {
      return res.status(404).json({ success: false, message: 'Professor informado não existe.' });
    }

    const subject = await prisma.subject.create({
      data: {
        nome,
        professorId: parsedProfessorId
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

    return res.status(201).json({
      success: true,
      data: subject
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
};

export const getSubjects = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
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

    return res.status(200).json({
      success: true,
      data: subjects,
      total: subjects.length
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({ success: false, message: 'O ID deve ser um número inteiro positivo.' });
    }

    const subject = await prisma.subject.findUnique({
      where: { id: parsedId },
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

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Matéria não encontrada.' });
    }

    return res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
};