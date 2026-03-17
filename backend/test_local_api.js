import axios from 'axios';

const run = async () => {
    try {
        console.log("Testing login...");
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'user@example.com',
            password: 'password'
        });
        console.log("Login Success:", res.data);
    } catch (err) {
        console.error("Login Failed:", err.response?.data || err.message);
    }
    
    try {
        console.log("Testing registration...");
        const res = await axios.post('http://localhost:5000/api/auth/register', {
            email: 'newuser@example.com',
            password: 'password',
            name: 'New User'
        });
        console.log("Registration Success:", res.data);
    } catch (err) {
        console.error("Registration Failed:", err.response?.data || err.message);
    }
};

run();
