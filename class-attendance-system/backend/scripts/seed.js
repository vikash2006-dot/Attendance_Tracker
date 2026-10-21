const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ Error: MONGO_URI is missing from environment variables.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    // Only clear existing records if explicit '--reset' flag is provided
    const shouldReset = process.argv.includes('--reset');
    if (shouldReset) {
      console.log('⚠️  Explicit --reset flag supplied. Clearing existing collections...');
      await User.deleteMany({});
      await Subject.deleteMany({});
      await Attendance.deleteMany({});
      console.log('Existing records cleared.');
    } else {
      console.log('ℹ️  Running in safe/idempotent mode without deleting existing database records.');
    }

    // 1. Create or Update Admin Account
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@attendance.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    let admin = await User.findOne({ email: adminEmail });
    if (admin) {
      admin.name = 'System Administrator';
      admin.role = 'admin';
      admin.password = adminPassword; // Plain text: User pre('save') hook will hash it once
      await admin.save();
      console.log(`✅ Admin account updated: ${admin.email} (Password: ${adminPassword})`);
    } else {
      admin = await User.create({
        name: 'System Administrator',
        email: adminEmail,
        password: adminPassword, // Plain text: User pre('save') hook will hash it once
        role: 'admin'
      });
      console.log(`✅ Admin created: ${admin.email} (Password: ${adminPassword})`);
    }

    // 2. Create or Update Sample Students
    const studentDefaultPassword = 'student123';

    const sampleStudents = [
      // Semester 4 - Section A
      { name: 'Aarav Sharma', email: 'aarav@college.edu', rollNumber: 'CS202401', semester: 4, section: 'A' },
      { name: 'Diya Patel', email: 'diya@college.edu', rollNumber: 'CS202402', semester: 4, section: 'A' },
      { name: 'Rohan Verma', email: 'rohan@college.edu', rollNumber: 'CS202403', semester: 4, section: 'A' },
      { name: 'Ananya Iyer', email: 'ananya@college.edu', rollNumber: 'CS202404', semester: 4, section: 'A' },
      { name: 'Kabir Mehta', email: 'kabir@college.edu', rollNumber: 'CS202405', semester: 4, section: 'A' },

      // Semester 4 - Section B
      { name: 'Neha Gupta', email: 'neha@college.edu', rollNumber: 'CS202406', semester: 4, section: 'B' },
      { name: 'Aditya Rao', email: 'aditya@college.edu', rollNumber: 'CS202407', semester: 4, section: 'B' },

      // Semester 6 - Section A
      { name: 'Ishaan Joshi', email: 'ishaan@college.edu', rollNumber: 'CS202201', semester: 6, section: 'A' },
      { name: 'Pooja Reddy', email: 'pooja@college.edu', rollNumber: 'CS202202', semester: 6, section: 'A' },
      { name: 'Varun Nair', email: 'varun@college.edu', rollNumber: 'CS202203', semester: 6, section: 'A' },
      { name: 'Simran Kaur', email: 'simran@college.edu', rollNumber: 'CS202204', semester: 6, section: 'A' }
    ];

    const studentDocs = [];
    for (const st of sampleStudents) {
      let student = await User.findOne({
        $or: [{ email: st.email.toLowerCase().trim() }, { rollNumber: st.rollNumber }]
      });

      if (student) {
        student.name = st.name;
        student.email = st.email.toLowerCase().trim();
        student.rollNumber = st.rollNumber;
        student.semester = st.semester;
        student.section = st.section;
        student.role = 'student';
        student.password = studentDefaultPassword; // Resets to correct hash via pre('save')
        await student.save();
      } else {
        student = await User.create({
          ...st,
          password: studentDefaultPassword, // Plain text: User pre('save') hook will hash it once
          role: 'student'
        });
      }
      studentDocs.push(student);
    }
    console.log(`✅ ${studentDocs.length} Sample students ready (Password for all: ${studentDefaultPassword})`);

    // 3. Create or Find Subjects across semesters
    const sampleSubjects = [
      // Semester 4 subjects
      { name: 'Data Structures & Algorithms', code: 'CS401', semester: 4, teacherName: 'Dr. Suresh Raina' },
      { name: 'Database Management Systems', code: 'CS402', semester: 4, teacherName: 'Prof. Anita Desai' },
      { name: 'Operating Systems', code: 'CS403', semester: 4, teacherName: 'Dr. Vikram Chandra' },
      // Semester 6 subjects
      { name: 'Computer Networks', code: 'CS601', semester: 6, teacherName: 'Prof. Rajesh Khanna' },
      { name: 'Web Technologies', code: 'CS602', semester: 6, teacherName: 'Dr. Sunita Williams' }
    ];

    const subjectDocs = [];
    for (const sub of sampleSubjects) {
      let subject = await Subject.findOne({ code: sub.code });
      if (!subject) {
        subject = await Subject.create(sub);
      }
      subjectDocs.push(subject);
    }
    console.log(`✅ ${subjectDocs.length} Subjects ready.`);

    // 4. Create Attendance records across dates (if not already existing)
    const dates = [];
    const now = new Date();
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const sem4Students = studentDocs.filter((s) => s.semester === 4);
    const sem6Students = studentDocs.filter((s) => s.semester === 6);
    const sem4Subjects = subjectDocs.filter((s) => s.semester === 4);

    for (const subject of sem4Subjects) {
      for (let dayIndex = 0; dayIndex < dates.length; dayIndex++) {
        const currentDate = dates[dayIndex];

        const existingSheet = await Attendance.findOne({
          subject: subject._id,
          date: currentDate
        });

        if (!existingSheet) {
          const records = sem4Students.map((student) => {
            let status = 'Present';

            // Simulate shortage for specific students to test 75% shortage calculation
            if (student.rollNumber === 'CS202403') {
              if (dayIndex === 1 || dayIndex === 2 || dayIndex === 4) status = 'Absent';
            } else if (student.rollNumber === 'CS202404') {
              if (dayIndex === 0 || dayIndex === 1 || dayIndex === 3) status = 'Absent';
            } else if (student.rollNumber === 'CS202405') {
              if (dayIndex === 2) status = 'Absent';
            }

            return {
              student: student._id,
              status
            };
          });

          await Attendance.create({
            subject: subject._id,
            date: currentDate,
            section: 'ALL',
            records,
            markedBy: admin._id
          });
        }
      }
    }

    const sem6Subjects = subjectDocs.filter((s) => s.semester === 6);
    for (const subject of sem6Subjects) {
      for (let dayIndex = 0; dayIndex < dates.length; dayIndex++) {
        const currentDate = dates[dayIndex];

        const existingSheet = await Attendance.findOne({
          subject: subject._id,
          date: currentDate
        });

        if (!existingSheet) {
          const records = sem6Students.map((student) => {
            let status = 'Present';

            if (student.rollNumber === 'CS202203' && (dayIndex === 1 || dayIndex === 2 || dayIndex === 3)) {
              status = 'Absent';
            }

            return {
              student: student._id,
              status
            };
          });

          await Attendance.create({
            subject: subject._id,
            date: currentDate,
            section: 'ALL',
            records,
            markedBy: admin._id
          });
        }
      }
    }

    console.log(`✅ Attendance sheets verified for dates: ${dates.join(', ')}`);
    console.log('\n--- SEED COMPLETE ---');
    console.log('Login credentials:');
    console.log(`  Admin:   ${adminEmail} / ${adminPassword}`);
    console.log(`  Student (High Att.):  aarav@college.edu / ${studentDefaultPassword} (Roll: CS202401, Sem: 4)`);
    console.log(`  Student (Shortage):   rohan@college.edu / ${studentDefaultPassword} (Roll: CS202403, Sem: 4)`);
    console.log(`  Student (Shortage):   ananya@college.edu / ${studentDefaultPassword} (Roll: CS202404, Sem: 4)`);
    console.log('---------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
