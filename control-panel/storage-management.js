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

    window.markUrlAsCompleted = function(url, reason = 'Comment submitted') {
        const cleanUrl = url.split('#')[0].split('?')[0];
        const completedUrls = window.getCompletedUrls();

        if (!completedUrls.includes(cleanUrl)) {
            completedUrls.push(cleanUrl);
            window.setCompletedUrls(completedUrls);
            console.log(`✅ Marked as completed: ${cleanUrl} (${reason})`);
        }
    };

    window.isUrlCompleted = function(url) {
        const cleanUrl = url.split('#')[0].split('?')[0];
        const completedUrls = window.getCompletedUrls();
        return completedUrls.includes(cleanUrl);
    };
    
})();