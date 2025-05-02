/**
 * Script frontend pour afficher les taux de change des devises
 */

// Fonction pour obtenir le drapeau d'une devise
function getCurrencyFlag(currencyCode) {
    // Correspondance entre les codes de devise et les codes de pays pour les drapeaux
    const countryCodes = {
        'EUR': 'eu',  // Union européenne
        'USD': 'us',  // États-Unis
        'GBP': 'gb',  // Royaume-Uni
        'JPY': 'jp',  // Japon
        'CAD': 'ca',  // Canada
        'CHF': 'ch',  // Suisse
        'AUD': 'au',  // Australie
        'CNY': 'cn',  // Chine
        'MAD': 'ma',  // Maroc
        'TND': 'tn'   // Tunisie
    };
    
    const countryCode = countryCodes[currencyCode] || 'unknown';
    
    // Utiliser flagcdn.com pour obtenir les drapeaux
    if (countryCode !== 'unknown') {
        return `<img src="https://flagcdn.com/48x36/${countryCode}.png" alt="${currencyCode}" class="currency-flag-img" />`;
    }
    
    return currencyCode;
}

// Fonction pour obtenir le nom complet d'une devise
function getCurrencyName(currencyCode) {
    const currencyNames = {
        'EUR': 'Euro',
        'USD': 'Dollar américain',
        'GBP': 'Livre britannique',
        'JPY': 'Yen japonais',
        'CAD': 'Dollar canadien',
        'CHF': 'Franc suisse',
        'AUD': 'Dollar australien',
        'CNY': 'Yuan chinois',
        'MAD': 'Dirham marocain',
        'TND': 'Dinar tunisien'
    };
    
    return currencyNames[currencyCode] || currencyCode;
}

// Fonction pour mettre à jour les taux de change
async function updateCurrencyRates() {
    console.log('Currency Tracker: Mise à jour des taux de change');
    
    // Trouver le bloc parent
    const trackers = document.querySelectorAll('.wp-block-stock-tracker-currency-tracker');
    if (!trackers.length) {
        console.error('Currency Tracker: Aucun bloc trouvé');
        return;
    }
    
    // Parcourir tous les blocs
    for (const tracker of trackers) {
        // Récupérer les données du bloc
        const blockData = tracker.dataset;
        
        // Récupérer la clé API
        const apiKey = blockData.apiKey || '4fdbd0d69ad56a5ca6bb3f72';
        
        // Récupérer les paires de devises
        let currencyPairs = [];
        try {
            currencyPairs = JSON.parse(blockData.currencyPairs || '[]');
            console.log('Currency Tracker: Paires de devises:', currencyPairs);
        } catch (e) {
            console.error('Currency Tracker: Erreur lors du parsing des paires de devises', e);
            continue;
        }
        
        if (!currencyPairs.length) {
            console.log('Currency Tracker: Aucune paire de devises définie');
            continue;
        }
        
        // Mettre à jour l'horodatage
        const lastUpdated = tracker.querySelector('.currency-last-updated');
        if (lastUpdated) {
            lastUpdated.textContent = `Dernière mise à jour: ${new Date().toLocaleTimeString()}`;
        }
        
        // Récupérer les taux pour chaque paire
        for (const pair of currencyPairs) {
            try {
                // Construire l'URL de l'API
                const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${pair.from}/${pair.to}`;
                console.log(`Currency Tracker: Requête API pour ${pair.from} -> ${pair.to}: ${apiUrl}`);
                
                // Ajouter un timestamp pour éviter le cache
                const cacheBuster = new Date().getTime();
                const url = `${apiUrl}?_=${cacheBuster}`;
                
                // Effectuer la requête
                const response = await fetch(url, {
                    method: 'GET',
                    cache: 'no-store'
                });
                
                if (!response.ok) {
                    throw new Error(`Erreur API: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (!data || data.result !== 'success') {
                    throw new Error(data.error_type || 'Données invalides reçues');
                }
                
                console.log(`Currency Tracker: Données reçues pour ${pair.from} -> ${pair.to}:`, data);
                
                // Formater le taux
                const rate = parseFloat(data.conversion_rate).toFixed(4);
                
                // Trouver tous les placeholders correspondant à cette paire
                const labels = tracker.querySelectorAll('.currency-rate-label');
                
                labels.forEach(label => {
                    const text = label.textContent;
                    if (text.includes(pair.from) && text.includes(pair.to)) {
                        // Trouver le placeholder dans ce label
                        const placeholder = label.querySelector('.currency-rate-placeholder');
                        if (placeholder) {
                            console.warn(`Mise à jour du placeholder pour ${pair.from}->${pair.to} avec la valeur: ${rate}`);
                            placeholder.textContent = rate;
                        }
                        
                        // Mettre à jour également la valeur si elle existe
                        const valueElement = label.parentNode.querySelector('.currency-rate-value');
                        if (valueElement) {
                            valueElement.textContent = rate;
                        }
                    }
                });
            } catch (error) {
                console.error(`Currency Tracker: Erreur pour ${pair.from} -> ${pair.to}:`, error);
            }
        }
    }
}

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('Currency Tracker: Initialisation');
    
    // Mettre à jour les taux initialement
    updateCurrencyRates();
    
    // Mettre à jour les taux toutes les minutes
    setInterval(updateCurrencyRates, 60000);
});
