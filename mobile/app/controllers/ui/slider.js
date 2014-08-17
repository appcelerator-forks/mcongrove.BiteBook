// App bootstrap
var App = require("core");

var callback;

var VALUE = {
	top: 0,
	bottom: 0
};

var OPTIONS;

var GESTURE = {
	top: {
		startX: 0,
		current: 0,
		segment: 0,
		element: $.ValueTop
	},
	bottom: {
		startX: 0,
		current: 0,
		segment: 0,
		element: $.ValueBottom
	}
};

$.setOptions = function(_options) {
	OPTIONS = _options;
	
	VALUE.top = OPTIONS.top.min;
	GESTURE.top.segment = App.Device.width / OPTIONS.top.segment;
	$.ValueTop.text = OPTIONS.top.min + OPTIONS.top.label;
	
	VALUE.bottom = OPTIONS.bottom.min;
	GESTURE.bottom.segment = App.Device.width / OPTIONS.bottom.segment;
	$.ValueBottom.text = OPTIONS.bottom.min + OPTIONS.bottom.label;
};

$.setCallback = function(_callback) {
	callback = _callback;
};

$.open = function() {
	var animation = Ti.UI.createAnimation({
		opacity: 1,
		duration: 250
	});

	animation.addEventListener("complete", function onComplete() {
		$.Wrapper.opacity = 1;

		animation.removeEventListener("complete", onComplete);
	});

	$.Wrapper.animate(animation);
};

$.close = function(_callback) {
	var animation = Ti.UI.createAnimation({
		opacity: 0,
		duration: 250
	});

	animation.addEventListener("complete", function onComplete() {
		$.Wrapper.opacity = 0;

		_callback();

		animation.removeEventListener("complete", onComplete);
	});

	$.Wrapper.animate(animation);
};

$.Submit.addEventListener("click", function(_event) {
	$.close(function() {
		callback(VALUE);
	});
});

$.Top.addEventListener("touchstart", function(_event) {
	handleTouchStart("top", _event);
});

$.Top.addEventListener("touchmove", function(_event) {
	handleTouchMove("top", _event);
});

$.Top.addEventListener("touchend", function(_event) {
	handleTouchEnd("top", _event);
});

$.Bottom.addEventListener("touchstart", function(_event) {
	handleTouchStart("bottom", _event);
});

$.Bottom.addEventListener("touchmove", function(_event) {
	handleTouchMove("bottom", _event);
});

$.Bottom.addEventListener("touchend", function(_event) {
	handleTouchEnd("bottom", _event);
});

function handleTouchStart(_section, _event) {
	GESTURE[_section].startX = _event.x;
	GESTURE[_section].current = VALUE[_section];
}

function handleTouchMove(_section, _event) {
	var difference = _event.x - GESTURE[_section].startX;
	var change = (Math.round(difference / GESTURE[_section].segment));
	var value = VALUE[_section] + change;
	var discontinue = false;
	
	if(value < OPTIONS[_section].min) {
		value = OPTIONS[_section].min;
		
		discontinue = true;
	}
	
	if(value > OPTIONS[_section].max) {
		value = OPTIONS[_section].max;
		
		discontinue = true;
	}
	
	if(!discontinue) {
		GESTURE[_section].current = change;
		GESTURE[_section].element.text = value + OPTIONS[_section].label;
	}
}

function handleTouchEnd(_section, _event) {
	VALUE[_section] = VALUE[_section] + GESTURE[_section].current;
}