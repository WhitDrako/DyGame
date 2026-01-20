import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  getAllItems,
  getItem,
  getItemHistory,
  createItem,
  updateItem,
  deleteItem,
  addValueHistory,
  updateValueHistory,
  deleteValueHistory
} from '../controllers/itemController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `item-${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Protected routes (require authentication)
router.get('/', authenticate, getAllItems);
router.get('/:id', authenticate, getItem);
router.get('/:id/history', authenticate, getItemHistory);

// Admin routes
router.post('/', authenticate, requireAdmin, upload.single('image'), createItem);
router.put('/:id', authenticate, requireAdmin, upload.single('image'), updateItem);
router.delete('/:id', authenticate, requireAdmin, deleteItem);

// Value history management (admin only)
router.post('/:id/history', authenticate, requireAdmin, addValueHistory);
router.put('/history/:historyId', authenticate, requireAdmin, updateValueHistory);
router.delete('/history/:historyId', authenticate, requireAdmin, deleteValueHistory);

export default router;
