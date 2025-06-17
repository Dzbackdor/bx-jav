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
            
            // Log message for debugging
            if (typeof window.logMessage === 'function') {
                window.logMessage('storage', 'Updated completed URLs', { count: urlArray.length });
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

    // Enhanced URL completion functions
    window.markUrlAsCompleted = function(url, reason = 'Comment submitted') {
        try {
            const cleanUrl = window.cleanUrl ? window.cleanUrl(url) : url.split('#')[0].split('?')[0];
            const completedUrls = window.getCompletedUrls();

            if (!completedUrls.includes(cleanUrl)) {
                completedUrls.push(cleanUrl);
                window.setCompletedUrls(completedUrls);
                
                // Store completion details
                window.setUrlCompletionDetails(cleanUrl, {
                    reason: reason,
                    timestamp: new Date().toISOString(),
                    originalUrl: url,
                    userAgent: navigator.userAgent.substring(0, 100)
                });
                
                console.log(`✅ Marked as completed: ${cleanUrl} (${reason})`);
                
                // Show toast notification
                if (typeof window.showToast === 'function') {
                    window.showToast(`URL completed: ${reason}`, 'success');
                }
                
                // Log completion
                if (typeof window.logMessage === 'function') {
                    window.logMessage('completion', `URL marked as completed: ${reason}`, { url: cleanUrl });
                }
                
                return true;
            }
            
            return false;
        } catch (e) {
            console.error('Error marking URL as completed:', e);
            return false;
        }
    };

    window.isUrlCompleted = function(url) {
        try {
            const cleanUrl = window.cleanUrl ? window.cleanUrl(url) : url.split('#')[0].split('?')[0];
            const completedUrls = window.getCompletedUrls();
            return completedUrls.includes(cleanUrl);
        } catch (e) {
            console.error('Error checking URL completion:', e);
            return false;
        }
    };
    
    // New: URL completion details
    window.setUrlCompletionDetails = function(url, details) {
        try {
            const completionDetails = GM_getValue('completionDetails', {});
            const cleanUrl = window.cleanUrl ? window.cleanUrl(url) : url.split('#')[0].split('?')[0];
            
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
            const cleanUrl = window.cleanUrl ? window.cleanUrl(url) : url.split('#')[0].split('?')[0];
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
    
    // New: Session management
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
    
    // New: Statistics and analytics
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
    
    // New: Data export/import
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
    
    // New: Clean URL utility
    window.cleanUrl = function(url) {
        if (!url) return '';
        return url.split('#')[0].split('?')[0].trim();
    };
    
    // New: Storage cleanup
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
    
    // New: Reset functions
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
    
    // New: Backup and restore
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
    
    // New: Storage health check
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
                !completedUrls.includes(url) && retryCount[url] === 0
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
    
    // New: Advanced URL management
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
                const isCompleted = completedUrls.includes(cleanUrl);
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
                } else if (retries >= 3) {
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
    
    window.getFailedUrls = function() {
        try {
            const retryCount = GM_getValue('retryCount', {});
            const completedUrls = window.getCompletedUrls();
            
            return Object.keys(retryCount).filter(url => 
                retryCount[url] >= 3 && !completedUrls.includes(url)
            );
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
    
    // Initialize storage health check on load
    setTimeout(() => {
        const health = window.checkStorageHealth();
        if (health.status !== 'healthy') {
            console.warn('⚠️ Storage health issues detected:', health.issues);
        }
    }, 1000);
    
    // Auto cleanup every hour
    setInterval(() => {
        window.cleanupStorage();
    }, 60 * 60 * 1000);
    
    console.log('✅ Enhanced Storage Management helper loaded');
    
})();
