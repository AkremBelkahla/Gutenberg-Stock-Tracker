/**
 * Composant pour afficher les messages d'erreur.
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

export default function ErrorMessage({ message, onRetry }) {
    return (
        <div className="stock-tracker-error">
            <p className="stock-tracker-error-message">{message}</p>
            {onRetry && (
                <Button
                    isPrimary
                    onClick={onRetry}
                >
                    {__('Réessayer', 'stock-tracker')}
                </Button>
            )}
        </div>
    );
}
