/**
 * Script frontend pour afficher les taux de change des devises
 */

/**
 * Du00e9sactive le cache global sans modifier les en-tu00eates (pour u00e9viter les problu00e8mes CORS)
 */
function disableCache() {
    console.log('Currency Tracker: Du00e9sactivation du cache sans modifier les en-tu00eates pour u00e9viter les problu00e8mes CORS');
    
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

// Du00e9sactiver le cache global du00e8s le chargement
disableCache();

document.addEventListener('DOMContentLoaded', function() {
    const containers = document.querySelectorAll('.wp-block-stock-tracker-currency-tracker');
    
    containers.forEach(container => {
        // Ru00e9cupu00e8re les attributs du bloc
        const blockData = container.dataset;
        
        // Ru00e9cupu00e8re les paires de devises
        let currencyPairs = [];
        try {
            currencyPairs = JSON.parse(blockData.currencyPairs || '[]');
        } catch (e) {
            console.error('Currency Tracker: Erreur lors de la lecture des paires de devises', e);
            currencyPairs = [];
        }
        
        // Ru00e9cupu00e8re la clu00e9 API
        const apiKey = blockData.apiKey || '';
        
        // Ru00e9cupu00e8re les paramu00e8tres d'actualisation automatique
        const autoRefresh = blockData.autoRefresh === 'true';
        const refreshInterval = parseInt(blockData.refreshInterval || '5', 10);
        
        // Vu00e9rifie si les donnu00e9es nu00e9cessaires sont pru00e9sentes
        if (!apiKey || currencyPairs.length === 0) {
            const message = !apiKey ? 'Clu00e9 API manquante' : 'Aucune paire de devises su00e9lectionnu00e9e';
            container.innerHTML = `
                <div class="currency-tracker-error">
                    <p class="currency-tracker-error-message">Configuration incomplu00e8te du bloc Currency Tracker: ${message}</p>
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
                'USD': 'Dollar amu00e9ricain',
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
        
        // Ru00e9cupu00e8re les u00e9lu00e9ments du DOM
        const cardsContainer = container.querySelector('.currency-tracker-cards');
        const lastUpdatedElement = container.querySelector('.currency-tracker-last-updated');
        const refreshButton = container.querySelector('.currency-tracker-refresh-button');
        
        // Fonction pour formater le taux de change
        function formatRate(rate) {
            return parseFloat(rate).toFixed(4);
        }
        
        // Fonction pour ru00e9cupu00e9rer les taux de change
        async function fetchCurrencyRates() {
            console.log('Currency Tracker: Du00e9but de la ru00e9cupu00e9ration des donnu00e9es u00e0', new Date().toLocaleTimeString());
            try {
                // Cru00e9er un objet pour stocker les ru00e9sultats
                const results = {};
                
                // Ru00e9cupu00e9rer les donnu00e9es pour chaque paire de devises
                await Promise.all(
                    currencyPairs.map(async (pair) => {
                        try {
                            // Ajouter un paramu00e8tre cacheBuster pour u00e9viter la mise en cache des requu00eates
                            const cacheBuster = new Date().getTime();
                            
                            // Ru00e9cupu00e9rer les taux de change
                            const response = await fetch(
                                `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${pair.from}/${pair.to}?_=${cacheBuster}&random=${Math.random()}&nocache=true`,
                                {
                                    method: 'GET',
                                    cache: 'no-store' // Du00e9sactive le cache
                                }
                            );
                            
                            if (!response.ok) {
                                if (response.status === 429) {
                                    throw new Error('Limite de taux API du00e9passu00e9e. Veuillez ru00e9essayer plus tard.');
                                }
                                throw new Error(`Erreur API: ${response.status}`);
                            }
                            
                            const data = await response.json();
                            
                            // Vu00e9rifier si les donnu00e9es sont valides
                            if (!data || data.result !== 'success') {
                                throw new Error(data.error_type || 'Donnu00e9es invalides reu00e7ues');
                            }
                            
                            console.log(`Currency Tracker: Donnu00e9es reu00e7ues pour ${pair.from} -> ${pair.to}:`, data);
                            
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
                
                // Mettre u00e0 jour l'affichage
                updateDisplay(results);
            } catch (error) {
                console.error('Erreur lors de la ru00e9cupu00e9ration des taux de change:', error);
                container.innerHTML = `
                    <div class="currency-tracker-error">
                        <p class="currency-tracker-error-message">Erreur: ${error.message}</p>
                        <button class="currency-tracker-retry-button">Ru00e9essayer</button>
                    </div>
                `;
                
                // Ajoute un u00e9couteur d'u00e9vu00e9nement au bouton Ru00e9essayer
                const retryButton = container.querySelector('.currency-tracker-retry-button');
                if (retryButton) {
                    retryButton.addEventListener('click', fetchCurrencyRates);
                }
            }
        }
        
        // Fonction pour mettre u00e0 jour l'affichage
        function updateDisplay(results) {
            console.log('Currency Tracker: Mise u00e0 jour de l\'affichage avec les nouvelles donnu00e9es', results);
            
            // Mise u00e0 jour de l'horodatage
            const now = new Date();
            if (lastUpdatedElement) {
                lastUpdatedElement.textContent = `Derniu00e8re mise u00e0 jour: ${now.toLocaleTimeString()}`;
            }
            
            // Forcer le rafrau00eechissement de l'affichage en ajoutant un attribut data-updated
            container.setAttribute('data-updated', now.getTime());

            // Mettre u00e0 jour les cartes de devises
            if (cardsContainer) {
                // Cru00e9er les cartes une seule fois si elles n'existent pas du00e9ju00e0
                if (!cardsContainer.hasChildNodes()) {
                    currencyPairs.forEach((pair, index) => {
                        const card = document.createElement('div');
                        card.id = `currency-card-${pair.from}-${pair.to}`;
                        card.className = 'currency-card';
                        cardsContainer.appendChild(card);
                    });
                }
                
                // Mettre u00e0 jour le contenu des cartes existantes
                currencyPairs.forEach((pair, index) => {
                    const pairKey = `${pair.from}_${pair.to}`;
                    const card = cardsContainer.querySelector(`#currency-card-${pair.from}-${pair.to}`);
                    if (!card) return;
                    
                    const result = results[pairKey];
                    
                    if (!result) {
                        card.innerHTML = `
                            <div class="currency-card-header">
                                <div class="currency-symbol-container">
                                    <img src="${getCurrencyFlag(pair.from)}" alt="${pair.from}" class="currency-flag" />
                                    <div class="currency-info">
                                        <h4 class="currency-symbol">${pair.from}</h4>
                                        <span class="currency-name">${getCurrencyName(pair.from)}</span>
                                    </div>
                                </div>
                                <div class="currency-arrow">u2192</div>
                                <div class="currency-symbol-container">
                                    <img src="${getCurrencyFlag(pair.to)}" alt="${pair.to}" class="currency-flag" />
                                    <div class="currency-info">
                                        <h4 class="currency-symbol">${pair.to}</h4>
                                        <span class="currency-name">${getCurrencyName(pair.to)}</span>
                                    </div>
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
                                    <img src="${getCurrencyFlag(pair.from)}" alt="${pair.from}" class="currency-flag" />
                                    <div class="currency-info">
                                        <h4 class="currency-symbol">${pair.from}</h4>
                                        <span class="currency-name">${getCurrencyName(pair.from)}</span>
                                    </div>
                                </div>
                                <div class="currency-arrow">u2192</div>
                                <div class="currency-symbol-container">
                                    <img src="${getCurrencyFlag(pair.to)}" alt="${pair.to}" class="currency-flag" />
                                    <div class="currency-info">
                                        <h4 class="currency-symbol">${pair.to}</h4>
                                        <span class="currency-name">${getCurrencyName(pair.to)}</span>
                                    </div>
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
                                <img src="${getCurrencyFlag(pair.from)}" alt="${pair.from}" class="currency-flag" />
                                <div class="currency-info">
                                    <h4 class="currency-symbol">${pair.from}</h4>
                                    <span class="currency-name">${getCurrencyName(pair.from)}</span>
                                </div>
                            </div>
                            <div class="currency-arrow">u2192</div>
                            <div class="currency-symbol-container">
                                <img src="${getCurrencyFlag(pair.to)}" alt="${pair.to}" class="currency-flag" />
                                <div class="currency-info">
                                    <h4 class="currency-symbol">${pair.to}</h4>
                                    <span class="currency-name">${getCurrencyName(pair.to)}</span>
                                </div>
                            </div>
                        </div>
                        <div class="currency-card-body">
                            <div class="currency-rate">
                                <span class="currency-rate-value">${formatRate(result.rate)}</span>
                                <span class="currency-rate-label">
                                    1 ${pair.from} = ${formatRate(result.rate)} ${pair.to}
                                </span>
                                <span class="currency-rate-time">
                                    ${result.time ? `Mis u00e0 jour: ${new Date(result.time).toLocaleDateString()}` : ''}
                                </span>
                            </div>
                        </div>
                    `;
                });
            }
        }
        
        // Nous avons supprimu00e9 le bouton Actualiser pour une mise u00e0 jour automatique uniquement
        
        // Fonction pour du00e9marrer l'actualisation automatique
        function startAutoRefresh() {
            if (!autoRefresh) return;
            
            // Intervalle minimum de 1 minute
            const minInterval = Math.max(1, refreshInterval);
            
            // Cru00e9er un intervalle pour actualiser les donnu00e9es
            const intervalId = setInterval(() => {
                console.log('Currency Tracker: Exu00e9cution de l\'actualisation automatique programmu00e9e');
                console.log('Currency Tracker: Actualisation programmu00e9e avec timestamp unique', new Date().toLocaleTimeString());
                fetchCurrencyRates();
            }, refreshInterval * 60000); // Conversion en minutes
            console.log('Currency Tracker: Nouvel intervalle d\'actualisation configuru00e9', intervalId, `(${refreshInterval} minutes)`);
        }
        
        // Chargement initial
        fetchCurrencyRates();
        
        // Actualisation automatique si activu00e9e
        if (autoRefresh) {
            console.log('Currency Tracker: Actualisation automatique activu00e9e');
            startAutoRefresh();
        } else {
            console.log('Currency Tracker: Actualisation automatique du00e9sactivu00e9e');
        }
    });
});
