var validationFields = ["memberName","age","husbandName","fatherName","address","villageName","idProofValue","addressProofValue","sbAccountNumber","bankId","sbAccountName",
			"branch","permanentAddress","pincode","villages","mobileNo","idProofTypeId","addressProofTypeId","loanAmount","loanTypeValue","comment"];

function getGroupData1(groupID,loanId){
	var memId;
	$.ajax({
	    url: '/getGroupData/'+groupID,
	    dataType: 'json',
	    success: function (data) {
		groupData = data;
		for(var i=0;i<groupData["data"].length;i++){
			var memberId = groupData["data"][i]["memberId"];
			//var memberStatus = groupData["data"][i]["memberStatus"];
			var groupId = groupID;
			var className  = '';
			
			var dataObj = {};
			var memValData = {
				"memberId": memberId,
				"groupId": groupID,
				"loanId": loanId,
				"subStatus": "Rework",
				"userId": "1996",
				"validationType": "PRE",
				"entityType": "MEMBER"
			};
			dataObj['memValData'] = memValData;
			$.ajax({
			    url: '/validateMember/',
			    dataType: 'json',
			    async: false,
			    type: 'post',
			    success: function (data) {
				var memberStatus = data[memberId];
				var memberStatusSplit = memberStatus.split('-');
				memberStatus = memberStatusSplit[0];
				if(memberStatus == "Y"){
				     className = "list-group-item list-group-item-success";
				}
				if(memberStatus == "R"){
				     className = "list-group-item list-group-item-danger";
				}
				if(memberStatus == "N"){
				    className = "list-group-item list-group-item-warning";
				}
				if(document.getElementById("san_test")){
				     	$("#san_test").append('<a id="'+memberId+'" onclick="getMemberDetails('+memberId+','+groupId+','+loanId+')" class="'+className+'" style="font-weight:bold;">'+groupData["data"][i]["memberName"]+'</a>');
				}
			    },
			    data: JSON.stringify(dataObj)
			});
		}
	    }
	});
}



function getGroupData(groupID,loanId){
	var memId;
	$.ajax({
	    url: '/getGroupData/'+groupID,
	    dataType: 'json',
	    success: function (data) {
		groupData = data;
		console.log(groupData);
		for(var i=0;i<groupData["data"].length;i++){
			memId = groupData["data"][0]["memberId"];
			var memberId = groupData["data"][i]["memberId"];
			var memberStatus = groupData["data"][i]["memberStatus"];
			var groupId = groupID;
			var className  = '';
			if(memberStatus == "Active"){
			     className = "list-group-item Pending";
			}
			if(memberStatus == "Approved"){
			     className = "list-group-item list-group-item-success Approved";
			     //$("#operationsDivId").css("display","none");
			    // $("#commentDivId").css("display","none");
			}
			if(memberStatus == "Rejected"){
			     className = "list-group-item list-group-item-danger Rejected";
			    // $("#operationsDivId").css("display","none");
		             //$("#commentDivId").css("display","none");
			}
			if(memberStatus == "Rework"){
			    className = "list-group-item list-group-item-warning Rework";
			    //$("#operationsDivId").css("display","none");
			    //$("#commentDivId").css("display","none");
			}
			if(document.getElementById("san_test")){
			     	$("#san_test").append('<a id="'+memberId+'" onclick="getMemberDetails('+memberId+','+groupId+','+loanId+')" class="'+className+'" style="font-weight:bold;">'+groupData["data"][i]["memberName"]+'</a>');
			}
		}
		getMemberDetails(memId,groupID,loanId);
	    }
	});
	
}



function redirectPage(groupID,loanID,taskName,taskId,processInstanceId){
	if(taskName == "KYC Check"){
		window.location = '/dsgroupview/'+groupID+'/'+loanID+'/'+taskId+'/'+processInstanceId;
	}
	if(taskName == "Query Response"){
		window.location = '/groupViewQuery2/'+groupID+'/'+loanID+'/'+taskId+'/'+processInstanceId;
	}
}


