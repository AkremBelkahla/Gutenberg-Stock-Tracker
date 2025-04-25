/**
 * Composant pour afficher une grille de cartes d'actions.
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import StockCard from './StockCard';

export default function StockGrid({ stockData, loading, lastUpdated, onRefresh }) {
    return (
        <div className="stock-tracker-grid">
            <div className="stock-tracker-header">
                <h3>{__('Données boursières', 'stock-tracker')}</h3>
                <div className="stock-tracker-controls">
                    {lastUpdated && (
                        <span className="stock-tracker-last-updated">
                            {__('Dernière mise à jour: ', 'stock-tracker')}
                            {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                    <Button
                        isPrimary
                        onClick={onRefresh}
                        isBusy={loading}
                        disabled={loading}
                    >
                        {__('Actualiser', 'stock-tracker')}
                    </Button>
                </div>
            </div>
            
            <div className="stock-tracker-cards">
                {Object.entries(stockData).map(([symbol, data]) => (
                    <StockCard key={symbol} symbol={symbol} data={data} />
                ))}
            </div>
        </div>
    );
}
