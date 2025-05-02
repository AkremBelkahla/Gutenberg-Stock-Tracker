/**
 * Fonctions pour interagir avec l'API Exchange Rate.
 */

/**
 * Récupère les taux de change pour les devises spécifiées.
 *
 * @param {string} baseCurrency Devise de base pour les taux de change.
 * @param {Array} targetCurrencies Liste des devises cibles à récupérer.
 * @param {string} apiKey Clé API Exchange Rate.
 * @return {Promise<Object>} Taux de change organisés par devise.
 */
export async function fetchCurrencyData(baseCurrency, targetCurrencies, apiKey) {
    if (!apiKey) {
        throw new Error('Clé API manquante');
    }

    if (!baseCurrency) {
        throw new Error('Devise de base non spécifiée');
    }

    if (!targetCurrencies || !targetCurrencies.length) {
        throw new Error('Aucune devise cible spécifiée');
    }

    try {
        // Créer un objet pour stocker les résultats
        const results = {};
        
        // Ajouter un paramètre cacheBuster pour éviter la mise en cache des requêtes
        const cacheBuster = new Date().getTime();
        
        // Récupérer les taux de change
        const response = await fetch(
            `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}?_=${cacheBuster}`,
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
        
        // Extraire les taux de change pour les devises cibles
        targetCurrencies.forEach(currency => {
            if (data.conversion_rates && data.conversion_rates[currency]) {
                results[currency] = data.conversion_rates[currency];
            } else {
                console.warn(`Taux de change non disponible pour ${currency}`);
                results[currency] = null;
            }
        });
        
        return results;
    } catch (error) {
        console.error('Erreur lors de la récupération des taux de change:', error);
        throw new Error('Impossible de récupérer les taux de change. Veuillez vérifier votre connexion et réessayer.');
    }
}
