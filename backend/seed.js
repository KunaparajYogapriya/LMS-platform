import pool from './src/config/db.js';
import bcrypt from 'bcrypt';
import fs from 'fs';

const seedDatabase = async () => {
  try {
    console.log('Reading schema...');
    const schema = fs.readFileSync('./database/schema.sql', 'utf8');
    const statements = schema.split(';').filter((stmt) => stmt.trim());

    for (let stmt of statements) {
      if (stmt.trim()) {
        await pool.query(stmt);
      }
    }
    console.log('Schema executed.');

    console.log('Clearing data...');
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('TRUNCATE TABLE video_progress');
    await pool.query('TRUNCATE TABLE videos');
    await pool.query('TRUNCATE TABLE sections');
    await pool.query('TRUNCATE TABLE enrollments');
    await pool.query('TRUNCATE TABLE subjects');
    await pool.query('TRUNCATE TABLE users');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Seeding user...');
    const passwordHash = await bcrypt.hash('password123', 10);
    await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      ['user@example.com', passwordHash, 'Demo Student']
    );

    const insertCourse = async (title, slug, description, category, thumbnailUrl) => {
      const [result] = await pool.query(
        'INSERT INTO subjects (title, slug, description, category, thumbnail_url, is_published) VALUES (?, ?, ?, ?, ?, ?)',
        [title, slug, description, category, thumbnailUrl, true]
      );
      return result.insertId;
    };

    const insertSection = async (subjectId, title, order) => {
      const [result] = await pool.query(
        'INSERT INTO sections (subject_id, title, order_index) VALUES (?, ?, ?)',
        [subjectId, title, order]
      );
      return result.insertId;
    };

    const insertVideo = async (sectionId, title, desc, url, order, duration) => {
      await pool.query(
        'INSERT INTO videos (section_id, title, description, youtube_url, order_index, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)',
        [sectionId, title, desc, url, order, duration]
      );
    };

    console.log('Seeding Verified Videos...');
    
    const javaId = await insertCourse('Java Tutorial for Beginners', 'java-fcc', 'Complete Masterclass for Java.', 'Software Engineering', 'https://img.youtube.com/vi/BGTx91t8q50/maxresdefault.jpg');
    const javaSec1 = await insertSection(javaId, 'Fundamentals', 1);
    await insertVideo(javaSec1, 'Java Programming - Full Course', 'Introduction to Java.', 'BGTx91t8q50', 1, 3600);

    const osId = await insertCourse('Operating Systems mastery', 'os-mastery', 'CS fundamentals of Operating Systems.', 'Computer Science', 'https://img.youtube.com/vi/mXw9ruZaxzQ/maxresdefault.jpg');
    const osSec1 = await insertSection(osId, 'OS Structures', 1);
    await insertVideo(osSec1, 'Operating System Full Course', 'Architectural overview.', 'mXw9ruZaxzQ', 1, 1300);

    const cId = await insertCourse('C Programming (Full Guide)', 'c-guide', 'Master C from scratch.', 'Computer Science', 'https://img.youtube.com/vi/KJgsSFOSQv0/maxresdefault.jpg');
    const cSec1 = await insertSection(cId, 'Basics', 1);
    await insertVideo(cSec1, 'C Programming Full Course', 'Data types and constants.', 'KJgsSFOSQv0', 1, 900);

    const jsId = await insertCourse('JavaScript Crash Course', 'js-crash', 'Classic JS fundamentals.', 'Web Development', 'https://img.youtube.com/vi/jS4aFq5-91M/maxresdefault.jpg');
    const jsSec1 = await insertSection(jsId, 'JS Basics', 1);
    await insertVideo(jsSec1, 'JavaScript Full Course', 'DOM and Basics.', 'jS4aFq5-91M', 1, 3600);

    const reactId = await insertCourse('React for Beginners', 'react-fcc', 'Modern React 18+.', 'Web Development', 'https://img.youtube.com/vi/bMknfKXIFA8/maxresdefault.jpg');
    const reactSec1 = await insertSection(reactId, 'Getting Started', 1);
    await insertVideo(reactSec1, 'React JS Full Course', 'Framework intro.', 'bMknfKXIFA8', 1, 3600);

    const htmlId = await insertCourse('HTML & CSS Full Course', 'html-css', 'Complete Guide to Web Design.', 'Web Development', 'https://img.youtube.com/vi/mU6anWqZJcc/maxresdefault.jpg');
    const htmlSec1 = await insertSection(htmlId, 'Web Essentials', 1);
    await insertVideo(htmlSec1, 'HTML & CSS Full Course - Beginner to Pro', 'Build websites.', 'mU6anWqZJcc', 1, 3600);

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
