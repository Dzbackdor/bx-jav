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

            for (let category in window.checkboxSelectors) {
                for (let selector of window.checkboxSelectors[category]) {
                    if (checkbox.matches(selector)) {
                        foundCheckboxes[category].push(checkbox);
                        categorized = true;
                        console.log(`📋 Categorized checkbox as ${category}:`, {
                            id: checkbox.id,
                            name: checkbox.name,
                            selector: selector
                        });
                        break;
                    }
                }
                if (categorized) break;
            }

            if (!categorized) {
                foundCheckboxes.other.push(checkbox);
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
                }
            });
        }

        console.log(`📋 Checkbox handling completed. Handled ${handledCount} checkboxes.`);
        return true;
    };
    
})();