// Simplified RSVP Variables - No guest database needed
let currentWedding = '';
let currentPersonIndex = 0;
let allRsvpResponses = []; // Store all people's responses
let currentPersonResponse = {}; // Current person being processed

// Dashboard data storage
let dashboardData = {
    english: {
        responses: [],
        attending: 0,
        declined: 0,
        meals: {
            starter1: 0,
            starter2: 0,
            main3: 0,
            main4: 0
        },
        dietary: []
    },
    indian: {
        responses: [],
        attending: 0,
        declined: 0,
        dietary: []
    }
};

// Dashboard Password Protection
function checkDashboardPassword() {
    const password = document.getElementById('dashboardPasswordInput').value;
    const correctPassword = 'ElmoreCourt04!';
    
    if (password === correctPassword) {
        document.getElementById('dashboardPasswordScreen').style.display = 'none';
        document.getElementById('dashboardPage').classList.add('active');
        document.getElementById('weddingSelector').style.display = 'none';
        sessionStorage.setItem('dashboardAccess', 'true');
        refreshDashboard();
    } else {
        document.getElementById('dashboardPasswordError').style.display = 'block';
        document.getElementById('dashboardPasswordInput').value = '';
    }
}

// Allow Enter key for dashboard password
document.addEventListener('DOMContentLoaded', function() {
    const dashboardPasswordInput = document.getElementById('dashboardPasswordInput');
    if (dashboardPasswordInput) {
        dashboardPasswordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkDashboardPassword();
            }
        });
    }
});

// FIXED: Updated window load event with proper URL handling
window.addEventListener('load', function() {
    console.log('Page loaded - checking access...');
    
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    const path = window.location.pathname;
    const fullURL = window.location.href;
    
    console.log('Redirect param:', redirect);
    console.log('Path:', path);
    console.log('Full URL:', fullURL);
    
    // Handle direct wedding page access via 404 redirect
    if (redirect === '1stMay2026') {
        console.log('Showing English wedding directly via redirect');
        showWedding('english');
        // Clean up URL
        window.history.replaceState({}, '', '/1stMay2026');
    } else if (redirect === '10thMay2026') {
        console.log('Showing Indian wedding directly via redirect');
        showWedding('indian');
        // Clean up URL
        window.history.replaceState({}, '', '/10thMay2026');
    } else if (redirect === 'dashboard') {
        console.log('Showing dashboard password screen');
        document.getElementById('dashboardPasswordScreen').style.display = 'flex';
        document.getElementById('weddingSelector').style.display = 'none';
        // Clean up URL
        window.history.replaceState({}, '', '/dashboard');
    } else if (path === '/1stMay2026' || fullURL.includes('1stMay2026')) {
        console.log('Showing English wedding directly via path');
        showWedding('english');
    } else if (path === '/10thMay2026' || fullURL.includes('10thMay2026')) {
        console.log('Showing Indian wedding directly via path');
        showWedding('indian');
    } else if (path === '/dashboard' || fullURL.includes('/dashboard')) {
        console.log('Showing dashboard password screen via path');
        if (sessionStorage.getItem('dashboardAccess') === 'true') {
            showDashboard();
        } else {
            document.getElementById('dashboardPasswordScreen').style.display = 'flex';
            document.getElementById('weddingSelector').style.display = 'none';
        }
    } else {
        console.log('Showing wedding selector');
        document.getElementById('weddingSelector').style.display = 'flex';
    }
});

// Updated showWedding function
function showWedding(type) {
    console.log('Showing wedding:', type);
    
    document.getElementById('weddingSelector').style.display = 'none';
    document.getElementById('dashboardPage').classList.remove('active');
    document.getElementById('dashboardPasswordScreen').style.display = 'none';
    
    if (type === 'english') {
        document.getElementById('englishWedding').classList.add('active');
        document.getElementById('indianWedding').classList.remove('active');
        updateCountdown('english');
        // Update URL without breaking direct access
        if (!window.location.search.includes('redirect=1stMay2026') && !window.location.pathname.includes('1stMay2026')) {
            window.history.pushState({}, '', '/1stMay2026');
        }
    } else if (type === 'indian') {
        document.getElementById('indianWedding').classList.add('active');
        document.getElementById('englishWedding').classList.remove('active');
        updateCountdown('indian');
        // Update URL without breaking direct access
        if (!window.location.search.includes('redirect=10thMay2026') && !window.location.pathname.includes('10thMay2026')) {
            window.history.pushState({}, '', '/10thMay2026');
        }
    }
    currentWedding = type;
    
    setTimeout(() => {
        setupPhotoChanging(type);
    }, 100);
}

