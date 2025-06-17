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

        // Handle checkboxes before submission
        console.log('📋 Handling checkboxes before submission...');
        const checkboxHandled = window.handleCheckboxes(form);

        if (!checkboxHandled) {
            console.log('❌ Checkbox handling failed');
            window.submitAttempted = false;
            window.showErrorMessage('Failed to handle required checkboxes');
            return;
        }

        // Small delay after checkbox handling
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
        }, 1000);
    };
    
    // Main comment processing
    window.proceedWithComment = function() {
        console.log('🚀 Starting comment process...');

        const currentUrl = window.location.href;

        // Handle wp-comments-post.php error case
        if (currentUrl.includes('wp-comments-post.php')) {
            console.log('❌ Detected wp-comments-post.php - handling error...');

            const currentIndex = window.getCurrentUrlIndex();
            if (currentIndex < window.targetUrls.length) {
                const originalTargetUrl = window.targetUrls[currentIndex];

                if (window.commentConfig.retryOnError) {
                    window.handleRetry(originalTargetUrl, 'wp-comments-post.php error detected');
                } else {
                    window.showErrorMessage('wp-comments-post.php error detected. Skipping to next URL.');
                    window.markUrlAsCompleted(originalTargetUrl, 'wp-comments-post.php error - skipped');
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