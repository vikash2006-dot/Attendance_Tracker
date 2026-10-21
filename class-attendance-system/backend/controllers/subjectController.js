const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');

// @desc    Get all subjects (supports optional ?semester= query)
// @route   GET /api/subjects
// @access  Private (Admin & Student)
const getAllSubjects = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.semester) {
      filter.semester = Number(req.query.semester);
    }

    // Students only need subjects for their semester if not specifying
    if (req.user.role === 'student' && !req.query.all) {
      filter.semester = req.user.semester;
    }

    const subjects = await Subject.find(filter).sort({ semester: 1, name: 1 });
    res.json({ subjects });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single subject by ID
// @route   GET /api/subjects/:id
// @access  Private (Admin & Student)
const getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json({ subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private/Admin
const createSubject = async (req, res, next) => {
  try {
    const { name, code, semester, teacherName } = req.body;

    if (!name || !code || !semester || !teacherName) {
      return res.status(400).json({
        message: 'Please provide subject name, code, semester, and teacher name'
      });
    }

    const cleanCode = code.toUpperCase().trim();
    const existing = await Subject.findOne({ code: cleanCode });
    if (existing) {
      return res.status(409).json({ message: `Subject code '${cleanCode}' is already registered` });
    }

    const subject = await Subject.create({
      name: name.trim(),
      code: cleanCode,
      semester: Number(semester),
      teacherName: teacherName.trim()
    });

    res.status(201).json({
      message: 'Subject created successfully',
      subject
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private/Admin
const updateSubject = async (req, res, next) => {
  try {
    const { name, code, semester, teacherName } = req.body;

    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    if (code) {
      const cleanCode = code.toUpperCase().trim();
      const duplicate = await Subject.findOne({ code: cleanCode, _id: { $ne: req.params.id } });
      if (duplicate) {
        return res.status(409).json({ message: `Subject code '${cleanCode}' is already in use by another subject` });
      }
      subject.code = cleanCode;
    }

    if (name) subject.name = name.trim();
    if (semester) subject.semester = Number(semester);
    if (teacherName) subject.teacherName = teacherName.trim();

    await subject.save();

    res.json({
      message: 'Subject updated successfully',
      subject
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Also remove associated attendance records to keep database consistent
    await Attendance.deleteMany({ subject: subject._id });
    await subject.deleteOne();

    res.json({ message: 'Subject and associated attendance records deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
};
