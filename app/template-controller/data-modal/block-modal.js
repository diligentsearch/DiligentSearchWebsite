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
					<label>Questions contained within this block : </label>

					<div style="overflow:auto;">
						<div style="float:left; width:70%; margin-left:3%">
							<table class"table table-responsive table-bordered table-stripped" style="width:100%">
								<thead>
									<th style="width:10%; text-align:center">#</th>
									<th style="width:50%; text-align:center">Question</th>
									<th style="width:35%; text-align:center">Type</th>
									<th style="width:5%;  text-align:center"></th>
								</thead>
								<tbody id="block-questions-selection">
								</tbody>
							</table>
						</div>
						<div id="block-questions-management" style="float:right" >				
							<button id="addQuestion" type="button">+</button>
							<button id="delLastQuestion" type="button">-</button>
						</div>
					</div>
				</div>


			</div>

			<div class="modal-footer">
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

		console.log("Block : adding question");

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
		alert(error_log);
		return;
	}

	var block = new BlockElt(),
		nbQuestions = $('#block-questions-selection > tr').length;

	for (var i = 0; i < nbQuestions; i++) {
		block.questions.push($('#block-questions-selection-id-'+i).val());
	}


	if(currentBlockId === undefined){
		saveBlockElt(block);
	}
	else{
		block.id = currentBlockId;
		updateBlockElt(block);
	}


	injectBlockData(currentBlockIndex, block);	
	dismissBlockModal();	
};

function dismissBlockModal(){
	$('.modal-body').find("input").val("");
	delQuestions();
	if(currentBlockIndex != -1){
		currentBlockIndex = -1;
	}
	$('#add-blockModal').modal('hide');
}


function BlockElt(){
	this.id 			= undefined;
	this.name 			= $('#block-name').val();
	this.introduction	= $('#block-introduction').val();
	this.questions 		= [];
};


function saveBlockElt(blockElt){
	$.when(ajaxInsertBlockElt(blockElt, selectedWork.id)).then(
		function(result){
			$.when(ajaxGetLast()).then(function(last){
				blockElt.id = last[0]['LAST_INSERT_ID()'];
				updateBlockElt(blockElt);
			});
		}, 
		function(error){
			console.log('saveBlockElt ', error);
	});
}

function updateBlockElt(blockElt){
	$.when(ajaxUpdateBlockElt(blockElt)).then(
		function(result){
			// console.log("updateInputElt ", result);
		},
		function(error){
			console.log("updateBlockElt ", error);	
	});
}








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
				<input id="block-questions-selection-`+i+`" class="ui-autocomplete" style="margin-left:5%; margin-right:5%; width:90%" type="text" placeholder="Question ref"/>
			</th>
			<th style="padding:1%">
				<input id="block-questions-selection-type-`+i+`" style="margin-left:5%; margin-right:5%; width:90%" disabled="disabled"/>
			</th>
			<th style="padding:1%">
				<input id="block-questions-selection-id-`+i+`" type="hidden">
			</th>
		</tr>
	`;
	return question;
}

function configQuestionComplete(i){
	$('#block-questions-selection-'+i).autocomplete({
		minLength: 0,
		autocomplete: true,
		source: function(request, response){
			response($.map(questions, function(value, key){
				return {
					label: value.name
				}
			}));
		},
		open: function() { 
			var parent_width = $('#block-questions-selection-'+i).width();
			$('.ui-autocomplete').width(parent_width);
		},
		select: function(event, ui){
			$(this).val(ui.item.value);

			// Look for the id of this question and insert it in good position
			var rowIdx = 0;			
			for (var i = 0; i < questions.length; i++) {
				if($(this).val() == questions[i].name){
					$('#block-questions-selection-type-'+rowIdx).val(questions[i].type);
					$('#block-questions-selection-id-'+rowIdx).val(questions[i].id);

					rowIdx++;	// increase row idx for next line
					console.log("adding : ", rowIdx, i, questions[i].type, questions[i].id);
				}
			}
		}
	}).bind('focus', function(){ $(this).autocomplete("search"); } );
}
