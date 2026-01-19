import { Router } from 'express';
import {
  getAllUsers,
  getUser,
  banUser,
  unbanUser,
  toggleAdmin,
  deleteUser
} from '../controllers/userController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// All user management routes require admin
router.get('/', authenticate, requireAdmin, getAllUsers);
router.get('/:id', authenticate, requireAdmin, getUser);
router.post('/:id/ban', authenticate, requireAdmin, banUser);
router.post('/:id/unban', authenticate, requireAdmin, unbanUser);
router.post('/:id/toggle-admin', authenticate, requireAdmin, toggleAdmin);
router.delete('/:id', authenticate, requireAdmin, deleteUser);

export default router;
