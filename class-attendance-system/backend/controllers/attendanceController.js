const Attendance = require('../models/Attendance');
const Subject = require('../models/Subject');
const User = require('../models/User');

// Helper to sanitize date to YYYY-MM-DD
const sanitizeDate = (dateInput) => {
  if (!dateInput) return '';
  // If it's already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

// @desc    Get attendance sheet for a subject and date (loads existing or prepares new)
// @route   GET /api/attendance/sheet?subjectId=...&date=...&section=...
// @access  Private/Admin
const getAttendanceSheet = async (req, res, next) => {
  try {
    const { subjectId, date, section } = req.query;

    if (!subjectId || !date) {
      return res.status(400).json({ message: 'Both subjectId and date are required query parameters' });
    }

    const cleanDate = sanitizeDate(date);
    if (!cleanDate) {
      return res.status(400).json({ message: 'Invalid date format. Expected YYYY-MM-DD' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Build filter for students: matching semester and optional section
    const studentFilter = {
      role: 'student',
      semester: subject.semester
    };

    if (section && section !== 'ALL') {
      studentFilter.section = section.toUpperCase().trim();
    }

    const eligibleStudents = await User.find(studentFilter)
      .select('name rollNumber semester section email')
      .sort({ rollNumber: 1, name: 1 });

    // Check if an attendance sheet already exists for this subject and date
    const existingSheet = await Attendance.findOne({
      subject: subject._id,
      date: cleanDate
    });

    if (existingSheet) {
      // Build lookup map for status
      const statusMap = new Map();
      existingSheet.records.forEach((r) => {
        statusMap.set(r.student.toString(), r.status);
      });

      // Map eligible students with their saved status or default to Present
      const studentRecords = eligibleStudents.map((st) => ({
        student: st,
        status: statusMap.get(st._id.toString()) || 'Present'
      }));

      return res.json({
        sheetExists: true,
        sheetId: existingSheet._id,
        subject,
        date: cleanDate,
        section: existingSheet.section || 'ALL',
        records: studentRecords
      });
    }

    // No existing sheet: default all eligible students to 'Present'
    const defaultRecords = eligibleStudents.map((st) => ({
      student: st,
      status: 'Present'
    }));

    res.json({
      sheetExists: false,
      sheetId: null,
      subject,
      date: cleanDate,
      section: section || 'ALL',
      records: defaultRecords
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark or Update attendance sheet for a subject and date
// @route   POST /api/attendance
// @access  Private/Admin
const markAttendance = async (req, res, next) => {
  try {
    const { subjectId, date, section, records } = req.body;

    if (!subjectId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({
        message: 'Please provide subjectId, date, and an array of student attendance records'
      });
    }

    const cleanDate = sanitizeDate(date);
    if (!cleanDate) {
      return res.status(400).json({ message: 'Invalid date format. Expected YYYY-MM-DD' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Validate and clean each student record
    const formattedRecords = [];
    for (const r of records) {
      const studentId = r.studentId || (r.student && (r.student._id || r.student));
      const status = r.status;

      if (!studentId) {
        return res.status(400).json({ message: 'Each record must contain a valid studentId' });
      }
      if (status !== 'Present' && status !== 'Absent') {
        return res.status(400).json({ message: `Invalid status '${status}'. Must be 'Present' or 'Absent'` });
      }

      formattedRecords.push({
        student: studentId,
        status
      });
    }

    // Check if sheet exists to update or insert (upsert behavior to guarantee no duplicates)
    let sheet = await Attendance.findOne({
      subject: subject._id,
      date: cleanDate
    });

    if (sheet) {
      // Update existing sheet
      sheet.records = formattedRecords;
      sheet.section = section || sheet.section || 'ALL';
      sheet.markedBy = req.user._id;
      await sheet.save();

      return res.json({
        message: 'Attendance sheet updated successfully',
        attendance: sheet
      });
    }

    // Create new sheet
    sheet = await Attendance.create({
      subject: subject._id,
      date: cleanDate,
      section: section || 'ALL',
      records: formattedRecords,
      markedBy: req.user._id
    });

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance: sheet
    });
  } catch (error) {
    // If unique compound index race condition occurs, fallback gracefully to update
    if (error.code === 11000) {
      try {
        const cleanDate = sanitizeDate(req.body.date);
        const existing = await Attendance.findOneAndUpdate(
          { subject: req.body.subjectId, date: cleanDate },
          {
            records: req.body.records.map((r) => ({
              student: r.studentId || (r.student && (r.student._id || r.student)),
              status: r.status
            })),
            section: req.body.section || 'ALL',
            markedBy: req.user._id
          },
          { new: true }
        );
        return res.json({
          message: 'Attendance sheet updated successfully',
          attendance: existing
        });
      } catch (innerError) {
        return next(innerError);
      }
    }
    next(error);
  }
};

// @desc    Update attendance sheet by sheet ID
// @route   PUT /api/attendance/:id
// @access  Private/Admin
const updateAttendanceById = async (req, res, next) => {
  try {
    const { records, section } = req.body;

    const sheet = await Attendance.findById(req.params.id);
    if (!sheet) {
      return res.status(404).json({ message: 'Attendance sheet not found' });
    }

    if (records && Array.isArray(records)) {
      sheet.records = records.map((r) => ({
        student: r.studentId || (r.student && (r.student._id || r.student)),
        status: r.status
      }));
    }

    if (section) sheet.section = section;
    sheet.markedBy = req.user._id;

    await sheet.save();

    res.json({
      message: 'Attendance sheet updated successfully',
      attendance: sheet
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List all attendance sheets (with subject populated)
// @route   GET /api/attendance
// @access  Private/Admin
const getAllAttendanceSheets = async (req, res, next) => {
  try {
    const sheets = await Attendance.find()
      .populate('subject', 'name code semester teacherName')
      .populate('markedBy', 'name email')
      .sort({ date: -1, createdAt: -1 });

    res.json({ sheets });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance summary for logged-in student across all their semester subjects
// @route   GET /api/attendance/my
// @access  Private/Student
const getMyAttendanceSummary = async (req, res, next) => {
  try {
    const student = req.user;

    // Find subjects corresponding to student's semester
    const subjects = await Subject.find({ semester: student.semester }).sort({ name: 1 });

    const summary = [];

    for (const subject of subjects) {
      // Find all attendance sheets for this subject
      const sheets = await Attendance.find({ subject: subject._id });

      let totalClasses = 0;
      let attendedClasses = 0;

      for (const sheet of sheets) {
        // Look for student in sheet records
        const record = sheet.records.find(
          (r) => r.student.toString() === student._id.toString()
        );

        if (record) {
          totalClasses += 1;
          if (record.status === 'Present') {
            attendedClasses += 1;
          }
        }
      }

      const percentage =
        totalClasses > 0 ? Number(((attendedClasses / totalClasses) * 100).toFixed(2)) : 0;

      summary.push({
        subject: {
          _id: subject._id,
          name: subject.name,
          code: subject.code,
          semester: subject.semester,
          teacherName: subject.teacherName
        },
        totalClasses,
        attendedClasses,
        percentage
      });
    }

    res.json({ summary });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed date-wise attendance for logged-in student for a specific subject
// @route   GET /api/attendance/my/:subjectId
// @access  Private/Student
const getMySubjectAttendanceDetail = async (req, res, next) => {
  try {
    const student = req.user;
    const { subjectId } = req.params;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Safety check: ensure subject matches student's semester or records exist
    const sheets = await Attendance.find({ subject: subject._id }).sort({ date: -1 });

    const history = [];
    let totalClasses = 0;
    let attendedClasses = 0;

    for (const sheet of sheets) {
      const record = sheet.records.find(
        (r) => r.student.toString() === student._id.toString()
      );

      if (record) {
        totalClasses += 1;
        if (record.status === 'Present') {
          attendedClasses += 1;
        }
        history.push({
          date: sheet.date,
          status: record.status
        });
      }
    }

    const percentage =
      totalClasses > 0 ? Number(((attendedClasses / totalClasses) * 100).toFixed(2)) : 0;

    res.json({
      subject,
      student: {
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        semester: student.semester,
        section: student.section
      },
      totalClasses,
      attendedClasses,
      percentage,
      history
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance shortage report (< 75% attendance)
// @route   GET /api/attendance/shortage
// @access  Private/Admin
const getShortageReport = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).sort({ semester: 1, rollNumber: 1 });
    const subjects = await Subject.find().sort({ semester: 1, name: 1 });

    // Fetch all attendance sheets once for fast lookup
    const allSheets = await Attendance.find().populate('subject', 'name code semester');

    const shortageList = [];

    for (const student of students) {
      // Find subjects for student's semester
      const studentSubjects = subjects.filter((s) => s.semester === student.semester);

      for (const subject of studentSubjects) {
        // Find sheets for this subject
        const subjectSheets = allSheets.filter(
          (sheet) => sheet.subject && sheet.subject._id.toString() === subject._id.toString()
        );

        let totalClasses = 0; // A
        let attendedClasses = 0; // P

        for (const sheet of subjectSheets) {
          const rec = sheet.records.find(
            (r) => r.student.toString() === student._id.toString()
          );
          if (rec) {
            totalClasses += 1;
            if (rec.status === 'Present') {
              attendedClasses += 1;
            }
          }
        }

        // Only consider if classes have taken place
        if (totalClasses > 0) {
          const percentage = Number(((attendedClasses / totalClasses) * 100).toFixed(2));

          if (percentage < 75) {
            // Formula specified in requirement:
            // requiredClasses = Math.max(0, Math.ceil(3 * A - 4 * P))
            const requiredClasses = Math.max(
              0,
              Math.ceil(3 * totalClasses - 4 * attendedClasses)
            );

            shortageList.push({
              studentId: student._id,
              studentName: student.name,
              rollNumber: student.rollNumber,
              semester: student.semester,
              section: student.section,
              subjectId: subject._id,
              subjectName: subject.name,
              subjectCode: subject.code,
              totalClasses,
              attendedClasses,
              percentage,
              requiredClasses
            });
          }
        }
      }
    }

    // Sort by percentage ascending so students most in need appear first
    shortageList.sort((a, b) => a.percentage - b.percentage);

    res.json({
      totalShortageCases: shortageList.length,
      shortageList
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendanceSheet,
  markAttendance,
  updateAttendanceById,
  getAllAttendanceSheets,
  getMyAttendanceSummary,
  getMySubjectAttendanceDetail,
  getShortageReport
};
