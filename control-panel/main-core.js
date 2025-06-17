// Main Core Processing Helper
(function() {
    'use strict';
    
    // Enhanced form submission with better error handling and monitoring
    window.handleFormSubmission = function(form, submitButton) {
        if (window.submitAttempted) {
            console.log('⚠️ Submit already attempted');
            window.logMessage('warning', 'Submit already attempted', { url: window.location.href });
            return false;
        }

        // Validate form before submission
        if (!form) {
            console.error('❌ No form provided for submission');
            window.showErrorMessage('No form found for submission');
            return false;
        }

        window.submitAttempted = true;
        window.originalUrl = window.location.href.split('#')[0];

        console.log('📝 Starting form submission...');
        console.log('📍 Original URL:', window.originalUrl);
        
        // Log submission attempt
        window.logMessage('info', 'Form submission started', {
            originalUrl: window.originalUrl,
            formAction: form.action || 'unknown',
            hasSubmitButton: !!submitButton
        });

        // Update bot state
        window.setBotState({
            lastActivity: new Date().toISOString(),
            isRunning: true
        });

        // Pre-submission validation
        const validationResult = window.validateFormBeforeSubmission(form);
        if (!validationResult.valid) {
            console.log('❌ Form validation failed:', validationResult.reason);
            window.submitAttempted = false;
            window.showErrorMessage(`Form validation failed: ${validationResult.reason}`);
            return false;
        }

        // Handle checkboxes before submission
        console.log('📋 Handling checkboxes before submission...');
        const checkboxHandled = window.handleCheckboxes ? window.handleCheckboxes(form) : true;

        if (!checkboxHandled) {
            console.log('❌ Checkbox handling failed');
            window.submitAttempted = false;
            window.showErrorMessage('Failed to handle required checkboxes');
            window.logMessage('error', 'Checkbox handling failed', { url: window.originalUrl });
            return false;
        }

        // Enhanced delay with progress indication
        const submissionDelay = window.commentConfig?.submissionDelay || 1000;
        
        setTimeout(() => {
            // Show enhanced waiting message
            const waitingMessage = window.showWaitingMessage();
            
            // Add cancel functionality to waiting message
            if (waitingMessage && typeof window.addCancelToWaitingMessage === 'function') {
                window.addCancelToWaitingMessage(waitingMessage, () => {
                    window.cancelFormSubmission();
                });
            }

            // Enhanced monitoring with better callbacks
            window.startUrlChangeMonitoring(
                window.originalUrl,
                // onSuccess callback
                (newUrl) => {
                    console.log('✅ Comment submission successful!');
                    window.removeWaitingMessage();
                    
                    const cleanOriginalUrl = window.originalUrl.split('#')[0];
                    window.markUrlAsCompleted(cleanOriginalUrl, 'Comment submitted successfully');
                    
                    // Log success
                    window.logMessage('success', 'Comment submitted successfully', {
                        originalUrl: window.originalUrl,
                        newUrl: newUrl
                    });
                    
                    // Show success with enhanced message
                    window.showSuccessMessage('Comment submitted successfully!');
                    
                    // Update statistics
                    window.updateSubmissionStats('success');
                    
                    // Auto navigate if enabled
                    if (window.commentConfig?.autoNavigate) {
                        const delay = window.commentConfig?.navigationDelay || 3000;
                        setTimeout(() => {
                            window.navigateToNextUrl();
                        }, delay);
                    }
                },
                // onError callback
                (errorUrl, errorReason) => {
                    console.log('❌ Comment submission error:', errorReason);
                    window.removeWaitingMessage();
                    
                    // Log error
                    window.logMessage('error', 'Comment submission error', {
                        originalUrl: window.originalUrl,
                        errorUrl: errorUrl,
                        errorReason: errorReason
                    });
                    
                    // Update statistics
                    window.updateSubmissionStats('error', errorReason);
                    
                    // Handle retry logic
                    if (window.commentConfig?.retryOnError) {
                        window.handleRetry(window.originalUrl, errorReason);
                    } else {
                        window.showErrorMessage(`Comment submission failed: ${errorReason}`);
                        setTimeout(() => {
                            window.navigateToNextUrl();
                        }, 5000);
                    }
                },
                // onTimeout callback
                () => {
                    console.log('⏰ Comment submission timeout');
                    window.removeWaitingMessage();
                    
                    const currentUrl = window.location.href;
                    const errorDetected = window.detectCommentError ? window.detectCommentError() : { error: false };
                    
                    // Log timeout
                    window.logMessage('warning', 'Comment submission timeout', {
                        originalUrl: window.originalUrl,
                        currentUrl: currentUrl,
                        errorDetected: errorDetected
                    });
                    
                    // Update statistics
                    window.updateSubmissionStats('timeout');

                    if (errorDetected.error) {
                        console.log('❌ Error detected on timeout:', errorDetected.reason);

                        if (window.commentConfig?.retryOnError) {
                            window.handleRetry(window.originalUrl, errorDetected.reason);
                        } else {
                            window.showErrorMessage(`Timeout with error: ${errorDetected.reason}`);
                            setTimeout(() => {
                                window.navigateToNextUrl();
                            }, 5000);
                        }
                    } else {
                        window.showErrorMessage('Comment submission timeout. No clear success or error detected.');

                        if (window.commentConfig?.retryOnError) {
                            window.handleRetry(window.originalUrl, 'Submission timeout');
                        } else {
                            setTimeout(() => {
                                window.navigateToNextUrl();
                            }, 5000);
                        }
                    }
                }
            );

            // Enhanced form submission with better error handling
            try {
                console.log('🚀 Submitting form...');
                
                // Pre-submit hook
                if (typeof window.onBeforeFormSubmit === 'function') {
                    window.onBeforeFormSubmit(form, submitButton);
                }
                
                // Submit form
                if (submitButton && typeof submitButton.click === 'function') {
                    console.log('👆 Clicking submit button');
                    submitButton.click();
                } else if (form && typeof form.submit === 'function') {
                    console.log('📤 Submitting form directly');
                    form.submit();
                } else {
                    throw new Error('No valid submission method available');
                }
                
                // Post-submit hook
                if (typeof window.onAfterFormSubmit === 'function') {
                    window.onAfterFormSubmit(form, submitButton);
                }
                
            } catch (e) {
                console.error('❌ Error submitting form:', e);
                window.removeWaitingMessage();
                
                const errorMessage = `Error submitting form: ${e.message}`;
                window.showErrorMessage(errorMessage);
                
                // Log submission error
                window.logMessage('error', 'Form submission error', {
                    error: e.message,
                    stack: e.stack,
                    formAction: form?.action,
                    hasSubmitButton: !!submitButton
                });
                
                // Update statistics
                window.updateSubmissionStats('error', e.message);

                if (window.commentConfig?.retryOnError) {
                    window.handleRetry(window.originalUrl, errorMessage);
                } else {
                    window.submitAttempted = false;
                }
            }
        }, submissionDelay);
        
        return true;
    };
    
    // New: Form validation before submission
    window.validateFormBeforeSubmission = function(form) {
        try {
            if (!form) {
                return { valid: false, reason: 'No form provided' };
            }
            
            // Check if form has required fields
            const requiredFields = form.querySelectorAll('[required]');
            for (let field of requiredFields) {
                if (!field.value.trim()) {
                    return { 
                        valid: false, 
                        reason: `Required field "${field.name || field.id || 'unknown'}" is empty` 
                    };
                }
            }
            
            // Check for comment content
            const commentField = form.querySelector('textarea[name="comment"], textarea#comment, textarea.comment');
            if (commentField && !commentField.value.trim()) {
                return { valid: false, reason: 'Comment field is empty' };
            }
            
            // Check for author name
            const authorField = form.querySelector('input[name="author"], input#author, input.author');
            if (authorField && !authorField.value.trim()) {
                return { valid: false, reason: 'Author field is empty' };
            }
            
            // Check for email
            const emailField = form.querySelector('input[name="email"], input#email, input.email');
            if (emailField && emailField.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailField.value.trim())) {
                    return { valid: false, reason: 'Invalid email format' };
                }
            }
            
            return { valid: true, reason: 'Form validation passed' };
            
        } catch (e) {
            console.error('Error during form validation:', e);
            return { valid: false, reason: 'Validation error: ' + e.message };
        }
    };
    
    // New: Cancel form submission
    window.cancelFormSubmission = function() {
        console.log('🛑 Cancelling form submission...');
        
        window.submitAttempted = false;
        window.isWaitingForUrlChange = false;
        
        if (window.urlChangeTimer) {
            clearTimeout(window.urlChangeTimer);
            window.urlChangeTimer = null;
        }
        
        window.removeWaitingMessage();
        window.showToast('Form submission cancelled', 'warning');
        
        window.logMessage('info', 'Form submission cancelled by user');
    };
    
    // Enhanced main comment processing
    window.proceedWithComment = function() {
        console.log('🚀 Starting comment process...');
        
        const currentUrl = window.location.href;
        
        // Log process start
        window.logMessage('info', 'Comment process started', { currentUrl: currentUrl });
        
        // Update bot activity
        window.setBotState({
            lastActivity: new Date().toISOString(),
            isRunning: true
        });

        // Handle wp-comments-post.php error case with enhanced logic
        if (currentUrl.includes('wp-comments-post.php')) {
            console.log('❌ Detected wp-comments-post.php - handling error...');
            
            window.logMessage('error', 'wp-comments-post.php error detected', { currentUrl: currentUrl });

            const currentIndex = window.getCurrentUrlIndex();
            if (currentIndex < window.targetUrls.length) {
                const originalTargetUrl = window.targetUrls[currentIndex];
                
                // Analyze the error more deeply
                const errorAnalysis = window.analyzeWpCommentsPostError();
                
                if (window.commentConfig?.retryOnError) {
                    window.handleRetry(originalTargetUrl, `wp-comments-post.php error: ${errorAnalysis.reason}`);
                } else {
                    window.showErrorMessage('wp-comments-post.php error detected. Skipping to next URL.');
                    window.markUrlAsCompleted(originalTargetUrl, `wp-comments-post.php error - ${errorAnalysis.reason}`);
                    setTimeout(() => {
                        window.navigateToNextUrl();
                    }, 5000);
                }
            }
            return;
        }

        // Enhanced already commented check
        if (window.hasAlreadyCommented()) {
            console.log('✅ URL already completed, navigating to next...');
            
            window.logMessage('info', 'URL already completed', { currentUrl: currentUrl });
            
            window.showToast('URL already completed', 'info');

            if (window.commentConfig?.autoNavigate) {
                const delay = window.commentConfig?.navigationDelay || 2000;
                setTimeout(() => {
                    window.navigateToNextUrl();
                }, delay);
            }
            return;
        }

        // Enhanced target URL check
        if (!window.isTargetUrl()) {
            console.log('⚠️ Not a target URL, skipping...');
            
            window.logMessage('warning', 'Not a target URL', { currentUrl: currentUrl });
            
            // Show standby message
            if (typeof window.showBotStatusMessage === 'function') {
                window.showBotStatusMessage('standby', 'Waiting for target URL...');
            }
            
            return;
        }

        console.log('🎯 Target URL detected, proceeding with comment...');
        
        window.logMessage('info', 'Target URL detected, proceeding', { currentUrl: currentUrl });
        
        // Show processing message
        if (typeof window.showBotStatusMessage === 'function') {
            window.showBotStatusMessage('processing', 'Analyzing page for comment forms...');
        }

        // Enhanced page load wait with progress
        const pageLoadDelay = window.commentConfig?.pageLoadDelay || 2000;
        
        setTimeout(() => {
            let success = false;
            let attemptedMethods = [];

            try {
                // Enhanced WordPress detection and form filling
                if (window.isWordPress()) {
                    console.log('🔧 WordPress detected, using WordPress form filling...');
                    attemptedMethods.push('WordPress');
                    
                    if (typeof window.fillWordPressForm === 'function') {
                        success = window.fillWordPressForm();
                        
                        if (success) {
                            window.logMessage('success', 'WordPress form filled successfully');
                        } else {
                            window.logMessage('warning', 'WordPress form filling failed');
                        }
                    } else {
                        console.warn('⚠️ fillWordPressForm function not available');
                        window.logMessage('warning', 'fillWordPressForm function not available');
                    }
                }

                // Enhanced generic form filling
                if (!success) {
                    console.log('🔍 Trying generic form filling...');
                    attemptedMethods.push('Generic');
                    
                    if (typeof window.tryGenericFormFilling === 'function') {
                        success = window.tryGenericFormFilling();
                        
                        if (success) {
                            window.logMessage('success', 'Generic form filled successfully');
                        } else {
                            window.logMessage('warning', 'Generic form filling failed');
                        }
                    } else {
                        console.warn('⚠️ tryGenericFormFilling function not available');
                        window.logMessage('warning', 'tryGenericFormFilling function not available');
                    }
                }

                // Try alternative form detection methods
                if (!success) {
                    console.log('🔍 Trying alternative form detection...');
                    attemptedMethods.push('Alternative');
                    success = window.tryAlternativeFormDetection();
                }

                // Final attempt with manual form search
                if (!success) {
                    console.log('🔍 Trying manual form search...');
                    attemptedMethods.push('Manual');
                    success = window.tryManualFormSearch();
                }

            } catch (e) {
                console.error('❌ Error during form processing:', e);
                window.logMessage('error', 'Form processing error', {
                    error: e.message,
                    stack: e.stack,
                    attemptedMethods: attemptedMethods
                });
            }

            // Handle no form found scenario
            if (!success) {
                console.log('❌ No suitable comment form found');
                
                const errorMessage = `No comment form found. Tried: ${attemptedMethods.join(', ')}`;
                window.showErrorMessage(errorMessage);
                
                window.logMessage('error', 'No comment form found', {
                    attemptedMethods: attemptedMethods,
                    currentUrl: currentUrl
                });

                // Analyze page for debugging
                const pageAnalysis = window.analyzePageForForms();
                console.log('📊 Page analysis:', pageAnalysis);

                // Mark as completed with reason
                const cleanUrl = currentUrl.split('#')[0].split('?')[0];
                window.markUrlAsCompleted(cleanUrl, 'No comment form found');

                if (window.commentConfig?.autoNavigate) {
                    setTimeout(() => {
                        window.navigateToNextUrl();
                    }, 5000);
                }
            } else {
                console.log('✅ Form processing completed successfully');
                window.logMessage('success', 'Form processing completed', {
                    method: attemptedMethods[attemptedMethods.length - 1]
                });
            }

        }, pageLoadDelay);
    };
    
    // New: Analyze wp-comments-post.php error
    window.analyzeWpCommentsPostError = function() {
        try {
            const currentUrl = window.location.href;
            const urlParams = new URLSearchParams(currentUrl.split('?')[1] || '');
            
            // Check for specific error indicators
            if (currentUrl.includes('error=')) {
                return {
                    type: 'url_error',
                    reason: 'Error parameter in URL'
                };
            }
            
            // Check page content for error messages
            const bodyText = document.body.textContent.toLowerCase();
            
            if (bodyText.includes('duplicate comment')) {
                return {
                    type: 'duplicate',
                    reason: 'Duplicate comment detected'
                };
            }
            
            if (bodyText.includes('spam')) {
                return {
                    type: 'spam',
                    reason: 'Comment marked as spam'
                };
            }
            
            if (bodyText.includes('required field')) {
                return {
                    type: 'validation',
                    reason: 'Required field missing'
                };
            }
            
            if (bodyText.includes('invalid email')) {
                return {
                    type: 'validation',
                    reason: 'Invalid email format'
                };
            }
            
            return {
                type: 'unknown',
                reason: 'Unknown wp-comments-post.php error'
            };
            
        } catch (e) {
            return {
                type: 'analysis_error',
                reason: 'Error analyzing wp-comments-post.php: ' + e.message
            };
        }
    };
    
    // New: Alternative form detection
    window.tryAlternativeFormDetection = function() {
        try {
            console.log('🔍 Trying alternative form detection methods...');
            
            // Look for forms with comment-related attributes
            const commentForms = document.querySelectorAll(`
                form[id*="comment"],
                form[class*="comment"],
                form[action*="comment"],
                form[name*="comment"],
                form:has(textarea[name="comment"]),
                form:has(input[name="author"]),
                form:has(textarea[placeholder*="comment" i]),
                form:has(textarea[placeholder*="message" i])
            `);
            
            for (let form of commentForms) {
                console.log('📝 Found potential comment form:', form);
                
                if (window.tryFillForm && window.tryFillForm(form)) {
                    return true;
                }
            }
            
            // Look for AJAX comment forms
            const ajaxForms = document.querySelectorAll('form[data-ajax], form.ajax-form');
            for (let form of ajaxForms) {
                if (window.hasCommentFields(form)) {
                    console.log('📝 Found AJAX comment form:', form);
                    if (window.tryFillForm && window.tryFillForm(form)) {
                        return true;
                    }
                }
            }
            
            return false;
            
        } catch (e) {
            console.error('Error in alternative form detection:', e);
            return false;
        }
    };
    
    // New: Manual form search
    window.tryManualFormSearch = function() {
        try {
            console.log('🔍 Performing manual form search...');
            
            const allForms = document.querySelectorAll('form');
            console.log(`📝 Found ${allForms.length} forms on page`);
            
            for (let i = 0; i < allForms.length; i++) {
                const form = allForms[i];
                console.log(`📝 Analyzing form ${i + 1}:`, {
                    id: form.id,
                    className: form.className,
                    action: form.action,
                    method: form.method
                });
                
                // Check if form has comment-related fields
                const hasCommentField = form.querySelector('textarea[name="comment"], textarea#comment, textarea.comment, textarea[placeholder*="comment" i]');
                const hasAuthorField = form.querySelector('input[name="author"], input#author, input.author');
                const hasEmailField = form.querySelector('input[name="email"], input#email, input.email, input[type="email"]');
                
                if (hasCommentField || (hasAuthorField && hasEmailField)) {
                    console.log('📝 Form appears to be a comment form');
                    
                    if (window.tryFillForm && window.tryFillForm(form)) {
                        return true;
                    }
                }
            }
            
            return false;
            
        } catch (e) {
            console.error('Error in manual form search:', e);
            return false;
        }
    };
    
    // New: Check if form has comment fields
    window.hasCommentFields = function(form) {
        if (!form) return false;
        
        const commentField = form.querySelector('textarea[name="comment"], textarea#comment, textarea.comment');
        const messageField = form.querySelector('textarea[name="message"], textarea#message, textarea.message');
        const textareas = form.querySelectorAll('textarea');
        
        return !!(commentField || messageField || textareas.length > 0);
    };
    
    // New: Analyze page for forms (debugging)
    window.analyzePageForForms = function() {
        try {
            const analysis = {
                totalForms: 0,
                wordpressIndicators: [],
                commentFields: [],
                potentialCommentForms: [],
                allForms: []
            };
            
            // Count total forms
            const allForms = document.querySelectorAll('form');
            analysis.totalForms = allForms.length;
            
            // Check for WordPress indicators
            if (document.querySelector('#commentform')) analysis.wordpressIndicators.push('#commentform');
            if (document.querySelector('form[action*="wp-comments-post"]')) analysis.wordpressIndicators.push('wp-comments-post action');
            if (document.querySelector('.wp-comment-form')) analysis.wordpressIndicators.push('.wp-comment-form');
            if (document.querySelector('meta[name="generator"][content*="WordPress"]')) analysis.wordpressIndicators.push('WordPress meta tag');
            
            // Find comment fields
            const commentFields = document.querySelectorAll('textarea[name="comment"], textarea#comment, textarea.comment');
            analysis.commentFields = Array.from(commentFields).map(field => ({
                tagName: field.tagName,
                name: field.name,
                id: field.id,
                className: field.className
            }));
            
            // Analyze each form
            allForms.forEach((form, index) => {
                const formInfo = {
                    index: index,
                    id: form.id,
                    className: form.className,
                    action: form.action,
                    method: form.method,
                    hasCommentField: !!form.querySelector('textarea[name="comment"], textarea#comment, textarea.comment'),
                    hasAuthorField: !!form.querySelector('input[name="author"], input#author, input.author'),
                    hasEmailField: !!form.querySelector('input[name="email"], input#email, input.email'),
                    textareaCount: form.querySelectorAll('textarea').length,
                    inputCount: form.querySelectorAll('input').length
                };
                
                analysis.allForms.push(formInfo);
                
                if (formInfo.hasCommentField || (formInfo.hasAuthorField && formInfo.hasEmailField)) {
                    analysis.potentialCommentForms.push(formInfo);
                }
            });
            
            return analysis;
            
        } catch (e) {
            console.error('Error analyzing page for forms:', e);
            return { error: e.message };
        }
    };
    
    // Enhanced WordPress detection with more indicators
    window.isWordPress = function() {
        try {
            const indicators = [
                // Direct WordPress indicators
                document.querySelector('#commentform'),
                document.querySelector('form[action*="wp-comments-post"]'),
                document.querySelector('.wp-comment-form'),
                document.querySelector('meta[name="generator"][content*="WordPress"]'),
                
                // WordPress-specific classes and IDs
                document.querySelector('#respond'),
                document.querySelector('.comment-respond'),
                document.querySelector('#reply-title'),
                document.querySelector('.comment-reply-title'),
                
                // WordPress script indicators
                document.querySelector('script[src*="wp-content"]'),
                document.querySelector('script[src*="wp-includes"]'),
                
                // WordPress body classes
                document.body.className.includes('wordpress'),
                document.body.className.includes('wp-'),
                
                // WordPress admin bar
                document.querySelector('#wpadminbar'),
                
                // WordPress REST API
                document.querySelector('link[href*="wp-json"]')
            ];
            
            const detectedIndicators = indicators.filter(indicator => indicator).length;
            const isWordPress = detectedIndicators > 0;
            
            console.log(`🔧 WordPress detection: ${isWordPress} (${detectedIndicators} indicators found)`);
            
            return isWordPress;
            
        } catch (e) {
            console.error('Error in WordPress detection:', e);
            return false;
        }
    };
    
    // New: Update submission statistics
    window.updateSubmissionStats = function(result, reason = '') {
        try {
            const stats = GM_getValue('submissionStats', {
                total: 0,
                success: 0,
                error: 0,
                timeout: 0,
                lastUpdated: null
            });
            
            stats.total++;
            stats[result] = (stats[result] || 0) + 1;
            stats.lastUpdated = new Date().toISOString();
            
            if (reason) {
                stats.lastReason = reason;
            }
            
            GM_setValue('submissionStats', stats);
            
            console.log('📊 Submission stats updated:', stats);
            
        } catch (e) {
            console.error('Error updating submission stats:', e);
        }
    };
    
    // New: Get submission statistics
    window.getSubmissionStats = function() {
        try {
            return GM_getValue('submissionStats', {
                total: 0,
                success: 0,
                error: 0,
                timeout: 0,
                lastUpdated: null
            });
        } catch (e) {
            console.error('Error getting submission stats:', e);
            return { total: 0, success: 0, error: 0, timeout: 0, lastUpdated: null };
        }
    };
    
    // Enhanced initialization with better state management
    window.initializeScript = function() {
        console.log('🤖 Auto Backlink Bot v4.0 initializing...');
        console.log('📍 Current URL:', window.location.href);
        console.log('🎯 Target URLs:', window.targetUrls?.length || 0);
        console.log('📋 Checkbox handling enabled:', window.commentConfig?.handleCheckboxes);
        
        // Log initialization
        window.logMessage('info', 'Bot initialization started', {
            currentUrl: window.location.href,
            targetUrlsCount: window.targetUrls?.length || 0,
            checkboxHandling: window.commentConfig?.handleCheckboxes
        });
        
        // Create or resume session
        let session = window.getCurrentSession();
        if (!session) {
            session = window.createSession();
            console.log('📝 New session created:', session?.id);
        } else {
            console.log('📝 Resuming session:', session.id);
        }
        
        // Update bot state
        window.setBotState({
            isRunning: true,
            isPaused: false,
            startedAt: session?.startedAt || new Date().toISOString(),
            lastActivity: new Date().toISOString()
        });
        
        // Show bot status
        if (typeof window.showBotStatusMessage === 'function') {
            window.showBotStatusMessage('started', 'Bot initialized successfully');
        }
        
        // Handle wp-comments-post.php immediately with enhanced logic
        if (window.location.href.includes('wp-comments-post.php')) {
            console.log('❌ wp-comments-post.php detected on initialization');
            
            window.logMessage('error', 'wp-comments-post.php detected on init');
            
            setTimeout(() => {
                window.proceedWithComment();
            }, 1000);
            
            return;
        }

        // Enhanced decision logic
        const isTarget = window.isTargetUrl();
        const alreadyCommented = window.hasAlreadyCommented();
        
        console.log('🔍 Initialization analysis:', {
            isTarget: isTarget,
            alreadyCommented: alreadyCommented,
            autoNavigate: window.commentConfig?.autoNavigate
        });

        if (isTarget && !alreadyCommented) {
            console.log('✅ Ready to proceed with commenting');
            
            window.logMessage('info', 'Ready to proceed with commenting');
            
            if (typeof window.showBotStatusMessage === 'function') {
                window.showBotStatusMessage('ready', 'Ready to process comment form');
            }
            
            const initDelay = window.commentConfig?.initializationDelay || 3000;
            
            setTimeout(() => {
                window.proceedWithComment();
            }, initDelay);
            
        } else if (alreadyCommented) {
            console.log('✅ URL already completed');
            
            window.logMessage('info', 'URL already completed on init');
            
            if (typeof window.showBotStatusMessage === 'function') {
                window.showBotStatusMessage('completed', 'URL already processed');
            }

            if (window.commentConfig?.autoNavigate) {
                const navDelay = window.commentConfig?.navigationDelay || 3000;
                setTimeout(() => {
                    window.navigateToNextUrl();
                }, navDelay);
            }
            
        } else {
            console.log('ℹ️ Not a target URL, script in standby mode');
            
            window.logMessage('info', 'Not a target URL, standby mode');
            
            if (typeof window.showBotStatusMessage === 'function') {
                window.showBotStatusMessage('standby', 'Waiting for target URL');
            }
            
            // Set bot to standby state
            window.setBotState({
                isRunning: false,
                isPaused: false,
                lastActivity: new Date().toISOString()
            });
        }
        
        // Initialize periodic health checks
        window.startPeriodicHealthChecks();
        
        // Initialize auto-save
        window.startAutoSave();
        
        console.log('🤖 Bot initialization completed');
    };
    
    // New: Periodic health checks
    window.startPeriodicHealthChecks = function() {
        if (window.healthCheckInterval) {
            clearInterval(window.healthCheckInterval);
        }
        
        window.healthCheckInterval = setInterval(() => {
            try {
                // Check if bot is stuck
                const botState = window.getBotState();
                const lastActivity = new Date(botState.lastActivity || 0);
                const now = new Date();
                const timeSinceLastActivity = now - lastActivity;
                
                // If no activity for 10 minutes and bot is supposed to be running
                if (timeSinceLastActivity > 10 * 60 * 1000 && botState.isRunning) {
                    console.warn('⚠️ Bot appears to be stuck, attempting recovery...');
                    
                    window.logMessage('warning', 'Bot stuck, attempting recovery', {
                        timeSinceLastActivity: timeSinceLastActivity,
                        botState: botState
                    });
                    
                    // Attempt recovery
                    window.recoverStuckBot();
                }
                
                // Update control panel if it exists
                if (typeof window.updateControlPanel === 'function') {
                    window.updateControlPanel();
                }
                
                // Storage health check (every hour)
                if (Math.random() < 0.1) { // 10% chance each check (roughly every hour if checks are every 6 minutes)
                    const health = window.checkStorageHealth();
                    if (health.status !== 'healthy') {
                        console.warn('⚠️ Storage health issues detected:', health.issues);
                    }
                }
                
            } catch (e) {
                console.error('Error in periodic health check:', e);
            }
        }, 6 * 60 * 1000); // Every 6 minutes
        
        console.log('🏥 Periodic health checks started');
    };
    
    // New: Auto-save functionality
    window.startAutoSave = function() {
        if (window.autoSaveInterval) {
            clearInterval(window.autoSaveInterval);
        }
        
        window.autoSaveInterval = setInterval(() => {
            try {
                // Create automatic backup
                const backup = window.createBackup();
                if (backup) {
                    console.log('💾 Auto-save completed');
                }
                
                // Update session activity
                const session = window.getCurrentSession();
                if (session) {
                    session.lastActivity = new Date().toISOString();
                    GM_setValue('currentSession', session);
                }
                
            } catch (e) {
                console.error('Error in auto-save:', e);
            }
        }, 15 * 60 * 1000); // Every 15 minutes
        
        console.log('💾 Auto-save started');
    };
    
    // New: Recover stuck bot
    window.recoverStuckBot = function() {
        try {
            console.log('🔧 Attempting bot recovery...');
            
            // Reset submission state
            window.submitAttempted = false;
            window.isWaitingForUrlChange = false;
            
            // Clear any running timers
            if (window.urlChangeTimer) {
                clearTimeout(window.urlChangeTimer);
                window.urlChangeTimer = null;
            }
            
            // Clear messages
            if (typeof window.removeWaitingMessage === 'function') {
                window.removeWaitingMessage();
            }
            
            // Update bot state
            window.setBotState({
                lastActivity: new Date().toISOString(),
                isRunning: true
            });
            
            // Show recovery message
            if (typeof window.showToast === 'function') {
                window.showToast('Bot recovered from stuck state', 'info');
            }
            
            // Log recovery
            window.logMessage('info', 'Bot recovered from stuck state');
            
            // Restart process if on target URL
            if (window.isTargetUrl() && !window.hasAlreadyCommented()) {
                setTimeout(() => {
                    window.proceedWithComment();
                }, 2000);
            }
            
            return true;
            
        } catch (e) {
            console.error('Error during bot recovery:', e);
            window.logMessage('error', 'Bot recovery failed', { error: e.message });
            return false;
        }
    };
    
    // New: Graceful shutdown
    window.shutdownBot = function(reason = 'Manual shutdown') {
        try {
            console.log('🛑 Shutting down bot...', reason);
            
            // Clear all timers
            if (window.urlChangeTimer) {
                clearTimeout(window.urlChangeTimer);
                window.urlChangeTimer = null;
            }
            
            if (window.healthCheckInterval) {
                clearInterval(window.healthCheckInterval);
                window.healthCheckInterval = null;
            }
            
            if (window.autoSaveInterval) {
                clearInterval(window.autoSaveInterval);
                window.autoSaveInterval = null;
            }
            
            // Clear messages
            if (typeof window.clearAllMessages === 'function') {
                window.clearAllMessages();
            }
            
            // End session
            const session = window.endSession();
            
            // Update bot state
            window.setBotState({
                isRunning: false,
                isPaused: false,
                lastActivity: new Date().toISOString()
            });
            
            // Create final backup
            window.createBackup();
            
            // Log shutdown
            window.logMessage('info', 'Bot shutdown completed', { 
                reason: reason,
                sessionId: session?.id
            });
            
            // Show shutdown message
            if (typeof window.showBotStatusMessage === 'function') {
                window.showBotStatusMessage('stopped', `Bot stopped: ${reason}`);
            }
            
            console.log('🛑 Bot shutdown completed');
            return true;
            
        } catch (e) {
            console.error('Error during bot shutdown:', e);
            return false;
        }
    };
    
    // New: Pause/Resume functionality
    window.pauseBot = function(reason = 'Manual pause') {
        try {
            console.log('⏸️ Pausing bot...', reason);
            
            // Update bot state
            window.setBotState({
                isPaused: true,
                isRunning: false,
                lastActivity: new Date().toISOString()
            });
            
            // Clear waiting messages
            if (typeof window.removeWaitingMessage === 'function') {
                window.removeWaitingMessage();
            }
            
            // Show pause message
            if (typeof window.showBotStatusMessage === 'function') {
                window.showBotStatusMessage('paused', `Bot paused: ${reason}`);
            }
            
            // Log pause
            window.logMessage('info', 'Bot paused', { reason: reason });
            
            return true;
            
        } catch (e) {
            console.error('Error pausing bot:', e);
            return false;
        }
    };
    
    window.resumeBot = function() {
        try {
            console.log('▶️ Resuming bot...');
            
            // Update bot state
            window.setBotState({
                isPaused: false,
                isRunning: true,
                lastActivity: new Date().toISOString()
            });
            
            // Show resume message
            if (typeof window.showBotStatusMessage === 'function') {
                window.showBotStatusMessage('resumed', 'Bot resumed');
            }
            
            // Log resume
            window.logMessage('info', 'Bot resumed');
            
            // Continue processing if on target URL
            if (window.isTargetUrl() && !window.hasAlreadyCommented()) {
                setTimeout(() => {
                    window.proceedWithComment();
                }, 1000);
            }
            
            return true;
            
        } catch (e) {
            console.error('Error resuming bot:', e);
            return false;
        }
    };
    
    // New: Emergency stop
    window.emergencyStop = function() {
        try {
            console.log('🚨 EMERGENCY STOP ACTIVATED');
            
            // Immediate shutdown
            window.shutdownBot('Emergency stop');
            
            // Clear all storage if needed
            if (confirm('Emergency stop activated. Clear all bot data?')) {
                window.resetAllProgress();
            }
            
            // Show emergency message
            alert('🚨 EMERGENCY STOP\n\nBot has been stopped immediately.\nAll processes have been terminated.');
            
            return true;
            
        } catch (e) {
            console.error('Error in emergency stop:', e);
            return false;
        }
    };
    
    // Enhanced error handling for window errors
    window.addEventListener('error', function(e) {
        console.error('🚨 Global error caught:', e.error);
        
        window.logMessage('error', 'Global error caught', {
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            stack: e.error?.stack
        });
        
        // If error is critical, pause bot
        if (e.message && e.message.includes('GM_')) {
            window.pauseBot('Critical error detected');
        }
    });
    
    // Enhanced unload handling
    window.addEventListener('beforeunload', function(e) {
        try {
            // Quick save before page unload
            const session = window.getCurrentSession();
            if (session) {
                session.lastActivity = new Date().toISOString();
                GM_setValue('currentSession', session);
            }
            
            // Update bot state
            window.setBotState({
                lastActivity: new Date().toISOString()
            });
            
            console.log('📄 Page unloading, state saved');
            
        } catch (error) {
            console.error('Error during page unload:', error);
        }
    });
    
    console.log('✅ Enhanced Main Core Processing helper loaded');
    
})();


