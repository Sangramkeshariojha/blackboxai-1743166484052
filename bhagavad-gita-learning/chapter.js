// Navigation controls
const prevBtn = document.getElementById('prev-chapter');
const nextBtn = document.getElementById('next-chapter');

prevBtn.addEventListener('click', () => {
  window.location.href = `chapter.html?id=${chapterId - 1}`;
});

nextBtn.addEventListener('click', () => {
  window.location.href = `chapter.html?id=${chapterId + 1}`;
});

// Update button states
if (chapterId <= 1) prevBtn.disabled = true;
if (chapterId >= 18) nextBtn.disabled = true;

// Get chapter ID from URL
const urlParams = new URLSearchParams(window.location.search);
const chapterId = parseInt(urlParams.get('id')) || 1;

// DOM Elements with null checks
const chapterTitle = document.getElementById('chapter-title');
const chapterDescription = document.getElementById('chapter-description'); 
const chapterCommentary = document.getElementById('chapter-commentary');
const versesContainer = document.getElementById('verses-container');

if (!chapterTitle || !chapterDescription || !chapterCommentary || !versesContainer) {
    console.error('Critical DOM elements missing! Found:', {
        chapterTitle,
        chapterDescription,
        chapterCommentary,
        versesContainer
    });
    throw new Error('Required DOM elements not found');
}

// Debugging chapter page load
console.log('Initializing chapter page...');
console.log('Current URL:', window.location.href);
console.log('Extracted chapter ID:', chapterId);

// Load chapter data
fetch('/api/chapters')
    .then(response => {
        console.log('API response status:', response.status);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Received chapters data:', data);
        if (!data.chapters) {
            throw new Error('Invalid data format: missing chapters array');
        }
        
        const chapter = data.chapters.find(c => c.id === chapterId);
        if (!chapter) {
            console.error('Chapter not found, redirecting...');
            return window.location.href = 'index.html';
        }
        
        console.log('Rendering chapter:', chapter);
        if (chapter) {
            renderChapter(chapter);
        } else {
            // Redirect to home if chapter not found
            window.location.href = 'index.html';
        }
    })
    .catch(error => {
        console.error('Error loading chapter data:', error);
        const errorHtml = `
            <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                <p class="font-bold">Error loading chapter content</p>
                <p>${error.message}</p>
                <p>Please try again later or <a href="index.html" class="text-blue-600 hover:underline">return home</a>.</p>
            </div>
        `;
        if (versesContainer) {
            versesContainer.innerHTML = errorHtml;
        } else {
            document.body.innerHTML = errorHtml;
        }
    });

// Render chapter content
function renderChapter(chapter) {
    // Set chapter info
    chapterTitle.textContent = `Chapter ${chapter.id}: ${chapter.title}`;
    chapterDescription.textContent = chapter.description;
    
    // Display full chapter content if available
    if (chapter) {
        // Render chapter header
        chapterTitle.innerHTML = `Chapter ${chapter.id}: <span class="${chapter.color || 'text-amber-600'}">${chapter.title}</span>`;
        chapterDescription.innerHTML = `<em>${chapter.description}</em>`;
        
        // Render commentary section
        chapterCommentary.innerHTML = `
            <div class="prose max-w-none">
                <h3 class="text-xl font-bold mb-4 text-amber-700">Chapter Overview</h3>
                <p class="mb-6 p-4 bg-amber-50 rounded-lg">${chapter.commentary}</p>
                ${chapter.full_chapter_content ? `
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    ${chapter.full_chapter_content.replace(/\n/g, '<br>')}
                </div>
                ` : ''}
            </div>
        `;
        
        // Render verses
        if (chapter.verses && chapter.verses.length > 0) {
            versesContainer.innerHTML = chapter.verses.map(verse => `
                <div class="verse-card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <div class="flex justify-between items-start mb-4">
                        <span class="verse-number bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100 px-3 py-1 rounded-full text-sm font-medium">
                            Verse ${verse.verse_number}
                        </span>
                    </div>
                    <div class="verse-content space-y-4">
                        <div class="sanskrit-verse">
                            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Sanskrit</h3>
                            <p class="text-lg font-serif">${verse.sanskrit}</p>
                        </div>
                        <div class="transliteration">
                            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Transliteration</h3>
                            <p class="italic">${verse.transliteration}</p>
                        </div>
                        <div class="translation">
                            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">English Translation</h3>
                            <p>${verse.english}</p>
                        </div>
                        <div class="hindi-translation">
                            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Hindi Translation</h3>
                            <p>${verse.hindi}</p>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } else {
        chapterCommentary.textContent = chapter.commentary || '';
    }


    // Add event listeners to bookmark buttons
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.innerHTML = this.innerHTML.includes('far') 
                ? '<i class="fas fa-bookmark text-amber-500"></i>' 
                : '<i class="far fa-bookmark"></i>';
        });
    });
}

// Theme Toggle Functionality (same as in script.js)
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
        updateThemeIcon();
    });

    function updateThemeIcon() {
        const icon = themeToggle.querySelector('i');
        if (document.documentElement.classList.contains('dark')) {
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    }

    // Check for saved theme preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.classList.add('dark');
    }
    updateThemeIcon();
}

// Test Functionality
const testSection = document.getElementById('test-section');
const testQuestions = document.getElementById('test-questions');
const submitTest = document.getElementById('submit-test');
const testResults = document.getElementById('test-results');

if (testSection && testQuestions && submitTest && testResults) {
    // Load test questions when chapter loads
    loadTestQuestions();

    // Handle test submission
    submitTest.addEventListener('click', async () => {
        const answers = [];
        document.querySelectorAll('.test-question').forEach((q, i) => {
            const selected = q.querySelector('input[type="radio"]:checked');
            answers.push(selected ? parseInt(selected.value) : null);
        });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/tests/${chapterId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ answers })
            });
            
            const result = await response.json();
            showTestResults(result);
        } catch (err) {
            console.error('Error submitting test:', err);
            alert('Error submitting test. Please try again.');
        }
    });
}

async function loadTestQuestions() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/tests/${chapterId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const testData = await response.json();
        
        if (testData.questions?.length > 0) {
            renderTestQuestions(testData.questions);
            testSection.classList.remove('hidden');
        }
    } catch (err) {
        console.error('Error loading test:', err);
    }
}

function renderTestQuestions(questions) {
    testQuestions.innerHTML = questions.map((q, i) => `
        <div class="test-question">
            <h3 class="font-bold mb-2">${i+1}. ${q.text}</h3>
            <div class="space-y-2">
                ${q.options.map((opt, j) => `
                    <label class="test-option">
                        <input type="radio" name="q${i}" value="${j}">
                        ${opt}
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function showTestResults(result) {
    testResults.classList.remove('hidden');
    testResults.innerHTML = `
        <h3 class="font-bold mb-2">Test Results</h3>
        <p>Score: ${result.score}/${result.total}</p>
        <p>Percentage: ${Math.round((result.score/result.total)*100)}%</p>
    `;
    testResults.classList.add(result.score === result.total ? 'correct' : 'incorrect');
}
