Drupal 7 ajax navigation
======================

<http://semplicewebsites.com/drupal-7-ajax-page-navigation>

Add basic ajax page navigation support to Drupal 7

Installation
============

Install [Drupal 7](https://drupal.org) and the [History.js module](https://drupal.org/project/history_js)

Add nav.js to your theme's JS folder and .info file.

Add the initialisation code below to your script.js/global.js file if you don't already have one.

Usage
=====

Basic initialisation:

    drupalAjaxNavigation.init()
    
or with options to override selectors:

    drupalAjaxNavigation.init( {
        'wrapper': '#main-wrapper',
        'contents': '#main',
        'menu': '#main-menu a'
    } );

You can use the init function to pre-cache pages, e.g. everything in the main menu:

    $( function() {
        drupalAjaxNavigation.preCacheLinks( '#main-menu a' );
    } );

You can use bind events to set up transitions or other functionality:

    $( 'body' ).bind( 'ajaxupdatestart', function() {
        $( '#content' ).fadeOut();
    } );
    
    $( 'body' ).bind( 'ajaxupdateend', function() {
        $( '#content' ).hide().fadeIn();
    } );
