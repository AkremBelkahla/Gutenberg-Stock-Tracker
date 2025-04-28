<?php
/**
 * Plugin Name: Gutenberg Stock Tracker
 * Description: Un bloc Gutenberg pour suivre les données boursières en temps réel.
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
 * 🔑 Récupère la clé API Finnhub depuis le fichier .key
 * 
 * @return string La clé API ou une chaîne vide si le fichier n'existe pas
 */
function stock_tracker_get_api_key() {
    $key_file = __DIR__ . '/.key';
    if (file_exists($key_file)) {
        return trim(file_get_contents($key_file));
    }
    return '';
}

/**
 * 💾 Enregistre le bloc Gutenberg et les assets associés.
 */
function stock_tracker_register_block() {
    // Enregistre le bloc à partir du fichier block.json
    register_block_type(__DIR__);
    
    // Enregistre la clé API comme variable JavaScript globale
    wp_add_inline_script(
        'wp-blocks',
        'window.stockTrackerData = ' . wp_json_encode(array(
            'apiKey' => stock_tracker_get_api_key(),
        )) . ';',
        'before'
    );
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
