// UI Messages Helper
(function() {
    'use strict';
    
    // Show waiting message
    window.showWaitingMessage = function() {
        const waitingDiv = document.createElement('div');
        waitingDiv.id = 'urlChangeWaiting';
        waitingDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10001;
            background: rgba(33, 150, 243, 0.95);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            font-family: Arial, sans-serif;
            font-size: 16px;
            min-width: 300px;
        `;

        let dotCount = 0;
        function updateMessage() {
            if (!document.getElementById('urlChangeWaiting')) return;
            dotCount = (dotCount + 1) % 4;
            const dots = '.'.repeat(dotCount);
            waitingDiv.innerHTML = `
                <div style="margin-bottom: 15px;">⏳ Processing Comment</div>
                <div style="font-size: 14px;">Waiting for confirmation${dots}</div>
                <div style="font-size: 12px; margin-top: 10px; opacity: 0.8;">
                    Monitoring for success/error...
                </div>
            `;
            setTimeout(updateMessage, 500);
        }

        updateMessage();
        document.body.appendChild(waitingDiv);
        return waitingDiv;
    };

    window.removeWaitingMessage = function() {
        const waitingDiv = document.getElementById('urlChangeWaiting');
        if (waitingDiv) {
            waitingDiv.remove();
        }
    };

    window.showSuccessMessage = function(message) {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10002;
            background: rgba(76, 175, 80, 0.95);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            font-family: Arial, sans-serif;
            font-size: 16px;
            min-width: 300px;
        `;

        successDiv.innerHTML = `
            <div style="margin-bottom: 15px;">✅ Success</div>
            <div style="font-size: 14px;">${message}</div>
        `;

        document.body.appendChild(successDiv);
        setTimeout(() => {
            if (successDiv.parentElement) {
                successDiv.remove();
            }
        }, 5000);
    };

    window.showErrorMessage = function(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10002;
            background: rgba(244, 67, 54, 0.95);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            font-family: Arial, sans-serif;
            font-size: 16px;
            min-width: 300px;
        `;

        errorDiv.innerHTML = `
            <div style="margin-bottom: 15px;">❌ Error</div>
            <div style="font-size: 14px;">${message}</div>
        `;

        document.body.appendChild(errorDiv);
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 8000);
    };

    window.showRetryMessage = function(message) {
        const retryDiv = document.createElement('div');
        retryDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10002;
            background: rgba(255, 152, 0, 0.95);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            font-family: Arial, sans-serif;
            font-size: 16px;
            min-width: 300px;
        `;

        retryDiv.innerHTML = `
            <div style="margin-bottom: 15px;">🔄 Retrying</div>
            <div style="font-size: 14px;">${message}</div>
        `;

        document.body.appendChild(retryDiv);
        setTimeout(() => {
            if (retryDiv.parentElement) {
                retryDiv.remove();
            }
        }, 5000);
    };

    // UPDATED: Show completion message with close button and actions
    window.showCompletionMessage = function() {
        // Remove existing completion message if any
        const existingMsg = document.getElementById('completionMessage');
        if (existingMsg) {
            existingMsg.remove();
        }

        const completedUrls = window.getCompletedUrls();
        const completionDiv = document.createElement('div');
        completionDiv.id = 'completionMessage';
        completionDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10003;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            font-family: Arial, sans-serif;
            font-size: 18px;
            min-width: 400px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            border: 2px solid rgba(255,255,255,0.2);
        `;

        completionDiv.innerHTML = `
            <div style="position: relative;">
                <button id="closeCompletionBtn" style="
                    position: absolute;
                    top: -20px;
                    right: -20px;
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 20px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    line-height: 1;
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='scale(1.1)'" 
                   onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='scale(1)'">
                    ×
                </button>
                
                <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
                
                <div style="margin-bottom: 20px; font-size: 24px; font-weight: bold;">
                    All URLs Completed!
                </div>
                
                <div style="font-size: 16px; margin-bottom: 15px; opacity: 0.95;">
                    Successfully processed ${completedUrls.length} out of ${window.targetUrls.length} URLs
                </div>
                
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 25px; color: #FFD700; font-weight: bold;">
                    Auto Backlink Bot - Mission Accomplished!
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                    <button id="downloadResultsBtn" style="
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: 1px solid rgba(255,255,255,0.3);
                        padding: 10px 18px;
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 13px;
                        font-weight: bold;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    " onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='translateY(-2px)'" 
                       onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='translateY(0)'">
                        📥 Download Results
                    </button>
                    
                    <button id="resetBotBtn" style="
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: 1px solid rgba(255,255,255,0.3);
                        padding: 10px 18px;
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 13px;
                        font-weight: bold;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    " onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='translateY(-2px)'" 
                       onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='translateY(0)'">
                        🔄 Reset Bot
                    </button>
                </div>
                
                <div id="autoCloseInfo" style="
                    font-size: 11px; 
                    opacity: 0.7; 
                    margin-top: 20px;
                    display: none;
                ">
                    Auto-closing in <span id="countdown">10</span> seconds...
                </div>
            </div>
        `;

        document.body.appendChild(completionDiv);

        // Event listeners
        document.getElementById('closeCompletionBtn').addEventListener('click', () => {
            completionDiv.remove();
            console.log('🎉 Completion message closed manually');
        });

        document.getElementById('downloadResultsBtn').addEventListener('click', () => {
            if (typeof window.downloadResults === 'function') {
                window.downloadResults();
                console.log('📥 Download results triggered from completion message');
            } else {
                console.warn('⚠️ downloadResults function not available');
                alert('Download function not available');
            }
        });

        document.getElementById('resetBotBtn').addEventListener('click', () => {
            if (confirm('🔄 Reset all progress and start over?\n\nThis will clear all completed URLs and restart from the beginning.')) {
                if (typeof window.resetAllProgress === 'function') {
                    window.resetAllProgress();
                    console.log('🔄 Bot reset triggered from completion message');
                } else {
                    console.warn('⚠️ resetAllProgress function not available');
                    alert('Reset function not available');
                }
                completionDiv.remove();
            }
        });

        // Auto close after 30 seconds with countdown
        setTimeout(() => {
            const autoCloseInfo = document.getElementById('autoCloseInfo');
            const countdownSpan = document.getElementById('countdown');
            
            if (autoCloseInfo && countdownSpan && document.getElementById('completionMessage')) {
                autoCloseInfo.style.display = 'block';
                
                let countdown = 10;
                const countdownInterval = setInterval(() => {
                    if (countdownSpan && countdown > 0) {
                        countdownSpan.textContent = countdown;
                        countdown--;
                    } else {
                        clearInterval(countdownInterval);
                        if (completionDiv.parentNode) {
                            completionDiv.remove();
                            console.log('🎉 Completion message auto-closed');
                        }
                    }
                }, 1000);
            }
        }, 30000);

        console.log('🎉 Completion message displayed with enhanced UI');
    };
    
    console.log('✅ UI Messages helper loaded');
    
})();
