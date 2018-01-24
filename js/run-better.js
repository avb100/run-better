function planRace() {
  $("#calculator-results").children("tr").remove();

	var secondsPerMile = ($("#race-result-slider").val()) / $("#race-result-distance").val();
	var secondsPerKilometer = ($("#race-result-slider").val()) / $("#race-result-distance").val() / 1.60934;

	for (i=1;i<=Math.floor( $("#race-result-distance").val() );i++) { //Mile rows
		for (j=Math.ceil((i-1)*1.60934);j<=Math.floor(i*1.60934);j++) { //Kilometer rows
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

function predictRaces() {
  $("#prediction-results").children("tr").remove();

  var seedVo2Max = parseFloat( $("#vo2-max").text() );
  var seedDistance = parseFloat( $("#race-result-distance").val() );

  var distances = $("#race-result-distance").children();

  for (i=0;i<distances.length;i++){
    if ( Math.abs( Math.log2( seedDistance ) - Math.log2(distances[i].value) )>2 ) {
      continue;
    }
    var predictionSeconds = vo2prediction(seedVo2Max, distances[i].value);

    var predictLine = "<tr";
    if (distances[i].selected==="selected") {
      predictLine += " class=\"font-weight-bold\"";
    }
    predictLine += "><td>" + distances[i].text + "</td><td>";
    predictLine += shortTimeFormat( predictionSeconds );
    predictLine += "</td><td>";
    predictLine += shortTimeFormat( predictionSeconds/distances[i].value );
    predictLine += "</td></tr>";
    $("#prediction-results").append( predictLine );
  }
}

function vo2prediction(vo2Max, miles) {

  var meters = miles * 1609.344;
  var prediction = 1;
  var precision = 1;

  while (precision>0.0001) {
    var precision = (((0.000104*Math.pow(meters, 2)*Math.pow(prediction,-2))+(0.182258*meters*Math.pow(prediction, -1))-4.6)/(0.2989558*Math.pow(Math.E,-0.1932605*prediction)+0.1894393*Math.pow(Math.E,-0.012778*prediction)+0.8))-vo2Max;
    var accuracy =  ((((0.2989558*Math.pow(Math.E,-0.1932605*prediction))+(0.1894393*Math.pow(Math.E,-0.012778*prediction))+0.8)*((-0.000208)*(Math.pow(meters,2))*(Math.pow(prediction,-3)))-((0.182258)*meters*(Math.pow(prediction,-2))))-(vo2Max*((0.2989558)*(Math.pow(Math.E,-0.1932605*prediction))+(0.1894393)*(Math.pow(Math.E,-0.012778*prediction)))))/Math.pow(((0.2989558*Math.pow(Math.E,-0.1932605*prediction))+(0.1894393*Math.pow(Math.E,-0.012778*prediction))+0.8),2);
    prediction = prediction - precision/accuracy;
  }
  return prediction*60;
}

function percentMax(minutes) {
	return 0.2989558 * Math.pow(Math.E, -0.1932605*minutes) + 0.1894393 * Math.pow(Math.E, -0.012778*minutes) + 0.8;
}

function vo2(velocity) {
	return 0.000104 * Math.pow(velocity, 2) + 0.182258 * velocity - 4.60;
}

function vo2max(seconds, miles) {
	var minutes = parseFloat(seconds)/60.0;

	var velocity = miles * 1609.344 / minutes;

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
		//Adjust slider, but keep marker in the same place, relative to new distance.
		var oldMin = $("#race-result-slider").attr("min");
		var oldMax = $("#race-result-slider").attr("max");
		var oldVal = $("#race-result-slider").val();

    var miles = $("#race-result-distance").val();
    var vo2Max = parseFloat( ($("#vo2-max").text()) );

		var newMin = Math.floor( 220 * miles ); //Minimum of 3:40 per mile
		var newMax = Math.ceil( 720 * miles ); //Maximum of 12:00 per mile

		$("#race-result-slider").attr("min", newMin );
		$("#race-result-slider").attr("max", newMax );

		//$("#race-result-slider").val( sliderPercent * (newMax-newMin) + newMin );
    $("#race-result-slider").val( Math.round(vo2prediction(vo2Max, miles)) );

		//Recalculate everything
		$("#race-result-slider").trigger( "input" );
	}
);

$("#race-result-slider").on(
	"input", function() {
    //Get performance details
    var seconds = $("#race-result-slider").val();
		var miles = $("#race-result-distance").val();

		//Show slider value in text as Race Result
		$("#race-result-display").text( longTimeFormat( seconds ) );

		//Calculate VO2 Max of performance
		$("#vo2-max").text( vo2max( seconds, miles ).toFixed(2) );

    //Calculate pace of performance in minutes per mile
    $("#pace").text( shortTimeFormat(seconds/miles) );

    //Calculate pace of performance in miles per hour
    $("#pace-mph").text( (miles/(seconds/3600)).toFixed(2) );

		//Complete pace chart
		planRace();

    //Predict race results
    predictRaces();
	}
);
