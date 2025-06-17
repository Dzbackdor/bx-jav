// UI Control Panel Helper - Fixed Version
(function() {
    'use strict';
    
    // Panel update interval
    window.panelUpdateInterval = null;
    
    // Create main control panel
    window.createControlPanel = function() {
        // Remove existing panel
        const existingPanel = document.getElementById('backlinkBotPanel');
        if (existingPanel) {
            existingPanel.remove();
        }

        const panel = document.createElement('div');
        panel.id = 'backlinkBotPanel';
        panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 350px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 9999;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 12px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            overflow: hidden;
            transition: all 0.3s ease;
        `;

        const completedUrls = window.getCompletedUrls ? window.getCompletedUrls() : [];
        const currentIndex = window.getCurrentUrlIndex ? window.getCurrentUrlIndex() : 0;
        const totalUrls = window.targetUrls ? window.targetUrls.length : 0;
        const stats = window.getCommentStats ? window.getCommentStats() : { successful: 0, failed: 0, total: 0 };
        const progressPercent = totalUrls > 0 ? Math.round((completedUrls.length / totalUrls) * 100) : 0;
        const successRate = stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0;

        panel.innerHTML = `
            <!-- Header -->
            <div style="background: rgba(0,0,0,0.2); padding: 15px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <div style="font-weight: bold; font-size: 14px;">🚀 Auto Comment Bot v4.0</div>
                <div style="display: flex; gap: 5px;">
                    <button id="minimizeBtn" style="background: #FF9800; color: white; border: none; width: 25px; height: 25px; border-radius: 50%; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center;">−</button>
                    <button id="closeBtn" style="background: #f44336; color: white; border: none; width: 25px; height: 25px; border-radius: 50%; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center;">×</button>
                </div>
            </div>

            <!-- Content -->
            <div id="panelContent">
                <!-- Progress Section -->
                <div style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-weight: bold;">📊 Progress</span>
                        <span>${completedUrls.length}/${totalUrls} (${progressPercent}%)</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.2); border-radius: 10px; height: 8px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, #4CAF50, #45a049); height: 100%; width: ${progressPercent}%; transition: width 0.3s ease;"></div>
                    </div>
                </div>

                <!-- Statistics Section -->
                <div style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <div style="font-weight: bold; margin-bottom: 10px;">📈 Statistics</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; text-align: center;">
                        <div style="background: rgba(76,175,80,0.3); padding: 8px; border-radius: 6px;">
                            <div style="font-size: 16px; font-weight: bold;">${stats.successful}</div>
                            <div style="font-size: 10px; opacity: 0.8;">Success</div>
                        </div>
                        <div style="background: rgba(244,67,54,0.3); padding: 8px; border-radius: 6px;">
                            <div style="font-size: 16px; font-weight: bold;">${stats.failed}</div>
                            <div style="font-size: 10px; opacity: 0.8;">Failed</div>
                        </div>
                        <div style="background: rgba(33,150,243,0.3); padding: 8px; border-radius: 6px;">
                            <div style="font-size: 16px; font-weight: bold;">${successRate}%</div>
                            <div style="font-size: 10px; opacity: 0.8;">Rate</div>
                        </div>
                    </div>
                </div>

                <!-- Current Status -->
                <div style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <div style="font-weight: bold; margin-bottom: 8px;">🎯 Current Status</div>
                    <div style="font-size: 11px; line-height: 1.4;">
                        <div style="margin-bottom: 4px;">📍 URL ${currentIndex + 1}/${totalUrls}</div>
                        <div style="margin-bottom: 4px;">🔄 Submit: ${window.submitAttempted ? '✅ Yes' : '❌ No'}</div>
                        <div style="margin-bottom: 4px;">⏳ Waiting: ${window.isWaitingForUrlChange ? '✅ Yes' : '❌ No'}</div>
                        <div style="margin-bottom: 4px;">🔁 Retries: ${window.retryCount || 0}</div>
                        <div style="margin-bottom: 4px;">⏸️ Paused: ${window.botPaused ? '✅ Yes' : '❌ No'}</div>
                    </div>
                </div>

                <!-- Activity Log -->
                <div style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <div style="font-weight: bold; margin-bottom: 8px;">📋 Activity Log</div>
                    <div id="activityLog" style="background: rgba(0,0,0,0.2); border-radius: 6px; padding: 8px; height: 100px; overflow-y: auto; font-size: 10px; line-height: 1.3;">
                        <div class="log-entry" style="opacity: 0.7;">[${new Date().toLocaleTimeString()}] Control panel initialized</div>
                    </div>
                </div>

                <!-- Control Buttons Section -->
                <div style="padding: 15px;">
                    <div style="font-weight: bold; margin-bottom: 10px; text-align: center;">🎛️ Bot Controls</div>
                    
                    <!-- Primary Controls -->
                    <div style="display: flex; gap: 8px; margin-bottom: 10px;">
                        <button id="pauseBtn" style="
                            background: ${window.botPaused ? '#4CAF50' : '#FF9800'}; 
                            color: white; 
                            border: none; 
                            padding: 10px; 
                            border-radius: 8px; 
                            cursor: pointer; 
                            font-size: 11px; 
                            font-weight: bold;
                            flex: 1;
                            transition: all 0.2s;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                        ">
                            ${window.botPaused ? '▶️ Resume' : '⏸️ Pause'}
                        </button>
                        <button id="skipBtn" style="
                            background: #2196F3; 
                            color: white; 
                            border: none; 
                            padding: 10px; 
                            border-radius: 8px; 
                            cursor: pointer; 
                            font-size: 11px; 
                            font-weight: bold;
                            flex: 1;
                            transition: all 0.2s;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                        ">
                            ⏭️ Skip URL
                        </button>
                    </div>
                    
                    <!-- Popup Controls -->
                    <div style="display: flex; gap: 8px; margin-bottom: 10px;">
                        <button id="testPopupBtn" style="
                            background: #9C27B0; 
                            color: white; 
                            border: none; 
                            padding: 8px; 
                            border-radius: 6px; 
                            cursor: pointer; 
                            font-size: 10px;
                            flex: 1;
                            transition: all 0.2s;
                        ">
                            🚪 Test Popup
                        </button>
                        <button id="closePopupBtn" style="
                            background: #E91E63; 
                            color: white; 
                            border: none; 
                            padding: 8px; 
                            border-radius: 6px; 
                            cursor: pointer; 
                            font-size: 10px;
                            flex: 1;
                            transition: all 0.2s;
                        ">
                            ❌ Close Popup
                        </button>
                    </div>
                    
                    <!-- Testing Controls -->
                    <div style="display: flex; gap: 8px; margin-bottom: 10px;">
                        <button id="checkboxBtn" style="
                            background: #607D8B; 
                            color: white; 
                            border: none; 
                            padding: 8px; 
                            border-radius: 6px; 
                            cursor: pointer; 
                            font-size: 10px;
                            flex: 1;
                            transition: all 0.2s;
                        ">
                            📋 Test Checkbox
                        </button>
                        <button id="debugBtn" style="
                            background: #795548; 
                            color: white; 
                            border: none; 
                            padding: 8px; 
                            border-radius: 6px; 
                            cursor: pointer; 
                            font-size: 10px;
                            flex: 1;
                            transition: all 0.2s;
                        ">
                            🔍 Debug Info
                        </button>
                    </div>
                    
                    <!-- Reset Button -->
                    <button id="resetBtn" style="
                        background: linear-gradient(45deg, #f44336, #d32f2f); 
                        color: white; 
                        border: none; 
                        padding: 12px; 
                        border-radius: 8px; 
                        cursor: pointer; 
                        font-size: 11px; 
                        font-weight: bold;
                        width: 100%; 
                        transition: all 0.2s;
                        box-shadow: 0 3px 8px rgba(244,67,54,0.3);
                    ">
                        🔄 Reset All Progress
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
        window.attachPanelEvents();
        window.startPanelAutoUpdate();
        
        console.log('✅ Control panel created with all buttons');
    };

    // Attach event listeners to panel buttons
    window.attachPanelEvents = function() {
        // Minimize/Maximize
        document.getElementById('minimizeBtn')?.addEventListener('click', () => {
            const content = document.getElementById('panelContent');
            const btn = document.getElementById('minimizeBtn');
            
            if (content.style.display === 'none') {
                content.style.display = 'block';
                btn.textContent = '−';
                btn.style.background = '#FF9800';
                window.addLogEntry('📖 Panel expanded');
            } else {
                content.style.display = 'none';
                btn.textContent = '+';
                btn.style.background = '#4CAF50';
                window.addLogEntry('📕 Panel minimized');
            }
        });

        // Close panel
        document.getElementById('closeBtn')?.addEventListener('click', () => {
            if (confirm('Close control panel? (Bot will continue running)')) {
                document.getElementById('backlinkBotPanel')?.remove();
                window.addLogEntry('❌ Control panel closed');
                if (window.panelUpdateInterval) {
                    clearInterval(window.panelUpdateInterval);
                }
            }
        });

        // Pause/Resume Bot
        document.getElementById('pauseBtn')?.addEventListener('click', () => {
            const btn = document.getElementById('pauseBtn');
            
            if (window.botPaused) {
                // Resume bot
                window.botPaused = false;
                btn.textContent = '⏸️ Pause';
                btn.style.background = '#FF9800';
                window.addLogEntry('▶️ Bot resumed - continuing process');
                
                // Show resume message
                if (typeof window.showSuccessMessage === 'function') {
                    window.showSuccessMessage('Bot resumed successfully!');
                }
                
                // Continue bot process if needed
                if (typeof window.continueBot === 'function') {
                    setTimeout(() => {
                        window.continueBot();
                    }, 1000);
                }
                
            } else {
                // Pause bot
                window.botPaused = true;
                btn.textContent = '▶️ Resume';
                btn.style.background = '#4CAF50';
                window.addLogEntry('⏸️ Bot paused - all processes stopped');
                
                // Show pause message
                if (typeof window.showRetryMessage === 'function') {
                    window.showRetryMessage('Bot paused. Click Resume to continue.');
                }
                
                // Clear any running timers
                if (window.urlChangeTimer) {
                    clearTimeout(window.urlChangeTimer);
                    window.urlChangeTimer = null;
                }
            }
            
            // Update panel to reflect new state
            setTimeout(() => {
                window.updateControlPanel();
            }, 500);
        });

        // Skip current URL
        document.getElementById('skipBtn')?.addEventListener('click', () => {
            if (confirm('Skip current URL and move to next?')) {
                const currentUrl = window.location.href.split('#')[0];
                window.addLogEntry('⏭️ Manually skipped current URL');
                
                // Show skip message
                if (typeof window.showRetryMessage === 'function') {
                    window.showRetryMessage('Skipping current URL...');
                }
                
                // Mark as completed with skip reason
                if (typeof window.markUrlAsCompleted === 'function') {
                    window.markUrlAsCompleted(currentUrl, 'Manually skipped');
                }
                
                // Update stats as failed
                if (typeof window.updateCommentStats === 'function') {
                    window.updateCommentStats('failed');
                }
                
                // Navigate to next URL
                setTimeout(() => {
                    if (typeof window.navigateToNextUrl === 'function') {
                        window.navigateToNextUrl();
                    } else {
                        // Fallback navigation
                        const completedUrls = window.getCompletedUrls ? window.getCompletedUrls() : [];
                        const nextIndex = completedUrls.length;
                        
                        if (window.targetUrls && nextIndex < window.targetUrls.length) {
                            window.location.href = window.targetUrls[nextIndex];
                        } else {
                            window.addLogEntry('✅ All URLs completed after skip');
                        }
                    }
                }, 1500);
            }
        });

        // Debug modal
        document.getElementById('debugBtn')?.addEventListener('click', () => {
            window.addLogEntry('🔍 Opening debug modal');
            window.showDebugModal();
        });

        // Test checkbox handling
        document.getElementById('checkboxBtn')?.addEventListener('click', () => {
            window.addLogEntry('📋 Testing checkbox handling');
            window.testCheckboxHandling();
        });

        // Test popup detection
        document.getElementById('testPopupBtn')?.addEventListener('click', () => {
            window.addLogEntry('🚪 Testing popup detection');
            if (typeof window.testPopupDetection === 'function') {
                const result = window.testPopupDetection();
                window.addLogEntry(`🔍 Found ${result.length} popup elements`);
            } else {
                window.addLogEntry('❌ testPopupDetection function not available');
                alert('❌ Popup detection function not available');
            }
        });

        // Close popup
        document.getElementById('closePopupBtn')?.addEventListener('click', () => {
            window.addLogEntry('❌ Attempting to close popups');
            if (typeof window.closePopup === 'function') {
                const closed = window.closePopup();
                window.addLogEntry(closed ? '✅ Popup closed successfully' : '❌ No popup found to close');
                
                if (closed) {
                    if (typeof window.showSuccessMessage === 'function') {
                        window.showSuccessMessage('Popup closed successfully!');
                    }
                } else {
                    if (typeof window.showErrorMessage === 'function') {
                        window.showErrorMessage('No popup found to close');
                    }
                }
            } else {
                window.addLogEntry('❌ closePopup function not available');
                alert('❌ Close popup function not available');
            }
        });

        // Reset all progress
        document.getElementById('resetBtn')?.addEventListener('click', () => {
            if (confirm('⚠️ RESET ALL PROGRESS?\n\nThis will:\n• Clear all completed URLs\n• Reset statistics\n• Restart from first URL\n\nAre you sure?')) {
                window.resetAllProgress();
            }
        });

        // Add hover effects to buttons
        const buttons = document.querySelectorAll('#backlinkBotPanel button');
        buttons.forEach(button => {
            if (button.id === 'minimizeBtn' || button.id === 'closeBtn') return;
            
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-1px)';
                button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = button.id === 'resetBtn' ? '0 3px 8px rgba(244,67,54,0.3)' : '0 2px 5px rgba(0,0,0,0.2)';
            });
        });
    };

    // Add log entry to activity log
    window.addLogEntry = function(message) {
        const logContainer = document.getElementById('activityLog');
        if (!logContainer) return;

        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.style.cssText = 'margin-bottom: 2px; opacity: 0; transition: opacity 0.3s ease;';
        logEntry.innerHTML = `<span style="color: #ccc;">[${timestamp}]</span> ${message}`;
        
        logContainer.insertBefore(logEntry, logContainer.firstChild);
        
        // Animate in
        setTimeout(() => {
            logEntry.style.opacity = '1';
        }, 10);
        
        // Keep only last 8 entries
        const entries = logContainer.querySelectorAll('.log-entry');
        if (entries.length > 8) {
            for (let i = 8; i < entries.length; i++) {
                entries[i].remove();
            }
        }
        
        // Auto scroll to top
        logContainer.scrollTop = 0;
        
        console.log(`📋 Log: ${message}`);
    };

    // Get comment statistics
    window.getCommentStats = function() {
        const completedUrls = window.getCompletedUrls ? window.getCompletedUrls() : [];
        const stats = {
            successful: 0,
            failed: 0,
            total: completedUrls.length
        };
        
        // Try to get more detailed stats from storage if available
        try {
            const savedStats = GM_getValue('commentStats', null);
            if (savedStats) {
                const parsed = JSON.parse(savedStats);
                stats.successful = parsed.successful || 0;
                stats.failed = parsed.failed || 0;
                stats.total = Math.max(stats.successful + stats.failed, completedUrls.length);
            }
        } catch (e) {
            console.log('Could not load detailed stats:', e);
        }
        
        return stats;
    };

    // Update comment statistics
    window.updateCommentStats = function(type) {
        try {
            const stats = window.getCommentStats();
            
            if (type === 'success') {
                stats.successful++;
            } else if (type === 'failed') {
                stats.failed++;
            }
            
            stats.total = stats.successful + stats.failed;
            
            GM_setValue('commentStats', JSON.stringify(stats));
            
            // Update control panel if visible
            if (document.getElementById('backlinkBotPanel')) {
                setTimeout(() => {
                    window.updateControlPanel();
                }, 500);
            }
            
            console.log(`📊 Stats updated: ${type}`, stats);
        } catch (e) {
            console.error('Error updating stats:', e);
        }
    };

    // Update control panel
    window.updateControlPanel = function() {
        const existingPanel = document.getElementById('backlinkBotPanel');
        if (existingPanel) {
            // Store current minimize state
            const content = document.getElementById('panelContent');
            const wasMinimized = content && content.style.display === 'none';
            
            existingPanel.remove();
            window.createControlPanel();
            
            // Restore minimize state
            if (wasMinimized) {
                setTimeout(() => {
                    const newContent = document.getElementById('panelContent');
                    const newMinimizeBtn = document.getElementById('minimizeBtn');
                    if (newContent && newMinimizeBtn) {
                        newContent.style.display = 'none';
                        newMinimizeBtn.textContent = '+';
                        newMinimizeBtn.style.background = '#4CAF50';
                    }
                }, 100);
            }
        } else {
            window.createControlPanel();
        }
    };

    // Start auto-update interval
    window.startPanelAutoUpdate = function() {
        if (window.panelUpdateInterval) {
            clearInterval(window.panelUpdateInterval);
        }
        
        window.panelUpdateInterval = setInterval(() => {
            if (document.getElementById('backlinkBotPanel')) {
                // Only update if not paused to avoid interference
                if (!window.botPaused) {
                    window.updateControlPanel();
                }
            } else {
                clearInterval(window.panelUpdateInterval);
                window.panelUpdateInterval = null;
            }
        }, 15000); // Update every 15 seconds
    };

    // Enhanced test checkbox handling
    window.testCheckboxHandling = function() {
        console.log('🧪 Testing checkbox handling...');
        window.addLogEntry('🧪 Starting checkbox test');
        
        const forms = document.querySelectorAll('form');
        let totalCheckboxes = 0;
        let handledCheckboxes = 0;
        let testResults = [];

        forms.forEach((form, index) => {
            console.log(`📝 Testing form ${index + 1}:`);
            const checkboxes = window.findCheckboxes ? window.findCheckboxes(form) : {};
            
            let formCheckboxCount = 0;
            for (let category in checkboxes) {
                if (checkboxes[category] && checkboxes[category].length > 0) {
                    formCheckboxCount += checkboxes[category].length;
                    totalCheckboxes += checkboxes[category].length;
                    console.log(`  ${category}: ${checkboxes[category].length} checkboxes`);
                    testResults.push(`Form ${index + 1} - ${category}: ${checkboxes[category].length}`);
                    
                    // Highlight checkboxes for testing
                    checkboxes[category].forEach(checkbox => {
                        checkbox.style.outline = '2px solid #2196F3';
                        checkbox.style.outlineOffset = '2px';
                        setTimeout(() => {
                            if (checkbox.style) {
                                checkbox.style.outline = '';
                                checkbox.style.outlineOffset = '';
                            }
                        }, 3000);
                    });
                }
            }
            
            if (window.commentConfig && window.commentConfig.handleCheckboxes && window.handleCheckboxes) {
                try {
                    const handled = window.handleCheckboxes(form);
                    if (handled) handledCheckboxes++;
                } catch (e) {
                    console.error('Error handling checkboxes:', e);
                }
            }
        });

        const testResult = `📋 Checkbox Test Results:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Total forms: ${forms.length}
• Total checkboxes: ${totalCheckboxes}
• Forms with checkboxes handled: ${handledCheckboxes}
• Checkbox handling enabled: ${window.commentConfig ? window.commentConfig.handleCheckboxes : 'Config not available'}

📋 Detailed Results:
${testResults.length > 0 ? testResults.join('\n') : 'No checkboxes found'}

Checkboxes are highlighted in blue for 3 seconds.
Check console for detailed results.`;

        alert(testResult);
        window.addLogEntry(`📋 Checkbox test: ${totalCheckboxes} checkboxes, ${handledCheckboxes} handled`);
        console.log('📋 Checkbox test completed');
    };

    // Enhanced debug modal
    window.showDebugModal = function() {
        const completedUrls = window.getCompletedUrls ? window.getCompletedUrls() : [];
        const currentIndex = window.getCurrentUrlIndex ? window.getCurrentUrlIndex() : 0;
        const currentUrl = window.location.href;
        const stats = window.getCommentStats();
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10001;
            display: flex;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(5px);
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 25px;
            border-radius: 15px;
            max-width: 90%;
            max-height: 90%;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.2);
        `;

        let debugInfo = '';
        try {
            const successDetected = window.detectCommentSuccess ? window.detectCommentSuccess() : {success: false, reason: 'Function not available'};
            const errorDetected = window.detectCommentError ? window.detectCommentError() : {error: false, reason: 'Function not available'};
            const urlChanged = window.hasUrlChanged ? window.hasUrlChanged(window.originalUrl, currentUrl) : 'Unknown';
            
            // Popup status check
            const popupFunctions = {
                'closePopup': typeof window.closePopup === 'function',
                'testPopupDetection': typeof window.testPopupDetection === 'function'
            };

            debugInfo = `🔍 AUTO BACKLINK BOT DEBUG v4.0 - ENHANCED
