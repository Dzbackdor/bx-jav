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
        
        // Reset retry count untuk URL baru
        window.resetRetryCount(nextUrl);
        
        setTimeout(() => {
            window.location.href = nextUrl;
        }, window.commentConfig.delayBetweenUrls);
    };
    
    // Handle retry logic - DIPERBAIKI
    window.handleRetry = function(originalTargetUrl, errorReason) {
        const currentRetries = window.getRetryCount(originalTargetUrl);
        
        console.log(`📊 Current retries for ${originalTargetUrl}: ${currentRetries}/${window.commentConfig.maxRetries}`);
        
        if (currentRetries < window.commentConfig.maxRetries) {
            const newRetryCount = currentRetries + 1;
            window.setRetryCount(originalTargetUrl, newRetryCount);
            
            console.log(`🔄 Retrying URL (${newRetryCount}/${window.commentConfig.maxRetries}): ${originalTargetUrl}`);
            console.log(`📝 Retry reason: ${errorReason}`);
            
            window.showRetryMessage(`Retry ${newRetryCount}/${window.commentConfig.maxRetries}: ${errorReason}`);
            
            setTimeout(() => {
                window.submitAttempted = false;
                window.isWaitingForUrlChange = false;
                console.log('🔄 Reloading page for retry...');
                window.location.href = originalTargetUrl;
            }, 3000);
            
        } else {
            console.log(`❌ Max retries (${window.commentConfig.maxRetries}) reached for: ${originalTargetUrl}`);
            console.log(`📝 Final error reason: ${errorReason}`);
            
            window.showErrorMessage(`Max retries reached. Skipping URL: ${errorReason}`);
            
            // Mark URL sebagai completed dengan status failed
            window.markUrlAsCompleted(originalTargetUrl, `Failed after ${window.commentConfig.maxRetries} retries: ${errorReason}`);
            
            // PENTING: Reset retry count sebelum pindah ke URL berikutnya
            window.resetRetryCount(originalTargetUrl);
            
            console.log('⏭️ Moving to next URL in 3 seconds...');
            
            setTimeout(() => {
                window.navigateToNextUrl();
            }, 3000); // Kurangi delay dari 5000 ke 3000
        }
    };
    
    // Tambahkan fungsi untuk reset retry count
    window.resetRetryCount = function(url) {
        window.setRetryCount(url, 0);
        console.log(`🔄 Reset retry count for: ${url}`);
    };
    
    // Enhanced URL monitoring - DIPERBAIKI
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
            
            // PRIORITAS 1: Check ERROR first (termasuk wp-comments-post.php)
            const errorDetected = window.detectCommentError();
            if (errorDetected.error) {
                console.log('❌ Error detected:', errorDetected.reason);
                console.log('🔍 Current URL when error detected:', currentUrl);
                
                clearInterval(checkInterval);
                clearTimeout(window.urlChangeTimer);
                window.isWaitingForUrlChange = false;
                
                // Pastikan onError dipanggil dengan originalUrl, bukan currentUrl
                onError(originalUrl, errorDetected.reason);
                return;
            }
            
            // PRIORITAS 2: Check SUCCESS
            const successDetected = window.detectCommentSuccess();
            if (window.hasUrlChanged(originalUrl, currentUrl) || successDetected.success) {
                console.log('✅ Success detected!');
                console.log('📍 Success URL:', currentUrl);
                
                clearInterval(checkInterval);
                clearTimeout(window.urlChangeTimer);
                window.isWaitingForUrlChange = false;
                
                onSuccess(currentUrl);
                return;
            }
            
            // PRIORITAS 3: Check timeout
            if (checkCount >= maxChecks) {
                console.log('⏰ Max checks reached, stopping interval');
                clearInterval(checkInterval);
            }
        }, 500);
        
        // Timeout handler
        window.urlChangeTimer = setTimeout(() => {
            console.log('⏰ URL change timeout reached');
            console.log('📍 URL when timeout:', window.location.href);
            
            clearInterval(checkInterval);
            window.isWaitingForUrlChange = false;
            
            onTimeout();
        }, window.commentConfig.urlChangeTimeout);
    };
    
    // Tambahkan fungsi helper untuk debugging
    window.debugRetryStatus = function() {
        console.log('🐛 DEBUG: Current retry status');
        console.log('📊 Current URL index:', window.getCurrentUrlIndex());
        console.log('📊 Total URLs:', window.targetUrls.length);
        console.log('📊 Current URL:', window.location.href);
        
        if (window.targetUrls && window.targetUrls.length > 0) {
            const currentIndex = window.getCurrentUrlIndex();
            const currentTargetUrl = window.targetUrls[currentIndex];
            console.log('📊 Target URL:', currentTargetUrl);
            console.log('📊 Retry count for target URL:', window.getRetryCount(currentTargetUrl));
        }
    };
    
})();
