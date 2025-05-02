/**
 * Script frontend pour afficher les taux de change des devises
 */

/**
 * Désactive le cache global sans modifier les en-têtes (pour éviter les problèmes CORS)
 */
function disableCache() {
    console.log('Currency Tracker: Désactivation du cache sans modifier les en-têtes pour éviter les problèmes CORS');
    
    // Au lieu de modifier window.fetch, nous allons simplement vider les caches existants
    if (window.caches && window.caches.keys) {
        window.caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    console.log('Currency Tracker: Suppression du cache', cacheName);
                    return window.caches.delete(cacheName);
                })
            );
        }).catch(err => {
            console.warn('Currency Tracker: Erreur lors de la suppression des caches', err);
        });
    }
}

// Désactiver le cache global dès le chargement
disableCache();

document.addEventListener('DOMContentLoaded', function() {
    const containers = document.querySelectorAll('.wp-block-stock-tracker-currency-tracker');
    
    containers.forEach(container => {
        // Récupère les données du bloc
        let currencyPairs = [];
        try {
            currencyPairs = JSON.parse(container.dataset.currencyPairs || '[]');
        } catch (e) {
            console.error('Currency Tracker: Erreur lors du parsing des paires de devises', e);
            currencyPairs = [];
        }
        const apiKey = container.dataset.apiKey || '';
        const autoRefresh = container.dataset.autoRefresh === 'true';
        const refreshInterval = parseInt(container.dataset.refreshInterval, 10) || 5;
        
        console.log('Currency Tracker: Initialisation', {
            currencyPairs,
            apiKey: apiKey ? 'présente' : 'absente',
            autoRefresh,
            refreshInterval
        });

        // Vérifie si les données nécessaires sont présentes
        if (!apiKey || currencyPairs.length === 0) {
            const message = !apiKey ? 'Clé API manquante' : 'Aucune paire de devises sélectionnée';
            container.innerHTML = `
                <div class="currency-tracker-error">
                    <p class="currency-tracker-error-message">Configuration incomplète du bloc Currency Tracker: ${message}</p>
                </div>
            `;
            return;
        }

        // Fonction pour obtenir le drapeau d'un pays en fonction du code de devise
        function getCurrencyFlag(currencyCode) {
            const countryMap = {
                'EUR': 'eu',
                'USD': 'us',
                'GBP': 'gb',
                'JPY': 'jp',
                'CAD': 'ca',
                'CHF': 'ch',
                'AUD': 'au',
                'CNY': 'cn',
                'MAD': 'ma',
                'TND': 'tn'
            };
            
            const countryCode = countryMap[currencyCode] || '';
            return countryCode ? `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png` : '';
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
        
        // Récupère les éléments du DOM
        const cardsContainer = container.querySelector('.currency-tracker-cards');
        const lastUpdatedElement = container.querySelector('.currency-tracker-last-updated');
        const refreshButton = container.querySelector('.currency-tracker-refresh-button');
        
        // Fonction pour formater le taux de change
        function formatRate(rate) {
            return parseFloat(rate).toFixed(4);
        }
        
        // Fonction pour récupérer les taux de change
        async function fetchCurrencyRates() {
            console.log('Currency Tracker: Début de la récupération des données à', new Date().toLocaleTimeString());
            try {
                // Créer un objet pour stocker les résultats
                const results = {};
                
                // Récupérer les données pour chaque paire de devises
                await Promise.all(
                    currencyPairs.map(async (pair) => {
                        try {
                            // Ajouter un paramètre cacheBuster pour éviter la mise en cache des requêtes
                            const cacheBuster = new Date().getTime();
                            
                            // Récupérer les taux de change
                            const response = await fetch(
                                `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${pair.from}/${pair.to}?_=${cacheBuster}&random=${Math.random()}&nocache=true`,
                                {
                                    method: 'GET',
                                    cache: 'no-store' // Désactive le cache
                                }
                            );
                            
                            if (!response.ok) {
                                if (response.status === 429) {
                                    throw new Error('Limite de taux API dépassée. Veuillez réessayer plus tard.');
                                }
                                throw new Error(`Erreur API: ${response.status}`);
                            }
                            
                            const data = await response.json();
                            
                            // Vérifier si les données sont valides
                            if (!data || data.result !== 'success') {
                                throw new Error(data.error_type || 'Données invalides reçues');
                            }
                            
                            console.log(`Currency Tracker: Données reçues pour ${pair.from} -> ${pair.to}:`, data);
                            
                            // Stocker le taux de change
                            const pairKey = `${pair.from}_${pair.to}`;
                            results[pairKey] = {
                                rate: data.conversion_rate,
                                time: data.time_last_update_utc
                            };
                        } catch (error) {
                            console.error(`Erreur pour ${pair.from} -> ${pair.to}:`, error);
                            results[`${pair.from}_${pair.to}`] = { error: error.message };
                        }
                    })
                );
                
                // Mettre à jour l'affichage
                updateDisplay(results);
            } catch (error) {
                console.error('Erreur lors de la récupération des taux de change:', error);
                container.innerHTML = `
                    <div class="currency-tracker-error">
                        <p class="currency-tracker-error-message">Erreur: ${error.message}</p>
                        <button class="currency-tracker-retry-button">Réessayer</button>
                    </div>
                `;
                
                // Ajoute un écouteur d'événement au bouton Réessayer
                const retryButton = container.querySelector('.currency-tracker-retry-button');
                if (retryButton) {
                    retryButton.addEventListener('click', fetchCurrencyRates);
                }
            }
        }
        
        // Fonction pour mettre à jour l'affichage
        function updateDisplay(results) {
            console.log('Currency Tracker: Mise à jour de l\'affichage avec les nouvelles données', results);
            
            // Mise à jour de l'horodatage
            const now = new Date();
            if (lastUpdatedElement) {
                lastUpdatedElement.textContent = `Dernière mise à jour: ${now.toLocaleTimeString()}`;
            }
            
            // Forcer le rafraîchissement de l'affichage en ajoutant un attribut data-updated
            container.setAttribute('data-updated', now.getTime());

            // Mettre à jour les cartes de devises
            if (cardsContainer) {
                // Créer les cartes une seule fois si elles n'existent pas déjà
                if (!cardsContainer.hasChildNodes()) {
                    currencyPairs.forEach((pair, index) => {
                        const card = document.createElement('div');
                        card.id = `currency-card-${pair.from}-${pair.to}`;
                        card.className = 'currency-card';
                        cardsContainer.appendChild(card);
                    });
                }
                
                // Mettre à jour le contenu des cartes existantes
                currencyPairs.forEach((pair, index) => {
                    const pairKey = `${pair.from}_${pair.to}`;
                    const card = cardsContainer.querySelector(`#currency-card-${pair.from}-${pair.to}`);
                    if (!card) return;
                    
                    const result = results[pairKey];
                    
                    if (!result) {
                        card.innerHTML = `
                            <div class="currency-card-header">
                                <div class="currency-symbol-container">
                                    <span class="currency-flag">${getCurrencyFlag(pair.from)}</span>
                                    <h4 class="currency-symbol">${pair.from}</h4>
                                </div>
                                <div class="currency-arrow">→</div>
                                <div class="currency-symbol-container">
                                    <span class="currency-flag">${getCurrencyFlag(pair.to)}</span>
                                    <h4 class="currency-symbol">${pair.to}</h4>
                                </div>
                            </div>
                            <div class="currency-card-body">
                                <div class="currency-rate">
                                    <span class="currency-rate-loading">Chargement...</span>
                                </div>
                            </div>
                        `;
                        return;
                    }
                    
                    if (result.error) {
                        card.innerHTML = `
                            <div class="currency-card-header">
                                <div class="currency-symbol-container">
                                    <span class="currency-flag">${getCurrencyFlag(pair.from)}</span>
                                    <h4 class="currency-symbol">${pair.from}</h4>
                                </div>
                                <div class="currency-arrow">→</div>
                                <div class="currency-symbol-container">
                                    <span class="currency-flag">${getCurrencyFlag(pair.to)}</span>
                                    <h4 class="currency-symbol">${pair.to}</h4>
                                </div>
                            </div>
                            <div class="currency-card-body">
                                <div class="currency-rate">
                                    <span class="currency-rate-error">Erreur: ${result.error}</span>
                                </div>
                            </div>
                        `;
                        return;
                    }
                    
                    // Afficher le taux de change
                    card.innerHTML = `
                        <div class="currency-card-header">
                            <div class="currency-symbol-container">
                                <span class="currency-flag">${getCurrencyFlag(pair.from)}</span>
                                <h4 class="currency-symbol">${pair.from}</h4>
                            </div>
                            <div class="currency-arrow">→</div>
                            <div class="currency-symbol-container">
                                <span class="currency-flag">${getCurrencyFlag(pair.to)}</span>
                                <h4 class="currency-symbol">${pair.to}</h4>
                            </div>
                        </div>
                        <div class="currency-card-body">
                            <div class="currency-rate">
                                <span class="currency-rate-value">${formatRate(result.rate)}</span>
                                <span class="currency-rate-label">
                                    1 ${pair.from} = ${formatRate(result.rate)} ${pair.to}
                                </span>
                                <span class="currency-rate-time">
                                    ${result.time ? `Mis à jour: ${new Date(result.time).toLocaleDateString()}` : ''}
                                </span>
                            </div>
                        </div>
                    `;
                });
            }
        }
        
        // Nous avons supprimé le bouton Actualiser pour une mise à jour automatique uniquement
        
        // Fonction pour démarrer l'actualisation automatique
        function startAutoRefresh() {
            if (intervalId) {
                clearInterval(intervalId);
                console.log('Currency Tracker: Ancien intervalle nettoyé');
            }
            
            console.log(`Currency Tracker: Configuration de l'actualisation automatique toutes les ${refreshInterval} secondes`);
            intervalId = setInterval(() => {
                console.log('Currency Tracker: Exécution de l\'actualisation automatique programmée');
                console.log('Currency Tracker: Actualisation programmée avec timestamp unique', new Date().toLocaleTimeString());
                fetchCurrencyRates();
            }, refreshInterval * 60000); // Conversion en minutes
            console.log('Currency Tracker: Nouvel intervalle d\'actualisation configuré', intervalId, `(${refreshInterval} minutes)`);
        }
        
        // Chargement initial
        fetchCurrencyRates();
        
        // Actualisation automatique si activée
        let intervalId = null;
        
        if (autoRefresh) {
            startAutoRefresh();
            
            // Nettoyage de l'intervalle si le composant est démonté
            document.addEventListener('visibilitychange', function() {
                if (document.visibilityState === 'hidden') {
                    if (intervalId) {
                        clearInterval(intervalId);
                        console.log('Currency Tracker: Intervalle nettoyé (page cachée)');
                    }
                } else if (document.visibilityState === 'visible' && autoRefresh) {
                    startAutoRefresh();
                    console.log('Currency Tracker: Intervalle redémarré (page visible)');
                }
            });
        }
    });
});
