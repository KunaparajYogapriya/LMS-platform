import pool from './src/config/db.js';
import bcrypt from 'bcrypt';
import fs from 'fs';

const seedDatabase = async () => {
  try {
    console.log('Reading schema...');
    const schema = fs.readFileSync('./database/schema.sql', 'utf8');
    const statements = schema.split(';').filter((stmt) => stmt.trim());

    for (let stmt of statements) {
      await pool.query(stmt);
    }
    console.log('Schema executed.');

    console.log('Clearing existing data...');
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('TRUNCATE TABLE video_progress');
    await pool.query('TRUNCATE TABLE videos');
    await pool.query('TRUNCATE TABLE sections');
    await pool.query('TRUNCATE TABLE subjects');
    await pool.query('TRUNCATE TABLE users');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Seeding users...');
    const passwordHash = await bcrypt.hash('password123', 10);
    const [userResult] = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      ['user@example.com', passwordHash, 'Demo User']
    );
    console.log('Created user: user@example.com / password123');

    console.log('Seeding subjects...');
    const [subj1] = await pool.query(
      'INSERT INTO subjects (title, slug, description, is_published) VALUES (?, ?, ?, ?)',
      ['React for Beginners', 'react-for-beginners', 'Learn the basics of React development.', true]
    );
    const subjectId = subj1.insertId;

    console.log('Seeding sections...');
    const [sec1] = await pool.query(
      'INSERT INTO sections (subject_id, title, order_index) VALUES (?, ?, ?)',
      [subjectId, 'Getting Started', 1]
    );
    const sec1Id = sec1.insertId;

    const [sec2] = await pool.query(
      'INSERT INTO sections (subject_id, title, order_index) VALUES (?, ?, ?)',
      [subjectId, 'Components & Props', 2]
    );
    const sec2Id = sec2.insertId;

    console.log('Seeding videos...');
    await pool.query(
      'INSERT INTO videos (section_id, title, description, youtube_url, order_index, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)',
      [sec1Id, 'Welcome to the Course', 'Introduction to what we will learn.', 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', 1, 120]
    );
    await pool.query(
      'INSERT INTO videos (section_id, title, description, youtube_url, order_index, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)',
      [sec1Id, 'What is React?', 'A brief overview of React.', 'https://www.youtube.com/watch?v=Tn6-PIqc4UM', 2, 450]
    );

    await pool.query(
      'INSERT INTO videos (section_id, title, description, youtube_url, order_index, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)',
      [sec2Id, 'Creating Components', 'How to create your first component.', 'https://www.youtube.com/watch?v=Ke90Tje7VS0', 1, 320]
    );
    await pool.query(
      'INSERT INTO videos (section_id, title, description, youtube_url, order_index, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)',
      [sec2Id, 'Using Props', 'Passing data with props.', 'https://www.youtube.com/watch?v=m7OWXtbiXX8', 2, 500]
    );

    // Course 2: Advanced Next.js
    const [subj2] = await pool.query(
      'INSERT INTO subjects (title, slug, description, is_published) VALUES (?, ?, ?, ?)',
      ['Advanced Next.js Mastery', 'advanced-nextjs', 'Dive deep into Next.js 14 App Router and Server Components.', true]
    );
    const subject2Id = subj2.insertId;

    const [nextSec1] = await pool.query(
      'INSERT INTO sections (subject_id, title, order_index) VALUES (?, ?, ?)',
      [subject2Id, 'App Router Fundamentals', 1]
    );
    const nextSec1Id = nextSec1.insertId;

    await pool.query(
      'INSERT INTO videos (section_id, title, description, youtube_url, order_index, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)',
      [nextSec1Id, 'Routing in Next.js', 'Understanding directory-based routing.', 'https://www.youtube.com/watch?v=ZjAqacIC_3c', 1, 600]
    );
    await pool.query(
      'INSERT INTO videos (section_id, title, description, youtube_url, order_index, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)',
      [nextSec1Id, 'Server vs Client Components', 'When to use what component type and edge cases.', 'https://www.youtube.com/watch?v=ZjAqacIC_3c', 2, 750]
    );

    // Course 3: Mastering Tailwind CSS
    const [subj3] = await pool.query(
      'INSERT INTO subjects (title, slug, description, is_published) VALUES (?, ?, ?, ?)',
      ['Mastering Tailwind CSS', 'tailwind-css', 'Learn how to style modern web apps beautifully and quickly without writing raw CSS.', true]
    );
    const subject3Id = subj3.insertId;

    const [twSec1] = await pool.query(
      'INSERT INTO sections (subject_id, title, order_index) VALUES (?, ?, ?)',
      [subject3Id, 'Getting Started with Tailwind', 1]
    );
    const twSec1Id = twSec1.insertId;

    const [twSec2] = await pool.query(
      'INSERT INTO sections (subject_id, title, order_index) VALUES (?, ?, ?)',
      [subject3Id, 'Responsive Design', 2]
    );
    const twSec2Id = twSec2.insertId;

    await pool.query(
      'INSERT INTO videos (section_id, title, description, youtube_url, order_index, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)',
      [twSec1Id, 'Tailwind Setup & Basics', 'Installing and using utility classes.', 'https://www.youtube.com/watch?v=pfaSUYaSgRo', 1, 400]
    );
    await pool.query(
      'INSERT INTO videos (section_id, title, description, youtube_url, order_index, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)',
      [twSec1Id, 'Flexbox & Grid', 'Layouts made easy.', 'https://www.youtube.com/watch?v=pfaSUYaSgRo', 2, 600]
    );
    await pool.query(
      'INSERT INTO videos (section_id, title, description, youtube_url, order_index, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)',
      [twSec2Id, 'Breakpoints', 'Making apps responsive for all devices.', 'https://www.youtube.com/watch?v=-_X6PhkjpzU', 1, 350]
    );

    // Course 4: Node.js Basics
    const [subjNode] = await pool.query(
      'INSERT INTO subjects (title, slug, description, is_published) VALUES (?, ?, ?, ?)',
      ['Node.js Basics', 'nodejs-basics', 'Learn server-side JavaScript with Node.js.', true]
    );
    const subjNodeId = subjNode.insertId;

    const [nodeSec1] = await pool.query(
      'INSERT INTO sections (subject_id, title, order_index) VALUES (?, ?, ?)',
      [subjNodeId, 'Introduction to Node', 1]
    );
    const nodeSec1Id = nodeSec1.insertId;

    await pool.query(
      'INSERT INTO videos (section_id, title, description, youtube_url, order_index, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)',
      [nodeSec1Id, 'What is Node.js?', 'Understand the runtime environment.', 'https://www.youtube.com/watch?v=Tn6-PIqc4UM', 1, 500]
    );
    await pool.query(
      'INSERT INTO videos (section_id, title, description, youtube_url, order_index, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)',
      [nodeSec1Id, 'Creating a Server', 'Building your first HTTP server.', 'https://www.youtube.com/watch?v=m7OWXtbiXX8', 2, 600]
    );

    // Course 5: Python for Beginners
    const [subjPython] = await pool.query(
      'INSERT INTO subjects (title, slug, description, is_published) VALUES (?, ?, ?, ?)',
      ['Python for Beginners', 'python-beginners', 'Start your programming journey with Python.', true]
    );
    const subjPythonId = subjPython.insertId;

    const [pySec1] = await pool.query(
      'INSERT INTO sections (subject_id, title, order_index) VALUES (?, ?, ?)',
      [subjPythonId, 'Python Basics', 1]
    );
    const pySec1Id = pySec1.insertId;

    await pool.query(
      'INSERT INTO videos (section_id, title, description, youtube_url, order_index, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)',
      [pySec1Id, 'Variables and Data Types', 'Learn about Python data types.', 'https://www.youtube.com/watch?v=Ke90Tje7VS0', 1, 450]
    );

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
