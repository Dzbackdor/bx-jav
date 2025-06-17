// Config dan Selectors Helper
(function() {
    'use strict';
    
    // WordPress form selectors
    window.wpSelectors = [
        "#commentform",
        "#respond", 
        ".comment-form",
        "form[action*='comment']",
        "form[action*='wp-comments-post']"
    ];
    
    // Submit button selectors
    window.submitSelectors = [
        'input[type="submit"]',
        'button[type="submit"]',
        'input[name="submit"]',
        '#submit',
        '.submit',
        'button.submit',
        'input.submit',
        '.tipi-button',
        'button[name="submit"]',
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
        
        // Newsletter subscriptions
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
    
})();