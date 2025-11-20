/**
 * Dictionary Module
 * Provides word definitions and translations
 */

(function() {
    'use strict';

    // Dictionary API - Using Free Dictionary API
    const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
    
    // Language codes for translation
    const TRANSLATION_LANGUAGES = {
        'en': 'English',
        'es': 'Spanish',
        'de': 'German',
        'fr': 'French',
        'zh': 'Chinese',
        'ko': 'Korean',
        'no': 'Norwegian'
    };

    class DictionaryManager {
        constructor() {
            this.currentLanguage = 'en';
            this.cache = new Map();
        }

        async lookupWord(word) {
            if (!word || word.trim() === '') {
                console.warn('Dictionary: Empty word provided');
                return null;
            }

            const cleanWord = word.toLowerCase().trim().replace(/[^\w\s]/g, ''); // Remove punctuation
            
            console.log('Dictionary: Looking up word:', cleanWord);
            
            // Check cache
            if (this.cache.has(cleanWord)) {
                console.log('Dictionary: Found in cache');
                return this.cache.get(cleanWord);
            }

            try {
                const apiUrl = `${DICTIONARY_API}${encodeURIComponent(cleanWord)}`;
                console.log('Dictionary: Fetching from API:', apiUrl);
                
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    },
                    mode: 'cors' // Explicitly set CORS mode
                });
                
                console.log('Dictionary: Response status:', response.status, response.statusText);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        console.log('Dictionary: Word not found (404)');
                        return null;
                    }
                    const errorText = await response.text().catch(() => 'Unknown error');
                    console.error('Dictionary: API error response:', errorText);
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Dictionary: Received data:', data);
                
                // Validate data structure
                if (!Array.isArray(data) || data.length === 0) {
                    console.warn('Dictionary: Invalid data structure');
                    return null;
                }
                
                if (data && data.length > 0) {
                    const result = {
                        word: data[0].word,
                        phonetic: data[0].phonetic || '',
                        meanings: data[0].meanings || [],
                        sourceUrls: data[0].sourceUrls || []
                    };
                    
                    console.log('Dictionary: Formatted result:', result);
                    
                    // Cache the result
                    this.cache.set(cleanWord, result);
                    return result;
                } else {
                    console.warn('Dictionary: Empty data array');
                    return null;
                }
            } catch (error) {
                console.error('Dictionary lookup error:', error);
                console.error('Error details:', error.message, error.stack);
                return null;
            }
        }

        formatDefinition(wordData) {
            if (!wordData) {
                console.warn('Dictionary: No word data provided');
                return '<div class="dictionary-result"><p>Definition not found.</p></div>';
            }

            console.log('Dictionary: Formatting definition for:', wordData.word);
            
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
                    }
                    
                    html += `</div>`;
                });
            } else {
                html += `<p>No definitions found.</p>`;
            }

            html += `</div>`;
            return html;
        }

        setLanguage(lang) {
            this.currentLanguage = lang;
        }

        getLanguage() {
            return this.currentLanguage;
        }
    }

    // Export Dictionary Manager
    if (typeof window !== 'undefined') {
        window.DictionaryManager = DictionaryManager;
        window.dictionaryManager = new DictionaryManager();
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = DictionaryManager;
    }

})();

