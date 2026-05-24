(function ($) {
    $.widget('pic.enclosure', {
        options: {},
        _fanOn: false,
        _create: function () {
            var self = this, el = self.element;
            el[0].setTemps = function (data) { self.setTemps(data); };
            self._build();
        },
        _build: function () {
            var el = this.element;
            el.empty();
            $('<div class="picCircuitTitle control-panel-title"><span class="picCircuitTitle">Enclosure</span></div>').appendTo(el);
            var panel = $('<div class="picEnclosurePanel"></div>').appendTo(el);
            var tempRow = $('<div class="picEnclosureRow"></div>').appendTo(panel);
            $('<label class="picEnclosureLabel">Temp</label>').appendTo(tempRow);
            $('<span class="picEnclosureTempValue">--</span>').appendTo(tempRow);
            $('<label class="picEnclosureTempUnit">°F</label>').appendTo(tempRow);
            var fanRow = $('<div class="picEnclosureRow"></div>').appendTo(panel);
            $('<label class="picEnclosureLabel">Fan</label>').appendTo(fanRow);
            $('<span class="picEnclosureFanStatus picEnclosureFanOff">OFF</span>').appendTo(fanRow);
        },
        setTemps: function (data) {
            var self = this, el = self.element;
            if (typeof data.enclosureTemp === 'undefined' || data.enclosureTemp === 0) return;
            var temp = data.enclosureTemp;
            var units = typeof data.units === 'object' ? data.units.val : (data.units || 'F');
            el.find('span.picEnclosureTempValue').text(temp.toFixed(1));
            el.find('label.picEnclosureTempUnit').text('°' + units);
            // Fan hysteresis: REM turns fan on at 50°C, off at 44°C
            var tempC = (units === 'C') ? temp : (temp - 32) * 5 / 9;
            if (tempC >= 50) self._fanOn = true;
            else if (tempC <= 44) self._fanOn = false;
            el.find('span.picEnclosureFanStatus')
                .text(self._fanOn ? 'ON' : 'OFF')
                .toggleClass('picEnclosureFanOn', self._fanOn)
                .toggleClass('picEnclosureFanOff', !self._fanOn);
        }
    });
}(jQuery));
