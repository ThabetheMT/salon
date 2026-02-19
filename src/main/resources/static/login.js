
const form = document.getElementById('login-form');
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    //submit form
    fetch('http://localhost:6060/api/login' , {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            password: password,
        })
    }
).then((response) => {
    if (response.ok) {
        return response.json();
    } else {
        throw new Error('Error logging in');
    }
    }).then((data) => {
        console.log(data)
        alert(data.message);
        window.location.href = 'user-dashboard.html';
    }).catch((error) => {
        console.log(error)
        alert(error);
    })
})