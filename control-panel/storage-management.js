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
    
    // FUNGSI LAMA - Tetap tidak berubah untuk kompatibilitas
    window.markUrlAsCompleted = function(url, reason = 'Comment submitted') {
        const cleanUrl = url.split('#')[0].split('?')[0];
        const completedUrls = window.getCompletedUrls();
        if (!completedUrls.includes(cleanUrl)) {
            completedUrls.push(cleanUrl);
            window.setCompletedUrls(completedUrls);
            console.log(`✅ Marked as completed: ${cleanUrl} (${reason})`);
        }
    };
    
    // FUNGSI BARU - Untuk menyimpan URL dengan hash
    window.markUrlAsCompletedWithHash = function(url, reason = 'Comment submitted with hash') {
        let urlToSave;
        
        // Jika URL memiliki hash, simpan URL dengan hash
        if (url.includes('#')) {
            urlToSave = url; // Simpan URL lengkap dengan hash
            console.log(`🔗 URL has hash, saving full URL: ${urlToSave}`);
        } else {
            // Jika tidak ada hash, simpan URL asli tanpa parameter query
            urlToSave = url.split('?')[0];
            console.log(`🔗 URL has no hash, saving clean URL: ${urlToSave}`);
        }
        
        const completedUrls = window.getCompletedUrls();
        if (!completedUrls.includes(urlToSave)) {
            completedUrls.push(urlToSave);
            window.setCompletedUrls(completedUrls);
            console.log(`✅ Marked as completed with hash: ${urlToSave} (${reason})`);
        } else {
            console.log(`ℹ️ URL already completed: ${urlToSave}`);
        }
    };
    
    window.isUrlCompleted = function(url) {
        const cleanUrl = url.split('#')[0].split('?')[0];
        const completedUrls = window.getCompletedUrls();
        return completedUrls.includes(cleanUrl);
    };
    
    // FUNGSI BARU - Cek apakah URL dengan hash sudah completed
    window.isUrlWithHashCompleted = function(url) {
        const completedUrls = window.getCompletedUrls();
        const baseUrl = url.split('#')[0].split('?')[0];
        
        // Cek apakah ada URL yang sudah completed dengan base URL yang sama
        // atau URL dengan hash yang persis sama
        return completedUrls.some(completedUrl => {
            const completedBaseUrl = completedUrl.split('#')[0].split('?')[0];
            return completedBaseUrl === baseUrl || completedUrl === url;
        });
    };
    
    // FUNGSI BARU - Untuk mendapatkan URL dengan hash dari current page
    window.getCurrentUrlWithHash = function() {
        return window.location.href; // Mendapatkan URL lengkap termasuk hash
    };
    
    // FUNGSI BARU - Untuk mendapatkan semua completed URLs dengan hash
    window.getCompletedUrlsWithHash = function() {
        const completedUrls = window.getCompletedUrls();
        return completedUrls.filter(url => url.includes('#'));
    };
    
    // FUNGSI BARU - Untuk mendapatkan semua completed URLs tanpa hash
    window.getCompletedUrlsWithoutHash = function() {
        const completedUrls = window.getCompletedUrls();
        return completedUrls.filter(url => !url.includes('#'));
    };
    
    // FUNGSI BARU - Untuk membersihkan duplicate URLs
    window.cleanDuplicateUrls = function() {
        const completedUrls = window.getCompletedUrls();
        const uniqueUrls = [...new Set(completedUrls)]; // Hapus duplikat
        
        if (uniqueUrls.length !== completedUrls.length) {
            window.setCompletedUrls(uniqueUrls);
            console.log(`🧹 Cleaned ${completedUrls.length - uniqueUrls.length} duplicate URLs`);
        }
        
        return uniqueUrls;
    };
    
    // FUNGSI BARU - Untuk debugging - tampilkan semua completed URLs
    window.showAllCompletedUrls = function() {
        const completedUrls = window.getCompletedUrls();
        console.log('📋 All Completed URLs:');
        completedUrls.forEach((url, index) => {
            const hasHash = url.includes('#') ? '🔗' : '📄';
            console.log(`${index + 1}. ${hasHash} ${url}`);
        });
        return completedUrls;
    };
    
    // FUNGSI BARU - Untuk menghapus URL tertentu dari completed list
    window.removeCompletedUrl = function(urlToRemove) {
        const completedUrls = window.getCompletedUrls();
        const filteredUrls = completedUrls.filter(url => url !== urlToRemove);
        
        if (filteredUrls.length !== completedUrls.length) {
            window.setCompletedUrls(filteredUrls);
            console.log(`🗑️ Removed URL: ${urlToRemove}`);
            return true;
        } else {
            console.log(`❌ URL not found: ${urlToRemove}`);
            return false;
        }
    };
    
    // FUNGSI BARU - Untuk reset semua completed URLs
    window.resetAllCompletedUrls = function() {
        window.setCompletedUrls([]);
        console.log('🔄 Reset all completed URLs');
    };
    
})();
