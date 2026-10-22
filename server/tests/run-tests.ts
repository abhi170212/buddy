import request from 'supertest';
import { createApp } from '../src/app';
import { connectDB, disconnectDB } from '../src/config/db';
import { User } from '../src/models/user.model';
import { UserRoles } from '../src/constants/roles';

// Test runner helper
let testsPassed = 0;
let testsFailed = 0;

const assert = (condition: boolean, message: string) => {
  if (condition) {
    testsPassed++;
    console.log(`  ✓ ${message}`);
  } else {
    testsFailed++;
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
};

const runAllTests = async () => {
  console.log('\n=========================================');
  console.log(' Starting Phase 2 Backend Automated Tests');
  console.log('=========================================\n');

  // Connect to DB (will use embedded MongoMemoryServer if no local mongo)
  await connectDB();

  // Clear test users if any
  await User.deleteMany({});

  const app = createApp();

  try {
    // ----------------------------------------------------
    // Test Group 1: Health & Readiness Endpoints
    // ----------------------------------------------------
    console.log('[Test Group 1] Health & Readiness Endpoints');

    const healthRes = await request(app).get('/api/health');
    assert(healthRes.status === 200, 'GET /api/health returns HTTP 200');
    assert(healthRes.body.data.status === 'healthy', 'Health status is "healthy"');

    const readyRes = await request(app).get('/api/health/ready');
    assert(readyRes.status === 200, 'GET /api/health/ready returns HTTP 200');
    assert(readyRes.body.data.checks.database === 'connected', 'Readiness checks database as "connected"');

    // ----------------------------------------------------
    // Test Group 2: User Registration & Validation
    // ----------------------------------------------------
    console.log('\n[Test Group 2] User Registration & Validation');

    // 2.1 Successful student registration
    const studentRegRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Student',
        email: 'alice@studytracker.dev',
        password: 'Password123!',
        role: UserRoles.STUDENT,
        timezone: 'America/New_York',
      });

    assert(studentRegRes.status === 201, 'Student registration returns HTTP 201 Created');
    assert(studentRegRes.body.success === true, 'Response indicates success');
    assert(studentRegRes.body.data.user.role === 'student', 'User role is correctly set to "student"');
    assert(!studentRegRes.body.data.user.passwordHash, 'Password hash is strictly omitted from response');
    assert(typeof studentRegRes.body.data.token === 'string', 'JWT token is returned in response');
    assert(Boolean(studentRegRes.headers['set-cookie']), 'HTTP-only cookie is set in headers');

    const studentToken = studentRegRes.body.data.token;

    // 2.2 Successful mentor registration
    const mentorRegRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dr. Robert Mentor',
        email: 'robert@studytracker.dev',
        password: 'SecurePassword123!',
        role: UserRoles.MENTOR,
        timezone: 'America/Los_Angeles',
      });

    assert(mentorRegRes.status === 201, 'Mentor registration returns HTTP 201 Created');
    assert(mentorRegRes.body.data.user.role === 'mentor', 'User role is correctly set to "mentor"');
    const mentorToken = mentorRegRes.body.data.token;

    // 2.3 Duplicate email registration (must return 409 Conflict)
    const dupRegRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another Alice',
        email: 'alice@studytracker.dev',
        password: 'Password123!',
        role: UserRoles.STUDENT,
      });

    assert(dupRegRes.status === 409, 'Duplicate email registration rejected with HTTP 409 Conflict');
    assert(dupRegRes.body.error.code === 'CONFLICT', 'Error code is "CONFLICT"');

    // 2.4 Invalid email format (must return 400 Bad Request)
    const badEmailRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'not-a-valid-email',
        password: 'Password123!',
        role: UserRoles.STUDENT,
      });

    assert(badEmailRes.status === 400, 'Invalid email rejected with HTTP 400 Bad Request');
    assert(badEmailRes.body.error.code === 'VALIDATION_ERROR', 'Error code is "VALIDATION_ERROR"');

    // 2.5 Weak password (< 8 chars) (must return 400 Bad Request)
    const weakPassRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@studytracker.dev',
        password: 'short',
        role: UserRoles.STUDENT,
      });

    assert(weakPassRes.status === 400, 'Weak password (<8 chars) rejected with HTTP 400 Bad Request');

    // ----------------------------------------------------
    // Test Group 3: User Login
    // ----------------------------------------------------
    console.log('\n[Test Group 3] User Login & Authentication');

    // 3.1 Valid login credentials
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alice@studytracker.dev',
        password: 'Password123!',
      });

    assert(loginRes.status === 200, 'Valid login returns HTTP 200 OK');
    assert(typeof loginRes.body.data.token === 'string', 'Login returns valid JWT token');
    assert(loginRes.body.data.user.email === 'alice@studytracker.dev', 'User email matches');

    // 3.2 Incorrect password
    const wrongPassRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alice@studytracker.dev',
        password: 'WrongPassword999!',
      });

    assert(wrongPassRes.status === 401, 'Incorrect password rejected with HTTP 401 Unauthorized');
    assert(wrongPassRes.body.error.code === 'UNAUTHORIZED', 'Error code is "UNAUTHORIZED"');

    // 3.3 Non-existent email
    const nonExistRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nobody@studytracker.dev',
        password: 'Password123!',
      });

    assert(nonExistRes.status === 401, 'Non-existent email rejected with HTTP 401 Unauthorized');

    // ----------------------------------------------------
    // Test Group 4: Session Restoration (GET /api/auth/me)
    // ----------------------------------------------------
    console.log('\n[Test Group 4] Session Restoration & Token Inspection');

    // 4.1 Valid Bearer token
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${studentToken}`);

    assert(meRes.status === 200, 'GET /api/auth/me with Bearer token returns HTTP 200');
    assert(meRes.body.data.user.email === 'alice@studytracker.dev', 'Session user email is Alice');
    assert(meRes.body.data.user.role === 'student', 'Session user role is student');

    // 4.2 Valid Cookie token
    const cookieRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', [`token=${studentToken}`]);

    assert(cookieRes.status === 200, 'GET /api/auth/me with HTTP-only cookie returns HTTP 200');

    // 4.3 Missing token
    const noTokenRes = await request(app).get('/api/auth/me');
    assert(noTokenRes.status === 401, 'GET /api/auth/me without token rejected with HTTP 401');

    // 4.4 Corrupted/Invalid token
    const badTokenRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.payload');
    assert(badTokenRes.status === 401, 'Corrupted token rejected with HTTP 401 Unauthorized');

    // ----------------------------------------------------
    // Test Group 5: Role-Based Authorization (RBAC)
    // ----------------------------------------------------
    console.log('\n[Test Group 5] Role-Based Access Control (RBAC)');

    // 5.1 Student tries to access mentor-only endpoint -> 403 Forbidden
    const studentBlockedRes = await request(app)
      .get('/api/users/students')
      .set('Authorization', `Bearer ${studentToken}`);

    assert(studentBlockedRes.status === 403, 'Student blocked from mentor-only endpoint with HTTP 403 Forbidden');
    assert(studentBlockedRes.body.error.code === 'FORBIDDEN', 'Error code is "FORBIDDEN"');

    // 5.2 Mentor accesses mentor-only endpoint -> 200 OK
    const mentorAllowedRes = await request(app)
      .get('/api/users/students')
      .set('Authorization', `Bearer ${mentorToken}`);

    assert(mentorAllowedRes.status === 200, 'Mentor allowed to access mentor-only endpoint with HTTP 200 OK');
    assert(Array.isArray(mentorAllowedRes.body.data.students), 'Returns student array');
    assert(mentorAllowedRes.body.data.count >= 1, 'Student roster includes registered students');

    // 5.3 Unauthenticated access to mentor-only endpoint -> 401 Unauthorized
    const unauthRes = await request(app).get('/api/users/students');
    assert(unauthRes.status === 401, 'Unauthenticated access to mentor endpoint returns HTTP 401');

    // ----------------------------------------------------
    // Test Group 6: Logout
    // ----------------------------------------------------
    console.log('\n[Test Group 6] User Logout');

    const logoutRes = await request(app).post('/api/auth/logout');
    assert(logoutRes.status === 200, 'POST /api/auth/logout returns HTTP 200');
    assert(Boolean(logoutRes.headers['set-cookie']), 'Set-cookie header clears the auth cookie');

    // ----------------------------------------------------
    // Test Summary
    // ----------------------------------------------------
    console.log('\n=========================================');
    console.log(` ALL TESTS PASSED: ${testsPassed} passed, ${testsFailed} failed`);
    console.log(' Phase 2 Backend Verification Complete!');
    console.log('=========================================\n');
  } finally {
    await disconnectDB();
  }
};

runAllTests().catch((err) => {
  console.error('\nTest Suite Execution Failed:', err);
  process.exit(1);
});
