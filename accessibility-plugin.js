/**
 * Accessibility Plugin - Main JavaScript File
 * Provides comprehensive accessibility features including TTS, color blindness filters, and more
 * 
 * WCAG 2.2 Level AA Compliant
 * 
 * Compliance Features:
 * - 2.4.11 Focus Not Obscured (Minimum) - Focus indicators are always visible
 * - 2.5.8 Target Size (Minimum) - All interactive targets are at least 24×24px
 * - 2.5.7 Dragging Movements - No dragging required (keyboard alternatives provided)
 * - 3.2.6 Consistent Help - Help features consistently available
 * - Full keyboard navigation support
 * - Screen reader compatibility
 * - ARIA attributes and roles
 * 
 * Accessibility Widget by AirforceRP - https://airforcerp.com
 * GitHub Repository: https://github.com/airforcerp/accessibility-widget
 * Documentation: https://github.com/airforcerp/accessibility-widget/wiki
 * Support: https://github.com/airforcerp/accessibility-widget/issues
 * License: MIT
 * Version: 1.0.2
 * Last Updated: 2025-11-20
 * 
 */

(function() {
    'use strict';
    
    // Isolate from browser extensions and other scripts
    const ACCESSIBILITY_NAMESPACE = 'accessibilityPlugin';
    window[ACCESSIBILITY_NAMESPACE] = window[ACCESSIBILITY_NAMESPACE] || {};

    // Default settings
    const defaultSettings = {
        fontSize: 100, // percentage
        contrast: 'normal', // normal, high, dark
        lineHeight: 'normal', // normal, large
        letterSpacing: 'normal', // normal, wide
        fontFamily: 'default', // default, sans-serif, serif, monospace, braille
        ttsVoice: '', // TTS voice name
        ttsLanguage: 'en', // TTS language: en, es, de, fr, zh, ko, no
        colorBlindness: 'none', // none, protanopia, deuteranopia, tritanopia, achromatopsia
        focusIndicator: false, // true/false
        readingGuide: false, // true/false
        stopAnimations: false, // true/false
        underlineLinks: false, // true/false
        showImageAlt: false, // true/false
        ttsEnabled: false, // true/false
        ttsRate: 1.0, // 0.5 to 2.0
        ttsPitch: 1.0, // 0 to 2.0
        ttsVolume: 1.0, // 0 to 1.0
        readingMask: false, // true/false - overlay that hides text below
        textHighlight: false, // true/false - highlight text as you read
        brailleEnabled: false, // true/false - convert text to Braille
        position: 'bottom-right', // bottom-left, bottom-right
        buttonText: 'Accessibility',
        showReset: true
    };

    // Merge user config with defaults
    let settings = { ...defaultSettings };
    if (typeof AccessibilityConfig !== 'undefined') {
        settings = { ...defaultSettings, ...AccessibilityConfig };
    }

    // State management
    let currentState = {
        fontSize: settings.fontSize,
        contrast: settings.contrast,
        lineHeight: settings.lineHeight,
        letterSpacing: settings.letterSpacing,
        fontFamily: settings.fontFamily,
        colorBlindness: settings.colorBlindness,
        focusIndicator: settings.focusIndicator,
        readingGuide: settings.readingGuide,
        stopAnimations: settings.stopAnimations,
        underlineLinks: settings.underlineLinks,
        showImageAlt: settings.showImageAlt,
        ttsEnabled: settings.ttsEnabled,
        ttsRate: settings.ttsRate,
        ttsPitch: settings.ttsPitch,
        ttsVolume: settings.ttsVolume,
        ttsVoice: settings.ttsVoice || '',
        ttsLanguage: settings.ttsLanguage || 'en',
        readingMask: settings.readingMask || false,
        textHighlight: settings.textHighlight || false,
        brailleEnabled: settings.brailleEnabled || false
    };

    // TTS variables
    let speechSynthesis = null;
    let currentUtterance = null;
    let isSpeaking = false;
    let selectedText = '';
    let availableVoices = [];
    let ttsHighlightElements = [];
    let ttsCurrentWordIndex = 0;
    let ttsWords = [];
    let ttsManager = null; // TTS Manager instance
    let currentTTSLanguage = 'en'; // Current TTS language

    // Reading guide variables
    let readingGuideElement = null;
    let readingGuideActive = false;
    let moveReadingGuideHandler = null;
    let readingGuideClickHandler = null;
    let readingGuideClickTimes = [];
    let readingGuideClickTimeout = null;

    // Reading mask variables
    let readingMaskElement = null;
    let readingMaskActive = false;
    let readingMaskHandler = null;
    let readingMaskHeight = 3; // lines of text to show

    // Text highlight variables
    let textHighlightActive = false;
    let highlightOverlay = null;
    let highlightHandler = null;

    // Braille variables
    let brailleEnabled = false;

    // Initialize TTS
    function initTTS() {
        console.log('Initializing TTS...');
        
        // Wait a bit for tts.js to load if it's being loaded
        if (typeof window !== 'undefined' && !window.ttsManager) {
            // Check if tts.js is being loaded
            setTimeout(() => {
                initTTS();
            }, 100);
            return;
        }
        
        // Use TTS Manager if available
        if (typeof window !== 'undefined' && window.ttsManager) {
            console.log('TTS Manager found, using it');
            ttsManager = window.ttsManager;
            
            // Wait for synthesis to be available
            if (ttsManager.synthesis) {
                speechSynthesis = ttsManager.synthesis;
            } else if ('speechSynthesis' in window) {
                speechSynthesis = window.speechSynthesis;
                ttsManager.synthesis = speechSynthesis;
            }
            
            availableVoices = ttsManager.availableVoices || [];
            
            // Set up callbacks
            ttsManager.onLanguageChange = function(lang, name) {
                currentTTSLanguage = lang;
                updateLanguageDropdown();
            };
            
            ttsManager.onVoiceChange = function() {
                updateVoiceDropdown();
            };
            
            // Load voices
            if (ttsManager.availableVoices.length === 0) {
                ttsManager.loadVoices();
                // Also try loading after a delay
                setTimeout(() => {
                    ttsManager.loadVoices();
                    availableVoices = ttsManager.availableVoices || [];
                }, 500);
            }
            
            // Set initial language from settings or detect from page
            if (settings.ttsLanguage) {
                ttsManager.setLanguage(settings.ttsLanguage);
            } else {
                // Detect from page language
                const pageLang = document.documentElement.lang || 'en';
                const langCode = pageLang.split('-')[0].toLowerCase();
                if (ttsManager.getAvailableLanguages().some(l => l.code === langCode)) {
                    ttsManager.setLanguage(langCode);
                }
            }
            
            console.log('TTS Manager initialized:', ttsManager.isAvailable() ? 'Available' : 'Not Available');
        } else if ('speechSynthesis' in window) {
            console.log('Using fallback TTS implementation');
            // Fallback to original TTS implementation
            speechSynthesis = window.speechSynthesis;
            loadVoices();
            // Some browsers load voices asynchronously
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = function() {
                    loadVoices();
                    // Update voice dropdown if panel is open
                    updateVoiceDropdown();
                };
            }
            // Also try loading voices after a delay
            setTimeout(loadVoices, 500);
            console.log('Fallback TTS initialized');
        } else {
            console.warn('Speech Synthesis API not available in this browser');
        }
    }

    // Load available TTS voices
    function loadVoices() {
        if (speechSynthesis) {
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                availableVoices = voices;
                console.log('Loaded', voices.length, 'TTS voices');
                // Update voice dropdown if panel exists
                updateVoiceDropdown();
            } else {
                console.warn('No voices available yet, will retry...');
                // Retry after a delay
                setTimeout(() => {
                    const retryVoices = speechSynthesis.getVoices();
                    if (retryVoices.length > 0) {
                        availableVoices = retryVoices;
                        console.log('Loaded', retryVoices.length, 'TTS voices on retry');
                        updateVoiceDropdown();
                    }
                }, 1000);
            }
        } else if (ttsManager && ttsManager.synthesis) {
            // Use TTS Manager voices
            ttsManager.loadVoices();
            availableVoices = ttsManager.availableVoices || [];
            console.log('Loaded', availableVoices.length, 'TTS voices from TTS Manager');
            updateVoiceDropdown();
        }
    }

    // Update voice dropdown when voices are loaded
    function updateVoiceDropdown() {
        const panel = document.getElementById('accessibility-panel');
        if (!panel) return;
        
        const ttsVoiceSelect = panel.querySelector('select[aria-label="TTS Voice"]');
        if (!ttsVoiceSelect) return;
        
        // Get current voices - try multiple sources
        let voices = [];
        if (ttsManager && ttsManager.availableVoices && ttsManager.availableVoices.length > 0) {
            voices = ttsManager.availableVoices;
            availableVoices = voices;
            console.log('Updating voice dropdown from TTS Manager:', voices.length, 'voices');
        } else if (availableVoices && availableVoices.length > 0) {
            voices = availableVoices;
            console.log('Updating voice dropdown from availableVoices:', voices.length, 'voices');
        } else if (speechSynthesis) {
            voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                availableVoices = voices;
                console.log('Updating voice dropdown from speechSynthesis:', voices.length, 'voices');
            }
        }
        
        if (voices.length > 0) {
            const currentValue = ttsVoiceSelect.value;
            const options = getVoiceOptions();
            ttsVoiceSelect.innerHTML = '';
            options.forEach(option => {
                const optionEl = document.createElement('option');
                optionEl.value = option.value;
                optionEl.textContent = option.label;
                if (option.value === currentValue || (!currentValue && option.value === '')) {
                    optionEl.selected = true;
                }
                ttsVoiceSelect.appendChild(optionEl);
            });
            console.log('Voice dropdown updated with', options.length, 'options');
        } else {
            console.warn('No voices available to update dropdown');
        }
    }

    // Load saved preferences from localStorage
    function loadPreferences() {
        const saved = localStorage.getItem('accessibilityPluginSettings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                currentState = { ...currentState, ...parsed };
                applySettings();
            } catch (e) {
                console.warn('Failed to load accessibility preferences:', e);
            }
        }
    }

    // Save preferences to localStorage
    function savePreferences() {
        localStorage.setItem('accessibilityPluginSettings', JSON.stringify(currentState));
    }

    // Color blindness filter matrices
    const colorBlindnessFilters = {
        protanopia: {
            matrix: [0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0]
        },
        deuteranopia: {
            matrix: [0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0]
        },
        tritanopia: {
            matrix: [0.95, 0.05, 0, 0, 0, 0, 0.433, 0.567, 0, 0, 0, 0.475, 0.525, 0, 0, 0, 0, 0, 1, 0]
        },
        achromatopsia: {
            matrix: [0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0, 0, 0, 1, 0]
        }
    };

    // Apply color blindness filter
    function applyColorBlindnessFilter() {
        const body = document.body;
        const filterId = 'accessibility-colorblind-filter';
        
        // Remove existing filter
        const existingFilter = document.getElementById(filterId);
        if (existingFilter) {
            existingFilter.remove();
        }

        // Remove data attribute
        body.removeAttribute('data-colorblind-filter');

        if (currentState.colorBlindness === 'none') {
            body.style.filter = '';
            return;
        }

        const filter = colorBlindnessFilters[currentState.colorBlindness];
        if (!filter) return;

        // Set data attribute for CSS targeting
        body.setAttribute('data-colorblind-filter', currentState.colorBlindness);

        // Create SVG filter
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('id', filterId);
        svg.style.position = 'absolute';
        svg.style.width = '0';
        svg.style.height = '0';
        svg.style.pointerEvents = 'none';
        svg.style.visibility = 'hidden';
        
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const filterElement = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filterElement.setAttribute('id', 'colorblind-filter');
        filterElement.setAttribute('color-interpolation-filters', 'sRGB');
        
        const feColorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
        feColorMatrix.setAttribute('type', 'matrix');
        feColorMatrix.setAttribute('values', filter.matrix.join(' '));
        
        filterElement.appendChild(feColorMatrix);
        defs.appendChild(filterElement);
        svg.appendChild(defs);
        document.body.appendChild(svg);

        // Apply filter to body but widget will be excluded via CSS
        body.style.filter = 'url(#colorblind-filter)';
        
        // Force widget to maintain position - ensure it's not affected by filter
        const widget = document.getElementById('accessibility-plugin-widget');
        if (widget) {
            // Only set filter-related properties, don't touch positioning
            widget.style.filter = 'none';
            widget.style.transform = 'translateZ(0)';
            widget.style.isolation = 'isolate';
            // Don't override position, bottom, right, left - let CSS handle it
        }
    }

    // Apply accessibility settings to the page
    function applySettings() {
        const root = document.documentElement;
        const body = document.body;

        // Font size - apply to both root CSS variable and body
        root.style.setProperty('--accessibility-font-size', currentState.fontSize + '%');
        body.style.fontSize = currentState.fontSize + '%';
        
        // Also apply to html element for better WordPress compatibility
        document.documentElement.style.fontSize = currentState.fontSize + '%';
        
        // Add class to body and html for CSS targeting (WordPress compatibility)
        const fontClasses = ['accessibility-font-75', 'accessibility-font-100', 'accessibility-font-125', 'accessibility-font-150', 'accessibility-font-200'];
        body.classList.remove(...fontClasses);
        document.documentElement.classList.remove(...fontClasses);
        body.classList.add('accessibility-font-' + currentState.fontSize);
        document.documentElement.classList.add('accessibility-font-' + currentState.fontSize);

        // Contrast - apply to both html and body for WordPress compatibility
        const contrastClasses = ['accessibility-contrast-normal', 'accessibility-contrast-high', 'accessibility-contrast-dark'];
        body.classList.remove(...contrastClasses);
        document.documentElement.classList.remove(...contrastClasses);
        body.classList.add('accessibility-contrast-' + currentState.contrast);
        document.documentElement.classList.add('accessibility-contrast-' + currentState.contrast);
        
        // Apply inline styles for dark mode to ensure it works in WordPress
        if (currentState.contrast === 'dark') {
            // Apply dark mode directly to html and body using style attribute
            document.documentElement.style.backgroundColor = '#1a1a1a';
            document.documentElement.style.color = '#e0e0e0';
            body.style.backgroundColor = '#1a1a1a';
            body.style.color = '#e0e0e0';
            
            // Add a style element with !important rules for maximum compatibility
            let darkModeStyle = document.getElementById('accessibility-dark-mode-styles');
            if (!darkModeStyle) {
                darkModeStyle = document.createElement('style');
                darkModeStyle.id = 'accessibility-dark-mode-styles';
                document.head.appendChild(darkModeStyle);
            }
            darkModeStyle.textContent = `
                html.accessibility-contrast-dark,
                body.accessibility-contrast-dark {
                    background: #1a1a1a !important;
                    background-color: #1a1a1a !important;
                    color: #e0e0e0 !important;
                }
                html.accessibility-contrast-dark *,
                body.accessibility-contrast-dark * {
                    background-color: inherit !important;
                    color: inherit !important;
                }
                html.accessibility-contrast-dark .accessibility-widget,
                html.accessibility-contrast-dark .accessibility-widget *,
                body.accessibility-contrast-dark .accessibility-widget,
                body.accessibility-contrast-dark .accessibility-widget * {
                    background: #ffffff !important;
                    background-color: #ffffff !important;
                    color: #333333 !important;
                }
                html.accessibility-contrast-dark p,
                html.accessibility-contrast-dark h1,
                html.accessibility-contrast-dark h2,
                html.accessibility-contrast-dark h3,
                html.accessibility-contrast-dark h4,
                html.accessibility-contrast-dark h5,
                html.accessibility-contrast-dark h6,
                html.accessibility-contrast-dark span,
                html.accessibility-contrast-dark li,
                html.accessibility-contrast-dark div,
                html.accessibility-contrast-dark section,
                html.accessibility-contrast-dark article,
                html.accessibility-contrast-dark header,
                html.accessibility-contrast-dark footer,
                html.accessibility-contrast-dark main,
                html.accessibility-contrast-dark aside,
                body.accessibility-contrast-dark p,
                body.accessibility-contrast-dark h1,
                body.accessibility-contrast-dark h2,
                body.accessibility-contrast-dark h3,
                body.accessibility-contrast-dark h4,
                body.accessibility-contrast-dark h5,
                body.accessibility-contrast-dark h6,
                body.accessibility-contrast-dark span,
                body.accessibility-contrast-dark li,
                body.accessibility-contrast-dark div,
                body.accessibility-contrast-dark section,
                body.accessibility-contrast-dark article,
                body.accessibility-contrast-dark header,
                body.accessibility-contrast-dark footer,
                body.accessibility-contrast-dark main,
                body.accessibility-contrast-dark aside {
                    background-color: #1a1a1a !important;
                    color: #e0e0e0 !important;
                }
                html.accessibility-contrast-dark a,
                body.accessibility-contrast-dark a {
                    color: #4da6ff !important;
                }
                html.accessibility-contrast-dark img,
                body.accessibility-contrast-dark img {
                    opacity: 0.8 !important;
                }
            `;
        } else {
            // Remove inline styles when not in dark mode
            document.documentElement.style.removeProperty('background-color');
            document.documentElement.style.removeProperty('color');
            body.style.removeProperty('background-color');
            body.style.removeProperty('color');
            
            // Remove the style element
            const darkModeStyle = document.getElementById('accessibility-dark-mode-styles');
            if (darkModeStyle) {
                darkModeStyle.remove();
            }
        }
        
        // Ensure widget is isolated from contrast filter effects
        const widget = document.getElementById('accessibility-plugin-widget');
        if (widget) {
            widget.style.filter = 'none';
            widget.style.transform = 'translateZ(0)';
            widget.style.isolation = 'isolate';
            // Don't override position, bottom, right, left - let CSS handle it
        }

        // Line height
        if (currentState.lineHeight === 'large') {
            body.style.lineHeight = '1.8';
        } else {
            body.style.lineHeight = '';
        }

        // Letter spacing
        if (currentState.letterSpacing === 'wide') {
            body.style.letterSpacing = '0.1em';
        } else {
            body.style.letterSpacing = '';
        }

        // Font family
        const fontMap = {
            'default': '',
            'sans-serif': 'Arial, Helvetica, sans-serif',
            'serif': 'Georgia, "Times New Roman", serif',
            'monospace': '"Courier New", Courier, monospace',
            'braille': '"Braille", "Braille29", "Braille6", monospace'
        };
        if (fontMap[currentState.fontFamily]) {
            body.style.fontFamily = fontMap[currentState.fontFamily];
        } else {
            body.style.fontFamily = '';
        }

        // Color blindness filter
        applyColorBlindnessFilter();

        // Focus indicator
        if (currentState.focusIndicator) {
            body.classList.add('accessibility-focus-indicator');
        } else {
            body.classList.remove('accessibility-focus-indicator');
        }

        // Stop animations
        if (currentState.stopAnimations) {
            body.classList.add('accessibility-stop-animations');
        } else {
            body.classList.remove('accessibility-stop-animations');
        }

        // Underline links
        if (currentState.underlineLinks) {
            body.classList.add('accessibility-underline-links');
        } else {
            body.classList.remove('accessibility-underline-links');
        }

        // Show image alt text
        if (currentState.showImageAlt) {
            showImageAltText();
        } else {
            hideImageAltText();
        }

        // Braille conversion
        if (currentState.brailleEnabled) {
            enableBraille();
        } else {
            disableBraille();
        }

        // Reading guide
        if (currentState.readingGuide) {
            enableReadingGuide();
        } else {
            disableReadingGuide();
        }

        // Reading mask
        if (currentState.readingMask) {
            enableReadingMask();
        } else {
            disableReadingMask();
        }

        // Text highlight
        if (currentState.textHighlight) {
            enableTextHighlight();
        } else {
            disableTextHighlight();
        }

        savePreferences();
        updateUI();
    }

    // TTS Functions
    function speakText(text, sourceElement = null) {
        // Allow TTS to work even if not enabled (for manual button clicks)
        // Only check if TTS is enabled when auto-reading is requested
        // if (!currentState.ttsEnabled) return;

        // Stop any current speech
        stopSpeaking();

        if (!text || text.trim() === '') {
            console.warn('TTS: No text provided');
            return;
        }
        
        console.log('TTS: Attempting to speak text:', text.substring(0, 50) + '...');

        // Clear previous highlights
        clearTTSHighlights();

        // Use TTS Manager if available
        if (ttsManager && ttsManager.isAvailable()) {
            console.log('Using TTS Manager to speak:', text.substring(0, 50) + '...');
            console.log('Current TTS Voice setting:', currentState.ttsVoice);
            console.log('Current TTS Language:', currentState.ttsLanguage);
            
            // Ensure voices are loaded - wait a bit if needed
            if (!ttsManager.availableVoices || ttsManager.availableVoices.length === 0) {
                console.log('No voices loaded, loading now...');
                ttsManager.loadVoices();
                // Wait a moment for voices to load
                setTimeout(() => {
                    if (ttsManager.availableVoices.length === 0) {
                        console.warn('Still no voices after load, using fallback');
                        speakWithFallback(text, sourceElement);
                        return;
                    }
                }, 100);
            }
            
            // Set TTS settings
            ttsManager.setRate(currentState.ttsRate);
            ttsManager.setPitch(currentState.ttsPitch);
            ttsManager.setVolume(currentState.ttsVolume);
            
            // Set language first (this may change the voice)
            if (currentState.ttsLanguage) {
                ttsManager.setLanguage(currentState.ttsLanguage);
                console.log('TTS Language set to:', currentState.ttsLanguage);
            }
            
            // Set voice if specified - do this AFTER setting language
            if (currentState.ttsVoice && currentState.ttsVoice.trim() !== '') {
                const voiceSet = ttsManager.setVoice(currentState.ttsVoice);
                console.log('Voice set result:', voiceSet, 'Voice name:', currentState.ttsVoice);
                if (!voiceSet) {
                    console.warn('Failed to set voice, will use default for language');
                    // Try to set language again to get a default voice
                    if (currentState.ttsLanguage) {
                        ttsManager.setLanguage(currentState.ttsLanguage);
                    }
                }
            } else {
                console.log('No specific voice selected, using default for language');
                // Ensure a voice is selected for the current language
                if (currentState.ttsLanguage) {
                    ttsManager.setLanguage(currentState.ttsLanguage);
                }
            }
            
            console.log('Current voice after setup:', ttsManager.currentVoice ? ttsManager.currentVoice.name : 'None');
            
            // If still no voice, use fallback
            if (!ttsManager.currentVoice && ttsManager.availableVoices.length > 0) {
                console.warn('No voice selected in TTS Manager, using fallback');
                speakWithFallback(text, sourceElement);
                return;
            }

            // If we have a source element, set up word highlighting
            if (sourceElement) {
                setupTTSHighlighting(sourceElement, text);
            }

            // Speak using TTS Manager
            try {
                console.log('Calling ttsManager.speak() with text length:', text.length);
                console.log('TTS Manager synthesis available:', !!ttsManager.synthesis);
                console.log('TTS Manager current voice:', ttsManager.currentVoice ? ttsManager.currentVoice.name : 'None');
                
                const speakPromise = ttsManager.speak(text, currentState.ttsLanguage || null, {
                    rate: currentState.ttsRate,
                    pitch: currentState.ttsPitch,
                    volume: currentState.ttsVolume
                });
                
                console.log('TTS Manager speak() returned:', typeof speakPromise);
                
                if (speakPromise && typeof speakPromise.then === 'function') {
                    console.log('TTS Manager returned a promise, setting up handlers');
                    isSpeaking = true;
                    updateTTSButton();
                    startTTSHighlighting();
                    
                    speakPromise.then(() => {
                        console.log('TTS finished speaking successfully');
                        isSpeaking = false;
                        clearTTSHighlights();
                        updateTTSButton();
                    }).catch((error) => {
                        console.error('TTS promise rejected with error:', error);
                        isSpeaking = false;
                        clearTTSHighlights();
                        updateTTSButton();
                        // Try fallback
                        console.log('Attempting fallback TTS due to promise rejection...');
                        speakWithFallback(text, sourceElement);
                    });
                    return;
                } else {
                    console.warn('TTS Manager speak() did not return a promise, using fallback immediately');
                    speakWithFallback(text, sourceElement);
                    return;
                }
            } catch (error) {
                console.error('Exception thrown when calling TTS Manager speak():', error);
                console.error('Error stack:', error.stack);
                // Fallback to direct synthesis
                speakWithFallback(text, sourceElement);
                return;
            }
        } else if (ttsManager) {
            console.warn('TTS Manager exists but is not available');
        } else {
            console.warn('TTS Manager not found, using fallback');
        }
        
        // Fallback to original implementation
        speakWithFallback(text, sourceElement);
    }
    
    // Fallback TTS function
    function speakWithFallback(text, sourceElement) {
        if (!speechSynthesis) {
            console.error('TTS: Speech Synthesis API not available');
            alert('Text-to-speech is not available in this browser. Please use a modern browser like Chrome, Edge, or Safari.');
            return;
        }

        console.log('Using fallback TTS implementation');
        
        // Ensure voices are loaded
        if (speechSynthesis) {
            loadVoices();
            // Get fresh voices
            const freshVoices = speechSynthesis.getVoices();
            if (freshVoices.length > 0) {
                availableVoices = freshVoices;
                console.log('Fallback: Loaded', freshVoices.length, 'voices');
            }
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = currentState.ttsRate;
        utterance.pitch = currentState.ttsPitch;
        utterance.volume = currentState.ttsVolume;
        
        // Set language based on current state
        if (currentState.ttsLanguage) {
            const langMap = {
                'en': 'en-US',
                'es': 'es-ES',
                'de': 'de-DE',
                'fr': 'fr-FR',
                'zh': 'zh-CN',
                'ko': 'ko-KR',
                'no': 'no-NO'
            };
            utterance.lang = langMap[currentState.ttsLanguage] || 'en-US';
        } else {
            utterance.lang = document.documentElement.lang || 'en-US';
        }
        
        // Store source element for potential restart
        utterance.sourceElement = sourceElement;
        
        // Set voice if selected
        if (currentState.ttsVoice && availableVoices.length > 0) {
            const selectedVoice = availableVoices.find(voice => 
                voice.name === currentState.ttsVoice || 
                voice.voiceURI === currentState.ttsVoice ||
                (currentState.ttsVoice && voice.name.toLowerCase().includes(currentState.ttsVoice.toLowerCase()))
            );
            if (selectedVoice) {
                utterance.voice = selectedVoice;
                console.log('Fallback: Using voice:', selectedVoice.name, selectedVoice.lang);
            } else {
                console.warn('Fallback: Selected voice not found:', currentState.ttsVoice);
                // Try to find a voice matching the language
                const langCode = utterance.lang.split('-')[0];
                const langVoice = availableVoices.find(voice => 
                    voice.lang && voice.lang.startsWith(langCode)
                );
                if (langVoice) {
                    utterance.voice = langVoice;
                    console.log('Fallback: Using language-matched voice:', langVoice.name);
                }
            }
        } else if (availableVoices.length > 0) {
            // Try to use a voice matching the language
            const langCode = utterance.lang.split('-')[0];
            const langVoice = availableVoices.find(voice => 
                voice.lang && voice.lang.startsWith(langCode)
            );
            if (langVoice) {
                utterance.voice = langVoice;
                console.log('Fallback: Using language-matched default voice:', langVoice.name);
            } else {
                console.log('Fallback: Using first available voice');
            }
        }

        currentUtterance = utterance;

        // If we have a source element, set up word highlighting
        if (sourceElement) {
            setupTTSHighlighting(sourceElement, text);
        }

        utterance.onstart = function() {
            isSpeaking = true;
            updateTTSButton();
            startTTSHighlighting();
        };

        utterance.onend = function() {
            isSpeaking = false;
            clearTTSHighlights();
            updateTTSButton();
        };

        utterance.onerror = function(event) {
            console.error('Speech synthesis error:', event.error, event);
            isSpeaking = false;
            clearTTSHighlights();
            updateTTSButton();
        };
        
        utterance.onstart = function() {
            console.log('Speech synthesis started speaking');
            isSpeaking = true;
            updateTTSButton();
        };

        speechSynthesis.speak(utterance);
        
        // Set speaking state immediately
        isSpeaking = true;
        updateTTSButton();
        startTTSHighlighting();
    }

    // Setup TTS word highlighting
    function setupTTSHighlighting(element, text) {
        // Clear previous highlights first
        clearTTSHighlights();
        
        // Try to find the selected text range
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            
            // If we have a selection, highlight within that range
            if (range.toString().trim() === text.trim()) {
                highlightSelectedRange(range, text);
                return;
            }
        }
        
        // Fallback: highlight all text in the element
        highlightElementText(element, text);
    }

    // Highlight text in a selected range
    function highlightSelectedRange(range, text) {
        const words = text.match(/\S+\s*/g) || [];
        if (words.length === 0) return;

        try {
            // Clone the range to work with it
            const clonedRange = range.cloneRange();
            const container = clonedRange.commonAncestorContainer;
            
            // Create a wrapper span for the selected text
            const wrapper = document.createElement('span');
            wrapper.className = 'accessibility-tts-text-wrapper';
            
            // Extract and wrap each word
            ttsWords = [];
            ttsHighlightElements = [wrapper];
            ttsCurrentWordIndex = 0;
            
            words.forEach((word) => {
                const span = document.createElement('span');
                span.className = 'accessibility-tts-word';
                span.textContent = word;
                wrapper.appendChild(span);
                ttsWords.push({ span: span, word: word.trim() });
            });
            
            // Replace the selected content with our wrapper
            clonedRange.deleteContents();
            clonedRange.insertNode(wrapper);
        } catch (e) {
            console.warn('Could not highlight selected range:', e);
            highlightElementText(range.commonAncestorContainer, text);
        }
    }

    // Highlight text in an element
    function highlightElementText(element, text) {
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.trim()) {
                textNodes.push(node);
            }
        }

        ttsWords = [];
        ttsHighlightElements = [];
        ttsCurrentWordIndex = 0;

        textNodes.forEach(textNode => {
            const parent = textNode.parentNode;
            if (!parent) return;
            
            const nodeText = textNode.textContent;
            const words = nodeText.match(/\S+\s*/g) || [];
            
            if (words.length === 0) return;

            // Create a wrapper for this text node
            const wrapper = document.createElement('span');
            wrapper.className = 'accessibility-tts-text-wrapper';
            
            words.forEach((word) => {
                const span = document.createElement('span');
                span.className = 'accessibility-tts-word';
                span.textContent = word;
                wrapper.appendChild(span);
                ttsWords.push({ span: span, word: word.trim() });
            });

            parent.replaceChild(wrapper, textNode);
            ttsHighlightElements.push(wrapper);
        });
    }

    // Start TTS highlighting animation
    function startTTSHighlighting() {
        if (ttsWords.length === 0) return;

        // Calculate timing based on speech rate
        // Average reading speed is about 150-200 words per minute
        // At rate 1.0, that's about 2.5-3.3 words per second
        // We'll use a conservative estimate
        const averageWordsPerMinute = 180;
        const wordsPerSecond = (averageWordsPerMinute / 60) * currentState.ttsRate;
        const interval = Math.max(50, 1000 / wordsPerSecond); // Minimum 50ms interval

        let highlightInterval = setInterval(() => {
            if (!isSpeaking || ttsCurrentWordIndex >= ttsWords.length) {
                clearInterval(highlightInterval);
                // Clear last highlight
                if (ttsCurrentWordIndex > 0 && ttsCurrentWordIndex <= ttsWords.length) {
                    ttsWords[ttsCurrentWordIndex - 1].span.classList.remove('accessibility-tts-word-active');
                }
                return;
            }

            // Remove previous highlight (keep last 2-3 words visible for context)
            if (ttsCurrentWordIndex > 2) {
                ttsWords[ttsCurrentWordIndex - 3].span.classList.remove('accessibility-tts-word-active');
            }

            // Add highlight to current word
            if (ttsCurrentWordIndex < ttsWords.length) {
                const currentWord = ttsWords[ttsCurrentWordIndex];
                currentWord.span.classList.add('accessibility-tts-word-active');
                
                // Scroll to word if needed (only every few words to avoid janky scrolling)
                if (ttsCurrentWordIndex % 5 === 0) {
                    currentWord.span.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                    });
                }
            }

            ttsCurrentWordIndex++;
        }, interval);
    }

    // Clear TTS highlights
    function clearTTSHighlights() {
        ttsHighlightElements.forEach(wrapper => {
            const parent = wrapper.parentNode;
            if (parent) {
                // Restore original text nodes
                const text = wrapper.textContent;
                const textNode = document.createTextNode(text);
                parent.replaceChild(textNode, wrapper);
            }
        });
        ttsHighlightElements = [];
        ttsWords = [];
        ttsCurrentWordIndex = 0;
    }

    function stopSpeaking() {
        // Use TTS Manager if available
        if (ttsManager && ttsManager.isAvailable()) {
            ttsManager.stop();
            isSpeaking = false;
            clearTTSHighlights();
            updateTTSButton();
            return;
        }
        
        // Fallback to original implementation
        if (speechSynthesis && isSpeaking) {
            speechSynthesis.cancel();
            isSpeaking = false;
            clearTTSHighlights();
            updateTTSButton();
        }
    }
    
    // Update language dropdown
    function updateLanguageDropdown() {
        const panel = document.getElementById('accessibility-panel');
        if (!panel) return;
        
        const langSelect = panel.querySelector('select[aria-label="TTS Language"]');
        if (langSelect && ttsManager) {
            const currentValue = langSelect.value;
            const languages = ttsManager.getAvailableLanguages();
            langSelect.innerHTML = '';
            languages.forEach(lang => {
                const optionEl = document.createElement('option');
                optionEl.value = lang.code;
                optionEl.textContent = lang.name;
                if (lang.code === currentValue || (!currentValue && lang.code === currentTTSLanguage)) {
                    optionEl.selected = true;
                }
                langSelect.appendChild(optionEl);
            });
        }
    }
    
    // Announce changes to screen readers - WCAG 4.1.3 Status Messages
    function announceToScreenReader(message) {
        if (!message) return;
        
        // Remove existing announcement if any
        let announcement = document.getElementById('accessibility-screen-reader-announcement');
        if (!announcement) {
            announcement = document.createElement('div');
            announcement.id = 'accessibility-screen-reader-announcement';
            announcement.className = 'sr-only';
            announcement.setAttribute('role', 'status');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            document.body.appendChild(announcement);
        }
        
        // Update message
        announcement.textContent = message;
        
        // Clear after a delay to allow re-announcement
        setTimeout(() => {
            if (announcement) {
                announcement.textContent = '';
            }
        }, 1000);
    }

    function updateTTSButton() {
        const btn = document.getElementById('accessibility-tts-btn');
        if (btn) {
            if (isSpeaking) {
                btn.innerHTML = '<i class="bx bx-pause"></i> <span>Stop Reading</span>';
                btn.classList.add('accessibility-tts-active');
            } else {
                btn.innerHTML = '<i class="bx bx-volume-full"></i> <span>Read Selected Text</span>';
                btn.classList.remove('accessibility-tts-active');
            }
        }
    }

    // Get voice options for TTS
    function getVoiceOptions() {
        const options = [{ value: '', label: 'Default Voice (Auto-select)' }];
        
        // Get voices from multiple sources
        let voices = [];
        
        // Try TTS Manager first
        if (ttsManager && ttsManager.availableVoices && ttsManager.availableVoices.length > 0) {
            voices = ttsManager.availableVoices;
            console.log('Getting voices from TTS Manager:', voices.length);
        } 
        // Try availableVoices array
        else if (availableVoices && availableVoices.length > 0) {
            voices = availableVoices;
            console.log('Getting voices from availableVoices:', voices.length);
        }
        // Try speechSynthesis directly
        else if (speechSynthesis) {
            voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                availableVoices = voices;
                console.log('Getting voices from speechSynthesis:', voices.length);
            }
        }
        // Try TTS Manager's synthesis
        else if (ttsManager && ttsManager.synthesis) {
            voices = ttsManager.synthesis.getVoices();
            if (voices.length > 0) {
                availableVoices = voices;
                ttsManager.availableVoices = voices;
                console.log('Getting voices from TTS Manager synthesis:', voices.length);
            }
        }
        
        if (voices.length > 0) {
            // Filter by language if TTS Manager is available and language is set
            if (ttsManager && currentState.ttsLanguage) {
                const currentLang = currentState.ttsLanguage || 'en';
                const langVoices = ttsManager.getAvailableVoicesForLanguage(currentLang);
                
                if (langVoices.length > 0) {
                    console.log('Filtering voices for language', currentLang + ':', langVoices.length);
                    langVoices.forEach(voice => {
                        options.push({
                            value: voice.name,
                            label: voice.name + (voice.lang ? ' (' + voice.lang + ')' : '')
                        });
                    });
                } else {
                    // Fallback to all voices if no language-specific voices found
                    console.log('No language-specific voices, using all voices');
                    voices.forEach(voice => {
                        options.push({
                            value: voice.name,
                            label: voice.name + (voice.lang ? ' (' + voice.lang + ')' : '')
                        });
                    });
                }
            } else {
                // Use all voices
                voices.forEach(voice => {
                    options.push({
                        value: voice.name,
                        label: voice.name + (voice.lang ? ' (' + voice.lang + ')' : '')
                    });
                });
            }
        } else {
            console.warn('No voices available for voice options');
        }
        
        console.log('Returning', options.length, 'voice options');
        return options;
    }

    // Reading guide functions
    function moveReadingGuide(e) {
        if (!readingGuideElement || !readingGuideActive) return;
        const scrollY = window.scrollY || window.pageYOffset;
        const scrollX = window.scrollX || window.pageXOffset;
        
        // Get the element at cursor position to determine line height
        const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
        let lineHeight = 20; // Default fallback
        
        if (elementBelow) {
            const computedStyle = window.getComputedStyle(elementBelow);
            const fontSize = parseFloat(computedStyle.fontSize);
            const computedLineHeight = parseFloat(computedStyle.lineHeight);
            
            // Use computed line height or calculate from font size
            if (!isNaN(computedLineHeight) && computedLineHeight > 0) {
                lineHeight = computedLineHeight;
            } else if (!isNaN(fontSize)) {
                lineHeight = fontSize * 1.5; // Standard line height multiplier
            }
        }
        
        // Snap the yellow band to the actual line height
        readingGuideElement.style.setProperty('--line-height', lineHeight + 'px');
        readingGuideElement.style.top = (e.clientY + scrollY - 60) + 'px';
        readingGuideElement.style.left = (scrollX) + 'px';
        readingGuideElement.style.width = '100%';
        readingGuideElement.style.display = 'block';
    }

    // Handle triple-click to disable reading guide
    function handleReadingGuideClick(e) {
        if (!readingGuideActive) return;
        
        // Record click time
        const now = Date.now();
        readingGuideClickTimes.push(now);
        
        // Keep only clicks within last 2 seconds
        readingGuideClickTimes = readingGuideClickTimes.filter(time => now - time < 2000);
        
        // Clear previous timeout
        if (readingGuideClickTimeout) {
            clearTimeout(readingGuideClickTimeout);
        }
        
        // Check if we have 3 clicks within 2 seconds
        if (readingGuideClickTimes.length >= 3) {
            // Disable reading guide
            currentState.readingGuide = false;
            disableReadingGuide();
            applySettings();
            readingGuideClickTimes = [];
            return;
        }
        
        // Set timeout to clear clicks after 2 seconds
        readingGuideClickTimeout = setTimeout(() => {
            readingGuideClickTimes = [];
        }, 2000);
        
        // Prevent event from going through
        e.stopPropagation();
        e.preventDefault();
    }

    function enableReadingGuide() {
        if (readingGuideActive) return;

        readingGuideElement = document.createElement('div');
        readingGuideElement.id = 'accessibility-reading-guide';
        readingGuideElement.className = 'accessibility-reading-guide';
        readingGuideElement.style.display = 'none';
        // Prevent clicks from going through
        readingGuideElement.style.pointerEvents = 'auto';
        document.body.appendChild(readingGuideElement);

        moveReadingGuideHandler = moveReadingGuide;
        readingGuideClickHandler = handleReadingGuideClick;
        
        document.addEventListener('mousemove', moveReadingGuideHandler);
        readingGuideElement.addEventListener('click', readingGuideClickHandler);
        document.addEventListener('scroll', function() {
            if (readingGuideElement && readingGuideActive) {
                readingGuideElement.style.display = 'none';
            }
        }, true);
        readingGuideActive = true;
    }

    function disableReadingGuide() {
        if (!readingGuideActive) return;

        if (readingGuideElement) {
            if (readingGuideClickHandler) {
                readingGuideElement.removeEventListener('click', readingGuideClickHandler);
                readingGuideClickHandler = null;
            }
            readingGuideElement.remove();
            readingGuideElement = null;
        }

        if (moveReadingGuideHandler) {
            document.removeEventListener('mousemove', moveReadingGuideHandler);
            moveReadingGuideHandler = null;
        }
        
        // Clear click tracking
        readingGuideClickTimes = [];
        if (readingGuideClickTimeout) {
            clearTimeout(readingGuideClickTimeout);
            readingGuideClickTimeout = null;
        }
        
        readingGuideActive = false;
    }

    // Reading mask functions - hides text below current reading position
    function updateReadingMask(e) {
        if (!readingMaskElement || !readingMaskActive) return;
        
        const scrollY = window.scrollY || window.pageYOffset;
        const mouseY = e.clientY + scrollY;
        
        // Calculate line height (approximate)
        const body = document.body;
        const computedStyle = window.getComputedStyle(body);
        const fontSize = parseFloat(computedStyle.fontSize);
        const lineHeight = parseFloat(computedStyle.lineHeight) || fontSize * 1.5;
        const maskHeight = lineHeight * readingMaskHeight;
        
        // Get viewport and document dimensions
        const viewportHeight = window.innerHeight;
        const totalHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, viewportHeight);
        
        // Create top overlay (covers everything above reading area)
        const topOverlay = readingMaskElement.querySelector('.accessibility-mask-top');
        if (topOverlay) {
            const topHeight = Math.max(0, mouseY - maskHeight / 2);
            topOverlay.style.height = topHeight + 'px';
        }
        
        // Create bottom overlay (covers everything below reading area)
        const bottomOverlay = readingMaskElement.querySelector('.accessibility-mask-bottom');
        if (bottomOverlay) {
            const bottomStart = mouseY + maskHeight / 2;
            const bottomHeight = Math.max(0, totalHeight - bottomStart);
            bottomOverlay.style.top = bottomStart + 'px';
            bottomOverlay.style.height = bottomHeight + 'px';
        }
        
        readingMaskElement.style.display = 'block';
    }

    function enableReadingMask() {
        if (readingMaskActive) return;

        readingMaskElement = document.createElement('div');
        readingMaskElement.id = 'accessibility-reading-mask';
        readingMaskElement.className = 'accessibility-reading-mask';
        readingMaskElement.style.display = 'none';
        
        const topOverlay = document.createElement('div');
        topOverlay.className = 'accessibility-mask-top';
        topOverlay.style.position = 'absolute';
        topOverlay.style.top = '0';
        topOverlay.style.left = '0';
        topOverlay.style.width = '100%';
        topOverlay.style.zIndex = '9998';
        
        const bottomOverlay = document.createElement('div');
        bottomOverlay.className = 'accessibility-mask-bottom';
        bottomOverlay.style.position = 'absolute';
        bottomOverlay.style.left = '0';
        bottomOverlay.style.width = '100%';
        bottomOverlay.style.zIndex = '9998';
        
        readingMaskElement.appendChild(topOverlay);
        readingMaskElement.appendChild(bottomOverlay);
        document.body.appendChild(readingMaskElement);

        readingMaskHandler = updateReadingMask;
        document.addEventListener('mousemove', readingMaskHandler);
        document.addEventListener('scroll', function() {
            if (readingMaskElement && readingMaskActive) {
                readingMaskElement.style.display = 'none';
            }
        }, true);
        readingMaskActive = true;
    }

    function disableReadingMask() {
        if (!readingMaskActive) return;

        if (readingMaskElement) {
            readingMaskElement.remove();
            readingMaskElement = null;
        }

        if (readingMaskHandler) {
            document.removeEventListener('mousemove', readingMaskHandler);
            readingMaskHandler = null;
        }
        readingMaskActive = false;
    }

    // Text highlight functions - highlights text as you read
    function updateTextHighlight(e) {
        if (!highlightOverlay || !textHighlightActive) return;
        
        const scrollY = window.scrollY || window.pageYOffset;
        const mouseY = e.clientY + scrollY;
        
        // Get the element at mouse position
        const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
        if (!elementBelow) {
            highlightOverlay.style.display = 'none';
            return;
        }
        
        // Find text node or use element's computed line height
        const computedStyle = window.getComputedStyle(elementBelow);
        const fontSize = parseFloat(computedStyle.fontSize);
        const lineHeight = parseFloat(computedStyle.lineHeight) || fontSize * 1.5;
        
        // Position highlight at mouse Y position
        highlightOverlay.style.top = (mouseY - lineHeight / 2) + 'px';
        highlightOverlay.style.left = '0';
        highlightOverlay.style.width = '100%';
        highlightOverlay.style.height = (lineHeight * 1.3) + 'px';
        highlightOverlay.style.display = 'block';
    }

    function enableTextHighlight() {
        if (textHighlightActive) return;

        highlightOverlay = document.createElement('div');
        highlightOverlay.id = 'accessibility-text-highlight';
        highlightOverlay.className = 'accessibility-text-highlight';
        highlightOverlay.style.display = 'none';
        document.body.appendChild(highlightOverlay);

        highlightHandler = updateTextHighlight;
        document.addEventListener('mousemove', highlightHandler);
        document.addEventListener('scroll', function() {
            if (highlightOverlay && textHighlightActive) {
                highlightOverlay.style.display = 'none';
            }
        }, true);
        textHighlightActive = true;
    }

    function disableTextHighlight() {
        if (!textHighlightActive) return;

        if (highlightOverlay) {
            highlightOverlay.remove();
            highlightOverlay = null;
        }

        if (highlightHandler) {
            document.removeEventListener('mousemove', highlightHandler);
            highlightHandler = null;
        }
        textHighlightActive = false;
    }

    // Image alt text functions
    function showImageAltText() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.alt && !img.dataset.altShown) {
                const altDiv = document.createElement('div');
                altDiv.className = 'accessibility-image-alt';
                altDiv.textContent = img.alt;
                altDiv.setAttribute('aria-label', 'Image description: ' + img.alt);
                
                // Position relative to image
                const rect = img.getBoundingClientRect();
                altDiv.style.position = 'absolute';
                altDiv.style.top = (rect.bottom + window.scrollY + 5) + 'px';
                altDiv.style.left = (rect.left + window.scrollX) + 'px';
                altDiv.style.maxWidth = rect.width + 'px';
                
                document.body.appendChild(altDiv);
                img.dataset.altShown = 'true';
                img.dataset.altDivId = altDiv.id || 'alt-' + Date.now();
                if (!altDiv.id) altDiv.id = img.dataset.altDivId;
            }
        });
    }

    function hideImageAltText() {
        const altDivs = document.querySelectorAll('.accessibility-image-alt');
        altDivs.forEach(div => div.remove());
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            delete img.dataset.altShown;
            delete img.dataset.altDivId;
        });
    }

    // Braille functions
    function enableBraille() {
        if (brailleEnabled) return;
        
        // Check if Braille converter is available
        if (typeof window.brailleConverter !== 'undefined') {
            window.brailleConverter.enable();
            brailleEnabled = true;
            console.log('Braille conversion enabled');
        } else {
            console.warn('Braille converter not available. Make sure braille.js is loaded.');
            // Fallback: apply Braille font
            document.body.classList.add('accessibility-braille-mode');
            brailleEnabled = true;
        }
    }

    function disableBraille() {
        if (!brailleEnabled) return;
        
        if (typeof window.brailleConverter !== 'undefined') {
            window.brailleConverter.disable();
        }
        document.body.classList.remove('accessibility-braille-mode');
        brailleEnabled = false;
        console.log('Braille conversion disabled');
    }

    // Create toggle control
    function createToggleControl(label, settingKey, currentValue) {
        const control = document.createElement('div');
        control.className = 'accessibility-control accessibility-control-toggle';

        const labelEl = document.createElement('label');
        labelEl.className = 'accessibility-toggle-label';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'accessibility-toggle-checkbox';
        checkbox.checked = Boolean(currentValue);
        checkbox.setAttribute('aria-label', label);
        checkbox.setAttribute('role', 'switch');
        checkbox.setAttribute('aria-checked', Boolean(currentValue).toString());
        checkbox.setAttribute('tabindex', '0');
        checkbox.dataset.settingKey = settingKey; // Store key for easier lookup
        
        const span = document.createElement('span');
        span.className = 'accessibility-toggle-slider';
        
        const text = document.createElement('span');
        text.className = 'accessibility-toggle-text';
        text.textContent = label;

        checkbox.addEventListener('change', function() {
            try {
                console.log('Toggle changed:', settingKey, 'to', this.checked);
                this.setAttribute('aria-checked', this.checked.toString());
                currentState[settingKey] = this.checked;
                applySettings();
                // Announce change to screen readers
                announceToScreenReader(label + ' ' + (this.checked ? 'enabled' : 'disabled'));
            } catch (error) {
                console.error('Error in toggle change:', error);
            }
        }, true);
        
        // Keyboard support for toggle
        checkbox.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.checked = !this.checked;
                this.dispatchEvent(new Event('change'));
            }
        });

        labelEl.appendChild(checkbox);
        labelEl.appendChild(span);
        labelEl.appendChild(text);
        control.appendChild(labelEl);

        return control;
    }

    // Create the widget UI
    function createWidget() {
        // Check if widget already exists
        const existingWidget = document.getElementById('accessibility-plugin-widget');
        if (existingWidget) {
            return; // Widget already exists, don't create another
        }
        
        // Create container
        const container = document.createElement('div');
        container.id = 'accessibility-plugin-widget';
        container.className = 'accessibility-widget accessibility-widget-' + settings.position;

        // Create toggle button - WCAG Compliant
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'accessibility-toggle-btn';
        toggleBtn.className = 'accessibility-toggle-btn';
        toggleBtn.setAttribute('aria-label', 'Toggle Accessibility Options');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.setAttribute('aria-controls', 'accessibility-panel');
        toggleBtn.setAttribute('aria-haspopup', 'true');
        toggleBtn.setAttribute('role', 'button');
        toggleBtn.setAttribute('type', 'button');
        toggleBtn.setAttribute('tabindex', '0');
        toggleBtn.innerHTML = '<i class="bx bx-accessibility accessibility-icon" aria-hidden="true"></i> <span>' + settings.buttonText + '</span>';
        // Use capture phase and immediate propagation stop to prevent extension interference
        let isToggling = false;
        // Click handler - WCAG Compliant
        toggleBtn.addEventListener('click', function(e) {
            try {
                if (isToggling) {
                    console.log('Already toggling, ignoring click');
                    return false;
                }
                isToggling = true;
                console.log('Accessibility button clicked');
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                
                // Use setTimeout to prevent double-trigger
                setTimeout(() => {
                    togglePanel(e);
                    setTimeout(() => {
                        isToggling = false;
                    }, 300);
                }, 10);
                
                return false;
            } catch (error) {
                console.error('Accessibility plugin error on button click:', error);
                isToggling = false;
                return false;
            }
        }, true);
        
        // Keyboard handler - WCAG 2.1.1 Keyboard
        toggleBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleBtn.click();
            }
        });
        
        // Also add mousedown as backup
        toggleBtn.addEventListener('mousedown', function(e) {
            try {
                e.stopImmediatePropagation();
            } catch (error) {
                // Ignore
            }
        }, true);

        // Create panel - WCAG Compliant
        const panel = document.createElement('div');
        panel.id = 'accessibility-panel';
        panel.className = 'accessibility-panel';
        panel.setAttribute('aria-hidden', 'true');
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.setAttribute('aria-labelledby', 'accessibility-panel-title');
        panel.setAttribute('aria-describedby', 'accessibility-panel-description');
        panel.setAttribute('tabindex', '-1');
        // Force initial hidden state with inline styles
        panel.style.cssText = 'display: none !important; opacity: 0 !important; visibility: hidden !important; position: absolute !important; z-index: 10001 !important;';

        // Panel header - WCAG Compliant
        const header = document.createElement('div');
        header.className = 'accessibility-panel-header';
        header.innerHTML = '<h3 id="accessibility-panel-title"><i class="bx bx-cog" aria-hidden="true"></i> Accessibility Options</h3><button class="accessibility-close-btn" aria-label="Close Accessibility Options" type="button" tabindex="0"><i class="bx bx-x" aria-hidden="true"></i></button>';
        const closeBtn = header.querySelector('.accessibility-close-btn');
        closeBtn.setAttribute('aria-controls', 'accessibility-panel');
        
        // Add description for screen readers
        const description = document.createElement('div');
        description.id = 'accessibility-panel-description';
        description.className = 'sr-only';
        description.textContent = 'Accessibility options panel. Use keyboard navigation to adjust settings. Press Escape to close.';
        description.setAttribute('aria-live', 'polite');
        header.appendChild(description);
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                try {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    togglePanel(e);
                    return false;
                } catch (error) {
                    console.error('Accessibility plugin error on close button:', error);
                    return false;
                }
            }, true);
        }

        // Panel content
        const content = document.createElement('div');
        content.className = 'accessibility-panel-content';

        // Create tabs or sections
        const sections = document.createElement('div');
        sections.className = 'accessibility-sections';

        // Text & Display Section
        const textSection = document.createElement('div');
        textSection.className = 'accessibility-section';
        textSection.innerHTML = '<h4 class="accessibility-section-title">Text & Display</h4>';

        // Font size control
        const fontSizeControl = createControl('Font Size', 'fontSize', [
            { value: 75, label: 'Small (75%)' },
            { value: 100, label: 'Normal (100%)' },
            { value: 125, label: 'Large (125%)' },
            { value: 150, label: 'Extra Large (150%)' },
            { value: 200, label: 'Huge (200%)' }
        ], currentState.fontSize);

        // Contrast control
        const contrastControl = createControl('Contrast', 'contrast', [
            { value: 'normal', label: 'Normal' },
            { value: 'high', label: 'High Contrast' },
            { value: 'dark', label: 'Dark Mode' }
        ], currentState.contrast);
        
        // Update dark mode toggle when contrast changes
        const contrastSelect = contrastControl.querySelector('select');
        contrastSelect.addEventListener('change', function() {
            // Update dark mode toggle to match
            const darkModeToggle = textSection.querySelector('.accessibility-toggle-checkbox[data-setting-key="darkMode"]');
            if (darkModeToggle) {
                darkModeToggle.checked = this.value === 'dark';
            }
        });
        
        // Add quick dark mode toggle after contrast control
        const darkModeToggle = createToggleControl('Quick Dark Mode', 'darkMode', currentState.contrast === 'dark');
        const darkModeCheckbox = darkModeToggle.querySelector('.accessibility-toggle-checkbox');
        darkModeCheckbox.addEventListener('change', function() {
            if (this.checked) {
                currentState.contrast = 'dark';
            } else {
                currentState.contrast = 'normal';
            }
            // Update contrast dropdown to match
            if (contrastSelect) {
                contrastSelect.value = currentState.contrast;
            }
            applySettings();
        });

        // Line height control
        const lineHeightControl = createControl('Line Height', 'lineHeight', [
            { value: 'normal', label: 'Normal' },
            { value: 'large', label: 'Large' }
        ], currentState.lineHeight);

        // Letter spacing control
        const letterSpacingControl = createControl('Letter Spacing', 'letterSpacing', [
            { value: 'normal', label: 'Normal' },
            { value: 'wide', label: 'Wide' }
        ], currentState.letterSpacing);

        // Font family control
        const fontFamilyControl = createControl('Font Family', 'fontFamily', [
            { value: 'default', label: 'Default' },
            { value: 'sans-serif', label: 'Sans Serif' },
            { value: 'serif', label: 'Serif' },
            { value: 'monospace', label: 'Monospace' },
            { value: 'braille', label: 'Braille' }
        ], currentState.fontFamily);

        textSection.appendChild(fontSizeControl);
        textSection.appendChild(contrastControl);
        textSection.appendChild(darkModeToggle);
        textSection.appendChild(lineHeightControl);
        textSection.appendChild(letterSpacingControl);
        textSection.appendChild(fontFamilyControl);

        // Color & Vision Section
        const colorSection = document.createElement('div');
        colorSection.className = 'accessibility-section';
        colorSection.innerHTML = '<h4 class="accessibility-section-title">Color & Vision</h4>';

        // Color blindness control
        const colorBlindnessControl = createControl('Color Blindness Filter', 'colorBlindness', [
            { value: 'none', label: 'None' },
            { value: 'protanopia', label: 'Protanopia (Red-Blind)' },
            { value: 'deuteranopia', label: 'Deuteranopia (Green-Blind)' },
            { value: 'tritanopia', label: 'Tritanopia (Blue-Blind)' },
            { value: 'achromatopsia', label: 'Achromatopsia (Total Color Blind)' }
        ], currentState.colorBlindness);

        colorSection.appendChild(colorBlindnessControl);

        // Reading & Navigation Section
        const readingSection = document.createElement('div');
        readingSection.className = 'accessibility-section';
        readingSection.innerHTML = '<h4 class="accessibility-section-title">Reading & Navigation</h4>';

        // TTS toggle
        const ttsToggle = createToggleControl('Enable Text-to-Speech', 'ttsEnabled', currentState.ttsEnabled);
        readingSection.appendChild(ttsToggle);

        // TTS Language selection
        let ttsLanguageOptions = [{ value: 'en', label: 'English' }];
        if (ttsManager && ttsManager.isAvailable()) {
            const languages = ttsManager.getAvailableLanguages();
            ttsLanguageOptions = languages.map(lang => ({
                value: lang.code,
                label: lang.name
            }));
        } else {
            // Fallback options if TTS Manager not available
            ttsLanguageOptions = [
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Español' },
                { value: 'de', label: 'Deutsch' },
                { value: 'fr', label: 'Français' },
                { value: 'zh', label: '中文 (Mandarin)' },
                { value: 'ko', label: '한국어' },
                { value: 'no', label: 'Norsk' }
            ];
        }
        
        const ttsLanguageControl = createControl('TTS Language', 'ttsLanguage', ttsLanguageOptions, currentState.ttsLanguage || 'en');
        const ttsLanguageSelect = ttsLanguageControl.querySelector('select');
        ttsLanguageSelect.onchange = function() {
            currentState.ttsLanguage = this.value;
            if (ttsManager) {
                ttsManager.setLanguage(this.value);
            }
            savePreferences();
            // Update voice dropdown for selected language
            updateVoiceDropdown();
        };
        readingSection.appendChild(ttsLanguageControl);

        // TTS Voice selection
        // Load voices multiple times to ensure they're available
        loadVoices();
        setTimeout(loadVoices, 100);
        setTimeout(loadVoices, 500);
        setTimeout(loadVoices, 1000);
        setTimeout(loadVoices, 2000); // Additional retry
        
        const ttsVoiceControl = createControl('TTS Voice', 'ttsVoice', getVoiceOptions(), currentState.ttsVoice);
        const ttsVoiceSelect = ttsVoiceControl.querySelector('select');
        
        // Update voice options when voices are loaded
        const updateVoiceOptions = () => {
            const currentValue = ttsVoiceSelect.value;
            const options = getVoiceOptions();
            console.log('Updating voice options, found', options.length, 'options');
            ttsVoiceSelect.innerHTML = '';
            options.forEach(option => {
                const optionEl = document.createElement('option');
                optionEl.value = option.value;
                optionEl.textContent = option.label;
                if (option.value === currentValue) {
                    optionEl.selected = true;
                }
                ttsVoiceSelect.appendChild(optionEl);
            });
            // If no voices found, show a message
            if (options.length === 1 && options[0].value === '') {
                console.warn('No voices available for voice dropdown');
                const noVoiceOption = document.createElement('option');
                noVoiceOption.value = '';
                noVoiceOption.textContent = 'Loading voices...';
                noVoiceOption.disabled = true;
                ttsVoiceSelect.appendChild(noVoiceOption);
                // Retry after a delay
                setTimeout(() => {
                    loadVoices();
                    updateVoiceOptions();
                }, 1000);
            }
        };
        
        // Initial update
        setTimeout(updateVoiceOptions, 200);
        setTimeout(updateVoiceOptions, 1000);
        setTimeout(updateVoiceOptions, 2000);
        
        // Update when voices are loaded
        if (speechSynthesis && speechSynthesis.onvoiceschanged) {
            const originalOnVoicesChanged = speechSynthesis.onvoiceschanged;
            speechSynthesis.onvoiceschanged = function() {
                console.log('Voices changed event fired');
                loadVoices();
                updateVoiceOptions();
                if (originalOnVoicesChanged) {
                    originalOnVoicesChanged();
                }
            };
        }
        
        // Also update when panel opens
        const voicePanel = document.getElementById('accessibility-panel');
        if (voicePanel) {
            const observer = new MutationObserver(() => {
                if (voicePanel.getAttribute('aria-hidden') === 'false') {
                    setTimeout(() => {
                        loadVoices();
                        updateVoiceOptions();
                    }, 100);
                }
            });
            observer.observe(voicePanel, { attributes: true, attributeFilter: ['aria-hidden'] });
        }
        
        ttsVoiceSelect.onchange = function() {
            currentState.ttsVoice = this.value;
            console.log('TTS Voice changed to:', this.value);
            
            if (ttsManager && this.value) {
                const success = ttsManager.setVoice(this.value);
                console.log('TTS Manager setVoice result:', success);
            }
            
            savePreferences();
            
            // Test the voice immediately if TTS is enabled
            if (currentState.ttsEnabled && this.value) {
                const testText = 'Voice test';
                console.log('Testing voice:', this.value);
                
                if (ttsManager && ttsManager.isAvailable()) {
                    ttsManager.speak(testText, currentState.ttsLanguage, {
                        rate: 1.0,
                        pitch: 1.0,
                        volume: 0.3
                    }).catch(err => {
                        console.warn('Voice test failed:', err);
                        // Fallback to direct synthesis
                        testVoiceDirectly(testText, this.value);
                    });
                } else if (speechSynthesis) {
                    testVoiceDirectly(testText, this.value);
                }
            }
        };
        
        // Helper function to test voice directly
        function testVoiceDirectly(testText, voiceName) {
            loadVoices(); // Ensure voices are loaded
            const selectedVoice = availableVoices.find(voice => 
                voice.name === voiceName || 
                voice.voiceURI === voiceName ||
                (voiceName && voice.name.toLowerCase().includes(voiceName.toLowerCase()))
            );
            
            if (selectedVoice) {
                const testUtterance = new SpeechSynthesisUtterance(testText);
                testUtterance.voice = selectedVoice;
                testUtterance.volume = 0.3;
                testUtterance.lang = selectedVoice.lang || 'en-US';
                console.log('Testing voice directly:', selectedVoice.name, selectedVoice.lang);
                speechSynthesis.speak(testUtterance);
            } else {
                console.warn('Voice not found for testing:', voiceName);
            }
        }
        
        readingSection.appendChild(ttsVoiceControl);

        // TTS Speed control
        const ttsSpeedControl = document.createElement('div');
        ttsSpeedControl.className = 'accessibility-control';
        const speedLabel = document.createElement('label');
        speedLabel.className = 'accessibility-control-label';
        speedLabel.textContent = 'TTS Speed: ' + (currentState.ttsRate * 100).toFixed(0) + '%';
        const speedSlider = document.createElement('input');
        speedSlider.type = 'range';
        speedSlider.min = '0.5';
        speedSlider.max = '2.0';
        speedSlider.step = '0.1';
        speedSlider.value = currentState.ttsRate;
        speedSlider.className = 'accessibility-speed-slider';
        speedSlider.setAttribute('aria-label', 'TTS Speed');
        speedSlider.oninput = function() {
            currentState.ttsRate = parseFloat(this.value);
            speedLabel.textContent = 'TTS Speed: ' + (currentState.ttsRate * 100).toFixed(0) + '%';
            savePreferences();
            // Update current utterance if speaking
            if (isSpeaking && currentUtterance) {
                speechSynthesis.cancel();
                const text = currentUtterance.text;
                const sourceElement = currentUtterance.sourceElement;
                setTimeout(() => speakText(text, sourceElement), 100);
            }
        };
        ttsSpeedControl.appendChild(speedLabel);
        ttsSpeedControl.appendChild(speedSlider);
        readingSection.appendChild(ttsSpeedControl);

        // TTS button
        const ttsBtn = document.createElement('button');
        ttsBtn.id = 'accessibility-tts-btn';
        ttsBtn.className = 'accessibility-btn accessibility-tts-btn'; // Add both classes for proper styling
        ttsBtn.innerHTML = '<i class="bx bx-volume-full"></i> <span>Read Selected Text</span>';
        ttsBtn.setAttribute('aria-label', 'Read selected text with text-to-speech');
        ttsBtn.setAttribute('tabindex', '0');
        ttsBtn.setAttribute('type', 'button'); // Explicit button type
        ttsBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('TTS button clicked, isSpeaking:', isSpeaking);
            
            if (isSpeaking) {
                console.log('Stopping current speech');
                stopSpeaking();
                return;
            }
            
            const selection = window.getSelection();
            let text = selection.toString().trim();
            
            console.log('Selected text:', text ? text.substring(0, 50) + '...' : 'No text selected');
            console.log('Selection range count:', selection.rangeCount);
            
            if (text && selection.rangeCount > 0) {
                // Read selected text and highlight it
                const range = selection.getRangeAt(0);
                const container = range.commonAncestorContainer;
                const element = container.nodeType === Node.TEXT_NODE 
                    ? container.parentElement 
                    : container;
                
                // Enable TTS temporarily for this action
                const wasEnabled = currentState.ttsEnabled;
                currentState.ttsEnabled = true;
                speakText(text, element);
                
                // Restore previous state
                currentState.ttsEnabled = wasEnabled;
            } else {
                // Read page content - get visible text
                const bodyText = document.body.innerText || document.body.textContent || '';
                const textToRead = bodyText.substring(0, 5000).trim();
                console.log('Reading page content:', textToRead ? textToRead.substring(0, 50) + '...' : 'No content found');
                
                if (textToRead) {
                    // Enable TTS temporarily for this action
                    const wasEnabled = currentState.ttsEnabled;
                    currentState.ttsEnabled = true;
                    speakText(textToRead, document.body);
                    
                    // Restore previous state
                    currentState.ttsEnabled = wasEnabled;
                } else {
                    alert('No text found to read. Please select some text on the page first.');
                }
            }
        };
        readingSection.appendChild(ttsBtn);

        // Reading guide toggle
        const readingGuideToggle = createToggleControl('Reading Guide', 'readingGuide', currentState.readingGuide);
        readingSection.appendChild(readingGuideToggle);

        // Reading mask toggle
        const readingMaskToggle = createToggleControl('Reading Mask (Hide Text Below)', 'readingMask', currentState.readingMask);
        readingSection.appendChild(readingMaskToggle);

        // Text highlight toggle
        const textHighlightToggle = createToggleControl('Text Highlight', 'textHighlight', currentState.textHighlight);
        readingSection.appendChild(textHighlightToggle);

        // Braille toggle
        const brailleToggle = createToggleControl('Braille Conversion', 'brailleEnabled', currentState.brailleEnabled);
        readingSection.appendChild(brailleToggle);

        // Language Selector
        const languageSelectorControl = document.createElement('div');
        languageSelectorControl.className = 'accessibility-control';
        const langLabel = document.createElement('label');
        langLabel.className = 'accessibility-control-label';
        langLabel.textContent = 'Interface Language';
        const langSelect = document.createElement('select');
        langSelect.className = 'accessibility-control-select';
        langSelect.setAttribute('aria-label', 'Interface Language');
        langSelect.setAttribute('tabindex', '0');
        
        const languages = [
            { code: 'en', name: 'English' },
            { code: 'es', name: 'Español' },
            { code: 'de', name: 'Deutsch' },
            { code: 'fr', name: 'Français' },
            { code: 'zh', name: '中文' },
            { code: 'ko', name: '한국어' },
            { code: 'no', name: 'Norsk' }
        ];
        
        languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.code;
            option.textContent = lang.name;
            if (lang.code === (document.documentElement.lang || 'en').split('-')[0].toLowerCase()) {
                option.selected = true;
            }
            langSelect.appendChild(option);
        });
        
        langSelect.onchange = function() {
            document.documentElement.lang = this.value;
            // Update TTS language if available
            if (ttsManager) {
                ttsManager.setLanguage(this.value);
            }
            // Update speech recognition language if available
            if (window.speechRecognitionManager) {
                const langMap = {
                    'en': 'en-US',
                    'es': 'es-ES',
                    'de': 'de-DE',
                    'fr': 'fr-FR',
                    'zh': 'zh-CN',
                    'ko': 'ko-KR',
                    'no': 'no-NO'
                };
                window.speechRecognitionManager.setLanguage(langMap[this.value] || 'en-US');
            }
            savePreferences();
        };
        
        languageSelectorControl.appendChild(langLabel);
        languageSelectorControl.appendChild(langSelect);
        readingSection.appendChild(languageSelectorControl);

        // Dictionary Button
        const dictBtn = document.createElement('button');
        dictBtn.id = 'accessibility-dict-btn';
        dictBtn.className = 'accessibility-btn';
        dictBtn.innerHTML = '<i class="bx bx-book"></i> <span>Look Up Word</span>';
        dictBtn.setAttribute('aria-label', 'Look up selected word in dictionary');
        dictBtn.setAttribute('tabindex', '0');
        dictBtn.onclick = async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const selection = window.getSelection();
            let word = selection.toString().trim();
            
            // If no selection, try to get word at cursor
            if (!word && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const textNode = range.startContainer;
                if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                    const text = textNode.textContent;
                    const cursorPos = range.startOffset;
                    // Extract word at cursor
                    const wordMatch = text.substring(0, cursorPos).match(/\b\w+$/);
                    const afterMatch = text.substring(cursorPos).match(/^\w+\b/);
                    if (wordMatch || afterMatch) {
                        word = (wordMatch ? wordMatch[0] : '') + (afterMatch ? afterMatch[0] : '');
                    }
                }
            }
            
            console.log('Dictionary button clicked, selected word:', word);
            console.log('Dictionary manager available:', !!window.dictionaryManager);
            
            if (!word) {
                alert('Please select a word to look up, or click on a word and try again.');
                return;
            }
            
            // Clean the word - extract just the word, remove punctuation
            word = word.replace(/[^\w\s-]/g, '').trim().split(/\s+/)[0];
            
            if (!word) {
                alert('Please select a valid word to look up.');
                return;
            }
            
            // Check if dictionary manager is available, wait a bit if not
            if (!window.dictionaryManager) {
                console.warn('Dictionary manager not found, waiting...');
                // Wait a bit for it to load
                await new Promise(resolve => setTimeout(resolve, 500));
                
                if (!window.dictionaryManager) {
                    alert('Dictionary feature not available. Please make sure dictionary.js is loaded before accessibility-plugin.js.');
                    console.error('Dictionary manager still not available after wait');
                    return;
                }
            }
            
            dictBtn.disabled = true;
            const originalHTML = dictBtn.innerHTML;
            dictBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> <span>Looking up...</span>';
            
            try {
                console.log('Looking up word:', word);
                const result = await window.dictionaryManager.lookupWord(word);
                console.log('Dictionary result:', result);
                
                if (result && result.word) {
                    showDictionaryModal(result);
                } else {
                    alert('Word "' + word + '" not found in dictionary. Please try another word.');
                }
            } catch (error) {
                console.error('Dictionary lookup error:', error);
                const errorMsg = error.message || 'Unknown error';
                alert('Error looking up word: ' + errorMsg + '. Please check your internet connection and try again.');
            } finally {
                dictBtn.disabled = false;
                dictBtn.innerHTML = originalHTML;
            }
        };
        readingSection.appendChild(dictBtn);

        // Speech Recognition (Dictation) Button
        let speechRecognitionBtn = null;
        if (window.speechRecognitionManager && window.speechRecognitionManager.isAvailable()) {
            speechRecognitionBtn = document.createElement('button');
            speechRecognitionBtn.id = 'accessibility-speech-btn';
            speechRecognitionBtn.className = 'accessibility-btn';
            speechRecognitionBtn.innerHTML = '<i class="bx bx-microphone"></i> <span>Start Dictation</span>';
            speechRecognitionBtn.setAttribute('aria-label', 'Start voice dictation');
            speechRecognitionBtn.setAttribute('tabindex', '0');
            
            let isListening = false;
            
            speechRecognitionBtn.onclick = function() {
                if (!isListening) {
                    // Start listening
                    window.speechRecognitionManager.onResult = function(transcript) {
                        // Find active input or textarea
                        const activeElement = document.activeElement;
                        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                            activeElement.value += (activeElement.value ? ' ' : '') + transcript;
                            // Trigger input event
                            activeElement.dispatchEvent(new Event('input', { bubbles: true }));
                        } else {
                            // Show result in modal
                            showSpeechResultModal(transcript);
                        }
                    };
                    
                    window.speechRecognitionManager.onError = function(error) {
                        console.error('Speech recognition error:', error);
                        if (error === 'no-speech') {
                            alert('No speech detected. Please try again.');
                        } else if (error === 'not-allowed') {
                            alert('Microphone permission denied. Please allow microphone access.');
                        } else {
                            alert('Speech recognition error: ' + error);
                        }
                    };
                    
                    if (window.speechRecognitionManager.start()) {
                        isListening = true;
                        speechRecognitionBtn.innerHTML = '<i class="bx bx-microphone"></i> <span>Listening...</span>';
                        speechRecognitionBtn.classList.add('listening');
                    }
                } else {
                    // Stop listening
                    window.speechRecognitionManager.stop();
                    isListening = false;
                    speechRecognitionBtn.innerHTML = '<i class="bx bx-microphone"></i> <span>Start Dictation</span>';
                    speechRecognitionBtn.classList.remove('listening');
                }
            };
            
            window.speechRecognitionManager.onEnd = function() {
                isListening = false;
                if (speechRecognitionBtn) {
                    speechRecognitionBtn.innerHTML = '<i class="bx bx-microphone"></i> <span>Start Dictation</span>';
                    speechRecognitionBtn.classList.remove('listening');
                }
            };
            
            readingSection.appendChild(speechRecognitionBtn);
        }

        // Other Features Section
        const featuresSection = document.createElement('div');
        featuresSection.className = 'accessibility-section';
        featuresSection.innerHTML = '<h4 class="accessibility-section-title">Other Features</h4>';

        // Focus indicator toggle
        const focusIndicatorToggle = createToggleControl('Enhanced Focus Indicator', 'focusIndicator', currentState.focusIndicator);
        featuresSection.appendChild(focusIndicatorToggle);

        // Stop animations toggle
        const stopAnimationsToggle = createToggleControl('Stop Animations', 'stopAnimations', currentState.stopAnimations);
        featuresSection.appendChild(stopAnimationsToggle);

        // Underline links toggle
        const underlineLinksToggle = createToggleControl('Underline All Links', 'underlineLinks', currentState.underlineLinks);
        featuresSection.appendChild(underlineLinksToggle);

        // Show image alt toggle
        const showImageAltToggle = createToggleControl('Show Image Descriptions', 'showImageAlt', currentState.showImageAlt);
        featuresSection.appendChild(showImageAltToggle);

        // Add sections to content
        content.appendChild(textSection);
        content.appendChild(colorSection);
        content.appendChild(readingSection);
        content.appendChild(featuresSection);

        // Reset button
        if (settings.showReset) {
            const resetBtn = document.createElement('button');
            resetBtn.className = 'accessibility-reset-btn';
            resetBtn.innerHTML = '<i class="bx bx-reset"></i> Reset to Defaults';
            resetBtn.onclick = resetSettings;
            content.appendChild(resetBtn);
        }

        // Footer with credits and links
        const footer = document.createElement('div');
        footer.className = 'accessibility-panel-footer';
        footer.innerHTML = '<div class="accessibility-footer-links">' +
            '<a href="https://github.com/airforcerp/Website-Accessibility-Widget" target="_blank" rel="noopener noreferrer" class="accessibility-footer-link">' +
            '<i class="bx bx-download"></i> Get the widget here</a>' +
            '</div>' +
            '<div class="accessibility-footer-credits">' +
            'Made by <a href="https://github.com/airforcerp" target="_blank" rel="noopener noreferrer" class="accessibility-footer-link">AirforceRP</a>' +
            '</div>';
        content.appendChild(footer);

        panel.appendChild(header);
        panel.appendChild(content);
        container.appendChild(toggleBtn);
        container.appendChild(panel);
        
        // Prevent clicks inside panel from closing it
        panel.addEventListener('click', function(e) {
            e.stopPropagation();
        }, true);

        // Always append widget directly to body, never to any wrapper
        const wrapper = document.getElementById('accessibility-content-wrapper');
        if (wrapper) {
            // If wrapper exists, insert before it to keep widget outside
            document.body.insertBefore(container, wrapper);
        } else {
            document.body.appendChild(container);
        }
    }

    // Create a control element
    function createControl(label, settingKey, options, currentValue) {
        const control = document.createElement('div');
        control.className = 'accessibility-control';

        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.className = 'accessibility-control-label';

        const select = document.createElement('select');
        select.className = 'accessibility-control-select';
        select.setAttribute('aria-label', label);
        select.setAttribute('tabindex', '0');

        options.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option.value;
            optionEl.textContent = option.label;
            if (option.value === currentValue) {
                optionEl.selected = true;
            }
            select.appendChild(optionEl);
        });

        select.onchange = function() {
            const value = this.value;
            // Convert to number if it's a numeric string
            currentState[settingKey] = isNaN(value) ? value : parseInt(value);
            applySettings();
            // Announce change to screen readers
            const selectedOption = this.options[this.selectedIndex];
            announceToScreenReader(label + ' changed to ' + selectedOption.text);
        };

        control.appendChild(labelEl);
        control.appendChild(select);

        return control;
    }

    // Update UI to reflect current state
    function updateUI() {
        const panel = document.getElementById('accessibility-panel');
        if (!panel) return;

        // Update selects
        const selects = panel.querySelectorAll('select');
        selects.forEach(select => {
            const settingKey = select.getAttribute('aria-label').toLowerCase().replace(/\s+/g, '');
            const keyMap = {
                'fontsize': 'fontSize',
                'contrast': 'contrast',
                'lineheight': 'lineHeight',
                'letterspacing': 'letterSpacing',
                'fontfamily': 'fontFamily',
                'colorblindnessfilter': 'colorBlindness',
                'ttsvoice': 'ttsVoice',
                'ttslanguage': 'ttsLanguage'
            };
            const key = keyMap[settingKey] || settingKey;
            if (currentState[key] !== undefined) {
                select.value = currentState[key];
            }
        });
        
        // Update language dropdown if TTS Manager is available
        if (ttsManager && ttsManager.isAvailable()) {
            updateLanguageDropdown();
        }

        // Reload voices if TTS voice select exists
        const ttsVoiceSelect = panel.querySelector('select[aria-label="TTS Voice"]');
        if (ttsVoiceSelect && availableVoices.length === 0) {
            loadVoices();
            // Update voice options
            const currentValue = ttsVoiceSelect.value;
            const options = getVoiceOptions();
            ttsVoiceSelect.innerHTML = '';
            options.forEach(option => {
                const optionEl = document.createElement('option');
                optionEl.value = option.value;
                optionEl.textContent = option.label;
                if (option.value === currentValue) {
                    optionEl.selected = true;
                }
                ttsVoiceSelect.appendChild(optionEl);
            });
        }

        // Update toggles
        const toggles = panel.querySelectorAll('.accessibility-toggle-checkbox');
        toggles.forEach(toggle => {
            // Use dataset if available (newer toggles)
            if (toggle.dataset.settingKey) {
                const key = toggle.dataset.settingKey;
                if (key === 'darkMode') {
                    // Special handling for dark mode toggle
                    toggle.checked = currentState.contrast === 'dark';
                } else if (currentState[key] !== undefined) {
                    toggle.checked = Boolean(currentState[key]);
                }
            } else {
                // Fallback to label matching (older toggles)
                const label = toggle.getAttribute('aria-label').toLowerCase().replace(/\s+/g, '');
                const keyMap = {
                    'enabletext-to-speech': 'ttsEnabled',
                    'readingguide': 'readingGuide',
                    'readingmask(hidetextbelow)': 'readingMask',
                    'texthighlight': 'textHighlight',
                    'enhancedfocusindicator': 'focusIndicator',
                    'stopanimations': 'stopAnimations',
                    'underlinealllinks': 'underlineLinks',
                    'showimagedescriptions': 'showImageAlt',
                    'quickdarkmode': 'darkMode'
                };
                const key = keyMap[label] || label;
                if (key === 'darkMode' || label === 'quickdarkmode') {
                    toggle.checked = currentState.contrast === 'dark';
                } else if (currentState[key] !== undefined) {
                    toggle.checked = Boolean(currentState[key]);
                }
            }
        });
        
        // Also update contrast dropdown when dark mode toggle changes
        const darkModeToggle = panel.querySelector('.accessibility-toggle-checkbox[data-setting-key="darkMode"]');
        if (darkModeToggle) {
            darkModeToggle.checked = currentState.contrast === 'dark';
        }
    }

    // Toggle panel visibility
    function togglePanel(e) {
        try {
            console.log('togglePanel called');
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            const panel = document.getElementById('accessibility-panel');
            const toggleBtn = document.getElementById('accessibility-toggle-btn');
            
            console.log('Panel element:', panel);
            console.log('Toggle button element:', toggleBtn);
            
            if (!panel) {
                console.error('Accessibility plugin: Panel not found!');
                return;
            }
            
            if (!toggleBtn) {
                console.error('Accessibility plugin: Toggle button not found!');
                return;
            }
            
            const isHidden = panel.getAttribute('aria-hidden') === 'true';
            console.log('Panel is hidden:', isHidden);
            
            if (isHidden) {
                // Opening panel
                console.log('Opening panel...');
                panel.setAttribute('aria-hidden', 'false');
                panel.classList.add('accessibility-panel-open');
                toggleBtn.classList.add('accessibility-toggle-btn-active');
                
                // Force all visibility properties immediately - use fixed positioning
                const positionStyle = settings.position === 'bottom-right' 
                    ? 'right: 20px !important; left: auto !important;' 
                    : 'left: 20px !important; right: auto !important;';
                
                panel.style.cssText = `display: block !important; opacity: 1 !important; visibility: visible !important; transform: translateY(0) !important; position: fixed !important; z-index: 10001 !important; bottom: 70px !important; width: 260px !important; max-width: calc(100vw - 40px) !important; background: #ffffff !important; border-radius: 8px !important; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important; overflow: hidden !important; ${positionStyle}`;
                
                // Focus management - WCAG 2.4.3 Focus Order
                setTimeout(() => {
                    const firstFocusable = panel.querySelector('button, select, input, [tabindex]:not([tabindex="-1"])');
                    if (firstFocusable) {
                        firstFocusable.focus();
                    }
                }, 100);
                
                // Add keyboard handler for Escape key - WCAG 2.1.1 Keyboard
                const escapeHandler = function(e) {
                    if (e.key === 'Escape' && panel.getAttribute('aria-hidden') === 'false') {
                        e.preventDefault();
                        e.stopPropagation();
                        togglePanel();
                        toggleBtn.focus(); // Return focus to button
                    }
                };
                panel._escapeHandler = escapeHandler;
                document.addEventListener('keydown', escapeHandler, true);
                
                // Trap focus within panel - WCAG 2.4.3 Focus Order
                const focusTrapHandler = function(e) {
                    if (panel.getAttribute('aria-hidden') === 'false') {
                        const focusableElements = panel.querySelectorAll('button, select, input, [tabindex]:not([tabindex="-1"])');
                        const firstElement = focusableElements[0];
                        const lastElement = focusableElements[focusableElements.length - 1];
                        
                        if (e.key === 'Tab') {
                            if (e.shiftKey) {
                                if (document.activeElement === firstElement) {
                                    e.preventDefault();
                                    lastElement.focus();
                                }
                            } else {
                                if (document.activeElement === lastElement) {
                                    e.preventDefault();
                                    firstElement.focus();
                                }
                            }
                        }
                    }
                };
                panel._focusTrapHandler = focusTrapHandler;
                panel.addEventListener('keydown', focusTrapHandler);
                
                // Add click-outside handler after a delay to prevent immediate closure
                setTimeout(() => {
                    if (panel.getAttribute('aria-hidden') === 'false' && !panel.dataset.clickHandlerAdded) {
                        const clickOutsideHandler = function(e) {
                            // Don't close if clicking inside panel or button
                            if (panel.contains(e.target) || toggleBtn.contains(e.target)) {
                                return;
                            }
                            // Close the panel
                            if (panel.getAttribute('aria-hidden') === 'false') {
                                togglePanel();
                            }
                        };
                        
                        // Store handler reference for cleanup
                        panel._clickOutsideHandler = clickOutsideHandler;
                        panel.dataset.clickHandlerAdded = 'true';
                        document.addEventListener('click', clickOutsideHandler, true);
                    }
                }, 200);
            } else {
                // Closing panel
                console.log('Closing panel...');
                panel.setAttribute('aria-hidden', 'true');
                panel.setAttribute('aria-modal', 'false');
                toggleBtn.setAttribute('aria-expanded', 'false');
                panel.classList.remove('accessibility-panel-open');
                toggleBtn.classList.remove('accessibility-toggle-btn-active');
                
                // Announce to screen readers
                announceToScreenReader('Accessibility options panel closed');
                
                // Remove click-outside handler if it exists
                if (panel._clickOutsideHandler) {
                    document.removeEventListener('click', panel._clickOutsideHandler, true);
                    panel._clickOutsideHandler = null;
                    panel.dataset.clickHandlerAdded = 'false';
                }
                
                // Remove keyboard handlers
                if (panel._escapeHandler) {
                    document.removeEventListener('keydown', panel._escapeHandler, true);
                    panel._escapeHandler = null;
                }
                if (panel._focusTrapHandler) {
                    panel.removeEventListener('keydown', panel._focusTrapHandler);
                    panel._focusTrapHandler = null;
                }
                
                // Delay hiding to allow transition
                setTimeout(() => {
                    if (panel.getAttribute('aria-hidden') === 'true') {
                        panel.style.opacity = '0';
                        panel.style.visibility = 'hidden';
                        panel.style.transform = 'translateY(10px)';
                        setTimeout(() => {
                            if (panel.getAttribute('aria-hidden') === 'true') {
                                panel.style.display = 'none';
                            }
                        }, 300);
                    }
                }, 10);
            }
        } catch (error) {
            console.error('Accessibility plugin error in togglePanel:', error);
        }
    }

    // Reset to default settings
    function resetSettings() {
        currentState = {
            fontSize: defaultSettings.fontSize,
            contrast: defaultSettings.contrast,
            lineHeight: defaultSettings.lineHeight,
            letterSpacing: defaultSettings.letterSpacing,
            fontFamily: defaultSettings.fontFamily,
            colorBlindness: defaultSettings.colorBlindness,
            focusIndicator: defaultSettings.focusIndicator,
            readingGuide: defaultSettings.readingGuide,
            stopAnimations: defaultSettings.stopAnimations,
            underlineLinks: defaultSettings.underlineLinks,
            showImageAlt: defaultSettings.showImageAlt,
            ttsEnabled: defaultSettings.ttsEnabled,
            ttsRate: defaultSettings.ttsRate,
            ttsPitch: defaultSettings.ttsPitch,
            ttsVolume: defaultSettings.ttsVolume,
            ttsVoice: defaultSettings.ttsVoice,
            readingMask: defaultSettings.readingMask,
            textHighlight: defaultSettings.textHighlight
        };
        stopSpeaking();
        disableReadingGuide();
        disableReadingMask();
        disableTextHighlight();
        disableBraille();
        applySettings();
    }

    // Initialize plugin when DOM is ready
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        // Wait for modules to load (with timeout)
        let attempts = 0;
        const maxAttempts = 20; // 2 seconds max wait
        
        const checkModules = setInterval(() => {
            attempts++;
            const ttsReady = typeof window.ttsManager !== 'undefined' || 'speechSynthesis' in window;
            const dictReady = typeof window.dictionaryManager !== 'undefined';
            
            // Dictionary is optional, only wait for TTS
            if (ttsReady || attempts >= maxAttempts) {
                clearInterval(checkModules);
                console.log('Initializing plugin - TTS:', ttsReady, 'Dictionary:', dictReady);
                initializePlugin();
            }
        }, 100);
    }
    
    function initializePlugin() {
        console.log('Initializing accessibility plugin...');
        console.log('TTS Manager available:', !!window.ttsManager);
        console.log('Dictionary Manager available:', !!window.dictionaryManager);
        console.log('Speech Recognition available:', !!window.speechRecognitionManager);
        console.log('Speech Synthesis API available:', 'speechSynthesis' in window);
        
        initTTS();
        loadPreferences();
        createWidget();
        applySettings();

        // Handle text selection for TTS
        document.addEventListener('mouseup', function() {
            if (currentState.ttsEnabled) {
                selectedText = window.getSelection().toString().trim();
            }
        });
    }

    // Dictionary Modal
    function showDictionaryModal(wordData) {
        console.log('Showing dictionary modal for:', wordData);
        
        // Remove existing modal if any
        const existingModal = document.getElementById('accessibility-dict-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.id = 'accessibility-dict-modal';
        modal.className = 'accessibility-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'dict-modal-title');
        
        let content = '';
        try {
            if (window.dictionaryManager && typeof window.dictionaryManager.formatDefinition === 'function') {
                console.log('Using dictionary manager formatDefinition');
                content = window.dictionaryManager.formatDefinition(wordData);
            } else {
                console.log('Using fallback formatDefinition');
                // Fallback formatting
                content = formatDictionaryFallback(wordData);
            }
        } catch (error) {
            console.error('Error formatting dictionary result:', error);
            content = formatDictionaryFallback(wordData);
        }
        
        modal.innerHTML = `
            <div class="accessibility-modal-content">
                <div class="accessibility-modal-header">
                    <h3 id="dict-modal-title">Dictionary</h3>
                    <button class="accessibility-modal-close" aria-label="Close dictionary" type="button">
                        <i class="bx bx-x"></i>
                    </button>
                </div>
                <div class="accessibility-modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close button
        const closeBtn = modal.querySelector('.accessibility-modal-close');
        closeBtn.onclick = function() {
            modal.remove();
        };
        
        // Close on outside click
        modal.onclick = function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        };
        
        // Close on Escape key
        const escapeHandler = function(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }
    
    // Fallback dictionary formatting
    function formatDictionaryFallback(wordData) {
        if (!wordData) {
            return '<div class="dictionary-result"><p>Definition not found.</p></div>';
        }

        let html = `<div class="dictionary-result">`;
        html += `<h4>${wordData.word || 'Unknown'}</h4>`;
        
        if (wordData.phonetic) {
            html += `<p class="phonetic">${wordData.phonetic}</p>`;
        }

        if (wordData.meanings && wordData.meanings.length > 0) {
            wordData.meanings.forEach(meaning => {
                html += `<div class="meaning-section">`;
                html += `<strong>${meaning.partOfSpeech || 'Unknown'}</strong>`;
                
                if (meaning.definitions && meaning.definitions.length > 0) {
                    html += `<ul>`;
                    meaning.definitions.slice(0, 3).forEach(def => {
                        html += `<li>${def.definition || ''}</li>`;
                        if (def.example) {
                            html += `<em>Example: ${def.example}</em>`;
                        }
                    });
                    html += `</ul>`;
                } else {
                    html += `<p>No definitions available.</p>`;
                }
                
                html += `</div>`;
            });
        } else {
            html += `<p>No meanings found for this word.</p>`;
        }

        html += `</div>`;
        return html;
    }
    
    // Speech Result Modal
    function showSpeechResultModal(transcript) {
        const existingModal = document.getElementById('accessibility-speech-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.id = 'accessibility-speech-modal';
        modal.className = 'accessibility-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'speech-modal-title');
        
        modal.innerHTML = `
            <div class="accessibility-modal-content">
                <div class="accessibility-modal-header">
                    <h3 id="speech-modal-title">Dictation Result</h3>
                    <button class="accessibility-modal-close" aria-label="Close" type="button">
                        <i class="bx bx-x"></i>
                    </button>
                </div>
                <div class="accessibility-modal-body">
                    <p><strong>You said:</strong></p>
                    <p style="font-size: 1.1em; margin: 10px 0;">${transcript}</p>
                    <button class="accessibility-btn" onclick="navigator.clipboard.writeText('${transcript.replace(/'/g, "\\'")}').then(() => alert('Copied to clipboard!'))">
                        <i class="bx bx-copy"></i> Copy to Clipboard
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('.accessibility-modal-close');
        closeBtn.onclick = function() {
            modal.remove();
        };
        
        modal.onclick = function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        };
    }

    // Start initialization
    init();

    // Expose API for external use
    window.AccessibilityPlugin = {
        toggle: togglePanel,
        reset: resetSettings,
        getSettings: function() { return { ...currentState }; },
        setFontSize: function(size) {
            currentState.fontSize = size;
            applySettings();
        },
        setContrast: function(contrast) {
            currentState.contrast = contrast;
            applySettings();
        },
        setColorBlindness: function(type) {
            currentState.colorBlindness = type;
            applySettings();
        },
        speak: function(text) {
            speakText(text);
        },
        stopSpeaking: stopSpeaking
    };

})();
