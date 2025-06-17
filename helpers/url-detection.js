// URL Detection Helper
(function() {
    'use strict';
    
    // Fungsi untuk cek apakah URL berubah (wp-comments-post.php = ERROR)
    window.hasUrlChanged = function(originalUrl, currentUrl) {
        if (originalUrl === currentUrl) return false;

        console.log('🔍 Checking URL change:', {
            original: originalUrl,
            current: currentUrl
        });

        // wp-comments-post.php menandakan ERROR
        if (currentUrl.includes('wp-comments-post.php')) {
            console.log('❌ WordPress comment post ERROR detected!');
            return false;
        }

        // SUCCESS: Cek hash comment
        if (currentUrl.includes('#comment-') && !originalUrl.includes('#comment-')) {
            console.log('✅ Comment hash detected (SUCCESS):', currentUrl);
            return true;
        }

        // SUCCESS: Cek parameter success
        const successParams = ['comment', 'submitted', 'success', 'approved', 'moderated'];
        try {
            const currentUrlObj = new URL(currentUrl);
            for (let param of successParams) {
                if (currentUrlObj.searchParams.has(param)) {
                    console.log('✅ Success parameter detected:', param);
                    return true;
                }
            }
        } catch (e) {
            console.log('⚠️ Error parsing URL parameters:', e);
        }

        return false;
    };
    
    // Deteksi error di wp-comments-post.php
    window.detectCommentError = function() {
        const currentUrl = window.location.href;

        if (currentUrl.includes('wp-comments-post.php')) {
            const errorTexts = [
                'error', 'invalid', 'required', 'missing', 'failed',
                'duplicate', 'spam', 'blocked', 'not allowed', 'forbidden'
            ];

            const pageText = document.body.textContent.toLowerCase();
            for (let text of errorTexts) {
                if (pageText.includes(text)) {
                    return {
                        error: true,
                        reason: `Error detected in wp-comments-post.php: "${text}"`
                    };
                }
            }

            return {
                error: true,
                reason: 'Stuck at wp-comments-post.php (likely form validation error)'
            };
        }

        return { error: false };
    };
    
    // Enhanced success detection
    window.detectCommentSuccess = function() {
        const currentUrl = window.location.href;

        if (currentUrl.includes('wp-comments-post.php')) {
            return { success: false, reason: 'wp-comments-post.php indicates error' };
        }

        if (currentUrl.includes('#comment-')) {
            return { success: true, reason: 'Comment hash in URL' };
        }

        const successTexts = [
            'comment has been submitted', 'comment is awaiting moderation',
            'thank you for your comment', 'your comment has been posted',
            'comment successfully', 'awaiting approval', 'comment received',
            'moderation queue', 'pending approval', 'comment will appear'
        ];

        const pageText = document.body.textContent.toLowerCase();
        for (let text of successTexts) {
            if (pageText.includes(text)) {
                return { success: true, reason: `Success text: "${text}"` };
            }
        }

        return { success: false };
    };
    
})();