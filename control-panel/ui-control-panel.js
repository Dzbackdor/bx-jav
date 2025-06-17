// UI Control Panel Helper
(function() {
    'use strict';
    
    // Create control panel
    window.createControlPanel = function() {
        const currentIndex = window.getCurrentUrlIndex();
        const completedUrls = window.getCompletedUrls();
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
            cursor: move;
            user-select: none;
        `;

        let statusColor = '#666';
        let statusText = 'Not Target URL';
        let statusIcon = '⚪';

        // Check if bot is paused
        const isPaused = window.botPaused || false;

        if (isPaused) {
            statusColor = '#FF9800';
            statusText = 'PAUSED';
            statusIcon = '⏸️';
        } else if (currentUrl.includes('wp-comments-post.php')) {
            statusColor = '#f44336';
            statusText = 'ERROR: wp-comments-post.php';
            statusIcon = '❌';
        } else if (isTarget && isCompleted) {
            statusColor = '#4CAF50';
            statusText = 'Completed';
            statusIcon = '✅';
        } else if (isTarget && window.submitAttempted) {
            statusColor = '#FF9800';
            statusText = 'Processing...';
            statusIcon = '⏳';
        } else if (isTarget) {
            statusColor = '#2196F3';
            statusText = 'Ready to Comment';
            statusIcon = '🎯';
        }

        // Checkbox configuration status
        const checkboxStatus = `
            <div style="margin-bottom: 8px; font-size: 11px; color: #ccc; border-top: 1px solid #444; padding-top: 8px;">
                📋 Checkbox Settings:
            </div>
            <div style="font-size: 10px; color: #ccc; margin-bottom: 4px;">
                ${window.commentConfig && window.commentConfig.handleCheckboxes ? '✅' : '❌'} Handle Checkboxes
            </div>
            <div style="font-size: 10px; color: #ccc; margin-bottom: 4px;">
                ${window.commentConfig && window.commentConfig.autoCheckConsent ? '✅' : '❌'} Auto Consent
            </div>
            <div style="font-size: 10px; color: #ccc; margin-bottom: 4px;">
                ${window.commentConfig && window.commentConfig.autoCheckPrivacy ? '✅' : '❌'} Auto Privacy
            </div>
            <div style="font-size: 10px; color: #ccc; margin-bottom: 4px;">
                ${window.commentConfig && window.commentConfig.autoCheckTerms ? '✅' : '❌'} Auto Terms
            </div>
            <div style="font-size: 10px; color: #ccc; margin-bottom: 8px;">
                ${window.commentConfig && window.commentConfig.autoCheckNewsletter ? '✅' : '❌'} Auto Newsletter
            </div>
        `;

        // Pause/Resume button
        const pauseResumeBtn = isPaused ? 
            `<button id="resumeBtn" style="background: #4CAF50; color: white; border: none; padding: 5px 8px; border-radius: 3px; cursor: pointer; font-size: 10px; font-weight: bold;">
                ▶️ Resume
            </button>` :
            `<button id="pauseBtn" style="background: #FF9800; color: white; border: none; padding: 5px 8px; border-radius: 3px; cursor: pointer; font-size: 10px; font-weight: bold;">
                ⏸️ Pause
            </button>`;

        panel.innerHTML = `
            <div id="panelHeader" style="font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 5px; cursor: move;">
                🤖 Auto Backlink Bot v4.0 <span style="float: right; font-size: 10px; color: #888;">⋮⋮</span>
            </div>

            <div style="margin-bottom: 8px;">
                <strong>Status:</strong>
                <span style="color: ${statusColor};">${statusIcon} ${statusText}</span>
            </div>

            <div style="margin-bottom: 8px;">
                <strong>Progress:</strong> ${completedUrls.length}/${window.targetUrls ? window.targetUrls.length : 0} URLs
            </div>

            <div style="margin-bottom: 8px;">
                <strong>Current:</strong> ${currentIndex + 1}/${window.targetUrls ? window.targetUrls.length : 0}
            </div>

            ${currentUrl.includes('wp-comments-post.php') ? `
                <div style="margin-bottom: 8px; color: #f44336; font-weight: bold;">
                    ⚠️ ERROR DETECTED
                </div>
                <div style="margin-bottom: 8px; font-size: 11px; color: #ffcdd2;">
                    wp-comments-post.php indicates form validation error
                </div>
            ` : ''}

            ${isPaused ? `
                <div style="margin-bottom: 8px; color: #FF9800; font-weight: bold; text-align: center; padding: 5px; border: 1px solid #FF9800; border-radius: 3px;">
                    ⏸️ BOT PAUSED
                </div>
                <div style="margin-bottom: 8px; font-size: 11px; color: #FFE0B2; text-align: center;">
                    Click Resume to continue processing
                </div>
            ` : ''}

            <div style="margin-bottom: 10px; font-size: 11px; color: #ccc;">
                ${isTarget ? 'Target URL' : 'Non-target URL'}
            </div>

            ${checkboxStatus}

            <!-- PAUSE/RESUME BUTTON ROW -->
            <div style="display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 8px; justify-content: center;">
                ${pauseResumeBtn}
            </div>

            <!-- CONTROL BUTTONS ROW -->
            <div style="display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 8px;">
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

            <!-- DOWNLOAD BUTTON ROW -->
            <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                <button id="downloadBtn" style="background: #4CAF50; color: white; border: none; padding: 5px 8px; border-radius: 3px; cursor: pointer; font-size: 10px;">
                    📥 Results
                </button>
            </div>
        `;

        document.body.appendChild(panel);

        // DRAG & DROP FUNCTIONALITY
        window.makePanelDraggable(panel);

        // Event listeners
        document.getElementById('resetBtn')?.addEventListener('click', () => {
            if (confirm('Reset all progress?')) {
                window.resetAllProgress();
            }
        });

        document.getElementById('retryBtn')?.addEventListener('click', () => {
            window.submitAttempted = false;
            window.isWaitingForUrlChange = false;
            window.retryCount = 0;

            if (window.urlChangeTimer) {
                clearTimeout(window.urlChangeTimer);
                window.urlChangeTimer = null;
            }

            if (typeof window.removeWaitingMessage === 'function') {
                window.removeWaitingMessage();
            }
            
            console.log('🔄 Manual retry initiated');

            if (currentUrl.includes('wp-comments-post.php')) {
                const currentIndex = window.getCurrentUrlIndex();
                if (currentIndex < window.targetUrls.length) {
                    const originalTargetUrl = window.targetUrls[currentIndex];
                    console.log('🔙 Returning to original URL from wp-comments-post.php');
                    window.location.href = originalTargetUrl;
                    return;
                }
            }

            window.updateControlPanel();
            setTimeout(() => {
                if (typeof window.proceedWithComment === 'function') {
                    window.proceedWithComment();
                }
            }, 1000);
        });

        document.getElementById('skipBtn')?.addEventListener('click', () => {
            if (confirm('Skip current URL?')) {
                const currentUrl = window.location.href.split('#')[0];
                if (typeof window.markUrlAsCompleted === 'function') {
                    window.markUrlAsCompleted(currentUrl, 'Manually skipped');
                }
                if (typeof window.navigateToNextUrl === 'function') {
                    window.navigateToNextUrl();
                }
            }
        });

        document.getElementById('debugBtn')?.addEventListener('click', () => {
            window.showDebugModal();
        });

        document.getElementById('checkboxBtn')?.addEventListener('click', () => {
            window.testCheckboxHandling();
        });

        // PAUSE BUTTON EVENT LISTENER
        document.getElementById('pauseBtn')?.addEventListener('click', () => {
            window.pauseBot();
        });

        // RESUME BUTTON EVENT LISTENER
        document.getElementById('resumeBtn')?.addEventListener('click', () => {
            window.resumeBot();
        });

        // TOMBOL DOWNLOAD RESULTS
        document.getElementById('downloadBtn')?.addEventListener('click', () => {
            window.downloadResults();
        });
    };

    // PAUSE BOT FUNCTION
    window.pauseBot = function() {
        window.botPaused = true;
        
        // Clear any running timers
        if (window.urlChangeTimer) {
            clearTimeout(window.urlChangeTimer);
            window.urlChangeTimer = null;
        }
        
        // Clear any waiting messages
        if (typeof window.removeWaitingMessage === 'function') {
            window.removeWaitingMessage();
        }
        
        // Reset submit status
        window.submitAttempted = false;
        window.isWaitingForUrlChange = false;
        
        console.log('⏸️ Bot PAUSED by user');
        
        // Show pause message
        window.showPauseMessage();
        
        // Update control panel
        window.updateControlPanel();
    };

    // RESUME BOT FUNCTION
    window.resumeBot = function() {
        window.botPaused = false;
        
        console.log('▶️ Bot RESUMED by user');
        
        // Remove pause message
        window.removePauseMessage();
        
        // Update control panel
        window.updateControlPanel();
        
        // Continue processing if on target URL
        setTimeout(() => {
            if (typeof window.isTargetUrl === 'function' && window.isTargetUrl()) {
                if (typeof window.hasAlreadyCommented === 'function' && !window.hasAlreadyCommented()) {
                    console.log('▶️ Resuming comment processing...');
                    if (typeof window.proceedWithComment === 'function') {
                        window.proceedWithComment();
                    }
                } else {
                    console.log('▶️ Current URL already completed, navigating to next...');
                    if (typeof window.navigateToNextUrl === 'function') {
                        window.navigateToNextUrl();
                    }
                }
            }
        }, 1000);
    };

    // SHOW PAUSE MESSAGE
    window.showPauseMessage = function() {
        // Remove existing pause message first
        window.removePauseMessage();
        
        const pauseDiv = document.createElement('div');
        pauseDiv.id = 'botPauseMessage';
        pauseDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10001;
            background: rgba(255, 152, 0, 0.95);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            font-family: Arial, sans-serif;
            font-size: 16px;
            min-width: 300px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;

        pauseDiv.innerHTML = `
            <div style="margin-bottom: 15px; font-size: 20px;">⏸️ Bot Paused</div>
            <div style="font-size: 14px; margin-bottom: 15px;">
                Auto processing has been stopped
            </div>
            <div style="font-size: 12px; opacity: 0.8;">
                Click Resume in control panel to continue
            </div>
        `;

        document.body.appendChild(pauseDiv);
    };

    // REMOVE PAUSE MESSAGE
    window.removePauseMessage = function() {
        const pauseDiv = document.getElementById('botPauseMessage');
        if (pauseDiv) {
            pauseDiv.remove();
        }
    };

    // CHECK IF BOT IS PAUSED (for other scripts to use)
    window.isBotPaused = function() {
        return window.botPaused || false;
    };

    // FUNGSI DRAG & DROP
    window.makePanelDraggable = function(panel) {
               let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        const header = panel.querySelector('#panelHeader') || panel;

        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        // Touch events untuk mobile
        header.addEventListener('touchstart', dragStart);
        document.addEventListener('touchmove', drag);
        document.addEventListener('touchend', dragEnd);

        function dragStart(e) {
            if (e.target.tagName === 'BUTTON') return; // Jangan drag jika klik button

            if (e.type === 'touchstart') {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
            } else {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
            }

            if (e.target === header || header.contains(e.target)) {
                isDragging = true;
                panel.style.cursor = 'grabbing';
            }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();

                if (e.type === 'touchmove') {
                    currentX = e.touches[0].clientX - initialX;
                    currentY = e.touches[0].clientY - initialY;
                } else {
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                }

                xOffset = currentX;
                yOffset = currentY;

                // Batasi agar tidak keluar dari viewport
                const rect = panel.getBoundingClientRect();
                const maxX = window.innerWidth - rect.width;
                const maxY = window.innerHeight - rect.height;

                xOffset = Math.max(0, Math.min(xOffset, maxX));
                yOffset = Math.max(0, Math.min(yOffset, maxY));

                panel.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
            }
        }

        function dragEnd() {
            if (isDragging) {
                isDragging = false;
                panel.style.cursor = 'move';
            }
        }
    };

    // FUNGSI DOWNLOAD RESULTS (SUCCESS & ERROR) - UPDATED
    window.downloadResults = function() {
        try {
            const currentDate = new Date();
            const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
            const timeString = currentDate.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
            
            // Ambil URL dengan detail lengkap
            let successUrls = [];
            let errorUrls = [];
            
            // Check if enhanced functions exist
            if (typeof window.getSuccessUrls === 'function' && typeof window.getErrorUrls === 'function') {
                successUrls = window.getSuccessUrls();
                errorUrls = window.getErrorUrls();
            }
            
            // Fallback: jika tidak ada data di storage baru, gunakan cara lama
            if (successUrls.length === 0 && errorUrls.length === 0) {
                const completedUrls = window.getCompletedUrls();
                console.log('📥 Using fallback method for completed URLs');
                
                completedUrls.forEach(url => {
                    if (url.includes('wp-comments-post.php')) {
                        errorUrls.push(url);
                    } else {
                        successUrls.push(url);
                    }
                });
            }
            
            // Buat konten file
            let content = `Auto Backlink Bot Results - ${dateString} ${timeString.replace(/-/g, ':')}\n`;
            content += '='.repeat(60) + '\n\n';
            
            // Bagian SUCCESS
            content += `SUCCESS URLS (${successUrls.length}):\n`;
            content += '-'.repeat(30) + '\n';
            if (successUrls.length > 0) {
                successUrls.forEach((url, index) => {
                    content += `${index + 1}. ${url}\n`;
                });
            } else {
                content += 'No successful URLs found.\n';
            }
            
            content += '\n';
            
            // Bagian ERROR
            content += `ERROR URLS (${errorUrls.length}):\n`;
            content += '-'.repeat(30) + '\n';
            if (errorUrls.length > 0) {
                errorUrls.forEach((url, index) => {
                    content += `${index + 1}. ${url}\n`;
                });
            } else {
                content += 'No error URLs found.\n';
            }
            
            // Summary
            const total = successUrls.length + errorUrls.length;
            const successRate = total > 0 ? Math.round((successUrls.length / total) * 100) : 0;
            
            content += '\n' + '='.repeat(60) + '\n';
            content += 'SUMMARY:\n';
            content += `- Total Processed: ${total}\n`;
            content += `- Successful: ${successUrls.length}\n`;
            content += `- Errors: ${errorUrls.length}\n`;
            content += `- Success Rate: ${successRate}%\n`;
            content += `- Bot Status: ${window.botPaused ? 'PAUSED' : 'ACTIVE'}\n`;
            content += '='.repeat(60) + '\n';
            
            // Buat dan download file
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `bot-results-${dateString}-${timeString}.txt`;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            console.log('📥 Results downloaded - Success:', successUrls.length, 'Error:', errorUrls.length);
            
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #4CAF50;
                color: white;
                padding: 15px 25px;
                border-radius: 8px;
                z-index: 10002;
                font-family: Arial, sans-serif;
                font-size: 14px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            `;
            successMsg.innerHTML = `📥 Downloaded!<br>✅ Success: ${successUrls.length}<br>❌ Error: ${errorUrls.length}<br>📊 Rate: ${successRate}%`;
            document.body.appendChild(successMsg);
            
            setTimeout(() => {
                if (successMsg.parentNode) {
                    successMsg.parentNode.removeChild(successMsg);
                }
            }, 4000);
            
        } catch (error) {
            console.error('❌ Error downloading results:', error);
            alert('Error saat mendownload file: ' + error.message);
        }
    };

    // Update control panel
    window.updateControlPanel = function() {
        const existingPanel = document.getElementById('backlinkBotPanel');
        if (existingPanel) {
            existingPanel.remove();
        }
        window.createControlPanel();
    };

    // Reset all progress
    window.resetAllProgress = function() {
        // Pause bot first
        window.botPaused = false;
        window.removePauseMessage();
        
        GM_deleteValue('currentUrlIndex');
        GM_deleteValue('completedUrls');
        GM_deleteValue('completedUrlsWithDetails'); // NEW: Reset storage baru juga
        GM_deleteValue('retryCount');

        window.submitAttempted = false;
        window.isWaitingForUrlChange = false;
        window.retryCount = 0;

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
- Total forms: ${forms.length}
- Total checkboxes: ${totalCheckboxes}
- Forms with checkboxes handled: ${handledCheckboxes}
- Checkbox handling enabled: ${window.commentConfig ? window.commentConfig.handleCheckboxes : 'N/A'}

Check console for detailed results.
        `;

        alert(testResult);
        console.log('📋 Checkbox test completed');
    };

    // Show debug modal - ENHANCED WITH PAUSE STATUS
    window.showDebugModal = function() {
        const completedUrls = window.getCompletedUrls();
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
            max-width: 80%;
            max-height: 80%;
            overflow-y: auto;
            font-family: monospace;
            font-size: 12px;
        `;

        let debugInfo = '';
        try {
            // Safe function calls
            const successDetected = typeof window.detectCommentSuccess === 'function' ? 
                window.detectCommentSuccess() : { success: false, reason: 'Function not available' };
            const errorDetected = typeof window.detectCommentError === 'function' ? 
                window.detectCommentError() : { error: false, reason: 'Function not available' };
            const urlChanged = typeof window.hasUrlChanged === 'function' ? 
                window.hasUrlChanged(window.originalUrl, currentUrl) : 'Unknown';

            // Enhanced data (if available)
            let successUrls = [];
            let errorUrls = [];
            let completedUrlsWithDetails = [];
            
            if (typeof window.getSuccessUrls === 'function') {
                successUrls = window.getSuccessUrls();
            }
            if (typeof window.getErrorUrls === 'function') {
                errorUrls = window.getErrorUrls();
            }
            if (typeof window.getCompletedUrlsWithDetails === 'function') {
                completedUrlsWithDetails = window.getCompletedUrlsWithDetails();
            }

            debugInfo = `
🔍 AUTO BACKLINK BOT DEBUG v4.0 - WITH PAUSE CONTROL
====================================================

📊 Current Status:
- Current URL: ${currentUrl}
- Original URL: ${window.originalUrl || 'Not set'}
- Current Index: ${currentIndex}
- Total Target URLs: ${window.targetUrls ? window.targetUrls.length : 0}
- Completed Count: ${completedUrls.length}
- Is Target URL: ${typeof window.isTargetUrl === 'function' ? window.isTargetUrl() : 'Unknown'}
- Already Commented: ${typeof window.hasAlreadyCommented === 'function' ? window.hasAlreadyCommented() : 'Unknown'}

⏸️ Bot Control Status:
- Bot Paused: ${window.botPaused || false}
- Pause Message Visible: ${document.getElementById('botPauseMessage') ? 'Yes' : 'No'}

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

📋 Checkbox Configuration:
- Handle Checkboxes: ${window.commentConfig ? window.commentConfig.handleCheckboxes : 'N/A'}
- Auto Check Consent: ${window.commentConfig ? window.commentConfig.autoCheckConsent : 'N/A'}
- Auto Check Privacy: ${window.commentConfig ? window.commentConfig.autoCheckPrivacy : 'N/A'}
- Auto Check Terms: ${window.commentConfig ? window.commentConfig.autoCheckTerms : 'N/A'}
- Auto Check Newsletter: ${window.commentConfig ? window.commentConfig.autoCheckNewsletter : 'N/A'}

📊 Results Summary:
- Success URLs: ${successUrls.length}
- Error URLs: ${errorUrls.length}
- Total Processed: ${completedUrlsWithDetails.length}
- Success Rate: ${successUrls.length + errorUrls.length > 0 ? Math.round((successUrls.length / (successUrls.length + errorUrls.length)) * 100) : 0}%

🎯 Target URLs (First 10):
${window.targetUrls ? window.targetUrls.slice(0, 10).map((url, index) => {
        const isCompleted = completedUrls.includes(url.split('#')[0].split('?')[0]);
    const isCurrent = index === currentIndex;
    const status = isCompleted ? '✅' : (isCurrent ? '👉' : '⏳');
    return `${status} ${index + 1}. ${url}`;
}).join('\n') : 'No target URLs found'}
${window.targetUrls && window.targetUrls.length > 10 ? `... and ${window.targetUrls.length - 10} more URLs` : ''}

✅ Success URLs (Latest 5):
${successUrls.length > 0 ? successUrls.slice(-5).map((url, index) => `${index + 1}. ${url}`).join('\n') : 'None'}

❌ Error URLs (Latest 5):
${errorUrls.length > 0 ? errorUrls.slice(-5).map((url, index) => `${index + 1}. ${url}`).join('\n') : 'None'}

📋 Detailed Results (Latest 5):
${completedUrlsWithDetails.length > 0 ? completedUrlsWithDetails.slice(-5).map((item, index) => 
    `${index + 1}. [${item.status ? item.status.toUpperCase() : 'UNKNOWN'}] ${item.fullUrl || item.url || 'Unknown URL'} (${item.reason || 'No reason'})`
).join('\n') : 'None'}

🔧 Available Functions:
- detectCommentSuccess: ${typeof window.detectCommentSuccess === 'function' ? '✅' : '❌'}
- detectCommentError: ${typeof window.detectCommentError === 'function' ? '✅' : '❌'}
- isTargetUrl: ${typeof window.isTargetUrl === 'function' ? '✅' : '❌'}
- hasAlreadyCommented: ${typeof window.hasAlreadyCommented === 'function' ? '✅' : '❌'}
- proceedWithComment: ${typeof window.proceedWithComment === 'function' ? '✅' : '❌'}
- navigateToNextUrl: ${typeof window.navigateToNextUrl === 'function' ? '✅' : '❌'}
- getSuccessUrls: ${typeof window.getSuccessUrls === 'function' ? '✅' : '❌'}
- getErrorUrls: ${typeof window.getErrorUrls === 'function' ? '✅' : '❌'}
            `;
        } catch (e) {
            debugInfo = `Error generating debug info: ${e.message}\n\nStack trace:\n${e.stack}`;
        }

        content.innerHTML = `
            <h3>🔍 Debug Information</h3>
            <pre style="white-space: pre-wrap; word-wrap: break-word;">${debugInfo}</pre>
            <div style="margin-top: 20px; text-align: center;">
                <button id="copyDebugBtn" style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                    Copy Debug Info
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
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = debugInfo;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    alert('Debug info copied to clipboard!');
                } catch (err) {
                    alert('Failed to copy debug info. Please copy manually from the text area.');
                }
                document.body.removeChild(textArea);
            });
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

    // ENHANCED: Check if processing should continue (respects pause state)
    window.shouldContinueProcessing = function() {
        if (window.botPaused) {
            console.log('⏸️ Processing halted - Bot is paused');
            return false;
        }
        return true;
    };

    // ENHANCED: Safe navigation function that respects pause state
    window.safeNavigateToNextUrl = function() {
        if (!window.shouldContinueProcessing()) {
            console.log('⏸️ Navigation cancelled - Bot is paused');
            return false;
        }
        
        if (typeof window.navigateToNextUrl === 'function') {
            window.navigateToNextUrl();
            return true;
        } else {
            console.log('❌ navigateToNextUrl function not available');
            return false;
        }
    };

    // ENHANCED: Safe comment processing that respects pause state
    window.safeProceedWithComment = function() {
        if (!window.shouldContinueProcessing()) {
            console.log('⏸️ Comment processing cancelled - Bot is paused');
            return false;
        }
        
        if (typeof window.proceedWithComment === 'function') {
            window.proceedWithComment();
            return true;
        } else {
            console.log('❌ proceedWithComment function not available');
            return false;
        }
    };

    // Initialize bot pause state
    if (typeof window.botPaused === 'undefined') {
        window.botPaused = false;
    }

    console.log('✅ UI Control Panel helper loaded with Pause/Resume functionality');
    
})();

 