// Dashboard functionality with password protection
function showDashboard() {
    if (sessionStorage.getItem('dashboardAccess') === 'true') {
        document.getElementById('weddingSelector').style.display = 'none';
        document.getElementById('englishWedding').classList.remove('active');
        document.getElementById('indianWedding').classList.remove('active');
        document.getElementById('dashboardPasswordScreen').style.display = 'none';
        document.getElementById('dashboardPage').classList.add('active');
        window.history.pushState({}, '', '/dashboard');
        refreshDashboard();
    } else {
        document.getElementById('weddingSelector').style.display = 'none';
        document.getElementById('dashboardPasswordScreen').style.display = 'flex';
        window.history.pushState({}, '', '/dashboard');
    }
}

// Photo changing functionality
function setupPhotoChanging(wedding) {
    const photoImg = document.getElementById(wedding + 'Photo');
    const sections = document.querySelectorAll(`#${wedding}Wedding .content-section[data-photo]`);
    
    // Clear any existing observers
    if (window.photoObserver) {
        window.photoObserver.disconnect();
    }
    
    // Create new observer with better settings
    window.photoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                const newPhoto = entry.target.getAttribute('data-photo');
                if (newPhoto && photoImg) {
                    // Add error handling and force reload
                    const img = new Image();
                    img.onload = function() {
                        photoImg.src = newPhoto;
                    };
                    img.onerror = function() {
                        photoImg.src = 'images/engagement-photo.jpg'; // Fallback
                    };
                    img.src = newPhoto;
                }
            }
        });
    }, {
        threshold: [0.3, 0.7], // Multiple thresholds for better detection
        rootMargin: '-10% 0px -10% 0px' // Better margins
    });
    
    // Observe all sections
    sections.forEach(section => {
        if (section.getAttribute('data-photo')) {
            window.photoObserver.observe(section);
        }
    });
    
    // Set initial photo immediately
    const firstSection = sections[0];
    if (firstSection && photoImg) {
        const initialPhoto = firstSection.getAttribute('data-photo');
        if (initialPhoto) {
            photoImg.src = initialPhoto;
        }
    }
}

// Scroll to section functionality
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const headerHeight = document.querySelector('header').offsetHeight;
        const targetPosition = element.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // Manually update photo when navigating
        const photoElement = element.getAttribute('data-photo');
        if (photoElement) {
            const wedding = currentWedding;
            const photoImg = document.getElementById(wedding + 'Photo');
            if (photoImg) {
                setTimeout(() => {
                    photoImg.src = photoElement;
                }, 300); // Small delay to let scroll start
            }
        }
    }
    
    // Close menu
    const englishNav = document.getElementById('englishNav');
    const indianNav = document.getElementById('indianNav');
    if (englishNav) englishNav.classList.remove('active');
    if (indianNav) indianNav.classList.remove('active');
}

// Menu toggle functionality
function toggleMenu(wedding) {
    const nav = document.getElementById(`${wedding}Nav`);
    if (nav) {
        nav.classList.toggle('active');
    }
}

// Close menu when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('header')) {
        const englishNav = document.getElementById('englishNav');
        const indianNav = document.getElementById('indianNav');
        if (englishNav) englishNav.classList.remove('active');
        if (indianNav) indianNav.classList.remove('active');
    }
});

// Dashboard Functions
async function refreshDashboard() {
    try {
        // Fetch data from Formspree APIs
        const englishData = await fetchFormspreeData('mqadbbln');
        const indianData = await fetchFormspreeData('mldwnnlv');
        
        // Process and update dashboard
        processRSVPData('english', englishData);
        processRSVPData('indian', indianData);
        updateDashboardUI();
        
    } catch (error) {
        console.error('Error refreshing dashboard:', error);
    }
}

async function fetchFormspreeData(formId) {
    // Note: This is a placeholder - Formspree doesn't provide a public API to fetch submissions
    // In a real implementation, you'd need to use webhooks or a backend service
    // For now, we'll simulate with sample data
    return generateSampleData(formId);
}

