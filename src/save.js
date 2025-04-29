/**
 * Composant de sauvegarde pour le bloc Stock Tracker.
 * Comme nous utilisons des données dynamiques, nous n'avons pas besoin de sauvegarder de contenu.
 */
import { useBlockProps } from '@wordpress/block-editor';

export default function Save({ attributes }) {
    const { stockSymbols, apiKey, autoRefresh, refreshInterval } = attributes;
    const blockProps = useBlockProps.save();

    console.log('Stock Tracker Save: Attributs transmis', {
        stockSymbols,
        hasApiKey: !!apiKey,
        autoRefresh,
        refreshInterval
    });

    return (
        <div {...blockProps} 
            data-symbols={stockSymbols.join(',')}
            data-api-key={apiKey || ''}
            data-auto-refresh={autoRefresh.toString()}
            data-refresh-interval={refreshInterval}
        >
            <div className="stock-tracker-grid">
                <div className="stock-tracker-header">
                    <h3>Données boursières</h3>
                    <div className="stock-tracker-controls">
                        <span className="stock-tracker-last-updated"></span>
                    </div>
                </div>
                <div className="stock-tracker-cards"></div>
            </div>
        </div>
    );
}
