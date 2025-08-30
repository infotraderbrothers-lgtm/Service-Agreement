// Initialize page with URL parameters or default values
function initializePage() {
    const urlParams = new URLSearchParams(window.location.search);
    
    document.getElementById('client-company').textContent = 
        urlParams.get('company') || '[CLIENT_COMPANY]';
    document.getElementById('client-address').textContent = 
        urlParams.get('address') || '[CLIENT_ADDRESS]';
    document.getElementById('client-email').textContent = 
        urlParams.get('email') || '[CLIENT_EMAIL]';
    document.getElementById('client-phone').textContent = 
        urlParams.get('phone') || '[CLIENT_PHONE]';
    document.getElementById('client-contact').textContent = 
        urlParams.get('contact') || '[CLIENT_CONTACT]';
    
    document.getElementById('agreement-date').value = new Date().toISOString().split('T')[0];
}

// API endpoint for dynamic content (for Make.com integration)
function updateClientInfo(clientData) {
    document.getElementById('client-company').textContent = clientData.company || '[CLIENT_COMPANY]';
    document.getElementById('client-address').textContent = clientData.address || '[CLIENT_ADDRESS]';
    document.getElementById('client-email').textContent = clientData.email || '[CLIENT_EMAIL]';
    document.getElementById('client-phone').textContent = clientData.phone || '[CLIENT_PHONE]';
    document.getElementById('client-contact').textContent = clientData.contact || '[CLIENT_CONTACT]';
}

// Signature pad variables
let canvas, ctx, isDrawing = false, hasSignature = false;

// Initialize signature pad functionality
function initializeSignaturePad() {
    canvas = document.getElementById('signature-pad');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseout', handleMouseUp);

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    document.getElementById('client-name').addEventListener('input', checkFormCompletion);
    window.addEventListener('resize', resizeCanvas);
}

// Set canvas size properly
function resizeCanvas() {
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set actual canvas dimensions
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Scale the context to match the device pixel ratio
    ctx.scale(dpr, dpr);
    
    // Set drawing style
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    ctx.lineJoin = 'round';
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
}

function getEventPos(e) {
    const rect = canvas.getBoundingClientRect();
    
    if (e.touches && e.touches[0]) {
        return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top
        };
    }
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function handleMouseDown(e) {
    e.preventDefault();
    isDrawing = true;
    hasSignature = true;
    const pos = getEventPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    checkFormCompletion();
}

function handleMouseMove(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getEventPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
}

function handleMouseUp(e) {
    if (isDrawing) {
        isDrawing = false;
        ctx.beginPath();
    }
}

function handleTouchStart(e) {
    e.preventDefault();
    isDrawing = true;
    hasSignature = true;
    const pos = getEventPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    checkFormCompletion();
}

function handleTouchMove(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getEventPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
}

function handleTouchEnd(e) {
    e.preventDefault();
    if (isDrawing) {
        isDrawing = false;
        ctx.beginPath();
    }
}

function clearSignature() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    hasSignature = false;
    checkFormCompletion();
}

function checkFormCompletion() {
    const name = document.getElementById('client-name').value.trim();
    const reviewBtn = document.getElementById('review-btn');
    
    if (name && hasSignature) {
        reviewBtn.disabled = false;
        reviewBtn.classList.add('glow');
    } else {
        reviewBtn.disabled = true;
        reviewBtn.classList.remove('glow');
    }
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    if (sectionId === 'contract-section') {
        setTimeout(() => {
            resizeCanvas();
        }, 100);
    }
}

function showReview() {
    const name = document.getElementById('client-name').value;
    const date = document.getElementById('agreement-date').value;
    
    document.getElementById('review-name').textContent = name;
    document.getElementById('review-date').textContent = new Date(date).toLocaleDateString('en-GB');
    
    showSection('review-section');
}

