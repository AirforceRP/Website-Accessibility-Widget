/**
 * Accessibility Plugin - Main JavaScript File
 * Provides comprehensive accessibility features including TTS, color blindness filters, and more
 */

(function() {
    'use strict';

    // Default settings
    const defaultSettings = {
        fontSize: 100, // percentage
        contrast: 'normal', // normal, high, dark
        lineHeight: 'normal', // normal, large
        letterSpacing: 'normal', // normal, wide
        fontFamily: 'default', // default, sans-serif, serif, monospace, braille
        ttsVoice: '', // TTS voice name
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
        ttsVoice: settings.ttsVoice || ''
    };

    // TTS variables
    let speechSynthesis = null;
    let currentUtterance = null;
    let isSpeaking = false;
    let selectedText = '';
    let availableVoices = [];

    // Reading guide variables
    let readingGuideElement = null;
    let readingGuideActive = false;
    let moveReadingGuideHandler = null;

    // Initialize TTS
    function initTTS() {
        if ('speechSynthesis' in window) {
            speechSynthesis = window.speechSynthesis;
            loadVoices();
            // Some browsers load voices asynchronously
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = loadVoices;
            }
        }
    }

    // Load available TTS voices
    function loadVoices() {
        if (speechSynthesis) {
            availableVoices = speechSynthesis.getVoices();
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

        body.style.filter = 'url(#colorblind-filter)';
    }

    // Apply accessibility settings to the page
    function applySettings() {
        const root = document.documentElement;
        const body = document.body;

        // Font size
        root.style.setProperty('--accessibility-font-size', currentState.fontSize + '%');
        body.style.fontSize = currentState.fontSize + '%';

        // Contrast
        body.classList.remove('accessibility-contrast-normal', 'accessibility-contrast-high', 'accessibility-contrast-dark');
        body.classList.add('accessibility-contrast-' + currentState.contrast);

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

        // Reading guide
        if (currentState.readingGuide) {
            enableReadingGuide();
        } else {
            disableReadingGuide();
        }

        savePreferences();
        updateUI();
    }

    // TTS Functions
    function speakText(text) {
        if (!speechSynthesis || !currentState.ttsEnabled) return;

        // Stop any current speech
        stopSpeaking();

        if (!text || text.trim() === '') return;

        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.rate = currentState.ttsRate;
        currentUtterance.pitch = currentState.ttsPitch;
        currentUtterance.volume = currentState.ttsVolume;
        currentUtterance.lang = document.documentElement.lang || 'en-US';
        
        // Set voice if selected
        if (currentState.ttsVoice && availableVoices.length > 0) {
            const selectedVoice = availableVoices.find(voice => 
                voice.name === currentState.ttsVoice || 
                voice.voiceURI === currentState.ttsVoice
            );
            if (selectedVoice) {
                currentUtterance.voice = selectedVoice;
            }
        }

        currentUtterance.onstart = function() {
            isSpeaking = true;
            updateTTSButton();
        };

        currentUtterance.onend = function() {
            isSpeaking = false;
            updateTTSButton();
        };

        currentUtterance.onerror = function() {
            isSpeaking = false;
            updateTTSButton();
        };

        speechSynthesis.speak(currentUtterance);
    }

    function stopSpeaking() {
        if (speechSynthesis && isSpeaking) {
            speechSynthesis.cancel();
            isSpeaking = false;
            updateTTSButton();
        }
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
        const options = [{ value: '', label: 'Default Voice' }];
        if (availableVoices.length > 0) {
            availableVoices.forEach(voice => {
                options.push({
                    value: voice.name,
                    label: voice.name + (voice.lang ? ' (' + voice.lang + ')' : '')
                });
            });
        }
        return options;
    }

    // Reading guide functions
    function moveReadingGuide(e) {
        if (!readingGuideElement || !readingGuideActive) return;
        const scrollY = window.scrollY || window.pageYOffset;
        const scrollX = window.scrollX || window.pageXOffset;
        readingGuideElement.style.top = (e.clientY + scrollY - 50) + 'px';
        readingGuideElement.style.left = (e.clientX + scrollX - 1) + 'px';
        readingGuideElement.style.display = 'block';
    }

    function enableReadingGuide() {
        if (readingGuideActive) return;

        readingGuideElement = document.createElement('div');
        readingGuideElement.id = 'accessibility-reading-guide';
        readingGuideElement.className = 'accessibility-reading-guide';
        readingGuideElement.style.display = 'none';
        document.body.appendChild(readingGuideElement);

        moveReadingGuideHandler = moveReadingGuide;
        document.addEventListener('mousemove', moveReadingGuideHandler);
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
            readingGuideElement.remove();
            readingGuideElement = null;
        }

        if (moveReadingGuideHandler) {
            document.removeEventListener('mousemove', moveReadingGuideHandler);
            moveReadingGuideHandler = null;
        }
        readingGuideActive = false;
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

    // Create toggle control
    function createToggleControl(label, settingKey, currentValue) {
        const control = document.createElement('div');
        control.className = 'accessibility-control accessibility-control-toggle';

        const labelEl = document.createElement('label');
        labelEl.className = 'accessibility-toggle-label';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'accessibility-toggle-checkbox';
        checkbox.checked = currentValue;
        checkbox.setAttribute('aria-label', label);
        
        const span = document.createElement('span');
        span.className = 'accessibility-toggle-slider';
        
        const text = document.createElement('span');
        text.className = 'accessibility-toggle-text';
        text.textContent = label;

        checkbox.onchange = function() {
            currentState[settingKey] = this.checked;
            applySettings();
        };

        labelEl.appendChild(checkbox);
        labelEl.appendChild(span);
        labelEl.appendChild(text);
        control.appendChild(labelEl);

        return control;
    }

    // Create the widget UI
    function createWidget() {
        // Create container
        const container = document.createElement('div');
        container.id = 'accessibility-plugin-widget';
        container.className = 'accessibility-widget accessibility-widget-' + settings.position;

        // Create toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'accessibility-toggle-btn';
        toggleBtn.className = 'accessibility-toggle-btn';
        toggleBtn.setAttribute('aria-label', 'Toggle Accessibility Options');
        toggleBtn.innerHTML = '<i class="bx bx-accessibility accessibility-icon"></i> <span>' + settings.buttonText + '</span>';
        toggleBtn.onclick = togglePanel;

        // Create panel
        const panel = document.createElement('div');
        panel.id = 'accessibility-panel';
        panel.className = 'accessibility-panel';
        panel.setAttribute('aria-hidden', 'true');

        // Panel header
        const header = document.createElement('div');
        header.className = 'accessibility-panel-header';
        header.innerHTML = '<h3><i class="bx bx-cog"></i> Accessibility Options</h3><button class="accessibility-close-btn" aria-label="Close"><i class="bx bx-x"></i></button>';
        header.querySelector('.accessibility-close-btn').onclick = togglePanel;

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

        // TTS Voice selection
        loadVoices(); // Ensure voices are loaded
        const ttsVoiceControl = createControl('TTS Voice', 'ttsVoice', getVoiceOptions(), currentState.ttsVoice);
        const ttsVoiceSelect = ttsVoiceControl.querySelector('select');
        ttsVoiceSelect.onchange = function() {
            currentState.ttsVoice = this.value;
            savePreferences();
        };
        readingSection.appendChild(ttsVoiceControl);

        // TTS button
        const ttsBtn = document.createElement('button');
        ttsBtn.id = 'accessibility-tts-btn';
        ttsBtn.className = 'accessibility-tts-btn';
        ttsBtn.innerHTML = '<i class="bx bx-volume-full"></i> <span>Read Selected Text</span>';
        ttsBtn.onclick = function() {
            if (isSpeaking) {
                stopSpeaking();
            } else {
                const text = window.getSelection().toString().trim();
                if (text) {
                    speakText(text);
                } else {
                    // Read page content
                    const bodyText = document.body.innerText || document.body.textContent;
                    speakText(bodyText.substring(0, 5000)); // Limit to first 5000 chars
                }
            }
        };
        readingSection.appendChild(ttsBtn);

        // Reading guide toggle
        const readingGuideToggle = createToggleControl('Reading Guide', 'readingGuide', currentState.readingGuide);
        readingSection.appendChild(readingGuideToggle);

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
            '<a href="https://github.com/airforcerp/Website-Accessibility-Filter" target="_blank" rel="noopener noreferrer" class="accessibility-footer-link">' +
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

        document.body.appendChild(container);
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
                'ttsvoice': 'ttsVoice'
            };
            const key = keyMap[settingKey] || settingKey;
            if (currentState[key] !== undefined) {
                select.value = currentState[key];
            }
        });

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
            const label = toggle.getAttribute('aria-label').toLowerCase().replace(/\s+/g, '');
            const keyMap = {
                'enabletext-to-speech': 'ttsEnabled',
                'readingguide': 'readingGuide',
                'enhancedfocusindicator': 'focusIndicator',
                'stopanimations': 'stopAnimations',
                'underlinealllinks': 'underlineLinks',
                'showimagedescriptions': 'showImageAlt'
            };
            const key = keyMap[label] || label;
            if (currentState[key] !== undefined) {
                toggle.checked = currentState[key];
            }
        });
    }

    // Toggle panel visibility
    function togglePanel() {
        const panel = document.getElementById('accessibility-panel');
        const toggleBtn = document.getElementById('accessibility-toggle-btn');
        
        if (panel && toggleBtn) {
            const isHidden = panel.getAttribute('aria-hidden') === 'true';
            panel.setAttribute('aria-hidden', !isHidden);
            panel.classList.toggle('accessibility-panel-open');
            toggleBtn.classList.toggle('accessibility-toggle-btn-active');
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
            ttsVoice: defaultSettings.ttsVoice
        };
        stopSpeaking();
        disableReadingGuide();
        applySettings();
    }

    // Initialize plugin when DOM is ready
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

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
