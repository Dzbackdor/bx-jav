// Form Filling Helper - Fixed CAPTCHA Integration
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

            // ✨ FIXED: Use autoSolve() then submit
            setTimeout(async () => {
                await window.handleCaptchaAndSubmit(commentForm);
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
                    
                    // ✨ FIXED: Use autoSolve() then submit
                    setTimeout(async () => {
                        await window.handleCaptchaAndSubmit(form);
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
    
    // ✨ FIXED: New CAPTCHA handling using autoSolve()
    window.handleCaptchaAndSubmit = async function(form) {
        console.log('🔐 Checking for CAPTCHA before submit...');
        
        // Check if CAPTCHA solver functions are available
        if (typeof window.autoSolve !== 'function') {
            console.log('⚠️ autoSolve() not available, proceeding without CAPTCHA check');
            window.autoSubmitForm(form);
            return;
        }
        
        try {
            // ✅ USE autoSolve() from solver.js
            console.log('🤖 Running window.autoSolve()...');
            const captchaResult = await window.autoSolve();
            
            if (captchaResult.success) {
                console.log('🔐 CAPTCHA solved successfully:', captchaResult.text);
                console.log('✅ Proceeding with form submission...');
                
                // Extra delay after CAPTCHA solving
                setTimeout(() => {
                    window.autoSubmitForm(form);
                }, 2000);
                
            } else if (captchaResult.error === 'No CAPTCHA found') {
                console.log('✅ No CAPTCHA detected, proceeding with submit...');
                window.autoSubmitForm(form);
                
            } else {
                console.log('❌ CAPTCHA solving failed:', captchaResult.error);
                
                // Show user notification
                if (typeof window.showErrorMessage === 'function') {
                    window.showErrorMessage(`CAPTCHA solving failed: ${captchaResult.error}. Please solve manually.`);
                } else {
                    alert('⚠️ CAPTCHA could not be solved automatically. Please solve manually and submit.');
                }
                
                // Don't auto-submit, let user handle manually
                console.log('🛑 Auto-submit cancelled due to CAPTCHA failure');
                console.log('💡 You can manually solve CAPTCHA and click submit');
            }
            
        } catch (error) {
            console.error('❌ Error during CAPTCHA handling:', error);
            
            // Fallback: proceed without CAPTCHA
            console.log('🔄 Proceeding with submit despite CAPTCHA error...');
            window.autoSubmitForm(form);
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
    console.log('🔐 CAPTCHA integration: using window.autoSolve()');
    console.log('💡 Use window.useOriginalSubmission() to revert if needed');
    
})();
