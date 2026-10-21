const express = require('express');
const router = express.Router();
const {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
} = require('../controllers/subjectController');
const { verifyToken, requireAdmin } = require('../middleware/authHandler');

// All subject routes require authentication
router.use(verifyToken);

// Read routes accessible to both admin and students
router.get('/', getAllSubjects);
router.get('/:id', getSubjectById);

// Create, update, delete restricted to admin
router.post('/', requireAdmin, createSubject);
router.put('/:id', requireAdmin, updateSubject);
router.delete('/:id', requireAdmin, deleteSubject);

module.exports = router;
