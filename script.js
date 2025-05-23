// Element References
const nameInput = document.getElementById('nameInput');
const addNameBtn = document.getElementById('addNameBtn');
const nameList = document.getElementById('nameList');
const wheelCanvas = document.getElementById('wheelCanvas');
const spinBtn = document.getElementById('spinBtn');
const result = document.getElementById('result');
const resetBtn = document.getElementById('resetBtn');
const respinBtn = document.getElementById('respinBtn');
const modifyListBtn = document.getElementById('modifyListBtn');
const pointerArrow = document.getElementById('pointerArrow');

// New container references
const inputContainer = document.getElementById('inputContainer');
const postSpinActionsContainer = document.getElementById('postSpinActionsContainer');
// wheelAndControlsContainer is mostly for layout, not direct JS visibility toggle as a whole often

// State Variables
let names = [];
let currentAngle = 0; // Tracks the wheel's current rotation angle (in radians)
const colors = ["#FFC300", "#FF5733", "#C70039", "#900C3F", "#581845", "#DAF7A6", "#33FF57", "#33D4FF", "#FF33F6", "#A633FF"];

const ctx = wheelCanvas.getContext('2d');
const centerX = wheelCanvas.width / 2;
const centerY = wheelCanvas.height / 2;
const radius = Math.min(centerX, centerY) - 10;

// --- Core Functions ---

// a. addName()
function addName() {
    const name = nameInput.value.trim();
    if (name && !names.includes(name)) {
        names.push(name);
        renderNameList();
        nameInput.value = '';
        drawWheel();
    } else if (!name) {
        // alert("Il nome non può essere vuoto!");
    } else if (names.includes(name)) {
        alert("Questo nome è già stato inserito!");
    }
    nameInput.focus();
}

function renderNameList() {
    nameList.innerHTML = '';
    names.forEach(name => {
        const nameElement = document.createElement('div'); // Using div, ensure CSS matches
        nameElement.textContent = name;
        nameList.appendChild(nameElement);
    });
}

// b. drawWheelContent()
function drawWheelContent() {
    if (names.length === 0) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#aaa';
        ctx.font = '20px Arial';
        ctx.fillText('Aggiungi nomi per creare la ruota!', centerX, centerY);
        ctx.restore();
        return;
    }

    const arcSize = (2 * Math.PI) / names.length;

    for (let i = 0; i < names.length; i++) {
        const startAngle = i * arcSize;
        const endAngle = (i + 1) * arcSize;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.fillStyle = "black";
        let fontSize = 16;
        if (names.length > 6) fontSize = 14;
        if (names.length > 10) fontSize = 12;
        if (names.length > 15) fontSize = 10;
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const textAngle = startAngle + arcSize / 2;
        const textRadius = radius * 0.7;

        ctx.translate(
            centerX + Math.cos(textAngle) * textRadius,
            centerY + Math.sin(textAngle) * textRadius
        );
        ctx.rotate(textAngle + Math.PI / 2);
        const text = names[i];
        ctx.fillText(text, 0, 0);
        ctx.restore();
    }
}

// drawWheel()
function drawWheel() {
    ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentAngle);
    ctx.translate(-centerX, -centerY);
    drawWheelContent();
    ctx.restore();
}


// c. spinWheel()
let isSpinning = false;