════════════════════════════════════════════════════════════════════

📊 CURRENT STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Current URL: ${currentUrl}
• Original URL: ${window.originalUrl || 'Not set'}
• Current Index: ${currentIndex}
• Total Target URLs: ${window.targetUrls ? window.targetUrls.length : 'Not available'}
• Completed Count: ${completedUrls.length}
• Is Target URL: ${window.isTargetUrl ? window.isTargetUrl() : 'Function not available'}
• Already Commented: ${window.hasAlreadyCommented ? window.hasAlreadyCommented() : 'Function not available'}

📈 STATISTICS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Successful Comments: ${stats.successful}
• Failed Comments: ${stats.failed}
• Total Attempts: ${stats.total}
• Success Rate: ${stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0}%

🔄 SUBMIT STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Submit Attempted: ${window.submitAttempted || false}
• Waiting for URL Change: ${window.isWaitingForUrlChange || false}
• URL Change Timer Active: ${window.urlChangeTimer !== null}
• Retry Count: ${window.retryCount || 0}
• Bot Paused: ${window.botPaused || false}

🎯 URL ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Has Comment Hash: ${currentUrl.includes('#comment-')}
• Has wp-comments-post.php: ${currentUrl.includes('wp-comments-post.php')}
• URL Changed from Original: ${urlChanged}

