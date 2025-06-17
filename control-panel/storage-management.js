// Storage Management Helper
(function() {
    'use strict';
    
    // Storage functions
    window.getCurrentUrlIndex = function() {
        return parseInt(GM_getValue('currentUrlIndex', 0)) || 0;
    };

    window.setCurrentUrlIndex = function(index) {
        GM_setValue('currentUrlIndex', parseInt(index));
        console.log('📍 Set URL Index to:', index);
    };

    window.getCompletedUrls = function() {
        const urls = GM_getValue('completedUrls', []);
        return Array.isArray(urls) ? urls : [];
    };

    window.setCompletedUrls = function(urls) {
        const urlArray = Array.isArray(urls) ? urls : [];
        GM_setValue('completedUrls', urlArray);
        console.log('✅ Set Completed URLs:', urlArray);
    };

    // ========== TAMBAHKAN FUNGSI BARU INI ==========
    // NEW: Get completed URLs with full details (including hash)
    window.getCompletedUrlsWithDetails = function() {
        const urls = GM_getValue('completedUrlsWithDetails', []);
        return Array.isArray(urls) ? urls : [];
    };

    window.setCompletedUrlsWithDetails = function(urls) {
        const urlArray = Array.isArray(urls) ? urls : [];
        GM_setValue('completedUrlsWithDetails', urlArray);
        console.log('✅ Set Completed URLs with Details:', urlArray);
    };

    // NEW: Get success and error URLs separately
    window.getSuccessUrls = function() {
        const completedUrlsWithDetails = window.getCompletedUrlsWithDetails();
        return completedUrlsWithDetails
            .filter(item => item.status === 'success')
            .map(item => item.fullUrl);
    };

    window.getErrorUrls = function() {
        const completedUrlsWithDetails = window.getCompletedUrlsWithDetails();
        return completedUrlsWithDetails
            .filter(item => item.status === 'error')
            .map(item => item.fullUrl);
    };
    // ========== AKHIR FUNGSI BARU ==========

    window.getRetryCount = function(url) {
        const retries = GM_getValue('retryCount', {});
        const cleanUrl = url.split('#')[0].split('?')[0];
        return retries[cleanUrl] || 0;
    };

    window.setRetryCount = function(url, count) {
        const retries = GM_getValue('retryCount', {});
        const cleanUrl = url.split('#')[0].split('?')[0];
        retries[cleanUrl] = count;
        GM_setValue('retryCount', retries);
        console.log(`🔄 Set retry count for ${cleanUrl}: ${count}`);
    };

    // ========== GANTI FUNGSI INI ==========
    window.markUrlAsCompleted = function(url, reason = 'Comment submitted') {
        const cleanUrl = url.split('#')[0].split('?')[0];
        const fullUrl = url; // Keep the full URL with hash
        
        // Update the old completedUrls (for backward compatibility)
        const completedUrls = window.getCompletedUrls();
        if (!completedUrls.includes(cleanUrl)) {
            completedUrls.push(cleanUrl);
            window.setCompletedUrls(completedUrls);
        }

        // NEW: Store full URL details with status
        const completedUrlsWithDetails = window.getCompletedUrlsWithDetails();
        const existingIndex = completedUrlsWithDetails.findIndex(item => 
            item.cleanUrl === cleanUrl
        );

        const urlData = {
            cleanUrl: cleanUrl,
            fullUrl: fullUrl,
            reason: reason,
            timestamp: new Date().toISOString(),
            status: url.includes('wp-comments-post.php') ? 'error' : 'success'
        };

        if (existingIndex >= 0) {
            // Update existing entry
            completedUrlsWithDetails[existingIndex] = urlData;
        } else {
            // Add new entry
            completedUrlsWithDetails.push(urlData);
        }

        window.setCompletedUrlsWithDetails(completedUrlsWithDetails);
        console.log(`✅ Marked as completed: ${fullUrl} (${reason})`);
    };
    // ========== AKHIR PENGGANTIAN ==========

    window.isUrlCompleted = function(url) {
        const cleanUrl = url.split('#')[0].split('?')[0];
        const completedUrls = window.getCompletedUrls();
        return completedUrls.includes(cleanUrl);
    };

    console.log('✅ Storage Management helper loaded');
    
})();
