import { Router } from 'express';
import {
  createBuild,
  deleteBuild,
  getBuild,
  listBuilds,
  updateBuild,
} from '../controllers/build.controller.js';

const router = Router();

router.get('/', listBuilds);
router.post('/', createBuild);
router.get('/:id', getBuild);
router.put('/:id', updateBuild);
router.delete('/:id', deleteBuild);

export default router;
