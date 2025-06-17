// Close Popup Helper - Standalone
(function() {
    'use strict';
    
    // Close popup function - menutup popup cookie consent
    window.closePopup = function() {
        console.log('🔍 Checking for popup to close...');
        
        // Selector untuk popup close button berdasarkan data yang diberikan
        const popupCloseSelectors = [
            'button[data-borlabs-cookie-actions="close-button"]',
            'button.brlbs-cmpnt-close-button',
            'button[aria-label*="Dialog geschlossen"]',
            'button[aria-label*="close"]',
            // Tambahan selector umum untuk popup lain
            '.cookie-notice button[aria-label*="close"]',
            '.cookie-banner button[aria-label*="close"]',
            '.gdpr-notice button[aria-label*="close"]',
            '[data-dismiss="modal"]',
            '.modal-close',
            '.popup-close'
        ];
        
        let popupClosed = false;
        
        for (let selector of popupCloseSelectors) {
            const closeButton = document.querySelector(selector);
            if (closeButton && closeButton.offsetParent !== null) { // Check if visible
                console.log('🚪 Found popup close button:', selector);
                
                // Highlight button sebelum diklik
                closeButton.style.outline = '3px solid #FF5722';
                closeButton.style.outlineOffset = '2px';
                
                // Click button
                closeButton.click();
                console.log('✅ Popup closed successfully');
                popupClosed = true;
                
                // Remove highlight after delay
                setTimeout(() => {
                    if (closeButton.style) {
                        closeButton.style.outline = '';
                        closeButton.style.outlineOffset = '';
                    }
                }, 1000);
                
                break; // Stop after first popup closed
            }
        }
        
        if (!popupClosed) {
            console.log('ℹ️ No popup found to close');
        }
        
        return popupClosed;
    };
    
    // Test popup detection (untuk debugging)
    window.testPopupDetection = function() {
        console.log('🧪 Testing popup detection...');
        
        const popupCloseSelectors = [
            'button[data-borlabs-cookie-actions="close-button"]',
            'button.brlbs-cmpnt-close-button',
            'button[aria-label*="Dialog geschlossen"]',
            'button[aria-label*="close"]',
            '.cookie-notice button[aria-label*="close"]',
            '.cookie-banner button[aria-label*="close"]',
            '.gdpr-notice button[aria-label*="close"]',
            '[data-dismiss="modal"]',
            '.modal-close',
            '.popup-close'
        ];
        
        let foundPopups = [];
        
        popupCloseSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element.offsetParent !== null) { // Only visible elements
                    foundPopups.push({
                        selector: selector,
                        element: element,
                        text: element.textContent.trim(),
                        ariaLabel: element.getAttribute('aria-label'),
                        className: element.className
                    });
                    
                    // Highlight found popup buttons
                    element.style.outline = '3px solid #2196F3';
                    element.style.outlineOffset = '2px';
                    
                    setTimeout(() => {
                        if (element.style) {
                            element.style.outline = '';
                            element.style.outlineOffset = '';
                        }
                    }, 3000);
                }
            });
        });
        
        console.log(`🔍 Found ${foundPopups.length} popup close buttons:`, foundPopups);
        
        if (foundPopups.length > 0) {
            alert(`Found ${foundPopups.length} popup close button(s). Check console for details. Buttons are highlighted in blue.`);
        } else {
            alert('No popup close buttons found on this page.');
        }
        
        return foundPopups;
    };
    
    console.log('✅ Close Popup helper loaded');
    
})();