const run = async () => {
    try {
        console.log("Testing login on 5001 with native fetch...");
        const res = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'user@example.com',
                password: 'password123'
            })
        });
        const data = await res.json();
        if (res.ok) {
            console.log("SUCCESS! Login Data:", data);
        } else {
            console.error("FAIL! Error:", data);
        }
    } catch (err) {
        console.error("FAIL! Fetch error:", err.message);
    }
};

run();
