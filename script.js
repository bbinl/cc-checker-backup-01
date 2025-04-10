// Global Variables
let isChecking = false;
let currentIndex = 0;
let cardList = [];
let checkInterval;
const delay = 2000; // 2 second delay

// DOM Elements
const numbersTextarea = document.getElementById('numbers');
const checkBtn = document.getElementById('check-btn');
const stopCheckBtn = document.getElementById('stop-check-btn');
const aliCount = document.getElementById('ali-count');
const muhammadCount = document.getElementById('muhammad-count');
const muradCount = document.getElementById('murad-count');
const aliNumbers = document.getElementById('ali-numbers');
const muhammadNumbers = document.getElementById('muhammad-numbers');
const muradNumbers = document.getElementById('murad-numbers');

// Button Toggle Function
function toggleButtons() {
    if (isChecking) {
        pauseChecking();
    } else {
        startChecking();
    }
}

// Start Checking Function
function startChecking() {
    const input = numbersTextarea.value.trim();
    if (!input) {
        Swal.fire('Error!', 'Please enter credit card numbers', 'error');
        return;
    }

    cardList = input.split('\n').filter(line => line.trim() !== '');
    if (cardList.length === 0) {
        Swal.fire('Error!', 'No valid cards found', 'error');
        return;
    }

    isChecking = true;
    currentIndex = 0;
    checkBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause Checking';
    stopCheckBtn.disabled = false;

    // Process first card immediately
    processNextCard();
}

// Pause Checking Function
function pauseChecking() {
    isChecking = false;
    clearInterval(checkInterval);
    checkBtn.innerHTML = '<i class="fa-solid fa-play"></i> Resume Checking';
}

// Stop Checking Function
function stopChecking() {
    isChecking = false;
    clearInterval(checkInterval);
    checkBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start Checking';
    stopCheckBtn.disabled = true;
}

// Process Next Card Function
function processNextCard() {
    if (!isChecking || currentIndex >= cardList.length) {
        if (currentIndex >= cardList.length) {
            stopChecking();
            Swal.fire('Completed!', 'All cards have been checked', 'success');
        }
        return;
    }

    const cardData = cardList[currentIndex];
    const parts = cardData.split('|').map(part => part.trim());
    
    // Default values
    let cardNumber = parts[0] || 'N/A';
    let expiryMonth = parts.length > 1 ? parts[1] : 'N/A';
    let expiryYear = parts.length > 2 ? parts[2] : 'N/A';
    let cvc = parts.length > 3 ? parts[3] : 'N/A';
    
    // Validation logic
    let status = '';
    let resultType = 'unknown';

    // Format check
    if (parts.length !== 4) {
        status = 'Invalid Format';
        resultType = 'unknown';
    } 
    // Card number check
    else if (!/^\d+$/.test(parts[0])) {
        status = 'Invalid Card Number';
        resultType = 'unknown';
    }
    // Expiry date check
    else if (!validateExpiry(parts[1], parts[2])) {
        status = 'Invalid Expiry';
        resultType = 'unknown';
    }
    // CVC check
    else if (!validateCVC(parts[3], parts[0])) {
        status = 'Invalid CVC';
        resultType = 'unknown';
    }
    // Luhn Algorithm check
    else if (!validateCred(numberToArray(parts[0]))) {
        status = 'Invalid Card (Luhn)';
        resultType = 'dead';
    }
    // Everything valid
    else {
        status = 'LIVE';
        resultType = 'live';
    }

    // Create result element with requested format
    const cardElement = document.createElement('div');
    cardElement.className = 'card-result ' + resultType;
    cardElement.textContent = `${cardNumber}|${expiryMonth}|${expiryYear}|${cvc}`;

    // Update results
    switch (resultType) {
        case 'live':
            aliNumbers.appendChild(cardElement);
            aliCount.textContent = parseInt(aliCount.textContent) + 1;
            break;
        case 'dead':
            muhammadNumbers.appendChild(cardElement);
            muhammadCount.textContent = parseInt(muhammadCount.textContent) + 1;
            break;
        default:
            muradNumbers.appendChild(cardElement);
            muradCount.textContent = parseInt(muradCount.textContent) + 1;
    }

    currentIndex++;
    
    // Set interval for next card
    if (isChecking && currentIndex < cardList.length) {
        checkInterval = setTimeout(processNextCard, delay);
    } else if (currentIndex >= cardList.length) {
        stopChecking();
        Swal.fire('Completed!', 'All cards have been checked', 'success');
    }
}

// Expiry Date Validation
function validateExpiry(mm, yyyy) {
    if (!/^\d{2}$/.test(mm) || !/^\d{4}$/.test(yyyy)) return false;
    
    const month = parseInt(mm, 10);
    const year = parseInt(yyyy, 10);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    if (month < 1 || month > 12) return false;
    if (year < currentYear || (year === currentYear && month < currentMonth)) return false;
    return true;
}

// CVC Validation
function validateCVC(cvc, ccNumber) {
    if (!/^\d{3,4}$/.test(cvc)) return false;
    const firstDigit = ccNumber[0];
    return (firstDigit === '3') ? cvc.length === 4 : cvc.length === 3;
}

// Luhn Algorithm
function validateCred(numArr) {
    let total = 0;
    for (let i = numArr.length - 1; i >= 0; i--) {
        let currValue = numArr[i];
        if ((numArr.length - 1 - i) % 2 === 1) {
            currValue *= 2;
            if (currValue > 9) currValue -= 9;
        }
        total += currValue;
    }
    return total % 10 === 0;
}

// Convert number to array
function numberToArray(number) {
    return number.toString().split('').map(Number);
}

// Stop button event listener
stopCheckBtn.addEventListener('click', stopChecking);
