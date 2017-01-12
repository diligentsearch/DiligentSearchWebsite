html_userInput = `
<div id="add-userInputModal" class="modal fade">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" onclick="dismissUserInputModal()" aria-hidden="true">&times;</button>
				<h4 class="modal-title">Add a new user input field</h4>
				<small>This input is used to store data filled in by users, such as numbers, in order to perform computation</small>
			</div>

			<div class="modal-body">
				<div class="form-group">
					<label for="input-reference">Input identifier: </label>
					<br>
					<input id="input-reference" type="text" style="width:100%"/>					
				</div>

				<div class="form-group">
					<label for="input-question">Question asked to the end user: </label>
					<br>
					<input id="input-question" type="text" style="width:100%"/>					
				</div>

				<div class="form-group">
					<label for="input-details">Further information: </label>
					<br>
					<textarea id="input-details" type="text" style="min-width:100%; max-width:100%"/>					
				</div>
			</div>

			<div class="modal-footer">
				<button type="button" class="btn btn-default" onclick="dismissUserInputModal()">Close</button>

				<button type="button" class="btn btn-primary" onclick="dumpUserInput()">Save changes</button>
			</div>
		</div>
	</div>
</div>
`;



function injectUserInputModal(){
	$('#modal-section').append(html_userInput);
};


currentInputIndex = -1;
currentInputId = undefined;
function loadUserInput(index, inputElt){
	currentInputIndex = index;
	currentInputId = inputElt.id;
	$('#input-reference').val(inputElt.name);
	$('#input-question').val(inputElt.question);
	$('#input-details').val(inputElt.information);
	$('#add-userInputModal').modal('show');
}


function dumpUserInput(){
	var error_log = "";
	if($('#input-reference').val() == ''){
		error_log += "Input short name is empty\n";
	}
	if($('#input-question').val() == ''){
		error_log += "Input question is empty\n";
	}

	if(error_log != ""){
		alert(error_log);
		return;
	}

	var input = new InputElt();	

	// Save it into db
	if(currentInputId === undefined){
		saveUserInputElt(input);
	}
	else{
		input.id = currentInputId;
		updateInputElt(input);
	}

	injectUserInputData(currentInputIndex, input);	
	dismissUserInputModal();	
}

function dismissUserInputModal(){
	// Reset fields and modal
	$('#input-reference').val('');
	$('#input-question').val('');
	$('#input-details').val('');

	if(currentInputIndex != -1){
		currentInputIndex = -1;
	}
	if(currentInputId != -1){
		currentInputId = -1;
	}
	$('#add-userInputModal').modal('hide');
}

function InputElt(){
	this.id 			= undefined;
	this.name 			= $('#input-reference').val();
	this.question 		= $('#input-question').val();
	this.information 	= $('#input-details').val();
	this.value 			= undefined;		// Manually set by end user
};






function saveUserInputElt(userInputElt){
	$.when(ajaxInsertUserInputElt(userInputElt, selectedWork.id)).then(
		function(result){
			$.when(ajaxGetLast()).then(function(last){
				userInputElt.id = last[0]['LAST_INSERT_ID()'];
				updateInputElt(userInputElt);
			});
		}, 
		function(error){
			console.log('saveUserInputElt ', error);
	});
}


function updateInputElt(userInputElt){
	$.when(ajaxUpdateInputElt(userInputElt)).then(
		function(result){
			// console.log("updateInputElt ", result);
		},
		function(error){
			console.log("updateInputElt ", error);	
	});
}