function getMemberDetails(memberId,groupId,loanId){
	if(document.getElementById(memberId).classList.item(3)){
		$("#operationsDivId").css("display","none");
		$("#commentDivId").css("display","none");
		$("#comment").val("");
	}
	else{
		$("#operationsDivId").css("display","block");
		$("#commentDivId").css("display","block");
		$("#comment").val("");
	}
	$.ajax({
	    url: '/getIndMemberData/'+memberId+'/'+groupId+'/'+loanId,
	    //type: 'post',
	    dataType: 'json',
	    success: function (data) {
		var memberData = data;
		//var arrayKeys = ["occupations","villages""conflictList","highMarksList","memberFamilyDetails","memberDocumentDetails"];
		var imgFiles = ["MEMBERPHOTO","IDPROOF","IDPROOF_2","ADDRESSPROOF","ADDRESSPROOF_2","SBACCOUNTPASSBOOK"];
		
		if(memberData["data"]["memberDocumentDetails"]){
			if(memberData["data"]["memberDocumentDetails"][0]){
				var memberDocumentsArray = memberData["data"]["memberDocumentDetails"];
				for(var key in memberDocumentsArray){
					if($.inArray(memberDocumentsArray[key]["documentType"], imgFiles) != -1){
						//Need to change with proper URL - Coded just for images display
						if(document.getElementById(memberDocumentsArray[key]["documentType"]+"_docPath")){
							if(memberDocumentsArray[key]["documentType"] == "MEMBERPHOTO"){
								$("#"+memberDocumentsArray[key]["documentType"]+"_docPath").attr("src",memberDocumentsArray[key]["documentPath"]);
								$("#"+memberDocumentsArray[key]["documentType"]+"_docPath").attr("data-url",memberDocumentsArray[key]["documentPath"]);
							}
							else{
								$("#"+memberDocumentsArray[key]["documentType"]+"_docPath").attr("src","/"+memberDocumentsArray[key]["documentPath"]);
								$("#"+memberDocumentsArray[key]["documentType"]+"_docPath").attr("data-url","/"+memberDocumentsArray[key]["documentPath"]);
							}
						}//
					}
				}
			}
		}
		
		for(var data in memberData["data"]["memberDetails"]){
			document.getElementById("memberNameLabel").innerHTML = memberData["data"]["memberDetails"]["memberName"];
			
			if(document.getElementById(data)){
				if(data == "villages"){
					$('#villages').empty();
					var pincodeData = memberData["data"]["memberDetails"];
					$('#villages').append('<option value="" >   Select Area </option>');
					for(var i = 0; i< pincodeData[data].length; i++){
						$('#villages').append('<option value="'+pincodeData[data][i]["villageId"]+'">'+pincodeData[data][i]["villageName"]+'</option>');
					}
				}
				$("#villages").val(memberData["data"]["memberDetails"]["villageId"]);
				var tagname = document.getElementById(data).tagName;
				if(tagname == "INPUT" || tagname == "SELECT" || tagname == "TEXTAREA"){
					document.getElementById(data).value = memberData["data"]["memberDetails"][data];
				}
				if(tagname == "SPAN"){
					document.getElementById(data).innerHTML = memberData["data"]["memberDetails"][data];
				}
			}
		}
		
		document.getElementById("groupId").innerHTML = groupId;
		document.getElementById("loanId").innerHTML = loanId;
	    }
	});
}

$(document).ready(function(){
	$("#commentsBtn").on("click",function(){
		var mainPane = document.getElementById("main-content-inner").className;
		var commentsPane = document.getElementById("commentsBtn").className;
		if (mainPane == "main-content-inner" && commentsPane == "aside-trigger btn btn-danger btn-app btn-xs ace-settings-btn"){
	    		document.getElementById("main-content-inner").className = "main-content-inner detail-min";
	    	}
	    	else{
	    		document.getElementById("main-content-inner").className = "main-content-inner";
	    	}
	});

	$(".close").on("click",function(){
		var mainPane = document.getElementById("main-content-inner").className;
		var commentsPane = document.getElementById("commentsBtn").className;
		if (mainPane == "main-content-inner" && commentsPane == "aside-trigger btn btn-danger btn-app btn-xs ace-settings-btn"){
	    		document.getElementById("main-content-inner").className = "main-content-inner detail-min";
	    	}
	    	else{
	    		document.getElementById("main-content-inner").className = "main-content-inner";
	    	}
	});
	
	
	
	
});


