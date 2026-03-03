import fetch from 'node-fetch'; // Standard fetch might be available if node 18+

const BASE_URL = 'http://localhost:5001/api';

async function testAutoAssign() {
    console.log('--- TEST AUTO-ASSIGNMENT ---');

    // 1. Create Complaint
    const complaintData = {
        title: 'Panne de Courant Quartier Y',
        description: 'Coupure totale d\'    lectricit    ',
        category: 'electricity',
        subcategory: 'Coupure',
        priority: 'urgent',
        address: 'Avenue Hay Riad',
        city: 'Rabat',
        district: 'Hay Riad',
        location: {
            latitude: 33.97,
            longitude: -6.85
        }
    };

    console.log('sending complaint:', complaintData);

    try {
        const response = await fetch(`${BASE_URL}/complaints`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(complaintData)
        });

        const data: any = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));

        if (data.success && data.data) {
            console.log('\nComplaint Created ID:', data.data._id);
            console.log('Assigned Team:', data.data.assignedTeamId);
            if (data.data.assignedTeamId) {
                console.log('        Auto-assignment SUCCESS');
            } else {
                console.log('       Auto-assignment FAILED (No team assigned)');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testAutoAssign();
