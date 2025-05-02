/**
 * Composant d'édition pour le bloc Currency Tracker.
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import {
    InspectorControls,
    useBlockProps,
} from '@wordpress/block-editor';
import {
    PanelBody,
    SelectControl,
    TextControl,
    ToggleControl,
    RangeControl,
    Placeholder,
    Spinner,
} from '@wordpress/components';
import { fetchCurrencyData } from './utils/currency-api';

// Liste des devises disponibles
const AVAILABLE_CURRENCIES = [
    { label: 'Euro (EUR)', value: 'EUR' },
    { label: 'Dollar américain (USD)', value: 'USD' },
    { label: 'Livre sterling (GBP)', value: 'GBP' },
    { label: 'Yen japonais (JPY)', value: 'JPY' },
    { label: 'Dollar canadien (CAD)', value: 'CAD' },
    { label: 'Franc suisse (CHF)', value: 'CHF' },
    { label: 'Dollar australien (AUD)', value: 'AUD' },
    { label: 'Yuan chinois (CNY)', value: 'CNY' },
    { label: 'Dirham marocain (MAD)', value: 'MAD' },
    { label: 'Dinar tunisien (TND)', value: 'TND' },
];

// Paires de devises prédéfinies
const CURRENCY_PAIRS = [
    { label: 'EUR → USD', from: 'EUR', to: 'USD' },
    { label: 'USD → EUR', from: 'USD', to: 'EUR' },
    { label: 'EUR → GBP', from: 'EUR', to: 'GBP' },
    { label: 'EUR → JPY', from: 'EUR', to: 'JPY' },
    { label: 'EUR → CAD', from: 'EUR', to: 'CAD' },
    { label: 'USD → CAD', from: 'USD', to: 'CAD' },
    { label: 'USD → JPY', from: 'USD', to: 'JPY' },
    { label: 'GBP → EUR', from: 'GBP', to: 'EUR' },
    { label: 'GBP → USD', from: 'GBP', to: 'USD' },
];

export default function CurrencyEdit({ attributes, setAttributes }) {
    const { currencyPairs, apiKey, autoRefresh, refreshInterval } = attributes;
    const [currencyData, setCurrencyData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const blockProps = useBlockProps();
    
    // Fonction pour ajouter une paire de devises
    const addCurrencyPair = (pair) => {
        // Vérifie si la paire existe déjà
        const pairExists = currencyPairs.some(
            existingPair => existingPair.from === pair.from && existingPair.to === pair.to
        );
        
        if (!pairExists) {
            setAttributes({
                currencyPairs: [...currencyPairs, pair]
            });
        }
    };
    
    // Fonction pour supprimer une paire de devises
    const removeCurrencyPair = (index) => {
        const newPairs = [...currencyPairs];
        newPairs.splice(index, 1);
        setAttributes({ currencyPairs: newPairs });
    };
    
    // Fonction pour récupérer les données des devises
    const getCurrencyData = async () => {
        if (!apiKey || currencyPairs.length === 0) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Créer un objet pour stocker les résultats
            const results = {};
            
            // Récupérer les données pour chaque paire de devises
            await Promise.all(
                currencyPairs.map(async (pair) => {
                    try {
                        const data = await fetchCurrencyData(pair.from, [pair.to], apiKey);
                        const pairKey = `${pair.from}_${pair.to}`;
                        results[pairKey] = data[pair.to];
                    } catch (error) {
                        console.error(`Erreur pour ${pair.from} -> ${pair.to}:`, error);
                        results[`${pair.from}_${pair.to}`] = null;
                    }
                })
            );
            
            setCurrencyData(results);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.message || __('Erreur lors de la récupération des données', 'stock-tracker'));
        } finally {
            setLoading(false);
        }
    };

    // Effet pour charger les données initiales
    useEffect(() => {
        getCurrencyData();
    }, [apiKey, currencyPairs]);

    // Effet pour l'actualisation automatique
    useEffect(() => {
        if (!autoRefresh || !apiKey || currencyPairs.length === 0) {
            return;
        }

        const intervalId = setInterval(() => {
            getCurrencyData();
        }, refreshInterval * 1000);

        return () => clearInterval(intervalId);
    }, [autoRefresh, refreshInterval, apiKey, currencyPairs]);

    // Fonction pour formater le taux de change
    const formatRate = (rate) => {
        return parseFloat(rate).toFixed(4);
    };

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
        const currency = AVAILABLE_CURRENCIES.find(c => c.value === currencyCode);
        return currency ? currency.label : currencyCode;
    };
    
    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Paramètres du Currency Tracker', 'stock-tracker')}>
                    <TextControl
                        label={__('Clé API Exchange Rate', 'stock-tracker')}
                        value={apiKey}
                        onChange={(value) => setAttributes({ apiKey: value })}
                        help={__('Clé API pour Exchange Rate API', 'stock-tracker')}
                    />
                    
                    <PanelBody title={__('Paires de devises', 'stock-tracker')} initialOpen={true}>
                        <p>{__('Sélectionnez les paires de devises à afficher (max 8)', 'stock-tracker')}</p>
                        
                        {currencyPairs.length < 8 && (
                            <div className="currency-pair-selector">
                                <p>{__('Ajouter une paire de devises:', 'stock-tracker')}</p>
                                {CURRENCY_PAIRS.map((pair, index) => {
                                    // Vérifie si la paire existe déjà
                                    const pairExists = currencyPairs.some(
                                        existingPair => existingPair.from === pair.from && existingPair.to === pair.to
                                    );
                                    
                                    if (pairExists) return null;
                                    
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => addCurrencyPair(pair)}
                                            className="currency-pair-button"
                                            style={{
                                                margin: '5px',
                                                padding: '8px 12px',
                                                background: '#f0f0f0',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {getCurrencyFlag(pair.from)} {pair.from} → {getCurrencyFlag(pair.to)} {pair.to}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        
                        <div className="currency-pairs-list" style={{ marginTop: '15px' }}>
                            <p>{__('Paires sélectionnées:', 'stock-tracker')}</p>
                            {currencyPairs.length === 0 ? (
                                <p>{__('Aucune paire sélectionnée', 'stock-tracker')}</p>
                            ) : (
                                currencyPairs.map((pair, index) => (
                                    <div key={index} style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        padding: '8px',
                                        margin: '5px 0',
                                        backgroundColor: '#f9f9f9',
                                        borderRadius: '4px'
                                    }}>
                                        <span>
                                            {getCurrencyFlag(pair.from)} {pair.from} → {getCurrencyFlag(pair.to)} {pair.to}
                                        </span>
                                        <button
                                            onClick={() => removeCurrencyPair(index)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#cc0000',
                                                cursor: 'pointer',
                                                padding: '5px'
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </PanelBody>
                    
                    <ToggleControl
                        label={__('Actualisation automatique', 'stock-tracker')}
                        checked={autoRefresh}
                        onChange={(value) => setAttributes({ autoRefresh: value })}
                    />
                    {autoRefresh && (
                        <RangeControl
                            label={__('Intervalle d\'actualisation (minutes)', 'stock-tracker')}
                            value={refreshInterval}
                            onChange={(value) => setAttributes({ refreshInterval: value })}
                            min={1}
                            max={30}
                        />
                    )}
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                {!apiKey ? (
                    <Placeholder
                        icon="money-alt"
                        label={__('Currency Tracker', 'stock-tracker')}
                        instructions={__('Veuillez saisir votre clé API Exchange Rate dans les paramètres du bloc.', 'stock-tracker')}
                    />
                ) : currencyPairs.length === 0 ? (
                    <Placeholder
                        icon="money-alt"
                        label={__('Currency Tracker', 'stock-tracker')}
                        instructions={__('Veuillez sélectionner au moins une paire de devises dans les paramètres du bloc.', 'stock-tracker')}
                    />
                ) : error ? (
                    <div className="currency-tracker-error">
                        <p>{error}</p>
                        <button onClick={getCurrencyData} className="currency-tracker-retry-button">
                            {__('Réessayer', 'stock-tracker')}
                        </button>
                    </div>
                ) : (
                    <div className="currency-tracker-container">
                        <div className="currency-tracker-header">
                            <h3>{__('Taux de change', 'stock-tracker')}</h3>
                            <div className="currency-tracker-controls">
                                {lastUpdated && (
                                    <span className="currency-tracker-last-updated">
                                        {__('Dernière mise à jour:', 'stock-tracker')} {lastUpdated.toLocaleTimeString()}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="currency-tracker-cards">
                            {loading ? (
                                <div className="currency-tracker-loading">
                                    <Spinner />
                                    <p>{__('Chargement des taux de change...', 'stock-tracker')}</p>
                                </div>
                            ) : (
                                currencyPairs.map((pair, index) => {
                                    const pairKey = `${pair.from}_${pair.to}`;
                                    const rate = currencyData[pairKey];
                                    
                                    return (
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
                                                    {rate ? (
                                                        <>
                                                            <span className="currency-rate-value">{formatRate(rate)}</span>
                                                            <span className="currency-rate-label">
                                                                1 {pair.from} = {formatRate(rate)} {pair.to}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="currency-rate-loading">Chargement...</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
