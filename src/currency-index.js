/**
 * Fichier d'entrée principal pour le bloc Currency Tracker.
 */
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import CurrencyEdit from './currency-edit';
import CurrencySave from './currency-save';
import './style.scss';

// Enregistrement du bloc
registerBlockType('stock-tracker/currency-tracker', {
    apiVersion: 2,
    title: __('Currency Tracker', 'stock-tracker'),
    description: __('Affiche les taux de change des devises en temps réel', 'stock-tracker'),
    category: 'widgets',
    icon: 'money-alt',
    supports: {
        html: false,
        align: ['wide', 'full'],
    },
    attributes: {
        currencyPairs: {
            type: 'array',
            default: [
                {from: 'EUR', to: 'USD'},
                {from: 'USD', to: 'EUR'},
                {from: 'EUR', to: 'GBP'},
                {from: 'EUR', to: 'JPY'}
            ],
        },
        apiKey: {
            type: 'string',
            default: '4fdbd0d69ad56a5ca6bb3f72',
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
    edit: CurrencyEdit,
    save: CurrencySave,
});
