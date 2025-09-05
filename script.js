// Initialize page with URL parameters or default values
function initializePage() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Decode URL parameters to handle spaces and special characters
    document.getElementById('client-company').textContent = 
        decodeURIComponent(urlParams.get('company') || '[CLIENT_COMPANY]');
    document.getElementById('client-address').textContent = 
        decodeURIComponent(urlParams.get('address') || '[CLIENT_ADDRESS]');
    document.getElementById('client-email').textContent = 
        decodeURIComponent(urlParams.get('email') || '[CLIENT_EMAIL]');
    document.getElementById('client-phone').textContent = 
        decodeURIComponent(urlParams.get('phone') || '[CLIENT_PHONE]');
    document.getElementById('client-contact').textContent = 
        decodeURIComponent(urlParams.get('contact') || '[CLIENT_CONTACT]');
    
    // Pre-populate the client name field if contact parameter is provided
    if (urlParams.get('contact')) {
        document.getElementById('client-name').value = decodeURIComponent(urlParams.get('contact'));
    }
    
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

// Generate PDF of the contract
async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const name = document.getElementById('client-name').value;
    const date = document.getElementById('agreement-date').value;
    const clientCompany = document.getElementById('client-company').textContent;
    const clientAddress = document.getElementById('client-address').textContent;
    const clientEmail = document.getElementById('client-email').textContent;
    const clientPhone = document.getElementById('client-phone').textContent;
    const clientContact = document.getElementById('client-contact').textContent;
    
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    
    // Helper function to add text with automatic page breaks
    function addText(text, fontSize = 11, fontStyle = 'normal', color = 'black') {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        doc.setTextColor(color);
        
        const splitText = doc.splitTextToSize(text, 190);
        const textHeight = splitText.length * (fontSize * 0.35);
        
        if (yPosition + textHeight > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
        }
        
        doc.text(splitText, margin, yPosition);
        yPosition += textHeight + 3;
    }
    
    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(44, 62, 80);
    doc.text('TRADER BROTHERS LTD', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102);
    doc.text('Professional Joinery Services & Bespoke Craftsmanship', margin, yPosition);
    yPosition += 10;
    
    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(44, 62, 80);
    doc.text('STANDARD TERMS & CONDITIONS OF SUPPLY', margin, yPosition);
    yPosition += 10;
    
    // Agreement details
    addText('AGREEMENT DETAILS:', 14, 'bold', 'black');
    addText(`Client Name/Company: ${name}`, 11, 'normal');
    addText(`Agreement Date: ${new Date(date).toLocaleDateString('en-GB')}`, 11, 'normal');
    addText(`Execution Time: ${new Date().toLocaleString('en-GB')}`, 11, 'normal');
    yPosition += 5;
    
    // Company Information
    addText('1. TRADER BROTHERS COMPANY INFORMATION:', 12, 'bold');
    addText('Trader Brothers Ltd\nRegistration: [Company Registration Number]\nVAT Number: [VAT Registration Number]\nAddress: [Business Address]', 11, 'normal');
    yPosition += 3;
    
    // Client Information
    addText('2. CLIENT INFORMATION:', 12, 'bold');
    addText(`Company: ${clientCompany}\nAddress: ${clientAddress}\nEmail: ${clientEmail}\nPhone: ${clientPhone}\nProject Contact: ${clientContact}`, 11, 'normal');
    yPosition += 3;
    
    // Terms and conditions
    const terms = [
        {
            title: '3. SERVICES',
            content: 'We provide professional joinery services including but not limited to: bespoke furniture manufacture, kitchen and bedroom fitting, commercial fit-outs, restoration work, and architectural millwork. All services are provided in accordance with industry standards and building regulations.'
        },
        {
            title: '4. QUOTATIONS AND PRICING',
            content: 'All quotations are valid for 30 days from date of issue unless otherwise stated. Prices are exclusive of VAT unless otherwise indicated. We reserve the right to adjust prices for variations to the original specification, changes in material costs, or additional work requested by the client.'
        },
        {
            title: '5. PAYMENT TERMS',
            content: 'Payment is due within 30 days of invoice date unless otherwise agreed in writing. For projects exceeding £5,000, we may require stage payments as work progresses. Late payment may incur charges in accordance with the Late Payment of Commercial Debts (Interest) Act 1998.'
        },
        {
            title: '6. MATERIALS AND WORKMANSHIP',
            content: 'All materials supplied will be of merchantable quality and suitable for purpose. We provide a 12-month warranty on workmanship from completion date. Manufacturer warranties on materials and hardware are passed through to the client. Any defects must be reported promptly for remedy under warranty.'
        },
        {
            title: '7. SITE ACCESS AND CLIENT OBLIGATIONS',
            content: 'The client must provide safe and reasonable access to the work site, adequate storage space for materials, and a clean, dry working environment. Any delays caused by lack of access, site conditions, or client preparation will be charged at our standard hourly rates.'
        },
        {
            title: '8. VARIATIONS AND CHANGES',
            content: 'Any changes to the original specification must be agreed in writing before commencement. Additional work will be charged according to our standard rates and may affect completion dates. We will provide written estimates for all significant variations before proceeding.'
        },
        {
            title: '9. LIMITATION OF LIABILITY',
            content: 'Our liability is limited to the contract value or £100,000, whichever is lower, except for death or personal injury caused by our negligence. We are not liable for indirect or consequential losses. Our insurance covers public liability of £2,000,000 and professional indemnity of £500,000.'
        },
        {
            title: '10. RETENTION OF TITLE',
            content: 'Materials remain our property until payment is received in full. We reserve the right to remove unpaid materials from site. Risk in materials passes to the client upon delivery to site.'
        },
        {
            title: '11. FORCE MAJEURE',
            content: 'We are not liable for delays caused by circumstances beyond our reasonable control including but not limited to: material supply shortages, extreme weather, labour disputes, or government restrictions.'
        },
        {
            title: '12. HEALTH AND SAFETY',
            content: 'We maintain comprehensive health and safety policies and insurance. All personnel are appropriately trained and certified. We comply with all relevant health and safety legislation and CDM regulations where applicable.'
        },
        {
            title: '13. TERMINATION',
            content: 'Either party may terminate this agreement with 30 days written notice. In the event of termination, payment is due for all work completed up to the termination date. Any work in progress will be completed to a safe stopping point or as mutually agreed. Materials ordered specifically for the project remain the client\'s responsibility for payment.'
        },
        {
            title: '14. INTELLECTUAL PROPERTY RIGHTS',
            content: 'Custom designs and plans remain the property of Trader Brothers unless specifically transferred in writing. We retain the right to use completed projects for portfolio and marketing purposes unless client requests confidentiality in writing. All client information and project details are treated as confidential and will not be disclosed to third parties without consent.'
        },
        {
            title: '15. DATA PROTECTION',
            content: 'We process personal data in accordance with GDPR and UK data protection legislation. Client information is held securely and used only for legitimate business purposes related to service provision.'
        },
        {
            title: '16. DISPUTE RESOLUTION',
            content: 'Any disputes will first be addressed through direct negotiation. If unresolved, disputes will be subject to mediation under the Centre for Dispute Resolution (CEDR) rules. These terms are governed by English law and subject to the jurisdiction of English courts.'
        }
    ];
    
    terms.forEach(term => {
        addText(term.title, 12, 'bold');
        addText(term.content, 11, 'normal');
        yPosition += 2;
    });
    
    // Digital signature section
    if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
    }
    
    addText('DIGITAL SIGNATURE:', 14, 'bold');
    addText('By signing below, the client acknowledges having read, understood, and agreed to be bound by these Terms and Conditions of Supply.', 11, 'normal');
    
    // Add signature image
    const signatureData = canvas.toDataURL('image/png');
    try {
        doc.addImage(signatureData, 'PNG', margin, yPosition, 80, 30);
        yPosition += 35;
    } catch (error) {
        console.warn('Could not add signature image:', error);
        addText('Digital Signature: ✓ Provided and Verified', 11, 'normal');
    }
    
    addText(`Signed by: ${name}`, 11, 'bold');
    addText(`Date: ${new Date(date).toLocaleDateString('en-GB')}`, 11, 'normal');
    yPosition += 5;
    
    addText('This agreement is legally binding upon digital signature.', 11, 'italic');
    
    return doc;
}

