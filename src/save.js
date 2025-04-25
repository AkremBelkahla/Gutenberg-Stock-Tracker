/**
 * Composant de sauvegarde pour le bloc Stock Tracker.
 * Comme nous utilisons des données dynamiques, nous n'avons pas besoin de sauvegarder de contenu.
 */
import { useBlockProps } from '@wordpress/block-editor';

export default function Save({ attributes }) {
    const { stockSymbols, apiKey, autoRefresh, refreshInterval } = attributes;
    const blockProps = useBlockProps.save();

    return (
        <div {...blockProps} 
            data-symbols={stockSymbols.join(',')}
            data-api-key={apiKey}
            data-auto-refresh={autoRefresh.toString()}
            data-refresh-interval={refreshInterval}
        >
            <div className="stock-tracker-container"></div>
        </div>
    );
}
