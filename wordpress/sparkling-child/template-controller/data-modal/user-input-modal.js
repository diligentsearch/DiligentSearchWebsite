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
				<button type="button" class="btn btn-danger pull-left" onclick="deleteUserInputsElt()">Delete</button>
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
		$('.modal-header').notify(error_log, {position:'bottom-left', className:'error'});
		return;
	}

	var input = new InputElt();	
	// Save it into db
	saveData('SharedUserInput', input, currentInputId, selectedCountry.id, function(success){
		if(success){
			injectData('userInput', currentInputIndex, input, loadUserInput);
			$('#data-editor').notify('Element saved in database', {position:'top-left', className:'success'});
			dismissUserInputModal();				
		}
		else{
			$('.modal-header').notify("Failed to save element within database", {position:'bottom-left', className:'error'});
		}	
	});
}

function dismissUserInputModal(){
	// Reset fields and modal
	$('#input-reference').val('');
	$('#input-question').val('');
	$('#input-details').val('');

	if(currentInputIndex != -1){
		currentInputIndex = -1;
	}
	if(currentInputId != undefined){
		currentInputId = undefined;
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

function deleteUserInputsElt(){
	deleteData('SharedUserInput', currentInputId, dismissUserInputModal);
}