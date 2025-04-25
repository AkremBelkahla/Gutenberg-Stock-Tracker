/**
 * Composant pour afficher les données d'une action.
 */
import { __ } from '@wordpress/i18n';

export default function StockCard({ symbol, data }) {
    const { c, pc, d, dp } = data; // c = prix actuel, pc = prix précédent, d = changement, dp = pourcentage de changement
    const isPositive = d >= 0;
    
    return (
        <div className="stock-card">
            <div className="stock-card-header">
                <h4 className="stock-symbol">{symbol}</h4>
                <span className="stock-price">${c.toFixed(2)}</span>
            </div>
            
            <div className="stock-card-body">
                <div className={`stock-change ${isPositive ? 'positive' : 'negative'}`}>
                    <span className="stock-change-arrow">
                        {isPositive ? '↑' : '↓'}
                    </span>
                    <span className="stock-change-value">
                        ${Math.abs(d).toFixed(2)} ({Math.abs(dp).toFixed(2)}%)
                    </span>
                </div>
                
                <div className="stock-previous">
                    {__('Précédent: ', 'stock-tracker')}
                    <span className="stock-previous-value">${pc.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}
