// Checkbox Handling Helper
(function() {
    'use strict';
    
    // Find and categorize checkboxes
    window.findCheckboxes = function(form) {
        const foundCheckboxes = {
            wpCommentCookies: [],
            privacy: [],
            terms: [],
            newsletter: [],
            consent: [],
            other: []
        };

        const allCheckboxes = form.querySelectorAll('input[type="checkbox"]');
        console.log(`🔍 Found ${allCheckboxes.length} checkboxes in form`);

        allCheckboxes.forEach(checkbox => {
            let categorized = false;

            // Check each category
            for (let category in window.checkboxSelectors) {
                for (let selector of window.checkboxSelectors[category]) {
                    if (checkbox.matches(selector)) {
                        foundCheckboxes[category].push(checkbox);
                        categorized = true;
                        console.log(`📋 Categorized checkbox as ${category}:`, {
                            id: checkbox.id,
                            name: checkbox.name,
                            value: checkbox.value,
                            selector: selector
                        });
                        break;
                    }
                }
                if (categorized) break;
            }

            // If not categorized, add to 'other'
            if (!categorized) {
                foundCheckboxes.other.push(checkbox);
                console.log('📋 Uncategorized checkbox:', {
                    id: checkbox.id,
                    name: checkbox.name,
                    value: checkbox.value,
                    text: checkbox.parentElement ? checkbox.parentElement.textContent.trim().substring(0, 100) : 'No parent text'
                });
            }
        });

        return foundCheckboxes;
    };

    // Handle checkboxes based on configuration
    window.handleCheckboxes = function(form) {
        if (!window.commentConfig.handleCheckboxes) {
            console.log('📋 Checkbox handling disabled');
            return true;
        }

        console.log('📋 Starting checkbox handling...');

        const checkboxes = window.findCheckboxes(form);
        let handledCount = 0;

        // Handle WordPress comment cookies consent
        if (window.commentConfig.autoCheckConsent && checkboxes.wpCommentCookies.length > 0) {
            checkboxes.wpCommentCookies.forEach(checkbox => {
                if (!checkbox.checked) {
                    checkbox.checked = true;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log('✅ Checked WordPress comment cookies consent:', checkbox.id || checkbox.name);
                    handledCount++;

                    // Highlight the checkbox
                    checkbox.style.outline = '2px solid #4CAF50';
                    setTimeout(() => {
                        if (checkbox.style) checkbox.style.outline = '';
                    }, 2000);
                }
            });
        }

        // Handle privacy policy checkboxes
        if (window.commentConfig.autoCheckPrivacy && checkboxes.privacy.length > 0) {
            checkboxes.privacy.forEach(checkbox => {
                if (!checkbox.checked) {
                    checkbox.checked = true;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log('✅ Checked privacy policy consent:', checkbox.id || checkbox.name);
                    handledCount++;

                    checkbox.style.outline = '2px solid #2196F3';
                    setTimeout(() => {
                        if (checkbox.style) checkbox.style.outline = '';
                    }, 2000);
                }
            });
        }

        // Handle terms and conditions
        if (window.commentConfig.autoCheckTerms && checkboxes.terms.length > 0) {
            checkboxes.terms.forEach(checkbox => {
                if (!checkbox.checked) {
                    checkbox.checked = true;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log('✅ Checked terms and conditions:', checkbox.id || checkbox.name);
                    handledCount++;

                    checkbox.style.outline = '2px solid #FF9800';
                    setTimeout(() => {
                        if (checkbox.style) checkbox.style.outline = '';
                    }, 2000);
                }
            });
        }

        // Handle general consent checkboxes
        if (window.commentConfig.autoCheckConsent && checkboxes.consent.length > 0) {
            checkboxes.consent.forEach(checkbox => {
                if (!checkbox.checked) {
                    checkbox.checked = true;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log('✅ Checked general consent:', checkbox.id || checkbox.name);
                    handledCount++;

                    checkbox.style.outline = '2px solid #9C27B0';
                    setTimeout(() => {
                        if (checkbox.style) checkbox.style.outline = '';
                    }, 2000);
                }
            });
        }

        // Handle newsletter subscriptions (usually skip these)
        if (window.commentConfig.autoCheckNewsletter && checkboxes.newsletter.length > 0) {
            checkboxes.newsletter.forEach(checkbox => {
                if (!checkbox.checked) {
                    checkbox.checked = true;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log('✅ Checked newsletter subscription:', checkbox.id || checkbox.name);
                    handledCount++;
                }
            });
        } else if (checkboxes.newsletter.length > 0) {
            console.log('📋 Skipping newsletter checkboxes (auto-check disabled)');
        }

        // Handle uncategorized checkboxes with caution
        if (checkboxes.other.length > 0) {
            console.log('⚠️ Found uncategorized checkboxes:', checkboxes.other.length);

            checkboxes.other.forEach(checkbox => {
                const parentText = checkbox.parentElement ?
                    checkbox.parentElement.textContent.toLowerCase() : '';

                const consentKeywords = ['agree', 'accept', 'consent', 'policy', 'terms', 'gdpr'];
                const newsletterKeywords = ['newsletter', 'subscribe', 'marketing', 'email', 'updates'];

                const isConsentRelated = consentKeywords.some(keyword =>
                    parentText.includes(keyword) ||
                    (checkbox.name && checkbox.name.toLowerCase().includes(keyword)) ||
                    (checkbox.id && checkbox.id.toLowerCase().includes(keyword))
                );

                const isNewsletterRelated = newsletterKeywords.some(keyword =>
                    parentText.includes(keyword) ||
                    (checkbox.name && checkbox.name.toLowerCase().includes(keyword)) ||
                    (checkbox.id && checkbox.id.toLowerCase().includes(keyword))
                );

                if (isConsentRelated && !isNewsletterRelated) {
                    if (!checkbox.checked) {
                        checkbox.checked = true;
                        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                        console.log('✅ Checked uncategorized consent checkbox:', {
                                                        id: checkbox.id,
                            name: checkbox.name,
                            text: parentText.substring(0, 50)
                        });
                        handledCount++;

                        // Highlight with different color for uncategorized
                        checkbox.style.outline = '2px solid #607D8B';
                        setTimeout(() => {
                            if (checkbox.style) checkbox.style.outline = '';
                        }, 2000);
                    }
                } else {
                    console.log('⚠️ Skipping uncategorized checkbox (not consent-related):', {
                        id: checkbox.id,
                        name: checkbox.name,
                        text: parentText.substring(0, 50)
                    });
                }
            });
        }

        console.log(`📋 Checkbox handling completed. Handled ${handledCount} checkboxes.`);

        // Show checkbox handling status
        if (handledCount > 0) {
            showCheckboxMessage(`✅ Handled ${handledCount} consent checkbox${handledCount > 1 ? 'es' : ''}`);
        }

        return true;
    };

    // Show checkbox handling message
    function showCheckboxMessage(message) {
        const checkboxDiv = document.createElement('div');
        checkboxDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10001;
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            text-align: center;
        `;

        checkboxDiv.innerHTML = `📋 ${message}`;
        document.body.appendChild(checkboxDiv);

        setTimeout(() => {
            if (checkboxDiv.parentElement) {
                checkboxDiv.remove();
            }
        }, 3000);
    }
    
    console.log('✅ Checkbox Handling helper loaded');
    
})();

