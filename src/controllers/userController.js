import * as userService from '../services/userService.js';

const allowedPatchFields = ['nome', 'email', 'papel', 'foto'];
const validRoles = ['PROFESSOR', 'ADMIN'];

function toPositiveInt(value) {
  const number = Number(value);

  return Number.isInteger(number) && number > 0
    ? number
    : null;
}

function hasAllowedPatchField(body) {
  return allowedPatchFields.some((field) =>
    Object.hasOwn(body, field)
  );
}

function hasInvalidUserFields({ nome, email, papel, foto }) {
  return (
    (nome !== undefined &&
      (typeof nome !== 'string' || !nome.trim())) ||

    (email !== undefined &&
      (typeof email !== 'string' || !email.trim())) ||

    (papel !== undefined &&
      !validRoles.includes(papel)) ||

    (foto !== undefined &&
      foto !== null &&
      typeof foto !== 'string')
  );
}

// =====================================================
// CRIAR USUÁRIO
// =====================================================

export const create = async (req, res) => {
  try {
    const { nome, email, papel, foto } = req.body;

    // Campos obrigatórios
    if (
      typeof nome !== 'string' ||
      !nome.trim() ||
      typeof email !== 'string' ||
      !email.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Nome e email são obrigatórios'
      });
    }

    // Validação dos campos
    if (
      hasInvalidUserFields({
        nome,
        email,
        papel,
        foto
      })
    ) {
      return res.status(400).json({
        success: false,
        message: 'Dados do usuário inválidos'
      });
    }

    const result = await userService.createUser({
      nome: nome.trim(),
      email: email.trim(),
      papel,
      foto
    });

    // E-mail duplicado
    if (!result.ok && result.reason === 'EMAIL_CONFLICT') {
      return res.status(409).json({
        success: false,
        message: 'Email já cadastrado no sistema'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);

    return res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário'
    });
  }
};

// =====================================================
// LISTAR USUÁRIOS
// =====================================================

export const getAll = async (_req, res) => {
  try {
    const usuarios = await userService.getAllUsers();

    return res.status(200).json({
      success: true,
      data: usuarios,
      total: usuarios.length
    });

  } catch (error) {
    console.error('Erro ao listar usuários:', error);

    return res.status(500).json({
      success: false,
      message: 'Erro ao listar usuários'
    });
  }
};

// =====================================================
// BUSCAR USUÁRIO POR ID
// =====================================================

export const getById = async (req, res) => {
  try {
    const userId = toPositiveInt(req.params.id);

    // ID inválido
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido. Deve ser um número inteiro positivo'
      });
    }

    const usuario = await userService.getUserById(userId);

    // Usuário não existe
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: `Usuário com ID ${userId} não encontrado`
      });
    }

    return res.status(200).json({
      success: true,
      data: usuario
    });

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);

    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuário'
    });
  }
};

// =====================================================
// ATUALIZAR USUÁRIO
// =====================================================

export const update = async (req, res) => {
  try {
    const userId = toPositiveInt(req.params.id);

    // ID inválido
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido. Deve ser um número inteiro positivo'
      });
    }

    // PATCH sem campos
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Envie ao menos um campo para atualizar'
      });
    }

    // Nenhum campo permitido
    if (!hasAllowedPatchField(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Envie ao menos um campo válido: nome, email, papel ou foto'
      });
    }

    // Campo inválido
    if (hasInvalidUserFields(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Dados do usuário inválidos'
      });
    }

    const result = await userService.updateUser(
      userId,
      req.body
    );

    // Usuário não encontrado
    if (!result.ok && result.reason === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: `Usuário com ID ${userId} não encontrado`
      });
    }

    // E-mail duplicado
    if (!result.ok && result.reason === 'EMAIL_CONFLICT') {
      return res.status(409).json({
        success: false,
        message: 'Email já cadastrado no sistema'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);

    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar usuário'
    });
  }
};

// =====================================================
// EXCLUIR USUÁRIO
// =====================================================

export const remove = async (req, res) => {
  try {
    const userId = toPositiveInt(req.params.id);

    // ID inválido
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido. Deve ser um número inteiro positivo'
      });
    }

    const result = await userService.deleteUser(userId);

    // Usuário não encontrado
    if (!result.ok && result.reason === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: `Usuário com ID ${userId} não encontrado`
      });
    }

    // Usuário possui vínculos
    if (!result.ok && result.reason === 'USER_IN_USE') {
      return res.status(409).json({
        success: false,
        message: 'Usuário possui matérias ou questões vinculadas'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Usuário removido com sucesso',
      data: result.data
    });

  } catch (error) {
    console.error('Erro ao remover usuário:', error);

    return res.status(500).json({
      success: false,
      message: 'Erro ao remover usuário'
    });
  }
};