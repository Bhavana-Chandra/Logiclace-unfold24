let loginToken = '';
let profile = {};

function setLoginToken(token) {
    loginToken = token;
}

function getLoginToken() {
    return loginToken
}

function setProfile(profile) {
    profile = profile;
}

function getProfile() {
    return profile
}

// Function to initiate the MetaMask login process
async function loginWithMetaMask() {
    try {
        // Check if MetaMask is installed and connected
        if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const address = accounts[0];

            const greeting = "You are about to login to a really cool site.";
            const nonce = generateRandomHexNonce(16);
            const message = `Login: ${greeting}\nNonce: ${nonce}`;

            // Sign the message with MetaMask
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [message, address],
            });

            // Send the Ethereum address and signature to the server
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ address, signature, message }),
            });

            if (response.ok) {
                const data = await response.json();
                const { token, profile } = data;
                setLoginToken(token);
                setProfile(profile);

                if (!profile) {
                    showProfileUI();
                } else {
                    hideProfileUI();
                    document.getElementById("loginResponse").innerHTML = `Welcome: ${profile.firstName} ${profile.lastName}<br />Address: ${profile.address}`;
                }

                // Fetch the wallet balance
                const web3 = new Web3(window.ethereum); // Initialize web3 instance
                const balanceWei = await web3.eth.getBalance(address); // Get balance in Wei
                const balanceEth = web3.utils.fromWei(balanceWei, 'ether'); // Convert to Ether

                // Display the balance on the dashboard
                document.getElementById("walletBalance").innerText = `Wallet Balance: ${balanceEth} ETH`;

            } else {
                document.getElementById("loginResponse").innerText = "Login failed. Please try again.";
            }
        } else {
            document.getElementById("loginResponse").innerText = "MetaMask is not installed or not connected.";
        }
    } catch (error) {
        console.error(error);
        alert('An error occurred while logging in with MetaMask.');
    }
}


function generateRandomHexNonce(length) {
    if (typeof length !== 'number' || length <= 0) {
        throw new Error('Invalid length for nonce');
    }

    // Calculate the number of bytes needed for the desired hex length
    const numBytes = Math.ceil(length / 2);

    // Generate random bytes
    const randomBytes = new Uint8Array(numBytes);
    window.crypto.getRandomValues(randomBytes);

    // Convert random bytes to a hex string
    let hexNonce = '';
    for (let i = 0; i < numBytes; i++) {
        hexNonce += ('00' + randomBytes[i].toString(16)).slice(-2);
    }

    // Trim to the desired length
    hexNonce = hexNonce.slice(0, length);

    return '0x' + hexNonce;
}

function readOnlyProfileUI() {
    // After saving the data, make the textboxes readonly and grayed out
    document.getElementById('firstName').readOnly = true;
    document.getElementById('firstName').classList.add('readonly');

    document.getElementById('lastName').readOnly = true;
    document.getElementById('lastName').classList.add('readonly');

    document.getElementById('email').readOnly = true;
    document.getElementById('email').classList.add('readonly');
}

async function processProfileData() {
    // Access form data
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
    };

    const apiUrl = '/profile';

    try {
        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${getLoginToken()}`,
            },
            body: JSON.stringify(formData),
        });

        if (!res.ok) {
            // If response status is not OK (e.g., 404, 500), handle it
            const text = await res.text(); // Attempt to read as plain text
            console.error('Server response:', text);

            document.getElementById("postResponse").innerText = 
                `Error: ${res.status} ${res.statusText}`;
            return;
        }

        // If response is OK, parse JSON
        const data = await res.json();
        console.log('Server response JSON:', data);

        readOnlyProfileUI(); // Make the fields readonly after submission

        if (res.status === 200) {
            document.getElementById("postResponse").innerText = "Profile Saved";
            window.location.href = 'home.html'; // Redirect to homepage
        } else if (res.status === 201) {
            document.getElementById("postResponse").innerText = "Profile Already Exists";
        }
    } catch (error) {
        console.error('Error in processProfileData:', error);
        document.getElementById("postResponse").innerText = 
            `Error: ${error.message}`;
    }
}



function showProfileUI() {
    // Get the div element by its ID
    const profileDiv = document.getElementById('profile');

    // Change the display style to 'block' to make it visible
    profileDiv.style.display = 'block';
}

function hideProfileUI() {
    // Get the div element by its ID
    const profileDiv = document.getElementById('profile');

    // Change the display style to 'block' to make it visible
    profileDiv.style.display = 'none';
}
