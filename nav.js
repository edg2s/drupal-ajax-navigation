/**
 * Drupal AJAX Navigation
 * https://github.com/edg2s/drupal-ajax-navigation
 *
 * Copyright 2012-13, ed@semplicewebsites.com
 *
 * GPLv3
 */

var drupalAjaxNavigation = {};

( function ( $ ) {
	var options = {
			'wrapper': '#main-wrapper',
			'contents': '#main',
			'menu': '#main-menu a'
		},
		History = window.History,
		pageCache = {};

	/**
	 * Initialise menu click events
	 *
	 * @private
	 */
	function initMenu () {
		$( options.menu ).each( function() {
			var path = relativePath( $( this ).attr( 'pathname' ) );
			$( this ).click( function () {
				History.pushState( null, null, path );
				return false;
			} );
		} );
	}

	/**
	 * Loads the page from the page cache or the 'net
	 *
	 * @private
	 * @param {string} path URL path to load
	 */
	function loadPage ( path ) {
		$( options.wrapper ).trigger( 'ajaxupdatestart', [path] );
		if ( pageCache[path] ) {
			$( options.wrapper ).html( pageCache[path].contents );
			writePage( pageCache[path].title, path );
		} else {
			$( options.wrapper ).load( path + ' ' + options.contents, function ( response ) {
				var title = response.match( /<title>([^<]+)<\/title>/ )[1];
				pageCache[path] = {
					'contents': $( this ).html(),
					'title': title
				};
				writePage( title, path );
			} );
		}
	}

	/**
	 * Writes the page data (contents & title) to the DOM
	 *
	 * @private
	 * @param {string} title Page title
	 * @param {string} path URL path being loaded
	 */
	function writePage( title, path ) {
		// re-initialise the menu (not required if menu is not inside content)
		initMenu();
		try {
			$( 'title' ).html( title );
		} catch( e ) {
			var titleText = $( '<div/>' ).html( title ).text();
			document.title = titleText;
		}
		$( options.wrapper ).trigger( 'ajaxupdateend', [path] );
		// Track Google Analytics pageview
		/*jshint nomen:false */
		if( typeof _gaq !== 'undefined' ) {
			_gaq.push( ['_trackPageview', path] );
		}
	}

	/**
	 * Get a normalised relative path (always with a leading /)
	 *
	 * @private
	 * @param {string} path URL path
	 * @returns {string} Relative path
	 */
	function relativePath ( path ) {
		var a = $('<a>').attr( 'href', path ),
			pathname = a.attr( 'pathname' );
		return ( pathname.substr(1) !== '/' ? '/' : '' ) + pathname + a.attr( 'search' );
	}

	/**
	 * Initialise ajax navigation
	 *
	 * @public
	 * @param {Object} o Options
	 * @param {string} o.wrapper Selector for the element which wraps the content to be updated
	 * @param {string} o.contents Selector for the content to be updated
	 * @param {string} o.menu Selector for links which trigger ajax navigation
	 */
	drupalAjaxNavigation.init = function ( o ) {
		if ( !History.enabled ) {
			return false;
		}

		$.extend( options, o );

		// Redirect if page loads with hash data
		if ( location.hash.substr( 0, 3 ) === '#./' ) {
			location.href = location.hash.substr( 3 );
		}

		$( function () {
			initMenu();
			History.Adapter.bind( window, 'statechange', function () {
				var state = History.getState();
				loadPage( relativePath( state.url ) );
			} );
			pageCache[relativePath( History.getState().url )] = {
				'contents': $( options.wrapper ).html(),
				'title': $( 'title' ).html()
			};
		} );
	};

	/**
	 * Load pages into the local page cache from a selection of links
	 *
	 * @public
	 * @param {string} select Selector for anchor tags
	 */
	drupalAjaxNavigation.preCacheLinks = function ( selector ) {
		$( selector ).each( function () {
			drupalAjaxNavigation.preCachePath( relativePath( $( this ).attr( 'pathname' ) ) );
		} );
	};

	/**
	 * Load a page into the local page cache
	 *
	 * @public
	 * @param {string} path URL path to load
	 */
	drupalAjaxNavigation.preCachePath = function ( path ) {
		if ( !pageCache[path] ) {
			$( '<div>' ).load( path + ' ' + options.contents, function ( response ) {
				var title = response.match( /<title>([^<]+)<\/title>/ )[1];
				pageCache[path] = {
					'contents': $( this ).html(),
					'title': title
				};
			} );
		}
	};
} )( jQuery );
