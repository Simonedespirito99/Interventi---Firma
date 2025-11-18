/**
 * SMIRT App - Utility Functions
 * Funzioni di utilità comuni utilizzate in tutta l'applicazione
 */

class SMIRTUtils {
    /**
     * Mostra/nasconde overlay di caricamento
     */
    static showLoading(message = 'Caricamento...') {
        const loadingOverlay = document.getElementById('loading-overlay');
        const loadingText = document.getElementById('loading-text');
        if (loadingText) loadingText.textContent = message;
        if (loadingOverlay) loadingOverlay.classList.add('app-flex-visible');
    }

    static hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) loadingOverlay.classList.remove('app-flex-visible');
    }

    /**
     * Mostra alert personalizzato
     */
    static showAlert(title, message, icon = '⚠️') {
        const alertModal = document.getElementById('alert-modal');
        const alertTitle = document.getElementById('alert-title');
        const alertMessage = document.getElementById('alert-message');
        const alertIcon = document.getElementById('alert-icon');
        
        if (alertTitle) alertTitle.textContent = title;
        if (alertMessage) alertMessage.textContent = message;
        if (alertIcon) alertIcon.textContent = icon;
        if (alertModal) alertModal.classList.add('app-flex-visible');
        
        // Auto-chiusura dopo 3 secondi
        setTimeout(() => this.hideAlert(), 3000);
    }

    static hideAlert() {
        const alertModal = document.getElementById('alert-modal');
        if (alertModal) alertModal.classList.remove('app-flex-visible');
    }

    /**
     * Ottiene la data corrente in formato YYYY-MM-DD
     */
    static getCurrentDate() {
        return new Date().toISOString().split('T')[0];
    }

    /**
     * Valida se il canvas è vuoto
     */
    static isCanvasEmpty(canvas) {
        if (!canvas) return true;
        const blank = document.createElement('canvas');
        blank.width = canvas.width;
        blank.height = canvas.height;
        return canvas.toDataURL() === blank.toDataURL();
    }

    /**
     * Genera MUD dal codice numerico
     */
    static generateMudFromCode(code) {
        if (!/^[0-9]{4}$/.test(code)) {
            throw new Error('Il codice deve essere di esattamente 4 cifre numeriche');
        }
        return code + '-01';
    }

    /**
     * Determina il tipo di intervento dal valore MUD
     */
    static getInterventoType(mudValue) {
        if (!mudValue || !mudValue.trim()) {
            return 'ordinario';
        }
        
        const value = mudValue.trim();
        if (value.startsWith('ORD-')) {
            return 'ordinario';
        } else if (value.startsWith('MUD-') || value.includes('MUD')) {
            return 'mud';
        } else {
            return 'mud'; // Fallback
        }
    }

    /**
     * Valida i dati del form
     */
    static validateFormData(formData) {
        const errors = [];

        if (!formData.mud || !formData.mud.trim()) {
            errors.push('Il campo MUD è obbligatorio');
        }
        if (!formData.luogo || !formData.luogo.trim()) {
            errors.push('Il campo Luogo è obbligatorio');
        }
        if (!formData.dataInizio) {
            errors.push('Il campo Data Inizio è obbligatorio');
        }
        if (!formData.dataFine) {
            errors.push('Il campo Data Fine è obbligatorio');
        }
        if (!formData.descrizione || !formData.descrizione.trim()) {
            errors.push('Il campo Descrizione è obbligatorio');
        }

        // Validazione date
        if (formData.dataInizio && formData.dataFine) {
            const dataInizio = new Date(formData.dataInizio);
            const dataFine = new Date(formData.dataFine);
            if (dataFine < dataInizio) {
                errors.push('La data fine non può essere precedente alla data inizio');
            }
        }

        return errors;
    }

    /**
     * Formatta messaggio di successo per invio rapporto
     */
    static formatSuccessMessage(result, formData) {
        let message = '✅ Rapporto inviato con successo al Google Sheet!';
        
        if (result.buonoLavoro) {
            message += `\n\n📋 Buono di Lavoro: ${result.buonoLavoro}`;
        }
        
        if (result.row) {
            message += `\n📊 Salvato nella riga: ${result.row}`;
        }
        
        message += `\n\n🗓️ Data invio: ${new Date().toLocaleString('it-IT')}`;
        message += `\n👤 Utente: ${formData.user}`;
        message += `\n🏷️ MUD: ${formData.mud}`;

        return message;
    }

    /**
     * Gestisce errori JSONP
     */
    static createJSONPRequest(url, params, timeout = 30000) {
        return new Promise((resolve, reject) => {
            const callbackName = 'jsonpCallback' + Date.now();
            let timeoutId;
            
            window[callbackName] = function(response) {
                clearTimeout(timeoutId);
                delete window[callbackName];
                if (script && script.parentNode) document.head.removeChild(script);
                resolve(response);
            };
            
            const script = document.createElement('script');
            const urlParams = new URLSearchParams({
                ...params,
                callback: callbackName
            });
            
            script.src = `${url}?${urlParams.toString()}`;
            
            script.onerror = () => {
                clearTimeout(timeoutId);
                delete window[callbackName];
                if (script && script.parentNode) document.head.removeChild(script);
                reject(new Error('Errore di connessione al server'));
            };
            
            document.head.appendChild(script);
            
            timeoutId = setTimeout(() => {
                if (window[callbackName]) {
                    delete window[callbackName];
                    if (script && script.parentNode) document.head.removeChild(script);
                    reject(new Error(`Timeout (${timeout/1000}s). Il server non risponde.`));
                }
            }, timeout);
        });
    }

    /**
     * Debounce function per ottimizzare le chiamate
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Esporta per uso globale
if (typeof window !== 'undefined') {
    window.SMIRTUtils = SMIRTUtils;
}

// Esporta per moduli (se necessario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SMIRTUtils;
}