// Simple CAPTCHA Solver
(function() {
    'use strict';
    
    const OCR_API_KEY = "K81776520488957";
    
    // OCR function
    async function performOCR(jpg) {
        const url = 'https://api.ocr.space/parse/image';
        let data = new FormData();
        data.set("base64Image", jpg);
        data.set("apikey", OCR_API_KEY);
        data.set("language", "eng");
        
        try {
            const response = await fetch(url, {method: 'POST', body: data});
            const json = await response.json();
            return json;
        } catch (error) {
            console.error(error);
            return { error: true };
        }
    }

    // Convert image to base64
    function imageToBase64(img) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width || img.naturalWidth;
            canvas.height = img.height || img.naturalHeight;
            
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        });
    }

    // Clean OCR text
    function cleanOCRText(text) {
        if (!text) return '';
        
        // Remove non-alphanumeric
        let clean = text.replace(/[^a-zA-Z0-9]/g, '');
        
        // Basic OCR corrections
        clean = clean.replace(/0/g, 'o');
        clean = clean.replace(/1/g, 'l');
        clean = clean.replace(/5/g, 's');
        
        return clean.toLowerCase();
    }

    // Main solve function
    window.solveCaptcha = async function() {
        try {
            console.log('🔍 Solving CAPTCHA...');
            
            // Find elements
            const img = document.querySelector('#secureimg');
            const input = document.querySelector('#securitycode');
            
            if (!img || !input) {
                throw new Error('CAPTCHA elements not found');
            }
            
            // Convert to base64
            const base64 = await imageToBase64(img);
            
            // OCR
            const result = await performOCR(base64);
            
            if (result.error || result.IsErroredOnProcessing) {
                throw new Error('OCR failed');
            }
            
            const parsedText = result.ParsedResults?.[0]?.ParsedText || '';
            const cleanedText = cleanOCRText(parsedText);
            
            if (!cleanedText) {
                throw new Error('No text extracted');
            }
            
            // Input text
            input.value = cleanedText;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            
            console.log('✅ CAPTCHA solved:', cleanedText);
            return { success: true, text: cleanedText };
            
        } catch (error) {
            console.error('❌ CAPTCHA failed:', error.message);
            return { success: false, error: error.message };
        }
    };

    // Generic CAPTCHA solver
    window.solveCaptchaGeneric = async function() {
        try {
            console.log('🔍 Generic CAPTCHA solving...');
            
            // Find CAPTCHA elements with multiple selectors
            const captchaSelectors = [
                '#secureimg',
                '.captcha-image',
                '[id*="captcha"]',
                '[class*="captcha"]',
                'img[src*="captcha"]',
                'img[alt*="captcha"]'
            ];
            
            const inputSelectors = [
                '#securitycode',
                'input[name*="captcha"]',
                'input[id*="captcha"]',
                'input[placeholder*="captcha"]'
            ];
            
            let captchaImg = null;
            let captchaInput = null;
            
            // Find CAPTCHA image
            for (let selector of captchaSelectors) {
                captchaImg = document.querySelector(selector);
                if (captchaImg) break;
            }
            
            // Find CAPTCHA input
            for (let selector of inputSelectors) {
                captchaInput = document.querySelector(selector);
                if (captchaInput) break;
            }
            
            if (!captchaImg || !captchaInput) {
                return { success: false, error: 'CAPTCHA elements not found', noCaptcha: true };
            }
            
            // Convert to base64
            const base64 = await imageToBase64(captchaImg);
            
            // OCR
            const result = await performOCR(base64);
            
            if (result.error || result.IsErroredOnProcessing) {
                throw new Error('OCR failed');
            }
            
            const parsedText = result.ParsedResults?.[0]?.ParsedText || '';
            const cleanedText = cleanOCRText(parsedText);
            
            if (!cleanedText) {
                throw new Error('No text extracted');
            }
            
            // Input text
            captchaInput.value = cleanedText;
            captchaInput.dispatchEvent(new Event('input', { bubbles: true }));
            captchaInput.dispatchEvent(new Event('change', { bubbles: true }));
            
            console.log('✅ Generic CAPTCHA solved:', cleanedText);
            return { success: true, text: cleanedText };
            
        } catch (error) {
            console.error('❌ Generic CAPTCHA failed:', error.message);
            return { success: false, error: error.message };
        }
    };

    // Detect and solve CAPTCHA
    window.detectAndSolveCaptcha = async function() {
        console.log('🔍 Detecting CAPTCHA...');
        
        // Check if CAPTCHA exists
        const captchaImg = document.querySelector('#secureimg, .captcha-image, [id*="captcha"], [class*="captcha"]');
        const captchaInput = document.querySelector('#securitycode, input[name*="captcha"], input[id*="captcha"]');
        
        if (!captchaImg || !captchaInput) {
            console.log('✅ No CAPTCHA detected');
            return { success: true, noCaptcha: true };
        }
        
        console.log('🔐 CAPTCHA detected, attempting to solve...');
        return await window.solveCaptchaGeneric();
    };

    // Test function
    window.testCaptcha = async function() {
        const result = await window.solveCaptcha();
        alert(result.success ? 
            `✅ SUCCESS: ${result.text}` : 
            `❌ FAILED: ${result.error}`
        );
        return result;
    };

    // Auto solve
    window.autoSolve = async function() {
        const img = document.querySelector('#secureimg');
        const input = document.querySelector('#securitycode');
        
        if (img && input) {
            return await window.solveCaptcha();
        }
        
        return { success: false, error: 'No CAPTCHA found' };
    };

    // Export functions for compatibility
    window.performOCR = performOCR;
    window.imageToBase64 = imageToBase64;
    window.cleanOCRText = cleanOCRText;

    console.log('✅ Simple CAPTCHA Solver loaded');
    console.log('Commands: window.testCaptcha() | window.solveCaptcha() | window.autoSolve()');
    
})();