function generateSampleData(formId) {
    // Sample data for demonstration
    const sampleData = [];
    const names = formId === 'mqadbbln' ? 
        ['John Smith', 'Jane Doe', 'Mike Wilson', 'Sarah Johnson'] :
        ['Priya Patel', 'Raj Kumar', 'Anita Singh', 'Vikram Shah'];
    
    names.forEach((name, index) => {
        sampleData.push({
            guest_name: name,
            attendance: index % 3 === 0 ? 'Regretfully Decline' : 'Joyfully Accept',
            starter: index % 2 === 0 ? 'Option 1' : 'Option 2',
            main: index % 2 === 0 ? 'Option 3' : 'Option 4',
            dietary: index === 1 ? 'Vegetarian' : '',
            drinks: 'Red Wine, Beer'
        });
    });
    
    return sampleData;
}

function processRSVPData(wedding, data) {
    dashboardData[wedding].responses = data;
    dashboardData[wedding].attending = data.filter(r => r.attendance === 'Joyfully Accept').length;
    dashboardData[wedding].declined = data.filter(r => r.attendance === 'Regretfully Decline').length;
    
    if (wedding === 'english') {
        // Process meal data
        dashboardData[wedding].meals.starter1 = data.filter(r => r.starter === 'Option 1').length;
        dashboardData[wedding].meals.starter2 = data.filter(r => r.starter === 'Option 2').length;
        dashboardData[wedding].meals.main3 = data.filter(r => r.main === 'Option 3').length;
        dashboardData[wedding].meals.main4 = data.filter(r => r.main === 'Option 4').length;
    }
    
    // Process dietary requirements
    dashboardData[wedding].dietary = data.filter(r => r.dietary && r.dietary.trim() !== '')
        .map(r => ({ name: r.guest_name, dietary: r.dietary }));
}

function updateDashboardUI() {
    const englishData = dashboardData.english;
    const indianData = dashboardData.indian;
    
    // Overall stats
    const totalResponses = englishData.responses.length + indianData.responses.length;
    const totalAttending = englishData.attending + indianData.attending;
    
    const totalResponsesEl = document.getElementById('totalResponses');
    const totalAttendingEl = document.getElementById('totalAttending');
    const responseRateEl = document.getElementById('responseRate');
    const overallProgressEl = document.getElementById('overallProgress');
    
    if (totalResponsesEl) totalResponsesEl.textContent = totalResponses;
    if (totalAttendingEl) totalAttendingEl.textContent = totalAttending;
    if (responseRateEl) responseRateEl.textContent = '100%';
    if (overallProgressEl) overallProgressEl.style.width = '100%';
    
    // Wedding-specific stats
    const englishAttendingEl = document.getElementById('englishAttending');
    const englishDeclinedEl = document.getElementById('englishDeclined');
    const englishTotalEl = document.getElementById('englishTotal');
    const englishProgressEl = document.getElementById('englishProgress');
    
    if (englishAttendingEl) englishAttendingEl.textContent = englishData.attending;
    if (englishDeclinedEl) englishDeclinedEl.textContent = englishData.declined;
    if (englishTotalEl) englishTotalEl.textContent = englishData.responses.length;
    if (englishProgressEl) englishProgressEl.style.width = '100%';
    
    const indianAttendingEl = document.getElementById('indianAttending');
    const indianDeclinedEl = document.getElementById('indianDeclined');
    const indianTotalEl = document.getElementById('indianTotal');
    const indianProgressEl = document.getElementById('indianProgress');
    
    if (indianAttendingEl) indianAttendingEl.textContent = indianData.attending;
    if (indianDeclinedEl) indianDeclinedEl.textContent = indianData.declined;
    if (indianTotalEl) indianTotalEl.textContent = indianData.responses.length;
    if (indianProgressEl) indianProgressEl.style.width = '100%';
    
    // Meal planning
    const totalMeals = englishData.meals.starter1 + englishData.meals.starter2;
    const starter1CountEl = document.getElementById('starter1Count');
    const starter2CountEl = document.getElementById('starter2Count');
    const main3CountEl = document.getElementById('main3Count');
    const main4CountEl = document.getElementById('main4Count');
    
    if (starter1CountEl) starter1CountEl.textContent = englishData.meals.starter1;
    if (starter2CountEl) starter2CountEl.textContent = englishData.meals.starter2;
    if (main3CountEl) main3CountEl.textContent = englishData.meals.main3;
    if (main4CountEl) main4CountEl.textContent = englishData.meals.main4;
    
    if (totalMeals > 0) {
        const starter1ProgressEl = document.getElementById('starter1Progress');
        const starter2ProgressEl = document.getElementById('starter2Progress');
        const main3ProgressEl = document.getElementById('main3Progress');
        const main4ProgressEl = document.getElementById('main4Progress');
        
        if (starter1ProgressEl) starter1ProgressEl.style.width = (englishData.meals.starter1 / totalMeals) * 100 + '%';
        if (starter2ProgressEl) starter2ProgressEl.style.width = (englishData.meals.starter2 / totalMeals) * 100 + '%';
        if (main3ProgressEl) main3ProgressEl.style.width = (englishData.meals.main3 / totalMeals) * 100 + '%';
        if (main4ProgressEl) main4ProgressEl.style.width = (englishData.meals.main4 / totalMeals) * 100 + '%';
    }
    
    // Dietary requirements
    const dietaryListEl = document.getElementById('dietaryList');
    const allDietary = [...englishData.dietary, ...indianData.dietary];
    
    if (dietaryListEl) {
        if (allDietary.length > 0) {
            dietaryListEl.innerHTML = allDietary.map(item => 
                `<div class="dietary-item"><span><strong>${item.name}:</strong> ${item.dietary}</span></div>`
            ).join('');
        } else {
            dietaryListEl.innerHTML = '<p>No dietary requirements reported yet.</p>';
        }
    }
}

