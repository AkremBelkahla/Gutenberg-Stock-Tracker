/**
 * Composant pour afficher les données d'une action.
 */
import { __ } from '@wordpress/i18n';

// Fonction pour obtenir le logo de la société
function getCompanyLogo(symbol) {
    const logoMap = {
        'AAPL': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
        'MSFT': 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
        'GOOGL': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
        'AMZN': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
        'META': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
        'NFLX': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
        'NVDA': 'https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg',
        'TSLA': 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png'
    };
    
    return logoMap[symbol] || 'https://via.placeholder.com/30?text=' + symbol;
}

export default function StockCard({ symbol, data }) {
    // Vérification si les données sont disponibles
    if (!data || !data.c) {
        return (
            <div className="stock-card">
                <div className="stock-card-header">
                    <div className="stock-symbol-container">
                        <img src={getCompanyLogo(symbol)} alt={`${symbol} logo`} className="stock-logo" />
                        <h4 className="stock-symbol">{symbol}</h4>
                    </div>
                </div>
                <div className="stock-card-body">
                    <p>Chargement...</p>
                </div>
            </div>
        );
    }
    
    // S'assurer que toutes les propriétés nécessaires sont présentes
    const c = data.c || 0;
    const h = data.h || data.c || 0;
    const l = data.l || data.c || 0;
    const dp = data.dp || 0;
    
    const change = dp;
    const changeClass = change >= 0 ? 'positive' : 'negative';
    const logoUrl = getCompanyLogo(symbol);
    
    return (
        <div className="stock-card">
            <div className="stock-card-header">
                <div className="stock-symbol-container">
                    <img src={logoUrl} alt={`${symbol} logo`} className="stock-logo" />
                    <h4 className="stock-symbol">{symbol}</h4>
                </div>
                <span className="stock-price">${c.toFixed(2)}</span>
            </div>
            
            <div className="stock-card-body">
                <div className={`stock-change ${changeClass}`}>
                    {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                </div>
                
                <div className="stock-previous">
                    <span>Haut: ${h.toFixed(2)} Bas: ${l.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}
