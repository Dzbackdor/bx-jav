// Storage Management Helper
(function() {
    'use strict';
    
    // Basic URL index functions
    window.getCurrentUrlIndex = function() {
        return parseInt(GM_getValue('currentUrlIndex', 0)) || 0;
    };

    window.setCurrentUrlIndex = function(index) {
        const parsedIndex = parseInt(index);
        GM_setValue('currentUrlIndex', parsedIndex);
        console.log('📍 Set URL Index to:', parsedIndex);
        
        // Update progress message if available
        if (typeof window.showProgressMessage === 'function' && window.targetUrls) {
            const completedUrls = window.getCompletedUrls();
            window.showProgressMessage(completedUrls.length, window.targetUrls.length, 'Processing URLs');
        }
        
        return parsedIndex;
    };

    // Enhanced completed URLs functions
    window.getCompletedUrls = function() {
        try {
            const urls = GM_getValue('completedUrls', []);
            return Array.isArray(urls) ? urls : [];
        } catch (e) {
            console.error('Error getting completed URLs:', e);
            return [];
        }
    };

    window.setCompletedUrls = function(urls) {
        try {
            const urlArray = Array.isArray(urls) ? urls : [];
            GM_setValue('completedUrls', urlArray);
            console.log('✅ Set Completed URLs:', urlArray.length, 'URLs');
            
            // Log message for debugging (with safety check)
            if (typeof window.logMessage === 'function') {
                try {
                    window.logMessage('storage', 'Updated completed URLs', { count: urlArray.length });
                } catch (e) {
                    console.log('📝 Updated completed URLs:', urlArray.length);
                }
            }
            
            return urlArray;
        } catch (e) {
            console.error('Error setting completed URLs:', e);
            return [];
        }
    };

    // Enhanced retry count functions
    window.getRetryCount = function(url) {
        try {
            const retries = GM_getValue('retryCount', {});
            const cleanUrl = window.cleanUrl ? window.cleanUrl(url) : url.split('#')[0].split('?')[0];
            return retries[cleanUrl] || 0;
        } catch (e) {
            console.error('Error getting retry count:', e);
            return 0;
        }
    };

    window.setRetryCount = function(url, count) {
        try {
            const retries = GM_getValue('retryCount', {});
            const cleanUrl = window.cleanUrl ? window.cleanUrl(url) : url.split('#')[0].split('?')[0];
            const parsedCount = parseInt(count) || 0;
            
            retries[cleanUrl] = parsedCount;
            GM_setValue('retryCount', retries);
            console.log(`🔄 Set retry count for ${cleanUrl}: ${parsedCount}`);
            
            return parsedCount;
        } catch (e) {
            console.error('Error setting retry count:', e);
            return 0;
        }
    };

    // ⬇️ TAMBAHKAN FUNCTION YANG MISSING INI
    window.resetRetryCount = function(url) {
        try {
            const retries = GM_getValue('retryCount', {});
            const cleanUrl = window.cleanUrl ? window.cleanUrl(url) : url.split('#')[0].split('?')[0];
            
            if (retries[cleanUrl]) {
                delete retries[cleanUrl];
                GM_setValue('retryCount', retries);
                console.log(`🔄 Reset retry count for: ${cleanUrl}`);
            }
            
            return true;
        } catch (e) {
            console.error('Error resetting retry count:', e);
            return false;
        }
    };

    // Enhanced markUrlAsCompleted with hash preservation
    window.markUrlAsCompleted = function(originalUrl, finalUrl, reason = 'Comment submitted') {
        let urlToStore = originalUrl;
        
        // Jika finalUrl ada dan berbeda dari originalUrl, analisis perubahan
        if (finalUrl && finalUrl !== originalUrl) {
            try {
                const finalUrlObj = new URL(finalUrl);
                const originalUrlObj = new URL(originalUrl);
                
                // Jika ada hash comment di final URL, simpan URL dengan hash
                if (finalUrlObj.hash && finalUrlObj.hash.includes('#comment-')) {
                    urlToStore = finalUrl;
                    console.log(`Storing URL with comment hash: ${urlToStore}`);
                }
                // Jika ada parameter comment di final URL, simpan URL dengan parameter
                else if (finalUrlObj.searchParams.has('comment') || 
                         finalUrlObj.search.includes('comment=') ||
                         finalUrlObj.search.includes('submitted=')) {
                    urlToStore = finalUrl;
                    console.log(`Storing URL with comment parameters: ${urlToStore}`);
                }
                // Jika tidak ada indikator comment, simpan URL asli (clean)
                else {
                    urlToStore = originalUrl.split('#')[0].split('?')[0];
                    console.log(`Storing clean original URL: ${urlToStore}`);
                }
            } catch (e) {
                // Jika URL parsing gagal, gunakan clean URL
                urlToStore = originalUrl.split('#')[0].split('?')[0];
                console.log(`URL parsing failed, using clean URL: ${urlToStore}`);
            }
        } else {
            // Jika tidak ada finalUrl, simpan URL asli (clean)
            urlToStore = originalUrl.split('#')[0].split('?')[0];
            console.log(`Storing original URL (no final URL): ${urlToStore}`);
        }
        
        const completedUrls = window.getCompletedUrls();

        // Cek apakah URL sudah ada (dalam bentuk apapun)
        const cleanOriginal = originalUrl.split('#')[0].split('?')[0];
        const isAlreadyCompleted = completedUrls.some(url => {
            const cleanCompleted = url.split('#')[0].split('?')[0];
            return cleanCompleted === cleanOriginal;
        });

        if (!isAlreadyCompleted) {
            completedUrls.push(urlToStore);
            window.setCompletedUrls(completedUrls);
            console.log(`✅ Marked as completed: ${urlToStore} (${reason})`);
            
            // Log detail untuk debugging (with safety check)
            if (typeof window.logMessage === 'function') {
                try {
                    window.logMessage('success', 'URL marked as completed', {
                        originalUrl: originalUrl,
                        finalUrl: finalUrl,
                        storedUrl: urlToStore,
                        reason: reason
                    });
                } catch (e) {
                    console.log('📝 URL marked as completed:', urlToStore);
                }
            }
        } else {
            console.log(`URL already completed: ${cleanOriginal}`);
        }
    };

    // Enhanced function to check if URL is completed (check both clean and hash versions)
    window.isUrlCompleted = function(url) {
        const cleanUrl = url.split('#')[0].split('?')[0];
        const completedUrls = window.getCompletedUrls();
        
        // Cek apakah ada URL yang match (baik clean maupun dengan hash/parameter)
        return completedUrls.some(completedUrl => {
            const cleanCompleted = completedUrl.split('#')[0].split('?')[0];
            return cleanCompleted === cleanUrl;
        });
    };

    // New: Get completed URL with its stored format
    window.getCompletedUrlFormat = function(url) {
        const cleanUrl = url.split('#')[0].split('?')[0];
        const completedUrls = window.getCompletedUrls();
        
        const matchedUrl = completedUrls.find(completedUrl => {
            const cleanCompleted = completedUrl.split('#')[0].split('?')[0];
            return cleanCompleted === cleanUrl;
        });
        
        return matchedUrl || null;
    };

    // Enhanced display function for completed URLs
    window.getCompletedUrlsDisplay = function() {
        const completedUrls = window.getCompletedUrls();
        
        return completedUrls.map((url, index) => {
            const hasHash = url.includes('#comment-');
            const hasParams = url.includes('comment=') || url.includes('submitted=');
            
            return {
                index: index + 1,
                url: url,
                type: hasHash ? 'hash' : (hasParams ? 'parameter' : 'clean')
            };
        });
    };
    
    // Clean URL utility (PINDAHKAN KE ATAS AGAR BISA DIGUNAKAN)
    window.cleanUrl = function(url) {
        if (!url) return '';
        return url.split('#')[0].split('?')[0].trim();
    };
    
    // New: URL completion details
    window.setUrlCompletionDetails = function(url, details) {
        try {
            const completionDetails = GM_getValue('completionDetails', {});
            const cleanUrl = window.cleanUrl(url);
            
            completionDetails[cleanUrl] = {
                ...details,
                completedAt: new Date().toISOString()
            };
            
            GM_setValue('completionDetails', completionDetails);
            return true;
        } catch (e) {
            console.error('Error setting completion details:', e);
            return false;
        }
    };
    
    window.getUrlCompletionDetails = function(url) {
        try {
            const completionDetails = GM_getValue('completionDetails', {});
            const cleanUrl = window.cleanUrl(url);
            return completionDetails[cleanUrl] || null;
        } catch (e) {
            console.error('Error getting completion details:', e);
            return null;
        }
    };
    
    // New: Bot state management
    window.getBotState = function() {
        try {
            return {
                isRunning: GM_getValue('botIsRunning', false),
                isPaused: GM_getValue('botIsPaused', false),
                startedAt: GM_getValue('botStartedAt', null),
                lastActivity: GM_getValue('botLastActivity', null)
            };
        } catch (e) {
            console.error('Error getting bot state:', e);
            return { isRunning: false, isPaused: false, startedAt: null, lastActivity: null };
        }
    };
    
    window.setBotState = function(state) {
        try {
            if (typeof state.isRunning !== 'undefined') {
                GM_setValue('botIsRunning', Boolean(state.isRunning));
            }
            if (typeof state.isPaused !== 'undefined') {
                GM_setValue('botIsPaused', Boolean(state.isPaused));
            }
            if (typeof state.startedAt !== 'undefined') {
                GM_setValue('botStartedAt', state.startedAt);
            }
            if (typeof state.lastActivity !== 'undefined') {
                GM_setValue('botLastActivity', state.lastActivity);
            }
            
            console.log('🤖 Bot state updated:', state);
            return true;
        } catch (e) {
            console.error('Error setting bot state:', e);
            return false;
        }
    };

    // ⬇️ TAMBAHKAN SEMUA FUNCTION YANG MISSING
    
    // Session management
    window.createSession = function() {
        try {
            const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const session = {
                id: sessionId,
                startedAt: new Date().toISOString(),
                targetUrls: window.targetUrls ? window.targetUrls.length : 0,
                userAgent: navigator.userAgent,
                version: '4.0'
            };
            
            GM_setValue('currentSession', session);
            console.log('📝 New session created:', sessionId);
            return session;
        } catch (e) {
            console.error('Error creating session:', e);
            return null;
        }
    };
    
    window.getCurrentSession = function() {
        try {
            return GM_getValue('currentSession', null);
        } catch (e) {
            console.error('Error getting current session:', e);
            return null;
        }
    };
    
    window.endSession = function() {
        try {
            const session = window.getCurrentSession();
            if (session) {
                session.endedAt = new Date().toISOString();
                session.completedUrls = window.getCompletedUrls().length;
                
                // Store in session history
                const sessionHistory = GM_getValue('sessionHistory', []);
                sessionHistory.push(session);
                
                // Keep only last 10 sessions
                if (sessionHistory.length > 10) {
                    sessionHistory.splice(0, sessionHistory.length - 10);
                }
                
                GM_setValue('sessionHistory', sessionHistory);
                GM_deleteValue('currentSession');
                
                console.log('📝 Session ended:', session.id);
                return session;
            }
            return null;
        } catch (e) {
            console.error('Error ending session:', e);
            return null;
        }
    };
    
    // Statistics and analytics
    window.getStatistics = function() {
        try {
            const completedUrls = window.getCompletedUrls();
            const retryData = GM_getValue('retryCount', {});
            const sessionHistory = GM_getValue('sessionHistory', []);
            const currentSession = window.getCurrentSession();
            
            const totalRetries = Object.values(retryData).reduce((sum, count) => sum + count, 0);
            const urlsWithRetries = Object.keys(retryData).filter(url => retryData[url] > 0).length;
            
            return {
                totalCompleted: completedUrls.length,
                totalTargets: window.targetUrls ? window.targetUrls.length : 0,
                successRate: window.targetUrls ? Math.round((completedUrls.length / window.targetUrls.length) * 100) : 0,
                totalRetries: totalRetries,
                urlsWithRetries: urlsWithRetries,
                averageRetriesPerUrl: urlsWithRetries > 0 ? Math.round(totalRetries / urlsWithRetries * 100) / 100 : 0,
                totalSessions: sessionHistory.length + (currentSession ? 1 : 0),
                currentSessionId: currentSession ? currentSession.id : null,
                lastSessionDate: sessionHistory.length > 0 ? sessionHistory[sessionHistory.length - 1].startedAt : null
            };
        } catch (e) {
            console.error('Error getting statistics:', e);
            return {
                totalCompleted: 0,
                totalTargets: 0,
                successRate: 0,
                totalRetries: 0,
                urlsWithRetries: 0,
                averageRetriesPerUrl: 0,
                totalSessions: 0,
                currentSessionId: null,
                lastSessionDate: null
            };
        }
    };
    
    // Data export/import
    window.exportData = function() {
        try {
            const data = {
                version: '4.0',
                exportedAt: new Date().toISOString(),
                currentUrlIndex: window.getCurrentUrlIndex(),
                completedUrls: window.getCompletedUrls(),
                retryCount: GM_getValue('retryCount', {}),
                completionDetails: GM_getValue('completionDetails', {}),
                botState: window.getBotState(),
                currentSession: window.getCurrentSession(),
                sessionHistory: GM_getValue('sessionHistory', []),
                statistics: window.getStatistics()
            };
            
            return JSON.stringify(data, null, 2);
        } catch (e) {
            console.error('Error exporting data:', e);
            return null;
        }
    };
    
    window.importData = function(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.version !== '4.0') {
                console.warn('⚠️ Data version mismatch. Proceeding with caution.');
            }
            
            // Import data with validation
            if (data.currentUrlIndex !== undefined) {
                window.setCurrentUrlIndex(data.currentUrlIndex);
            }
            
            if (Array.isArray(data.completedUrls)) {
                window.setCompletedUrls(data.completedUrls);
            }
            
            if (data.retryCount && typeof data.retryCount === 'object') {
                GM_setValue('retryCount', data.retryCount);
            }
            
            if (data.completionDetails && typeof data.completionDetails === 'object') {
                GM_setValue('completionDetails', data.completionDetails);
            }
            
            if (data.sessionHistory && Array.isArray(data.sessionHistory)) {
                GM_setValue('sessionHistory', data.sessionHistory);
            }
            
            console.log('📥 Data imported successfully');
            return true;
        } catch (e) {
            console.error('Error importing data:', e);
            return false;
        }
    };
    
    // Storage cleanup
    window.cleanupStorage = function() {
        try {
            // Clean up old retry counts (remove entries with 0 retries)
            const retryCount = GM_getValue('retryCount', {});
            const cleanedRetryCount = {};
            
            for (const [url, count] of Object.entries(retryCount)) {
                if (count > 0) {
                    cleanedRetryCount[url] = count;
                }
            }
            
            GM_setValue('retryCount', cleanedRetryCount);
            
            // Clean up old completion details (keep only recent ones)
            const completionDetails = GM_getValue('completionDetails', {});
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const cleanedCompletionDetails = {};
            
            for (const [url, details] of Object.entries(completionDetails)) {
                if (details.completedAt && new Date(details.completedAt) > thirtyDaysAgo) {
                    cleanedCompletionDetails[url] = details;
                }
            }
            
            GM_setValue('completionDetails', cleanedCompletionDetails);
            
            console.log('🧹 Storage cleanup completed');
            return true;
        } catch (e) {
            console.error('Error during storage cleanup:', e);
            return false;
        }
    };
    
    // Reset functions
    window.resetAllProgress = function() {
        try {
            // End current session
            window.endSession();
            
            // Clear all progress data
            GM_deleteValue('currentUrlIndex');
            GM_deleteValue('completedUrls');
            GM_deleteValue('retryCount');
            GM_deleteValue('completionDetails');
            GM_deleteValue('botIsRunning');
            GM_deleteValue('botIsPaused');
            GM_deleteValue('botStartedAt');
            GM_deleteValue('botLastActivity');
            
            // Reset runtime variables
            window.submitAttempted = false;
            window.isWaitingForUrlChange = false;
            window.retryCount = 0;
            
            // Clear any running timers
            if (window.urlChangeTimer) {
                clearTimeout(window.urlChangeTimer);
                window.urlChangeTimer = null;
            }
            
            // Clear all messages
            if (typeof window.clearAllMessages === 'function') {
                window.clearAllMessages();
            }
            
            console.log('🔄 All progress reset successfully');
            
            // Show success message
            if (typeof window.showToast === 'function') {
                window.showToast('All progress has been reset', 'success');
            }
            
            return true;
        } catch (e) {
            console.error('Error resetting progress:', e);
            return false;
        }
    };
    
    window.resetRetryCounters = function() {
        try {
            GM_deleteValue('retryCount');
            console.log('🔄 Retry counters reset');
            
            if (typeof window.showToast === 'function') {
                window.showToast('Retry counters reset', 'info');
            }
            
            return true;
        } catch (e) {
            console.error('Error resetting retry counters:', e);
            return false;
        }
    };
    
    window.resetCompletedUrls = function() {
        try {
            GM_deleteValue('completedUrls');
            GM_deleteValue('completionDetails');
            console.log('🔄 Completed URLs reset');
            
            if (typeof window.showToast === 'function') {
                window.showToast('Completed URLs reset', 'info');
            }
            
            return true;
        } catch (e) {
            console.error('Error resetting completed URLs:', e);
            return false;
        }
    };
    
    // Backup and restore
    window.createBackup = function() {
        try {
            const backup = {
                version: '4.0',
                createdAt: new Date().toISOString(),
                data: {
                    currentUrlIndex: window.getCurrentUrlIndex(),
                    completedUrls: window.getCompletedUrls(),
                    retryCount: GM_getValue('retryCount', {}),
                    completionDetails: GM_getValue('completionDetails', {}),
                    sessionHistory: GM_getValue('sessionHistory', [])
                }
            };
            
            const backupString = JSON.stringify(backup, null, 2);
            
            // Store backup in GM storage
            const backups = GM_getValue('backups', []);
            backups.push(backup);
            
            // Keep only last 5 backups
            if (backups.length > 5) {
                backups.splice(0, backups.length - 5);
            }
            
            GM_setValue('backups', backups);
            
            console.log('💾 Backup created successfully');
            return backupString;
        } catch (e) {
            console.error('Error creating backup:', e);
            return null;
        }
    };
    
    window.restoreFromBackup = function(backupData) {
        try {
            const backup = typeof backupData === 'string' ? JSON.parse(backupData) : backupData;
            
            if (!backup.data) {
                throw new Error('Invalid backup format');
            }
            
            // Restore data
            if (backup.data.currentUrlIndex !== undefined) {
                window.setCurrentUrlIndex(backup.data.currentUrlIndex);
            }
            
            if (backup.data.completedUrls) {
                window.setCompletedUrls(backup.data.completedUrls);
            }
            
            if (backup.data.retryCount) {
                GM_setValue('retryCount', backup.data.retryCount);
            }
            
            if (backup.data.completionDetails) {
                GM_setValue('completionDetails', backup.data.completionDetails);
            }
            
            if (backup.data.sessionHistory) {
                GM_setValue('sessionHistory', backup.data.sessionHistory);
            }
            
            console.log('📥 Backup restored successfully');
            
            if (typeof window.showToast === 'function') {
                window.showToast('Backup restored successfully', 'success');
            }
            
            return true;
        } catch (e) {
            console.error('Error restoring backup:', e);
            
            if (typeof window.showToast === 'function') {
                window.showToast('Failed to restore backup', 'error');
            }
            
            return false;
        }
    };
    
    window.getAvailableBackups = function() {
        try {
            return GM_getValue('backups', []);
        } catch (e) {
            console.error('Error getting backups:', e);
            return [];
        }
    };
    
    // Storage health check
    window.checkStorageHealth = function() {
        try {
            const health = {
                status: 'healthy',
                issues: [],
                recommendations: [],
                storageSize: 0,
                lastCheck: new Date().toISOString()
            };
            
            // Check GM functions availability
            if (typeof GM_getValue !== 'function' || typeof GM_setValue !== 'function') {
                health.status = 'critical';
                health.issues.push('Greasemonkey/Tampermonkey storage functions not available');
                return health;
            }
            
            // Check data integrity
            const completedUrls = window.getCompletedUrls();
            const retryCount = GM_getValue('retryCount', {});
            const completionDetails = GM_getValue('completionDetails', {});
            
            if (!Array.isArray(completedUrls)) {
                health.status = 'warning';
                health.issues.push('Completed URLs data is corrupted');
                health.recommendations.push('Reset completed URLs');
            }
            
            if (typeof retryCount !== 'object') {
                health.status = 'warning';
                health.issues.push('Retry count data is corrupted');
                health.recommendations.push('Reset retry counters');
            }
            
            // Check for orphaned data
            const orphanedRetries = Object.keys(retryCount).filter(url => 
                !completedUrls.some(completedUrl => {
                    const cleanCompleted = completedUrl.split('#')[0].split('?')[0];
                    const cleanRetry = url.split('#')[0].split('?')[0];
                    return cleanCompleted === cleanRetry;
                }) && retryCount[url] === 0
            );
            
            if (orphanedRetries.length > 10) {
                health.status = 'warning';
                health.issues.push(`${orphanedRetries.length} orphaned retry entries found`);
                health.recommendations.push('Run storage cleanup');
            }
            
            // Estimate storage size
            try {
                const allData = window.exportData();
                health.storageSize = new Blob([allData]).size;
            } catch (e) {
                health.issues.push('Could not calculate storage size');
            }
            
            // Check for large storage
            if (health.storageSize > 1024 * 1024) { // 1MB
                health.status = 'warning';
                health.issues.push('Storage size is large (>1MB)');
                health.recommendations.push('Consider cleaning up old data');
            }
            
            console.log('🏥 Storage health check completed:', health.status);
            return health;
        } catch (e) {
            console.error('Error during storage health check:', e);
            return {
                status: 'error',
                issues: ['Health check failed: ' + e.message],
                recommendations: ['Check console for errors'],
                storageSize: 0,
                lastCheck: new Date().toISOString()
            };
        }
    };
    
    // ⬇️ PERBAIKI FUNCTION getUrlProgress() - INI YANG PENTING
    window.getUrlProgress = function() {
        try {
            if (!window.targetUrls || window.targetUrls.length === 0) {
                return { processed: [], pending: [], failed: [] };
            }
            
            const completedUrls = window.getCompletedUrls();
            const retryCount = GM_getValue('retryCount', {});
            const completionDetails = GM_getValue('completionDetails', {});
            
            const processed = [];
            const pending = [];
            const failed = [];
            
            window.targetUrls.forEach((url, index) => {
                const cleanUrl = window.cleanUrl(url);
                
                // ⬇️ PERBAIKI LOGIC CHECKING - GUNAKAN isUrlCompleted()
                const isCompleted = window.isUrlCompleted(url);
                const retries = retryCount[cleanUrl] || 0;
                const details = completionDetails[cleanUrl];
                
                const urlInfo = {
                    index: index,
                    originalUrl: url,
                    cleanUrl: cleanUrl,
                    retries: retries,
                    details: details
                };
                
                if (isCompleted) {
                    processed.push(urlInfo);
                } else if (retries >= (window.commentConfig?.maxRetries || 3)) {
                    failed.push(urlInfo);
                } else {
                    pending.push(urlInfo);
                }
            });
            
            return { processed, pending, failed };
        } catch (e) {
            console.error('Error getting URL progress:', e);
            return { processed: [], pending: [], failed: [] };
        }
    };
    
    // ⬇️ PERBAIKI FUNCTION getFailedUrls()
    window.getFailedUrls = function() {
        try {
            const retryCount = GM_getValue('retryCount', {});
            const completedUrls = window.getCompletedUrls();
            const maxRetries = window.commentConfig?.maxRetries || 3;
            
            return Object.keys(retryCount).filter(url => {
                const retries = retryCount[url] || 0;
                const isCompleted = completedUrls.some(completedUrl => {
                    const cleanCompleted = completedUrl.split('#')[0].split('?')[0];
                    const cleanRetry = url.split('#')[0].split('?')[0];
                    return cleanCompleted === cleanRetry;
                });
                
                return retries >= maxRetries && !isCompleted;
            });
        } catch (e) {
            console.error('Error getting failed URLs:', e);
            return [];
        }
    };
    
    window.retryFailedUrls = function() {
        try {
            const failedUrls = window.getFailedUrls();
            
            if (failedUrls.length === 0) {
                if (typeof window.showToast === 'function') {
                    window.showToast('No failed URLs to retry', 'info');
                }
                return false;
            }
            
            // Reset retry counters for failed URLs
            const retryCount = GM_getValue('retryCount', {});
            failedUrls.forEach(url => {
                retryCount[url] = 0;
            });
            GM_setValue('retryCount', retryCount);
            
            console.log(`🔄 Reset retry counters for ${failedUrls.length} failed URLs`);
            
            if (typeof window.showToast === 'function') {
                window.showToast(`Reset ${failedUrls.length} failed URLs for retry`, 'success');
            }
            
            return true;
        } catch (e) {
            console.error('Error retrying failed URLs:', e);
            return false;
        }
    };
    
    // ⬇️ TAMBAHKAN FUNCTION UNTUK DEBUGGING URL NAVIGATION
    window.debugUrlNavigation = function() {
        try {
            const currentIndex = window.getCurrentUrlIndex();
            const completedUrls = window.getCompletedUrls();
            const retryCount = GM_getValue('retryCount', {});
            const targetUrls = window.targetUrls || [];
            
            console.log('🔍 URL Navigation Debug Info:');
            console.log('Current Index:', currentIndex);
            console.log('Total Target URLs:', targetUrls.length);
            console.log('Completed URLs:', completedUrls.length);
            console.log('Current URL:', window.location.href);
            
            if (targetUrls.length > 0) {
                console.log('Current Target URL:', targetUrls[currentIndex]);
                console.log('Next Target URL:', targetUrls[currentIndex + 1] || 'None (end of list)');
            }
            
            // Check if current URL is completed
            const currentUrl = targetUrls[currentIndex];
            if (currentUrl) {
                const isCompleted = window.isUrlCompleted(currentUrl);
                const retries = window.getRetryCount(currentUrl);
                console.log('Current URL completed:', isCompleted);
                console.log('Current URL retries:', retries);
            }
            
            // Show next few URLs
            console.log('Next 5 URLs:');
            for (let i = currentIndex + 1; i < Math.min(currentIndex + 6, targetUrls.length); i++) {
                const url = targetUrls[i];
                const isCompleted = window.isUrlCompleted(url);
                const retries = window.getRetryCount(url);
                console.log(`  ${i}: ${url} (completed: ${isCompleted}, retries: ${retries})`);
            }
            
            return {
                currentIndex,
                totalUrls: targetUrls.length,
                completedCount: completedUrls.length,
                currentUrl: currentUrl,
                nextUrl: targetUrls[currentIndex + 1] || null,
                canNavigate: currentIndex + 1 < targetUrls.length
            };
        } catch (e) {
            console.error('Error in debug URL navigation:', e);
            return null;
        }
    };
    
    // ⬇️ TAMBAHKAN FUNCTION UNTUK FORCE NAVIGATION
    window.forceNavigateToNext = function() {
        try {
            console.log('🚀 Force navigating to next URL...');
            
            const debugInfo = window.debugUrlNavigation();
            if (!debugInfo) {
                console.error('❌ Cannot get debug info for navigation');
                return false;
            }
            
            if (!debugInfo.canNavigate) {
                console.log('🎉 No more URLs to navigate to - all completed!');
                if (typeof window.showCompletionMessage === 'function') {
                    window.showCompletionMessage();
                }
                return false;
            }
            
            // Force set next index
            const nextIndex = debugInfo.currentIndex + 1;
            window.setCurrentUrlIndex(nextIndex);
            
            // Clear any blocking states
            window.submitAttempted = false;
            window.isWaitingForUrlChange = false;
            
            // Clear timers
            if (window.urlChangeTimer) {
                clearTimeout(window.urlChangeTimer);
                window.urlChangeTimer = null;
            }
            
            const nextUrl = debugInfo.nextUrl;
            console.log(`🔄 Force navigating to URL ${nextIndex + 1}/${debugInfo.totalUrls}: ${nextUrl}`);
            
            // Navigate with delay
            setTimeout(() => {
                window.location.href = nextUrl;
            }, 1000);
            
            return true;
        } catch (e) {
            console.error('Error in force navigation:', e);
            return false;
        }
    };
    
    // ⬇️ TAMBAHKAN FUNCTION UNTUK SKIP CURRENT URL
    window.skipCurrentUrl = function(reason = 'Manually skipped') {
        try {
            const currentIndex = window.getCurrentUrlIndex();
            const targetUrls = window.targetUrls || [];
            
            if (currentIndex >= targetUrls.length) {
                console.log('🎉 No current URL to skip - all completed!');
                return false;
            }
            
            const currentUrl = targetUrls[currentIndex];
            console.log(`⏭️ Skipping current URL: ${currentUrl}`);
            
            // Mark as completed with skip reason
            window.markUrlAsCompleted(currentUrl, currentUrl, reason);
            
            // Navigate to next
            setTimeout(() => {
                window.forceNavigateToNext();
            }, 1000);
            
            return true;
        } catch (e) {
            console.error('Error skipping current URL:', e);
            return false;
        }
    };
    
    // ⬇️ TAMBAHKAN FUNCTION UNTUK CHECK NAVIGATION STATE
    window.checkNavigationState = function() {
        try {
            const state = {
                submitAttempted: window.submitAttempted || false,
                isWaitingForUrlChange: window.isWaitingForUrlChange || false,
                hasUrlChangeTimer: !!window.urlChangeTimer,
                currentIndex: window.getCurrentUrlIndex(),
                totalUrls: window.targetUrls ? window.targetUrls.length : 0,
                currentUrl: window.location.href,
                botState: window.getBotState()
            };
            
            console.log('🔍 Navigation State:', state);
            
            // Check if bot is stuck
            const isStuck = state.isWaitingForUrlChange && state.hasUrlChangeTimer;
            if (isStuck) {
                console.warn('⚠️ Bot might be stuck in URL change waiting state');
                console.log('💡 You can use window.forceNavigateToNext() to force navigation');
            }
            
            return state;
        } catch (e) {
            console.error('Error checking navigation state:', e);
            return null;
        }
    };
    
    // ⬇️ TAMBAHKAN AUTO-RECOVERY MECHANISM
    window.autoRecoveryCheck = function() {
        try {
            const state = window.checkNavigationState();
            if (!state) return false;
            
            // Check if bot has been waiting too long
            const botState = state.botState;
            if (botState.lastActivity) {
                const lastActivity = new Date(botState.lastActivity);
                const now = new Date();
                const timeDiff = now - lastActivity;
                
                // If no activity for more than 5 minutes, try recovery
                if (timeDiff > 5 * 60 * 1000) {
                    console.warn('⚠️ Bot inactive for more than 5 minutes, attempting recovery...');
                    
                    // Clear stuck states
                    window.submitAttempted = false;
                    window.isWaitingForUrlChange = false;
                    
                    if (window.urlChangeTimer) {
                        clearTimeout(window.urlChangeTimer);
                        window.urlChangeTimer = null;
                    }
                    
                    // Try to navigate to next URL
                    setTimeout(() => {
                        if (typeof window.navigateToNextUrl === 'function') {
                            window.navigateToNextUrl();
                        } else {
                            window.forceNavigateToNext();
                        }
                    }, 2000);
                    
                    console.log('🔄 Auto-recovery attempted');
                    return true;
                }
            }
            
            return false;
        } catch (e) {
            console.error('Error in auto-recovery check:', e);
            return false;
        }
    };
    
    // Initialize storage health check on load
    setTimeout(() => {
        const health = window.checkStorageHealth();
        if (health.status !== 'healthy') {
            console.warn('⚠️ Storage health issues detected:', health.issues);
        }
        
        // Also check navigation state
        window.checkNavigationState();
    }, 1000);
    
    // Auto cleanup every hour
    setInterval(() => {
        window.cleanupStorage();
    }, 60 * 60 * 1000);
    
    // Auto recovery check every 2 minutes
    setInterval(() => {
        window.autoRecoveryCheck();
    }, 2 * 60 * 1000);
    
    console.log('✅ Enhanced Storage Management helper loaded');
    
    // ⬇️ EXPOSE DEBUG FUNCTIONS TO CONSOLE
    console.log('🔧 Debug functions available:');
    console.log('  - window.debugUrlNavigation() - Show navigation debug info');
    console.log('  - window.forceNavigateToNext() - Force navigate to next URL');
    console.log('  - window.skipCurrentUrl() - Skip current URL');
    console.log('  - window.checkNavigationState() - Check current navigation state');
    console.log('  - window.autoRecoveryCheck() - Run auto-recovery check');
    console.log('  - window.resetAllProgress() - Reset all progress');
    console.log('  - window.checkStorageHealth() - Check storage health');
    
})();



