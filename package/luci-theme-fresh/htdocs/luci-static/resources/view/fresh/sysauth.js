'use strict';
'require ui';
'require view';

return view.extend({
	render: function() {
		var form = document.querySelector('form'),
		    btn = document.querySelector('button.important, button.cbi-button-positive'),
		    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		document.documentElement.classList.add('fresh-login-page');
		document.body.classList.add('fresh-login-page');

		var dlg = ui.showModal(
			_('Log in'),
			[].slice.call(document.querySelectorAll('section > *')),
			'login'
		);

		var host = dlg.querySelector('.fresh-login-host');
		var title = dlg.querySelector('h4');

		if (title && host)
			title.after(host);

		if (host && !host.textContent.trim()) {
			var fromTitle = (document.title || '').split(' - ')[0].trim();
			if (fromTitle)
				host.textContent = fromTitle;
		}

		dlg.setAttribute('aria-labelledby', title ? (title.id || 'fresh-login-title') : '');
		if (title && !title.id)
			title.id = 'fresh-login-title';

		form.addEventListener('keydown', function(ev) {
			if (ev.key === 'Enter') {
				ev.preventDefault();
				btn.click();
			}
		});

		btn.addEventListener('click', function() {
			if (btn.disabled)
				return;

			btn.disabled = true;
			dlg.setAttribute('aria-busy', 'true');
			document.body.classList.add('fresh-login-busy');
			dlg.classList.add('fresh-login-busy');

			if (!dlg.querySelector('.fresh-login-status'))
				dlg.appendChild(E('div', { 'class': 'fresh-login-status' }, [
					E('span', { 'class': 'fresh-login-spinner', 'aria-hidden': 'true' }),
					E('span', {}, _('Logging in…'))
				]));

			window.setTimeout(function() {
				document.body.classList.add('fresh-login-leave');
				window.setTimeout(function() {
					form.submit();
				}, reduce ? 0 : 240);
			}, reduce ? 0 : 280);
		});

		document.body.classList.add('fresh-login-ready');
		document.querySelector('input[type="password"]').focus();
		return '';
	},

	addFooter: function() {}
});
