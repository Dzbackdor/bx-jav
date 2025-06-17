// UI Messages Helper
(function() {
    'use strict';
    
    // Show waiting message with enhanced features
    window.showWaitingMessage = function(customMessage = null) {
        // Remove existing waiting message first
        window.removeWaitingMessage();
        
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
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;

        let dotCount = 0;
        let startTime = Date.now();
        
        function updateMessage() {
            const waitingElement = document.getElementById('urlChangeWaiting');
            if (!waitingElement) return;
            
            dotCount = (dotCount + 1) % 4;
            const dots = '.'.repeat(dotCount);
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            
            const message = customMessage || 'Processing Comment';
            
            waitingElement.innerHTML = `
                <div style="margin-bottom: 15px;">⏳ ${message}</div>
                <div style="font-size: 14px;">Waiting for confirmation${dots}</div>
                <div style="font-size: 12px; margin-top: 10px; opacity: 0.8;">
                    Monitoring for success/error...
                </div>
                <div style="font-size: 11px; margin-top: 8px; opacity: 0.6;">
                    Elapsed: ${elapsed}s
                </div>
                <button id="cancelWaitingBtn" style="
                    background: rgba(244, 67, 54, 0.8);
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 11px;
                    margin-top: 10px;
                ">Cancel</button>
            `;
            
            // Add cancel button event listener
            const cancelBtn = document.getElementById('cancelWaitingBtn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    window.removeWaitingMessage();
                    if (window.urlChangeTimer) {
                        clearTimeout(window.urlChangeTimer);
                        window.urlChangeTimer = null;
                    }
                    window.isWaitingForUrlChange = false;
                    console.log('⏹️ Waiting cancelled by user');
                });
            }
            
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

    // Enhanced success message with auto-close option
    window.showSuccessMessage = function(message, autoClose = true, duration = 5000) {
        // Remove any existing success messages
        const existingSuccess = document.querySelectorAll('[id^="successMessage"]');
        existingSuccess.forEach(el => el.remove());
        
        const successDiv = document.createElement('div');
        successDiv.id = 'successMessage_' + Date.now();
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
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;

        successDiv.innerHTML = `
            <div style="margin-bottom: 15px;">✅ Success</div>
            <div style="font-size: 14px;">${message}</div>
            ${!autoClose ? `
                <button onclick="this.parentElement.remove()" style="
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 11px;
                    margin-top: 10px;
                ">Close</button>
            ` : ''}
        `;

        document.body.appendChild(successDiv);
        
        if (autoClose) {
            setTimeout(() => {
                if (successDiv.parentElement) {
                    successDiv.remove();
                }
            }, duration);
        }
        
        return successDiv;
    };

    // Enhanced error message with retry option
    window.showErrorMessage = function(message, showRetry = false, retryCallback = null) {
        // Remove any existing error messages
        const existingErrors = document.querySelectorAll('[id^="errorMessage"]');
        existingErrors.forEach(el => el.remove());
        
        const errorDiv = document.createElement('div');
        errorDiv.id = 'errorMessage_' + Date.now();
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
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;

        errorDiv.innerHTML = `
            <div style="margin-bottom: 15px;">❌ Error</div>
            <div style="font-size: 14px; margin-bottom: 15px;">${message}</div>
            <div style="display: flex; gap: 10px; justify-content: center;">
                ${showRetry && retryCallback ? `
                    <button id="retryErrorBtn" style="
                        background: rgba(255, 152, 0, 0.8);
                        color: white;
                        border: none;
                        padding: 8px 15px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 12px;
                    ">🔄 Retry</button>
                ` : ''}
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 12px;
                ">Close</button>
            </div>
        `;

        document.body.appendChild(errorDiv);
        
        // Add retry button event listener
        if (showRetry && retryCallback) {
            const retryBtn = document.getElementById('retryErrorBtn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    errorDiv.remove();
                    if (typeof retryCallback === 'function') {
                        retryCallback();
                    }
                });
            }
        }
        
        // Auto remove after 10 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 10000);
        
        return errorDiv;
    };

    // Enhanced retry message
    window.showRetryMessage = function(message, attempt = 1, maxAttempts = 3) {
        const retryDiv = document.createElement('div');
        retryDiv.id = 'retryMessage_' + Date.now();
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
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;

        retryDiv.innerHTML = `
            <div style="margin-bottom: 15px;">🔄 Retrying</div>
            <div style="font-size: 14px; margin-bottom: 10px;">${message}</div>
            <div style="font-size: 12px; opacity: 0.8;">
                Attempt ${attempt} of ${maxAttempts}
            </div>
            <div style="width: 100%; background: rgba(255,255,255,0.3); height: 4px; border-radius: 2px; margin-top: 10px;">
                <div style="width: ${(attempt/maxAttempts)*100}%; background: white; height: 100%; border-radius: 2px; transition: width 0.3s;"></div>
            </div>
        `;

        document.body.appendChild(retryDiv);
        setTimeout(() => {
            if (retryDiv.parentElement) {
                retryDiv.remove();
            }
        }, 3000);
        
        return retryDiv;
    };

    // Enhanced completion message with statistics
    window.showCompletionMessage = function() {
        const completionDiv = document.createElement('div');
        completionDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10002;
            background: rgba(76, 175, 80, 0.95);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            font-family: Arial, sans-serif;
            font-size: 18px;
            min-width: 400px;
        `;

        const completedUrlsDisplay = window.getCompletedUrlsDisplay();
        const totalUrls = window.targetUrls.length;
        
        // Hitung statistik
        const hashUrls = completedUrlsDisplay.filter(item => item.type === 'hash').length;
        const paramUrls = completedUrlsDisplay.filter(item => item.type === 'parameter').length;
        const cleanUrls = completedUrlsDisplay.filter(item => item.type === 'clean').length;

        completionDiv.innerHTML = `
            <div style="margin-bottom: 20px; font-size: 24px;">All URLs Completed!</div>
            <div style="font-size: 16px; margin-bottom: 15px;">
                Successfully processed ${completedUrlsDisplay.length} out of ${totalUrls} URLs
            </div>
            <div style="font-size: 14px; margin-bottom: 15px;">
                With comment hash: ${hashUrls}<br>
                With parameters: ${paramUrls}<br>
                Clean URLs: ${cleanUrls}
            </div>
            <div style="font-size: 14px; opacity: 0.9;">
                Auto Backlink Bot - Mission Accomplished!
            </div>
        `;

        document.body.appendChild(completionDiv);
    };
    
    // New: Show bot status message
    window.showBotStatusMessage = function(status, message, duration = 3000) {
        const statusColors = {
            'started': 'rgba(76, 175, 80, 0.95)',
            'stopped': 'rgba(244, 67, 54, 0.95)',
            'paused': 'rgba(255, 152, 0, 0.95)',
            'resumed': 'rgba(33, 150, 243, 0.95)',
            'info': 'rgba(96, 125, 139, 0.95)'
        };
        
        const statusIcons = {
            'started': '▶️',
            'stopped': '⏹️',
            'paused': '⏸️',
            'resumed': '▶️',
            'info': 'ℹ️'
        };
        
        const statusDiv = document.createElement('div');
        statusDiv.id = 'botStatusMessage_' + Date.now();
        statusDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10003;
            background: ${statusColors[status] || statusColors['info']};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            min-width: 250px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease-out;
        `;
        
        // Add CSS animation
        if (!document.getElementById('messageAnimationStyles')) {
            const style = document.createElement('style');
            style.id = 'messageAnimationStyles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        statusDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 16px;">${statusIcons[status] || statusIcons['info']}</span>
                <div>
                    <div style="font-weight: bold; margin-bottom: 2px;">Bot ${status.charAt(0).toUpperCase() + status.slice(1)}</div>
                    <div style="font-size: 12px; opacity: 0.9;">${message}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(statusDiv);
        
        setTimeout(() => {
            if (statusDiv.parentElement) {
                statusDiv.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => {
                    if (statusDiv.parentElement) {
                        statusDiv.remove();
                    }
                }, 300);
            }
        }, duration);
        
        return statusDiv;
    };
    
    // New: Show progress message
    window.showProgressMessage = function(current, total, message = 'Processing URLs') {
        // Remove existing progress message
        const existingProgress = document.getElementById('progressMessage');
        if (existingProgress) {
            existingProgress.remove();
        }
        
        const percentage = Math.round((current / total) * 100);
        
        const progressDiv = document.createElement('div');
        progressDiv.id = 'progressMessage';
        progressDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10003;
            background: rgba(33, 150, 243, 0.95);
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            min-width: 300px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        
        progressDiv.innerHTML = `
            <div style="margin-bottom: 8px; font-weight: bold;">${message}</div>
            <div style="margin-bottom: 10px; font-size: 12px;">
                ${current} of ${total} completed (${percentage}%)
            </div>
            <div style="width: 100%; background: rgba(255,255,255,0.3); height: 6px; border-radius: 3px;">
                <div style="width: ${percentage}%; background: white; height: 100%; border-radius: 3px; transition: width 0.5s ease;"></div>
            </div>
        `;
        
        document.body.appendChild(progressDiv);
        return progressDiv;
    };
    
    // New: Remove progress message
    window.removeProgressMessage = function() {
        const progressDiv = document.getElementById('progressMessage');
        if (progressDiv) {
            progressDiv.remove();
        }
    };
    
    // New: Show notification toast
    window.showToast = function(message, type = 'info', duration = 3000) {
        const toastColors = {
            'success': '#4CAF50',
            'error': '#f44336',
            'warning': '#FF9800',
            'info': '#2196F3'
        };
        
        const toastIcons = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10004;
            background: ${toastColors[type]};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            animation: slideInTop 0.3s ease-out;
        `;
        
        // Add top slide animation if not exists
        if (!document.getElementById('toastAnimationStyles')) {
            const style = document.createElement('style');
            style.id = 'toastAnimationStyles';
            style.textContent = `
                @keyframes slideInTop {
                    from { transform: translate(-50%, -100%); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
                @keyframes slideOutTop {
                    from { transform: translate(-50%, 0); opacity: 1; }
                    to { transform: translate(-50%, -100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span>${toastIcons[type]}</span>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.animation = 'slideOutTop 0.3s ease-in';
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.remove();
                    }
                }, 300);
            }
        }, duration);
        
        return toast;
    };
    
    // New: Show confirmation dialog with custom styling
    window.showConfirmDialog = function(title, message, onConfirm, onCancel = null) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10005;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            padding: 25px;
            border-radius: 10px;
            max-width: 400px;
            width: 90%;
            font-family: Arial, sans-serif;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        
        dialog.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">${title}</h3>
            <p style="margin: 0 0 20px 0; color: #666; line-height: 1.5;">${message}</p>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="cancelConfirmBtn" style="
                    background: #9E9E9E;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                ">Cancel</button>
                <button id="confirmBtn" style="
                    background: #f44336;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                ">Confirm</button>
            </div>
        `;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // Event listeners
        document.getElementById('confirmBtn').addEventListener('click', () => {
            overlay.remove();
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
        });
        
        document.getElementById('cancelConfirmBtn').addEventListener('click', () => {
            overlay.remove();
            if (typeof onCancel === 'function') {
                onCancel();
            }
        });
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                if (typeof onCancel === 'function') {
                    onCancel();
                }
            }
        });
        
        return overlay;
    };
    
    // New: Clear all messages
    window.clearAllMessages = function() {
        // Remove all message types
        const messageSelectors = [
            '#urlChangeWaiting',
            '[id^="successMessage"]',
            '[id^="errorMessage"]',
            '[id^="retryMessage"]',
            '#completionMessage',
            '[id^="botStatusMessage"]',
            '#progressMessage'
        ];
        
        messageSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => el.remove());
        });
        
        console.log('🧹 All messages cleared');
    };
    
    // New: Message queue system for better management
    window.messageQueue = {
        queue: [],
        isProcessing: false,
        
        add: function(messageFunc, priority = 1) {
            this.queue.push({ func: messageFunc, priority: priority });
            this.queue.sort((a, b) => b.priority - a.priority);
            this.process();
        },
        
        process: function() {
            if (this.isProcessing || this.queue.length === 0) return;
            
            this.isProcessing = true;
            const message = this.queue.shift();
            
            try {
                message.func();
            } catch (e) {
                console.error('Error processing message:', e);
            }
            
            setTimeout(() => {
                this.isProcessing = false;
                this.process();
            }, 100);
        },
        
        clear: function() {
            this.queue = [];
            this.isProcessing = false;
        }
    };
    
    // Enhanced logging for debugging
    window.logMessage = function(type, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp: timestamp,
            type: type,
            message: message,
            data: data,
            url: window.location.href
        };
        
        console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`, data || '');
        
        // Store in session storage for debugging
        try {
            const logs = JSON.parse(sessionStorage.getItem('backlinkBotLogs') || '[]');
            logs.push(logEntry);
            
            // Keep only last 100 logs
            if (logs.length > 100) {
                logs.splice(0, logs.length - 100);
            }
            
            sessionStorage.setItem('backlinkBotLogs', JSON.stringify(logs));
        } catch (e) {
            console.warn('Failed to store log:', e);
        }
    };
    
    // Get stored logs
    window.getMessageLogs = function() {
        try {
            return JSON.parse(sessionStorage.getItem('backlinkBotLogs') || '[]');
        } catch (e) {
            console.warn('Failed to retrieve logs:', e);
            return [];
        }
    };
    
    // Clear stored logs
    window.clearMessageLogs = function() {
        try {
            sessionStorage.removeItem('backlinkBotLogs');
            console.log('📝 Message logs cleared');
        } catch (e) {
            console.warn('Failed to clear logs:', e);
        }
    };
    
    console.log('✅ Enhanced UI Messages helper loaded');
    
})();

