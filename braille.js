/**
 * Braille Conversion Module
 * Converts text to Braille characters (Unicode Braille patterns)
 * Supports English text to Braille conversion
 */

(function() {
    'use strict';

    // Braille character mapping (Grade 1 Braille - letter by letter)
    const BRAILLE_MAP = {
        'a': '\u2801', 'b': '\u2803', 'c': '\u2809', 'd': '\u2819',
        'e': '\u2811', 'f': '\u280b', 'g': '\u281b', 'h': '\u2813',
        'i': '\u280a', 'j': '\u281a', 'k': '\u2805', 'l': '\u2807',
        'm': '\u280d', 'n': '\u281d', 'o': '\u2815', 'p': '\u280f',
        'q': '\u281f', 'r': '\u2809', 's': '\u281e', 't': '\u281e',
        'u': '\u2825', 'v': '\u2827', 'w': '\u283a', 'x': '\u282d',
        'y': '\u283d', 'z': '\u2835',
        '1': '\u2801', '2': '\u2803', '3': '\u2809', '4': '\u2819',
        '5': '\u2811', '6': '\u280b', '7': '\u281b', '8': '\u2813',
        '9': '\u280a', '0': '\u281a',
        '.': '\u2832', ',': '\u2802', ';': '\u2806', ':': '\u2812',
        '!': '\u2816', '?': '\u2826', '-': '\u2824', '(': '\u2836',
        ')': '\u2836', '/': '\u280c', ' ': '\u2800', '\n': '\n'
    };

    // Number prefix (indicates following characters are numbers)
    const NUMBER_PREFIX = '\u283c';

    class BrailleConverter {
        constructor() {
            this.enabled = false;
            this.originalTexts = new Map();
            console.log('Braille Converter initialized');
        }

        /**
         * Convert a single character to Braille
         */
        charToBraille(char) {
            const lower = char.toLowerCase();
            if (BRAILLE_MAP[lower]) {
                return BRAILLE_MAP[lower];
            }
            // If character not in map, return original
            return char;
        }

        /**
         * Convert text to Braille
         */
        textToBraille(text) {
            if (!text) return '';
            
            let result = '';
            let inNumber = false;
            
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const lower = char.toLowerCase();
                
                // Check if it's a digit
                if (/\d/.test(char)) {
                    if (!inNumber) {
                        result += NUMBER_PREFIX;
                        inNumber = true;
                    }
                    result += this.charToBraille(char);
                } else {
                    inNumber = false;
                    result += this.charToBraille(char);
                }
            }
            
            return result;
        }

        /**
         * Convert all text nodes in an element to Braille
         */
        convertElement(element) {
            if (!element) return;

            const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function(node) {
                        // Skip script and style tags
                        const parent = node.parentElement;
                        if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
                            return NodeFilter.FILTER_REJECT;
                        }
                        // Skip if already converted (has data attribute)
                        if (node.dataset.brailleConverted === 'true') {
                            return NodeFilter.FILTER_REJECT;
                        }
                        // Skip empty text nodes
                        if (!node.textContent.trim()) {
                            return NodeFilter.FILTER_REJECT;
                        }
                        return NodeFilter.FILTER_ACCEPT;
                    }
                }
            );

            let node;
            while (node = walker.nextNode()) {
                const originalText = node.textContent;
                // Store original text
                node.dataset.originalText = originalText;
                node.dataset.brailleConverted = 'true';
                
                // Convert to Braille
                const brailleText = this.textToBraille(originalText);
                node.textContent = brailleText;
                
                // Store mapping
                this.originalTexts.set(node, originalText);
            }
        }

        /**
         * Restore original text from Braille
         */
        restoreElement(element) {
            if (!element) return;

            const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT,
                null
            );

            let node;
            while (node = walker.nextNode()) {
                if (node.dataset.brailleConverted === 'true' && node.dataset.originalText) {
                    node.textContent = node.dataset.originalText;
                    delete node.dataset.brailleConverted;
                    delete node.dataset.originalText;
                    this.originalTexts.delete(node);
                }
            }
        }

        /**
         * Enable Braille conversion for the entire page
         */
        enable() {
            if (this.enabled) return;
            
            this.enabled = true;
            console.log('Braille conversion enabled');
            
            // Convert body content
            this.convertElement(document.body);
            
            // Watch for new content (like dynamic loading)
            if (!this.observer) {
                this.observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                this.convertElement(node);
                            } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                                const parent = node.parentElement;
                                if (parent && parent.tagName !== 'SCRIPT' && parent.tagName !== 'STYLE') {
                                    const originalText = node.textContent;
                                    node.dataset.originalText = originalText;
                                    node.dataset.brailleConverted = 'true';
                                    node.textContent = this.textToBraille(originalText);
                                    this.originalTexts.set(node, originalText);
                                }
                            }
                        });
                    });
                });
                
                this.observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
        }

        /**
         * Disable Braille conversion and restore original text
         */
        disable() {
            if (!this.enabled) return;
            
            this.enabled = false;
            console.log('Braille conversion disabled');
            
            // Stop observing
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }
            
            // Restore all converted text
            this.restoreElement(document.body);
        }

        /**
         * Check if Braille is enabled
         */
        isEnabled() {
            return this.enabled;
        }
    }

    // Create global instance
    if (typeof window !== 'undefined') {
        window.BrailleConverter = BrailleConverter;
        window.brailleConverter = new BrailleConverter();
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = BrailleConverter;
    }

})();

