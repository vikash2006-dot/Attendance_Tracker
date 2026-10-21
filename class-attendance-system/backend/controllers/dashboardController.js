const User = require('../models/User');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');

// @desc    Get dashboard metrics and summaries
// @route   GET /api/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total counts
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalSubjects = await Subject.countDocuments();

    // 2. Today's date in YYYY-MM-DD
    const todayStr = new Date().toISOString().split('T')[0];

    // Find attendance sheets marked for today
    const todaySheets = await Attendance.find({ date: todayStr }).populate('subject', 'name code semester');

    let todayTotalMarks = 0;
    let todayPresentMarks = 0;

    const todaySummary = todaySheets.map((sheet) => {
      const total = sheet.records.length;
      const present = sheet.records.filter((r) => r.status === 'Present').length;
      const absent = total - present;
      const pct = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0;

      todayTotalMarks += total;
      todayPresentMarks += present;

      return {
        sheetId: sheet._id,
        subjectName: sheet.subject ? sheet.subject.name : 'Unknown Subject',
        subjectCode: sheet.subject ? sheet.subject.code : '',
        semester: sheet.subject ? sheet.subject.semester : null,
        section: sheet.section,
        total,
        present,
        absent,
        percentage: pct
      };
    });

    const todayOverallPercentage =
      todayTotalMarks > 0 ? Number(((todayPresentMarks / todayTotalMarks) * 100).toFixed(1)) : 0;

    // 3. Subject-wise average attendance (cumulative)
    const allSubjects = await Subject.find().sort({ semester: 1, name: 1 });
    const allSheets = await Attendance.find();

    const subjectWiseStats = allSubjects.map((sub) => {
      const subSheets = allSheets.filter(
        (sh) => sh.subject.toString() === sub._id.toString()
      );

      let subTotalMarks = 0;
      let subPresentMarks = 0;

      subSheets.forEach((sh) => {
        subTotalMarks += sh.records.length;
        subPresentMarks += sh.records.filter((r) => r.status === 'Present').length;
      });

      const averagePercentage =
        subTotalMarks > 0 ? Number(((subPresentMarks / subTotalMarks) * 100).toFixed(1)) : 0;

      return {
        subjectId: sub._id,
        subjectName: sub.name,
        subjectCode: sub.code,
        semester: sub.semester,
        teacherName: sub.teacherName,
        totalClassesConducted: subSheets.length,
        averagePercentage
      };
    });

    // 4. Number of students below 75% in at least one subject
    const allStudents = await User.find({ role: 'student' });
    const studentsWithShortageSet = new Set();

    for (const st of allStudents) {
      const studentSubjects = allSubjects.filter((s) => s.semester === st.semester);

      for (const sub of studentSubjects) {
        const subSheets = allSheets.filter(
          (sh) => sh.subject.toString() === sub._id.toString()
        );

        let total = 0;
        let present = 0;

        subSheets.forEach((sh) => {
          const rec = sh.records.find((r) => r.student.toString() === st._id.toString());
          if (rec) {
            total += 1;
            if (rec.status === 'Present') {
              present += 1;
            }
          }
        });

        if (total > 0) {
          const pct = (present / total) * 100;
          if (pct < 75) {
            studentsWithShortageSet.add(st._id.toString());
            break; // Already flagged for at least one subject
          }
        }
      }
    }

    res.json({
      metrics: {
        totalStudents,
        totalSubjects,
        todayOverallPercentage,
        todayClassesMarked: todaySheets.length,
        todayTotalMarks,
        todayPresentMarks,
        studentsWithShortageCount: studentsWithShortageSet.size
      },
      todayDate: todayStr,
      todaySummary,
      subjectWiseStats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