// Generate full contract text (kept for webhook compatibility)
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

// Enhanced submit function with PDF generation and sending
async function submitAgreement() {
    const name = document.getElementById('client-name').value;
    const date = document.getElementById('agreement-date').value;
    const signatureData = canvas.toDataURL(); // Get signature as base64 image
    const fullContract = generateFullContract();
    
    // Get URL parameters for client tracking
    const urlParams = new URLSearchParams(window.location.search);
    
    try {
        // Show loading state
        const submitBtn = document.querySelector('button[onclick="submitAgreement()"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Generating PDF...';
        submitBtn.disabled = true;
        
        // Generate PDF
        const pdf = await generatePDF();
        const pdfBlob = pdf.output('blob');
        const pdfBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(pdfBlob);
        });
        
        // Create filename in format: Name/DateSigned
        const formattedDate = new Date(date).toISOString().split('T')[0];
        const pdfFileName = `${name.replace(/[^a-zA-Z0-9]/g, '_')}/${formattedDate}.pdf`;
        
        submitBtn.textContent = 'Submitting...';
        
        // Create agreement data object for webhook
        const webhookData = {
            clientName: name,
            clientCompany: document.getElementById('client-company').textContent,
            clientEmail: document.getElementById('client-email').textContent,
            clientPhone: document.getElementById('client-phone').textContent,
            clientAddress: document.getElementById('client-address').textContent,
            signedDate: date,
            submissionTimestamp: new Date().toISOString(),
            signedContract: fullContract,
            signature: signatureData,
            agreementType: 'Standard Terms & Conditions of Supply',
            status: 'Signed and Submitted',
            sourceUrl: window.location.href,
            userAgent: navigator.userAgent,
            pdfAttachment: pdfBase64,
            pdfFileName: pdfFileName
        };
        
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
            window.agreementPDF = pdf;
            
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

async function downloadAgreement() {
    try {
        let pdf;
        
        if (window.agreementPDF) {
            // Use existing PDF
            pdf = window.agreementPDF;
        } else {
            // Generate new PDF
            pdf = await generatePDF();
        }
        
        const agreementData = window.agreementData;
        const name = agreementData ? agreementData.clientName : document.getElementById('client-name').value;
        const date = agreementData ? agreementData.signedDate : document.getElementById('agreement-date').value;
        
        // Create filename in format: Name/DateSigned
        const formattedDate = new Date(date).toISOString().split('T')[0];
        const fileName = `TraderBrothers_Agreement_${name.replace(/[^a-zA-Z0-9]/g, '_')}_${formattedDate}.pdf`;
        
        // Download the PDF
        pdf.save(fileName);
        
    } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('There was an error generating the PDF. Please try again.');
    }
}

function startOver() {
    document.getElementById('client-name').value = '';
    clearSignature();
    document.getElementById('agreement-date').value = new Date().toISOString().split('T')[0];
    window.agreementData = null;
    window.agreementPDF = null;
    showSection('profile-section');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    initializeSignaturePad();
});