// Countdown Timer
function updateCountdown(type) {
    const englishDate = new Date('2026-05-01T00:00:00');
    const indianDate = new Date('2026-05-10T00:00:00');
    const now = new Date();
    
    let targetDate = type === 'english' ? englishDate : indianDate;
    let elementId = type === 'english' ? 'englishCountdown' : 'indianCountdown';
    
    const difference = targetDate - now;
    const days = Math.ceil(difference / (1000 * 60 * 60 * 24));
    
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = days > 0 ? days : '0';
    }
}

// Simplified RSVP Functions
function englishNextStep(step) {
    if (step === 1) {
        const name = document.getElementById('englishSubmitterName').value.trim();
        const email = document.getElementById('englishSubmitterEmail').value.trim();
        
        if (!name || !email) {
            alert('Please enter your name and email address');
            return;
        }
        
        // Start with first person
        currentPersonIndex = 0;
        allRsvpResponses = [];
        startPersonRSVP('english', name, email);
    }
}

function indianNextStep(step) {
    if (step === 1) {
        const name = document.getElementById('indianSubmitterName').value.trim();
        const email = document.getElementById('indianSubmitterEmail').value.trim();
        
        if (!name || !email) {
            alert('Please enter your name and email address');
            return;
        }
        
        // Start with first person
        currentPersonIndex = 0;
        allRsvpResponses = [];
        startPersonRSVP('indian', name, email);
    }
}

function startPersonRSVP(wedding, name, email) {
    // Initialize current person response
    currentPersonResponse = {
        name: name,
        email: email,
        attending: null,
        starter: null,
        main: null,
        dessert: null,
        dietary: '',
        drinks: [],
        declineNote: ''
    };
    
    // Create and show person step
    createCurrentPersonStep(wedding);
    showCurrentPersonStep(wedding);
}

