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
    
    // Handle retry logic
    window.handleRetry = function(originalTargetUrl, errorReason) {
        const currentRetries = window.getRetryCount(originalTargetUrl);

        if (currentRetries < window.commentConfig.maxRetries) {
            const newRetryCount = currentRetries + 1;
            window.setRetryCount(originalTargetUrl, newRetryCount);

            console.log(`🔄 Retrying URL (${newRetryCount}/${window.commentConfig.maxRetries}): ${originalTargetUrl}`);
            window.showRetryMessage(`Retry ${newRetryCount}/${window.commentConfig.maxRetries}: ${errorReason}`);

            setTimeout(() => {
                window.submitAttempted = false;
                window.isWaitingForUrlChange = false;
                window.location.href = originalTargetUrl;
            }, 3000);

        } else {
            console.log(`❌ Max retries reached for: ${originalTargetUrl}`);
            window.showErrorMessage(`Max retries reached. Skipping URL: ${errorReason}`);

            window.markUrlAsCompleted(originalTargetUrl, `Failed after ${window.commentConfig.maxRetries} retries: ${errorReason}`);

            setTimeout(() => {
                window.navigateToNextUrl();
            }, 5000);
        }
    };
    
    // Enhanced URL monitoring
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
    
})();