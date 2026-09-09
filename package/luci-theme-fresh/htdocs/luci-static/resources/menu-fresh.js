'use strict';
'require baseclass';
'require ui';

return baseclass.extend({
	__init__() {
		ui.menu.load().then(L.bind(this.render, this));
	},

	render(tree) {
		let node = tree;
		let url = '';

		this.renderModeMenu(tree);
		this.bindThemeToggle();

		if (L.env.dispatchpath.length >= 3) {
			for (let i = 0; i < 3 && node; i++) {
				node = node.children[L.env.dispatchpath[i]];
				url += (url ? '/' : '') + L.env.dispatchpath[i];
			}

			if (node)
				this.renderTabMenu(node, url);
		}

		this.bindDropdowns();
	},

	bindThemeToggle() {
		if (window.FreshTheme && window.FreshTheme.bindToggle)
			window.FreshTheme.bindToggle();
	},

	renderTabMenu(tree, url, level) {
		const container = document.querySelector('#tabmenu');
		const ul = E('ul', { 'class': 'tabs', 'aria-label': _('Page navigation') });
		const children = ui.menu.getChildren(tree);
		let activeNode = null;

		children.forEach(child => {
			const isActive = L.env.dispatchpath[3 + (level || 0)] === child.name;
			const className = 'tabmenu-item-%s%s'.format(child.name, isActive ? ' active' : '');

			ul.appendChild(E('li', { 'class': className }, [
				E('a', {
					'href': L.url(url, child.name),
					'aria-current': isActive ? 'page' : null
				}, [ _(child.title) ])
			]));

			if (isActive)
				activeNode = child;
		});

		if (!ul.children.length)
			return E([]);

		container.appendChild(ul);
		container.style.display = '';

		if (activeNode)
			this.renderTabMenu(activeNode, url + '/' + activeNode.name, (level || 0) + 1);

		return ul;
	},

	renderMainMenu(tree, url, level) {
		const depth = level || 0;
		const ul = depth
			? E('ul', { 'class': 'dropdown-menu' })
			: document.querySelector('#topmenu');
		const children = ui.menu.getChildren(tree);

		if (!children.length || depth > 1)
			return E([]);

		children.forEach(child => {
			const submenu = this.renderMainMenu(child, url + '/' + child.name, depth + 1);
			const hasChildren = !!submenu.firstElementChild;
			const isActive = L.env.dispatchpath[depth + 1] === child.name;
			const link = E('a', {
				'class': (!depth && hasChildren) ? 'menu' : '',
				'href': hasChildren ? '#' : L.url(url, child.name),
				'aria-current': (!hasChildren && isActive) ? 'page' : null,
				'aria-haspopup': hasChildren ? 'true' : null,
				'aria-expanded': hasChildren ? 'false' : null
			}, [ _(child.title) ]);

			ul.appendChild(E('li', {
				'class': [(!depth && hasChildren) ? 'dropdown' : '', isActive ? 'active' : ''].join(' ').trim()
			}, [ link, submenu ]));
		});

		ul.style.display = '';
		return ul;
	},

	renderModeMenu(tree) {
		const ul = document.querySelector('#modemenu');
		const children = ui.menu.getChildren(tree);

		children.forEach((child, index) => {
			const isActive = L.env.requestpath.length
				? child.name === L.env.requestpath[0]
				: index === 0;

			ul.appendChild(E('li', { 'class': isActive ? 'active' : '' }, [
				E('a', {
					'href': L.url(child.name),
					'aria-current': isActive ? 'page' : null
				}, [ _(child.title) ])
			]));

			if (isActive)
				this.renderMainMenu(child, child.name);
		});

		if (ul.children.length > 1)
			ul.style.display = '';
	},

	bindDropdowns() {
		const menus = document.querySelectorAll('#topmenu > .dropdown > a.menu');

		menus.forEach(link => {
			link.addEventListener('click', ev => {
				ev.preventDefault();
				ev.stopPropagation();
				const item = link.parentNode;
				const open = !item.classList.contains('open');

				menus.forEach(other => {
					other.parentNode.classList.remove('open');
					other.setAttribute('aria-expanded', 'false');
				});

				item.classList.toggle('open', open);
				link.setAttribute('aria-expanded', open ? 'true' : 'false');
			});
		});

		document.addEventListener('click', ev => {
			if (ev.target.closest && ev.target.closest('#topmenu > .dropdown'))
				return;

			menus.forEach(link => {
				link.parentNode.classList.remove('open');
				link.setAttribute('aria-expanded', 'false');
			});
		});

		document.addEventListener('keydown', ev => {
			if (ev.key !== 'Escape')
				return;

			menus.forEach(link => {
				link.parentNode.classList.remove('open');
				link.setAttribute('aria-expanded', 'false');
			});
		});
	}
});
