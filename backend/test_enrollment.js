import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
});

async function test() {
  try {
    // 1. Login
    const loginRes = await api.post('/auth/login', {
      email: 'user@example.com',
      password: 'password123'
    });
    const token = loginRes.data.accessToken;
    const userId = loginRes.data.user.id;
    console.log('Logged in, userId:', userId);

    // 2. Get subjects
    const subjectsRes = await api.get('/subjects', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const subjects = subjectsRes.data;
    console.log('Total subjects:', subjects.length);
    const firstSub = subjects[0];
    console.log('First subject:', firstSub.title, 'isEnrolled:', firstSub.isEnrolled);

    // 3. Enroll in first subject
    console.log('Enrolling in:', firstSub.title);
    await api.post(`/subjects/${firstSub.id}/enroll`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // 4. Get subjects again
    const subjectsRes2 = await api.get('/subjects', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const enrolledSub = subjectsRes2.data.find(s => s.id === firstSub.id);
    console.log('After enrollment, isEnrolled:', enrolledSub.isEnrolled);

  } catch (err) {
    console.error('Test failed:', err.response?.data || err.message);
  }
}

test();
