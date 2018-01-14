function planRace() {
	//Accepts distance in meters and pace in seconds per mile
    $("#calculator-results").children("tr").remove();
	
	var secondsPerMile = ($("#race-result-slider").val()) / $("#race-result-distance").val();
	var secondsPerKilometer = ($("#race-result-slider").val()) / $("#race-result-distance").val() / 1.60934;
	
	for (i=1;i<=Math.floor( $("#race-result-distance").val() );i++) {
		for (j=Math.ceil((i-1)*1.60934);j<=Math.floor(i*1.60934);j++) {
			var kilometerRow = "<tr><td class=\"font-italic\">" + (j/1.60934).toFixed(2) + "</td><td></td><td>" + j + "</td><td>" + shortTimeFormat( secondsPerKilometer*j ) + "</td>";
			if (j>0) {
				$("#calculator-results").append(kilometerRow);
			}
		}
		var mileRow = "<tr><td>" + i + "</td><td>" + shortTimeFormat( secondsPerMile*i ) + "</td><td class=\"font-italic\">" + (i*1.60934).toFixed(2) + "</td><td></td></tr>";
		$("#calculator-results").append(mileRow);
	}
	if ( $("#race-result-distance").val() > Math.floor($("#race-result-distance").val()) ) {
		var lastRow = "<tr><th>" + ($("#race-result-distance").val()*1.0).toFixed(2) + "</th>";
        lastRow += "<th>" + shortTimeFormat( $("#race-result-slider").val() ) + "</th>";
        lastRow += "<th>" + ($("#race-result-distance").val()*1.60934).toFixed(2) + "</th>";
        lastRow += "<th>" + shortTimeFormat( $("#race-result-slider").val() ) + "</th></tr>";
		$("#calculator-results").append(lastRow);
	}
}

function percentMax(minutes) {
	return 0.8 + 0.1894393 * Math.pow(Math.E, -0.012778*minutes) + 0.2989558 * Math.pow(Math.E, -0.1932605*minutes);
}

function vo2(velocity) {
	return -4.60 + 0.182258 * velocity + 0.000104 * Math.pow(velocity, 2);
}

function vo2max(seconds, secondsPerMile) {
	var velocity = parseFloat(secondsPerMile)*1609.344;
	var minutes = parseFloat(seconds)/60.0;
	return vo2(velocity) / percentMax(minutes);
}

function shortTimeFormat(inputSeconds) {
		var readout = "";
		
		var hours = Math.floor( inputSeconds / 3600 );
		var minutes = Math.floor( (inputSeconds % 3600) / 60);
		var seconds = Math.floor( inputSeconds % 60 );
		
		if (hours>0) {
			readout += hours + ":";
		}
		if (minutes>=0) {
			readout += (hours>0 && minutes<10 ? "0" : "") + minutes + ":";
		}
		readout += (seconds<10 ? "0" : "") + seconds;
		return readout;
}

function longTimeFormat(inputSeconds) {
		var readout = "";
		
		var hours = Math.floor( inputSeconds / 3600 );
		var minutes = Math.floor( (inputSeconds % 3600) / 60);
		var seconds = Math.round( inputSeconds % 60 );
		
		if (hours>0) {
			readout += hours + " hour" + (hours>1 ? "s" : "" ) + ", ";
		}
		if (minutes>0) {
			readout += minutes + " minute" + (minutes>1 ? "s" : "") + ", ";
		}
		readout += seconds + " second" + (seconds!=1 ? "s" : "");
		return readout;
}

$("#race-result-distance").change(
	function () {
		var oldMin = $("#race-result-slider").attr("min");
		var oldMax = $("#race-result-slider").attr("max");
		var oldVal = $("#race-result-slider").val();
		
		var sliderPercent = (oldVal-oldMin) / (oldMax-oldMin);
		
		var newMin = Math.floor( 220 * $("#race-result-distance").val() );
		var newMax = Math.ceil( 1080 * $("#race-result-distance").val() );
		
		$("#race-result-slider").attr("min", newMin );
		$("#race-result-slider").attr("max", newMax );
		
		$("#race-result-slider").val( sliderPercent * (newMax-newMin) + newMin );
		$("#race-result-slider").trigger( "input" );
	}
);

$("#race-result-slider").on(
	"input", function() {
		$("#race-result-display").text( longTimeFormat( $("#race-result-slider").val() ) );
	}
);