function createCurrentPersonStep(wedding) {
    const container = document.getElementById(wedding + 'PersonSteps');
    if (!container) return;
    
    container.innerHTML = ''; // Clear previous steps
    
    const stepDiv = document.createElement('div');
    stepDiv.className = 'wizard-step active';
    stepDiv.id = `${wedding}CurrentPersonStep`;
    
    if (wedding === 'english') {
        stepDiv.innerHTML = `
            <div class="person-indicator">RSVP for: <strong>${currentPersonResponse.name}</strong></div>
            <div class="step-title">Will you be attending?</div>
            <div class="attendance-buttons">
                <div class="attendance-btn accept" onclick="selectCurrentAttendance('${wedding}', 'accept')">
                    Joyfully Accept
                </div>
                <div class="attendance-btn decline" onclick="selectCurrentAttendance('${wedding}', 'decline')">
                    Regretfully Decline
                </div>
            </div>
            <div id="${wedding}CurrentAcceptQuestions" class="hidden">
                <div class="form-group">
                    <label>Please pick a starter:</label>
                    <div class="menu-options">
                        <div class="menu-option" onclick="selectCurrentMenuOption('${wedding}', 'starter', 'Option 1')">Option 1</div>
                        <div class="menu-option" onclick="selectCurrentMenuOption('${wedding}', 'starter', 'Option 2')">Option 2</div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Please pick a main:</label>
                    <div class="menu-options">
                        <div class="menu-option" onclick="selectCurrentMenuOption('${wedding}', 'main', 'Option 3')">Option 3</div>
                        <div class="menu-option" onclick="selectCurrentMenuOption('${wedding}', 'main', 'Option 4')">Option 4</div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Please pick a dessert:</label>
                    <div class="menu-options">
                        <div class="menu-option" onclick="selectCurrentMenuOption('${wedding}', 'dessert', 'Option 4')">Option 4</div>
                        <div class="menu-option" onclick="selectCurrentMenuOption('${wedding}', 'dessert', 'Option 5')">Option 5</div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="${wedding}CurrentDietary">Any dietary requirements?</label>
                    <textarea id="${wedding}CurrentDietary" rows="2" placeholder="Please let us know about any allergies or dietary requirements..."></textarea>
                </div>
                <div class="form-group">
                    <label>What are your drink preferences for the reception?</label>
                    <div class="drink-options">
                        <div class="drink-option" onclick="toggleCurrentDrinkOption('${wedding}', 'Red Wine')">Red Wine</div>
                        <div class="drink-option" onclick="toggleCurrentDrinkOption('${wedding}', 'White Wine')">White Wine</div>
                        <div class="drink-option" onclick="toggleCurrentDrinkOption('${wedding}', 'Beer')">Beer</div>
                        <div class="drink-option" onclick="toggleCurrentDrinkOption('${wedding}', 'Non-alcoholic beverages only')">Non-alcoholic beverages only</div>
                        <div class="drink-option" onclick="toggleCurrentDrinkOption('${wedding}', 'No preference')">No preference</div>
                    </div>
                </div>
            </div>
            <div id="${wedding}CurrentDeclineQuestions" class="hidden">
                <div class="form-group">
                    <label for="${wedding}CurrentDeclineNote">Would you like to include a note to the couple?</label>
                    <textarea id="${wedding}CurrentDeclineNote" rows="3" placeholder="We'll miss you but understand..."></textarea>
                </div>
            </div>
            <div class="wizard-buttons">
                <button class="btn btn-secondary" onclick="goBackToInitial('${wedding}')">Previous</button>
                <button class="btn" onclick="finishCurrentPerson('${wedding}')">Next</button>
            </div>
        `;
    } else {
        stepDiv.innerHTML = `
            <div class="person-indicator">RSVP for: <strong>${currentPersonResponse.name}</strong></div>
            <div class="step-title">Will you be attending?</div>
            <div class="attendance-buttons">
                <div class="attendance-btn accept" onclick="selectCurrentAttendance('${wedding}', 'accept')">
                    Joyfully Accept
                </div>
                <div class="attendance-btn decline" onclick="selectCurrentAttendance('${wedding}', 'decline')">
                    Regretfully Decline
                </div>
            </div>
            <div id="${wedding}CurrentAcceptQuestions" class="hidden">
                <div class="buffet-notice">
                    <h4>Wedding Breakfast</h4>
                    <p>The wedding breakfast will be served as a buffet allowing you to help yourself to the dishes we have chosen. All dishes will be vegetarian.</p>
                </div>
                <div class="form-group">
                    <label for="${wedding}CurrentDietary">Any dietary requirements?</label>
                    <textarea id="${wedding}CurrentDietary" rows="2" placeholder="Please let us know about any allergies or dietary requirements..."></textarea>
                </div>
            </div>
            <div id="${wedding}CurrentDeclineQuestions" class="hidden">
                <div class="form-group">
                    <label for="${wedding}CurrentDeclineNote">Would you like to include a note to the couple?</label>
                    <textarea id="${wedding}CurrentDeclineNote" rows="3" placeholder="We'll miss you but understand..."></textarea>
                </div>
            </div>
            <div class="wizard-buttons">
                <button class="btn btn-secondary" onclick="goBackToInitial('${wedding}')">Previous</button>
                <button class="btn" onclick="finishCurrentPerson('${wedding}')">Next</button>
            </div>
        `;
    }
    
    container.appendChild(stepDiv);
}

