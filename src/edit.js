/**
 * Composant d'édition pour le bloc Stock Tracker.
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
import StockGrid from './components/StockGrid';
import ErrorMessage from './components/ErrorMessage';
import { fetchStockData } from './utils/api';

// Liste des symboles d'actions disponibles
const AVAILABLE_STOCKS = [
    { label: 'Apple (AAPL)', value: 'AAPL' },
    { label: 'Microsoft (MSFT)', value: 'MSFT' },
    { label: 'Google (GOOGL)', value: 'GOOGL' },
    { label: 'Amazon (AMZN)', value: 'AMZN' },
    { label: 'NVIDIA (NVDA)', value: 'NVDA' },
    { label: 'Tesla (TSLA)', value: 'TSLA' },
    { label: 'Meta (META)', value: 'META' },
    { label: 'Netflix (NFLX)', value: 'NFLX' },
];

export default function Edit({ attributes, setAttributes }) {
    const { stockSymbols, apiKey, autoRefresh, refreshInterval } = attributes;
    const [stockData, setStockData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const blockProps = useBlockProps();

    // Fonction pour récupérer les données des actions
    const getStockData = async () => {
        if (!apiKey || stockSymbols.length === 0) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await fetchStockData(stockSymbols, apiKey);
            setStockData(data);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.message || __('Erreur lors de la récupération des données', 'stock-tracker'));
        } finally {
            setLoading(false);
        }
    };

    // Effet pour charger les données initiales
    useEffect(() => {
        getStockData();
    }, [apiKey, stockSymbols]);

    // Effet pour l'actualisation automatique
    useEffect(() => {
        if (!autoRefresh || !apiKey || stockSymbols.length === 0) {
            return;
        }

        const intervalId = setInterval(() => {
            getStockData();
        }, refreshInterval * 1000);

        return () => clearInterval(intervalId);
    }, [autoRefresh, refreshInterval, apiKey, stockSymbols]);

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Paramètres du Stock Tracker', 'stock-tracker')}>
                    <TextControl
                        label={__('Clé API Finnhub', 'stock-tracker')}
                        value={apiKey}
                        onChange={(value) => setAttributes({ apiKey: value })}
                        help={__('Clé API déjà configurée. Modifiez uniquement si nécessaire.', 'stock-tracker')}
                    />
                    <SelectControl
                        multiple
                        label={__('Symboles des actions', 'stock-tracker')}
                        value={stockSymbols}
                        options={AVAILABLE_STOCKS}
                        onChange={(value) => setAttributes({ stockSymbols: value })}
                    />
                    <ToggleControl
                        label={__('Actualisation automatique', 'stock-tracker')}
                        checked={autoRefresh}
                        onChange={(value) => setAttributes({ autoRefresh: value })}
                    />
                    {autoRefresh && (
                        <RangeControl
                            label={__('Intervalle d\'actualisation (secondes)', 'stock-tracker')}
                            value={refreshInterval}
                            onChange={(value) => setAttributes({ refreshInterval: value })}
                            min={5}
                            max={60}
                        />
                    )}
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                {!apiKey ? (
                    <Placeholder
                        icon="chart-line"
                        label={__('Stock Tracker', 'stock-tracker')}
                        instructions={__('Veuillez saisir votre clé API Finnhub dans les paramètres du bloc.', 'stock-tracker')}
                    />
                ) : stockSymbols.length === 0 ? (
                    <Placeholder
                        icon="chart-line"
                        label={__('Stock Tracker', 'stock-tracker')}
                        instructions={__('Veuillez sélectionner au moins un symbole d\'action dans les paramètres du bloc.', 'stock-tracker')}
                    />
                ) : error ? (
                    <ErrorMessage message={error} onRetry={getStockData} />
                ) : (
                    <>
                        <StockGrid 
                            stockData={stockData} 
                            loading={loading} 
                            lastUpdated={lastUpdated} 
                            onRefresh={getStockData}
                        />
                    </>
                )}
            </div>
        </>
    );
}
