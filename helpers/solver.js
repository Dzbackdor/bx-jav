// Simple Auto-Retry CAPTCHA Solver - NO MANUAL INPUT
(function() {
    'use strict';
    
    const OCR_API_KEY = "K81776520488957";
    
    // ✅ GLOBAL STATE TRACKING
    let captchaSolveInProgress = false;
    let captchaAttempts = 0;
    let lastCaptchaAttempt = 0;
    
    // ✅ CONSTANTS - INCREASED RETRY
    const MAX_CAPTCHA_ATTEMPTS = 5;  // ✅ Increased to 5 attempts
    const CAPTCHA_TIMEOUT = 8000;    // 8 seconds timeout for OCR
    const RETRY_DELAY = 2000;        // 2 seconds between retries
    
    // ✅ OCR function with timeout
    async function performOCR(jpg) {
        const url = 'https://api.ocr.space/parse/image';
        let data = new FormData();
        data.set("base64Image", jpg);
        data.set("apikey", OCR_API_KEY);
        data.set("language", "eng");
        
        try {
            console.log('🔍 Calling OCR API...');
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CAPTCHA_TIMEOUT);
            
            const response = await fetch(url, {
                method: 'POST', 
                body: data,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`OCR API HTTP ${response.status}`);
            }
            
            const json = await response.json();
            console.log('✅ OCR API response received');
            
            return json;
            
        } catch (error) {
            console.error('❌ OCR API error:', error.message);
            return { error: true, message: error.message };
        }
    }

    // Convert image to base64
    function imageToBase64(img) {
        return new Promise((resolve, reject) => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width || img.naturalWidth || 150;
                canvas.height = img.height || img.naturalHeight || 50;
                
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/png');
                resolve(dataURL);
            } catch (error) {
                reject(error);
            }
        });
    }

    // ✅ ENHANCED OCR text cleaning with multiple variations
    function cleanOCRText(text) {
        if (!text) return '';
        
        // Try multiple cleaning approaches
        const variations = [];
        
        // Variation 1: Basic clean
        let clean1 = text.replace(/[^a-zA-Z0-9]/g, '');
        variations.push(clean1.toLowerCase());
        
        // Variation 2: OCR corrections
        let clean2 = text.replace(/[^a-zA-Z0-9]/g, '');
        clean2 = clean2.replace(/0/g, 'o');
        clean2 = clean2.replace(/1/g, 'l');
        clean2 = clean2.replace(/5/g, 's');
        clean2 = clean2.replace(/8/g, 'B');
        variations.push(clean2.toLowerCase());
        
        // Variation 3: Different OCR corrections
        let clean3 = text.replace(/[^a-zA-Z0-9]/g, '');
        clean3 = clean3.replace(/0/g, 'O');
        clean3 = clean3.replace(/1/g, 'I');
        clean3 = clean3.replace(/5/g, 'S');
        variations.push(clean3.toLowerCase());
        
        // Return the longest valid variation
        const validVariations = variations.filter(v => v.length >= 3);
        return validVariations.length > 0 ? validVariations[0] : variations[0] || '';
    }

    // ✅ DETECT CAPTCHA ELEMENTS
    function detectCaptchaElements() {
        const captchaSelectors = [
            '#secureimg',
            '.captcha-image',
            '[id*="captcha" i] img',
            '[class*="captcha" i] img',
            'img[src*="captcha" i]',
            'img[alt*="captcha" i]',
            'img[title*="captcha" i]'
        ];
        
        const inputSelectors = [
            '#securitycode',
            'input[name*="captcha" i]',
            'input[id*="captcha" i]',
            'input[placeholder*="captcha" i]',
            'input[class*="captcha" i]'
        ];
        
        let captchaImg = null;
        let captchaInput = null;
        
        // Find CAPTCHA image
        for (let selector of captchaSelectors) {
            captchaImg = document.querySelector(selector);
            if (captchaImg && captchaImg.offsetParent !== null) {
                console.log(`🎯 Found CAPTCHA image: ${selector}`);
                break;
            }
        }
        
        // Find CAPTCHA input
        for (let selector of inputSelectors) {
            captchaInput = document.querySelector(selector);
            if (captchaInput && captchaInput.offsetParent !== null) {
                console.log(`🎯 Found CAPTCHA input: ${selector}`);
                break;
            }
        }
        
        return { captchaImg, captchaInput };
    }

    // ✅ MAIN AUTO-RETRY CAPTCHA SOLVER
    window.detectAndSolveCaptcha = async function() {
        console.log(`🔐 CAPTCHA Auto-Retry Solver (Attempt ${captchaAttempts + 1}/${MAX_CAPTCHA_ATTEMPTS})`);
        
        try {
            // ✅ DETECT CAPTCHA ELEMENTS
            const { captchaImg, captchaInput } = detectCaptchaElements();
            
            if (!captchaImg || !captchaInput) {
                console.log('✅ No CAPTCHA detected on page');
                return { success: true, noCaptcha: true };
            }
            
            console.log('🔐 CAPTCHA detected, attempting auto-solve...');
            captchaAttempts++;
            
            // ✅ TRY OCR AUTO-SOLVE
            try {
                console.log(`🤖 OCR attempt ${captchaAttempts}/${MAX_CAPTCHA_ATTEMPTS}...`);
                
                const base64 = await imageToBase64(captchaImg);
                const result = await performOCR(base64);
                
                if (!result.error && !result.IsErroredOnProcessing) {
                    const parsedText = result.ParsedResults?.[0]?.ParsedText || '';
                    const cleanedText = cleanOCRText(parsedText);
                    
                    if (cleanedText && cleanedText.length >= 3) {
                        // ✅ INPUT THE CAPTCHA TEXT
                        captchaInput.value = cleanedText;
                        captchaInput.dispatchEvent(new Event('input', { bubbles: true }));
                        captchaInput.dispatchEvent(new Event('change', { bubbles: true }));
                        
                        console.log(`✅ CAPTCHA solved on attempt ${captchaAttempts}: ${cleanedText}`);
                        
                        // ✅ RESET ON SUCCESS
                        captchaAttempts = 0;
                        captchaSolveInProgress = false;
                        
                        return { success: true, text: cleanedText, attempt: captchaAttempts };
                    }
                }
                
                throw new Error('OCR failed to extract valid text');
                
            } catch (ocrError) {
                console.log(`❌ OCR attempt ${captchaAttempts} failed: ${ocrError.message}`);
                
                // ✅ AUTO-RETRY IF NOT MAX ATTEMPTS
                if (captchaAttempts < MAX_CAPTCHA_ATTEMPTS) {
                    console.log(`🔄 Auto-retrying in ${RETRY_DELAY/1000} seconds... (${captchaAttempts}/${MAX_CAPTCHA_ATTEMPTS})`);
                    
                    // ✅ WAIT AND RETRY
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                    
                    // ✅ RECURSIVE RETRY (but controlled)
                    return await window.detectAndSolveCaptcha();
                } else {
                    console.log(`❌ CAPTCHA failed after ${MAX_CAPTCHA_ATTEMPTS} attempts`);
                    
                    // ✅ RESET STATE
                    captchaAttempts = 0;
                    captchaSolveInProgress = false;
                    
                    return { 
                        success: false, 
                        error: `Failed after ${MAX_CAPTCHA_ATTEMPTS} attempts`,
                        maxAttemptsReached: true
                    };
                }
            }
            
        } catch (error) {
            console.error('❌ CAPTCHA solve error:', error);
            captchaAttempts = 0;
            captchaSolveInProgress = false;
            return { success: false, error: error.message };
        }
    };

    // ✅ RESET CAPTCHA STATE
    window.resetCaptchaState = function() {
        console.log('🔄 Resetting CAPTCHA state...');
        captchaSolveInProgress = false;
        captchaAttempts = 0;
        lastCaptchaAttempt = 0;
        console.log('✅ CAPTCHA state reset');
    };

    // ✅ GET CAPTCHA STATUS
    window.getCaptchaStatus = function() {
        return {
            inProgress: captchaSolveInProgress,
            attempts: captchaAttempts,
            maxAttempts: MAX_CAPTCHA_ATTEMPTS
        };
    };

    // ✅ LEGACY COMPATIBILITY
    window.solveCaptcha = window.detectAndSolveCaptcha;
    window.solveCaptchaGeneric = window.detectAndSolveCaptcha;
    window.autoSolve = window.detectAndSolveCaptcha;
    
    // Test function
    window.testCaptcha = async function() {
        const result = await window.detectAndSolveCaptcha();
        console.log('🧪 CAPTCHA Test Result:', result);
        return result;
    };

    // Export functions for compatibility
    window.performOCR = performOCR;
    window.imageToBase64 = imageToBase64;
    window.cleanOCRText = cleanOCRText;

    // ✅ AUTO-RESET ON PAGE CHANGE
    let currentUrl = window.location.href;
    setInterval(() => {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            window.resetCaptchaState();
        }
    }, 1000);

    console.log('✅ Auto-Retry CAPTCHA Solver loaded');
    console.log('🔄 Will auto-retry up to 5 times with 2 second delays');
    console.log('Commands: window.testCaptcha() | window.resetCaptchaState()');
    
})();
