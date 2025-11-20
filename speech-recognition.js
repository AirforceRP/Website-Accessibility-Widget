/**
 * Speech Recognition (Dictation) Module
 * Provides voice input functionality
 */

(function() {
    'use strict';

    class SpeechRecognitionManager {
        constructor() {
            this.recognition = null;
            this.isListening = false;
            this.onResult = null;
            this.onError = null;
            this.onEnd = null;
            this.currentLanguage = 'en-US';
            this.supported = false;
            
            this.init();
        }

        init() {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            if (SpeechRecognition) {
                this.recognition = new SpeechRecognition();
                this.supported = true;
                
                // Default settings
                this.recognition.continuous = false;
                this.recognition.interimResults = false;
                this.recognition.lang = this.currentLanguage;
                
                // Event handlers
                this.recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    if (this.onResult) {
                        this.onResult(transcript, event.results);
                    }
                };
                
                this.recognition.onerror = (event) => {
                    console.error('Speech recognition error:', event.error);
                    if (this.onError) {
                        this.onError(event.error);
                    }
                };
                
                this.recognition.onend = () => {
                    this.isListening = false;
                    if (this.onEnd) {
                        this.onEnd();
                    }
                };
                
                console.log('Speech Recognition initialized');
            } else {
                console.warn('Speech Recognition API not supported in this browser');
                this.supported = false;
            }
        }

        setLanguage(language) {
            this.currentLanguage = language;
            if (this.recognition) {
                this.recognition.lang = language;
            }
        }

        getLanguage() {
            return this.currentLanguage;
        }

        start() {
            if (!this.supported || !this.recognition) {
                console.error('Speech Recognition not available');
                return false;
            }

            if (this.isListening) {
                this.stop();
            }

            try {
                this.recognition.start();
                this.isListening = true;
                console.log('Speech Recognition started');
                return true;
            } catch (error) {
                console.error('Failed to start speech recognition:', error);
                return false;
            }
        }

        stop() {
            if (this.recognition && this.isListening) {
                try {
                    this.recognition.stop();
                    this.isListening = false;
                    console.log('Speech Recognition stopped');
                } catch (error) {
                    console.error('Failed to stop speech recognition:', error);
                }
            }
        }

        isAvailable() {
            return this.supported && this.recognition !== null;
        }

        getSupportedLanguages() {
            // Common speech recognition languages
            return [
                { code: 'en-US', name: 'English (US)' },
                { code: 'en-GB', name: 'English (UK)' },
                { code: 'es-ES', name: 'Español (Spain)' },
                { code: 'es-MX', name: 'Español (Mexico)' },
                { code: 'de-DE', name: 'Deutsch' },
                { code: 'fr-FR', name: 'Français' },
                { code: 'zh-CN', name: '中文 (Mandarin)' },
                { code: 'ko-KR', name: '한국어' },
                { code: 'no-NO', name: 'Norsk' },
                { code: 'it-IT', name: 'Italiano' },
                { code: 'ja-JP', name: '日本語' },
                { code: 'fr-CA', name: 'Français (Canada)' },
                { code: 'de-AT', name: 'Deutsch (Österreich)' },
                { code: 'de-CH', name: 'Deutsch (Schweiz)' },
                { code: 'fr-BE', name: 'Français (Belgique)' },
                { code: 'fr-CH', name: 'Français (Suisse)' },
                { code: 'en-AU', name: 'English (Australia)' },
                { code: 'en-CA', name: 'English (Canada)' },
                { code: 'en-NZ', name: 'English (New Zealand)' },
                { code: 'en-ZA', name: 'English (South Africa)' },
                { code: 'en-IN', name: 'English (India)' },
                { code: 'en-IE', name: 'English (Ireland)' },
                { code: 'en-SG', name: 'English (Singapore)' },
                { code: 'pl-PL', name: 'Polski' },
                { code: 'ru-RU', name: 'Русский' },
                { code: 'ar-SA', name: 'العربية' },
                { code: 'hi-IN', name: 'हिन्दी' },
                { code: 'bn-BD', name: 'বাংলা' },
                { code: 'ta-IN', name: 'தமிழ்' },
                { code: 'te-IN', name: 'తెలుగు' },
                { code: 'mr-IN', name: 'मराठी' },
                { code: 'ur-PK', name: 'اردو' },
                { code: 'fa-IR', name: 'فارسی' },
                { code: 'he-IL', name: 'עברית' },
                { code: 'nl-NL', name: 'Nederlands' },
                { code: 'sv-SE', name: 'Svenska' },
                { code: 'da-DK', name: 'Dansk' }
            ];
        }
    }

    // Export Speech Recognition Manager
    if (typeof window !== 'undefined') {
        window.SpeechRecognitionManager = SpeechRecognitionManager;
        window.speechRecognitionManager = new SpeechRecognitionManager();
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SpeechRecognitionManager;
    }

})();

