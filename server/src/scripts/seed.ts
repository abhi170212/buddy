import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/user.model';
import { UserRoles } from '../constants/roles';

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Seeding default development users...');

    // Hash passwords securely with cost factor 12
    const salt = await bcrypt.genSalt(12);
    const defaultPassword = 'Password123!';
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    // 1. Seed Mentor Account
    const mentorEmail = 'mentor@studytracker.dev';
    let mentor = await User.findOne({ email: mentorEmail });
    if (!mentor) {
      mentor = await User.create({
        name: 'Dr. Rachel Vance',
        email: mentorEmail,
        passwordHash,
        role: UserRoles.MENTOR,
        bio: 'Lead Distributed Systems Architect & Curriculum Director',
        timezone: 'America/New_York',
        isActive: true,
      });
      console.log(`[Seed] Created Mentor: ${mentor.email} (${mentor.name})`);
    } else {
      console.log(`[Seed] Mentor already exists: ${mentor.email}`);
    }

    // 2. Seed Student Account
    const studentEmail = 'student@studytracker.dev';
    let student = await User.findOne({ email: studentEmail });
    if (!student) {
      student = await User.create({
        name: 'Alex Rivera',
        email: studentEmail,
        passwordHash,
        role: UserRoles.STUDENT,
        mentorId: mentor.id,
        bio: 'Full-Stack Engineering Fellow specializing in Node.js & React',
        timezone: 'America/New_York',
        isActive: true,
      });
      console.log(`[Seed] Created Student: ${student.email} (${student.name})`);
    } else {
      console.log(`[Seed] Student already exists: ${student.email}`);
    }

    console.log('\n[Seed] Default Credentials for Local Testing:');
    console.log('--------------------------------------------------');
    console.log(`Mentor:  ${mentorEmail} / ${defaultPassword}`);
    console.log(`Student: ${studentEmail} / ${defaultPassword}`);
    console.log('--------------------------------------------------');
    console.log('[Seed] Database seed completed successfully.');
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
};

if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}