✅ SUCCESS DETECTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Success Detected: ${successDetected.success}
• Success Reason: ${successDetected.reason || 'none'}

❌ ERROR DETECTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Error Detected: ${errorDetected.error}
• Error Reason: ${errorDetected.reason || 'none'}

🚪 POPUP HANDLING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Handle Popups Enabled: ${window.commentConfig ? window.commentConfig.handlePopups : 'Config not available'}
• closePopup Function: ${popupFunctions.closePopup ? '✅ Available' : '❌ Missing'}
• testPopupDetection Function: ${popupFunctions.testPopupDetection ? '✅ Available' : '❌ Missing'}

📋 CHECKBOX CONFIGURATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Handle Checkboxes: ${window.commentConfig ? window.commentConfig.handleCheckboxes : 'Config not available'}
• Auto Check Consent: ${window.commentConfig ? window.commentConfig.autoCheckConsent : 'Config not available'}
• Auto Check Privacy: ${window.commentConfig ? window.commentConfig.autoCheckPrivacy : 'Config not available'}
• Auto Check Terms: ${window.commentConfig ? window.commentConfig.autoCheckTerms : 'Config not available'}
• Auto Check Newsletter: ${window.commentConfig ? window.commentConfig.autoCheckNewsletter : 'Config not available'}

