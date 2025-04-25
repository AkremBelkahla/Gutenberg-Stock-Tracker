<?php
/**
 * Plugin Name: Stock Tracker
 * Description: Un bloc Gutenberg pour suivre les données boursières en temps réel.
 * Version: 1.0.0
 * Author: Votre Nom
 * License: GPL-2.0-or-later
 * Text Domain: stock-tracker
 *
 * @package stock-tracker
 */

// Empêcher l'accès direct
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Enregistre le bloc Gutenberg et les assets associés.
 */
function stock_tracker_register_block() {
    // Enregistre automatiquement tous les blocs dans le répertoire build
    register_block_type(__DIR__ . '/build');

    // Enregistre le script pour les appels API côté client
    wp_register_script(
        'stock-tracker-api',
        plugins_url('build/api.js', __FILE__),
        array('wp-api-fetch'),
        filemtime(plugin_dir_path(__FILE__) . 'build/api.js'),
        true
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
