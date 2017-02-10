var validationFields = ["memberName","age","husbandName","fatherName","address","villageName","idProofValue","addressProofValue","sbAccountNumber","bankId","sbAccountName",
    "permanentAddress","pincode","villages","mobileNo","idProofTypeId","addressProofTypeId","loanAmount","loanTypeValue"];

function getGroupData(groupID,loanId){
    var memId;
    var totalCount = 0;
    var penCount = 0;
    var appCount = 0;
    var rejCount = 0;
    var rewCount = 0;
    disableActiveTab();
    $.ajax({
        url: '/getGroupData/'+groupID,
        dataType: 'json',
        beforeSend: function(){
            triggerLoadFunc();
            $("#loading").show();
        },
        complete: function(){
            $("#loading").hide();
        },
        success: function (data) {
            groupData = data;
            console.log(groupData);
            enableActiveTab();
            if(groupData["data"]["groupMemDetail"]){
                if(groupData["data"]["groupMemDetail"][0]){
                    totalCount = groupData["data"]["groupMemDetail"].length;
                    for(var i=0;i<groupData["data"]["groupMemDetail"].length;i++){
                        memId = groupData["data"]["groupMemDetail"][0]["memberId"];
                        var memberId = groupData["data"]["groupMemDetail"][i]["memberId"];
                        var memberStatus = groupData["data"]["groupMemDetail"][i]["memberStatus"];
                        var groupId = groupID;
                        var className  = '';
                        if(memberStatus == "Active"){
                            className = "list-group-item list-group-item-action Pending";
                            penCount+=1;
                        }
                        if(memberStatus == "Approved"){
                            className = "list-group-item list-group-item-action list-group-item-success Approved";
                            appCount +=1;
                        }
                        if(memberStatus == "Rejected"){
                            className = "list-group-item list-group-item-action list-group-item-danger Rejected";
                            rejCount+=1;
                        }
                        if(memberStatus == "Rework"){
                            className = "list-group-item list-group-item-action list-group-item-warning Rework";
                            rewCount+=1;
                        }
                        if(document.getElementById("san_test")){
                            $("#san_test").append('<a id="'+memberId+'" onclick="getMemberDetails('+memberId+','+groupId+','+loanId+');" class="'+className+'" style="font-weight:bold;">'+groupData["data"]["groupMemDetail"][i]["memberName"]+'</a>');
                        }
                        if(document.getElementById("groupName") && groupData["data"]["groupName"]){
                            document.getElementById("groupName").innerHTML = groupData["data"]["groupName"];
                        }
                        if(document.getElementById("appGroupId") && groupData["data"]["appGroupId"]){
                            document.getElementById("appGroupId").innerHTML = groupData["data"]["appGroupId"];
                        }
                        if(document.getElementById("groupId") && groupData["data"]["groupId"]){
                            document.getElementById("groupId").innerHTML = groupData["data"]["groupId"];
                        }
                    }
                    getMemberDetails(memId,groupID,loanId);
                    //creditHistory(groupId,memId);

                }
            }
            else{
                $.alert(groupData["message"]);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $. alert(textStatus,jqXHR,errorThrown);
            enableActiveTab();
        }
    });
    getHistComments(processInstanceId);

}



/*function redirectPage(groupID,loanID,taskName,taskId,processInstanceId){
 if(taskName == "KYC Check"){
 window.location = '/dsgroupview/'+groupID+'/'+loanID+'/'+taskId+'/'+processInstanceId;
 }
 if(taskName == "Query Response" || taskName == "Conduct BAT- Member approval in CRM"){
 window.location = '/groupViewQuery2/'+groupID+'/'+loanID+'/'+taskId+'/'+processInstanceId;
 }
 }*/

function getMemberDetails(memberId,groupId,loanId){
    if(document.getElementById("comment")){
        document.getElementById("comment").value = "";
    }
    disableActiveTab();
    $.ajax({
        url: '/getIndMemberData/'+memberId+'/'+groupId+'/'+loanId,
        //type: 'post',
        dataType: 'json',
        beforeSend: function(){
            triggerLoadFunc();
            $("#loading").show();
        },
        complete: function(){
            $("#loading").hide();
        },
        success: function (data) {
            enableActiveTab();
            var memberData = data;
            console.log(memberData);
            //var arrayKeys = ["occupations","villages""conflictList","highMarksList","memberFamilyDetails","memberDocumentDetails"];
            var imgFiles = ["MEMBERPHOTO","IDPROOF","IDPROOF_2","ADDRESSPROOF","ADDRESSPROOF_2","SBACCOUNTPASSBOOK"];
            if(memberData["data"]["memberDetails"]) {
                if (memberData["data"]["highMarksList"]) {
                    if (memberData["data"]["highMarksList"][0]) {
                        $('#creditData').css("display", "block");
                        $('#creditData').css("display", "table-row");
                        $('#nodata').css("display", "none");
                        var creditData = memberData["data"]["highMarksList"][0];
                        for (var index in creditData) {
                            if (document.getElementById(index)) {
                                document.getElementById(index).innerHTML = creditData[index];
                            }
                            if (document.getElementById("CBStatus")) {
                                document.getElementById("CBStatus").innerHTML = creditData["status"];
                            }
                        }
                    }
                    else {
                        $('#creditData').css("display", "none");
                        $('#nodata').css("display", "block");
                        if (document.getElementById("CBStatus")) {
                            document.getElementById("CBStatus").innerHTML = "";
                        }
                    }
                }
                if (memberData["data"]["memberDocumentDetails"]) {
                    if (memberData["data"]["memberDocumentDetails"][0]) {
                        var memberDocumentsArray = memberData["data"]["memberDocumentDetails"];
                        for (var key in memberDocumentsArray) {
                            if ($.inArray(memberDocumentsArray[key]["documentType"], imgFiles) != -1) {
                                //Need to change with proper URL - Coded just for images display
                                if (document.getElementById(memberDocumentsArray[key]["documentType"] + "_docPath")) {
                                    $("#" + memberDocumentsArray[key]["documentType"] + "_docPath").attr("src", memberDocumentsArray[key]["documentPath"]);
                                    $("#" + memberDocumentsArray[key]["documentType"] + "_docPath").attr("data-url", memberDocumentsArray[key]["documentPath"]);
                                }
                            }
                        }
                    }
                }
                for (var data in memberData["data"]["memberDetails"]) {
                    if (document.getElementById(data)) {
                        if (data == "villages") {
                            $('#villages').empty();
                            var pincodeData = memberData["data"]["memberDetails"];
                            $('#villages').append('<option value="" >   Select Area </option>');
                            for (var i = 0; i < pincodeData[data].length; i++) {
                                $('#villages').append('<option value="' + pincodeData[data][i]["villageId"] + '">' + pincodeData[data][i]["villageName"] + '</option>');
                            }
                        }
                        $("#villages").val(memberData["data"]["memberDetails"]["villageId"]);
                        var tagname = document.getElementById(data).tagName;
                        if (tagname == "INPUT" || tagname == "SELECT" || tagname == "TEXTAREA") {
                            document.getElementById(data).value = memberData["data"]["memberDetails"][data];
                        }
                        if (tagname == "SPAN") {
                            document.getElementById(data).innerHTML = memberData["data"]["memberDetails"][data];
                            if (document.getElementById("villages").tagName == "SPAN")
                                document.getElementById("villages").innerHTML = memberData["data"]["memberDetails"]["villageId"];
                        }
                    }
                }
            }
            else{
                $.alert(memberData["message"]);
            }
            document.getElementById("groupId").innerHTML = groupId;
            document.getElementById("loanId").innerHTML = loanId;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            enableActiveTab();
        }
    });
}
/*
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
 */

function updateMemValidationStatus(status){
    alert(status);
    var memberName = document.getElementById("memberName").innerHTML;
    var appMemberId = document.getElementById("appMemberId").innerHTML;
    var memberId = document.getElementById("memberId").innerHTML;
    var groupId = document.getElementById("groupId").innerHTML;
    var loanId = document.getElementById("loanId").innerHTML;
    var comment = document.getElementById("comment").value;
    var memStatus = document.getElementById("memberValStatus").innerHTML;
    var commentCamunda = "";
    alert(memStatus);

    if(group == "CLM_BM"){
        validationType  = "CLMAPPROVAL";
         if(memStatus != "PEN"){
            $.alert("Member already Validated!!!!");
            return false;
         }
    }
    if(group == "DataSupportTeam"){
        validationType  = "POST";
        if(memStatus != ""){
            $.alert("Member already Validated!!!!");
            return false;
        }
    }

    var memValData = {
        "memberId": memberId,
        "groupId": groupId,
        "loanId": loanId,
        "subStatus": status,
        "userId": "1996",
        "comment": comment,
        "checkList": "",
        "validationType": validationType,
        "entityType": "MEMBER"
    };
    var dataObj = {};
    dataObj["memValData"] = memValData;
    dataObj["taskId"] = taskId;
    var updateStatus = '';
    if(status == "Approved") {
        updateStatus = " approved";
    }
    if(status == "Rejected") {
        updateStatus = " rejected";
    }
    if(status == "Rejected"){
    	if(comment == ""){
    		$.alert("Please mention the reason for rejection");
    		return false;
		}else{
    		commentCamunda = comment+"*@*"+memberName+"*@*"+appMemberId;
    	    dataObj['message'] = commentCamunda;
		}
    }
    $.ajax({
        url: '/updateMemValidationStatus/',
        type: 'post',
        dataType: 'json',
        beforeSend: function(){
            triggerLoadFunc();
            $("#loading").show();
        },
        complete: function(){
            triggerLoadFunc();
            $("#loading").hide();
        },
        success:function(data){
            if(data["message"] == "Member validation completed successfully."){
                $.alert(memberName+" has been "+updateStatus);
                if(status == "Approved"){
                    document.getElementById(memberId).className = "list-group-item list-group-item-action list-group-item-success Approved";
                }
                if(status == "Rejected"){
                    document.getElementById(memberId).className = "list-group-item list-group-item-action list-group-item-danger Rejected";
                }
                if(status == "Rework"){
                    document.getElementById(memberId).className = "list-group-item list-group-item-action list-group-item-warning Rejected";
                }
                checkForTaskCompletion();
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

    var name            =     document.getElementById("memberName").value;
    var age             =     document.getElementById("age").value;
    var maritalStatus   =     document.getElementById("maritalStatus").value;
    var spouse          =     document.getElementById("husbandName").value;
    var father          =     document.getElementById("fatherName").value;
    var address         =     document.getElementById("address").value;
    var permanentAddress=     document.getElementById("permanentAddress").value;
    var pincode         =     document.getElementById("pincode").value;
    var idProof         =     document.getElementById("idProofValue").value;
    var idProofType     =     document.getElementById("idProofTypeId").value;
    var addressProof    =     document.getElementById("addressProofValue").value;
    var addressProofType=    document.getElementById("addressProofTypeId").value;
    var sbAccountNumber =     document.getElementById("sbAccountNumber").value;
    var bankId          =     document.getElementById("bankId").value;
    var villageId       =     document.getElementById("villages").value;
    var loanAmount      =     document.getElementById("loanAmount").value;
    var loanPurpose     =     document.getElementById("loanTypeValue").value;
    var sbAccountName   =     document.getElementById("sbAccountName").value;
    var mobileNumber    =     document.getElementById("mobileNo").value;
    var sbBranch        =     document.getElementById("branch").value;
    var memberId        =     document.getElementById("memberId").innerHTML;
    var groupId         =     document.getElementById("groupId").innerHTML;
    var appGroupId      =     document.getElementById("appGroupId").innerHTML;
    var loanId          =     document.getElementById("loanId").innerHTML;
    var comment         =     document.getElementById("comment").value;
    var memStatus       =     document.getElementById("memberValStatus").innerHTML;
    var appMemberId      =     document.getElementById("appMemberId").innerHTML;
    appMemberId
    var commentCamunda  =     "";

    if (validation == 1) {
        //$("#warningId").css("display","block");
        $.alert("Please proceed after mandatory fields are entered");
        return false;
    }
    if(memStatus != ""){
        $.alert("Member already Validated!!!!");
        return false;
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
        "validationType": "POST",
        "entityType": "MEMBER"
    };

    var dataDict = {
        "entityType"		: "MEMBER",
        "validationType"	: "KYC",
        "memberId"		    : memberId,
        "groupId"		    : groupId,
        "loanId"		    : loanId,
        "userId"		    : "1669",
        "name"			    : name,
        "age"			    : age,
        "maritalStatus"		: maritalStatus,
        "spouse"		    : spouse,
        "father"		    : father,
        "address"		    : address,
        "permanentAddress"	: permanentAddress,
        "pincode"		    : pincode,
        "idProof"		    : idProof,
        "idProofType"		: idProofType,
        "addressProof"		: addressProof,
        "addressProofType"	: addressProofType,
        "sbAccountNumber"	: sbAccountNumber,
        "bankId"		    : bankId,
        "villageId"		    : villageId,
        "loanAmount"		: loanAmount,
        "loanPurpose"		: loanPurpose,
        "sbBranch"		    : sbBranch,
        "sbAccountName"		: sbAccountName,
        "mobileNumber"		: mobileNumber
    };

    dataObj['formData'] = dataDict;
    dataObj['memValData'] = memValData;
    dataObj['taskId'] = taskId;
    var updateStatus = '';
    if(status == "Rework") {
        updateStatus = " sent for Rework";
    }
    if(status == "Approved") {
        updateStatus = " approved";
    }
    if(status == "Rejected") {
        updateStatus = " rejected";
    }
    if(status == "Rework" || status == "Rejected"){
        if(comment == ""){
        	$.alert("Please input Comment!");
        	return false;
		}
		else{
        	commentCamunda = comment+"*@*"+name+"*@*"+appMemberId;
			dataObj['message'] = commentCamunda;
		}
    }


    $.ajax({
        url: '/updateKYCDetails/',
        type: 'post',
        dataType: 'json',
        beforeSend: function(){
            triggerLoadFunc();
            $("#loading").show();
        },
        complete: function(){
            triggerLoadFunc();
            $("#loading").hide();
        },
        success: function(data) {
            if (data["message"] == "Member Loan updated successfully.") {
                $.alert(name+" has been "+updateStatus);
                if(status == "Approved"){
                    document.getElementById(memberId).className = "list-group-item list-group-item-action list-group-item-success Approved";
                }
                if(status == "Rejected"){
                    document.getElementById(memberId).className = "list-group-item list-group-item-action list-group-item-danger Rejected";
                }
                if(status == "Rework"){
                    document.getElementById(memberId).className = "list-group-item list-group-item-action list-group-item-warning Rework";
                }
                checkForTaskCompletion();
            }
            else {
                $.alert("Failed due to some Issue . Please try after sometime or contact your Administrator");
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
    var processStatus;
    var totalCount = approvedCount+rejectedCount+reworkCount+pendingCount;
    if(group == "DataSupportTeam"){
        if(totalCount == membersCount && reworkCount > 0 && pendingCount == 0){
            processStatus = "raiseQuery";
            taskUpdate(processStatus);
        }
        if(totalCount == membersCount && reworkCount == 0 && pendingCount == 0){
            processStatus = "approved";
            taskUpdate(processStatus);
        }
    }
    if(group == "CLM_BM"){
        var dataObj = {};
        dataObj["taskId"] = taskId;
        if(membersCount == (approvedCount+rejectedCount) && pendingCount == 0){
            $.ajax({
                url: '/updateTask/',
                dataType: 'json',
                type: "post",
                beforeSend: function(){
                    triggerLoadFunc();
                    $("#loading").show();
                },
                complete: function(){
                    triggerLoadFunc();
                    $("#loading").hide();
                },
                success:function(data){
                    if(data == "Successful"){
                        window.location = '/assignedTaskList/';
                    }
                },
                data: JSON.stringify(dataObj)
            });
        }
        else{
            return false;
        }
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
        dataObj["message"] = comment;
    }
    $.ajax({
        url: '/updateTask/',
        dataType: 'json',
        type: "post",
        beforeSend: function(){
            triggerLoadFunc();
            $("#loading").show();
        },
        complete: function(){
            $("#loading").hide();
        },
        success: function (data) {
            if(data == "Successful"){
                $.alert("Member and Group Validation Completed!!");
                window.location = '/assignedTaskList/';
            }
            else{
                $.alert("Failed due to some Issue . Please try after sometime or contact your Administrator");
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
            if(creditData.data){
                var found_names = $.grep(creditData.data, function(v) {
                    return v.ssMemberId == memberId;
                });
                if(found_names[0]){
                    $('#creditData').css("display","block");
                    $('#creditData').css("display","table-row");
                    $('#nodata').css("display","none");
                    $.each(found_names[0], function(index, val) {
                        if(document.getElementById(index)){
                            document.getElementById(index).innerHTML = val;
                        }
                    });
                }
                else{
                    $('#creditData').css("display","none");
                    $('#nodata').css("display","block");
                }
            }
        }
    });
}

function disableActiveTab(){
    if(document.getElementsByClassName("active")){
        if(document.getElementsByClassName("active")[0]){
            document.getElementsByClassName("active")[0].className = "inactive";
        }
    }
}

function enableActiveTab(){
    if(document.getElementsByClassName("inactive")){
        if(document.getElementsByClassName("inactive")[0]){
            document.getElementsByClassName("inactive")[0].className = "active";
        }
    }
}

function loadGroupRoles(groupId,loanId,taskName){
    var dataObj = {};
    var roleObj = {
        "groupId": groupId,
        "loanId": loanId,
        "entityType": "MEMBER",
        "validationType": "POST"
    };
    dataObj["roleObj"] = roleObj;
    $.ajax({
        url: '/groupRoleDetails/',
        dataType: 'json',
        type : "post",
        beforeSend: function(){
            $("#loading").show();
        },
        complete: function(){
            $("#loading").hide();
        },
        success: function (data) {
            var groupDetails = data["data"]["groupDetails"];
            for(var key in groupDetails){
                if(document.getElementById(key)){
                    document.getElementById(key).innerHTML = groupDetails[key];
                    if(document.getElementById(key+"1")){
                        document.getElementById(key+"1").innerHTML = groupDetails[key];
                    }
                }
            }
        },
        data: JSON.stringify(dataObj)
    });
}

function updateGroupValStatus(status){
    if(document.getElementById("comment")){
        comment = document.getElementById("comment").value;
    }
    var groupValData = {
        "groupId": groupId,
        "subStatus": status,
        "userId": "1996",
        "comment": comment,
        "validationType": "PRE",
        "entityType": "GROUP"
    };
    var dataObj = {};
    dataObj["groupValData"] = groupValData;
    dataObj["taskId"] = taskId;
    dataObj["message"] = comment;

    $.ajax({
        url: '/updateGrpValidationStatus/',
        dataType: 'json',
        type:"post",
        beforeSend: function(){
            triggerLoadFunc();
            $("#loading").show();
        },
        complete: function(){
            triggerLoadFunc();
            $("#loading").hide();
        },
        success:function(data){
            if(data == "Successful"){
                $.alert("Group Validation completed Successfully");
                window.location = '/assignedTaskList/';
            }
        },
        data : JSON.stringify(dataObj)
    });

}


function updateTask(status){
    var dataObj = {};
    dataObj["taskId"] = taskId;
    dataObj["processUpdate"] = {};
    $.ajax({
        url: '/updateTask/',
        dataType: 'json',
        type: "post",
        beforeSend: function(){
            triggerLoadFunc();
            $("#loading").show();
        },
        complete: function(){
            $("#loading").hide();
        },
        success: function (data) {
            if(data == "Successful"){
                $.alert("Group Updation completed!!");
                window.location = '/assignedTaskList/';
            }
            else{
                $.alert("Failed due to some Issue . Please try after sometime or contact your Administrator");
            }
        },
        data : JSON.stringify(dataObj)
    });
}



function getHistComments(processId){
    var htmlContent = '';
    $.ajax({
        url: '/getHistoryComments/'+processId,
        dataType: 'json',
        success: function (data) {
            var commentsJson = data;
            var commentsList = Object.keys(commentsJson).map(function(key) {
                return [key, commentsJson[key]];
            });
            var sortedData= commentsList.sort((function (a, b) { return new Date(a[1].startTime) - new Date(b[1].startTime) }));
            for(var key in sortedData){
                if(sortedData[key][1]["activityType"] == "userTask"){
                    if(sortedData[key][1]["comments"]){
                        if(sortedData[key][1]["comments"][0]){
                            var sortedcomments= sortedData[key][1]["comments"].sort((function (a, b) {  return new Date(a.time) - new Date(b.time) }));
                            for(var key1 in sortedcomments){
                                var cmtDateSplit = sortedcomments[key1]["time"].split("T");
                                var cmtDate  = cmtDateSplit[0].split("-");
                                cmtDate = cmtDate[2]+"-"+cmtDate[1]+"-"+cmtDate[0]+" at " +cmtDateSplit[1];
                                if(sortedcomments[key1]["message"].includes("*@*")){
                                    var commentSplit = sortedcomments[key1]["message"].split("*@*");
                                    if(commentSplit[1] != "" &&  commentSplit[2] != "") {
                                        var comment = commentSplit[0];
                                        var memberName = commentSplit[1] + "&nbsp(&nbsp" + commentSplit[2] + "&nbsp)";
                                        htmlContent += '<div class="profile-activity clearfix"><div><span style="font-weight:bold;color:#981b1b;"><i class="glyphicon glyphicon-user"></i> ' + sortedData[key][1]["assignee"] + ':</span>  '
                                            + '&nbsp&nbsp<span style="color:black;">' + sortedData[key][1]["activityName"] + '</span>'
                                            + '<div style="font-weight:bold;color:darkslategrey;">Member : ' + memberName + '<br></div>'
                                            + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span style="font-style:italic;">'
                                            + '<i class="fa fa-comments" style="color:darkslategrey;" aria-hidden="true"></i>&nbsp'+comment + '</span><div class="time"><i class="ace-icon fa fa-clock-o bigger-110"></i><span > Commented on &nbsp&nbsp'
                                            + cmtDate + '</span></div></div></div>';
                                    }
                                }
                                else{
                                	htmlContent += '<div class="profile-activity clearfix"><div><span style="font-weight:bold;color:#981b1b;"><i class="glyphicon glyphicon-user"></i> ' + sortedData[key][1]["assignee"] + ':</span>  '
                                        + '&nbsp&nbsp<span style="color:black;">' + sortedData[key][1]["activityName"] + '</span></div>'
                                        + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span style="font-style:italic;">'
                                        + '<i class="fa fa-comments" style="color:darkslategrey;" aria-hidden="true"></i>&nbsp'+sortedcomments[key1]["message"] + '</span><div class="time"><i class="ace-icon fa fa-clock-o bigger-110"></i><span > Commented on &nbsp&nbsp'
                                        + cmtDate + '</span></div></div></div>';
								}
                            }
                        }
                    }
                }
            }
            if(!htmlContent){
                htmlContent = "No Comments"
            }
            document.getElementById("profile-feed-1").innerHTML = htmlContent;
        }
    });
}

