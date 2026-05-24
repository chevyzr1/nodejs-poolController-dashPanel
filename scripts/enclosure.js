(function ($) {
    $.widget('pic.enclosure', {
        options: {},
        _remSocket: null,
        _remUrl: null,
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
            $('<span class="picEnclosureFanStatus picEnclosureFanUnknown">---</span>').appendTo(fanRow);
        },
        _connectRem: function () {
            var self = this;
            var njspcUrl = $('body').attr('data-apiserviceurl') || '';
            if (!njspcUrl) return;
            var match = njspcUrl.match(/^(https?:\/\/[^:/]+)/);
            if (!match) return;
            self._remUrl = match[1] + ':8080';
            // Fetch initial relay state from REM
            $.ajax({
                url: self._remUrl + '/devices/all',
                method: 'GET',
                timeout: 5000,
                success: function (devices) {
                    var fanDevice = null;
                    if (Array.isArray(devices)) {
                        fanDevice = devices.find(function (d) { return d.name === 'Pi Fan'; });
                    }
                    if (fanDevice && fanDevice.binding) {
                        $.ajax({
                            url: self._remUrl + '/state/device/' + encodeURIComponent(fanDevice.binding),
                            method: 'GET',
                            timeout: 5000,
                            success: function (state) {
                                self._setFanStatus(state === true || state === 'true');
                            }
                        });
                    }
                }
            });
            // Subscribe to real-time relay state changes
            self._remSocket = io(self._remUrl, { reconnectionDelay: 3000, reconnection: true });
            self._remSocket.on('i2cDataValues', function (data) {
                if (!data || !Array.isArray(data.relayStates)) return;
                var relay = data.relayStates.find(function (r) { return r.id === 2; });
                if (typeof relay === 'undefined') return;
                self._setFanStatus(relay.state === true);
            });
        },
        _setFanStatus: function (isOn) {
            var el = this.element;
            el.find('span.picEnclosureFanStatus')
                .text(isOn ? 'ON' : 'OFF')
                .removeClass('picEnclosureFanOn picEnclosureFanOff picEnclosureFanUnknown')
                .addClass(isOn ? 'picEnclosureFanOn' : 'picEnclosureFanOff');
        },
        setTemps: function (data) {
            var self = this, el = self.element;
            if (typeof data.enclosureTemp === 'undefined' || data.enclosureTemp === 0) return;
            var temp = data.enclosureTemp;
            var units = typeof data.units === 'object' ? data.units.val : (data.units || 'F');
            el.find('span.picEnclosureTempValue').text(temp.toFixed(1));
            el.find('label.picEnclosureTempUnit').text('°' + units);
            if (!self._remSocket) self._connectRem();
        }
    });
}(jQuery));
