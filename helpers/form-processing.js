// Form Processing Helper
(function() {
    'use strict';
    
    // Check if target URL
    window.isTargetUrl = function() {
        if (!window.targetUrls || window.targetUrls.length === 0) return true;

        const currentUrl = window.location.href.split('#')[0].split('?')[0];

        if (currentUrl.includes('wp-comments-post.php')) {
            console.log('⚠️ wp-comments-post.php detected - this is an error page');
            return false;
        }

        for (let targetUrl of window.targetUrls) {
            const targetClean = targetUrl.split('#')[0].split('?')[0];
            if (currentUrl === targetClean || currentUrl.replace(/\/$/, '') === targetClean.replace(/\/$/, '')) {
                return true;
            }
        }

        return false;
    };
    
    // Check if already commented
    window.hasAlreadyCommented = function() {
        const currentUrl = window.location.href;

        if (currentUrl.includes('wp-comments-post.php')) {
            console.log('❌ wp-comments-post.php detected - this indicates an error');
            return false;
        }

        if (window.isUrlCompleted(currentUrl)) {
            console.log('✅ URL marked as completed in storage');
            return true;
        }

        if (currentUrl.includes('#comment-')) {
            console.log('✅ URL contains comment hash');
            window.markUrlAsCompleted(currentUrl, 'Comment hash in URL');
            return true;
        }

        const successDetected = window.detectCommentSuccess();
        if (successDetected.success) {
            console.log('✅ Success indicators found:', successDetected.reason);
            window.markUrlAsCompleted(currentUrl, successDetected.reason);
            return true;
        }

        return false;
    };
    
    // Process comment with backlinks
    window.processComment = function(comment) {
        const linkPattern = /\{([^|]+)\|([^}]+)\}/g;
        return comment.replace(linkPattern, (match, anchorText, url) => {
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            return `<a href="${url}" target="_blank">${anchorText}</a>`;
        });
    };
    
    // Get random comment
    window.getRandomComment = function() {
        const randomComment = window.commentConfig.comments[Math.floor(Math.random() * window.commentConfig.comments.length)];
        return window.processComment(randomComment);
    };
    
})();