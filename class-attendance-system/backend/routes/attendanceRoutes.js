const express = require('express');
const router = express.Router();
const {
  getAttendanceSheet,
  markAttendance,
  updateAttendanceById,
  getAllAttendanceSheets,
  getMyAttendanceSummary,
  getMySubjectAttendanceDetail,
  getShortageReport
} = require('../controllers/attendanceController');
const { verifyToken, requireAdmin, requireStudent } = require('../middleware/authHandler');

// All attendance routes require valid JWT
router.use(verifyToken);

// Student specific routes (placed before generic routes)
router.get('/my', requireStudent, getMyAttendanceSummary);
router.get('/my/:subjectId', requireStudent, getMySubjectAttendanceDetail);

// Admin specific routes
router.get('/shortage', requireAdmin, getShortageReport);
router.get('/sheet', requireAdmin, getAttendanceSheet);
router.get('/', requireAdmin, getAllAttendanceSheets);
router.post('/', requireAdmin, markAttendance);
router.put('/:id', requireAdmin, updateAttendanceById);

module.exports = router;
