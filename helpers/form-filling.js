// Form Filling Helper
(function() {
    'use strict';
    
    // Fill WordPress form
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

            setTimeout(() => {
                window.autoSubmitForm(commentForm);
            }, 2000);

        }, 1500);

        return true;
    };
    
    // Try generic form filling
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
    
    // Fill generic form
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
                    setTimeout(() => {
                        window.autoSubmitForm(form);
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
    
    // Find submit button
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
    
    // Auto submit form
    window.autoSubmitForm = function(form) {
        if (!window.commentConfig.autoSubmit) {
            console.log('Auto submit disabled');
            return false;
        }

        const submitButton = window.findSubmitButton(form);

        if (!submitButton) {
            console.log('Submit button not found, trying form.submit()');
            setTimeout(() => {
                // 🚪 PANGGIL closePopup sebelum submit
                window.closePopup();
                
                // Delay sebentar lalu submit
                setTimeout(() => {
                    window.handleFormSubmission(form, null);
                }, 1000);
            }, 1000);
            return true;
        }

        // Highlight submit button
        submitButton.style.border = '3px solid #4CAF50';
        submitButton.style.borderRadius = '5px';

        setTimeout(() => {
            console.log('🚀 Preparing to submit...');
            
            // 🚪 PANGGIL closePopup sebelum submit
            const popupClosed = window.closePopup();
            
            // Delay berdasarkan apakah popup ditutup atau tidak
            const submitDelay = popupClosed ? 1500 : 500;
            
            setTimeout(() => {
                console.log('🚀 Clicking submit button...');
                window.handleFormSubmission(form, submitButton);
            }, submitDelay);
            
        }, 1000);

        return true;
    };
    
})();
