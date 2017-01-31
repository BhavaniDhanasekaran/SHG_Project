var validationFields = ["memberName","age","husbandName","fatherName","address","villageName","idProofValue","addressProofValue","sbAccountNumber","bankId","sbAccountName",
			"branch","permanentAddress","pincode","villages","mobileNo","idProofTypeId","addressProofTypeId","loanAmount","loanTypeValue","comment"];

function getGroupData(groupID,loanId){
	var memId;
	$.ajax({
	    url: '/getGroupData/'+groupID,
	    dataType: 'json',
	    success: function (data) {
		groupData = data;
		console.log(groupData);
		if(groupData["data"]["groupMemDetail"]){
		   	if(groupData["data"]["groupMemDetail"][0]){
				for(var i=0;i<groupData["data"]["groupMemDetail"].length;i++){
					memId = groupData["data"]["groupMemDetail"][0]["memberId"];
					var memberId = groupData["data"]["groupMemDetail"][i]["memberId"];
					var memberStatus = groupData["data"]["groupMemDetail"][i]["memberStatus"];
					var groupId = groupID;
					var className  = '';
					console.log(memberStatus);
					if(memberStatus == "Active"){
					     className = "list-group-item list-group-item-action Pending";
					}
					if(memberStatus == "Approved"){
					     className = "list-group-item list-group-item-action list-group-item-success Approved";
					     $("#operationsDivId").css("display","none");
					     $("#commentDivId").css("display","none");
					}
					if(memberStatus == "Rejected"){
					     className = "list-group-item list-group-item-action list-group-item-danger Rejected";
					     $("#operationsDivId").css("display","none");
					     $("#commentDivId").css("display","none");
					}
					if(memberStatus == "Rework"){
					    className = "list-group-item list-group-item-action list-group-item-warning Rework";
					    $("#operationsDivId").css("display","none");
					    $("#commentDivId").css("display","none");
					}
					if(document.getElementById("san_test")){
					     	$("#san_test").append('<a id="'+memberId+'" onclick="getMemberDetails('+memberId+','+groupId+','+loanId+');" class="'+className+'" style="font-weight:bold;">'+groupData["data"]["groupMemDetail"][i]["memberName"]+'</a>');
					}
					if(document.getElementById("groupName") && groupData["data"]["groupName"]){
						document.getElementById("groupName").innerHTML = groupData["data"]["groupName"];
					}
					if(document.getElementById("groupId") && groupData["data"]["appGroupId"]){
						document.getElementById("groupName").innerHTML = groupData["data"]["appGroupId"];
					}
				}
				getMemberDetails(memId,groupID,loanId);
				//creditHistory(groupId,memId)
				//creditHistory('+groupId+','+memberId+');
		    	}
		}
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
	/*if(document.getElementById(memberId).classList.item(3)){
		$("#operationsDivId").css("display","none");
		$("#commentDivId").css("display","none");
		$("#comment").val("");
	}
	else{
		$("#operationsDivId").css("display","block");
		$("#commentDivId").css("display","block");
		$("#comment").val("");
	}*/
	/*if($("#"+memberId).hasClass("list-group-item-action")){
		$("#operationsDivId").css("display","none");
		$("#commentDivId").css("display","none");
		$("#comment").val("");
		
	}
	else{
		$("#operationsDivId").css("display","block");
		$("#commentDivId").css("display","block");
		$("#comment").val("");
	}*/
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
					if(document.getElementById("villages").tagName == "SPAN")
						document.getElementById("villages").innerHTML = memberData["data"]["memberDetails"]["villageId"];
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

function submitKYCQueryForm(status){
	var name = document.getElementById("memberName").innerHTML;
	var age = document.getElementById("age").innerHTML;
	var spouse = document.getElementById("husbandName").innerHTML;
	var father = document.getElementById("fatherName").innerHTML;
	var address = document.getElementById("address").innerHTML;
	var permanentAddress = document.getElementById("permanentAddress").innerHTML;
	var pincode = document.getElementById("pincode").innerHTML;
	var idProof = document.getElementById("idProofValue").innerHTML;
	var idProofType = document.getElementById("idProofTypeId").innerHTML;
	var addressProof = document.getElementById("addressProofValue").innerHTML;
	var addressProofType = document.getElementById("addressProofTypeId").innerHTML;
	var sbAccountNumber = document.getElementById("sbAccountNumber").innerHTML;
	var bankId = document.getElementById("bankId").innerHTML;
	var villageId = document.getElementById("villages").innerHTML;
	var loanAmount = document.getElementById("loanAmount").innerHTML;
	var loanPurpose = document.getElementById("loanTypeValue").innerHTML;
	var sbAccountName = document.getElementById("sbAccountName").innerHTML;
	var mobileNumber = document.getElementById("mobileNo").innerHTML;
	var sbBranch = document.getElementById("branch").innerHTML;
	var memberId = document.getElementById("memberId").innerHTML;	
	var groupId = document.getElementById("groupId").innerHTML;
	var loanId = document.getElementById("loanId").innerHTML;
	var comment = document.getElementById("comment").innerHTML;
	
	
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
	
	console.log(dataDict);
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





function submitKYCForm(status){
	var mandatoryFieldsDict = {};
	var count = 0;
   	var validation = 0;
    	var label = '';
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
	var sbAccountName = document.getElementById("sbAccountName").value;
	var mobileNumber = document.getElementById("mobileNo").value;
	var sbBranch = document.getElementById("branch").value;
	var memberId = document.getElementById("memberId").innerHTML;	
	var groupId = document.getElementById("groupId").innerHTML;
	var loanId = document.getElementById("loanId").innerHTML;
	var comment = document.getElementById("comment").value;
	
	
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
	
	console.log(dataDict);
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

function creditHistory(groupId,memberId) {
    $.ajax({
        url: '/creditHistory/' + groupId,
        dataType: 'json',
        success: function(data) {
            var creditData = data;
	    console.log(data);
            if(creditData.data){
		    var found_names = $.grep(creditData.data, function(v) {
		        return v.memberId == memberId;
		    });
		    var tr = $('<tr></tr>');
		    $.each(found_names[0], function(index, val) {
		        if ((index != "memberId") && (index != "memberName") && (index != "spouseName") && (index != "refId") && (index != "responseDate") &&
		            (index != "appId") && (index != "overallLoanLimit") && (index != "noOfMFI") && (index != "existingMFI") && (index != "groupName") && (index != "appMemberId")) {
		            $('<td>' + val + '</td>').appendTo(tr);
		        }
		    });
		    tr.appendTo('#credit');
            }
        }
    });
}





