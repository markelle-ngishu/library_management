// User database simulation
const users = [
    {
        id: 1,
        email: "admin@library.com",
        password: "lib123",
        role: "librarian",
        name: "Head Librarian"
    },
    {
        id: 2,
        email: "user@test.com",
        password: "user123",
        role: "user",
        name: "Test User"
    }
];

// Current user
let currentUser = null;

// DOM Elements
const loginModal = document.getElementById('loginModal');
const appContainer = document.getElementById('appContainer');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');

// Show login modal on startup
document.addEventListener('DOMContentLoaded', () => {
    showLoginModal();
    initializeBooks(); // Initialize books when app starts
});

// Login function
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        loginModal.classList.add('hidden');
        appContainer.classList.remove('hidden');
        loadRoleSpecificUI();
    } else {
        alert('Invalid credentials!');
    }
});

// Logout function
logoutBtn.addEventListener('click', () => {
    currentUser = null;
    appContainer.classList.add('hidden');
    showLoginModal();
});

function showLoginModal() {
    loginModal.classList.remove('hidden');
    loginForm.reset();
}

function loadRoleSpecificUI() {
    const userContent = document.getElementById('userContent');
    userContent.innerHTML = '';
    userContent.className = currentUser.role + '-ui';

    if (currentUser.role === 'librarian') {
        loadLibrarianUI();
    } else {
        loadUserUI();
    }
}