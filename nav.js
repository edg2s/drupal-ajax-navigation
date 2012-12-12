/**
 * Drupal AJAX Navigation
 * https://github.com/edg2s/drupal-ajax-navigation
 * 
 * Copyright 2012, ed@semplicewebsites.com
 * 
 * GPLv3
 */

(function($) {

	/**
	 * Options.
	 * There are four selectors you need configure.
	 * 
	 * wrapper:  the element which wraps the content to be updated
	 * contents: the content to be updated
	 * menu:     links which trigger ajax navigation
	 * fade:     content to fade in/out on navigation.
	 *           use null to disable animation
	 */
	var options = {
		wrapper: '#main-wrapper',
		contents: '#main',
		menu: '#main-menu a',
		fade: null
	}

	var History = window.History;
	if ( !History.enabled ) {
		return false;
	}

	/**
	 * Redirect if page loads with hash data
	 */
	if(location.hash.substr(0, 3) == '#./') {
		location.href = location.hash.substr(3);
	}
	
	/**
	 * Override menu click events
	 */
	var initMenu = function() {
		$(options.menu).each(function() {
			var path = ($(this).attr('pathname').substr(0, 1) != '/') ? '/' + $(this).attr('pathname') : $(this).attr('pathname');
			$(this).click(function() {
				History.pushState(null, null, path);
				return false;
			});
		});
	};

	var pageCache = {};

	/**
	 * Loads the page from the page cache or the 'net
	 */
	var loadPage = function(path) {
		if(options.fade) $(options.fade).fadeOut('fast');
		if(pageCache[path]) {
			$(options.wrapper).html(pageCache[path].body);
			writePage(pageCache[path].title, path);
		} else {
			$(options.wrapper).load(path + ' ' + options.contents, function(response) {
				var title = response.match(/<title>([^<]+)<\/title>/)[1];
				pageCache[path] = {
					body: $(this).html(),
					title: title
				};
				writePage(title, path);
			});
		}
	};
	
	/**
	 * Writes the page data (body & title) to the DOM
	 */
	var writePage = function(title, path) {
		if(options.fade) $(options.fade).hide().fadeIn('fast');
		// re-initialise the menu (not required if menu is not inside content)
		initMenu();
		try {
			$('title').html(title);
		} catch(e) {
			var titleText = $('<div/>').html(title).text();
			document.title = titleText;
		}
		// Track Google Analytics pageview
		if(typeof _gaq != 'undefined') _gaq.push(['_trackPageview', path]);
	};

	/**
	 * Initialise
	 */
	$(document).ready(function() {
		initMenu();
		History.Adapter.bind(window, 'statechange', function() {
			var State = History.getState();
			loadPage(State.url);
		});
		pageCache[History.getState().url] = {
			body: $(options.wrapper).html(),
			title: $('title').html()
		};
	});

})(jQuery);
