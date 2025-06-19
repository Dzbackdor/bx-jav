// Form Filling Helper - Enhanced with CAPTCHA Support
(function() {
    'use strict';
    
    // Backup original functions for safety
    const _originalAutoSubmit = window.autoSubmitForm;
    
    // Fill WordPress form (ENHANCED with CAPTCHA)
    window.fillWordPressForm = function() {
        console.log('🔧 Filling WordPress form...');

        let commentForm = null;
        for (let selector of window.wpSelectors) {
            commentForm = document.querySelector(selector);
            if (commentForm) {
                console.log(`Found WordPress form: ${selector}`);
                break;
            }
        }

        if (!commentForm) {
            console.log('❌ WordPress comment form not found');
            return false;
        }

        commentForm.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(() => {
            // Fill form fields
            const nameField = commentForm.querySelector('#author') ||
                            commentForm.querySelector('input[name="author"]');
            const emailField = commentForm.querySelector('#email') ||
                             commentForm.querySelector('input[name="email"]');
            const websiteField = commentForm.querySelector('#url') ||
                                commentForm.querySelector('input[name="url"]');
            const commentField = commentForm.querySelector('#comment') ||
                                commentForm.querySelector('textarea[name="comment"]');

            if (nameField) {
                nameField.value = window.commentConfig.name;
                nameField.dispatchEvent(new Event('input', { bubbles: true }));
                console.log('Name field filled');
            }

            if (emailField) {
                emailField.value = window.commentConfig.email;
                emailField.dispatchEvent(new Event('input', { bubbles: true }));
                console.log('Email field filled');
            }

            if (websiteField) {
                websiteField.value = window.commentConfig.website;
                websiteField.dispatchEvent(new Event('input', { bubbles: true }));
                console.log('Website field filled');
            }

            if (commentField) {
                const processedComment = window.getRandomComment();
                commentField.value = processedComment;
                commentField.dispatchEvent(new Event('input', { bubbles: true }));
                console.log('Comment with backlink:', processedComment);
            }

            console.log('WordPress comment form filled!');

            // ✨ CAPTCHA CHECK BEFORE SUBMIT
            setTimeout(async () => {
                await window.handleCaptchaBeforeSubmit(commentForm);
            }, 2000);

        }, 1500);

        return true;
    };
    
    // Try generic form filling (ENHANCED with CAPTCHA)
    window.tryGenericFormFilling = function() {
        console.log('🔍 Attempting generic form filling...');

        const forms = document.querySelectorAll('form');
        for (let form of forms) {
            const formText = form.textContent.toLowerCase();

            if (formText.includes('search') || formText.includes('login') || formText.includes('subscribe')) {
                continue;
            }

            if (formText.includes('comment') || formText.includes('message') || formText.includes('feedback')) {
                console.log('📝 Found potential comment form');
                const success = window.fillGenericForm(form);
                if (success) return true;
            }
        }

        for (let form of forms) {
            const textareas = form.querySelectorAll('textarea');
            if (textareas.length > 0) {
                console.log('📝 Found form with textarea');
                const success = window.fillGenericForm(form);
                if (success) return true;
            }
        }

        return false;
    };
    
    // Fill generic form (ENHANCED with CAPTCHA)
    window.fillGenericForm = function(form) {
        try {
            form.scrollIntoView({ behavior: 'smooth', block: 'center' });

            setTimeout(() => {
                let filled = false;

                // Fill text inputs
                const textInputs = form.querySelectorAll('input[type="text"], input:not([type])');
                textInputs.forEach(input => {
                    const placeholder = (input.placeholder || '').toLowerCase();
                    const name = (input.name || '').toLowerCase();

                    if (placeholder.includes('name') || name.includes('name')) {
                        input.value = window.commentConfig.name;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        filled = true;
                    } else if (placeholder.includes('website') || name.includes('website') || name.includes('url')) {
                        input.value = window.commentConfig.website;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        filled = true;
                    }
                });

                // Fill email inputs
                const emailInputs = form.querySelectorAll('input[type="email"]');
                emailInputs.forEach(input => {
                    input.value = window.commentConfig.email;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    filled = true;
                });

                // Fill textareas
                const textareas = form.querySelectorAll('textarea');
                textareas.forEach(textarea => {
                    const processedComment = window.getRandomComment();
                    textarea.value = processedComment;
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                    filled = true;
                    console.log('💬 Generic form comment:', processedComment);
                });

                if (filled) {
                    console.log('✅ Generic form filled successfully!');
                    
                    // ✨ CAPTCHA CHECK BEFORE SUBMIT
                    setTimeout(async () => {
                        await window.handleCaptchaBeforeSubmit(form);
                    }, 2000);
                    
                    return true;
                }

                return false;
            }, 1500);

            return true;
        } catch (e) {
            console.error('❌ Error filling generic form:', e);
            return false;
        }
    };

    // ✨ NEW: Handle CAPTCHA before submit - ENHANCED VERSION
    window.handleCaptchaBeforeSubmit = async function(form) {
        console.log('🔐 Checking for CAPTCHA before submit...');
        
        // 🔧 Check if CAPTCHA handling is enabled in config
        if (window.commentConfig && window.commentConfig.handleCaptcha === false) {
            console.log('🔐 CAPTCHA handling disabled in config, proceeding with submit');
            window.autoSubmitForm(form);
            return;
        }
        
        // Check if detectAndSolveCaptcha function is available (from solver.js)
        if (typeof window.detectAndSolveCaptcha !== 'function') {
            console.log('⚠️ CAPTCHA solver not available, proceeding without CAPTCHA check');
            window.autoSubmitForm(form);
            return;
        }
        
        try {
            console.log('🔍 Running CAPTCHA detection...');
            const captchaResult = await window.detectAndSolveCaptcha();
            
            if (captchaResult.success) {
                if (!captchaResult.noCaptcha) {
                    console.log('🔐 CAPTCHA solved successfully:', captchaResult.text);
                    
                    // 🎯 Visual feedback for successful CAPTCHA solve
                    const captchaInput = document.querySelector('#securitycode, input[name*="captcha"], input[id*="captcha"]');
                    if (captchaInput) {
                        captchaInput.style.border = '2px solid #4CAF50';
                        captchaInput.style.backgroundColor = '#e8f5e8';
                    }
                    
                    // Extra delay after CAPTCHA solving for processing
                    console.log('⏳ Waiting for CAPTCHA to be processed...');
                    setTimeout(() => {
                        window.autoSubmitForm(form);
                    }, 2000); // Increased delay for better reliability
                } else {
                    console.log('✅ No CAPTCHA found, proceeding with submit...');
                    window.autoSubmitForm(form);
                }
            } else {
                console.log('❌ CAPTCHA solving failed:', captchaResult.error);
                
                // 🔧 Enhanced error handling based on config
                const config = window.commentConfig || {};
                
                if (config.retryCaptchaOnFail) {
                    console.log('🔄 Retrying CAPTCHA as per config...');
                    
                    // Retry with exponential backoff
                    setTimeout(async () => {
                        await window.handleCaptchaBeforeSubmit(form);
                    }, 3000);
                    return;
                }
                
                if (config.skipOnCaptchaFail) {
                    console.log('⏭️ Skipping URL due to CAPTCHA failure as per config');
                    
                    if (typeof window.showErrorMessage === 'function') {
                        window.showErrorMessage(`CAPTCHA solving failed: ${captchaResult.error}. Skipping to next URL.`);
                    }
                    
                    // Mark current URL as failed and move to next
                    if (typeof window.markUrlAsCompleted === 'function') {
                        window.markUrlAsCompleted(window.location.href, `CAPTCHA Failed: ${captchaResult.error}`);
                    }
                    
                    setTimeout(() => {
                        if (typeof window.navigateToNextUrl === 'function') {
                            window.navigateToNextUrl();
                        }
                    }, 3000);
                    return;
                }
                
                // Default: Show error and wait for manual intervention
                console.log('🛑 Manual intervention required for CAPTCHA');
                
                if (typeof window.showErrorMessage === 'function') {
                    window.showErrorMessage(`CAPTCHA solving failed: ${captchaResult.error}. Please solve manually and submit.`);
                } else {
                    alert('⚠️ CAPTCHA could not be solved automatically. Please solve manually and submit.');
                }
                
                // 🎯 Highlight CAPTCHA elements for user attention
                const captchaImg = document.querySelector('#secureimg, .captcha-image, [id*="captcha"], [class*="captcha"]');
                const captchaInput = document.querySelector('#securitycode, input[name*="captcha"], input[id*="captcha"]');
                
                if (captchaImg) {
                    captchaImg.style.border = '3px solid #ff9800';
                    captchaImg.style.borderRadius = '5px';
                }
                
                if (captchaInput) {
                    captchaInput.style.border = '2px solid #ff9800';
                    captchaInput.style.backgroundColor = '#fff3e0';
                    captchaInput.focus();
                }
                
                console.log('🛑 Auto-submit cancelled due to CAPTCHA failure');
            }
        } catch (error) {
            console.error('❌ Error during CAPTCHA handling:', error);
            
            // 🔧 Fallback behavior based on config
            const config = window.commentConfig || {};
            
            if (config.skipOnCaptchaFail) {
                console.log('⏭️ Skipping due to CAPTCHA error as per config');
                
                if (typeof window.showErrorMessage === 'function') {
                    window.showErrorMessage(`CAPTCHA error: ${error.message}. Skipping to next URL.`);
                }
                
                setTimeout(() => {
                    if (typeof window.navigateToNextUrl === 'function') {
                        window.navigateToNextUrl();
                    }
                }, 3000);
            } else {
                // Proceed with submit despite error
                console.log('🔄 Proceeding with submit despite CAPTCHA error...');
                window.autoSubmitForm(form);
            }
        }
    };
    
    // Find submit button (TIDAK DIUBAH)
    window.findSubmitButton = function(form) {
        for (let selector of window.submitSelectors) {
            const button = form.querySelector(selector);
            if (button) {
                console.log(`Found submit button: ${selector}`);
                return button;
            }
        }
        return null;
    };
    
    // Enhanced popup handling (TIDAK DIUBAH)
    window.autoSubmitForm = function(form) {
        if (!window.commentConfig.autoSubmit) {
            console.log('Auto submit disabled');
            return false;
        }

        const submitButton = window.findSubmitButton(form);

        if (!submitButton) {
            console.log('Submit button not found, trying form.submit()');
            setTimeout(() => {
                window.handlePopupBeforeSubmit(() => {
                    if (typeof window.handleFormSubmission === 'function') {
                        window.handleFormSubmission(form, null);
                    } else {
                        try {
                            form.submit();
                            console.log('✅ Form submitted using fallback method');
                        } catch (e) {
                            console.error('❌ Form submission failed:', e);
                        }
                    }
                });
            }, 1000);
            return true;
        }

        // Highlight submit button
        submitButton.style.border = '3px solid #4CAF50';
        submitButton.style.borderRadius = '5px';

        setTimeout(() => {
            console.log('🚀 Preparing to submit...');
            
            window.handlePopupBeforeSubmit(() => {
                console.log('🚀 Clicking submit button...');
                
                if (typeof window.handleFormSubmission === 'function') {
                    window.handleFormSubmission(form, submitButton);
                } else {
                    try {
                        submitButton.click();
                        console.log('✅ Submit button clicked using fallback method');
                    } catch (e) {
                        console.error('❌ Submit button click failed:', e);
                    }
                }
            });
            
        }, 1000);

        return true;
    };
    
    // Enhanced popup handling (TIDAK DIUBAH)
    window.handlePopupBeforeSubmit = function(callback) {
        if (!window.commentConfig || !window.commentConfig.handlePopups) {
            callback();
            return;
        }
        
        console.log('🚪 Handling popups before submit...');
        
        let popupClosed = false;
        
        if (typeof window.closePopup === 'function') {
            try {
                popupClosed = window.closePopup();
                console.log('🚪 closePopup() result:', popupClosed);
            } catch (e) {
                console.log('⚠️ closePopup() error:', e);
            }
        }
        
        if (!popupClosed) {
            try {
                console.log('🔄 Trying ESC key fallback...');
                const escEvent = new KeyboardEvent('keydown', {
                    key: 'Escape',
                    keyCode: 27,
                    which: 27,
                    bubbles: true,
                    cancelable: true
                });
                document.dispatchEvent(escEvent);
            } catch (e) {
                console.log('⚠️ ESC key error:', e);
            }
        }
        
        const submitDelay = popupClosed ? 1500 : 500;
        
        setTimeout(() => {
            console.log('✅ Proceeding with form submission...');
            callback();
        }, submitDelay);
    };
    
    // Basic form submission handler (TIDAK DIUBAH)
    if (typeof window.handleFormSubmission !== 'function') {
        window.handleFormSubmission = function(form, submitButton) {
            console.log('📝 Using basic form submission handler...');
            
            try {
                if (submitButton) {
                    submitButton.click();
                    console.log('✅ Submit button clicked');
                } else {
                    form.submit();
                    console.log('✅ Form submitted directly');
                }
            } catch (error) {
                console.error('❌ Form submission error:', error);
                
                const anyButton = form.querySelector('button, input[type="submit"]');
                if (anyButton) {
                    try {
                        anyButton.click();
                        console.log('✅ Fallback button clicked');
                    } catch (e) {
                        console.error('❌ Fallback submission failed:', e);
                    }
                }
            }
        };
    }
    
    // Compatibility mode toggle (TIDAK DIUBAH)
    window.useOriginalSubmission = function() {
        console.log('🔄 Switching to original submission method...');
        window.autoSubmitForm = _originalAutoSubmit;
    };
    
    console.log('✅ Enhanced Form Filling helper loaded (with CAPTCHA support)');
    console.log('🔐 CAPTCHA integration: detectAndSolveCaptcha, handleCaptchaBeforeSubmit');
    console.log('💡 Use window.useOriginalSubmission() to revert if needed');
    
})();
