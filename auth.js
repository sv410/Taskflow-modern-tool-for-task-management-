const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on login or signup page
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // Handle Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = loginForm.querySelector('button');
            const originalText = btn.textContent;

            try {
                btn.textContent = 'Signing In...';
                btn.disabled = true;

                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = 'dashboard.html';
                } else {
                    alert(data.error || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('An error occurred. Please try again.');
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
    }

    // Handle Signup
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const btn = signupForm.querySelector('button');
            const originalText = btn.textContent;

            try {
                btn.textContent = 'Creating Account...';
                btn.disabled = true;

                const response = await fetch(`${API_URL}/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, phone, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('user', JSON.stringify(data.user)); // Store user info (including id, name, phone)
                    window.location.href = 'dashboard.html';
                } else {
                    alert(data.error || 'Signup failed');
                }
            } catch (error) {
                console.error('Signup error:', error);
                alert('An error occurred. Please try again.');
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
    }
});
