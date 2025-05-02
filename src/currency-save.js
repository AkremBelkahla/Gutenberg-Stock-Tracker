/**
 * Composant de sauvegarde pour le bloc Currency Tracker.
 */
import { useBlockProps } from '@wordpress/block-editor';

export default function CurrencySave({ attributes }) {
    const { currencyPairs, apiKey, autoRefresh, refreshInterval } = attributes;
    const blockProps = useBlockProps.save();

    // Convertir le tableau de paires en format JSON pour l'attribut data
    const currencyPairsString = JSON.stringify(currencyPairs);

    // Fonction pour obtenir le drapeau d'un pays en fonction du code de devise
    const getCurrencyFlag = (currencyCode) => {
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
    };
    
    // Fonction pour obtenir le nom complet d'une devise
    const getCurrencyName = (currencyCode) => {
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
    };
    
    return (
        <div 
            {...blockProps} 
            data-currency-pairs={currencyPairsString}
            data-api-key={apiKey}
            data-auto-refresh={autoRefresh.toString()}
            data-refresh-interval={refreshInterval.toString()}
        >
            <div className="currency-tracker-container">
                <div className="currency-tracker-header">
                    <h3>Taux de change</h3>
                    <div className="currency-tracker-controls">
                        <span className="currency-tracker-last-updated">Dernière mise à jour: --:--:--</span>
                    </div>
                </div>
                <div className="currency-tracker-cards">
                    {currencyPairs.map((pair, index) => (
                        <div key={index} className="currency-card">
                            <div className="currency-card-header">
                                <div className="currency-symbol-container">
                                    <img src={getCurrencyFlag(pair.from)} alt={pair.from} className="currency-flag" />
                                    <div className="currency-info">
                                        <h4 className="currency-symbol">{pair.from}</h4>
                                        <span className="currency-name">{getCurrencyName(pair.from)}</span>
                                    </div>
                                </div>
                                <div className="currency-arrow">→</div>
                                <div className="currency-symbol-container">
                                    <img src={getCurrencyFlag(pair.to)} alt={pair.to} className="currency-flag" />
                                    <div className="currency-info">
                                        <h4 className="currency-symbol">{pair.to}</h4>
                                        <span className="currency-name">{getCurrencyName(pair.to)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="currency-card-body">
                                <div className="currency-rate">
                                    <span className="currency-rate-value">-</span>
                                    <span className="currency-rate-label">
                                        1 {pair.from} = <span className="currency-rate-placeholder">Chargement...</span> {pair.to}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
