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

        // ⬇️ UPDATE BOT STATE
        if (typeof window.setBotState === 'function') {
            window.setBotState({
                lastActivity: new Date().toISOString()
            });
        }

        setTimeout(() => {
            window.location.href = nextUrl;
        }, window.commentConfig.delayBetweenUrls);
    };
    
    // Handle retry logic
    window.handleRetry = function(originalTargetUrl, errorReason) {
        const currentRetries = window.getRetryCount(originalTargetUrl);
        const maxRetries = window.commentConfig?.maxRetries || 3;

        if (currentRetries < maxRetries) {
            const newRetryCount = currentRetries + 1;
            window.setRetryCount(originalTargetUrl, newRetryCount);

            console.log(`🔄 Retrying URL (${newRetryCount}/${maxRetries}): ${originalTargetUrl}`);
            
            if (typeof window.showRetryMessage === 'function') {
                window.showRetryMessage(`Retry ${newRetryCount}/${maxRetries}: ${errorReason}`);
            }

            // ⬇️ RESET RETRY COUNT JIKA PERLU (GUNAKAN FUNCTION YANG SUDAH ADA)
            if (typeof window.resetRetryCount === 'function' && newRetryCount >= maxRetries) {
                // Don't reset here, let it fail naturally
            }

            setTimeout(() => {
                window.submitAttempted = false;
                window.isWaitingForUrlChange = false;
                
                // ⬇️ UPDATE BOT STATE
                if (typeof window.setBotState === 'function') {
                    window.setBotState({
                        lastActivity: new Date().toISOString()
                    });
                }
                
                window.location.href = originalTargetUrl;
            }, 3000);

        } else {
            console.log(`❌ Max retries reached for: ${originalTargetUrl}`);
            
            if (typeof window.showErrorMessage === 'function') {
                window.showErrorMessage(`Max retries reached. Skipping URL: ${errorReason}`);
            }

            window.markUrlAsCompleted(originalTargetUrl, originalTargetUrl, `Failed after ${maxRetries} retries: ${errorReason}`);

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
        const maxChecks = (window.commentConfig?.urlChangeTimeout || 30000) / 500;

        // ⬇️ UPDATE BOT STATE
        if (typeof window.setBotState === 'function') {
            window.setBotState({
                lastActivity: new Date().toISOString()
            });
        }

        const checkInterval = setInterval(() => {
            checkCount++;
            const currentUrl = window.location.href;

            console.log(`🔍 Check ${checkCount}/${maxChecks}: ${currentUrl}`);

            // Check ERROR first
            const errorDetected = window.detectCommentError ? window.detectCommentError() : { error: false };
            if (errorDetected.error) {
                console.log('❌ Error detected:', errorDetected.reason);
                clearInterval(checkInterval);
                clearTimeout(window.urlChangeTimer);
                window.isWaitingForUrlChange = false;
                onError(currentUrl, errorDetected.reason);
                return;
            }

            // Then check SUCCESS
            const successDetected = window.detectCommentSuccess ? window.detectCommentSuccess() : { success: false };
            if (window.hasUrlChanged(originalUrl, currentUrl) || successDetected.success) {
                console.log('✅ Success detected!');
                clearInterval(checkInterval);
                clearTimeout(window.urlChangeTimer);
                window.isWaitingForUrlChange = false;
                
                // ⬇️ UPDATE BOT STATE
                if (typeof window.setBotState === 'function') {
                    window.setBotState({
                        lastActivity: new Date().toISOString()
                    });
                }
                
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
        }, window.commentConfig?.urlChangeTimeout || 30000);
    };
    
    // ⬇️ TAMBAHKAN FUNCTION UNTUK CHECK URL CHANGE
    window.hasUrlChanged = function(originalUrl, currentUrl) {
        if (!originalUrl || !currentUrl) return false;
        
        try {
            const originalObj = new URL(originalUrl);
            const currentObj = new URL(currentUrl);
            
            // Check if domain changed
            if (originalObj.hostname !== currentObj.hostname) {
                return true;
            }
            
            // Check if path changed significantly
            if (originalObj.pathname !== currentObj.pathname) {
                return true;
            }
            
            // Check for success indicators in URL
            if (currentObj.hash.includes('#comment-') || 
                currentObj.search.includes('comment=') ||
                currentObj.search.includes('submitted=') ||
                currentObj.search.includes('success=')) {
                return true;
            }
            
            return false;
        } catch (e) {
            console.error('Error checking URL change:', e);
            // Fallback to simple string comparison
            return originalUrl !== currentUrl;
        }
    };
    
    console.log('✅ Enhanced Navigation and Retry helper loaded');
    
})();
