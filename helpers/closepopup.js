// Close Popup Helper - FIXED INFINITE LOOP VERSION
(function() {
    'use strict';
    
    // ✅ GLOBAL STATE - Moved outside function to persist
    let globalPopupAttempts = 0;
    let globalPopupClosed = false;
    let isPopupCloseInProgress = false;
    let lastPopupCloseTime = 0;
    
    // ✅ CONSTANTS
    const MAX_ATTEMPTS = 3;
    const COOLDOWN_TIME = 5000; // 5 seconds
    
    // Enhanced close popup function
    window.closePopup = function() {
        // ✅ PREVENT MULTIPLE SIMULTANEOUS CALLS
        if (isPopupCloseInProgress) {
            console.log('🚫 Popup close already in progress, skipping...');
            return false;
        }
        
        // ✅ CHECK COOLDOWN
        const now = Date.now();
        if (now - lastPopupCloseTime < COOLDOWN_TIME) {
            console.log('🚫 Popup close in cooldown, skipping...');
            return false;
        }
        
        // ✅ CHECK MAX ATTEMPTS
        if (globalPopupAttempts >= MAX_ATTEMPTS) {
            console.log(`🚫 Max popup attempts (${MAX_ATTEMPTS}) reached, stopping...`);
            return false;
        }
        
        // ✅ SET STATE
        isPopupCloseInProgress = true;
        lastPopupCloseTime = now;
        globalPopupAttempts++;
        
        console.log(`🔍 Checking for popup to close... (Attempt ${globalPopupAttempts}/${MAX_ATTEMPTS})`);
        
        // Comprehensive popup close selectors
        const popupCloseSelectors = [
            // Borlabs Cookie specific
            'button[data-borlabs-cookie-actions="close-button"]',
            'button.brlbs-cmpnt-close-button',
            'button[aria-label*="Dialog geschlossen"]',
            '.borlabs-cookie-box .brlbs-btn',
            
            // Cookie consent patterns
            'button[aria-label*="close" i]',
            'button[aria-label*="schließen" i]',
            'button[aria-label*="tutup" i]',
            'button[title*="close" i]',
            'button[title*="tutup" i]',
            
            // Common cookie consent selectors
            '.cookie-notice button',
            '.cookie-banner button',
            '.cookie-consent button',
            '.gdpr-notice button',
            '#cookie-notice .cookie-close',
            '.cookie-consent-close',
            '.gdpr-close',
            '.cookie-accept',
            '.cookie-dismiss',
            
            // Generic modal/popup patterns
            '[data-dismiss="modal"]',
            '[data-close="modal"]',
            '[data-bs-dismiss="modal"]',
            '.modal-close',
            '.popup-close',
            '.close-button',
            '.btn-close',
            'button.close',
            '.close'
        ];
        
        // Function to check if element is visible and clickable
        function isElementClickable(element) {
            if (!element) return false;
            
            const rect = element.getBoundingClientRect();
            const style = window.getComputedStyle(element);
            
            return (
                element.offsetParent !== null &&
                style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                style.opacity !== '0' &&
                rect.width > 0 &&
                rect.height > 0 &&
                rect.top >= 0 &&
                rect.left >= 0
            );
        }
        
        // Function to simulate realistic click
        function simulateClick(element) {
            try {
                // Scroll element into view first
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Wait a bit for scroll
                setTimeout(() => {
                    // Multiple event types for better compatibility
                    const events = [
                        new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
                        new MouseEvent('mouseup', { bubbles: true, cancelable: true }),
                        new MouseEvent('click', { bubbles: true, cancelable: true })
                    ];
                    
                    events.forEach(event => {
                        try {
                            element.dispatchEvent(event);
                        } catch (e) {
                            console.log('Event dispatch error:', e);
                        }
                    });
                    
                    // Also try direct click
                    try {
                        element.click();
                    } catch (e) {
                        console.log('Direct click error:', e);
                    }
                }, 100);
            } catch (error) {
                console.log('simulateClick error:', error);
            }
        }
        
        // Function to handle text-based selectors
        function findByText(text) {
            const buttons = document.querySelectorAll('button, a, span, div');
            return Array.from(buttons).filter(el => {
                const textContent = el.textContent.trim();
                return textContent === text || textContent.includes(text);
            });
        }
        
        // ✅ MAIN POPUP CLOSING LOGIC - NO RECURSION
        function attemptClose() {
            console.log(`🔄 Popup close attempt ${globalPopupAttempts}/${MAX_ATTEMPTS}`);
            
            for (let selector of popupCloseSelectors) {
                try {
                    let elements = [];
                    
                    // Handle text-based selectors
                    if (selector.includes(':contains(')) {
                        const match = selector.match(/:contains\("([^"]+)"\)/);
                        if (match) {
                            elements = findByText(match[1]);
                        }
                    } else {
                        elements = Array.from(document.querySelectorAll(selector));
                    }
                    
                    for (let element of elements) {
                        if (isElementClickable(element)) {
                            console.log('🚪 Found clickable popup element:', selector);
                            console.log('Element text:', element.textContent.trim().substring(0, 50));
                            
                            // Highlight element
                            const originalOutline = element.style.outline;
                            const originalZIndex = element.style.zIndex;
                            
                            element.style.outline = '3px solid #FF5722';
                            element.style.outlineOffset = '2px';
                            element.style.zIndex = '999999';
                            
                            // Try to click
                            simulateClick(element);
                            
                            // Restore original styles after delay
                            setTimeout(() => {
                                element.style.outline = originalOutline;
                                element.style.zIndex = originalZIndex;
                            }, 2000);
                            
                            globalPopupClosed = true;
                            console.log('✅ Popup close attempted with:', selector);
                            
                            // ✅ CHECK IF POPUP ACTUALLY CLOSED
                            setTimeout(() => {
                                if (!isElementClickable(element)) {
                                    console.log('✅ Popup confirmed closed');
                                    // ✅ RESET STATE ON SUCCESS
                                    globalPopupAttempts = 0;
                                    globalPopupClosed = false;
                                } else {
                                    console.log('⚠️ Popup might still be visible');
                                }
                                isPopupCloseInProgress = false;
                            }, 1000);
                            
                            return true; // Exit on first successful attempt
                        }
                    }
                } catch (error) {
                    console.log('⚠️ Error with selector:', selector, error);
                }
            }
            
            return false;
        }
        
        // ✅ TRY TO CLOSE POPUP
        const success = attemptClose();
        
        // ✅ FALLBACK: ESC KEY (NO RECURSION)
        if (!success) {
            console.log('🔄 Trying ESC key...');
            try {
                const escEvent = new KeyboardEvent('keydown', {
                    key: 'Escape',
                    keyCode: 27,
                    which: 27,
                    bubbles: true,
                    cancelable: true
                });
                document.dispatchEvent(escEvent);
                document.body.dispatchEvent(escEvent);
            } catch (error) {
                console.log('ESC key error:', error);
            }
            
            // ✅ RESET STATE AFTER FAILED ATTEMPT
            setTimeout(() => {
                isPopupCloseInProgress = false;
            }, 1000);
        }
        
        // ✅ FINAL CHECK AND CLEANUP
        if (globalPopupAttempts >= MAX_ATTEMPTS) {
            console.log(`ℹ️ No popup found to close after ${MAX_ATTEMPTS} attempts`);
            
            // Debug: Show potential popup elements
            const potentialPopups = document.querySelectorAll(
                '[class*="modal"], [class*="popup"], [class*="cookie"], [class*="consent"], [class*="overlay"]'
            );
            if (potentialPopups.length > 0) {
                console.log('🔍 Found potential popup elements:', potentialPopups);
            }
            
            // ✅ RESET STATE AFTER MAX ATTEMPTS
            setTimeout(() => {
                globalPopupAttempts = 0;
                globalPopupClosed = false;
                isPopupCloseInProgress = false;
            }, 2000);
        }
        
        return globalPopupClosed;
    };
    
    // ✅ RESET POPUP STATE FUNCTION
    window.resetPopupState = function() {
        console.log('🔄 Resetting popup state...');
        globalPopupAttempts = 0;
        globalPopupClosed = false;
        isPopupCloseInProgress = false;
        lastPopupCloseTime = 0;
        console.log('✅ Popup state reset');
    };
    
    // ✅ GET POPUP STATUS
    window.getPopupStatus = function() {
        return {
            attempts: globalPopupAttempts,
            maxAttempts: MAX_ATTEMPTS,
            closed: globalPopupClosed,
            inProgress: isPopupCloseInProgress,
            cooldownRemaining: Math.max(0, COOLDOWN_TIME - (Date.now() - lastPopupCloseTime))
        };
    };
    
    // Enhanced test function for debugging
    window.testPopupDetection = function() {
        console.log('🧪 Testing popup detection...');
        
        const keywords = ['modal', 'popup', 'cookie', 'consent', 'gdpr', 'overlay', 'dialog'];
        let foundElements = [];
        
        // Search for elements with popup-related classes or IDs
        keywords.forEach(keyword => {
            const elements = document.querySelectorAll(`[class*="${keyword}"], [id*="${keyword}"]`);
            elements.forEach(el => {
                if (el.offsetParent !== null) { // Only visible elements
                    foundElements.push({
                        element: el,
                        keyword: keyword,
                        tagName: el.tagName,
                        className: el.className,
                        id: el.id,
                        text: el.textContent.trim().substring(0, 100),
                        visible: true
                    });
                    
                    // Highlight for 5 seconds
                    el.style.outline = '3px solid #2196F3';
                    el.style.outlineOffset = '2px';
                    setTimeout(() => {
                        el.style.outline = '';
                        el.style.outlineOffset = '';
                    }, 5000);
                }
            });
        });
        
        // Also look for buttons with close-related text
        const buttons = document.querySelectorAll('button, a');
        buttons.forEach(btn => {
            const text = btn.textContent.toLowerCase();
            if (text.includes('close') || text.includes('×') || text.includes('tutup') ||
                text.includes('ok') || text.includes('accept') || text.includes('setuju')) {
                if (btn.offsetParent !== null) {
                    foundElements.push({
                        element: btn,
                        keyword: 'close-button',
                        tagName: btn.tagName,
                        className: btn.className,
                        id: btn.id,
                        text: btn.textContent.trim(),
                        visible: true
                    });
                    
                    btn.style.outline = '3px solid #FF9800';
                    btn.style.outlineOffset = '2px';
                    setTimeout(() => {
                        btn.style.outline = '';
                        btn.style.outlineOffset = '';
                    }, 5000);
                }
            }
        });
        
        console.log(`🔍 Found ${foundElements.length} potential popup elements:`, foundElements);
        console.log('📊 Current popup status:', window.getPopupStatus());
        
        if (foundElements.length > 0) {
            alert(`Found ${foundElements.length} potential popup elements. Check console for details. Elements highlighted for 5 seconds.`);
        } else {
            alert('No popup elements detected on this page.');
        }
        
        return foundElements;
    };
    
    // Force close all visible overlays/modals
    window.forceCloseAllPopups = function() {
        console.log('💪 Force closing all popups...');
        
        const overlaySelectors = [
            '.modal', '.popup', '.overlay', '.dialog',
            '[class*="modal"]', '[class*="popup"]', '[class*="overlay"]',
            '[style*="position: fixed"]', '[style*="position:fixed"]'
        ];
        
        let closed = 0;
        
        overlaySelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el.offsetParent !== null) {
                    el.style.display = 'none';
                    el.style.visibility = 'hidden';
                    el.style.opacity = '0';
                    el.remove();
                    closed++;
                }
            });
        });
        
        // ✅ RESET STATE AFTER FORCE CLOSE
        window.resetPopupState();
        
        console.log(`💪 Force closed ${closed} popup elements`);
        return closed > 0;
    };
    
    // ✅ AUTO-RESET ON PAGE CHANGE
    let currentUrl = window.location.href;
    setInterval(() => {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            console.log('🔄 Page changed, resetting popup state');
            window.resetPopupState();
        }
    }, 1000);
    
    
    console.log('✅ Enhanced Close Popup helper loaded - INFINITE LOOP FIXED');
    console.log('💡 Available functions:');
    console.log('   - closePopup() - Close popups intelligently (max 3 attempts)');
    console.log('   - testPopupDetection() - Debug popup detection');
    console.log('   - forceCloseAllPopups() - Force close all popups');
    console.log('   - resetPopupState() - Reset popup attempt counter');
    console.log('   - getPopupStatus() - Check current popup status');
    
})();
