document.getElementById('registerForm').addEventListener('submit', function (event) {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.innerHTML = ""; // Clear previous messages

    if (password !== confirmPassword) {
        event.preventDefault();
        errorContainer.innerHTML += "<p class='error'>Passwords do not match!</p>";
        return; 
    }

    const passwordStrength = checkPasswordStrength(password);
    if (!passwordStrength) {
        event.preventDefault();
        errorContainer.innerHTML += "<p class='error'>Password must be at least 8 characters long and contain at least one number and one special character.</p>";
    }
});

function checkPasswordStrength(password) {
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
}
