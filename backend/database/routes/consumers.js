import express from 'express';
import {
  getAllConsumers,
  getConsumerById,
  addConsumer
} from '../controllers/consumersController.js';

const router = express.Router();

router.get('/', getAllConsumers);
router.get('/:id', getConsumerById);
router.post('/', addConsumer);

export default router;
