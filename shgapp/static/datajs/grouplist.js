
function getGroupData(groupID,loanId){
	console.log(groupID,loanId);
	$.ajax({
	    url: '/getGroupData/'+groupID,
	    dataType: 'json',
	    success: function (data) {
		groupData = data;
		console.log(groupData);
		for(var i=0;i<groupData["data"].length;i++){
			var memberId = groupData["data"][i]["memberId"];
			var groupId = groupID;
			if(document.getElementById("san_test")){
			     	$("#san_test").append('<a onclick="getMemberDetails('+memberId+','+groupId+','+loanId+')" class="list-group-item">'+groupData["data"][i]["memberName"]+'</a>');
			}
		}
	    }
	});
}

function redirectPage(groupID,loanID){
	window.location = '/dsgroupview/'+groupID+'/'+loanID;
}

function getMemberDetails(memberId,groupId,loanId){
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
						$('#villages').append('<option value="'+pincodeData[data][i]+'">'+pincodeData[data][i]+'</option>');
					}
				}
				$("#villages").val(memberData["data"]["memberDetails"]["villageName"]);
				var tagname = document.getElementById(data).tagName;
				if(tagname == "INPUT" || tagname == "SELECT" || tagname == "TEXTAREA"){
					document.getElementById(data).value = memberData["data"]["memberDetails"][data];
				}
				if(tagname == "SPAN"){
					document.getElementById(data).innerHTML = memberData["data"]["memberDetails"][data];
				}
			}
		}
		
	    }
	});
}


function listHistory(){

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





