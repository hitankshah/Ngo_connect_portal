document.getElementById('registerForm').addEventListener('submit', function (event) {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        event.preventDefault();
        alert("Passwords do not match!");
        return; 
    }

    const passwordStrength = checkPasswordStrength(password);
    if (!passwordStrength) {
        event.preventDefault();
        alert("Password must be at least 8 characters long and contain at least one number and one special character.");
    }
});

function checkPasswordStrength(password) {
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
}
