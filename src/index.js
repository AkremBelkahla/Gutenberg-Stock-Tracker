/**
 * Fichier d'entrée principal pour le bloc Stock Tracker.
 */
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import Edit from './edit';
import Save from './save';
import './style.scss';

// Enregistrement du bloc
registerBlockType('stock-tracker/market-data', {
    apiVersion: 2,
    title: __('Stock Tracker', 'stock-tracker'),
    description: __('Affiche les données boursières en temps réel', 'stock-tracker'),
    category: 'widgets',
    icon: 'chart-line',
    supports: {
        html: false,
        align: ['wide', 'full'],
    },
    attributes: {
        stockSymbols: {
            type: 'array',
            default: ['AAPL', 'MSFT', 'GOOGL'],
        },
        apiKey: {
            type: 'string',
            default: '',
        },
        autoRefresh: {
            type: 'boolean',
            default: true,
        },
        refreshInterval: {
            type: 'number',
            default: 5,
        },
    },
    edit: Edit,
    save: Save,
});
