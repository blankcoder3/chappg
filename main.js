// Settings object - load from localStorage or use defaults
const settings = {
    theme: localStorage.getItem('theme') || 'dark',
    fontSize: parseInt(localStorage.getItem('fontSize')) || 18,
    fontFamily: localStorage.getItem('fontFamily') || 'Georgia, serif',
    lineHeight: parseFloat(localStorage.getItem('lineHeight')) || 1.8,
    speechRate: parseFloat(localStorage.getItem('speechRate')) || 1,
    voiceIndex: parseInt(localStorage.getItem('voiceIndex')) || 0,
    currentChapter: parseInt(localStorage.getItem('currentChapter')) || 1
};

let isPlaying = false;
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;
let availableVoices = [];

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('theme', settings.theme);
    localStorage.setItem('fontSize', settings.fontSize);
    localStorage.setItem('fontFamily', settings.fontFamily);
    localStorage.setItem('lineHeight', settings.lineHeight);
    localStorage.setItem('speechRate', settings.speechRate);
    localStorage.setItem('voiceIndex', settings.voiceIndex);
    localStorage.setItem('currentChapter', settings.currentChapter);
}

// Load voices
function loadVoices() {
    availableVoices = speechSynthesis.getVoices();
    const voiceSelect = document.getElementById('voiceSelect');
    voiceSelect.innerHTML = '';
    availableVoices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
    // Set saved voice
    voiceSelect.value = settings.voiceIndex;
}

speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

// Toggle Settings
function toggleSettings() {
    const nav = document.getElementById('bottomNav');
    nav.classList.toggle('expanded');
}

// Update Functions (modified to save)
function updateFontSize(value) {
    settings.fontSize = value;
    document.querySelector('.chapter-content').style.fontSize = value + 'px';
    document.getElementById('fontSizeValue').textContent = value + 'px';
    saveSettings();
}

function updateFontFamily(value) {
    settings.fontFamily = value;
    document.querySelector('.chapter-content').style.fontFamily = value;
    saveSettings();
}

function updateLineHeight(value) {
    settings.lineHeight = value;
    document.querySelector('.chapter-content').style.lineHeight = value;
    document.getElementById('lineHeightValue').textContent = value;
    saveSettings();
}

function updateSpeechRate(value) {
    settings.speechRate = value;
    document.getElementById('speechRateValue').textContent = value + 'x';
    saveSettings();
}

function updateVoice(value) {
    settings.voiceIndex = value;
    saveSettings();
}

// Theme Functions (modified to save)
const themes = ['dark', 'sepia', 'night', 'ocean', 'forest', 'light', 'lavender', 'mint', 'rose', 'autumn', 'midnight', 'sand', 'charcoal', 'ivory', 'slate', 'peach'];        
let currentThemeIndex = themes.indexOf(settings.theme);

function cycleTheme() {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const theme = themes[currentThemeIndex];
    settings.theme = theme;
    document.body.className = theme;
    saveSettings();
}

// Modal Functions
function openChapterIndex() {
    document.getElementById('chapterModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Chapter Navigation (modified to save)
function goToChapter(chapterNum) {
    settings.currentChapter = chapterNum;
    saveSettings();
    
    document.querySelectorAll('.chapter-item').forEach((item, index) => {
        item.classList.toggle('current', index + 1 === chapterNum);
    });
    
    document.getElementById('chapterTitle').textContent = `Chapter ${chapterNum}`;
    closeModal('chapterModal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (isPlaying) {
        stopSpeech();
    }
}

function nextChapter() {
    if (settings.currentChapter < 5) {
        goToChapter(settings.currentChapter + 1);
    }
}

function previousChapter() {
    if (settings.currentChapter > 1) {
        goToChapter(settings.currentChapter - 1);
    }
}

// Text-to-Speech
function togglePlay() {
    if (isPlaying) {
        stopSpeech();
    } else {
        startSpeech();
    }
}

function startSpeech() {
    const text = document.getElementById('chapterContent').textContent;
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.rate = settings.speechRate;
    currentUtterance.voice = availableVoices[settings.voiceIndex];
    
    currentUtterance.onend = () => {
        isPlaying = false;
        document.getElementById('playIcon').style.display = 'block';
        document.getElementById('pauseIcon').style.display = 'none';
    };
    
    speechSynthesis.speak(currentUtterance);
    isPlaying = true;
    document.getElementById('playIcon').style.display = 'none';
    document.getElementById('pauseIcon').style.display = 'block';
}

function stopSpeech() {
    speechSynthesis.cancel();
    isPlaying = false;
    document.getElementById('playIcon').style.display = 'block';
    document.getElementById('pauseIcon').style.display = 'none';
}

// Close modals on outside click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});

// Close expanded menu when clicking outside
document.addEventListener('click', (e) => {
    const nav = document.getElementById('bottomNav');
    if (nav.classList.contains('expanded') && !nav.contains(e.target)) {
        nav.classList.remove('expanded');
    }
});

// Apply saved settings on load
window.onload = function() {
    // Apply theme
    document.body.className = settings.theme;
    
    // Apply all settings
    updateFontSize(settings.fontSize);
    updateFontFamily(settings.fontFamily);
    updateLineHeight(settings.lineHeight);
    
    // Set control values
    document.getElementById('fontSize').value = settings.fontSize;
    document.getElementById('fontFamily').value = settings.fontFamily;
    document.getElementById('lineHeight').value = settings.lineHeight;
    document.getElementById('speechRate').value = settings.speechRate;
    document.getElementById('voiceSelect').value = settings.voiceIndex;
    
    // Load saved chapter
    goToChapter(settings.currentChapter);
};
