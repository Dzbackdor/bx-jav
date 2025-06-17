// UI Messages Helper - Enhanced
(function() {
    'use strict';
    
    // Enhanced waiting message with better animation
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
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 16px;
            min-width: 320px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        `;

        let dotCount = 0;
        function updateMessage() {
            if (!document.getElementById('urlChangeWaiting')) return;
            dotCount = (dotCount + 1) % 4;
            const dots = '.'.repeat(dotCount);
            const spaces = '\u00A0'.repeat(3 - dotCount); // Non-breaking spaces
            
            waitingDiv.innerHTML = `
                <div style="margin-bottom: 15px; font-size: 18px;">⏳ Processing Comment</div>
                <div style="font-size: 14px;">Waiting for confirmation${dots}${spaces}</div>
                <div style="font-size: 12px; margin-top: 10px; opacity: 0.8;">
                    ${customMessage || 'Monitoring for success/error...'}
                </div>
            `;
            setTimeout(updateMessage, 500);
        }

        updateMessage();
        document.body.appendChild(waitingDiv);
        
        // Add to activity log if available
        if (typeof window.addLogEntry === 'function') {
            window.addLogEntry('⏳ Showing waiting message');
        }
        
        return waitingDiv;
    };

    window.removeWaitingMessage = function() {
        const waitingDiv = document.getElementById('urlChangeWaiting');
        if (waitingDiv) {
            waitingDiv.style.opacity = '0';
            waitingDiv.style.transform = 'translate(-50%, -50%) scale(0.9)';
            waitingDiv.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                if (waitingDiv.parentElement) {
                    waitingDiv.remove();
                }
            }, 300);
            
            // Add to activity log if available
            if (typeof window.addLogEntry === 'function') {
                window.addLogEntry('✅ Waiting message removed');
            }
        }
    };

    window.showSuccessMessage = function(message) {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.8);
            z-index: 10002;
            background: rgba(76, 175, 80, 0.95);
            color: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 16px;
            min-width: 320px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            opacity: 0;
            transition: all 0.3s ease;
        `;

        successDiv.innerHTML = `
            <div style="margin-bottom: 15px; font-size: 24px;">✅ Success</div>
            <div style="font-size: 14px; line-height: 1.4;">${message}</div>
        `;

        document.body.appendChild(successDiv);
        
        // Animate in
        setTimeout(() => {
            successDiv.style.opacity = '1';
            successDiv.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 10);

        // Update stats if available
        if (typeof window.updateCommentStats === 'function') {
            window.updateCommentStats('success');
        }
        
        // Add to activity log if available
        if (typeof window.addLogEntry === 'function') {
            window.addLogEntry(`✅ Success: ${message}`);
        }

        setTimeout(() => {
            if (successDiv.parentElement) {
                successDiv.style.opacity = '0';
                successDiv.style.transform = 'translate(-50%, -50%) scale(0.8)';
                setTimeout(() => {
                    if (successDiv.parentElement) {
                        successDiv.remove();
                    }
                }, 300);
            }
        }, 5000);
    };

    window.showErrorMessage = function(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.8);
            z-index: 10002;
            background: rgba(244, 67, 54, 0.95);
            color: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 16px;
            min-width: 320px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            opacity: 0;
            transition: all 0.3s ease;
        `;

        errorDiv.innerHTML = `
            <div style="margin-bottom: 15px; font-size: 24px;">❌ Error</div>
            <div style="font-size: 14px; line-height: 1.4;">${message}</div>
        `;

        document.body.appendChild(errorDiv);
        
        // Animate in
        setTimeout(() => {
            errorDiv.style.opacity = '1';
            errorDiv.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 10);

        // Update stats if available
        if (typeof window.updateCommentStats === 'function') {
            window.updateCommentStats('failed');
        }
        
        // Add to activity log if available
        if (typeof window.addLogEntry === 'function') {
            window.addLogEntry(`❌ Error: ${message}`);
        }

        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.style.opacity = '0';
                errorDiv.style.transform = 'translate(-50%, -50%) scale(0.8)';
                setTimeout(() => {
                    if (errorDiv.parentElement) {
                        errorDiv.remove();
                    }
                }, 300);
            }
        }, 8000);
    };

    window.showRetryMessage = function(message) {
        const retryDiv = document.createElement('div');
        retryDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.8);
            z-index: 10002;
            background: rgba(255, 152, 0, 0.95);
            color: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 16px;
            min-width: 320px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            opacity: 0;
            transition: all 0.3s ease;
        `;

        retryDiv.innerHTML = `
            <div style="margin-bottom: 15px; font-size: 24px;">🔄 Retrying</div>
            <div style="font-size: 14px; line-height: 1.4;">${message}</div>
        `;

        document.body.appendChild(retryDiv);
        
        // Animate in
        setTimeout(() => {
            retryDiv.style.opacity = '1';
            retryDiv.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 10);
        
        // Add to activity log if available
        if (typeof window.addLogEntry === 'function') {
            window.addLogEntry(`🔄 Retry: ${message}`);
        }

        setTimeout(() => {
            if (retryDiv.parentElement) {
                retryDiv.style.opacity = '0';
                retryDiv.style.transform = 'translate(-50%, -50%) scale(0.8)';
                setTimeout(() => {
                    if (retryDiv.parentElement) {
                        retryDiv.remove();
                    }
                }, 300);
            }
        }, 5000);
    };

    window.showCompletionMessage = function() {
        const completionDiv = document.createElement('div');
        completionDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.8);
            z-index: 10002;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 35px;
            border-radius: 15px;
            text-align: center;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 18px;
            min-width: 450px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.4);
            backdrop-filter: blur(15px);
            border: 2px solid rgba(255,255,255,0.3);
            opacity: 0;
            transition: all 0.4s ease;
        `;

        const completedUrls = window.getCompletedUrls ? window.getCompletedUrls() : [];
        const totalUrls = window.targetUrls ? window.targetUrls.length : 0;
        const stats = window.getCommentStats ? window.getCommentStats() : { successful: 0, failed: 0 };
        
        completionDiv.innerHTML = `
            <div style="margin-bottom: 25px; font-size: 32px;">🎉 Mission Accomplished!</div>
            <div style="font-size: 18px; margin-bottom: 20px; font-weight: bold;">
                All URLs Completed Successfully!
            </div>
            <div style="background: rgba(255,255,255,0.2); border-radius: 10px; padding: 15px; margin-bottom: 20px;">
                <div style="font-size: 16px; margin-bottom: 10px;">📊 Final Statistics:</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; font-size: 14px;">
                    <div>✅ Success: ${stats.successful}</div>
                    <div>❌ Failed: ${stats.failed}</div>
                    <div>📋 Total: ${completedUrls.length}/${totalUrls}</div>
                </div>
            </div>
            <div style="font-size: 14px; opacity: 0.9; font-style: italic;">
                Auto Backlink Bot v4.0 - Thank you for using our service!
            </div>
            <div style="margin-top: 20px;">
                <button id="closeCompletionBtn" style="background: rgba(255,255,255,0.2); color: white; border: 2px solid white; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s;">
                    Close
                </button>
            </div>
        `;

        document.body.appendChild(completionDiv);
        
        // Animate in
        setTimeout(() => {
            completionDiv.style.opacity = '1';
            completionDiv.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 10);
        
        // Add to activity log if available
        if (typeof window.addLogEntry === 'function') {
            window.addLogEntry(`🎉 All ${completedUrls.length} URLs completed!`);
        }

        // Close button event
        document.getElementById('closeCompletionBtn')?.addEventListener('click', () => {
            completionDiv.style.opacity = '0';
            completionDiv.style.transform = 'translate(-50%, -50%) scale(0.8)';
            setTimeout(() => {
                if (completionDiv.parentElement) {
                    completionDiv.remove();
                }
            }, 300);
        });
    };
    
    console.log('✅ Enhanced UI Messages helper loaded');
})();
