// SPDX-License-Identifier: Apache-2.0

'use strict';
'require form';
'require fs';
'require poll';
'require rpc';
'require uci';
'require view';

const callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { '': {} }
});

function serviceRunning() {
	return L.resolveDefault(callServiceList('adguardhome'), {}).then(function(res) {
		const instances = res?.adguardhome?.instances || {};
		return Object.keys(instances).some(function(name) {
			return instances[name].running === true;
		});
	});
}

function serviceAction(action) {
	return fs.exec('/etc/init.d/adguardhome', [ action ]);
}

return view.extend({
	load: function() {
		return Promise.all([
			uci.load('adguardhome'),
			serviceRunning()
		]);
	},

	render: function(data) {
		let m, s, o;

		m = new form.Map('adguardhome', _('AdGuard Home'),
			_('AdGuard Home starts by default on DNS port 53. dnsmasq remains on port 54 for DHCP and local-name resolution.'));

		s = m.section(form.TypedSection);
		s.anonymous = true;
		s.render = function() {
			poll.add(function() {
				return serviceRunning().then(function(running) {
					const node = document.getElementById('adguardhome_status');
					if (node)
						node.innerHTML = running
							? '<em><span style="color:green"><strong>%s</strong></span></em>'.format(_('RUNNING'))
							: '<em><span style="color:red"><strong>%s</strong></span></em>'.format(_('NOT RUNNING'));
				});
			});

			return E('div', { class: 'cbi-section' }, [
				E('p', {}, [ E('strong', {}, _('Service status')), ': ',
					E('span', { id: 'adguardhome_status' }, data[1] ? _('RUNNING') : _('NOT RUNNING')) ])
			]);
		};

		s = m.section(form.NamedSection, 'config', 'adguardhome', _('Service settings'));
		s.anonymous = true;

		o = s.option(form.Flag, 'enabled', _('Enable service'));
		o.rmempty = false;

		o = s.option(form.Value, 'config', _('Configuration file'));
		o.placeholder = '/etc/adguardhome.yaml';
		o.datatype = 'file';

		o = s.option(form.Value, 'workdir', _('Working directory'));
		o.placeholder = '/var/lib/adguardhome';
		o.datatype = 'directory';

		o = s.option(form.Value, 'pidfile', _('PID file'));
		o.placeholder = '/run/adguardhome.pid';
		o.datatype = 'file';

		o = s.option(form.Value, 'web_port', _('Web interface port'),
			_('Used only by the Open Web Interface button. The actual listening port is configured in AdGuard Home.'));
		o.placeholder = '3000';
		o.datatype = 'port';

		o = s.option(form.Button, '_open', _('Web interface'));
		o.inputtitle = _('Open Web Interface');
		o.inputstyle = 'apply';
		o.onclick = function() {
			const port = uci.get('adguardhome', 'config', 'web_port') || '3000';
			window.open('http://' + window.location.hostname + ':' + port + '/', '_blank', 'noopener');
		};

		o = s.option(form.Button, '_start', _('Service control'));
		o.inputtitle = _('Start');
		o.inputstyle = 'apply';
		o.onclick = function() { return serviceAction('start'); };

		o = s.option(form.Button, '_restart');
		o.inputtitle = _('Restart');
		o.inputstyle = 'reload';
		o.onclick = function() { return serviceAction('restart'); };

		o = s.option(form.Button, '_stop');
		o.inputtitle = _('Stop');
		o.inputstyle = 'remove';
		o.onclick = function() { return serviceAction('stop'); };

		return m.render();
	}
});