🎯 TARGET URLs:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${window.targetUrls ? window.targetUrls.map((url, index) => {
    const cleanUrl = url.split('#')[0].split('?')[0];
    const isCompleted = completedUrls.includes(cleanUrl);
    const isCurrent = index === currentIndex;
    const status = isCompleted ? '✅' : (isCurrent ? '👉' : '⏳');
    return `${status} ${String(index + 1).padStart(2, '0')}. ${url}`;
}).join('\n') : 'Target URLs not available'}

✅ COMPLETED URLs:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${completedUrls.length > 0 ? completedUrls.map((url, index) => 
    `✅ ${String(index + 1).padStart(2, '0')}. ${url}`
).join('\n') : 'No URLs completed yet'}

🔧 FUNCTION AVAILABILITY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• isTargetUrl: ${typeof window.isTargetUrl === 'function' ? '✅' : '❌'}
• hasAlreadyCommented: ${typeof window.hasAlreadyCommented === 'function' ? '✅' : '❌'}
• detectCommentSuccess: ${typeof window.detectCommentSuccess === 'function' ? '✅' : '❌'}
• detectCommentError: ${typeof window.detectCommentError === 'function' ? '✅' : '❌'}
• fillWordPressForm: ${typeof window.fillWordPressForm === 'function' ? '✅' : '❌'}
• tryGenericFormFilling: ${typeof window.tryGenericFormFilling === 'function' ? '✅' : '❌'}
• handleCheckboxes: ${typeof window.handleCheckboxes === 'function' ? '✅' : '❌'}
• closePopup: ${typeof window.closePopup === 'function' ? '✅' : '❌'}
• testPopupDetection: ${typeof window.testPopupDetection === 'function' ? '✅' : '❌'}

