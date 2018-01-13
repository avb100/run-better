function planRace() {
	var markup = "<tr><td>Test</td><td>Testing</td></tr>";
    $("#calculator-results").append(markup);
}

$("#race-result-slider").on(
	"input", function() {
		$("#race-result-display").text( Math.floor( $("#race-result-slider").val()/60 )+" minutes, "+$("#race-result-slider").val()%60 + " seconds" );
	}
);