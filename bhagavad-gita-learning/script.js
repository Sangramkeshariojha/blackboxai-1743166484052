// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const searchInput = document.querySelector('input[type="text"]');
const chaptersContainer = document.querySelector('.grid');
const authButton = document.getElementById('auth-button');
const authModal = document.getElementById('auth-modal');
const closeAuth = document.getElementById('close-auth');
const loginForm = document.getElementById('login-form');

// Auth functionality
authButton.addEventListener('click', () => {
  authModal.classList.remove('hidden');
});

closeAuth.addEventListener('click', () => {
  authModal.classList.add('hidden');
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      authModal.classList.add('hidden');
      updateAuthUI(true);
    } else {
      alert(data.error || 'Login failed');
    }
  } catch (err) {
    console.error('Login error:', err);
    alert('Login failed. Please try again.');
  }
});

function updateAuthUI(isLoggedIn) {
  if (isLoggedIn) {
    authButton.innerHTML = '<i class="fas fa-user-check"></i>';
    authButton.classList.add('bg-green-100', 'dark:bg-green-900');
  } else {
    authButton.innerHTML = '<i class="fas fa-user"></i>';
    authButton.classList.remove('bg-green-100', 'dark:bg-green-900');
  }
}

function checkAuthState() {
  const token = localStorage.getItem('token');
  if (token) {
    updateAuthUI(true);
  }
}

// Load Gita data
let gitaData = [];

fetch('data/gita.json')
    .then(response => response.json())
    .then(data => {
        gitaData = data.chapters;
        renderChapters();
    })
    .catch(error => {
        console.error('Error loading Gita data:', error);
        // Fallback to sample data if JSON fails to load
        gitaData = [
            {
                id: 1,
                title: "Arjuna Vishada Yoga",
                description: "The Yoga of Arjuna's Dejection",
                verses: [{"verse_number": "1.1", "sanskrit": "धृतराष्ट्र उवाच...", "english": "Dhritarashtra said:O Sanjay, after gathering on the holy field of Kurukshetra, and desiring to fight, what did my sons and the sons of Pandu do?"}],
                color: "bg-amber-500"
            },
            {
                id: 2,
                title: "Sankhya Yoga",
                description: "The Yoga of Knowledge", 
                verses: [{verse_number: "2.1"}],
                color: "bg-amber-600"
            },
            {
                id: 3,
                title: "Karm Yog",
                description: "The Yog of Action", 
                verses: [{verse_number: "3.1"}],
                color: "bg-amber-600"
            }
        ];
        renderChapters();
    });

// Theme Toggle Functionality
themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
    updateThemeIcon();
});

// Check for saved theme preference
if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.classList.add('dark');
}
updateThemeIcon();

function updateThemeIcon() {
    const icon = themeToggle.querySelector('i');
    if (document.documentElement.classList.contains('dark')) {
        icon.classList.replace('fa-moon', 'fa-sun');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
    }
}

// Render Chapter Cards
function renderChapters() {
    chaptersContainer.innerHTML = gitaData.map(chapter => `
        <div class="chapter-card">
            <div class="chapter-card__header ${chapter.color}">
                <h3 class="text-xl font-bold">Chapter ${chapter.id}</h3>
                <p class="text-sm opacity-90">${chapter.title}</p>
            </div>
            <div class="chapter-card__body">
                <p class="mb-2">${chapter.description}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">${chapter.verses.length} verses</p>
                <a href="chapter.html?id=${chapter.id}" class="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors inline-block">
                    Study Chapter
                </a>
            </div>
        </div>
    `).join('');
}

// Initialize the page
checkAuthState();
renderChapters();

// Search Functionality (will be implemented after JSON data is loaded)
searchInput.addEventListener('input', (e) => {
    console.log('Search term:', e.target.value);
    // Will implement actual search after data loading
});

// TODO: Add functionality for:
// 1. Loading actual JSON data
// 2. Chapter page navigation
// 3. Verse display and search
// 4. Bookmarking system
// 5. User authentication