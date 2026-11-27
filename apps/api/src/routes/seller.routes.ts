import { Router } from 'express';
import {
  createSeller,
  deleteSeller,
  getSeller,
  listSellers,
  updateSeller,
} from '../controllers/seller.controller.js';

const router = Router();

router.get('/', listSellers);
router.post('/', createSeller);
router.get('/:id', getSeller);
router.put('/:id', updateSeller);
router.delete('/:id', deleteSeller);

export default router;
