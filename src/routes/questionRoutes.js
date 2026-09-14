import { Router } from 'express';
import { 
  createQuestion, 
  getQuestions, 
  getQuestionById 
} from '../controllers/questionController.js';

const router = Router();

router.post('/questions', createQuestion);
router.get('/questions', getQuestions);
router.get('/questions/:id', getQuestionById);

export default router;