// Generate full contract text
function generateFullContract() {
    const name = document.getElementById('client-name').value;
    const date = document.getElementById('agreement-date').value;
    
    return `
TRADER BROTHERS LTD
STANDARD TERMS & CONDITIONS OF SUPPLY

AGREEMENT DETAILS:
Client Name/Company: ${name}
Agreement Date: ${new Date(date).toLocaleDateString('en-GB')}
Execution Time: ${new Date().toLocaleString('en-GB')}

COMPANY INFORMATION:
Trader Brothers Ltd
Registration: [Company Registration Number]
VAT Number: [VAT Registration Number]
Address: [Business Address]

CLIENT INFORMATION:
Company: ${document.getElementById('client-company').textContent}
Address: ${document.getElementById('client-address').textContent}
Email: ${document.getElementById('client-email').textContent}
Phone: ${document.getElementById('client-phone').textContent}
Project Contact: ${document.getElementById('client-contact').textContent}

TERMS AND CONDITIONS:

1. SERVICES: Professional joinery services including bespoke furniture manufacture, kitchen and bedroom fitting, commercial fit-outs, restoration work, and architectural millwork.

2. QUOTATIONS: Valid for 30 days from issue. Prices exclusive of VAT unless indicated.

3. PAYMENT: Due within 30 days of invoice. Projects over £5,000 may require stage payments.

4. WARRANTY: 12-month warranty on workmanship from completion date.

5. LIABILITY: Limited to contract value or £100,000 (whichever lower). Public liability £2,000,000, Professional indemnity £500,000.

6. MATERIALS: Remain our property until payment received in full.

7. VARIATIONS: Must be agreed in writing before commencement.

8. TERMINATION: 30 days written notice required.

9. DISPUTE RESOLUTION: Subject to English law and jurisdiction.

DIGITAL SIGNATURE: ✓ Provided and Verified

This agreement is legally binding upon digital signature.
    `;
}

async function submitAgreement() {
    const name = document.getElementById('client-name').value;
    const date = document.getElementById('agreement-date').value;
    const signatureData = canvas.toDataURL(); // Get signature as base64 image
    const fullContract = generateFullContract();
    
    // Create agreement data object for webhook
    const webhookData = {
        clientName: name,
        signedDate: date,
        submissionTimestamp: new Date().toISOString(),
        signedContract: fullContract,
        signature: signatureData,
        agreementType: 'Standard Terms & Conditions of Supply',
        status: 'Signed and Submitted'
    };
    
    try {
        // Show loading state
        const submitBtn = document.querySelector('button[onclick="submitAgreement()"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        
        // Send to Make.com webhook
        const response = await fetch('https://hook.eu2.make.com/em6i6rh7dh7x5htpyn7wqczpefxqz18d', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookData)
        });
        
        if (response.ok) {
            // Store locally for download
            window.agreementData = webhookData;
            
            // Show success and proceed to thank you page
            showSection('thankyou-section');
        } else {
            throw new Error('Failed to submit agreement');
        }
        
    } catch (error) {
        console.error('Error submitting agreement:', error);
        alert('There was an error submitting your agreement. Please try again or contact support.');
        
        // Reset button
        const submitBtn = document.querySelector('button[onclick="submitAgreement()"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function downloadAgreement() {
    const agreementData = window.agreementData;
    if (!agreementData) {
        alert('No agreement data found. Please complete the agreement process first.');
        return;
    }
    
    const content = `
TRADER BROTHERS LTD
STANDARD TERMS & CONDITIONS OF SUPPLY

CLIENT INFORMATION:
Name/Company: ${agreementData.clientName}
Agreement Date: ${new Date(agreementData.signedDate).toLocaleDateString('en-GB')}
Submission Time: ${new Date(agreementData.submissionTimestamp).toLocaleString('en-GB')}

AGREEMENT STATUS: ${agreementData.status}
Agreement Type: ${agreementData.agreementType}

TERMS SUMMARY:
- Payment Terms: 30 days from invoice date
- Warranty Period: 12 months on workmanship
- Liability Cap: £100,000 or contract value (whichever is lower)
- Public Liability Insurance: £2,000,000
- Professional Indemnity Insurance: £500,000

DIGITAL SIGNATURE: ✓ Provided and verified

This agreement has been digitally signed and is legally binding.
All standard terms and conditions as detailed in the full contract apply.

For the complete terms and conditions, please refer to the full contract document.

Generated by Trader Brothers Digital Agreement System
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TraderBrothers_Agreement_${agreementData.clientName.replace(/\s+/g, '_')}_${agreementData.signedDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

function startOver() {
    document.getElementById('client-name').value = '';
    clearSignature();
    document.getElementById('agreement-date').value = new Date().toISOString().split('T')[0];
    window.agreementData = null;
    showSection('profile-section');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    initializeSignaturePad();
});