function submitKYCForm(status){
	var mandatoryFieldsDict = {};
	var count = 0;
   	var validation = 0;
    	var label = '';
    	var html = '';
    	$("#alertContentId").html('');
	for (var i = 0; i < validationFields.length; i++) {
		if (document.getElementById("" + validationFields[i] + "")) {
		    if (document.getElementById("" + validationFields[i] + "").value == "") {
		        $("#" + validationFields[i] + "").css('background-color', '#FEEFB3');
		        $("#" + validationFields[i] + "").css('color', 'black');
		        validation = 1;
		        label = document.getElementById("" + validationFields[i] + "_label" + "").innerHTML;
		        mandatoryFieldsDict[label] = "Input text";
		    }
		    else{
		    	$("#" + validationFields[i] + "").css('background-color', 'white');
		    }
		}
	}	



	var name = document.getElementById("memberName").value;
	var age = document.getElementById("age").value;
	var spouse = document.getElementById("husbandName").value;
	var father = document.getElementById("fatherName").value;
	var address = document.getElementById("address").value;
	var permanentAddress = document.getElementById("permanentAddress").value;
	var pincode = document.getElementById("pincode").value;
	var idProof = document.getElementById("idProofValue").value;
	var idProofType = document.getElementById("idProofTypeId").value;
	var addressProof = document.getElementById("addressProofValue").value;
	var addressProofType = document.getElementById("addressProofTypeId").value;
	var sbAccountNumber = document.getElementById("sbAccountNumber").value;
	var bankId = document.getElementById("bankId").value;
	var villageId = document.getElementById("villages").value;
	var loanAmount = document.getElementById("loanAmount").value;
	var loanPurpose = document.getElementById("loanTypeValue").value;
	var sbBranch = document.getElementById("villages").value;
	var sbAccountName = document.getElementById("sbAccountName").value;
	var mobileNumber = document.getElementById("mobileNo").value;
	var sbBranch = document.getElementById("branch").value;
	var memberId = document.getElementById("memberId").innerHTML;	
	var groupId = document.getElementById("groupId").innerHTML;
	var loanId = document.getElementById("loanId").innerHTML;
	var comment = document.getElementById("comment").value;
	
	
	html += '<table style="margin:auto;width:90%;"><thead><tr><th>Empty Input Field</th><th> Input field type </th></tr></thead><tbody>';
	if (validation == 1) {
		$("#warningId").css("display","block");
		return false;
	}
	else{
		$("#warningId").css("display","none");
	}


	var dataObj = 	{};
	
	var memValData = {
		"memberId": memberId,
		"groupId": groupId,
		"loanId": loanId,
		"subStatus": status,
		"userId": "1996",
		"comment": comment,
		"checkList": "",
		"validationType": "PRE",
		"entityType": "MEMBER"
	};
	
	var dataDict = {
		"entityType"		: "MEMBER",
		"validationType"	: "KYC",
		"memberId"		: memberId,
		"groupId"		: groupId,
		"loanId"		: loanId,
		"userId"		: "1669",
		"name"			: name,
		"age"			: age,
		"spouse"		: spouse,
		"father"		: father,
		"address"		: address,
		"permanentAddress"	: permanentAddress,
		"pincode"		: pincode,
		"idProof"		: idProof,
		"idProofType"		: idProofType,
		"addressProof"		: addressProof,
		"addressProofType"	: addressProofType,
		"sbAccountNumber"	: sbAccountNumber,
		"bankId"		: bankId,
		"villageId"		: villageId,
		"loanAmount"		: loanAmount,
		"loanPurpose"		: loanPurpose,
		"sbBranch"		: sbBranch,
		"sbAccountName"		: sbAccountName,
		"mobileNumber"		: mobileNumber
	};
	dataObj['formData'] = dataDict;
	dataObj['memValData'] = memValData;
	dataObj['taskId'] = taskId;
	dataObj['message'] = comment;
	
	$.ajax({
		url: '/updateKYCDetails/',
		type: 'post',
		dataType: 'json',
		success: function(data) {
			if (data["message"] == "Member Loan updated successfully.") {
			     alert("Member Details Updated successfully");
			     
			     if(status == "Approved"){
			     	document.getElementById(memberId).className = "list-group-item list-group-item-action list-group-item-success Approved";
			     	$("#operationsDivId").css("display","none");
				$("#commentDivId").css("display","none");
			     }
			     if(status == "Rejected"){
			     	document.getElementById(memberId).className = "list-group-item list-group-item-action list-group-item-danger Rejected";
			     	$("#operationsDivId").css("display","none");
				$("#commentDivId").css("display","none");
			     }
			     if(status == "Rework"){
			     	document.getElementById(memberId).className = "list-group-item list-group-item-action list-group-item-warning Rework";
			     	$("#operationsDivId").css("display","none");
				$("#commentDivId").css("display","none");
			     }
			    checkForTaskCompletion();
			} 
			else {
				alert("Failed due to some Issue . Please try after sometime or contact your Administrator");
			}
		},
		data: JSON.stringify(dataObj)
	});
	
}


function checkForTaskCompletion(){
	var membersCount = document.getElementById("san_test").getElementsByTagName("a").length;
	var approvedCount = $('.Approved').length;
	var rejectedCount = $('.Rejected').length;
	var reworkCount = $('.Rework').length;
	var pendingCount =  $('.Pending').length;
	
	
	var totalCount = approvedCount+rejectedCount+reworkCount+pendingCount;
	console.log(membersCount,approvedCount,rejectedCount,reworkCount,totalCount);
	if(totalCount == membersCount && reworkCount > 0 && pendingCount == 0){
		taskUpdate("raiseQuery");
	}
	if(totalCount == membersCount && reworkCount == 0 && pendingCount == 0){
		taskUpdate("approved");
	}
	else{
		return false;
	}
}

function taskUpdate(status){
	var taskUpdateURL = '';
	var comment = '';
	var processupdate = {
				'variables': {
					'kyc': {
						'value': status
					},
				}
			};	
	var dataObj = {};
	dataObj["processUpdate"] = processupdate;
	dataObj["taskId"] = taskId;
	dataObj["processInstanceId"] = processInstanceId;
	if(document.getElementById("comment")){
		comment = document.getElementById("comment").value;
	}
	dataObj["message"] = comment;
	console.log(processupdate);
	console.log(dataObj);
	$.ajax({
	    url: '/updateTask/',
	    dataType: 'json',
	    type: "post",
	    success: function (data) {
	    console.log("data111111111111");
	    	console.log(data);
	    	if(data == "Successful"){
	    		window.location = '/assignedTaskList/';
	    	}
	    	else{
			alert("Failed due to some Issue . Please try after sometime or contact your Administrator");	    	
	    	}
	    },
	    data : JSON.stringify(dataObj)
	});
		
}




