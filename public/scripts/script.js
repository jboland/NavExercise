var HUGE = {
	// create XHR request to load in navigation JSON
	loadMenu: function(url, callback) {
		var xhr = new XMLHttpRequest();

		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4 && xhr.status === 200) {
				var data = JSON.parse(xhr.responseText);
				callback(data);
			} else {
				return;
			}
		}

		xhr.open('GET', url, true);
		xhr.send();
	},

	// construct nav menu from JSON response
	constructMenu: function(data) {
		var menuItems = data.items,
			compiledItems = [],
			mobileCopyright = document.createElement('div');

		if(menuItems.length > 0) {
			compiledItems = HUGE.parseItems(menuItems);
		}

		mobileCopyright.className = 'copyright';
		mobileCopyright.innerHTML = '&copy; 2014 Huge. All Rights Reserved.';

		compiledItems.appendChild(mobileCopyright);
		document.querySelector('#nav-wrapper').appendChild(compiledItems);
	},

	parseItems: function(menuItems) {
		var i,
			j,
			item,
			secondaryItem,
			secondaryList,
			label,
			url,
			finalItems,
			childItems;

		finalItems = document.createElement('ul');
		finalItems.className = 'nav';
		finalItems.id = 'nav';

		// loop through nav items
		for(i = 0; i < menuItems.length; i++) {
			item = document.createElement('li');
			item.innerHTML = '<a href="' + menuItems[i]['url'] + '">' 
							+ menuItems[i]['label'] + '</a>';
			item.className = 'primary';

			// Create secondary items when they exist
			if(menuItems[i]['items'] && menuItems[i]['items'].length > 0) {
				item.className += ' expandable';
				item.onclick = HUGE.toggleSecondary;
				secondaryList = document.createElement('ul');
				for(j=0; j < menuItems[i]['items'].length; j++) {
					secondaryItem = document.createElement('li');
					secondaryItem.innerHTML = '<a href="' + menuItems[i]['items'][j]['url'] + '"' 
											+ ' class="navigate"'
											+ '>' + menuItems[i]['items'][j]['label'] + '</a>';
					secondaryItem.className = 'secondary';
					secondaryList.appendChild(secondaryItem);
					secondaryItem.onclick = HUGE.navigate;
				} 
				item.appendChild(secondaryList);
			} else {
				item.onclick = HUGE.navigate;
			}
			finalItems.appendChild(item);
		}
		return finalItems;
	},

	// Close / Open secondary nav list
	toggleSecondary: function(event) {
		event.preventDefault();
		// close other open secondary lists
		var openSecondary = document.querySelector('.expandable.expanded');
		if (openSecondary && !this.classList.contains('expanded')) {
			openSecondary.classList.toggle('expanded');
			this.classList.toggle('expanded');
		} else {
			this.classList.toggle('expanded');
			HUGE.toggleOverlayDesktop();
		}
	},

	// reset window location to primary or secondary nav URL
	navigate: function() {
		// force removal of the overlay when on mobile view
		if (window.innerWidth < 768) {
			HUGE.removeOverlay(arguments[0], true);
		}
		// set location in navbar and reload page to simulate navigation to hash url
		window.location.href = this.children[0].href;
		location.reload();
	},

	// base events that can be added on window load
	attachEvents: function() {
		
		// Nav show / hide on hamburger / close link for mobile
		document.querySelector('.mobile-nav i').addEventListener('click', function(event) {
			event.preventDefault();
			document.body.classList.toggle('nav-open');
			HUGE.toggleOverlay();
		});

		// for mobile, hide overlay when clicking off menu on content
		document.querySelector('#content').addEventListener('click', function(event) {
			HUGE.removeOverlay(event);
		});

		// Click event to remove overlay / close menu on click off of opened menu
		document.body.addEventListener('click', function(event) {
			if (event.target.localName != 'a') {
				if (document.querySelector('.overlay') != null && document.querySelector('.expanded') != null) {
					HUGE.removeOverlay(event);
				}
			}
		});

	},

	// Helper to close nav window and remove overlay
	removeOverlay: function(event, force) {
		if (event.target.localName != 'a' || !event.target.classList.contains('navigate') || force) {
			if (document.querySelector('.overlay') != null) {
				document.querySelector('.overlay').remove();
				if (document.querySelector('.expandable.expanded')) {
					document.querySelector('.expandable.expanded').classList.toggle('expanded');
				}
				if(window.innerWidth < 768) {
					document.body.classList.toggle('nav-open');
				}
			}
		}
	},

	// Wrapper for toggling overlay on desktop
	toggleOverlayDesktop: function() {
		if (window.innerWidth >= 768) {
			HUGE.toggleOverlay();
		}
	},

	// Create or remove overlay when nav is opened
	toggleOverlay: function() {
		if (document.querySelector('.overlay') === null) {
			var overlay = document.createElement('div');
			overlay.className = 'overlay';
			document.querySelector('#content').appendChild(overlay);
		} else {
			document.querySelector('.overlay').remove();
		}
	}

}

// Load nav data on window load, and attach appropriate click events
window.onload = function() {
	HUGE.loadMenu('/api/nav.json', HUGE.constructMenu);
	HUGE.attachEvents();
}