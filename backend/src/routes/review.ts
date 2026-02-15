import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { handlerReview, getAllReviews, getReviewById, updateReview, deleteReview } from '../controllers/review';

const router = Router();
router.post('/review',authMiddleware,handlerReview);
router.get('/reviews',authMiddleware,getAllReviews);
router.get('/review/:id',authMiddleware,getReviewById);
router.put('/review/:id',authMiddleware,updateReview);
router.delete('/review/:id',authMiddleware,deleteReview);

export default router;
