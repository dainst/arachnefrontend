describe('con10t pages', function() {

    it('should contain markers on the grako_map page', function() {
    	browser.get('/project/grako_map');
        var markers = element.all(by.css('.leaflet-marker-icon'));
        expect(markers.length).toBeGreaterThan(0);
    });

});