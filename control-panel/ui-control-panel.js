// UI Control Panel Helper
(function() {
    'use strict';
    
    // Bot state management with backward compatibility
    window.botState = window.botState || {
        isRunning: false,
        isPaused: false,
        isActive: false
    };
    
    // Initialize bot state from storage (backward compatible)
    window.initBotState = function() {
        // Jika belum ada setting bot state, anggap bot selalu aktif (mode lama)
        const hasExistingBotState = GM_getValue('botIsRunning') !== undefined;
        
        if (!hasExistingBotState) {
            // Mode backward compatibility - bot selalu aktif seperti sebelumnya
            window.botState.isRunning = true;
            window.botState.isPaused = false;
            window.botState.isActive = true;
            console.log('🔄 Backward compatibility mode - bot auto-active');
        } else {
            // Mode baru dengan kontrol
            window.botState.isRunning = GM_getValue('botIsRunning', false);
            window.botState.isPaused = GM_getValue('botIsPaused', false);
            window.botState.isActive = window.botState.isRunning && !window.botState.isPaused;
        }
    };
    
    // Save bot state to storage
    window.saveBotState = function() {
        GM_setValue('botIsRunning', window.botState.isRunning);
        GM_setValue('botIsPaused', window.botState.isPaused);
    };
    
    // Wrapper functions untuk backward compatibility
    window.shouldBotProceed = function() {
        // Jika botState belum diinisialisasi, return true (mode lama)
        if (!window.botState) {
            return true;
        }
        return window.botState.isActive;
    };
    
    // Override fungsi navigasi dengan pengecekan state (non-breaking)
    if (typeof window.navigateToNextUrl !== 'undefined') {
        const originalNavigateToNextUrl = window.navigateToNextUrl;
        window.navigateToNextUrl = function() {
            if (window.shouldBotProceed()) {
                return originalNavigateToNextUrl.apply(this, arguments);
            } else {
                console.log('🛑 Bot not active, navigation cancelled');
            }
        };
    }
    
    // Override fungsi comment processing dengan pengecekan state (non-breaking)
    if (typeof window.proceedWithComment !== 'undefined') {
        const originalProceedWithComment = window.proceedWithComment;
        window.proceedWithComment = function() {
            if (window.shouldBotProceed()) {
                return originalProceedWithComment.apply(this, arguments);
            } else {
                console.log('🛑 Bot not active, comment processing cancelled');
            }
        };
    }
    
    // Start bot
    window.startBot = function() {
        window.botState.isRunning = true;
        window.botState.isPaused = false;
        window.botState.isActive = true;
        window.saveBotState();
        console.log('🚀 Bot started');
        window.updateControlPanel();
        
        // Start processing if on target URL
        if (window.isTargetUrl && window.isTargetUrl() && window.hasAlreadyCommented && !window.hasAlreadyCommented()) {
            setTimeout(() => {
                if (typeof window.proceedWithComment === 'function') {
                    window.proceedWithComment();
                }
            }, 1000);
        } else {
            // Navigate to first unprocessed URL
            if (typeof window.navigateToNextUrl === 'function') {
                window.navigateToNextUrl();
            }
        }
    };
    
    // Stop bot
    window.stopBot = function() {
        window.botState.isRunning = false;
        window.botState.isPaused = false;
        window.botState.isActive = false;
        window.saveBotState();
        
        // Clear any active timers
        if (window.urlChangeTimer) {
            clearTimeout(window.urlChangeTimer);
            window.urlChangeTimer = null;
        }
        
        if (window.submitAttempted) {
            window.submitAttempted = false;
        }
        if (window.isWaitingForUrlChange) {
            window.isWaitingForUrlChange = false;
        }
        
        console.log('⏹️ Bot stopped');
        window.updateControlPanel();
        window.showBotNotification('⏹️ Bot stopped', 'warning');
    };
    
    // Pause bot
    window.pauseBot = function() {
        window.botState.isPaused = true;
        window.botState.isActive = false;
        window.saveBotState();
        
        // Clear any active timers
        if (window.urlChangeTimer) {
            clearTimeout(window.urlChangeTimer);
            window.urlChangeTimer = null;
        }
        
        console.log('⏸️ Bot paused');
        window.updateControlPanel();
        window.showBotNotification('⏸️ Bot paused', 'warning');
    };
    
    // Resume bot
    window.resumeBot = function() {
        if (!window.botState.isRunning) {
            alert('Bot is not running. Please start the bot first.');
            return;
        }
        
        window.botState.isPaused = false;
        window.botState.isActive = true;
        window.saveBotState();
        console.log('▶️ Bot resumed');
        window.updateControlPanel();
        window.showBotNotification('▶️ Bot resumed', 'success');
        
        // Continue processing
        if (window.isTargetUrl && window.isTargetUrl() && window.hasAlreadyCommented && !window.hasAlreadyCommented()) {
            setTimeout(() => {
                if (typeof window.proceedWithComment === 'function') {
                    window.proceedWithComment();
                }
            }, 1000);
        } else {
            if (typeof window.navigateToNextUrl === 'function') {
                window.navigateToNextUrl();
            }
        }
    };
    
    // Get processed and unprocessed URLs
    window.getUrlStatus = function() {
        if (!window.targetUrls || !window.getCompletedUrls) {
            return { processed: [], unprocessed: [] };
        }
        
        const completedUrls = window.getCompletedUrls();
        const processed = [];
        const unprocessed = [];
        
        window.targetUrls.forEach((url, index) => {
            const cleanUrl = url.split('#')[0].split('?')[0];
            const isCompleted = completedUrls.includes(cleanUrl);
            
            if (isCompleted) {
                processed.push({
                    index: index + 1,
                    url: url,
                    status: 'completed'
                });
            } else {
                unprocessed.push({
                    index: index + 1,
                    url: url,
                    status: 'pending'
                });
            }
        });
        
        return { processed, unprocessed };
    };

    // Create control panel
    window.createControlPanel = function() {
        // Initialize bot state
        window.initBotState();
        
        // Safe fallbacks untuk fungsi yang mungkin belum ada
        const currentIndex = (typeof window.getCurrentUrlIndex === 'function') ? window.getCurrentUrlIndex() : 0;
        const completedUrls = (typeof window.getCompletedUrls === 'function') ? window.getCompletedUrls() : [];
        const currentUrl = window.location.href;
        const isTarget = (typeof window.isTargetUrl === 'function') ? window.isTargetUrl() : false;
        const isCompleted = (typeof window.hasAlreadyCommented === 'function') ? window.hasAlreadyCommented() : false;
        const urlStatus = window.getUrlStatus();
        const totalUrls = (window.targetUrls && window.targetUrls.length) ? window.targetUrls.length : 0;
        
        const panel = document.createElement('div');
        panel.id = 'backlinkBotPanel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 10000;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            min-width: 320px;
            max-width: 400px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;

        // Bot status
        let botStatusColor = '#666';
        let botStatusText = 'Stopped';
        let botStatusIcon = '⏹️';
        
        if (window.botState.isActive) {
            botStatusColor = '#4CAF50';
            botStatusText = 'Running';
            botStatusIcon = '🟢';
        } else if (window.botState.isPaused) {
            botStatusColor = '#FF9800';
            botStatusText = 'Paused';
            botStatusIcon = '⏸️';
        }

        // Current URL status
        let urlStatusColor = '#666';
        let urlStatusText = 'Not Target URL';
        let urlStatusIcon = '⚪';
        
        if (currentUrl.includes('wp-comments-post.php')) {
            urlStatusColor = '#f44336';
            urlStatusText = 'ERROR: wp-comments-post.php';
            urlStatusIcon = '❌';
        } else if (isTarget && isCompleted) {
            urlStatusColor = '#4CAF50';
            urlStatusText = 'Completed';
            urlStatusIcon = '✅';
        } else if (isTarget && window.submitAttempted) {
            urlStatusColor = '#FF9800';
            urlStatusText = 'Processing...';
            urlStatusIcon = '⏳';
        } else if (isTarget) {
            urlStatusColor = '#2196F3';
            urlStatusText = 'Ready to Comment';
            urlStatusIcon = '🎯';
        }

        // Control buttons based on bot state
        let controlButtons = '';
        if (!window.botState.isRunning) {
            controlButtons = `
                <button id="startBtn" style="background: #4CAF50; color: white; border: none; padding: 8px 12px; border-radius: 3px; cursor: pointer; font-size: 11px; font-weight: bold;">
                    ▶️ Start Bot
                </button>
            `;
        } else if (window.botState.isPaused) {
            controlButtons = `
                <button id="resumeBtn" style="background: #4CAF50; color: white; border: none; padding: 8px 12px; border-radius: 3px; cursor: pointer; font-size: 11px; font-weight: bold;">
                    ▶️ Resume
                </button>
                <button id="stopBtn" style="background: #f44336; color: white; border: none; padding: 8px 12px; border-radius: 3px; cursor: pointer; font-size: 11px; font-weight: bold;">
                    ⏹️ Stop
                </button>
            `;
        } else {
            controlButtons = `
                <button id="pauseBtn" style="background: #FF9800; color: white; border: none; padding: 8px 12px; border-radius: 3px; cursor: pointer; font-size: 11px; font-weight: bold;">
                    ⏸️ Pause
                </button>
                <button id="stopBtn" style="background: #f44336; color: white; border: none; padding: 8px 12px; border-radius: 3px; cursor: pointer; font-size: 11px; font-weight: bold;">
                    ⏹️ Stop
                </button>
            `;
        }

        // URL Status Summary (dengan fallback)
        const urlSummary = totalUrls > 0 ? `
            <div style="margin-bottom: 8px; font-size: 11px; color: #ccc; border-top: 1px solid #444; padding-top: 8px;">
                📊 URL Status Summary:
            </div>
            <div style="font-size: 10px; color: #4CAF50; margin-bottom: 2px;">
                ✅ Processed: ${urlStatus.processed.length} URLs
            </div>
            <div style="font-size: 10px; color: #FF9800; margin-bottom: 8px;">
                ⏳ Remaining: ${urlStatus.unprocessed.length} URLs
            </div>
        ` : '';

        // Checkbox configuration status (dengan fallback)
        const checkboxStatus = (window.commentConfig) ? `
            <div style="margin-bottom: 8px; font-size: 11px; color: #ccc; border-top: 1px solid #444; padding-top: 8px;">
                📋 Checkbox Settings:
            </div>
            <div style="font-size: 10px; color: #ccc; margin-bottom: 4px;">
                ${window.commentConfig.handleCheckboxes ? '✅' : '❌'} Handle Checkboxes
            </div>
            <div style="font-size: 10px; color: #ccc; margin-bottom: 4px;">
                ${window.commentConfig.autoCheckConsent ? '✅' : '❌'} Auto Consent
            </div>
            <div style="font-size: 10px; color: #ccc; margin-bottom: 4px;">
                ${window.commentConfig.autoCheckPrivacy ? '✅' : '❌'} Auto Privacy
            </div>
            <div style="font-size: 10px; color: #ccc; margin-bottom: 4px;">
                ${window.commentConfig.autoCheckTerms ? '✅' : '❌'} Auto Terms
            </div>
            <div style="font-size: 10px; color: #ccc; margin-bottom: 8px;">
                ${window.commentConfig.autoCheckNewsletter ? '✅' : '❌'} Auto Newsletter
            </div>
        ` : '';

        panel.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 5px;">
                🤖 Auto Backlink Bot v4.0
            </div>
            
            <div style="margin-bottom: 8px;">
                <strong>Bot Status:</strong>
                <span style="color: ${botStatusColor}; font-weight: bold;">${botStatusIcon} ${botStatusText}</span>
            </div>
            
            <div style="margin-bottom: 8px;">
                <strong>URL Status:</strong>
                <span style="color: ${urlStatusColor};">${urlStatusIcon} ${urlStatusText}</span>
            </div>
            
            <div style="margin-bottom: 8px;">
                <strong>Progress:</strong> ${completedUrls.length}/${totalUrls} URLs
            </div>
                       <div style="margin-bottom: 8px;">
                <strong>Current:</strong> ${currentIndex + 1}/${totalUrls}
            </div>
            
            ${currentUrl.includes('wp-comments-post.php') ? `
                <div style="margin-bottom: 8px; color: #f44336; font-weight: bold;">
                    ⚠️ ERROR DETECTED
                </div>
                <div style="margin-bottom: 8px; font-size: 11px; color: #ffcdd2;">
                    wp-comments-post.php indicates form validation error
                </div>
            ` : ''}
            
            ${urlSummary}
            ${checkboxStatus}
            
            <div style="margin-bottom: 10px; display: flex; gap: 5px; flex-wrap: wrap;">
                ${controlButtons}
            </div>
            
            <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                <button id="resetBtn" style="background: #f44336; color: white; border: none; padding: 5px 8px; border-radius: 3px; cursor: pointer; font-size: 10px;">
                    Reset
                </button>
                <button id="retryBtn" style="background: #FF9800; color: white; border: none; padding: 5px 8px; border-radius: 3px; cursor: pointer; font-size: 10px;">
                    Retry
                </button>
                <button id="skipBtn" style="background: #9E9E9E; color: white; border: none; padding: 5px 8px; border-radius: 3px; cursor: pointer; font-size: 10px;">
                    Skip
                </button>
                <button id="urlListBtn" style="background: #3F51B5; color: white; border: none; padding: 5px 8px; border-radius: 3px; cursor: pointer; font-size: 10px;">
                    URL List
                </button>
                <button id="debugBtn" style="background: #673AB7; color: white; border: none; padding: 5px 8px; border-radius: 3px; cursor: pointer; font-size: 10px;">
                    Debug
                </button>
                <button id="checkboxBtn" style="background: #009688; color: white; border: none; padding: 5px 8px; border-radius: 3px; cursor: pointer; font-size: 10px;">
                    Test CB
                </button>
            </div>
        `;

        document.body.appendChild(panel);

        // Event listeners for control buttons
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resumeBtn = document.getElementById('resumeBtn');

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (confirm('Start the auto comment bot?')) {
                    window.startBot();
                }
            });
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                if (confirm('Stop the bot? Current progress will be saved.')) {
                    window.stopBot();
                }
            });
        }

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                window.pauseBot();
            });
        }

        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                window.resumeBot();
            });
        }

        // Event listeners for existing buttons dengan safe checks
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Reset all progress? This will stop the bot and clear all data.')) {
                    window.stopBot();
                    if (typeof window.resetAllProgress === 'function') {
                        window.resetAllProgress();
                    }
                }
            });
        }

        const retryBtn = document.getElementById('retryBtn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                if (window.submitAttempted) {
                    window.submitAttempted = false;
                }
                if (window.isWaitingForUrlChange) {
                    window.isWaitingForUrlChange = false;
                }
                if (window.retryCount) {
                    window.retryCount = 0;
                }
                if (window.urlChangeTimer) {
                    clearTimeout(window.urlChangeTimer);
                    window.urlChangeTimer = null;
                }
                if (typeof window.removeWaitingMessage === 'function') {
                    window.removeWaitingMessage();
                }
                           
                console.log('🔄 Manual retry initiated');
                if (currentUrl.includes('wp-comments-post.php')) {
                    const currentIndex = (typeof window.getCurrentUrlIndex === 'function') ? window.getCurrentUrlIndex() : 0;
                    if (window.targetUrls && currentIndex < window.targetUrls.length) {
                        const originalTargetUrl = window.targetUrls[currentIndex];
                        console.log('🔙 Returning to original URL from wp-comments-post.php');
                        window.location.href = originalTargetUrl;
                        return;
                    }
                }
                window.updateControlPanel();
                setTimeout(() => {
                    if (window.botState.isActive && typeof window.proceedWithComment === 'function') {
                        window.proceedWithComment();
                    }
                }, 1000);
            });
        }

        const skipBtn = document.getElementById('skipBtn');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                if (confirm('Skip current URL?')) {
                    const currentUrl = window.location.href.split('#')[0];
                    if (typeof window.markUrlAsCompleted === 'function') {
                        window.markUrlAsCompleted(currentUrl, 'Manually skipped');
                    }
                    if (window.botState.isActive && typeof window.navigateToNextUrl === 'function') {
                        window.navigateToNextUrl();
                    } else {
                        window.updateControlPanel();
                    }
                }
            });
        }

        const urlListBtn = document.getElementById('urlListBtn');
        if (urlListBtn) {
            urlListBtn.addEventListener('click', () => {
                window.showUrlListModal();
            });
        }

        const debugBtn = document.getElementById('debugBtn');
        if (debugBtn) {
            debugBtn.addEventListener('click', () => {
                window.showDebugModal();
            });
        }

        const checkboxBtn = document.getElementById('checkboxBtn');
        if (checkboxBtn) {
            checkboxBtn.addEventListener('click', () => {
                window.testCheckboxHandling();
            });
        }
    };

    // Show URL List Modal (dengan safe checks)
    window.showUrlListModal = function() {
        if (!window.targetUrls || window.targetUrls.length === 0) {
            alert('No target URLs found. Please check your configuration.');
            return;
        }

        const urlStatus = window.getUrlStatus();
        const currentIndex = (typeof window.getCurrentUrlIndex === 'function') ? window.getCurrentUrlIndex() : 0;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10001;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 10px;
            max-width: 90%;
            max-height: 80%;
            overflow-y: auto;
            font-family: Arial, sans-serif;
            font-size: 12px;
        `;

        // Create processed URLs list
        let processedList = '';
        if (urlStatus.processed.length > 0) {
            processedList = urlStatus.processed.map(item => 
                `<div style="margin-bottom: 5px; padding: 5px; background: #e8f5e8; border-left: 3px solid #4CAF50;">
                    <strong>${item.index}.</strong> ✅ <a href="${item.url}" target="_blank" style="color: #2196F3; text-decoration: none;">${item.url}</a>
                </div>`
            ).join('');
        } else {
            processedList = '<div style="color: #666; font-style: italic;">No URLs processed yet</div>';
        }

        // Create unprocessed URLs list
        let unprocessedList = '';
        if (urlStatus.unprocessed.length > 0) {
            unprocessedList = urlStatus.unprocessed.map(item => {
                const isCurrent = (item.index - 1) === currentIndex;
                const bgColor = isCurrent ? '#fff3e0' : '#f5f5f5';
                const borderColor = isCurrent ? '#FF9800' : '#9E9E9E';
                const icon = isCurrent ? '👉' : '⏳';
                
                return `<div style="margin-bottom: 5px; padding: 5px; background: ${bgColor}; border-left: 3px solid ${borderColor};">
                    <strong>${item.index}.</strong> ${icon} <a href="${item.url}" target="_blank" style="color: #2196F3; text-decoration: none;">${item.url}</a>
                    ${isCurrent ? '<span style="color: #FF9800; font-weight: bold; margin-left: 10px;">(Current)</span>' : ''}
                </div>`;
            }).join('');
        } else {
            unprocessedList = '<div style="color: #4CAF50; font-style: italic;">All URLs have been processed! 🎉</div>';
        }

        content.innerHTML = `
            <h3 style="margin-top: 0; color: #333;">📊 URL Processing Status</h3>
            
            <div style="margin-bottom: 20px; padding: 10px; background: #f0f0f0; border-radius: 5px;">
                <strong>Summary:</strong><br>
                ✅ Processed: ${urlStatus.processed.length} URLs<br>
                ⏳ Remaining: ${urlStatus.unprocessed.length} URLs<br>
                📊 Total: ${window.targetUrls.length} URLs<br>
                📈 Progress: ${Math.round((urlStatus.processed.length / window.targetUrls.length) * 100)}%
            </div>

            <div style="margin-bottom: 20px;">
                <h4 style="color: #4CAF50; margin-bottom: 10px;">✅ Processed URLs (${urlStatus.processed.length})</h4>
                <div style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; border-radius: 5px;">
                    ${processedList}
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <h4 style="color: #FF9800; margin-bottom: 10px;">⏳ Remaining URLs (${urlStatus.unprocessed.length})</h4>
                <div style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; border-radius: 5px;">
                    ${unprocessedList}
                </div>
            </div>

            <div style="text-align: center; margin-top: 20px;">
                <button id="refreshUrlListBtn" style="background: #2196F3; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                    🔄 Refresh
                </button>
                <button id="exportUrlListBtn" style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                    📋 Export List
                </button>
                <button id="closeUrlListBtn" style="background: #f44336; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    Close
                </button>
            </div>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Event listeners
        document.getElementById('refreshUrlListBtn').addEventListener('click', () => {
            modal.remove();
            window.showUrlListModal();
        });

        document.getElementById('exportUrlListBtn').addEventListener('click', () => {
            const exportData = `AUTO BACKLINK BOT - URL STATUS REPORT
Generated: ${new Date().toLocaleString()}
========================================

SUMMARY:
- Total URLs: ${window.targetUrls.length}
- Processed: ${urlStatus.processed.length}
- Remaining: ${urlStatus.unprocessed.length}
- Progress: ${Math.round((urlStatus.processed.length / window.targetUrls.length) * 100)}%

PROCESSED URLS (${urlStatus.processed.length}):
${urlStatus.processed.map(item => `${item.index}. ✅ ${item.url}`).join('\n')}

REMAINING URLS (${urlStatus.unprocessed.length}):
${urlStatus.unprocessed.map(item => `${item.index}. ⏳ ${item.url}`).join('\n')}
`;

            navigator.clipboard.writeText(exportData).then(() => {
                alert('URL list exported to clipboard!');
            }).catch(() => {
                // Fallback: create downloadable file
                const blob = new Blob([exportData], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `backlink-bot-urls-${new Date().toISOString().split('T')[0]}.txt`;
                a.click();
                URL.revokeObjectURL(url);
            });
        });

        document.getElementById('closeUrlListBtn').addEventListener('click', () => {
            modal.remove();
        });

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    };

    // Update control panel
    window.updateControlPanel = function() {
        const existingPanel = document.getElementById('backlinkBotPanel');
        if (existingPanel) {
            existingPanel.remove();
        }
        window.createControlPanel();
    };

    // Reset all progress (dengan safe checks)
    window.resetAllProgress = function() {
        GM_deleteValue('currentUrlIndex');
        GM_deleteValue('completedUrls');
        GM_deleteValue('retryCount');
        GM_deleteValue('botIsRunning');
        GM_deleteValue('botIsPaused');
        
        if (window.submitAttempted) {
            window.submitAttempted = false;
        }
        if (window.isWaitingForUrlChange) {
            window.isWaitingForUrlChange = false;
        }
                if (window.retryCount) {
            window.retryCount = 0;
        }
        window.botState.isRunning = false;
        window.botState.isPaused = false;
        window.botState.isActive = false;
        
        if (window.urlChangeTimer) {
            clearTimeout(window.urlChangeTimer);
            window.urlChangeTimer = null;
        }
        console.log('🔄 All progress reset');
        window.updateControlPanel();
        if (window.targetUrls && window.targetUrls.length > 0) {
            setTimeout(() => {
                window.location.href = window.targetUrls[0];
            }, 1000);
        }
    };

    // Test checkbox handling (dengan safe checks)
    window.testCheckboxHandling = function() {
        console.log('🧪 Testing checkbox handling...');
        const forms = document.querySelectorAll('form');
        let totalCheckboxes = 0;
        let handledCheckboxes = 0;

        forms.forEach((form, index) => {
            console.log(`📝 Testing form ${index + 1}:`);
            if (typeof window.findCheckboxes === 'function') {
                const checkboxes = window.findCheckboxes(form);
                for (let category in checkboxes) {
                    if (checkboxes[category].length > 0) {
                        totalCheckboxes += checkboxes[category].length;
                        console.log(`  ${category}: ${checkboxes[category].length} checkboxes`);
                    }
                }
            }
            if (window.commentConfig && window.commentConfig.handleCheckboxes && typeof window.handleCheckboxes === 'function') {
                const handled = window.handleCheckboxes(form);
                if (handled) handledCheckboxes++;
            }
        });

        const testResult = `📋 Checkbox Test Results:

- Total forms: ${forms.length}
- Total checkboxes: ${totalCheckboxes}
- Forms with checkboxes handled: ${handledCheckboxes}
- Checkbox handling enabled: ${window.commentConfig ? window.commentConfig.handleCheckboxes : 'Config not found'}

Check console for detailed results.
        `;
        alert(testResult);
        console.log('📋 Checkbox test completed');
    };

    // Show debug modal (enhanced with bot state info)
    window.showDebugModal = function() {
        const completedUrls = (typeof window.getCompletedUrls === 'function') ? window.getCompletedUrls() : [];
        const currentIndex = (typeof window.getCurrentUrlIndex === 'function') ? window.getCurrentUrlIndex() : 0;
        const currentUrl = window.location.href;
        const urlStatus = window.getUrlStatus();

        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10001;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 10px;
            max-width: 80%;
            max-height: 80%;
            overflow-y: auto;
            font-family: monospace;
            font-size: 12px;
        `;

        let debugInfo = '';
        try {
            const successDetected = (typeof window.detectCommentSuccess === 'function') ? window.detectCommentSuccess() : { success: false, reason: 'Function not found' };
            const errorDetected = (typeof window.detectCommentError === 'function') ? window.detectCommentError() : { error: false, reason: 'Function not found' };
            const urlChanged = (typeof window.hasUrlChanged === 'function' && window.originalUrl) ? window.hasUrlChanged(window.originalUrl, currentUrl) : false;

            debugInfo = `🔍 AUTO BACKLINK BOT DEBUG v4.0
================================

🤖 Bot State:
- Is Running: ${window.botState.isRunning}
- Is Paused: ${window.botState.isPaused}
- Is Active: ${window.botState.isActive}

📊 Current Status:
- Current URL: ${currentUrl}
- Original URL: ${window.originalUrl || 'Not set'}
- Current Index: ${currentIndex}
- Total Target URLs: ${window.targetUrls ? window.targetUrls.length : 0}
- Completed Count: ${completedUrls.length}
- Is Target URL: ${(typeof window.isTargetUrl === 'function') ? window.isTargetUrl() : 'Function not found'}
- Already Commented: ${(typeof window.hasAlreadyCommented === 'function') ? window.hasAlreadyCommented() : 'Function not found'}

🔄 Submit Status:
- Submit Attempted: ${window.submitAttempted || false}
- Waiting for URL Change: ${window.isWaitingForUrlChange || false}
- URL Change Timer Active: ${window.urlChangeTimer !== null}

🎯 URL Analysis:
- Has Comment Hash: ${currentUrl.includes('#comment-')}
- Has wp-comments-post.php: ${currentUrl.includes('wp-comments-post.php')}
- URL Changed from Original: ${urlChanged}

✅ Success Detection:
- Success Detected: ${successDetected.success}
- Success Reason: ${successDetected.reason || 'none'}

❌ Error Detection:
- Error Detected: ${errorDetected.error}
- Error Reason: ${errorDetected.reason || 'none'}

📊 URL Processing Status:
- Processed URLs: ${urlStatus.processed.length}
- Remaining URLs: ${urlStatus.unprocessed.length}
- Progress: ${window.targetUrls ? Math.round((urlStatus.processed.length / window.targetUrls.length) * 100) : 0}%

📋 Checkbox Configuration:
- Handle Checkboxes: ${window.commentConfig ? window.commentConfig.handleCheckboxes : 'Config not found'}
- Auto Check Consent: ${window.commentConfig ? window.commentConfig.autoCheckConsent : 'Config not found'}
- Auto Check Privacy: ${window.commentConfig ? window.commentConfig.autoCheckPrivacy : 'Config not found'}
- Auto Check Terms: ${window.commentConfig ? window.commentConfig.autoCheckTerms : 'Config not found'}
- Auto Check Newsletter: ${window.commentConfig ? window.commentConfig.autoCheckNewsletter : 'Config not found'}

🎯 Target URLs:
${window.targetUrls ? window.targetUrls.map((url, index) => {
    const isCompleted = completedUrls.includes(url.split('#')[0].split('?')[0]);
    const isCurrent = index === currentIndex;
    const status = isCompleted ? '✅' : (isCurrent ? '👉' : '⏳');
    return `${status} ${index + 1}. ${url}`;
}).join('\n') : 'No target URLs found'}

✅ Completed URLs:
${completedUrls.length > 0 ? completedUrls.map((url, index) => `${index + 1}. ${url}`).join('\n') : 'None'}

🔧 Storage Values:
- botIsRunning: ${GM_getValue('botIsRunning', 'not set')}
- botIsPaused: ${GM_getValue('botIsPaused', 'not set')}
- currentUrlIndex: ${GM_getValue('currentUrlIndex', 'not set')}
- retryCount: ${GM_getValue('retryCount', 'not set')}

🔧 Available Functions:
- window.targetUrls: ${window.targetUrls ? 'Available' : 'Not found'}
- window.isTargetUrl: ${typeof window.isTargetUrl === 'function' ? 'Available' : 'Not found'}
- window.hasAlreadyCommented: ${typeof window.hasAlreadyCommented === 'function' ? 'Available' : 'Not found'}
- window.proceedWithComment: ${typeof window.proceedWithComment === 'function' ? 'Available' : 'Not found'}
- window.navigateToNextUrl: ${typeof window.navigateToNextUrl === 'function' ? 'Available' : 'Not found'}
- window.detectCommentSuccess: ${typeof window.detectCommentSuccess === 'function' ? 'Available' : 'Not found'}
- window.detectCommentError: ${typeof window.detectCommentError === 'function' ? 'Available' : 'Not found'}
            `;
        } catch (e) {
            debugInfo = `Error generating debug info: ${e.message}`;
        }

        content.innerHTML = `
            <h3>🔍 Debug Information</h3>
            <pre style="white-space: pre-wrap; word-wrap: break-word;">${debugInfo}</pre>
            <div style="margin-top: 20px; text-align: center;">
                <button id="copyDebugBtn" style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                    Copy Debug Info
                </button>
                <button id="clearStorageBtn" style="background: #FF9800; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                    Clear Storage
                </button>
                <button id="closeDebugBtn" style="background: #f44336; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    Close
                </button>
            </div>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Event listeners
        document.getElementById('copyDebugBtn').addEventListener('click', () => {
            navigator.clipboard.writeText(debugInfo).then(() => {
                alert('Debug info copied to clipboard!');
            }).catch(() => {
                alert('Failed to copy debug info');
            });
        });

        document.getElementById('clearStorageBtn').addEventListener('click', () => {
            if (confirm('Clear all storage data? This will reset the bot completely.')) {
                // Clear all GM storage
                GM_deleteValue('botIsRunning');
                GM_deleteValue('botIsPaused');
                GM_deleteValue('currentUrlIndex');
                GM_deleteValue('completedUrls');
                GM_deleteValue('retryCount');
                
                // Reset bot state
                window.botState.isRunning = false;
                window.botState.isPaused = false;
                window.botState.isActive = false;
                
                alert('Storage cleared! Please refresh the page.');
                modal.remove();
                window.updateControlPanel();
            }
        });

        document.getElementById('closeDebugBtn').addEventListener('click', () => {
            modal.remove();
        });

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    };

    // Add notification system for bot state changes
    window.showBotNotification = function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50px;
            right: 10px;
            z-index: 10002;
            padding: 10px 15px;
            border-radius: 5px;
            color: white;
            font-family: Arial, sans-serif;
            font-size: 12px;
            font-weight: bold;
            max-width: 300px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            transition: opacity 0.3s ease;
        `;

        // Set color based on type
        switch(type) {
            case 'success':
                notification.style.background = '#4CAF50';
                break;
            case 'error':
                notification.style.background = '#f44336';
                break;
            case 'warning':
                notification.style.background = '#FF9800';
                break;
            default:
                notification.style.background = '#2196F3';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    };

    // Auto-update control panel every 30 seconds
    setInterval(() => {
        if (document.getElementById('backlinkBotPanel')) {
            window.updateControlPanel();
        }
    }, 30000);

    // Initialize bot state on load
    window.addEventListener('load', () => {
        setTimeout(() => {
            window.initBotState();
            console.log('🤖 Bot state initialized:', window.botState);
        }, 1000);
    });

    // Handle page visibility change (pause when tab is hidden)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && window.botState.isActive) {
            console.log('👁️ Tab hidden, bot continues running in background');
        } else if (!document.hidden && window.botState.isActive) {
            console.log('👁️ Tab visible, bot is active');
            window.updateControlPanel();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Only work when Ctrl+Alt is pressed to avoid conflicts
        if (e.ctrlKey && e.altKey) {
            switch(e.key) {
                case 's': // Ctrl+Alt+S = Start/Stop
                    e.preventDefault();
                    if (!window.botState.isRunning) {
                        window.startBot();
                    } else {
                        window.stopBot();
                    }
                    break;
                case 'p': // Ctrl+Alt+P = Pause/Resume
                    e.preventDefault();
                    if (window.botState.isRunning) {
                        if (window.botState.isPaused) {
                            window.resumeBot();
                        } else {
                            window.pauseBot();
                        }
                    }
                    break;
                case 'u': // Ctrl+Alt+U = Show URL List
                    e.preventDefault();
                    window.showUrlListModal();
                    break;
                case 'd': // Ctrl+Alt+D = Show Debug
                    e.preventDefault();
                    window.showDebugModal();
                    break;
            }
        }
    });

    // Safe wrapper untuk backward compatibility
    window.safeExecute = function(functionName, ...args) {
        if (typeof window[functionName] === 'function') {
            try {
                return window[functionName].apply(this, args);
            } catch (e) {
                console.error(`Error executing ${functionName}:`, e);
                return null;
            }
        } else {
            console.warn(`Function ${functionName} not found`);
            return null;
        }
    };

    // Enhanced error handling untuk fungsi yang mungkin belum ada
    window.safeNavigateToNextUrl = function() {
        if (window.shouldBotProceed()) {
            return window.safeExecute('navigateToNextUrl');
        }

    };

    window.safeProceedWithComment = function() {
        if (window.shouldBotProceed()) {
            return window.safeExecute('proceedWithComment');
        }
    };

    // Override existing functions dengan safe wrappers (non-breaking)
    setTimeout(() => {
        // Override navigateToNextUrl jika ada
        if (typeof window.navigateToNextUrl === 'function' && !window.navigateToNextUrl._overridden) {
            const originalNavigateToNextUrl = window.navigateToNextUrl;
            window.navigateToNextUrl = function() {
                if (window.shouldBotProceed()) {
                    console.log('🚀 Navigation allowed - bot is active');
                    return originalNavigateToNextUrl.apply(this, arguments);
                } else {
                    console.log('🛑 Navigation blocked - bot not active');
                    return false;
                }
            };
            window.navigateToNextUrl._overridden = true;
        }

        // Override proceedWithComment jika ada
        if (typeof window.proceedWithComment === 'function' && !window.proceedWithComment._overridden) {
            const originalProceedWithComment = window.proceedWithComment;
            window.proceedWithComment = function() {
                if (window.shouldBotProceed()) {
                    console.log('💬 Comment processing allowed - bot is active');
                    return originalProceedWithComment.apply(this, arguments);
                } else {
                    console.log('🛑 Comment processing blocked - bot not active');
                    return false;
                }
            };
            window.proceedWithComment._overridden = true;
        }

        // Override startBot jika sudah ada sebelumnya
        if (typeof window.startBot === 'function' && !window.startBot._enhanced) {
            const originalStartBot = window.startBot;
            window.startBot = function() {
                originalStartBot.apply(this, arguments);
                window.showBotNotification('🚀 Bot started successfully!', 'success');
            };
            window.startBot._enhanced = true;
        }

        // Override stopBot jika sudah ada sebelumnya
        if (typeof window.stopBot === 'function' && !window.stopBot._enhanced) {
            const originalStopBot = window.stopBot;
            window.stopBot = function() {
                originalStopBot.apply(this, arguments);
                window.showBotNotification('⏹️ Bot stopped', 'warning');
            };
            window.stopBot._enhanced = true;
        }

    }, 2000); // Delay untuk memastikan fungsi lain sudah loaded

    // Monitor untuk auto-start bot jika diperlukan
    window.checkAutoStart = function() {
        // Jika bot pernah running sebelumnya dan tidak di-stop manual, auto-resume
        const wasRunning = GM_getValue('botIsRunning', false);
        const wasPaused = GM_getValue('botIsPaused', false);
        
        if (wasRunning && !wasPaused) {
            console.log('🔄 Auto-resuming bot from previous session');
            window.botState.isRunning = true;
            window.botState.isPaused = false;
            window.botState.isActive = true;
            window.updateControlPanel();
            
            // Auto-start processing jika di target URL
            if (window.isTargetUrl && window.isTargetUrl() && window.hasAlreadyCommented && !window.hasAlreadyCommented()) {
                setTimeout(() => {
                    if (typeof window.proceedWithComment === 'function') {
                        window.proceedWithComment();
                    }
                }, 2000);
            }
        }
    };

    // Enhanced URL change detection
    window.monitorUrlChanges = function() {
        let lastUrl = window.location.href;
        
        const checkUrlChange = () => {
            const currentUrl = window.location.href;
            if (currentUrl !== lastUrl) {
                console.log('🔄 URL changed detected:', lastUrl, '->', currentUrl);
                lastUrl = currentUrl;
                
                // Update control panel on URL change
                setTimeout(() => {
                    window.updateControlPanel();
                }, 1000);
                
                // Auto-process jika bot aktif dan di target URL
                if (window.botState.isActive && window.isTargetUrl && window.isTargetUrl()) {
                    if (window.hasAlreadyCommented && !window.hasAlreadyCommented()) {
                        setTimeout(() => {
                            if (typeof window.proceedWithComment === 'function') {
                                window.proceedWithComment();
                            }
                        }, 2000);
                    }
                }
            }
        };
        
        // Check URL changes every 2 seconds
        setInterval(checkUrlChange, 2000);
    };

    // Enhanced form submission monitoring
    window.monitorFormSubmissions = function() {
        // Monitor all form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.tagName === 'FORM') {
                console.log('📝 Form submission detected:', form);
                
                // Check if it's a comment form
                const isCommentForm = form.querySelector('textarea[name="comment"]') || 
                                    form.querySelector('input[name="comment"]') ||
                                    form.action.includes('wp-comments-post.php');
                
                if (isCommentForm && window.botState.isActive) {
                    console.log('💬 Comment form submission detected');
                    window.submitAttempted = true;
                    window.updateControlPanel();
                    
                    // Show processing notification
                    window.showBotNotification('📝 Submitting comment...', 'info');
                }
            }
        });
    };

    // Enhanced error detection and recovery
    window.monitorErrors = function() {
        // Monitor for WordPress comment errors
        const checkForErrors = () => {
            const currentUrl = window.location.href;
            
            // Check for wp-comments-post.php (usually indicates error)
            if (currentUrl.includes('wp-comments-post.php')) {
                console.log('❌ Error detected: wp-comments-post.php URL');
                window.showBotNotification('❌ Comment submission error detected', 'error');
                
                // Auto-retry if bot is active
                if (window.botState.isActive) {
                    setTimeout(() => {
                        const currentIndex = (typeof window.getCurrentUrlIndex === 'function') ? window.getCurrentUrlIndex() : 0;
                        if (window.targetUrls && currentIndex < window.targetUrls.length) {
                            const originalUrl = window.targetUrls[currentIndex];
                            console.log('🔄 Auto-retry: returning to original URL');
                            window.location.href = originalUrl;
                        }
                    }, 3000);
                }
            }
            
            // Check for common error messages
            const errorSelectors = [
                '.error',
                '.wp-error',
                '.comment-error',
                '[class*="error"]',
                '[id*="error"]'
            ];
            
            errorSelectors.forEach(selector => {
                const errorElements = document.querySelectorAll(selector);
                errorElements.forEach(element => {
                    if (element.textContent.toLowerCase().includes('error') || 
                        element.textContent.toLowerCase().includes('failed')) {
                        console.log('❌ Error message detected:', element.textContent);
                        window.showBotNotification('❌ Error: ' + element.textContent.substring(0, 50), 'error');
                    }
                });
            });
        };
        
        // Check for errors every 5 seconds
        setInterval(checkForErrors, 5000);
    };

    // Enhanced success detection
    window.monitorSuccess = function() {
        const checkForSuccess = () => {
            const currentUrl = window.location.href;
            
            // Check for comment hash (indicates successful comment)
            if (currentUrl.includes('#comment-') && window.botState.isActive) {
                console.log('✅ Success detected: comment hash in URL');
                window.showBotNotification('✅ Comment posted successfully!', 'success');
                
                // Mark as completed and move to next
                const cleanUrl = currentUrl.split('#')[0];
                if (typeof window.markUrlAsCompleted === 'function') {
                    window.markUrlAsCompleted(cleanUrl, 'Comment posted successfully');
                }
                
                setTimeout(() => {
                    if (typeof window.navigateToNextUrl === 'function') {
                        window.navigateToNextUrl();
                    }
                }, 2000);
            }
            
            // Check for success messages
            const successSelectors = [
                '.success',
                '.comment-success',
                '.wp-success',
                '[class*="success"]',
                '[class*="thank"]'
            ];
            
            successSelectors.forEach(selector => {
                const successElements = document.querySelectorAll(selector);
                successElements.forEach(element => {
                    if (element.textContent.toLowerCase().includes('success') || 
                        element.textContent.toLowerCase().includes('thank') ||
                        element.textContent.toLowerCase().includes('posted')) {
                        console.log('✅ Success message detected:', element.textContent);
                        window.showBotNotification('✅ ' + element.textContent.substring(0, 50), 'success');
                    }
                });
            });
        };
        
        // Check for success every 3 seconds
        setInterval(checkForSuccess, 3000);
    };

    // Initialize all monitoring systems
    window.initializeMonitoring = function() {
        console.log('🔍 Initializing monitoring systems...');
        
        setTimeout(() => {
            window.monitorUrlChanges();
            window.monitorFormSubmissions();
            window.monitorErrors();
            window.monitorSuccess();
            console.log('✅ All monitoring systems initialized');
        }, 3000);
    };

    // Main initialization
    window.addEventListener('load', () => {
        setTimeout(() => {
            console.log('🚀 Enhanced UI Control Panel initializing...');
            
            // Initialize bot state
            window.initBotState();
            
            // Check for auto-start
            window.checkAutoStart();
            
            // Initialize monitoring
            window.initializeMonitoring();
            
            // Create control panel
            window.createControlPanel();
            
            console.log('✅ Enhanced UI Control Panel loaded successfully');
            console.log('🎮 Keyboard shortcuts available:');
            console.log('  Ctrl+Alt+S = Start/Stop bot');
            console.log('  Ctrl+Alt+P = Pause/Resume bot');
            console.log('  Ctrl+Alt+U = Show URL list');
            console.log('  Ctrl+Alt+D = Show debug info');
            
            // Show welcome notification
            if (window.botState.isActive) {
                window.showBotNotification('🤖 Bot is active and ready!', 'success');
            } else {
                window.showBotNotification('🤖 Bot control panel loaded. Click Start to begin.', 'info');
            }
            
        }, 2000);
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        // Save current state
        window.saveBotState();
        console.log('💾 Bot state saved before page unload');
    });

    // Handle browser back/forward navigation
    window.addEventListener('popstate', () => {
        setTimeout(() => {
            window.updateControlPanel();
            console.log('🔄 Control panel updated after navigation');
        }, 1000);
    });

    // Periodic health check
    setInterval(() => {
        // Check if bot is stuck
        if (window.botState.isActive && window.submitAttempted) {
            const timeSinceSubmit = Date.now() - (window.submitTimestamp || 0);
            if (timeSinceSubmit > 60000) { // 1 minute
                console.log('⚠️ Bot appears stuck, attempting recovery');
                window.showBotNotification('⚠️ Bot recovery initiated', 'warning');
                
                // Reset submit state
                window.submitAttempted = false;
                window.isWaitingForUrlChange = false;
                if (window.urlChangeTimer) {
                    clearTimeout(window.urlChangeTimer);
                    window.urlChangeTimer = null;
                }
                
                // Try to continue
                if (typeof window.proceedWithComment === 'function') {
                    setTimeout(() => {
                        window.proceedWithComment();
                    }, 2000);
                }
            }
        }
    }, 30000); // Check every 30 seconds

    console.log('✅ Enhanced UI Control Panel helper loaded with full backward compatibility');

})();
