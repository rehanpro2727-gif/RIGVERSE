import { Router } from 'express';
import {
  createPriceRecord,
  deletePriceRecord,
  getPriceRecord,
  listPriceRecords,
} from '../controllers/price.controller.js';

const router = Router();

router.get('/', listPriceRecords);
router.post('/', createPriceRecord);
router.get('/:id', getPriceRecord);
router.delete('/:id', deletePriceRecord);

export default router;
