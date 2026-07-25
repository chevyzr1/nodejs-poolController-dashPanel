(function ($) {
    $.widget('pic.heaterStatus', {
        options: {},
        _create: function () {
            var self = this, el = self.element;
            el[0].initHeaters = function (heaters) { return self.initHeaters(heaters); };
            el[0].updateHeater = function (heater) { return self.updateHeater(heater); };
            el[0].setEquipmentMessage = function (msg) { return self.setEquipmentMessage(msg); };
        },
        initHeaters: function (heaters) {
            var self = this, el = self.element;
            el.empty();
            $('<div class="picCircuitTitle control-panel-title"><span class="picCircuitTitle">Heater Status</span></div>').appendTo(el);
            var panel = $('<div class="picHeaterStatusPanel"></div>').appendTo(el);
            if (!heaters || heaters.length === 0) return;
            for (var i = 0; i < heaters.length; i++) {
                self._buildHeaterRow(panel, heaters[i]);
            }
        },
        _buildHeaterRow: function (panel, heater) {
            var self = this;
            var row = $('<div class="picHeaterStatusRow"></div>').attr('data-heaterid', heater.id).appendTo(panel);
            var nameRow = $('<div class="picHeaterStatusName"></div>').appendTo(row);
            var commName = typeof heater.commStatus === 'object' ? heater.commStatus.name : (heater.commStatus || 'ready');
            $('<div class="picIndicator"></div>').attr('data-status', commName === 'ready' ? 'on' : 'error').appendTo(nameRow);
            $('<span class="picHeaterName"></span>').text(heater.name || 'Heater').appendTo(nameRow);
            var typeDesc = typeof heater.type === 'object' ? heater.type.desc : '';
            if (typeDesc) $('<span class="picHeaterType"></span>').text(typeDesc).appendTo(nameRow);
            var flame = $('<span class="picHeaterFlame fas fa-fire"></span>').appendTo(nameRow);
            if (!heater.isOn) flame.addClass('picHeaterFlameOff');

            var statsRow = $('<div class="picHeaterStats"></div>').appendTo(row);
            var cycleDiv = $('<div class="picHeaterStat"></div>').appendTo(statsRow);
            $('<label>Cycles</label>').appendTo(cycleDiv);
            $('<span class="picHeaterCycleCount"></span>').text(heater.cycleCount || 0).appendTo(cycleDiv);

            var gvDiv = $('<div class="picHeaterStat"></div>').appendTo(statsRow);
            $('<label>GV Hours</label>').appendTo(gvDiv);
            $('<span class="picHeaterGVHours"></span>').text(typeof heater.gasValveHours !== 'undefined' ? heater.gasValveHours : '--').appendTo(gvDiv);

            var timeDiv = $('<div class="picHeaterStat"></div>').appendTo(statsRow);
            $('<label class="picHeaterTimeLabel">Last off</label>').appendTo(timeDiv);
            var timeSpan = $('<span class="picHeaterTimeValue">--</span>').appendTo(timeDiv);
            if (heater.isOn && heater.startTime) {
                timeDiv.find('label').text('On since');
                timeSpan.text(new Date(heater.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            } else if (!heater.isOn && heater.endTime) {
                timeSpan.text(new Date(heater.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            }

            $('<div class="picHeaterFaults"></div>').appendTo(row);
        },
        updateHeater: function (heater) {
            var self = this, el = self.element;
            var row = el.find('div.picHeaterStatusRow[data-heaterid=' + heater.id + ']');
            if (row.length === 0) {
                var panel = el.find('div.picHeaterStatusPanel');
                if (panel.length === 0) { self.initHeaters([heater]); return; }
                self._buildHeaterRow(panel, heater);
                return;
            }
            var commName = typeof heater.commStatus === 'object' ? heater.commStatus.name : (heater.commStatus || 'ready');
            row.find('div.picIndicator').attr('data-status', commName === 'ready' ? 'on' : 'error');
            var flame = row.find('span.picHeaterFlame');
            if (heater.isOn) flame.removeClass('picHeaterFlameOff'); else flame.addClass('picHeaterFlameOff');
            if (typeof heater.cycleCount !== 'undefined') row.find('span.picHeaterCycleCount').text(heater.cycleCount);
            if (typeof heater.gasValveHours !== 'undefined') row.find('span.picHeaterGVHours').text(heater.gasValveHours);
            var timeLabel = row.find('label.picHeaterTimeLabel');
            var timeSpan = row.find('span.picHeaterTimeValue');
            if (heater.isOn && heater.startTime) {
                timeLabel.text('On since');
                timeSpan.text(new Date(heater.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            } else if (!heater.isOn && heater.endTime) {
                timeLabel.text('Last off');
                timeSpan.text(new Date(heater.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            }
        },
        setEquipmentMessage: function (msg) {
            var el = this.element;
            if (!msg || !msg.code) return;
            var parts = msg.code.split(':');
            if (parts[0] !== 'heater' || parts.length < 3) return;
            var heaterId = parseInt(parts[1], 10);
            var row = el.find('div.picHeaterStatusRow[data-heaterid=' + heaterId + ']');
            if (row.length === 0) return;
            var faults = row.find('div.picHeaterFaults');
            var existing = faults.find('span[data-msgcode="' + msg.code + '"]');
            if (msg.severity === 'warning' || msg.severity === 'error') {
                var label = parts[2] === 'hilimit' ? 'Hi-Limit Trip' : parts[2] === 'sensor' ? 'Sensor Fault' : parts[2] === 'pump' ? 'Pump/Flow Fault' : msg.code;
                if (existing.length === 0) {
                    $('<span class="picHeaterFaultMsg"></span>').attr('data-msgcode', msg.code).text(label).appendTo(faults);
                } else {
                    existing.text(label);
                }
            } else {
                existing.remove();
            }
        }
    });
}(jQuery));
