/**
 * Fonctions pour interagir avec l'API Finnhub.
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * Récupère les données boursières pour les symboles spécifiés.
 *
 * @param {Array} symbols Liste des symboles d'actions à récupérer.
 * @param {string} apiKey Clé API Finnhub.
 * @return {Promise<Object>} Données boursières organisées par symbole.
 */
export async function fetchStockData(symbols, apiKey) {
    if (!apiKey) {
        throw new Error('Clé API manquante');
    }

    if (!symbols || !symbols.length) {
        throw new Error('Aucun symbole d\'action spécifié');
    }

    try {
        // Créer un objet pour stocker les résultats
        const results = {};
        
        // Récupérer les données pour chaque symbole
        await Promise.all(
            symbols.map(async (symbol) => {
                try {
                    const response = await fetch(
                        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
                    );
                    
                    if (!response.ok) {
                        if (response.status === 429) {
                            throw new Error('Limite de taux API dépassée. Veuillez réessayer plus tard.');
                        }
                        throw new Error(`Erreur API: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    
                    // Vérifier si les données sont valides
                    if (!data || data.error) {
                        throw new Error(data.error || 'Données invalides reçues');
                    }
                    
                    // Stocker les données
                    results[symbol] = data;
                } catch (error) {
                    console.error(`Erreur lors de la récupération des données pour ${symbol}:`, error);
                    // Ajouter une entrée d'erreur pour ce symbole
                    results[symbol] = { error: error.message };
                }
            })
        );
        
        return results;
    } catch (error) {
        console.error('Erreur lors de la récupération des données boursières:', error);
        throw new Error('Impossible de récupérer les données boursières. Veuillez vérifier votre connexion et réessayer.');
    }
}
