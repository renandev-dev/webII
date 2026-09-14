import { Router } from 'express';
import { 
  createSubject, 
  getSubjects, 
  getSubjectById 
} from '../controllers/subjectController.js';

const router = Router();

router.post('/subjects', createSubject);
router.get('/subjects', getSubjects);
router.get('/subjects/:id', getSubjectById);

export default router;