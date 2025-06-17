// Configuration and Selectors Helper
(function() {
    'use strict';
    
    // WordPress form selectors
    window.wpSelectors = [
        '#commentform',
        'form[action*="wp-comments-post"]',
        '.comment-form',
        '.wp-comment-form',
        'form#comment-form',
        'form.comment-form',
        '#respond form'
    ];
    
    // Submit button selectors
    window.submitSelectors = [
        'input[type="submit"]',
        'button[type="submit"]',
        'input[name="submit"]',
        'button[name="submit"]',
        '.submit-button',
        '#submit',
        'button:contains("Submit")',
        'button:contains("Post Comment")',
        'input[value*="Submit"]',
        'input[value*="Post"]',
        '.tipi-button',
        'button.submit',
        'input.submit',
        '[value="Submit"]',
        '[value="Post Comment"]',
        '[value="Send"]'
    ];
    
    // Checkbox selectors untuk berbagai jenis consent
    window.checkboxSelectors = {
        // WordPress comment cookies consent
        wpCommentCookies: [
            '#wp-comment-cookies-consent',
            'input[name="wp-comment-cookies-consent"]',
            'input[id*="comment-cookies"]',
            'input[name*="comment-cookies"]'
        ],

        // Privacy policy checkboxes
        privacy: [
            'input[name*="privacy"]',
            'input[id*="privacy"]',
            'input[name*="policy"]',
            'input[id*="policy"]',
            'input[name*="gdpr"]',
            'input[id*="gdpr"]'
        ],

        // Terms and conditions
        terms: [
            'input[name*="terms"]',
            'input[id*="terms"]',
            'input[name*="condition"]',
            'input[id*="condition"]',
            'input[name*="agree"]',
            'input[id*="agree"]'
        ],

        // Newsletter subscriptions (usually we don't want to auto-check these)
        newsletter: [
            'input[name*="newsletter"]',
            'input[id*="newsletter"]',
            'input[name*="subscribe"]',
            'input[id*="subscribe"]',
            'input[name*="marketing"]',
            'input[id*="marketing"]'
        ],

        // General consent checkboxes
        consent: [
            'input[name*="consent"]',
            'input[id*="consent"]',
            'input[name*="accept"]',
            'input[id*="accept"]'
        ]
    };
    
    console.log('✅ Config & Selectors helper loaded');
    
})();
