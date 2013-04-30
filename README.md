drupal-ajax-navigation
======================

<http://semplicewebsites.com/drupal-7-ajax-page-navigation>

Add basic ajax page navigation support to Drupal 7

Usage
=====

Initialisation:

    drupalAjaxNavigation.init()
    
with options:

    drupalAjaxNavigation.init( {
        'wrapper': '#main-wrapper',
        'contents': '#main',
        'menu': '#main-menu a'
    } );

Events:

    $( 'body' ).bind( 'ajaxupdatestart', function() {
        $( '#content' ).fadeOut();
    } );
    
    $( 'body' ).bind( 'ajaxupdateend', function() {
        $( '#content' ).hide().fadeIn();
    } );
