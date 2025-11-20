/**
 * TTS (Text-to-Speech) Module
 * Multi-language support for Accessibility Widget
 * Supports: English, Spanish, German, French, Mandarin, Korean, Norwegian
 */

(function() {
    'use strict';

    // Language configuration
    const TTS_LANGUAGES = {
        'en': {
            name: 'English',
            code: 'en-US',
            voices: ['en-US', 'en-GB', 'en-AU', 'en-CA'],
            fallback: 'en-US'
        },
        'es': {
            name: 'Español',
            code: 'es-ES',
            voices: ['es-ES', 'es-MX', 'es-AR', 'es-CO'],
            fallback: 'es-ES'
        },
        'de': {
            name: 'Deutsch',
            code: 'de-DE',
            voices: ['de-DE', 'de-AT', 'de-CH'],
            fallback: 'de-DE'
        },
        'fr': {
            name: 'Français',
            code: 'fr-FR',
            voices: ['fr-FR', 'fr-CA', 'fr-BE', 'fr-CH'],
            fallback: 'fr-FR'
        },
        'zh': {
            name: '中文 (Mandarin)',
            code: 'zh-CN',
            voices: ['zh-CN', 'zh-TW', 'zh-HK'],
            fallback: 'zh-CN'
        },
        'ko': {
            name: '한국어',
            code: 'ko-KR',
            voices: ['ko-KR'],
            fallback: 'ko-KR'
        },
        'no': {
            name: 'Norsk',
            code: 'no-NO',
            voices: ['no-NO', 'nb-NO', 'nn-NO'],
            fallback: 'no-NO'
        }
    };

    // Language detection patterns
    const LANGUAGE_PATTERNS = {
        'en': /\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/i,
        'es': /\b(el|la|los|las|y|o|pero|en|de|con|por|para)\b/i,
        'de': /\b(der|die|das|und|oder|aber|in|von|mit|für|zu)\b/i,
        'fr': /\b(le|la|les|et|ou|mais|dans|de|avec|pour|par)\b/i,
        'zh': /[\u4e00-\u9fff]/,
        'ko': /[\uac00-\ud7a3]/,
        'no': /\b(og|eller|men|i|av|med|for|til|på)\b/i
    };

    // TTS Manager Class
    class TTSManager {
        constructor() {
            this.synthesis = null;
            this.availableVoices = [];
            this.currentLanguage = 'en';
            this.currentVoice = null;
            this.isSpeaking = false;
            this.currentUtterance = null;
            this.rate = 1.0;
            this.pitch = 1.0;
            this.volume = 1.0;
            this.onLanguageChange = null;
            this.onVoiceChange = null;
            
            this.init();
        }

        init() {
            if ('speechSynthesis' in window) {
                this.synthesis = window.speechSynthesis;
                console.log('TTS Manager: Speech Synthesis API available');
                this.loadVoices();
                
                // Some browsers load voices asynchronously
                if (this.synthesis.onvoiceschanged !== undefined) {
                    this.synthesis.onvoiceschanged = () => {
                        console.log('TTS Manager: Voices changed, reloading...');
                        this.loadVoices();
                        if (this.onVoiceChange) {
                            this.onVoiceChange();
                        }
                    };
                }
                
                // Also try loading voices after a delay
                setTimeout(() => {
                    this.loadVoices();
                    console.log('TTS Manager: Loaded', this.availableVoices.length, 'voices');
                }, 500);
            } else {
                console.warn('TTS Manager: Speech Synthesis API not supported in this browser');
            }
        }

        loadVoices() {
            if (this.synthesis) {
                const voices = this.synthesis.getVoices();
                if (voices.length > 0) {
                    this.availableVoices = voices;
                    console.log('TTS Manager: Loaded', voices.length, 'voices');
                    this.selectBestVoice();
                } else {
                    console.warn('TTS Manager: No voices available yet');
                }
            } else {
                console.warn('TTS Manager: No synthesis available');
            }
        }

        detectLanguage(text) {
            if (!text || text.trim() === '') return 'en';

            // Check for Chinese characters
            if (LANGUAGE_PATTERNS['zh'].test(text)) {
                return 'zh';
            }

            // Check for Korean characters
            if (LANGUAGE_PATTERNS['ko'].test(text)) {
                return 'ko';
            }

            // Check for other languages using word patterns
            let maxMatches = 0;
            let detectedLang = 'en';

            for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
                if (lang === 'zh' || lang === 'ko') continue; // Already checked
                
                const matches = (text.match(pattern) || []).length;
                if (matches > maxMatches) {
                    maxMatches = matches;
                    detectedLang = lang;
                }
            }

            return detectedLang;
        }

        selectBestVoice(language = null) {
            if (!this.synthesis || this.availableVoices.length === 0) return;

            const lang = language || this.currentLanguage;
            const langConfig = TTS_LANGUAGES[lang];
            if (!langConfig) return;

            // Try to find a voice matching the language
            let bestVoice = null;
            
            // First, try exact match
            for (const voiceCode of langConfig.voices) {
                bestVoice = this.availableVoices.find(v => 
                    v.lang === voiceCode || v.lang.startsWith(voiceCode.split('-')[0])
                );
                if (bestVoice) break;
            }

            // Fallback to any voice with matching language prefix
            if (!bestVoice) {
                const langPrefix = langConfig.code.split('-')[0];
                bestVoice = this.availableVoices.find(v => 
                    v.lang.startsWith(langPrefix)
                );
            }

            // Final fallback to default voice
            if (!bestVoice && this.availableVoices.length > 0) {
                bestVoice = this.availableVoices[0];
            }

            this.currentVoice = bestVoice;
            return bestVoice;
        }

        setLanguage(language) {
            if (!TTS_LANGUAGES[language]) {
                console.warn('Unsupported language:', language);
                return false;
            }

            this.currentLanguage = language;
            this.selectBestVoice(language);
            
            if (this.onLanguageChange) {
                this.onLanguageChange(language, TTS_LANGUAGES[language].name);
            }

            return true;
        }

        setVoice(voiceName) {
            if (!this.availableVoices) return false;

            const voice = this.availableVoices.find(v => 
                v.name === voiceName || 
                v.voiceURI === voiceName ||
                v.name.toLowerCase().includes(voiceName.toLowerCase())
            );

            if (voice) {
                this.currentVoice = voice;
                if (this.onVoiceChange) {
                    this.onVoiceChange(voice);
                }
                return true;
            }

            return false;
        }

        setRate(rate) {
            this.rate = Math.max(0.5, Math.min(2.0, rate));
        }

        setPitch(pitch) {
            this.pitch = Math.max(0, Math.min(2.0, pitch));
        }

        setVolume(volume) {
            this.volume = Math.max(0, Math.min(1.0, volume));
        }

        speak(text, language = null, options = {}) {
            if (!this.synthesis) {
                console.error('TTS Manager: Speech Synthesis not available');
                return Promise.reject(new Error('Speech Synthesis not available'));
            }
            
            if (!text || text.trim() === '') {
                console.error('TTS Manager: Invalid text provided');
                return Promise.reject(new Error('Invalid text'));
            }
            
            console.log('TTS Manager: Speaking text:', text.substring(0, 50) + '...');

            // Stop any current speech
            this.stop();

            // Detect language if not provided
            const detectedLang = language || this.detectLanguage(text);
            
            // Set language
            if (detectedLang !== this.currentLanguage) {
                this.setLanguage(detectedLang);
            }

            // Create utterance
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = TTS_LANGUAGES[detectedLang].code;
            utterance.rate = options.rate || this.rate;
            utterance.pitch = options.pitch || this.pitch;
            utterance.volume = options.volume || this.volume;

            // Set voice - ensure voices are loaded
            if (this.availableVoices.length === 0) {
                this.loadVoices();
            }
            
            // Set voice
            if (this.currentVoice) {
                utterance.voice = this.currentVoice;
                console.log('TTS Manager: Using voice:', this.currentVoice.name, this.currentVoice.lang);
            } else {
                this.selectBestVoice(detectedLang);
                if (this.currentVoice) {
                    utterance.voice = this.currentVoice;
                    console.log('TTS Manager: Selected best voice:', this.currentVoice.name, this.currentVoice.lang);
                } else {
                    console.warn('TTS Manager: No voice selected, using default');
                }
            }

            this.currentUtterance = utterance;
            this.isSpeaking = true;

            return new Promise((resolve, reject) => {
                utterance.onend = () => {
                    this.isSpeaking = false;
                    this.currentUtterance = null;
                    resolve();
                };

                utterance.onerror = (error) => {
                    this.isSpeaking = false;
                    this.currentUtterance = null;
                    reject(error);
                };

                this.synthesis.speak(utterance);
            });
        }

        stop() {
            if (this.synthesis && this.isSpeaking) {
                this.synthesis.cancel();
                this.isSpeaking = false;
                this.currentUtterance = null;
            }
        }

        pause() {
            if (this.synthesis && this.isSpeaking) {
                this.synthesis.pause();
            }
        }

        resume() {
            if (this.synthesis && this.isSpeaking) {
                this.synthesis.resume();
            }
        }

        getAvailableLanguages() {
            return Object.keys(TTS_LANGUAGES).map(code => ({
                code: code,
                name: TTS_LANGUAGES[code].name,
                nativeName: TTS_LANGUAGES[code].name
            }));
        }

        getAvailableVoicesForLanguage(language) {
            if (!this.availableVoices) return [];

            const langConfig = TTS_LANGUAGES[language];
            if (!langConfig) return [];

            return this.availableVoices.filter(voice => {
                return langConfig.voices.some(voiceCode => 
                    voice.lang === voiceCode || voice.lang.startsWith(voiceCode.split('-')[0])
                );
            });
        }

        getCurrentLanguage() {
            return {
                code: this.currentLanguage,
                name: TTS_LANGUAGES[this.currentLanguage].name
            };
        }

        getCurrentVoice() {
            return this.currentVoice;
        }

        isAvailable() {
            return 'speechSynthesis' in window && this.synthesis !== null;
        }
    }

    // Export TTS Manager
    if (typeof window !== 'undefined') {
        window.TTSManager = TTSManager;
        
        // Create global instance
        window.ttsManager = new TTSManager();
        
        // Also expose language constants
        window.TTS_LANGUAGES = TTS_LANGUAGES;
    }

    // Export for Node.js/CommonJS if needed
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TTSManager;
    }

})();