🌐 BROWSER INFO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• User Agent: ${navigator.userAgent}
• Viewport: ${window.innerWidth}x${window.innerHeight}
• Timestamp: ${new Date().toLocaleString()}

════════════════════════════════════════════════════════════════════`;

        } catch (e) {
            debugInfo = `❌ Error generating debug info: ${e.message}\n\nStack trace:\n${e.stack}`;
        }

        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 15px;">
                <h3 style="margin: 0; color: #64B5F6; font-size: 18px;">🔍 Enhanced Debug Information</h3>
                <div style="display: flex; gap: 10px;">
                    <button id="refreshDebugBtn" style="background: #4CAF50; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 11px;">
                        🔄 Refresh
                    </button>
                    <button id="exportDebugBtn" style="background: #2196F3; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 11px;">
                        📤 Export
                    </button>
                </div>
            </div>
            
            <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px; border-left: 4px solid #64B5F6;">
                <pre style="white-space: pre-wrap; word-wrap: break-word; margin: 0; line-height: 1.4;">${debugInfo}</pre>
            </div>
            
            <div style="text-align: center; display: flex; gap: 10px; justify-content: center;">
                <button id="copyDebugBtn" style="background: linear-gradient(45deg, #4CAF50, #45a049); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: bold; transition: all 0.2s;">
                    📋 Copy Debug Info
                </button>
                <button id="saveDebugBtn" style="background: linear-gradient(45deg, #FF9800, #F57C00); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: bold; transition: all 0.2s;">
                    💾 Save to File
                </button>
                <button id="closeDebugBtn" style="background: linear-gradient(45deg, #f44336, #d32f2f); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: bold; transition: all 0.2s;">
                    ❌ Close
                </button>
            </div>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Enhanced event listeners
        document.getElementById('refreshDebugBtn')?.addEventListener('click', () => {
            modal.remove();
            window.showDebugModal();
        });

        document.getElementById('exportDebugBtn')?.addEventListener('click', () => {
            const exportData = {
                timestamp: new Date().toISOString(),
                url: currentUrl,
                debugInfo: debugInfo,
                stats: stats,
                config: window.commentConfig
            };
            
            const jsonData = JSON.stringify(exportData, null, 2);
            navigator.clipboard.writeText(jsonData).then(() => {
                alert('📤 Debug data exported to clipboard as JSON!');
            }).catch(() => {
                alert('❌ Failed to export debug data');
            });
        });

        document.getElementById('copyDebugBtn')?.addEventListener('click', () => {
            navigator.clipboard.writeText(debugInfo).then(() => {
                const btn = document.getElementById('copyDebugBtn');
                const originalText = btn.textContent;
                btn.textContent = '✅ Copied!';
                btn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
                }, 2000);
            }).catch(() => {
                alert('❌ Failed to copy debug info');
            });
        });

        document.getElementById('saveDebugBtn')?.addEventListener('click', () => {
            try {
                const blob = new Blob([debugInfo], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `auto-comment-debug-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                const btn = document.getElementById('saveDebugBtn');
                const originalText = btn.textContent;
                btn.textContent = '✅ Saved!';
                
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            } catch (e) {
                alert('❌ Failed to save debug file: ' + e.message);
            }
        });

        document.getElementById('closeDebugBtn')?.addEventListener('click', () => {
            modal.remove();
        });

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // ESC key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    };

    // Reset all progress
    window.resetAllProgress = function() {
        try {
            // Clear all stored data
            GM_deleteValue('completedUrls');
            GM_deleteValue('commentStats');
            GM_deleteValue('currentUrlIndex');
            
            // Reset runtime variables
            window.submitAttempted = false;
            window.isWaitingForUrlChange = false;
            window.retryCount = 0;
            window.botPaused = false;
            
            // Clear timers
            if (window.urlChangeTimer) {
                clearTimeout(window.urlChangeTimer);
                window.urlChangeTimer = null;
            }
            
            window.addLogEntry('🔄 All progress reset - restarting from first URL');
            
            // Show reset message
            if (typeof window.showSuccessMessage === 'function') {
                window.showSuccessMessage('All progress reset! Redirecting to first URL...');
            }
            
            // Navigate to first URL if available
            if (window.targetUrls && window.targetUrls.length > 0) {
                setTimeout(() => {
                    window.location.href = window.targetUrls[0];
                }, 2000);
            }
            
            alert('✅ All progress has been reset! Bot will restart from the first URL.');
            
        } catch (e) {
            console.error('Error resetting progress:', e);
            window.addLogEntry('❌ Error resetting progress: ' + e.message);
            alert('❌ Error resetting progress: ' + e.message);
        }
    };

    // Continue bot function (for resume functionality)
    window.continueBot = function() {
        if (window.botPaused) {
            console.log('Bot is paused, not continuing');
            return;
        }
        
        window.addLogEntry('🔄 Continuing bot process...');
        
        // Check if we're on a target URL and should process
        if (typeof window.isTargetUrl === 'function' && window.isTargetUrl()) {
            if (typeof window.hasAlreadyCommented === 'function' && !window.hasAlreadyCommented()) {
                window.addLogEntry('🎯 Resuming comment process on target URL');
                
                // Try to fill and submit form
                setTimeout(() => {
                    if (typeof window.fillWordPressForm === 'function') {
                        const wpSuccess = window.fillWordPressForm();
                        if (!wpSuccess && typeof window.tryGenericFormFilling === 'function') {
                            window.tryGenericFormFilling();
                        }
                    }
                }, 1000);
            } else {
                window.addLogEntry('✅ URL already processed, moving to next');
                if (typeof window.navigateToNextUrl === 'function') {
                    setTimeout(() => {
                        window.navigateToNextUrl();
                    }, 2000);
                }
            }
        } else {
            window.addLogEntry('ℹ️ Not a target URL, checking navigation');
            if (typeof window.navigateToNextUrl === 'function') {
                setTimeout(() => {
                    window.navigateToNextUrl();
                }, 2000);
            }
        }
    };

    // Initialize control panel on page load
    window.initializeControlPanel = function() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    window.createControlPanel();
                    window.addLogEntry('🚀 Auto Comment Bot v4.0 initialized');
                }, 1000);
            });
        } else {
            setTimeout(() => {
                window.createControlPanel();
                window.addLogEntry('🚀 Auto Comment Bot v4.0 initialized');
            }, 1000);
        }
    };

    // Cleanup function
    window.cleanupControlPanel = function() {
        const panel = document.getElementById('backlinkBotPanel');
        if (panel) {
            panel.remove();
        }
        
        if (window.panelUpdateInterval) {
            clearInterval(window.panelUpdateInterval);
            window.panelUpdateInterval = null;
        }
        
        console.log('🧹 Control panel cleaned up');
    };

    // Enhanced drag functionality for control panel
    window.makeControlPanelDraggable = function() {
        const panel = document.getElementById('backlinkBotPanel');
        if (!panel) return;

        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        const header = panel.querySelector('div'); // First div is header

        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        function dragStart(e) {
            if (e.target.tagName === 'BUTTON') return; // Don't drag when clicking buttons
            
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target === header || header.contains(e.target)) {
                isDragging = true;
                panel.style.cursor = 'grabbing';
                header.style.cursor = 'grabbing';
            }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                xOffset = currentX;
                yOffset = currentY;

                // Keep panel within viewport
                const rect = panel.getBoundingClientRect();
                const maxX = window.innerWidth - rect.width;
                const maxY = window.innerHeight - rect.height;

                xOffset = Math.max(0, Math.min(xOffset, maxX));
                yOffset = Math.max(0, Math.min(yOffset, maxY));

                panel.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
                panel.style.position = 'fixed';
                panel.style.top = '20px';
                panel.style.right = 'auto';
                panel.style.left = '20px';
            }
        }

        function dragEnd() {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
            panel.style.cursor = 'default';
            header.style.cursor = 'grab';
        }

        // Set initial cursor
        header.style.cursor = 'grab';
        header.style.userSelect = 'none';
    };

    // Enhanced panel visibility management
    window.togglePanelVisibility = function(show = true) {
        const panel = document.getElementById('backlinkBotPanel');
        if (panel) {
            panel.style.display = show ? 'block' : 'none';
            if (show) {
                window.addLogEntry('👁️ Control panel shown');
            } else {
                window.addLogEntry('🙈 Control panel hidden');
            }
        }
    };

    // Keyboard shortcuts for panel control
    window.setupPanelKeyboardShortcuts = function() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + Shift + P = Toggle panel visibility
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                const panel = document.getElementById('backlinkBotPanel');
                if (panel) {
                    const isVisible = panel.style.display !== 'none';
                    window.togglePanelVisibility(!isVisible);
                }
            }
            
            // Ctrl + Shift + R = Reset all progress
            if (e.ctrlKey && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                if (confirm('⚠️ Reset all progress with keyboard shortcut?')) {
                    window.resetAllProgress();
                }
            }
            
            // Ctrl + Shift + D = Show debug modal
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                window.showDebugModal();
            }
            
            // Ctrl + Shift + Space = Pause/Resume bot
            if (e.ctrlKey && e.shiftKey && e.code === 'Space') {
                e.preventDefault();
                const pauseBtn = document.getElementById('pauseBtn');
                if (pauseBtn) {
                    pauseBtn.click();
                }
            }
        });
        
        console.log('⌨️ Keyboard shortcuts enabled:');
        console.log('   Ctrl+Shift+P = Toggle panel');
        console.log('   Ctrl+Shift+R = Reset progress');
        console.log('   Ctrl+Shift+D = Debug modal');
        console.log('   Ctrl+Shift+Space = Pause/Resume');
    };

    // Panel state persistence
    window.savePanelState = function() {
        try {
            const panel = document.getElementById('backlinkBotPanel');
            if (panel) {
                const content = document.getElementById('panelContent');
                const state = {
                    minimized: content && content.style.display === 'none',
                    position: {
                        transform: panel.style.transform,
                        top: panel.style.top,
                        left: panel.style.left,
                        right: panel.style.right
                    }
                };
                GM_setValue('panelState', JSON.stringify(state));
            }
        } catch (e) {
            console.log('Could not save panel state:', e);
        }
    };

    window.loadPanelState = function() {
        try {
            const savedState = GM_getValue('panelState', null);
            if (savedState) {
                const state = JSON.parse(savedState);
                const panel = document.getElementById('backlinkBotPanel');
                const content = document.getElementById('panelContent');
                const minimizeBtn = document.getElementById('minimizeBtn');
                
                if (panel && state.position) {
                    if (state.position.transform) {
                        panel.style.transform = state.position.transform;
                        panel.style.position = 'fixed';
                        panel.style.top = state.position.top || '20px';
                        panel.style.left = state.position.left || '20px';
                        panel.style.right = 'auto';
                    }
                }
                
                if (state.minimized && content && minimizeBtn) {
                    content.style.display = 'none';
                    minimizeBtn.textContent = '+';
                    minimizeBtn.style.background = '#4CAF50';
                }
            }
        } catch (e) {
            console.log('Could not load panel state:', e);
        }
    };

    // Auto-save panel state on changes
    window.setupPanelStatePersistence = function() {
        // Save state when minimizing/maximizing
        const observer = new MutationObserver(() => {
            window.savePanelState();
        });
        
        const panel = document.getElementById('backlinkBotPanel');
        if (panel) {
            observer.observe(panel, {
                attributes: true,
                attributeFilter: ['style'],
                subtree: true
            });
        }
        
        // Save state before page unload
        window.addEventListener('beforeunload', () => {
            window.savePanelState();
        });
    };

    // Auto-initialize when script loads
    window.initializeControlPanel();
    
    // Setup additional features after initialization
    setTimeout(() => {
        window.makeControlPanelDraggable();
        window.setupPanelKeyboardShortcuts();
        window.loadPanelState();
        window.setupPanelStatePersistence();
    }, 1500);
    
    console.log('✅ Enhanced UI Control Panel helper loaded with full functionality');
    console.log('🎛️ Features: Pause/Resume, Skip, Debug, Popup Control, Checkbox Test, Reset');
    console.log('⌨️ Keyboard shortcuts available (see console for details)');
    
})();