function showCurrentPersonStep(wedding) {
    // Hide initial step and final step
    const step1 = document.getElementById(wedding + 'Step1');
    const finalStep = document.getElementById(wedding + 'FinalStep');
    
    if (step1) step1.classList.remove('active');
    if (finalStep) finalStep.classList.remove('active');
    
    // Hide add another step if it exists
    const addAnotherStep = document.getElementById(wedding + 'AddAnotherStep');
    if (addAnotherStep) {
        addAnotherStep.classList.remove('active');
    }
    
    // Show current person step
    const currentStep = document.getElementById(`${wedding}CurrentPersonStep`);
    if (currentStep) currentStep.classList.add('active');
}

function selectCurrentAttendance(wedding, type) {
    const acceptBtn = document.querySelector(`#${wedding}CurrentPersonStep .attendance-btn.accept`);
    const declineBtn = document.querySelector(`#${wedding}CurrentPersonStep .attendance-btn.decline`);
    const acceptQuestions = document.getElementById(`${wedding}CurrentAcceptQuestions`);
    const declineQuestions = document.getElementById(`${wedding}CurrentDeclineQuestions`);
    
    if (!acceptBtn || !declineBtn || !acceptQuestions || !declineQuestions) return;
    
    // Reset buttons
    acceptBtn.classList.remove('selected');
    declineBtn.classList.remove('selected');
    acceptQuestions.classList.add('hidden');
    declineQuestions.classList.add('hidden');
    
    if (type === 'accept') {
        acceptBtn.classList.add('selected');
        acceptQuestions.classList.remove('hidden');
        currentPersonResponse.attending = 'Joyfully Accept';
    } else {
        declineBtn.classList.add('selected');
        declineQuestions.classList.remove('hidden');
        currentPersonResponse.attending = 'Regretfully Decline';
    }
}

function selectCurrentMenuOption(wedding, category, option) {
    const options = document.querySelectorAll(`#${wedding}CurrentPersonStep .menu-options .menu-option`);
    const categoryOptions = Array.from(options).filter(opt => 
        opt.parentElement.previousElementSibling.textContent.toLowerCase().includes(category)
    );
    
    categoryOptions.forEach(opt => opt.classList.remove('selected'));
    event.target.classList.add('selected');
    
    currentPersonResponse[category] = option;
}

function toggleCurrentDrinkOption(wedding, drink) {
    const option = event.target;
    option.classList.toggle('selected');
    
    if (!currentPersonResponse.drinks) {
        currentPersonResponse.drinks = [];
    }
    
    const drinks = currentPersonResponse.drinks;
    const index = drinks.indexOf(drink);
    
    if (index > -1) {
        drinks.splice(index, 1);
    } else {
        drinks.push(drink);
    }
}

function finishCurrentPerson(wedding) {
    // Validate current person's response
    if (!currentPersonResponse.attending) {
        alert('Please select whether you will be attending.');
        return;
    }
    
    if (currentPersonResponse.attending === 'Joyfully Accept') {
        if (wedding === 'english') {
            if (!currentPersonResponse.starter || !currentPersonResponse.main || !currentPersonResponse.dessert) {
                alert('Please make all meal selections.');
                return;
            }
        }
        const dietaryEl = document.getElementById(`${wedding}CurrentDietary`);
        if (dietaryEl) currentPersonResponse.dietary = dietaryEl.value;
    } else {
        const declineNoteEl = document.getElementById(`${wedding}CurrentDeclineNote`);
        if (declineNoteEl) currentPersonResponse.declineNote = declineNoteEl.value;
    }
    
    // Add current person to responses
    allRsvpResponses.push({...currentPersonResponse});
    
    // Show "Add Another Person" step
    showAddAnotherStep(wedding);
}

