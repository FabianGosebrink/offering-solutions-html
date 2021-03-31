$.fn.jQuerySimpleCounter = function( options ) {
	var settings = $.extend({
		start:  0,
		end:    100,
		easing: 'swing',
		duration: 400,
		complete: ''
	}, options );

	var thisElement = $(this);

	$({count: settings.start}).animate({count: settings.end}, {
		duration: settings.duration,
		easing: settings.easing,
		step: function() {
			var mathCount = Math.ceil(this.count);
			thisElement.text(mathCount + " +");
		},
		complete: settings.complete
	});
};

var number1End = $('#number1').html()
var number2End = $('#number2').html()
var number3End = $('#number3').html()
var number4End = $('#number4').html()

$('#number1').jQuerySimpleCounter({end: number1End ,duration: 3000});
$('#number2').jQuerySimpleCounter({end: number2End ,duration: 3000});
$('#number3').jQuerySimpleCounter({end: number3End ,duration: 2000});
$('#number4').jQuerySimpleCounter({end: number4End ,duration: 2500});

