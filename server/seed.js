// Creates a demo account with sample applications so the app can be shown quickly.
// Run with: npm run seed   (safe to run again, it resets only the demo user's data)
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Application = require('./models/Application');

const DEMO_EMAIL = 'demo@applyd.com';
const DEMO_PASSWORD = 'demo123';

// A date "daysAgo" days before today, at midnight UTC (same format a date input saves)
function dateAgo(daysAgo) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d;
}

// [company, role, location, salary, appliedDaysAgo, history [[status, daysAgo]], notes, interviewInDays]
const SAMPLES = [
  ['Infosys', 'Systems Engineer', 'Bengaluru', '4.5 LPA', 20, [['Applied', 20], ['Interview', 12], ['Offer', 3]], 'Offer letter received', 0],
  ['TCS', 'Assistant System Engineer', 'Hyderabad', '3.6 LPA', 18, [['Applied', 18], ['Interview', 9]], 'Technical round done, HR round pending', 2],
  ['Wipro', 'Project Engineer', 'Chennai', '3.5 LPA', 15, [['Applied', 15], ['Rejected', 6]], 'Rejected after aptitude test', null],
  ['Accenture', 'Associate Software Engineer', 'Pune', '4.6 LPA', 12, [['Applied', 12]], 'Applied via campus portal, no reply yet', null],
  ['Zoho', 'Software Developer', 'Chennai', '6 LPA', 10, [['Applied', 10]], 'Referred by a senior', null],
  ['Cognizant', 'Programmer Analyst', 'Bengaluru', '4 LPA', 4, [['Applied', 4]], '', null],
  ['HCLTech', 'Graduate Engineer Trainee', 'Noida', '3.8 LPA', 2, [['Applied', 2]], '', null],
  ['Freshworks', 'Frontend Developer Intern', 'Remote', '25k/month', 8, [['Applied', 8], ['Interview', 3]], 'Take-home React assignment submitted', 4],
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  let user = await User.findOne({ email: DEMO_EMAIL });
  if (user) {
    await Application.deleteMany({ user: user._id }); // start fresh
  } else {
    const password = await bcrypt.hash(DEMO_PASSWORD, 10);
    user = await User.create({ name: 'Demo User', email: DEMO_EMAIL, password });
  }

  for (const [company, role, location, salaryExpectation, appliedAgo, history, notes, interviewIn] of SAMPLES) {
    await Application.create({
      user: user._id,
      company,
      role,
      location,
      salaryExpectation,
      notes,
      jobLink: `https://careers.${company.toLowerCase()}.com`,
      appliedDate: dateAgo(appliedAgo),
      interviewDate: interviewIn === null ? null : dateAgo(-interviewIn),
      status: history[history.length - 1][0], // current status = last history entry
      statusHistory: history.map(([status, daysAgo]) => ({
        status,
        changedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      })),
    });
  }

  console.log(`Demo data ready. Log in with ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
