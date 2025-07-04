// DOM elements
const validationForm = document.getElementById('validationForm');
const regNoInput = document.getElementById('regNo');
const verificationNoInput = document.getElementById('verificationNo');
const validateBtn = document.getElementById('validateBtn');
const btnText = document.querySelector('.btn-text');
const spinner = document.getElementById('spinner');
const resultContainer = document.getElementById('result');


// API base URL
const API_BASE = window.location.origin;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupFormHandlers();
});



// Setup form event handlers
function setupFormHandlers() {
    validationForm.addEventListener('submit', handleFormSubmit);
    
    // Add input event listeners for real-time validation
    regNoInput.addEventListener('input', validateInputs);
    verificationNoInput.addEventListener('input', validateInputs);
    
    // Add enter key handler for inputs
    [regNoInput, verificationNoInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !validateBtn.disabled) {
                handleFormSubmit(e);
            }
        });
    });
}

// Validate inputs in real-time
function validateInputs() {
    const regNo = regNoInput.value.trim();
    const verificationNo = verificationNoInput.value.trim();
    
    const isValid = regNo.length > 0 && verificationNo.length > 0;
    validateBtn.disabled = !isValid;
    
    // Clear previous results if user starts typing
    if (resultContainer.innerHTML !== '') {
        resultContainer.innerHTML = '';
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const regNo = regNoInput.value.trim();
    const verificationNo = verificationNoInput.value.trim();
    
    // Validate inputs
    if (!regNo || !verificationNo) {
        showError('Please fill in both registration number and verification number');
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        const response = await fetch(`${API_BASE}/api/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                regNo: regNo,
                verificationNo: verificationNo
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess(data.data, data.message);
        } else {
            showError(data.message || 'Validation failed');
        }
        
    } catch (error) {
        console.error('Validation error:', error);
        showError('Network error. Please check your connection and try again.');
    } finally {
        setLoadingState(false);
    }
}

// Set loading state
function setLoadingState(isLoading) {
    validateBtn.disabled = isLoading;
    
    if (isLoading) {
        btnText.textContent = 'Validating...';
        spinner.classList.add('active');
    } else {
        btnText.textContent = 'Validate Registration';
        spinner.classList.remove('active');
    }
}

// Show success result
function showSuccess(data, message) {
    resultContainer.innerHTML = `
        <div class="result-success">
            <div class="result-title">
                ✅ ${message}
            </div>
            <div class="result-details">
                <div class="result-item">
                    <span class="result-label">Registration Number:</span>
                    <span class="result-value">${data.regNo}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Name:</span>
                    <span class="result-value">${data.name}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Father's Name:</span>
                    <span class="result-value">${data.fatherName || 'N/A'}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Mother's Name:</span>
                    <span class="result-value">${data.motherName || 'N/A'}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Venue:</span>
                    <span class="result-value">${data.venue || 'N/A'}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Verification Number:</span>
                    <span class="result-value">${data.verificationNo}</span>
                </div>
            </div>
        </div>
    `;
    
    // Scroll to result
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

// Show error result
function showError(message) {
    resultContainer.innerHTML = `
        <div class="result-error">
            <div class="result-title">
                ❌ Validation Failed
            </div>
            <p>${message}</p>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 0.9rem; color: #666;">
                <strong>Tips:</strong>
                <ul style="margin-top: 8px; padding-left: 20px;">
                    <li>Double-check your registration number</li>
                    <li>Ensure the verification number is entered correctly</li>
                    <li>Try using one of the sample records below for testing</li>
                </ul>
            </div>
        </div>
    `;
    
    // Scroll to result
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

// Utility function to clear form
function clearForm() {
    regNoInput.value = '';
    verificationNoInput.value = '';
    resultContainer.innerHTML = '';
    validateBtn.disabled = true;
}

// Add clear form functionality (optional)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        clearForm();
    }
});

// Add some visual feedback for better UX
regNoInput.addEventListener('focus', () => {
    regNoInput.parentElement.style.transform = 'scale(1.02)';
});

regNoInput.addEventListener('blur', () => {
    regNoInput.parentElement.style.transform = 'scale(1)';
});

verificationNoInput.addEventListener('focus', () => {
    verificationNoInput.parentElement.style.transform = 'scale(1.02)';
});

verificationNoInput.addEventListener('blur', () => {
    verificationNoInput.parentElement.style.transform = 'scale(1)';
});

// Add smooth transitions for form groups
document.querySelectorAll('.form-group').forEach(group => {
    group.style.transition = 'transform 0.2s ease';
}); 