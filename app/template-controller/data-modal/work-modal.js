html_addWork = `
<div id="add-workModal" class="modal fade">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" onclick="dismissWorkModal()" aria-hidden="true">&times;</button>
				<h4 class="modal-title">Add a new type of work</h4>
			</div>

			<div class="modal-body">
				<div class="form-group">
					<label for="work-foreignKey">Associated jurisdiction: </label>
					<br>
					<input id="work-foreignKey" type="text" style="width:100%" disabled/>					
				</div>

				<div class="form-group">
					<label for="work-name">Type of work: </label>
					<br>
					<input id="work-name" type="text" style="width:100%" placeholder="Audiovisual"/>
				</div>

			</div>

			<div class="modal-footer">
				<!--<button type="button" class="btn btn-danger pull-left" onclick="deleteUserInputsElt()">Delete</button>-->
				<button type="button" class="btn btn-default" onclick="dismissWorkModal()">Close</button>
				<button type="button" class="btn btn-primary" onclick="dumpWork()">Save changes</button>
			</div>
		</div>
	</div>
</div>
`;


function injectWorkModal(){
	$('#modal-section').append(html_addWork);
}

function dumpWork(){
	var error_log = "";
	if($('#work-name').val() == ''){
		error_log += "Work name is empty\n";
	}
	
	if(error_log != ""){
		$('.modal-header').notify(error_log, {position:'bottom-left', className:'error'});
		return;
	}

	var work = new WorkElt();
	saveElt('Work', work, work.countryId, function(success){
		if(success){
			getWork(work.countryId);
			$('#data-editor').notify('New work inserted into the database', {position:'top-left', className:'success'});
			dismissWorkModal();			
		}
		else{
			$('.modal-header').notify("Failed to save the new type of work within database", {position:'bottom-left', className:'error'});
		}
	});
}

function WorkElt(){
	this.countryId = selectedCountry.id;
	this.name = $('#work-name').val();
}


function dismissWorkModal(){
	$('.modal-body > input').val('');
	$('#add-workModal').modal('hide');
}