// Main Core Processing Helper
(function() {
    'use strict';
    
    // Handle form submission with checkbox and error detection
    window.handleFormSubmission = function(form, submitButton) {
        if (window.submitAttempted) {
            console.log('⚠️ Submit already attempted');
            return;
        }

        window.submitAttempted = true;
        window.originalUrl = window.location.href.split('#')[0];

        console.log('📝 Starting form submission...');
        console.log('📍 Original URL:', window.originalUrl);

        // ✅ STEP 1: Handle checkboxes before submission
        console.log('📋 Handling checkboxes before submission...');
        const checkboxHandled = window.handleCheckboxes(form);

        if (!checkboxHandled) {
            console.log('❌ Checkbox handling failed');
            window.submitAttempted = false;
            window.showErrorMessage('Failed to handle required checkboxes');
            return;
        }

        // ✅ STEP 2: Handle CAPTCHA before submission
        console.log('🔐 Handling CAPTCHA before submission...');
        
        // Check if CAPTCHA solver is available
        if (typeof window.autoSolve === 'function') {
            window.autoSolve().then(captchaResult => {
                if (captchaResult.success || captchaResult.error === 'No CAPTCHA found') {
                    if (captchaResult.success && captchaResult.text) {
                        console.log('✅ CAPTCHA solved successfully:', captchaResult.text);
                        showCaptchaMessage(`✅ CAPTCHA solved: ${captchaResult.text}`);
                    } else {
                        console.log('✅ No CAPTCHA detected, proceeding...');
                    }
                    
                    // Proceed with form submission after CAPTCHA handling
                    proceedWithFormSubmission(form, submitButton);
                    
                } else {
                    console.log('❌ CAPTCHA solving failed:', captchaResult.error);
                    window.submitAttempted = false;
                    window.showErrorMessage(`CAPTCHA solving failed: ${captchaResult.error}`);
                    return;
                }
            }).catch(error => {
                console.error('❌ CAPTCHA solver error:', error);
                // Proceed anyway if CAPTCHA solver fails
                console.log('⚠️ Proceeding without CAPTCHA due to solver error...');
                proceedWithFormSubmission(form, submitButton);
            });
        } else {
            console.log('⚠️ CAPTCHA solver not available, proceeding without CAPTCHA handling...');
            proceedWithFormSubmission(form, submitButton);
        }
    };

    // ✅ NEW FUNCTION: Proceed with actual form submission
    function proceedWithFormSubmission(form, submitButton) {
        // Small delay after checkbox and CAPTCHA handling
        setTimeout(() => {
            window.showWaitingMessage();

            // Enhanced monitoring with error handling
            window.startUrlChangeMonitoring(
                window.originalUrl,
                // onSuccess
                (newUrl) => {
                    console.log('✅ Comment submission successful!');
                    window.removeWaitingMessage();

                    const cleanOriginalUrl = window.originalUrl.split('#')[0];
                    window.markUrlAsCompleted(cleanOriginalUrl, 'Comment submitted successfully');
                    window.showSuccessMessage('Comment submitted successfully!');

                    if (window.commentConfig.autoNavigate) {
                        setTimeout(() => {
                            window.navigateToNextUrl();
                        }, 3000);
                    }
                },
                // onError
                (errorUrl, errorReason) => {
                    console.log('❌ Comment submission error:', errorReason);
                    window.removeWaitingMessage();

                    if (window.commentConfig.retryOnError) {
                        window.handleRetry(window.originalUrl, errorReason);
                    } else {
                        window.showErrorMessage(`Comment submission failed: ${errorReason}`);
                        setTimeout(() => {
                            window.navigateToNextUrl();
                        }, 5000);
                    }
                },
                // onTimeout
                () => {
                    console.log('⏰ Comment submission timeout');
                    window.removeWaitingMessage();

                    const currentUrl = window.location.href;
                    const errorDetected = window.detectCommentError();

                    if (errorDetected.error) {
                        console.log('❌ Error detected on timeout:', errorDetected.reason);

                        if (window.commentConfig.retryOnError) {
                            window.handleRetry(window.originalUrl, errorDetected.reason);
                        } else {
                            window.showErrorMessage(`Timeout with error: ${errorDetected.reason}`);
                            setTimeout(() => {
                                window.navigateToNextUrl();
                            }, 5000);
                        }
                    } else {
                        window.showErrorMessage('Comment submission timeout. No clear success or error detected.');

                        if (window.commentConfig.retryOnError) {
                            window.handleRetry(window.originalUrl, 'Submission timeout');
                        } else {
                            setTimeout(() => {
                                window.navigateToNextUrl();
                            }, 5000);
                        }
                    }
                }
            );

            // Submit form
            try {
                if (submitButton) {
                    submitButton.click();
                } else {
                    form.submit();
                }
            } catch (e) {
                console.error('❌ Error submitting form:', e);
                window.removeWaitingMessage();
                window.showErrorMessage('Error submitting form: ' + e.message);

                if (window.commentConfig.retryOnError) {
                    window.handleRetry(window.originalUrl, 'Form submission error: ' + e.message);
                }
            }
        }, 1500); // Increased delay to allow CAPTCHA processing
    }

    // ✅ NEW FUNCTION: Show CAPTCHA handling message
    function showCaptchaMessage(message) {
        const captchaDiv = document.createElement('div');
        captchaDiv.style.cssText = `
            position: fixed;
            top: 60px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10002;
            background: rgba(255, 152, 0, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        captchaDiv.innerHTML = `🔐 ${message}`;
        document.body.appendChild(captchaDiv);
        
        setTimeout(() => {
            if (captchaDiv.parentElement) {
                captchaDiv.remove();
            }
        }, 4000);
    }

    // ✅ FIXED: Get or initialize retry count for specific URL
    function getRetryCount(url) {
        const retryKey = `retryCount_${url}`;
        return parseInt(GM_getValue(retryKey, '0')) || 0;
    }

    // ✅ FIXED: Set retry count for specific URL
    function setRetryCount(url, count) {
        const retryKey = `retryCount_${url}`;
        GM_setValue(retryKey, count.toString());
    }

    // ✅ FIXED: Clear retry count for specific URL
    function clearRetryCount(url) {
        const retryKey = `retryCount_${url}`;
        GM_deleteValue(retryKey);
    }
    
    // Main comment processing
    window.proceedWithComment = function() {
        console.log('🚀 Starting comment process...');

        const currentUrl = window.location.href;

        // ✅ FIXED: Handle wp-comments-post.php error case with proper retry logic
        if (currentUrl.includes('wp-comments-post.php')) {
            console.log('❌ Detected wp-comments-post.php - handling error...');

            const currentIndex = window.getCurrentUrlIndex();
            if (currentIndex < window.targetUrls.length) {
                const originalTargetUrl = window.targetUrls[currentIndex];
                
                // ✅ Get current retry count for this specific URL
                const currentRetryCount = getRetryCount(originalTargetUrl);
                const maxRetries = window.commentConfig.maxRetries || 2;

                console.log(`🔄 Retry status for ${originalTargetUrl}: ${currentRetryCount}/${maxRetries}`);

                if (window.commentConfig.retryOnError && currentRetryCount < maxRetries) {
                    // ✅ Increment retry count
                    setRetryCount(originalTargetUrl, currentRetryCount + 1);
                    
                    console.log(`🔄 Retrying URL (${currentRetryCount + 1}/${maxRetries}): ${originalTargetUrl}`);
                    window.showErrorMessage(`wp-comments-post.php error. Retrying... (${currentRetryCount + 1}/${maxRetries})`);
                    
                    // ✅ Use handleRetry function
                    setTimeout(() => {
                        window.handleRetry(originalTargetUrl, 'wp-comments-post.php error detected');
                    }, 3000);
                    
                } else {
                    // ✅ Max retries reached or retry disabled
                    if (currentRetryCount >= maxRetries) {
                        console.log(`❌ Max retries (${maxRetries}) reached for: ${originalTargetUrl}`);
                        window.showErrorMessage(`wp-comments-post.php error. Max retries (${maxRetries}) reached. Skipping to next URL.`);
                    } else {
                        console.log('❌ Retry disabled, skipping to next URL');
                        window.showErrorMessage('wp-comments-post.php error detected. Skipping to next URL.');
                    }
                    
                    // ✅ Clear retry count and mark as completed
                    clearRetryCount(originalTargetUrl);
                    window.markUrlAsCompleted(originalTargetUrl, `wp-comments-post.php error - max retries reached (${currentRetryCount})`);
                    
                    setTimeout(() => {
                        window.navigateToNextUrl();
                    }, 5000);
                }
            }
            return;
        }

        // Check if already commented
        if (window.hasAlreadyCommented()) {
            console.log('✅ URL already completed, navigating to next...');

            if (window.commentConfig.autoNavigate) {
                setTimeout(() => {
                    window.navigateToNextUrl();
                }, 2000);
            }
            return;
        }

        // Check if target URL
        if (!window.isTargetUrl()) {
            console.log('⚠️ Not a target URL, skipping...');
            return;
        }

        console.log('🎯 Target URL detected, proceeding with comment...');

        // ✅ Clear retry count on successful page load
        const currentIndex = window.getCurrentUrlIndex();
        if (currentIndex < window.targetUrls.length) {
            const targetUrl = window.targetUrls[currentIndex];
            clearRetryCount(targetUrl);
        }

        // Wait for page to fully load
        setTimeout(() => {
            let success = false;

            // Try WordPress first
            if (window.isWordPress()) {
                console.log('🔧 WordPress detected, using WordPress form filling...');
                success = window.fillWordPressForm();
            }

            // Try generic forms if WordPress failed
            if (!success) {
                console.log('🔍 Trying generic form filling...');
                success = window.tryGenericFormFilling();
            }

            if (!success) {
                console.log('❌ No suitable comment form found');
                window.showErrorMessage('No comment form found on this page');

                if (window.commentConfig.autoNavigate) {
                    setTimeout(() => {
                        window.navigateToNextUrl();
                    }, 5000);
                }
            }

        }, 2000);
    };
    
    // WordPress detection
    window.isWordPress = function() {
        return !!(
            document.querySelector('#commentform') ||
            document.querySelector('form[action*="wp-comments-post"]') ||
            document.querySelector('.wp-comment-form') ||
            document.querySelector('meta[name="generator"][content*="WordPress"]')
        );
    };
    
    // Enhanced initialization
    window.initializeScript = function() {
        console.log('🤖 Auto Backlink Bot initializing...');
        console.log('📍 Current URL:', window.location.href);
        console.log('🎯 Target URLs:', window.targetUrls);
        console.log('📋 Checkbox handling enabled:', window.commentConfig.handleCheckboxes);
        console.log('🔐 CAPTCHA solver available:', typeof window.autoSolve === 'function');
        console.log('🔄 Retry settings:', {
            retryOnError: window.commentConfig.retryOnError,
            maxRetries: window.commentConfig.maxRetries
        });

        // Handle wp-comments-post.php immediately
        if (window.location.href.includes('wp-comments-post.php')) {
            console.log('❌ wp-comments-post.php detected on initialization');

            setTimeout(() => {
                window.proceedWithComment();
            }, 1000);

            return;
        }

        // Check if we should proceed
        if (window.isTargetUrl() && !window.hasAlreadyCommented()) {
            console.log('✅ Ready to proceed with commenting');

            setTimeout(() => {
                window.proceedWithComment();
            }, 3000);
        } else if (window.hasAlreadyCommented()) {
            console.log('✅ URL already completed');

            if (window.commentConfig.autoNavigate) {
                setTimeout(() => {
                    window.navigateToNextUrl();
                }, 3000);
            }
        } else {
            console.log('ℹ️ Not a target URL, script in standby mode');
        }
    };
    
})();
