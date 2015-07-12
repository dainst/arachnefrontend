/**
 * Author: Daniel M. de Oliveira
 */

var poster = require('../../test/e2e/poster.js');

describe('/admin/dataimport',function(){
	
	it('should show the idle state on initial page load',function(){
		
		poster.post('/configure/data/admin/dataimport',{status:'idle'});
		
		browser.get('http://localhost:1234/admin/dataimport');
		expect(element(by.id('dataimport_status')).getText()).toBe('Dataimport status: idle');
	});
});
