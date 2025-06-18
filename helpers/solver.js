// Simple CAPTCHA Solver
(function() {
    'use strict';
    
    const OCR_API_KEY = "K81776520488957";
    
    // OCR function - EXPORT ke window
    window.performOCR = async function(jpg) {
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
    };

    // Convert image to base64 - EXPORT ke window
    window.imageToBase64 = function(img) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width || img.naturalWidth;
            canvas.height = img.height || img.naturalHeight;
            
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        });
    };

    // Clean OCR text - EXPORT ke window
    window.cleanOCRText = function(text) {
        if (!text) return '';
        
        // Remove non-alphanumeric
        let clean = text.replace(/[^a-zA-Z0-9]/g, '');
        
        // Basic OCR corrections
        clean = clean.replace(/0/g, 'o');
        clean = clean.replace(/1/g, 'l');
        clean = clean.replace(/5/g, 's');
        
        return clean.toLowerCase();
    };

    // Main solve function (original selectors)
    window.solveCaptcha = async function() {
        try {
            console.log('🔍 Solving CAPTCHA...');
            
            const img = document.querySelector('#secureimg');
            const input = document.querySelector('#securitycode');
            
            if (!img || !input) {
                throw new Error('CAPTCHA elements not found');
            }
            
            const base64 = await window.imageToBase64(img);
            const result = await window.performOCR(base64);
            
            if (result.error || result.IsErroredOnProcessing) {
                throw new Error('OCR failed');
            }
            
            const parsedText = result.ParsedResults?.[0]?.ParsedText || '';
            const cleanedText = window.cleanOCRText(parsedText);
            
            if (!cleanedText) {
                throw new Error('No text extracted');
            }
            
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

    // Generic CAPTCHA solver - EXPORT ke window
    window.solveCaptchaGeneric = async function(imgElement, inputElement) {
        try {
            console.log('🔍 Solving CAPTCHA with custom elements...');
            
            const base64 = await window.imageToBase64(imgElement);
            const result = await window.performOCR(base64);
            
            if (result.error || result.IsErroredOnProcessing) {
                throw new Error('OCR failed');
            }
            
            const parsedText = result.ParsedResults?.[0]?.ParsedText || '';
            const cleanedText = window.cleanOCRText(parsedText);
            
            if (!cleanedText) {
                throw new Error('No text extracted');
            }
            
            inputElement.value = cleanedText;
            inputElement.dispatchEvent(new Event('input', { bubbles: true }));
            inputElement.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Visual feedback
            inputElement.style.border = '2px solid #4CAF50';
            inputElement.style.backgroundColor = '#e8f5e8';
            
            console.log('✅ CAPTCHA solved:', cleanedText);
            return { success: true, text: cleanedText };
            
        } catch (error) {
            console.error('❌ CAPTCHA failed:', error.message);
            return { success: false, error: error.message };
        }
    };

    // CAPTCHA Detection - EXPORT ke window
    window.detectAndSolveCaptcha = async function() {
        console.log('🔍 Checking for CAPTCHA...');
        
        const captchaSelectors = [
            '#secureimg',
            '.captcha-image',
            '[id*="captcha"]',
            '[class*="captcha"]',
            'img[src*="captcha"]',
            'img[alt*="captcha"]',
            'img[title*="captcha"]'
        ];
        
        const inputSelectors = [
            '#securitycode',
            'input[name*="captcha"]',
            'input[id*="captcha"]',
            'input[placeholder*="captcha"]',
            'input[class*="captcha"]'
        ];
        
        let captchaImg = null;
        let captchaInput = null;
        
        // Find CAPTCHA image
        for (let selector of captchaSelectors) {
            captchaImg = document.querySelector(selector);
            if (captchaImg) {
                console.log(`🎯 Found CAPTCHA image: ${selector}`);
                break;
            }
        }
        
        // Find CAPTCHA input
        for (let selector of inputSelectors) {
            captchaInput = document.querySelector(selector);
            if (captchaInput) {
                console.log(`🎯 Found CAPTCHA input: ${selector}`);
                break;
            }
        }
        
        // If both found, solve CAPTCHA
        if (captchaImg && captchaInput) {
            console.log('🔐 CAPTCHA detected, attempting to solve...');
            
            try {
                const result = await window.solveCaptchaGeneric(captchaImg, captchaInput);
                
                if (result.success) {
                    console.log('✅ CAPTCHA solved successfully:', result.text);
                    return { success: true, text: result.text };
                } else {
                    console.log('❌ CAPTCHA solving failed:', result.error);
                    return { success: false, error: result.error };
                }
            } catch (error) {
                console.error('❌ CAPTCHA solving error:', error);
                return { success: false, error: error.message };
            }
        }
        
        console.log('ℹ️ No CAPTCHA detected');
        return { success: true, noCaptcha: true };
    };

    // Test functions (unchanged)
    window.testCaptcha = async function() {
        const result = await window.solveCaptcha();
        alert(result.success ? 
            `✅ SUCCESS: ${result.text}` : 
            `❌ FAILED: ${result.error}`
        );
        return result;
    };

    window.autoSolve = async function() {
        const img = document.querySelector('#secureimg');
        const input = document.querySelector('#securitycode');
        
        if (img && input) {
            return await window.solveCaptcha();
        }
        
        return { success: false, error: 'No CAPTCHA found' };
    };

    console.log('✅ Simple CAPTCHA Solver loaded');
    console.log('Commands: window.testCaptcha() | window.solveCaptcha() | window.autoSolve()');
    console.log('🔧 Functions exported: performOCR, imageToBase64, cleanOCRText, solveCaptchaGeneric, detectAndSolveCaptcha');
    
})();
