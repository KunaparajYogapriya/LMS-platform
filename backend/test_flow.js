async function runTest() {
  const baseURL = 'http://localhost:5001/api';
  
  try {
    console.log('--- TEST START (Using Fetch) ---');
    
    // 1. Login
    console.log('1. Attempting login as user@example.com...');
    const loginRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com', password: 'password123' })
    });
    
    if (!loginRes.ok) throw new Error('Login failed: ' + await loginRes.text());
    
    const loginData = await loginRes.json();
    const token = loginData.accessToken;
    const userId = loginData.user.id;
    console.log(`   Login successful. userId: ${userId}`);

    // 2. Fetch Subjects
    console.log('2. Fetching subjects list...');
    const subjectsRes = await fetch(`${baseURL}/subjects`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!subjectsRes.ok) throw new Error('Fetch subjects failed: ' + await subjectsRes.text());
    
    const subjects = await subjectsRes.json();
    const target = subjects[0];
    console.log(`   Target: ID=${target.id}, Title="${target.title}", isEnrolled=${target.isEnrolled}`);

    // 3. Enroll (Force true)
    console.log(`3. Enrolling in subject ID=${target.id}...`);
    const enrollRes = await fetch(`${baseURL}/subjects/${target.id}/enroll`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   Enroll response status:`, enrollRes.status);
    console.log(`   Enroll response:`, await enrollRes.text());

    // 4. Verify
    console.log('4. Verifying in new fetch...');
    const verifyRes = await fetch(`${baseURL}/subjects`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const updatedSubjects = await verifyRes.json();
    const updatedTarget = updatedSubjects.find(s => s.id === target.id);
    console.log(`   Status after: isEnrolled=${updatedTarget.isEnrolled}`);

    if (updatedTarget.isEnrolled === true) {
      console.log('--- TEST PASSED: Status is now true ---');
    } else {
      console.error('--- TEST FAILED: Status is still false ---');
    }

  } catch (err) {
    console.error('--- TEST ERROR ---');
    console.error(err.message);
  }
}

runTest();
