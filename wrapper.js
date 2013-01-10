$(document).ready(function(){
	//call plugin 
	$(".radioBox").buttonsetv();
	$('.radioBox').click(function(e){
		//try{
			if (e.target.offsetParent.htmlFor){
				conflictCheck(e.target.offsetParent.htmlFor);
				setTimeout(updateGraph,25);
			}
		//}
		//catch(e){
		//	console.log(e);
		//}
	});
});

function updateGraph(){
	var blue = findButtonStates('b');
	var red = findButtonStates('r');
	console.log(blue);
	setColors(red, blue);
}

function findButtonStates(color){
	var rv = {};
	rv['sex'] = $('input:radio[name=' + color + '_sex]:checked').val();
	rv['race'] = $('input:radio[name=' + color + '_race]:checked').val();
	rv['age'] = $('input:radio[name=' + color + '_age]:checked').val();
	rv['edu'] = $('input:radio[name=' + color + '_edu]:checked').val();
	return rv;
}

//saves order buttons have been clicked in
//b: blue
//r: red
//sr iff sex clicked more recently than race
//re iff race clicked more recently than education
//es iff education clicked more recently than sex
clickOrder = {	b:{
					sr: true,
					re: true,
					es: false},
				r:{
					sr: true,
					re: true,
					es: false}};

//jqueryui won't update except with .click(), this stops on click from firing more events
var clickLock = false;

//makes sure that a valid series is selected; if not forces a change
function conflictCheck(buttonId){
 	//information about the clicked button
 	console.log(buttonId);
 	var color = buttonId[0];			//clicked color
 	var type = buttonId[1];				//clicked sex/race/age/edu (s/r/a/e)
 	var all = buttonId[2] == 'A';		//if all or subset clicked
 	
 	var typeToChange;					//if type change is require, equal to type which will be set to All
 	var changeRequired = false;			//true if sex/race/edu are all not all 		
 	var buttons = findButtonStates(color);
 	console.log(buttons);

 	//no need to update order or force change if a subset hasn't been selected
 	if (!all){ 		 
 		//update click order object
 		if (type == 's'){
 		 	clickOrder[color]['sr'] = true;
 		 	clickOrder[color]['es'] = false;
 		 	typeToChange = clickOrder[color]['re'] ? 'e' : 'r';
 		 	changeRequired = (buttons['race'] != 0 && buttons['edu'] != 0);
 		}
 		if (type == 'r'){
 		 	clickOrder[color]['re'] = true;
 		 	clickOrder[color]['sr'] = false; 		 	
 		 	typeToChange = clickOrder[color]['es'] ? 's' : 'e';
 		 	changeRequired = (buttons['edu'] != 0 && buttons['sex'] != 0);
 		}
 		if (type == 'e'){
 		 	clickOrder[color]['es'] = true;
 		 	clickOrder[color]['re'] = false;
 		 	typeToChange = clickOrder[color]['sr'] ? 'r' : 's';
 		 	changeRequired = (buttons['sex'] != 0 && buttons['race'] != 0);
 		}

 		if (changeRequired){
 		 	console.log("forcing a change in button state " + typeToChange);
 		 	document.getElementById(color + typeToChange + 'A').click();
 		}

 		//if education was clicked, age must be 25+
 		console.log('type ' + type + '   buttonId ' + buttonId);
 		if (type == 'e'){
 			console.log("education clicked, setting age to A")
 			document.getElementById(color + 'ao').click();
 		}

 	} 	
	//if age 16-24 or All was clicked, education must be All
	if (type == 'a' && buttonId['2'] != 'o'){
		console.log('age young type is ' + type);
		document.getElementById(color+'eA').click();
	}
 }