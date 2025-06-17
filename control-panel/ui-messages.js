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

        const completedUrls = window.getCompletedUrls();
        completionDiv.innerHTML = `
            <div style="margin-bottom: 20px; font-size: 24px;">🎉 All URLs Completed!</div>
            <div style="font-size: 16px; margin-bottom: 15px;">
                Successfully processed ${completedUrls.length} out of ${window.targetUrls.length} URLs
            </div>
            <div style="font-size: 14px; opacity: 0.9;">
                Auto Backlink Bot - Mission Accomplished!
            </div>
        `;

        document.body.appendChild(completionDiv);
    };
    
})();