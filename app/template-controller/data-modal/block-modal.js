html_block = `
<div id="add-blockModal" class="modal fade">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" onclick="dismissBlockModal()" aria-hidden="true">&times;</button>
				<h4 class="modal-title">Add a new block of questions</h4>
			</div>

			<div class="modal-body">
				<div class="form-group">
					<label for="block-name">Block identifier: </label>
					<br>
					<input id="block-name" type="text" style="width:100%"/>					
				</div>

				<div class="form-group">
					<label for="block-introduction">Block introduction: </label>
					<br>
					<input id="block-introduction" type="text" style="width:100%"/>					
				</div>

				<div id="block-questions" class="form-group">
					<label style="float-left">Questions contained within this block : </label>
					<div id="block-questions-management" style="float:right" >				
						<button id="addQuestion" type="button">+</button>
						<button id="delLastQuestion" type="button">-</button>
					</div>
					

					<div style="overflow:auto; width:100%; margin-left:3%">
						<table class"table table-responsive table-bordered table-stripped" style="width:100%">
							<thead>
								<th style="width:10%;	min-width:10%;	max-width:10%; text-align:center">#</th>
								<th style="width:25%;	min-width:25%;	max-width:25%; text-align:center">Type</th>
								<th style="width:60%;	min-width:60%;	max-width:60%; text-align:center">Question</th>
								<th style="width:5%;	min-width:5%;	max-width:5%;  text-align:center"></th>
							</thead>
							<tbody id="block-questions-selection">
							</tbody>
						</table>
					</div>
				</div>


			</div>

			<div class="modal-footer">
				<button type="button" class="btn btn-danger pull-left" onclick="deleteBlockElt()">Delete</button>
				<button type="button" class="btn btn-default" onclick="dismissBlockModal()">Close</button>
				<button type="button" class="btn btn-primary" onclick="dumpBlock()">Save changes</button>
			</div>
		</div>
	</div>
</div>
`;

function injectBlockModal(){
	$('#modal-section').append(html_block);
	$('#addQuestion').click(function(){	addQuestion();	});
	$('#delLastQuestion').click(function(){	delLastQuestion();	});
	addQuestion();
};


currentBlockIndex = -1;
currentBlockId = undefined;
function loadBlock(index, blockElt){
	currentBlockIndex 	= index;
	currentBlockId 		= blockElt.id;	

	$('#block-name').val(blockElt.name);
	$('#block-introduction').val(blockElt.introduction);

	for (var i = 0; i < blockElt.questions.length; i++) {
		// There is always a 'default' question, so avoid to add one on the first iteration
		if(i != 0){
			addQuestion();			
		}
		var idx = blockElt.questions[i];

		for (var j = 0; j < questions.length; j++) {
			if(idx == questions[j].id){
				var q = questions[j];
				console.log("getting back : ", q);
				$('#block-questions-selection-'+i).val(q.name);
				$('#block-questions-selection-id-'+i).val(q.id);
				$('#block-questions-selection-type-'+i).val(q.type);
			}
		}
	}
	$('#add-blockModal').modal('show');
}


function dumpBlock(){
	var error_log = "";
	if($('#block-name').val() == ''){
		error_log += "Block name is empty\n";
	}
	if($('#block-introduction').val() == ''){
		error_log += "Block question is empty\n";
	}

	if(error_log != ""){
		$('.modal-header').notify(error_log, {position:'bottom-left', className:'error'});
		return;
	}

	var block = new BlockElt(),
		nbQuestions = $('#block-questions-selection > tr').length;

	for (var i = 0; i < nbQuestions; i++) {
		var questionId = $('#block-questions-selection-id-'+i).val();		
		if(questionId != ''){
			block.questions.push(questionId);			
		}
	}


	// Save block into DB
	saveData('Block', block, currentBlockId, selectedWork.id, function(success){
		if(success){
			injectData('block', currentBlockIndex, block, loadBlock);
			$('#data-editor').notify('Element saved in database', {position:'top-left', className:'success'});
			dismissBlockModal();				
		}
		else{
			$('.modal-header').notify('Failed to save element within database', {position:'bottom-left', className:'error'});
		}
	});
};

function dismissBlockModal(){
	$('.modal-body').find("input").val("");
	delQuestions();
	if(currentBlockIndex != -1){
		currentBlockIndex = -1;
	}
	if(currentBlockId !== undefined){
		currentBlockId = undefined;
	}
	$('#add-blockModal').modal('hide');
}


function BlockElt(){
	this.id 			= undefined;
	this.name 			= $('#block-name').val();
	this.introduction	= $('#block-introduction').val();
	this.questions 		= [];
};



/* 
 * HTML Block management
*/

// Insert one more answer in the default answers section
function addQuestion(){
	$('#block-questions-selection').append(getNewQuestion());
	var i = $('#block-questions-selection > tr').length - 1;
	configQuestionComplete(i);
}

// Remove the last inserted answer if possible
function delLastQuestion(){
	if($('#block-questions-selection').children().length >= 2){
		$('#block-questions-selection > tr:last').remove();
	}	
}

function delQuestions(){
	while($('#block-questions-selection').children().length >= 2){
		$('#block-questions-selection > tr:last').remove();
	}
}


function getNewQuestion(){
	var i = $('#block-questions-selection > tr').length,
		j = i+1,
		question = `
		<tr>
			<th style="text-align:center">`+j+`</th>
			<th style="padding:1%">
				<input id="block-questions-selection-type-`+i+`" style="margin-left:5%; margin-right:5%; width:90%" disabled="disabled"/>
			</th>
			<th style="padding:1%">
				<input id="block-questions-selection-`+i+`" style="margin-left:5%; margin-right:5%; width:90%" type="text" placeholder="Question ref"/>
			</th>
			<th style="padding:1%">
				<input id="block-questions-selection-id-`+i+`" type="hidden">
			</th>
		</tr>	
	`;
	return question;
}

function configQuestionComplete(i){
	if (!$('#block-questions-selection-'+i).hasClass("ui-autocomplete-input")) {
		$('#block-questions-selection-'+i).autocomplete({
			minLength: 0,
			autocomplete: true,
			source: function(request, response){
				var search = request.term;
				response($.map(questions, function(value, key){
					if(value.name.substr(0, search.length) == search){
						return { label: value.name	}
					}
				}));
			},
			open: function() { 
				var parent_width = $('#block-questions-selection-'+i).width();
				$('.ui-autocomplete').width(2*parent_width);
			},
			select: function(event, ui){
				$(this).val(ui.item.value);

				var lineSelector = $(this)[0].id.split('-'),
					last = lineSelector.length - 1,
					rowIdx = parseInt(lineSelector[last]);

				// Look for the id of this question and insert it in good position
				for (var i = 0; i < questions.length; i++) {
					if($(this).val() == questions[i].name){
						$('#block-questions-selection-type-'+rowIdx).val(questions[i].type);
						$('#block-questions-selection-id-'+rowIdx).val(questions[i].id);
					}
				}
			}
		}).bind('focus', function(){ $(this).autocomplete("search"); } );
	}
}

function deleteBlockElt(){
	deleteData('Block', currentBlockId, dismissBlockModal);
}