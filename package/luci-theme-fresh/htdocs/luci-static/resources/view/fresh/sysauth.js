'use strict';
'require ui';
'require view';

return view.extend({
	render: function() {
		var form = document.querySelector('form'),
		    btn = document.querySelector('button');

		document.body.classList.add('fresh-login-page');

		var dlg = ui.showModal(
			_('Log in'),
			[].slice.call(document.querySelectorAll('section > *')),
			'login'
		);

		form.addEventListener('keydown', function(ev) {
			if (ev.key === 'Enter') {
				ev.preventDefault();
				btn.click();
			}
		});

		btn.addEventListener('click', function() {
			btn.disabled = true;
			dlg.querySelectorAll('*').forEach(function(node) {
				node.style.display = 'none';
			});
			dlg.appendChild(E('div', { 'class': 'spinning' }, _('Logging in…')));
			form.submit();
		});

		document.querySelector('input[type="password"]').focus();
		return '';
	},

	addFooter: function() {}
});