function showAddAnotherStep(wedding) {
    // Hide current person step
    const currentStep = document.getElementById(`${wedding}CurrentPersonStep`);
    if (currentStep) currentStep.classList.remove('active');
    
    // Create or show add another step
    let addAnotherStep = document.getElementById(wedding + 'AddAnotherStep');
    if (!addAnotherStep) {
        addAnotherStep = document.createElement('div');
        addAnotherStep.className = 'wizard-step';
        addAnotherStep.id = wedding + 'AddAnotherStep';
        addAnotherStep.innerHTML = `
            <div class="step-title">Is there anyone else you would like to RSVP for?</div>
            <div class="person-indicator">You have completed ${allRsvpResponses.length} RSVP${allRsvpResponses.length > 1 ? 's' : ''}</div>
            <div class="attendance-buttons">
                <div class="attendance-btn accept" onclick="addAnotherPerson('${wedding}')">
                    Yes
                </div>
                <div class="attendance-btn decline" onclick="proceedToFinal('${wedding}')">
                    No
                </div>
            </div>
            <div class="wizard-buttons">
                <div></div>
                <div></div>
            </div>
        `;
        const container = document.getElementById(wedding + 'PersonSteps');
        if (container) container.appendChild(addAnotherStep);
    }
    
    // Update the counter
    const indicator = addAnotherStep.querySelector('.person-indicator');
    if (indicator) {
        indicator.innerHTML = `You have completed ${allRsvpResponses.length} RSVP${allRsvpResponses.length > 1 ? 's' : ''}`;
    }
    
    addAnotherStep.classList.add('active');
}

function addAnotherPerson(wedding) {
    // Get new person details
    const name = prompt('Please enter the name of the person you want to RSVP for:');
    if (!name || !name.trim()) {
        return;
    }
    
    const email = prompt('Please enter their email address (or your email if RSVPing on their behalf):');
    if (!email || !email.trim()) {
        return;
    }
    
    // Start RSVP for new person
    startPersonRSVP(wedding, name.trim(), email.trim());
}

function proceedToFinal(wedding) {
    showFinalStep(wedding);
}

function goBackToInitial(wedding) {
    // Go back to initial step
    const currentStep = document.getElementById(`${wedding}CurrentPersonStep`);
    const step1 = document.getElementById(wedding + 'Step1');
    
    if (currentStep) currentStep.classList.remove('active');
    if (step1) step1.classList.add('active');
    
    // Reset data
    allRsvpResponses = [];
    currentPersonResponse = {};
}

function startNewRSVP(wedding) {
    // Reset everything and go back to start
    allRsvpResponses = [];
    currentPersonResponse = {};
    
    // Clear form fields
    const nameEl = document.getElementById(wedding + 'SubmitterName');
    const emailEl = document.getElementById(wedding + 'SubmitterEmail');
    
    if (nameEl) nameEl.value = '';
    if (emailEl) emailEl.value = '';
    
    // Hide final step and show initial step
    const finalStep = document.getElementById(wedding + 'FinalStep');
    const step1 = document.getElementById(wedding + 'Step1');
    
    if (finalStep) finalStep.classList.remove('active');
    if (step1) step1.classList.add('active');
    
    // Clear person steps
    const personSteps = document.getElementById(wedding + 'PersonSteps');
    if (personSteps) personSteps.innerHTML = '';
}

function showFinalStep(wedding) {
    // Hide add another step
    const addAnotherStep = document.getElementById(wedding + 'AddAnotherStep');
    if (addAnotherStep) {
        addAnotherStep.classList.remove('active');
    }
    
    // Show final step
    const finalStep = document.getElementById(wedding + 'FinalStep');
    if (finalStep) finalStep.classList.add('active');
    
    // Generate summary
    const summaryDiv = document.getElementById(wedding + 'RsvpSummary');
    if (summaryDiv) {
        let summaryHTML = `<h3>RSVP Summary (${allRsvpResponses.length} ${allRsvpResponses.length > 1 ? 'people' : 'person'})</h3>`;
        
        allRsvpResponses.forEach((response, index) => {
            summaryHTML += `<div style="margin-bottom: 1rem; padding: 1rem; background: var(--section-bg); border-radius: 10px;">`;
            summaryHTML += `<strong>${response.name}</strong> - ${response.attending}<br>`;
            summaryHTML += `<em>Email: ${response.email}</em><br>`;
            
            if (response.attending === 'Joyfully Accept') {
                if (wedding === 'english') {
                    summaryHTML += `Starter: ${response.starter}<br>`;
                    summaryHTML += `Main: ${response.main}<br>`;
                    summaryHTML += `Dessert: ${response.dessert}<br>`;
                    if (response.drinks.length > 0) {
                        summaryHTML += `Drinks: ${response.drinks.join(', ')}<br>`;
                    }
                }
                if (response.dietary) {
                    summaryHTML += `Dietary: ${response.dietary}<br>`;
                }
            } else if (response.declineNote) {
                summaryHTML += `Note: ${response.declineNote}<br>`;
            }
            
            summaryHTML += `</div>`;
        });
        
        summaryDiv.innerHTML = summaryHTML;
    }
}

