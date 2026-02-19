
const form = document.getElementById('signup-form');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    //console.log("Signup form clicked");

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const phone = document.getElementById('phone').value;
    const firstName = document.getElementById('firstname').value;
    const lastName = document.getElementById('lastname').value;

    //validate form data
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    //send data to controller
    fetch('http://localhost:6060/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            password: password,
            phone: phone,
            firstName: firstName,
            lastName: lastName,
        })
    }).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Error signing up');
        }
    }).then((data) => {
        console.log(data)
        alert(data.message);
        window.location.href = 'login.html';
    }).catch((error) => {
        console.log('error ', error)
    })
})
//079
