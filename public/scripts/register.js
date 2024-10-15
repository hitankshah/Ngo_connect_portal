document.getElementById('registerForm').addEventListener('submit', function (event) {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.innerHTML = ""; // Clear previous messages

    // Check if passwords match
    if (password !== confirmPassword) {
        event.preventDefault();  // Stop form submission
        displayError("Passwords do not match!");
        return; // Exit function to prevent further checks
    }

    // Check password strength
    const passwordStrength = checkPasswordStrength(password);
    if (!passwordStrength) {
        event.preventDefault();  // Stop form submission
        displayError("Password must be at least 8 characters long and contain at least one number and one special character.");
        return; // Prevent form submission
    }

    // If the form is valid, redirect to login.html
    window.location.href = 'login.html';

    // Function to display errors
    function displayError(message) {
        const errorElement = document.createElement("p");
        errorElement.classList.add('error');
        errorElement.innerText = message;
        errorContainer.appendChild(errorElement);
    }
});

// Password strength validation function
function checkPasswordStrength(password) {
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
}
