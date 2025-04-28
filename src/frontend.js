/**
 * Script frontend pour afficher les données boursières
 */
document.addEventListener('DOMContentLoaded', function() {
    const containers = document.querySelectorAll('.wp-block-stock-tracker-market-data');
    
    containers.forEach(container => {
        // Trie les symboles par ordre alphabétique
        const symbols = (container.dataset.symbols?.split(',') || []).sort();
        // Récupère la clé API depuis les données globales ou depuis le dataset
        const apiKey = window.stockTrackerData?.apiKey || container.dataset.apiKey;
        const autoRefresh = container.dataset.autoRefresh === 'true';
        const refreshInterval = parseInt(container.dataset.refreshInterval, 10) || 5;
        
        console.log('Stock Tracker: Initialisation', {
            symbols,
            apiKey: apiKey ? 'présente' : 'absente',
            autoRefresh,
            refreshInterval
        });

        if (!symbols.length || !apiKey) {
            const message = !symbols.length ? 'Aucun symbole sélectionné' : 'Clé API manquante';
            container.innerHTML = `
                <div class="stock-tracker-error">
                    <p class="stock-tracker-error-message">Configuration incomplète du bloc Stock Tracker: ${message}</p>
                </div>
            `;
            return;
        }

        const stockGrid = container.querySelector('.stock-tracker-cards');
        const lastUpdatedElement = container.querySelector('.stock-tracker-last-updated');
        
        async function fetchStockData() {
            console.log('Stock Tracker: Début de la récupération des données');
            try {
                const results = {};
                console.log('Stock Tracker: Symboles à récupérer:', symbols);
                
                await Promise.all(
                    symbols.map(async (symbol) => {
                        try {
                            const response = await fetch(
                                `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
                            );
                            
                            if (!response.ok) {
                                throw new Error(`Erreur API: ${response.status}`);
                            }
                            
                            const data = await response.json();
                            results[symbol] = data;
                        } catch (error) {
                            console.error(`Erreur pour ${symbol}:`, error);
                            results[symbol] = { error: error.message };
                        }
                    })
                );
                
                updateDisplay(results);
            } catch (error) {
                console.error('Erreur de récupération des données:', error);
                stockGrid.innerHTML = '<p>Erreur lors de la récupération des données</p>';
            }
        }
        
        function updateDisplay(data) {
            console.log('Stock Tracker: Début mise à jour affichage', data);
            
            // Mise à jour de l'horodatage
            const now = new Date();
            lastUpdatedElement.textContent = `Dernière mise à jour: ${now.toLocaleTimeString()}`;

            // Crée un objet ordonné avec les données triées
            const orderedData = {};
            symbols.forEach(symbol => {
                orderedData[symbol] = data[symbol];
            });
            
            console.log('Stock Tracker: stockGrid présent ?', !!stockGrid);

            // Crée les cartes une seule fois dans l'ordre alphabétique
            if (!stockGrid.hasChildNodes()) {
                Object.keys(orderedData).forEach(symbol => {
                    const card = document.createElement('div');
                    card.id = `stock-card-${symbol}`;
                    card.className = 'stock-card';
                    stockGrid.appendChild(card);
                });
            }

            // Met à jour le contenu des cartes existantes
            Object.keys(orderedData).forEach(symbol => {
                const card = stockGrid.querySelector(`#stock-card-${symbol}`);
                if (!card) return;

                const quote = orderedData[symbol];
                if (!quote) {
                    card.innerHTML = `
                        <div class="stock-card-header">
                            <h4 class="stock-symbol">${symbol}</h4>
                        </div>
                        <div class="stock-card-body">
                            <p>Chargement...</p>
                        </div>
                    `;
                    return;
                }

                if (quote.error) {
                    card.innerHTML = `
                        <div class="stock-card-header">
                            <h4 class="stock-symbol">${symbol}</h4>
                        </div>
                        <div class="stock-card-body">
                            <p class="stock-tracker-error-message">Erreur: ${quote.error}</p>
                        </div>
                    `;
                    return;
                }

                const change = quote.dp || 0;
                const changeClass = change >= 0 ? 'positive' : 'negative';
                
                card.innerHTML = `
                    <div class="stock-card-header">
                        <h4 class="stock-symbol">${symbol}</h4>
                        <span class="stock-price">$${quote.c.toFixed(2)}</span>
                    </div>
                    <div class="stock-card-body">
                        <div class="stock-change ${changeClass}">
                            ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
                        </div>
                            <div class="stock-previous">
                                <span>Haut: $${quote.h.toFixed(2)}</span>
                                <span>Bas: $${quote.l.toFixed(2)}</span>
                            </div>
                    </div>
                `;
            });
        }

        // Chargement initial
        fetchStockData();
        
       // Actualisation automatique si activée
        if (autoRefresh) {
            console.log('Stock Tracker: Démarrage de l\'actualisation automatique', refreshInterval);
            setInterval(fetchStockData, refreshInterval * 1000);
        }
    });
});
