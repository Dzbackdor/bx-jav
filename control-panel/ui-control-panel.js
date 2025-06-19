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

        if (currentUrl.includes('wp-comments-post.php')) {
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
            <div id="panelHeader" style="font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 5px; cursor: move;">
                🤖 Auto Backlink Bot v4.0 <span style="float: right; font-size: 10px; color: #888;">⋮⋮</span>
            </div>

            <div style="margin-bottom: 8px;">
                <strong>Status:</strong>
                <span style="color: ${statusColor};">${statusIcon} ${statusText}</span>
            </div>

            <div style="margin-bottom: 8px;">
                <strong>Progress:</strong> ${completedUrls.length}/${window.targetUrls.length} URLs
            </div>

            <div style="margin-bottom: 8px;">
                <strong>Current:</strong> ${currentIndex + 1}/${window.targetUrls.length}
            </div>

            ${currentUrl.includes('wp-comments-post.php') ? `
                <div style="margin-bottom: 8px; color: #f44336; font-weight: bold;">
                    ⚠️ ERROR DETECTED
                </div>
                <div style="margin-bottom: 8px; font-size: 11px; color: #ffcdd2;">
                    wp-comments-post.php indicates form validation error
                </div>
            ` : ''}

            <div style="margin-bottom: 10px; font-size: 11px; color: #ccc;">
                ${isTarget ? 'Target URL' : 'Non-target URL'}
            </div>

            ${checkboxStatus}

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
        document.getElementById('resetBtn').addEventListener('click', () => {
            if (confirm('Reset all progress?')) {
                window.resetAllProgress();
            }
        });

        document.getElementById('retryBtn').addEventListener('click', () => {
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
                window.proceedWithComment();
            }, 1000);
        });

        document.getElementById('skipBtn').addEventListener('click', () => {
            if (confirm('Skip current URL?')) {
                const currentUrl = window.location.href.split('#')[0];
                window.markUrlAsCompleted(currentUrl, 'Manually skipped');
                window.navigateToNextUrl();
            }
        });

        document.getElementById('debugBtn').addEventListener('click', () => {
            window.showDebugModal();
        });

        document.getElementById('checkboxBtn').addEventListener('click', () => {
            window.testCheckboxHandling();
        });

        // TOMBOL DOWNLOAD RESULTS
        document.getElementById('downloadBtn').addEventListener('click', () => {
            window.downloadResults();
        });
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
            const successUrls = window.getSuccessUrls();
            const errorUrls = window.getErrorUrls();
            
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
            let content = '';
            
            // Bagian SUCCESS
            if (successUrls.length > 0) {
                successUrls.forEach(url => {
                    content += url + '\n';
                });
            }
            
            // Garis pemisah
            content += '---\n';
            
            // Bagian ERROR
            if (errorUrls.length > 0) {
                errorUrls.forEach(url => {
                    content += url + '\n';
                });
            }
            
            // Jika tidak ada data
            if (successUrls.length === 0 && errorUrls.length === 0) {
                content = 'No results found.\n---\n';
            }
            
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
            console.log('📥 Success URLs:', successUrls);
            console.log('📥 Error URLs:', errorUrls);
            
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
            successMsg.innerHTML = `📥 Downloaded!<br>✅ Success: ${successUrls.length}<br>❌ Error: ${errorUrls.length}`;
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

        if (window.targetUrls.length > 0) {
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
            const checkboxes = window.findCheckboxes(form);

            for (let category in checkboxes) {
                if (checkboxes[category].length > 0) {
                    totalCheckboxes += checkboxes[category].length;
                    console.log(`  ${category}: ${checkboxes[category].length} checkboxes`);
                }
            }

            if (window.commentConfig.handleCheckboxes) {
                const handled = window.handleCheckboxes(form);
                if (handled) handledCheckboxes++;
            }
        });

        const testResult = `
📋 Checkbox Test Results:
- Total forms: ${forms.length}
- Total checkboxes: ${totalCheckboxes}
- Forms with checkboxes handled: ${handledCheckboxes}
- Checkbox handling enabled: ${window.commentConfig.handleCheckboxes}

Check console for detailed results.
        `;

        alert(testResult);
        console.log('📋 Checkbox test completed');
    };

    // Show debug modal
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
            const successDetected = window.detectCommentSuccess();
            const errorDetected = window.detectCommentError();
            const urlChanged = window.hasUrlChanged(window.originalUrl, currentUrl);

            // NEW: Ambil data dari storage baru
            const successUrls = window.getSuccessUrls();
            const errorUrls = window.getErrorUrls();
            const completedUrlsWithDetails = window.getCompletedUrlsWithDetails();

            debugInfo = `
🔍 AUTO BACKLINK BOT DEBUG v4.0
================================

📊 Current Status:
- Current URL: ${currentUrl}
- Original URL: ${window.originalUrl}
- Current Index: ${currentIndex}
- Total Target URLs: ${window.targetUrls.length}
- Completed Count: ${completedUrls.length}
- Is Target URL: ${window.isTargetUrl()}
- Already Commented: ${window.hasAlreadyCommented()}

🔄 Submit Status:
- Submit Attempted: ${window.submitAttempted}
- Waiting for URL Change: ${window.isWaitingForUrlChange}
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
- Handle Checkboxes: ${window.commentConfig.handleCheckboxes}
- Auto Check Consent: ${window.commentConfig.autoCheckConsent}
- Auto Check Privacy: ${window.commentConfig.autoCheckPrivacy}
- Auto Check Terms: ${window.commentConfig.autoCheckTerms}
- Auto Check Newsletter: ${window.commentConfig.autoCheckNewsletter}

📊 Results Summary:
- Success URLs: ${successUrls.length}
- Error URLs: ${errorUrls.length}
- Total Processed: ${completedUrlsWithDetails.length}

🎯 Target URLs:
${window.targetUrls.map((url, index) => {
    const isCompleted = completedUrls.includes(url.split('#')[0].split('?')[0]);
    const isCurrent = index === currentIndex;
    const status = isCompleted ? '✅' : (isCurrent ? '👉' : '⏳');
    return `${status} ${index + 1}. ${url}`;
}).join('\n')}

✅ Success URLs (with hash):
${successUrls.length > 0 ? successUrls.map((url, index) => `${index + 1}. ${url}`).join('\n') : 'None'}

❌ Error URLs:
${errorUrls.length > 0 ? errorUrls.map((url, index) => `${index + 1}. ${url}`).join('\n') : 'None'}

📋 Detailed Results:
${completedUrlsWithDetails.length > 0 ? completedUrlsWithDetails.map((item, index) => 
    `${index + 1}. [${item.status.toUpperCase()}] ${item.fullUrl} (${item.reason})`
).join('\n') : 'None'}
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
    
    console.log('✅ UI Control Panel helper loaded');
    
})();
