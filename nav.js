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
	 * Fetches the page and writes to the DOM
	 *
	 * @private
	 * @param {string} path URL path
	 */
	function loadPage ( path ) {
		$( options.wrapper ).trigger( 'ajaxupdatestart', [path] );
		fetchPage(
			path,
			function () {
				writePage( path );
			},
			function () {
				$( options.wrapper ).trigger( 'ajaxupdateend', [path] );
			}
		);
	}

	/**
	 * Fetch page data for path from cache or 'net
	 *
	 * @private
	 * @param {string} path URL path
	 * @param {Function} [success] Callback to run after fetch is complete
	 * @param {Function} [failure] Callback to run if fetch fails
	 */
	function fetchPage ( path, success, failure ) {
		if ( pageCache[path] ) {
			if ( success ) {
				success();
			}
			return;
		}
		$( '<div>' ).load( path + ' ' + options.contents, function ( response, result ) {
			if ( result === 'success' ) {
				cachePage(
					path,
					getBodyClass( response ),
					$( this ).html(),
					getTitle( response )
				);
				if ( success ) {
					success();
				}
			} else if ( failure ) {
				failure();
			}
		} );
	}

	/**
	 * Writes the page data to the DOM
	 *
	 * @private
	 * @private
	 * @param {string} path URL path being loaded
	 */
	function writePage( path ) {
		var page = pageCache[path];

		// update body classes
		$( 'body' ).attr( 'class', page.bodyClass );

		// write contents inside wrapper
		$( options.wrapper ).html( page.contents );

		// update title
		try {
			$( 'title' ).html( page.title );
		} catch( e ) {
			var titleText = $( '<div/>' ).html( page.title ).text();
			document.title = titleText;
		}

		// re-initialise the menu (not required if menu is not inside content)
		initMenu();

		// fire end event
		$( options.wrapper ).trigger( 'ajaxupdateend', [path, page] );

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
		return ( pathname.substr( 0, 1 ) !== '/' ? '/' : '' ) + pathname + a.attr( 'search' );
	}

	/**
	 * Cache a page in the page cache
	 *
	 * @private
	 * @param {string} path URL path
	 * @param {string} bodyClass Body tag classes
	 * @param {string} contents Content HTML section
	 * @param {string} title HTML title
	 */
	function cachePage ( path, bodyClass, contents, title ) {
		pageCache[path] = {
			'bodyClass': bodyClass,
			'contents': contents,
			'title': title
		};
	}

	/**
	 * Get the body tag's classes from an HTML string
	 *
	 * @private
	 * @param {string} html Document HTML
	 * @returns {string} Classes of the body tag
	 */
	function getBodyClass( html ) {
		return $( html.match( /<body([^>]+)>/ )[0].replace( '<body', '<div' ) ).attr( 'class' );
	}

	/**
	 * Get the title HTML contents from an HTML string
	 *
	 * @private
	 * @param {string} html Document HTML
	 * @returns {string} Title
	 */
	function getTitle( html ) {
		return html.match( /<title>([^<]+)<\/title>/ )[1];
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
			cachePage(
				relativePath( History.getState().url ),
				$( 'body' ).attr( 'class' ),
				$( options.wrapper ).html(),
				$( 'title' ).html()
			);
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
		fetchPage( path );
	};
} )( jQuery );
