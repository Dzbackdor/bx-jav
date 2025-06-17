// Navigation and Retry Helper
(function() {
    'use strict';
    
    // Navigate to next URL
    window.navigateToNextUrl = function() {
        const currentIndex = window.getCurrentUrlIndex();
        const nextIndex = currentIndex + 1;

        if (nextIndex >= window.targetUrls.length) {
            console.log('🎉 All URLs completed!');
            window.showCompletionMessage();
            return;
        }

        window.setCurrentUrlIndex(nextIndex);
        const nextUrl = window.targetUrls[nextIndex];

        console.log(`🔄 Navigating to next URL (${nextIndex + 1}/${window.targetUrls.length}): ${nextUrl}`);

        setTimeout(() => {
            window.location.href = nextUrl;
        }, window.commentConfig.delayBetweenUrls);
    };
    
    // Enhanced retry logic with better error handling
    window.handleRetry = function(originalTargetUrl, errorReason) {
        const currentRetries = window.getRetryCount(originalTargetUrl);

        if (currentRetries < window.commentConfig.maxRetries) {
            const newRetryCount = currentRetries + 1;
            window.setRetryCount(originalTargetUrl, newRetryCount);

            console.log(`🔄 Retrying URL (${newRetryCount}/${window.commentConfig.maxRetries}): ${originalTargetUrl}`);
            console.log(`🔄 Retry reason: ${errorReason}`);
            
            // Clean error message for display
            const displayReason = window.cleanErrorMessage ? window.cleanErrorMessage(errorReason) : errorReason;
            window.showRetryMessage(`Retry ${newRetryCount}/${window.commentConfig.maxRetries}: ${displayReason}`);

            setTimeout(() => {
                window.submitAttempted = false;
                window.isWaitingForUrlChange = false;
                window.location.href = originalTargetUrl;
            }, 3000);

        } else {
            console.log(`❌ Max retries reached for: ${originalTargetUrl}`);
            console.log(`❌ Final error: ${errorReason}`);
            
            // Clean error message for user display
            const userFriendlyError = window.getUserFriendlyError ? 
                window.getUserFriendlyError(errorReason) : 
                (errorReason.includes('wp-comments-post.php') ? 
                    'WordPress comment submission failed' : 
                    errorReason);
            
            window.showErrorMessage(`Max retries reached. Skipping URL: ${userFriendlyError}`);

            // Store detailed error for debugging
            const failureReason = `Failed after ${window.commentConfig.maxRetries} retries: ${errorReason}`;
            window.markUrlAsCompleted(originalTargetUrl, failureReason);
            
            // Reset retry count after marking as failed
            if (typeof window.resetRetryCount === 'function') {
                window.resetRetryCount(originalTargetUrl);
                console.log(`🔄 Reset retry count for failed URL: ${originalTargetUrl}`);
            }

            setTimeout(() => {
                window.navigateToNextUrl();
            }, 5000);
        }
    };
    
    // Helper function to clean error messages
    window.cleanErrorMessage = function(errorMessage) {
        if (!errorMessage) return 'Unknown error';
        
        // Clean up wp-comments-post.php errors
        if (errorMessage.includes('wp-comments-post.php')) {
            return 'WordPress comment error';
        }
        
        // Clean up other common errors
        if (errorMessage.includes('Unknown')) {
            return errorMessage.replace(/Unknown\s+/gi, '');
        }
        
        return errorMessage;
    };
    
    // Helper function for user-friendly error messages
    window.getUserFriendlyError = function(errorMessage) {
        if (!errorMessage) return 'Unknown error occurred';
        
        const errorMap = {
            'wp-comments-post.php': 'Comment submission failed',
            'timeout': 'Request timed out',
            'network': 'Network connection error',
            'permission': 'Permission denied',
            'duplicate': 'Duplicate comment detected'
        };
        
        for (const [key, friendlyMsg] of Object.entries(errorMap)) {
            if (errorMessage.toLowerCase().includes(key)) {
                return friendlyMsg;
            }
        }
        
        return window.cleanErrorMessage(errorMessage);
    };
    
    // Enhanced URL monitoring (unchanged)
    window.startUrlChangeMonitoring = function(originalUrl, onSuccess, onError, onTimeout) {
        console.log('👀 Starting enhanced URL monitoring...');
        console.log('📍 Original URL:', originalUrl);

        window.isWaitingForUrlChange = true;
        let checkCount = 0;
        const maxChecks = window.commentConfig.urlChangeTimeout / 500;

        const checkInterval = setInterval(() => {
            checkCount++;
            const currentUrl = window.location.href;

            console.log(`🔍 Check ${checkCount}/${maxChecks}: ${currentUrl}`);

            // Check ERROR first
            const errorDetected = window.detectCommentError();
            if (errorDetected.error) {
                console.log('❌ Error detected:', errorDetected.reason);
                clearInterval(checkInterval);
                clearTimeout(window.urlChangeTimer);
                window.isWaitingForUrlChange = false;
                onError(currentUrl, errorDetected.reason);
                return;
            }

            // Then check SUCCESS
            if (window.hasUrlChanged(originalUrl, currentUrl) || window.detectCommentSuccess().success) {
                console.log('✅ Success detected!');
                clearInterval(checkInterval);
                clearTimeout(window.urlChangeTimer);
                window.isWaitingForUrlChange = false;
                onSuccess(currentUrl);
                return;
            }

            if (checkCount >= maxChecks) {
                clearInterval(checkInterval);
            }
        }, 500);

        window.urlChangeTimer = setTimeout(() => {
            console.log('⏰ URL change timeout');
            clearInterval(checkInterval);
            window.isWaitingForUrlChange = false;
            onTimeout();
        }, window.commentConfig.urlChangeTimeout);
    };
    
    console.log('✅ Enhanced Navigation and Retry helper loaded');
    
})();
