<?php
/**
 * Plugin Name: Gutenberg Stock Tracker
 * Description: Un bloc Gutenberg pour suivre les données boursières et les taux de change en temps réel.
 * Version: 1.0.0
 * Author: Akrem Belkahla
 * Site: infinityweb.tn
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: stock-tracker
 * Domain Path: /languages
 *
 * @package stock-tracker
 */

// Empêcher l'accès direct
if (!defined('ABSPATH')) {
    exit;
}

/**
 *  Enregistre les blocs Gutenberg et les assets associés.
 */
function stock_tracker_register_block() {
    // Enregistre le script Editor pour Stock Tracker
    $asset_file = include(__DIR__ . '/build/index.asset.php');
    wp_register_script(
        'stock-tracker-editor',
        plugins_url('build/index.js', __FILE__),
        $asset_file['dependencies'],
        $asset_file['version']
    );

    // Enregistre le script Frontend pour Stock Tracker
    $frontend_asset_file = include(__DIR__ . '/build/frontend.asset.php');
    wp_register_script(
        'stock-tracker-frontend',
        plugins_url('build/frontend.js', __FILE__),
        $frontend_asset_file['dependencies'],
        $frontend_asset_file['version'],
        true
    );
    
    // Enregistre le script Editor pour Currency Tracker
    $currency_asset_file = include(__DIR__ . '/build/currency-index.asset.php');
    wp_register_script(
        'currency-tracker-editor',
        plugins_url('build/currency-index.js', __FILE__),
        $currency_asset_file['dependencies'],
        $currency_asset_file['version']
    );
    
    // Enregistre le script Frontend pour Currency Tracker
    $currency_frontend_asset_file = include(__DIR__ . '/build/currency-frontend.asset.php');
    wp_register_script(
        'currency-tracker-frontend',
        plugins_url('build/currency-frontend.js', __FILE__),
        $currency_frontend_asset_file['dependencies'],
        $currency_frontend_asset_file['version'],
        true
    );

    // Initialise les données du script
    $script_data = array();
    wp_localize_script('stock-tracker-editor', 'stockTrackerData', $script_data);
    wp_localize_script('stock-tracker-frontend', 'stockTrackerData', $script_data);
    wp_localize_script('currency-tracker-editor', 'currencyTrackerData', $script_data);
    wp_localize_script('currency-tracker-frontend', 'currencyTrackerData', $script_data);

    // Enregistre les styles
    wp_register_style(
        'stock-tracker-style',
        plugins_url('build/style-index.css', __FILE__),
        array(),
        filemtime(__DIR__ . '/build/style-index.css')
    );

    // Enregistre le bloc Stock Tracker
    register_block_type('stock-tracker/market-data', array(
        'editor_script' => 'stock-tracker-editor',
        'editor_style' => 'stock-tracker-style',
        'style' => 'stock-tracker-style',
        'attributes' => array(
            'stockSymbols' => array(
                'type' => 'array',
                'default' => array('AAPL', 'MSFT', 'GOOGL')
            ),
            'apiKey' => array(
                'type' => 'string',
                'default' => ''
            ),
            'autoRefresh' => array(
                'type' => 'boolean',
                'default' => true
            ),
            'refreshInterval' => array(
                'type' => 'number',
                'default' => 5
            )
        ),
        'render_callback' => function($attributes, $content) {
            wp_enqueue_script('stock-tracker-frontend');
            return $content;
        }
    ));
    
    // Enregistre le bloc Currency Tracker
    register_block_type('stock-tracker/currency-tracker', array(
        'editor_script' => 'currency-tracker-editor',
        'editor_style' => 'stock-tracker-style',
        'style' => 'stock-tracker-style',
        'attributes' => array(
            'baseCurrency' => array(
                'type' => 'string',
                'default' => 'EUR'
            ),
            'targetCurrencies' => array(
                'type' => 'array',
                'default' => array('USD', 'GBP', 'JPY', 'CAD')
            ),
            'apiKey' => array(
                'type' => 'string',
                'default' => '4fdbd0d69ad56a5ca6bb3f72'
            ),
            'autoRefresh' => array(
                'type' => 'boolean',
                'default' => true
            ),
            'refreshInterval' => array(
                'type' => 'number',
                'default' => 5
            )
        ),
        'render_callback' => function($attributes, $content) {
            // Enregistrer le script avec les attributs
            wp_enqueue_script('currency-tracker-frontend');
            
            // Passer les attributs au script frontend
            wp_localize_script('currency-tracker-frontend', 'currencyTrackerData', $attributes);
            
            // Ajouter un identifiant unique pour le débogage
            $unique_id = uniqid('currency-tracker-');
            $content = str_replace('class="wp-block-stock-tracker-currency-tracker"', 'class="wp-block-stock-tracker-currency-tracker" data-id="' . $unique_id . '"', $content);
            
            return $content;
        }
    ));
}
add_action('init', 'stock_tracker_register_block');

/**
 * Ajoute la catégorie de bloc personnalisée si elle n'existe pas déjà.
 *
 * @param array $categories Les catégories de blocs existantes.
 * @return array Les catégories de blocs mises à jour.
 */
function stock_tracker_block_categories($categories) {
    $category_slugs = wp_list_pluck($categories, 'slug');
    
    if (!in_array('widgets', $category_slugs, true)) {
        $categories[] = array(
            'slug'  => 'widgets',
            'title' => __('Widgets', 'stock-tracker'),
            'icon'  => null,
        );
    }
    
    return $categories;
}
add_filter('block_categories_all', 'stock_tracker_block_categories', 10, 1);