// Updated submission functions
function submitEnglishRSVP() {
    submitSimplifiedRSVP('english', 'https://formspree.io/f/mqadbbln');
}

function submitIndianRSVP() {
    submitSimplifiedRSVP('indian', 'https://formspree.io/f/mldwnnlv');
}

async function submitSimplifiedRSVP(wedding, endpoint) {
    const submitBtn = event.target;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        // Submit individual records for each person
        for (let i = 0; i < allRsvpResponses.length; i++) {
            const response = allRsvpResponses[i];
            const formData = new FormData();
            
            // Add custom formatted data for perfect CSV
            formData.append('submission_date', new Date().toISOString());
            formData.append('submitter_name', allRsvpResponses[0].name); // First person is the submitter
            formData.append('submitter_email', allRsvpResponses[0].email);
            formData.append('wedding_type', wedding === 'english' ? 'English Wedding' : 'Indian Wedding');
            formData.append('guest_name', response.name);
            formData.append('guest_email', response.email);
            formData.append('attendance', response.attending);
            formData.append('starter', response.starter || '');
            formData.append('main', response.main || '');
            formData.append('dessert', response.dessert || '');
            formData.append('dietary', response.dietary || '');
            formData.append('drinks', response.drinks ? response.drinks.join(', ') : '');
            formData.append('decline_note', response.declineNote || '');
            formData.append('total_in_submission', allRsvpResponses.length);
            formData.append('_subject', `${wedding === 'english' ? 'English' : 'Indian'} Wedding RSVP - ${allRsvpResponses[0].name} (${allRsvpResponses.length} ${allRsvpResponses.length > 1 ? 'people' : 'person'})`);
            formData.append('_captcha', 'false');
            
            await fetch(endpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
        }
        
        // Show success message
        const successMsg = document.getElementById(wedding + 'SuccessMessage');
        const wizard = document.getElementById(wedding + 'RsvpWizard');
        
        if (successMsg) successMsg.classList.remove('hidden');
        if (wizard) wizard.style.display = 'none';
        
    } catch (error) {
        console.error('Error:', error);
        const errorMsg = document.getElementById(wedding + 'ErrorMessage');
        if (errorMsg) errorMsg.classList.remove('hidden');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit RSVP';
    }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
    updateCountdown('english');
    updateCountdown('indian');
    
    // Set up daily countdown updates
    setInterval(() => {
        updateCountdown('english');
        updateCountdown('indian');
    }, 86400000); // Update daily
});

// Handle browser back/forward buttons
window.addEventListener('popstate', function() {
    // Re-check URL on back/forward navigation
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    const path = window.location.pathname;
    
    if (redirect === '1stMay2026' || path.includes('1stMay2026')) {
        showWedding('english');
    } else if (redirect === '10thMay2026' || path.includes('10thMay2026')) {
        showWedding('indian');
    } else if (redirect === 'dashboard' || path.includes('/dashboard')) {
        showDashboard();
    } else {
        const selector = document.getElementById('weddingSelector');
        const englishWedding = document.getElementById('englishWedding');
        const indianWedding = document.getElementById('indianWedding');
        const dashboardPage = document.getElementById('dashboardPage');
        const dashboardPassword = document.getElementById('dashboardPasswordScreen');
        
        if (selector) selector.style.display = 'flex';
        if (englishWedding) englishWedding.classList.remove('active');
        if (indianWedding) indianWedding.classList.remove('active');
        if (dashboardPage) dashboardPage.classList.remove('active');
        if (dashboardPassword) dashboardPassword.style.display = 'none';
    }
});
