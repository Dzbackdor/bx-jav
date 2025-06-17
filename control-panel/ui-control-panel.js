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
        if (!window.botState) return true;
        return window.botState.isActive;
    };
    
    // Bot control functions
    window.startBot = function() {
        window.botState.isRunning = true;
        window.botState.isPaused = false;
        window.botState.isActive = true;
        window.saveBotState();
        console.log('🚀 Bot started');
        window.updateControlPanel();
        window.showBotNotification('🚀 Bot started successfully!', 'success');
        
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
        
        if (window.submitAttempted) window.submitAttempted = false;
        if (window.isWaitingForUrlChange) window.isWaitingForUrlChange = false;
        
        console.log('⏹️ Bot stopped');
        window.updateControlPanel();
        window.showBotNotification('⏹️ Bot stopped', 'warning');
    };
    
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
                processed.push({ index: index + 1, url: url, status: 'completed' });
            } else {
                unprocessed.push({ index: index + 1, url: url, status: 'pending' });
            }
        });
        
        return { processed, unprocessed };
    };
    
    // Enhanced control panel with better URL display
    window.createControlPanel = function() {
        const currentIndex = window.getCurrentUrlIndex();
        const completedUrlsDisplay = window.getCompletedUrlsDisplay();
        const completedCount = completedUrlsDisplay.length;
        const currentUrl = window.location.href;
        const isTarget = window.isTargetUrl();
        const isCompleted = window.hasAlreadyCommented();

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
            min-width: 280px;
            max-width: 350px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;

        let statusColor = '#666';
        let statusText = 'Not Target URL';

        if (currentUrl.includes('wp-comments-post.php')) {
            statusColor = '#f44336';
            statusText = 'ERROR: wp-comments-post.php';
        } else if (isTarget && isCompleted) {
            statusColor = '#4CAF50';
            statusText = 'Completed';
        } else if (isTarget && window.submitAttempted) {
            statusColor = '#FF9800';
            statusText = 'Processing...';
        } else if (isTarget) {
            statusColor = '#2196F3';
            statusText = 'Ready to Comment';
        }

        // Enhanced completed URLs display
        let completedUrlsHtml = '';
        if (completedCount > 0) {
            completedUrlsHtml = `
                <div style="margin-bottom: 8px; font-size: 11px; color: #ccc; border-top: 1px solid #444; padding-top: 8px;">
                    Processed URLs (${completedCount}):
                </div>
            `;
            
            completedUrlsDisplay.slice(-3).forEach(item => {
                const shortUrl = item.url.length > 50 ? item.url.substring(0, 47) + '...' : item.url;
                completedUrlsHtml += `
                    <div style="font-size: 10px; color: #ccc; margin-bottom: 2px;">
                        ${item.index}. ${shortUrl}
                    </div>
                `;
            });
            
            if (completedCount > 3) {
                completedUrlsHtml += `
                    <div style="font-size: 10px; color: #666; margin-bottom: 4px;">
                        ... and ${completedCount - 3} more
                    </div>
                `;
            }
        }

        // Checkbox configuration status
        const checkboxStatus = `
            <div style="margin-bottom: 8px; font-size: 11px; color: #ccc; border-top: 1px solid #444; padding-top: 8px;">
                Checkbox Settings:
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
        `;

        panel.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 5px;">
                Auto Backlink Bot v4.0
            </div>

            <div style="margin-bottom: 8px;">
                <strong>Status:</strong>
                <span style="color: ${statusColor};">${statusText}</span>
            </div>

            <div style="margin-bottom: 8px;">
                <strong>Progress:</strong> ${completedCount}/${window.targetUrls.length} URLs
            </div>

            <div style="margin-bottom: 8px;">
                <strong>Current:</strong> ${currentIndex + 1}/${window.targetUrls.length}
            </div>

            ${currentUrl.includes('wp-comments-post.php') ? `
                <div style="margin-bottom: 8px; color: #f44336; font-weight: bold;">
                    ERROR DETECTED
                </div>
                <div style="margin-bottom: 8px; font-size: 11px; color: #ffcdd2;">
                    wp-comments-post.php indicates form validation error
                </div>
            ` : ''}

            <div style="margin-bottom: 10px; font-size: 11px; color: #ccc;">
                ${isTarget ? 'Target URL' : 'Non-target URL'}
            </div>

            ${completedUrlsHtml}

            ${checkboxStatus}

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
                // Reset retry states
                if (window.submitAttempted) window.submitAttempted = false;
                if (window.isWaitingForUrlChange) window.isWaitingForUrlChange = false;
                if (window.retryCount) window.retryCount = 0;
                
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
    
    // Show URL List Modal
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
${urlStatus.unprocessed.map(item => `${item.index}. ⏳ ${item.url}`).join('\n')}`;
            
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
        window.createControlPanel();
    };
    
    // Reset all progress
    window.resetAllProgress = function() {
        GM_deleteValue('currentUrlIndex');
        GM_deleteValue('completedUrls');
        GM_deleteValue('retryCount');
        GM_deleteValue('botIsRunning');
        GM_deleteValue('botIsPaused');
        
        if (window.submitAttempted) window.submitAttempted = false;
        if (window.isWaitingForUrlChange) window.isWaitingForUrlChange = false;
        if (window.retryCount) window.retryCount = 0;
        
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
    
    // Test checkbox handling
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
                        
                        // Log each checkbox details
                        checkboxes[category].forEach((checkbox, cbIndex) => {
                            console.log(`    ${cbIndex + 1}. ID: ${checkbox.id || 'none'}, Name: ${checkbox.name || 'none'}, Checked: ${checkbox.checked}`);
                        });
                    }
                }
                
                if (window.commentConfig && window.commentConfig.handleCheckboxes) {
                    if (typeof window.handleCheckboxes === 'function') {
                        const handled = window.handleCheckboxes(form);
                        if (handled) handledCheckboxes++;
                    }
                }
            }
        });
        
        const testResult = `
📋 Checkbox Test Results:
========================
- Total forms found: ${forms.length}
- Total checkboxes found: ${totalCheckboxes}
- Forms with checkboxes handled: ${handledCheckboxes}
- Checkbox handling enabled: ${window.commentConfig ? window.commentConfig.handleCheckboxes : 'Config not found'}

Configuration Status:
- Auto Check Consent: ${window.commentConfig ? window.commentConfig.autoCheckConsent : 'N/A'}
- Auto Check Privacy: ${window.commentConfig ? window.commentConfig.autoCheckPrivacy : 'N/A'}
- Auto Check Terms: ${window.commentConfig ? window.commentConfig.autoCheckTerms : 'N/A'}
- Auto Check Newsletter: ${window.commentConfig ? window.commentConfig.autoCheckNewsletter : 'N/A'}

Check browser console for detailed checkbox information.
        `;
        
        alert(testResult);
        console.log('📋 Checkbox test completed');
        
        // Show detailed checkbox modal
        window.showCheckboxTestModal(forms, totalCheckboxes);
    };
    
    // Show checkbox test modal
    window.showCheckboxTestModal = function(forms, totalCheckboxes) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10002;
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
        
        let checkboxDetails = '';
        let formIndex = 0;
        
        forms.forEach((form) => {
            formIndex++;
            const formAction = form.action || 'No action';
            const formMethod = form.method || 'GET';
            
            checkboxDetails += `
                <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    <h4 style="color: #2196F3; margin: 0 0 10px 0;">📝 Form ${formIndex}</h4>
                    <div style="font-size: 11px; color: #666; margin-bottom: 10px;">
                        Action: ${formAction}<br>
                        Method: ${formMethod}
                    </div>
            `;
            
            if (typeof window.findCheckboxes === 'function') {
                const checkboxes = window.findCheckboxes(form);
                let hasCheckboxes = false;
                
                for (let category in checkboxes) {
                    if (checkboxes[category].length > 0) {
                        hasCheckboxes = true;
                        checkboxDetails += `
                            <div style="margin-bottom: 8px;">
                                <strong style="color: #4CAF50;">${category.toUpperCase()} (${checkboxes[category].length})</strong>
                        `;
                        
                        checkboxes[category].forEach((checkbox, cbIndex) => {
                            const isChecked = checkbox.checked;
                            const checkIcon = isChecked ? '✅' : '⬜';
                            const label = window.getCheckboxLabel ? window.getCheckboxLabel(checkbox) : 'No label';
                            
                            checkboxDetails += `
                                <div style="margin-left: 15px; margin-bottom: 5px; font-size: 11px;">
                                    ${checkIcon} ${cbIndex + 1}. 
                                    ID: <code>${checkbox.id || 'none'}</code> | 
                                    Name: <code>${checkbox.name || 'none'}</code><br>
                                    <span style="margin-left: 20px; color: #666;">Label: "${label}"</span>
                                </div>
                            `;
                        });
                        
                        checkboxDetails += `</div>`;
                    }
                }
                
                if (!hasCheckboxes) {
                    checkboxDetails += `<div style="color: #999; font-style: italic;">No checkboxes found in this form</div>`;
                }
            }
            
            checkboxDetails += `</div>`;
        });
        
        if (forms.length === 0) {
            checkboxDetails = '<div style="color: #999; font-style: italic; text-align: center; padding: 20px;">No forms found on this page</div>';
        }
        
        content.innerHTML = `
            <h3 style="margin-top: 0; color: #333;">🧪 Checkbox Test Results</h3>
            
            <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; border-left: 4px solid #2196F3;">
                <h4 style="margin: 0 0 10px 0; color: #2196F3;">📊 Summary</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px;">
                    <div><strong>Total Forms:</strong> ${forms.length}</div>
                    <div><strong>Total Checkboxes:</strong> ${totalCheckboxes}</div>
                    <div><strong>Handle Checkboxes:</strong> ${window.commentConfig ? (window.commentConfig.handleCheckboxes ? '✅ Enabled' : '❌ Disabled') : '❓ Unknown'}</div>
                    <div><strong>Auto Consent:</strong> ${window.commentConfig ? (window.commentConfig.autoCheckConsent ? '✅' : '❌') : '❓'}</div>
                    <div><strong>Auto Privacy:</strong> ${window.commentConfig ? (window.commentConfig.autoCheckPrivacy ? '✅' : '❌') : '❓'}</div>
                    <div><strong>Auto Terms:</strong> ${window.commentConfig ? (window.commentConfig.autoCheckTerms ? '✅' : '❌') : '❓'}</div>
                    <div><strong>Auto Newsletter:</strong> ${window.commentConfig ? (window.commentConfig.autoCheckNewsletter ? '✅' : '❌') : '❓'}</div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="color: #333; margin-bottom: 10px;">📋 Detailed Checkbox Analysis</h4>
                <div style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; border-radius: 5px;">
                    ${checkboxDetails}
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <button id="testCheckboxActionBtn" style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                    🧪 Test Checkbox Actions
                </button>
                <button id="copyCheckboxReportBtn" style="background: #2196F3; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                    📋 Copy Report
                </button>
                <button id="closeCheckboxModalBtn" style="background: #f44336; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    Close
                </button>
            </div>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Event listeners
        document.getElementById('testCheckboxActionBtn').addEventListener('click', () => {
            let actionResults = '';
            let totalActionsPerformed = 0;
            
            forms.forEach((form, index) => {
                if (window.commentConfig && window.commentConfig.handleCheckboxes && typeof window.handleCheckboxes === 'function') {
                    const beforeState = window.getFormCheckboxState ? window.getFormCheckboxState(form) : 'Unknown';
                    const result = window.handleCheckboxes(form);
                    const afterState = window.getFormCheckboxState ? window.getFormCheckboxState(form) : 'Unknown';
                    
                    if (result) {
                        totalActionsPerformed++;
                        actionResults += `Form ${index + 1}: ✅ Actions performed\n`;
                    } else {
                        actionResults += `Form ${index + 1}: ⚪ No actions needed\n`;
                    }
                }
            });
            
            alert(`🧪 Checkbox Action Test Results:\n\n${actionResults}\nTotal forms with actions: ${totalActionsPerformed}/${forms.length}`);
        });
        
        document.getElementById('copyCheckboxReportBtn').addEventListener('click', () => {
            const reportData = `CHECKBOX TEST REPORT
Generated: ${new Date().toLocaleString()}
URL: ${window.location.href}
===========================================

SUMMARY:
- Total Forms: ${forms.length}
- Total Checkboxes: ${totalCheckboxes}
- Handle Checkboxes: ${window.commentConfig ? window.commentConfig.handleCheckboxes : 'Unknown'}

CONFIGURATION:
- Auto Check Consent: ${window.commentConfig ? window.commentConfig.autoCheckConsent : 'Unknown'}
- Auto Check Privacy: ${window.commentConfig ? window.commentConfig.autoCheckPrivacy : 'Unknown'}
- Auto Check Terms: ${window.commentConfig ? window.commentConfig.autoCheckTerms : 'Unknown'}
- Auto Check Newsletter: ${window.commentConfig ? window.commentConfig.autoCheckNewsletter : 'Unknown'}

DETAILED ANALYSIS:
${content.textContent}`;
            
            navigator.clipboard.writeText(reportData).then(() => {
                alert('Checkbox report copied to clipboard!');
            }).catch(() => {
                alert('Failed to copy report to clipboard');
            });
        });
        
        document.getElementById('closeCheckboxModalBtn').addEventListener('click', () => {
            modal.remove();
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    };
    
    // Show debug modal
    window.showDebugModal = function() {
        const completedUrlsDisplay = window.getCompletedUrlsDisplay();
        const currentIndex = window.getCurrentUrlIndex();
        const currentUrl = window.location.href;

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
            font-family: monospace;
            font-size: 11px;
        `;
        
        let debugInfo = '';
        try {
            const successDetected = window.detectCommentSuccess();
            const errorDetected = window.detectCommentError();
            const urlChanged = window.hasUrlChanged(window.originalUrl, currentUrl);

            debugInfo = `
AUTO BACKLINK BOT DEBUG v4.0
================================

Current Status:
- Current URL: ${currentUrl}
- Original URL: ${window.originalUrl}
- Current Index: ${currentIndex}
- Total Target URLs: ${window.targetUrls.length}
- Completed Count: ${completedUrlsDisplay.length}
- Is Target URL: ${window.isTargetUrl()}
- Already Commented: ${window.hasAlreadyCommented()}

Submit Status:
- Submit Attempted: ${window.submitAttempted}
- Waiting for URL Change: ${window.isWaitingForUrlChange}
- URL Change Timer Active: ${window.urlChangeTimer !== null}

URL Analysis:
- Has Comment Hash: ${currentUrl.includes('#comment-')}
- Has wp-comments-post.php: ${currentUrl.includes('wp-comments-post.php')}
- URL Changed from Original: ${urlChanged}

Success Detection:
- Success Detected: ${successDetected.success}
- Success Reason: ${successDetected.reason || 'none'}

Error Detection:
- Error Detected: ${errorDetected.error}
- Error Reason: ${errorDetected.reason || 'none'}

Target URLs:
${window.targetUrls.map((url, index) => {
    const isCompleted = window.isUrlCompleted(url);
    const isCurrent = index === currentIndex;
    const status = isCompleted ? 'COMPLETED' : (isCurrent ? 'CURRENT' : 'PENDING');
    return `${status} ${index + 1}. ${url}`;
}).join('\n')}

Completed URLs (with stored format):
${completedUrlsDisplay.length > 0 ? completedUrlsDisplay.map((item) => {
    const typeLabel = item.type === 'hash' ? '[HASH]' : 
                     item.type === 'parameter' ? '[PARAM]' : '[CLEAN]';
    return `${typeLabel} ${item.index}. ${item.url}`;
}).join('\n') : 'None'}
            `;
        } catch (e) {
            debugInfo = `Error generating debug info: ${e.message}`;
        }
        
        content.innerHTML = `
            <h3 style="color: #333; margin-top: 0;">🔍 Debug Information</h3>
            <pre style="white-space: pre-wrap; word-wrap: break-word; background: #f5f5f5; padding: 15px; border-radius: 5px; max-height: 500px; overflow-y: auto;">${debugInfo}</pre>
            <div style="margin-top: 20px; text-align: center;">
                <button id="copyDebugBtn" style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                    📋 Copy Debug Info
                </button>
                <button id="saveDebugBtn" style="background: #2196F3; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                    💾 Save to File
                </button>
                <button id="refreshDebugBtn" style="background: #FF9800; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                    🔄 Refresh
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
                alert('✅ Debug info copied to clipboard!');
            }).catch(() => {
                alert('❌ Failed to copy debug info to clipboard');
            });
        });
        
        document.getElementById('saveDebugBtn').addEventListener('click', () => {
            try {
                const blob = new Blob([debugInfo], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `backlink-bot-debug-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                alert('✅ Debug info saved to file!');
            } catch (e) {
                alert('❌ Failed to save debug info: ' + e.message);
            }
        });
        
        document.getElementById('refreshDebugBtn').addEventListener('click', () => {
            modal.remove();
            setTimeout(() => {
                window.showDebugModal();
            }, 100);
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
    
    // Bot control functions
    window.startBot = function() {
        if (!window.targetUrls || window.targetUrls.length === 0) {
            alert('❌ No target URLs configured. Please check your configuration.');
            return false;
        }
        
        window.botState.isRunning = true;
        window.botState.isPaused = false;
        window.botState.isActive = true;
        
        // Save state to storage
        if (typeof GM_setValue === 'function') {
            GM_setValue('botIsRunning', true);
            GM_setValue('botIsPaused', false);
        }
        
        console.log('🤖 Bot started');
        if (typeof window.showSuccessMessage === 'function') {
            window.showSuccessMessage('Bot started successfully!');
        }
        
        window.updateControlPanel();
        
        // Start processing if on target URL
        if (typeof window.isTargetUrl === 'function' && window.isTargetUrl()) {
            setTimeout(() => {
                if (typeof window.proceedWithComment === 'function') {
                    window.proceedWithComment();
                }
            }, 2000);
        } else {
            // Navigate to first unprocessed URL
            setTimeout(() => {
                if (typeof window.navigateToNextUrl === 'function') {
                    window.navigateToNextUrl();
                }
            }, 1000);
        }
        
        return true;
    };
    
    window.stopBot = function() {
        window.botState.isRunning = false;
        window.botState.isPaused = false;
        window.botState.isActive = false;
        
        // Clear any running timers
        if (window.urlChangeTimer) {
            clearTimeout(window.urlChangeTimer);
            window.urlChangeTimer = null;
        }
        
        // Save state to storage
        if (typeof GM_setValue === 'function') {
            GM_setValue('botIsRunning', false);
            GM_setValue('botIsPaused', false);
        }
        
        console.log('🛑 Bot stopped');
        if (typeof window.showSuccessMessage === 'function') {
            window.showSuccessMessage('Bot stopped. Progress saved.');
        }
        
        window.updateControlPanel();
        return true;
    };
    
    window.pauseBot = function() {
        if (!window.botState.isRunning) {
            alert('❌ Bot is not running');
            return false;
        }
        
        window.botState.isPaused = true;
        window.botState.isActive = false;
        
        // Clear any running timers
        if (window.urlChangeTimer) {
            clearTimeout(window.urlChangeTimer);
            window.urlChangeTimer = null;
        }
        
        // Save state to storage
        if (typeof GM_setValue === 'function') {
            GM_setValue('botIsPaused', true);
        }
        
        console.log('⏸️ Bot paused');
        if (typeof window.showSuccessMessage === 'function') {
            window.showSuccessMessage('Bot paused');
        }
        
        window.updateControlPanel();
        return true;
    };
    
    window.resumeBot = function() {
        if (!window.botState.isRunning) {
            alert('❌ Bot is not running. Please start the bot first.');
            return false;
        }
        
        if (!window.botState.isPaused) {
            alert('❌ Bot is not paused');
            return false;
        }
        
        window.botState.isPaused = false;
        window.botState.isActive = true;
        
        // Save state to storage
        if (typeof GM_setValue === 'function') {
            GM_setValue('botIsPaused', false);
        }
        
        console.log('▶️ Bot resumed');
        if (typeof window.showSuccessMessage === 'function') {
            window.showSuccessMessage('Bot resumed');
        }
        
        window.updateControlPanel();
        
        // Continue processing
        setTimeout(() => {
            if (typeof window.isTargetUrl === 'function' && window.isTargetUrl()) {
                if (typeof window.proceedWithComment === 'function') {
                    window.proceedWithComment();
                }
            } else {
                if (typeof window.navigateToNextUrl === 'function') {
                    window.navigateToNextUrl();
                }
            }
        }, 1000);
        
        return true;
    };
    
    // Get URL status for URL list modal
    window.getUrlStatus = function() {
        if (!window.targetUrls || window.targetUrls.length === 0) {
            return { processed: [], unprocessed: [] };
        }
        
        const completedUrls = (typeof window.getCompletedUrls === 'function') ? window.getCompletedUrls() : [];
        const processed = [];
        const unprocessed = [];
        
        window.targetUrls.forEach((url, index) => {
            const cleanUrl = url.split('#')[0].split('?')[0];
            const isCompleted = completedUrls.some(completedUrl => {
                const cleanCompleted = completedUrl.split('#')[0].split('?')[0];
                return cleanCompleted === cleanUrl;
            });
            
            if (isCompleted) {
                processed.push({ index: index + 1, url: url });
            } else {
                unprocessed.push({ index: index + 1, url: url });
            }
        });
        
        return { processed, unprocessed };
    };
    
    // Get form checkbox state (helper function)
    window.getFormCheckboxState = function(form) {
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        const state = [];
        
        checkboxes.forEach((checkbox, index) => {
            state.push({
                index: index,
                id: checkbox.id || 'no-id',
                name: checkbox.name || 'no-name',
                checked: checkbox.checked
            });
        });
        
        return state;
    };
    
    // Initialize bot state if not exists
    if (!window.botState) {
        window.botState = {
            isRunning: false,
            isPaused: false,
            isActive: false
        };
        
        // Load state from storage
        if (typeof GM_getValue === 'function') {
            window.botState.isRunning = GM_getValue('botIsRunning', false);
            window.botState.isPaused = GM_getValue('botIsPaused', false);
            window.botState.isActive = window.botState.isRunning && !window.botState.isPaused;
        }
    }
    
    console.log('✅ UI Control Panel helper loaded');
    
})();