function spinWheel() {
    if (isSpinning) return;
    if (names.length < 2) {
        alert("Aggiungi almeno due nomi per girare la ruota!");
        return;
    }

    isSpinning = true;
    spinBtn.disabled = true; // Keep disabling the button itself
    addNameBtn.disabled = true;
    nameInput.disabled = true;
    // result.classList.add('hidden'); // Hide result before spin

    const spinDuration = 5000;
    const randomExtraSpins = Math.random() * 3 + 5;
    const targetRelativeSpin = randomExtraSpins * 2 * Math.PI;

    let startTime = null;
    const initialAngle = currentAngle;

    function animateSpin(timestamp) {
        if (startTime === null) {
            startTime = timestamp;
        }
        const progress = timestamp - startTime;
        const easeOutQuart = t => 1 - Math.pow(1 - t, 4);
        const easedProgress = easeOutQuart(Math.min(progress / spinDuration, 1));
        const frameRotationAngle = initialAngle + targetRelativeSpin * easedProgress;

        ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(frameRotationAngle);
        ctx.translate(-centerX, -centerY);
        drawWheelContent();
        ctx.restore();

        if (progress < spinDuration) {
            requestAnimationFrame(animateSpin);
        } else {
            currentAngle = frameRotationAngle % (2 * Math.PI);
            determineWinner();

            postSpinActionsContainer.classList.remove('hidden');
            result.classList.remove('hidden'); // Show result
            spinBtn.classList.add('hidden');
            inputContainer.classList.add('hidden');
            nameList.classList.add('hidden');

            isSpinning = false;
            // spinBtn remains disabled and hidden. Other buttons in postSpinActionsContainer are now visible.
        }
    }
    requestAnimationFrame(animateSpin);
}

// d. determineWinner()
function determineWinner() {
    const numSegments = names.length;
    if (numSegments === 0) return;

    const arcSize = (2 * Math.PI) / numSegments;
    const pointerCanvasAngle = (3 * Math.PI) / 2; // 12 o'clock pointer
    const effectiveWheelAngle = (pointerCanvasAngle - (currentAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
    const winnerIndex = Math.floor(effectiveWheelAngle / arcSize);
    const winner = names[winnerIndex];

    if (winner) {
        result.innerHTML = `Il guidatore è: <strong>${winner}</strong>!`;
    } else {
        result.innerHTML = "Nessun guidatore determinato. Si è verificato un errore.";
        console.error("Winner could not be determined.");
    }
}

// e. resetApp()
function resetApp() {
    names = [];
    currentAngle = 0;
    renderNameList();
    // result.innerHTML = ''; // Clear content
    result.classList.add('hidden'); // Hide result area
    postSpinActionsContainer.classList.add('hidden');

    spinBtn.classList.remove('hidden');
    inputContainer.classList.remove('hidden');
    nameList.classList.remove('hidden');

    addNameBtn.disabled = false;
    nameInput.disabled = false;
    spinBtn.disabled = false;

    drawWheel();
    nameInput.focus();
}

// f. respin()
function respin() {
    // result.innerHTML = '';
    result.classList.add('hidden');
    postSpinActionsContainer.classList.add('hidden');

    // inputContainer, nameList, spinBtn remain hidden.
    // addNameBtn, nameInput are already disabled from previous spin state.
    // spinBtn is hidden and disabled.
    // spinWheel will manage disabling active elements if any were re-enabled by mistake
    spinWheel();
}

// g. modifyList()
function modifyList() {
    // result.innerHTML = '';
    result.classList.add('hidden');
    postSpinActionsContainer.classList.add('hidden');

    spinBtn.classList.remove('hidden');
    inputContainer.classList.remove('hidden');
    nameList.classList.remove('hidden');

    addNameBtn.disabled = false;
    nameInput.disabled = false;
    spinBtn.disabled = false;

    currentAngle = 0;
    drawWheel();
    nameInput.focus();
}


// Initial Setup
function initialSetup() {
    postSpinActionsContainer.classList.add('hidden');
    result.classList.add('hidden'); // Result text is empty initially, also hide container.
                                     // CSS ensures it's empty and doesn't take space if it has min-height.

    spinBtn.classList.remove('hidden'); // Should be visible
    inputContainer.classList.remove('hidden'); // Should be visible
    nameList.classList.remove('hidden'); // Should be visible

    // Ensure buttons are enabled by default
    addNameBtn.disabled = false;
    nameInput.disabled = false;
    spinBtn.disabled = false;

    drawWheel();
}

// --- Event Listeners ---
addNameBtn.addEventListener('click', addName);
nameInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addName();
        event.preventDefault();
    }
});
spinBtn.addEventListener('click', spinWheel);
resetBtn.addEventListener('click', resetApp);
respinBtn.addEventListener('click', respin);
modifyListBtn.addEventListener('click', modifyList);

initialSetup();
