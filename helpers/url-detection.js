// URL Detection Helper
(function() {
    'use strict';
    
    // Check if URL has changed (success detection)
    window.hasUrlChanged = function(originalUrl, currentUrl) {
        if (originalUrl === currentUrl) return false;

        console.log('🔍 Checking URL change:', {
            original: originalUrl,
            current: currentUrl
        });

        // wp-comments-post.php menandakan ERROR
        if (currentUrl.includes('wp-comments-post.php')) {
            console.log('❌ WordPress comment post ERROR detected!');
            return false; // Ini bukan success, tapi error
        }

        // SUCCESS: Cek hash comment (redirect sukses)
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

        // SUCCESS: Kembali ke original URL dengan perubahan (biasanya dengan hash)
        try {
            const original = new URL(originalUrl);
            const current = new URL(currentUrl);

            // Jika kembali ke original domain/path tapi dengan hash atau parameter baru
            if (original.hostname === current.hostname &&
                original.pathname === current.pathname &&
                (current.hash !== original.hash || current.search !== original.search)) {
                console.log('✅ Returned to original URL with changes (SUCCESS)');
                return true;
            }
        } catch (e) {
            console.error('Error comparing URLs:', e);
        }

        return false;
    };

    // Detect comment error
    window.detectCommentError = function() {
        const currentUrl = window.location.href;

        // UTAMA: wp-comments-post.php = ERROR
        if (currentUrl.includes('wp-comments-post.php')) {
            // Cek error messages di halaman
            const errorTexts = [
                'error',
                'invalid',
                'required',
                'missing',
                'failed',
                'duplicate',
                'spam',
                'blocked',
                'not allowed',
                'forbidden'
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

            // Jika di wp-comments-post.php tapi tidak ada teks error spesifik
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

        // wp-comments-post.php = ERROR, bukan success
        if (currentUrl.includes('wp-comments-post.php')) {
            return { success: false, reason: 'wp-comments-post.php indicates error' };
        }

        // SUCCESS: Cek hash comment
        if (currentUrl.includes('#comment-')) {
            return { success: true, reason: 'Comment hash in URL' };
        }

        // SUCCESS: Cek teks success
        const successTexts = [
            'comment has been submitted',
            'comment is awaiting moderation',
            'thank you for your comment',
            'your comment has been posted',
            'comment successfully',
            'awaiting approval',
            'comment received',
            'moderation queue',
            'pending approval',
            'comment will appear'
        ];

        const pageText = document.body.textContent.toLowerCase();
        for (let text of successTexts) {
            if (pageText.includes(text)) {
                return { success: true, reason: `Success text: "${text}"` };
            }
        }

        return { success: false };
    };

    // Target URL check
    window.isTargetUrl = function() {
        if (window.targetUrls.length === 0) return true;

        const currentUrl = window.location.href.split('#')[0].split('?')[0];

        // wp-comments-post.php BUKAN target URL
        if (currentUrl.includes('wp-comments-post.php')) {
            console.log('⚠️ wp-comments-post.php detected - this is an error page');
            return false; // Bukan target URL, ini error page
        }

        for (let targetUrl of window.targetUrls) {
            const targetClean = targetUrl.split('#')[0].split('?')[0];
            if (currentUrl === targetClean || currentUrl.replace(/\/$/, '') === targetClean.replace(/\/$/, '')) {
                return true;
            }
        }

        return false;
    };

    // Already commented check
    window.hasAlreadyCommented = function() {
        const currentUrl = window.location.href;

        // wp-comments-post.php = ERROR, bukan completed
        if (currentUrl.includes('wp-comments-post.php')) {
            console.log('❌ wp-comments-post.php detected - this indicates an error');
            return false; // Bukan completed, ini error
        }

        // Cek dari storage
        if (window.isUrlCompleted(currentUrl)) {
            console.log('✅ URL marked as completed in storage');
            return true;
        }

        // Cek hash comment di URL
        if (currentUrl.includes('#comment-')) {
            console.log('✅ URL contains comment hash');
            window.markUrlAsCompleted(currentUrl, 'Comment hash in URL');
            return true;
        }

        // Cek success indicators
        const successDetected = window.detectCommentSuccess();
        if (successDetected.success) {
            console.log('✅ Success indicators found:', successDetected.reason);
            window.markUrlAsCompleted(currentUrl, successDetected.reason);
            return true;
        }

        return false;
    };
    
    console.log('✅ URL Detection helper loaded');
    
})();
