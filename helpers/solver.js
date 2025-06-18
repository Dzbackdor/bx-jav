// Simple CAPTCHA Solver - Enhanced
(function() {
    'use strict';
    
    const OCR_API_KEY = "K81776520488957";
    
    // OCR function with better error handling
    async function OCR(jpg) {
        const url = 'https://api.ocr.space/parse/image';
        let data = new FormData();
        data.set("base64Image", jpg);
        data.set("apikey", OCR_API_KEY);
        data.set("language", "eng");
        data.set("OCREngine", "2"); // Try engine 2 for better accuracy
        
        try {
            console.log('🌐 Sending image to OCR API...');
            const response = await fetch(url, {
                method: 'POST', 
                body: data,
                timeout: 15000 // 15 second timeout
            });
            
            if (!response.ok) {
                throw new Error(`OCR API error: ${response.status}`);
            }
            
            const json = await response.json();
            console.log('📄 OCR API response:', json);
            return json;
        } catch (error) {
                       console.error('❌ OCR API error:', error);
            return { error: true, message: error.message };
        }
    }

    // Convert image to base64 with better error handling
    function imageToBase64(img) {
        return new Promise((resolve, reject) => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Wait for image to load if not loaded
                if (!img.complete) {
                    img.onload = () => processImage();
                    img.onerror = () => reject(new Error('Image failed to load'));
                } else {
                    processImage();
                }
                
                function processImage() {
                    canvas.width = img.width || img.naturalWidth || 200;
                    canvas.height = img.height || img.naturalHeight || 50;
                    
                    // Draw image with better quality
                    ctx.imageSmoothingEnabled = false;
                    ctx.drawImage(img, 0, 0);
                    
                    const dataURL = canvas.toDataURL('image/png', 1.0);
                    console.log('🖼️ Image converted to base64, size:', dataURL.length);
                    resolve(dataURL);
                }
            } catch (error) {
                console.error('❌ Image conversion error:', error);
                reject(error);
            }
        });
    }

    // Enhanced text cleaning
    function cleanText(text) {
        if (!text) return '';
        
        console.log('🧹 Original OCR text:', text);
        
        // Remove whitespace and newlines
        let clean = text.replace(/\s+/g, '').trim();
        
        // Remove common OCR artifacts
        clean = clean.replace(/[^a-zA-Z0-9]/g, '');
        
        // Basic OCR corrections (more conservative)
        const corrections = {
            '0': 'O',  // Zero to O
            '1': 'I',  // One to I  
            '5': 'S',  // Five to S
            '8': 'B',  // Eight to B
            '6': 'G',  // Six to G
        };
        
        // Apply corrections only if result makes sense
        let corrected = clean;
        for (let [from, to] of Object.entries(corrections)) {
            corrected = corrected.replace(new RegExp(from, 'g'), to);
        }
        
        console.log('🧹 Cleaned text:', clean);
        console.log('🔄 Corrected text:', corrected);
        
        // Return both versions for testing
        return {
            original: clean,
            corrected: corrected,
            final: corrected.toLowerCase()
        };
    }

    // Enhanced CAPTCHA detection
    function detectCaptcha() {
        console.log('🔍 Detecting CAPTCHA elements...');
        
        // Extended selectors for CAPTCHA images
        const imageSelectors = [
            '#secureimg',
            '.captcha-image', 
            '.captcha img',
            '[id*="captcha"]',
            '[class*="captcha"]',
            'img[src*="captcha"]',
            'img[alt*="captcha"]',
            'img[title*="captcha"]'
        ];
        
        // Extended selectors for CAPTCHA inputs
        const inputSelectors = [
            '#securitycode',
            'input[name*="captcha"]',
            'input[id*="captcha"]',
            'input[placeholder*="captcha"]',
            'input[class*="captcha"]',
            '.captcha input',
            'input[name="security_code"]',
            'input[name="verification_code"]'
        ];
        
        let captchaImg = null;
        let captchaInput = null;
        
        // Find CAPTCHA image
        for (let selector of imageSelectors) {
            captchaImg = document.querySelector(selector);
            if (captchaImg) {
                console.log('🎯 Found CAPTCHA image:', selector);
                break;
            }
        }
        
        // Find CAPTCHA input
        for (let selector of inputSelectors) {
            captchaInput = document.querySelector(selector);
            if (captchaInput) {
                console.log('🎯 Found CAPTCHA input:', selector);
                break;
            }
        }
        
        return {
            image: captchaImg,
            input: captchaInput,
            detected: !!(captchaImg && captchaInput)
        };
    }

    // Main solve function (ENHANCED)
    window.solveCaptcha = async function() {
        try {
            console.log('🔍 Solving CAPTCHA...');
            
            const detection = detectCaptcha();
            
            if (!detection.detected) {
                return { 
                    success: false, 
                    error: 'CAPTCHA elements not found',
                    noCaptcha: true 
                };
            }
            
            const { image: img, input } = detection;
            
            console.log('🖼️ Converting CAPTCHA image to base64...');
            const base64 = await imageToBase64(img);
            
            console.log('🤖 Processing with OCR...');
            const result = await OCR(base64);
            
            if (result.error || result.IsErroredOnProcessing) {
                throw new Error(result.message || 'OCR processing failed');
            }
            
            const parsedText = result.ParsedResults?.[0]?.ParsedText || '';
            
            if (!parsedText) {
                throw new Error('No text extracted from CAPTCHA');
            }
            
            const cleanedResult = cleanText(parsedText);
            
            if (!cleanedResult.final) {
                throw new Error('Cleaned text is empty');
            }
            
            // Try multiple text variations
            const textVariations = [
                cleanedResult.final,
                cleanedResult.original.toLowerCase(),
                cleanedResult.corrected.toLowerCase(),
                parsedText.replace(/\s+/g, '').toLowerCase()
            ];
            
            console.log('🎯 Text variations to try:', textVariations);
            
            // Use the first non-empty variation
            const finalText = textVariations.find(text => text && text.length > 0) || cleanedResult.final;
            
            // Input text with events
            input.value = finalText;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            input.dispatchEvent(new Event('keyup', { bubbles: true }));
            
            // Highlight the input field
            input.style.border = '2px solid #4CAF50';
            input.style.backgroundColor = '#E8F5E8';
            
            console.log('✅ CAPTCHA solved and input filled:', finalText);
            return { 
                success: true, 
                text: finalText,
                variations: textVariations,
                originalOCR: parsedText
            };
            
        } catch (error) {
            console.error('❌ CAPTCHA solving failed:', error.message);
            return { 
                success: false, 
                error: error.message,
                details: error
            };
        }
    };

    // ✅ ENHANCED autoSolve function
    window.autoSolve = async function() {
        console.log('🤖 Auto-solving CAPTCHA...');
        
        const detection = detectCaptcha();
        
        if (!detection.detected) {
            console.log('✅ No CAPTCHA found on this page');
            return { 
                success: true, 
                noCaptcha: true,
                error: 'No CAPTCHA found'
            };
        }
        
        console.log('🔐 CAPTCHA detected, attempting to solve...');
        return await window.solveCaptcha();
    };

    // Test function with better feedback
    window.testCaptcha = async function() {
        console.log('🧪 Testing CAPTCHA solver...');
        
        const detection = detectCaptcha();
        console.log('Detection result:', detection);
        
        if (!detection.detected) {
            const message = '❌ No CAPTCHA found on this page';
            console.log(message);
            alert(message);
            return { success: false, error: 'No CAPTCHA found' };
        }
        
        const result = await window.solveCaptcha();
        
        const message = result.success ? 
            `✅ SUCCESS: ${result.text}\nVariations tried: ${result.variations?.join(', ')}` : 
            `❌ FAILED: ${result.error}`;
            
        console.log(message);
        alert(message);
        return result;
    };

    // Enhanced detection test
    window.testCaptchaDetection = function() {
        console.log('🔍 Testing CAPTCHA detection...');
        
        const detection = detectCaptcha();
        
        console.log('Detection results:');
        console.log('- Image found:', !!detection.image);
        console.log('- Input found:', !!detection.input);
        console.log('- Overall detected:', detection.detected);
        
        if (detection.image) {
            console.log('- Image element:', detection.image);
            console.log('- Image src:', detection.image.src);
            console.log('- Image size:', detection.image.width + 'x' + detection.image.height);
        }
        
        if (detection.input) {
            console.log('- Input element:', detection.input);
            console.log('- Input name:', detection.input.name);
            console.log('- Input id:', detection.input.id);
        }
        
        return detection;
    };

    console.log('✅ Enhanced CAPTCHA Solver loaded');
    console.log('🎮 Available commands:');
    console.log('  window.testCaptcha() - Test solve CAPTCHA');
    console.log('  window.testCaptchaDetection() - Test detection only');
    console.log('  window.solveCaptcha() - Solve CAPTCHA');
    console.log('  window.autoSolve() - Auto detect and solve');
    
})();

