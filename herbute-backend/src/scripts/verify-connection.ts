
import axios from 'axios';

const testLogin = async () => {
    console.log('Testing connection to http://localhost:5001/api/auth/login...');
    try {
        const response = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'admin@reclamtrack.com',
            password: 'Admin123!'
        });
        console.log('âœ… Login Success! Status:', response.status);
        console.log('Token:', response.data.token ? 'Present' : 'Missing');
    } catch (error: any) {
        if (error.response) {
            console.log('âŒ Server responded with error:', error.response.status);
            console.log('Data:', error.response.data);
        } else if (error.request) {
            console.log('âŒ No response received. Is the server running?');
            console.log('Error:', error.message);
        } else {
            console.log('âŒ Error setting up request:', error.message);
        }
    }
};

testLogin();
