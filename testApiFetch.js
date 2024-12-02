const testApi = async () => {
    try {
        // POST request to add a new user
        const postResponse = await fetch('http://localhost:5000/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: '0x687654321abcdef' }),  // New wallet address
        });

        if (!postResponse.ok) {
            const errorText = await postResponse.text();
            console.error('POST Request Failed:', errorText);
            return;
        }

        const postData = await postResponse.json();
        console.log('POST Response:', postData);  // New user data returned from the server

        // GET request to fetch the user by wallet address
        const getResponse = await fetch(`http://localhost:5000/api/users/${postData.walletAddress}`);
        
        if (!getResponse.ok) {
            const errorText = await getResponse.text();
            console.error('GET Request Failed:', errorText);
            return;
        }

        const getData = await getResponse.json();
        console.log('GET Response:', getData);  // Retrieved user data based on wallet address
    } catch (error) {
        console.error('Error:', error);
    }
};

testApi();
