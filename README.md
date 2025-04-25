# Stock Tracker - Plugin WordPress Gutenberg

Un bloc Gutenberg pour afficher les données boursières en temps réel dans votre site WordPress.

## Fonctionnalités

- Affichage des données boursières en temps réel via l'API Finnhub
- Sélection multiple de symboles d'actions
- Actualisation automatique des données
- Interface utilisateur active et moderne
- Affichage des variations de prix avec codes couleur
- Gestion des erreurs et des limites de taux API

## Installation

1. Téléchargez le dossier `Gutenberg-Stock-Tracker` dans le répertoire `wp-content/plugins/` de votre installation WordPress
2. Activez le plugin via le menu "Extensions" dans l'administration WordPress
3. La clé API Finnhub est déjà configurée par défaut : `d05rgchr01qgqsu940tgd05rgchr01qgqsu940u0`

## Configuration requise

- WordPress 5.8 ou supérieure
- PHP 7.4 ou supérieure

## Utilisation

1. Ajoutez le bloc "Stock Tracker" à votre page ou article
2. Dans le panneau latéral, vérifiez que la clé API Finnhub est présente (elle est pru00e9-configuru00e9e)
3. Sélectionnez les symboles d'actions que vous souhaitez afficher
4. Configurez les options d'actualisation selon vos pru00e9fu00e9rences

## Développement

### Installation des dépendances

```bash
npm install
```

### Compilation des assets

```bash
# Pour le développement (avec surveillance des fichiers)
npm run start

# Pour la production
npm run build
```

## Captures d'écran

*Des captures d'écran seront ajoutées après la première version stable*

## Licence

GPL-2.0-or-later
