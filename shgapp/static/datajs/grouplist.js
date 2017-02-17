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
        url: '/getGroupData/'+groupID+'/'+taskName,
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
                }
            }
            else{
                $.alert(groupData["message"]);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
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
        url: '/getIndMemberData/'+memberId+'/'+groupId+'/'+loanId+'/'+taskName,
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
            //var arrayKeys = ["occupations","villages""conflictList","highMarksList","memberFamilyDetails","memberDocumentDetails"];
            var imgFiles = ["MEMBERPHOTO","IDPROOF","IDPROOF_2","ADDRESSPROOF","ADDRESSPROOF_2","SBACCOUNTPASSBOOK","OVERLAPREPORT"];
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
                                    if(memberDocumentsArray[key]["documentType"] == "OVERLAPREPORT"){
                                       $("#" + memberDocumentsArray[key]["documentType"] + "_docPath").attr('onClick', 'window.open(' + "'" + memberDocumentsArray[key]["documentPath"] + "'" + ').focus();');
                                    }
                                    if((memberDocumentsArray[key]["documentPath"]).indexOf("Not Uploaded")){
                                        if(memberDocumentsArray[key]["documentType"] + "_docPath" == "MEMBERPHOTO_docPath"){
                                            $("#" + memberDocumentsArray[key]["documentType"] + "_docPath").attr("src", "/static/images/naveen.jpg");
                                        }
                                        else{
                                            $("#" + memberDocumentsArray[key]["documentType"] + "_docPath").attr("src", "/static/images/image.jpg");
                                        }
                                    }
                                    else{
                                         $("#" + memberDocumentsArray[key]["documentType"] + "_docPath").attr("src", memberDocumentsArray[key]["documentPath"]);
                                        //$("#" + memberDocumentsArray[key]["documentType"] + "_docPath").attr("alt", "NO Image");
                                        $("#" + memberDocumentsArray[key]["documentType"] + "_docPath").attr("data-url", memberDocumentsArray[key]["documentPath"]);
                                    }
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
    var memberName = document.getElementById("memberName").innerHTML;
    var appMemberId = document.getElementById("appMemberId").innerHTML;
    var memberId = document.getElementById("memberId").innerHTML;
    var groupId = document.getElementById("groupId").innerHTML;
    var loanId = document.getElementById("loanId").innerHTML;
    var comment = document.getElementById("comment").value;
    var memStatus = document.getElementById("memberValStatus").innerHTML;
    var commentCamunda = "";
    var dataObj = {};
    if(memStatus != "" && memStatus != "PEN"){
        $.alert("Member already Validated!!!!");
        return false;
    }
    if(group == "CreditTeam"){
        validationType = "POST";
       /* if(taskName == "Proposal scrutiny"){
             validationType = "POST";
        }
        if(taskName == "Proposal scrutiny (BM Reply)"){
             validationType = "";
        }*/
    }
    if(group == "CLM_BM" || group == "CLM"){
        if(taskName == "Resolve Data Support Team Query") {
            validationType = "POSTKYC";
            if(comment == ""){
                $.alert("Please input comment");
                return false;
            }
            else{
                    commentCamunda = comment+"*@*"+memberName+"*@*"+appMemberId;
                    dataObj['message'] = commentCamunda;
            }
        }
        if(taskName == "Conduct BAT- Member approval in CRM") {
            validationType = "CLMAPPROVAL";
        }
        if(taskName == "Resolve Credit Team Query"){
            validationType = "CLMAPPROVAL";
            if(comment == ""){
                $.alert("Please input comment");
                return false;
            }
            else{
                    commentCamunda = comment+"*@*"+memberName+"*@*"+appMemberId;
                    dataObj['message'] = commentCamunda;
            }

        }
    }
    if(group == "DataSupportTeam"){
        validationType  = "POST";
    }
    if(status == "Rejected" || status == "Rework"){
        if(comment == ""){
            $.alert("Please input comment");
            return false;
        }
        else{
                commentCamunda = comment+"*@*"+memberName+"*@*"+appMemberId;
                dataObj['message'] = commentCamunda;
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

    dataObj["memValData"] = memValData;
    dataObj["taskId"] = taskId;

    var updateStatus = '';
    if(status == "Approved") {
        updateStatus = " approved";
    }
    if(status == "Rejected") {
        updateStatus = " rejected";
    }
    if(status == "Rework") {
        updateStatus = " sent for rework";
    }

    $.ajax({
        url: '/updateMemValidationStatus/',
        type: 'post',
        dataType: 'json',
        beforeSend: function(){
            triggerLoadFunc();
            disableActiveTab();
            $("#loading").show();
        },
        complete: function(){
            triggerLoadFunc();
            $("#loading").hide();
            enableActiveTab();
        },
        success:function(data){
            if(data["code"] == "2029"){
                $.alert(memberName+" has been "+updateStatus);
                if(status == "Approved"){
                    document.getElementById(memberId).className = "list-group-item list-group-item-action list-group-item-success Approved";
                    document.getElementById("memberValStatus").innerHTML = "APP";
                }
                if(status == "Rejected"){
                    document.getElementById(memberId).className = "list-group-item list-group-item-action list-group-item-danger Rejected";
                    document.getElementById("memberValStatus").innerHTML = "REJ";
                }
                if(status == "Rework"){
                    document.getElementById(memberId).className = "list-group-item list-group-item-action list-group-item-warning Rework";
                    document.getElementById("memberValStatus").innerHTML = "RWRK";
                }
                getHistComments(processInstanceId);
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
    var appMemberId     =     document.getElementById("appMemberId").innerHTML;
    appMemberId
    var commentCamunda  =     "";
    if (validation == 1) {
        //$("#warningId").css("display","block");
        $.alert("Please proceed after mandatory fields are entered");
        return false;
    }
    if(memStatus != "" && memStatus != "PEN"){
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
            disableActiveTab();
            $("#loading").show();
        },
        complete: function(){
            triggerLoadFunc();
            $("#loading").hide();
            enableActiveTab();
        },
        success: function(data) {
            if (data["code"] == "2024") {
                $.alert(name+" has been "+updateStatus);

                if(status == "Approved"){
                    document.getElementById(memberId).className = "list-group-item list-group-item-action list-group-item-success Approved";
                    document.getElementById("memberValStatus").innerHTML = "APP";
                }
                if(status == "Rejected"){
                    document.getElementById(memberId).className = "list-group-item list-group-item-action list-group-item-danger Rejected";
                    document.getElementById("memberValStatus").innerHTML = "REJ";
                }
                if(status == "Rework"){
                    document.getElementById(memberId).className = "list-group-item list-group-item-action list-group-item-warning Rework";
                    document.getElementById("memberValStatus").innerHTML = "RWRK";
                }
                getHistComments(processInstanceId);
                checkForTaskCompletion();
            }
            else {
                $.alert("Connection Time out");
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
    if(group == "DataSupportTeam" || group == "CreditTeam"){
        if(totalCount == membersCount && reworkCount > 0 && pendingCount == 0){
            processStatus = "raiseQuery";
            taskUpdate(processStatus);
        }
        if(totalCount == membersCount && reworkCount == 0 && pendingCount == 0){
            processStatus = "approved";
            taskUpdate(processStatus);
        }
    }

    if(group == "CLM_BM" || group == "CLM"){
        var dataObj = {};
        if(taskName == "Resolve Data Support Team Query"){
            validationType  = "POSTKYC";
            var processUpdate = {
                                'variables': {
                                    'kyc': {
                                        'value': "resolved"
                                    },
                                }
                            };
            dataObj["processUpdate"] = processUpdate;
        }
        if(taskName == "Resolve Credit Team Query"){
            var processUpdate = {
                                'variables': {
                                    'chekcbrespdate': {
                                        'value': "resolved"
                                    },
                                }
                            };
            dataObj["processUpdate"] = processUpdate;
        }
        dataObj["taskId"] = taskId;
        if(membersCount == (approvedCount+rejectedCount) && pendingCount == 0){
            $.ajax({
                url: '/updateTask/',
                dataType: 'json',
                type: "post",
                beforeSend: function(){
                    triggerLoadFunc();
                    disableActiveTab();
                    $("#loading").show();
                },
                complete: function(){
                    triggerLoadFunc();
                    enableActiveTab();
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
    if(group == "DataSupportTeam"){
            var processupdate = {
                                    'variables': {
                                        'kyc': {
                                            'value': status
                                        },
                                    }
                                };
    }
    if(group == "CreditTeam"){
        var processupdate = {
                                'variables': {
                                    'chekcbrespdate': {
                                        'value': status
                                    },
                                }
                            };
    }

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
            disableActiveTab();
            $("#loading").show();
        },
        complete: function(){
            $("#loading").hide();
            enableActiveTab();
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

function creditHistory(loanId) {
    var htmlContent= '';
    $.ajax({
        url: '/creditHistoryGroup/' + loanId,
        dataType: 'json',
        success: function(data) {
            var creditData = data;
            var documentObj = [];
            var docPath =''
            if(creditData.data){
                for(var i=0;i<creditData.data.length;i++) {
                    var creditObj  = creditData["data"][i]["creditInquiry"];
                    documentObj = creditData["data"][i]["memberDocument"];
                    var documentPath = '';
                    for(var j=0;j<documentObj.length;j++){
                        console.log(documentObj)
                        if(documentObj[j]["documentType"] == "OVERLAPREPORT") {
                            console.log(documentObj[j]["documentPath"])
                            docPath = documentObj[j]["documentPath"];
                        }
                    }
                    htmlContent += '<tr><td> <button type="button" class="btn btn-info btn-md btn-danger" onclick="window.open('+"'"+docPath+"'"+');"+>View</button></td>'
                        +'<td>' + creditObj["appMemberId"] + '</td><td>'
                        + creditObj["memberName"] + '</td>'
                        +'<td>' + creditObj["s_product_type"] + '</td>'
                        +'<td>' + creditObj["status"] + '</td>'
                        +'<td>' + creditObj["remarks"] + '</td>'
                        +'<td>' + creditObj["hm_response_date"] + '</td>'
                        +'<td>' + creditObj["existing_loan_limit"] + '</td>'
                        +'<td>' + creditObj["loan_amount_eligible"] + '</td>'
                        +'<td>' + creditObj["no_of_mfi_eligible"] + '</td>'
                        +'<td>' + creditObj["name_of_mfi_1"] + '</td>'
                        +'<td>' + creditObj["overdue_amount_1"] + '</td>'
                        +'<td>' + creditObj["loan_amount_1"] + '</td>'
                        +'<td>' + creditObj["balance_1"] + '</td>'
                        +'<td>' + creditObj["name_of_mfi_2"] + '</td>'
                        +'<td>' + creditObj["overdue_amount_2"] + '</td>'
                        +'<td>' + creditObj["loan_amount_2"] + '</td>'
                        +'<td>' + creditObj["balance_2"] + '</td>'
                        +'<td>' + creditObj["name_of_mfi_3"] + '</td>'
                        +'<td>' + creditObj["overdue_amount_3"] + '</td>'
                        +'<td>' + creditObj["loan_amount_3"] + '</td>'
                        +'<td>' + creditObj["balance_3"] + '</td>'
                        +'<td>' + creditObj["name_of_mfi_4"] + '</td>'
                        +'<td>' + creditObj["overdue_amount_4"] + '</td>'
                        +'<td>' + creditObj["loan_amount_4"] + '</td>'
                        +'<td>' + creditObj["balance_4"] + '</td>'
                        +'</tr>';
                }
            }
            document.getElementById("creditData").innerHTML = htmlContent;

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
function rmGroupMaster(groupId){
       $.ajax({
        url: '/getGroupData/'+groupId+'/'+taskName,
        dataType: 'json',
        beforeSend: function(){
            disableActiveTab();
            $("#loading").show();
        },
        complete: function(){
            $("#loading").hide();
            enableActiveTab();
        },
        success: function (data) {
        var groupViewData2 = data;
        var found_names = $.grep(groupViewData2.data.groupMemDetail, function(v) {
        return v.memberStatus !="Rejected";
        });
        $.each(found_names, function(key, value){
            $('#Animator').append('<option value="'+value.memberId+'">'+value.memberName+'</option>');
            $('#repm1').append('<option value="'+value.memberId+'">'+value.memberName+'</option>');
            $('#repm2').append('<option value="'+value.memberId+'">'+value.memberName+'</option>');
        });
        var animatorvalue=$("#animatorId").text();
        var rep1value=$("#rep1Id").text();
        var rep2value=$("#rep2Id").text();
        //alert(rep2value);
        $("#Animator").val(animatorvalue);
        $("#repm1").val(rep1value);
        $("#repm2").val(rep2value);
  }
    });
}
function loadGroupRoles(groupId,loanId,taskName){
    var dataObj = {};
    var validationType = '';
    if(group == "CLM_BM" || group == "CLM"){
        validationType = "PEN"
    }
    if(group == "RM" || group == "rm"){
         validationType = "CLM"
    }
     var roleObj = {
                        "groupId": groupId,
                        "entityType": "GROUP",
                        "validationType":  validationType
                    };
    dataObj["roleObj"] = roleObj;
    $.ajax({
        url: '/groupRoleDetails/',
        dataType: 'json',
        type : "post",

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
    var validationType = '';
    if(document.getElementById("comment")){
        comment = document.getElementById("comment").value;
    }
    if(status == "Rejected"){
        if(comment == ""){
             $.alert("Please input comment");
            return false;
        }
    }

    if(group == "CLM_BM" || group == "CLM"){
        validationType = "PRE";
    }
    if(group == "RM" || group == "rm"){
        validationType = "POST";
    }
    var groupValData = {
        "groupId": groupId,
        "subStatus": status,
        "userId": "1996",
        "comment": comment,
        "validationType": validationType,
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
            disableActiveTab();
            $("#loading").show();
        },
        complete: function(){
            triggerLoadFunc();
            $("#loading").hide();
            enableActiveTab();
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
            disableActiveTab();
            $("#loading").show();
        },
        complete: function(){
            $("#loading").hide();
            enableActiveTab();
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
    console.log(processId);
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


function documentView(groupId) {
    $.ajax({
        url: '/DocumentView/' + groupId,
        dataType: 'json',
        success: function(data) {
            groupDocData = data;
            var current = 0;
            if (groupDocData.data) {
                $.each(groupDocData.data, function(key, value) {
                    var tr = $('<tr></tr>');
                    current++;
                    $('<td>' + current + '</td><td>' + value.documentName + '</td><td> <button type="button" class="btn btn-danger" id = "' + value.docId + '" onclick="window.open(' + "'" + value.documentPath + "'" + ').focus();"><span class="glyphicon glyphicon-cloud-upload"></span> View  </button></td> ').appendTo(tr);
                    tr.appendTo('#docments_table');
                });
            } else {
                $('#docments_table').css("display", "none");
                $('#nodata2').css("display", "block");
            }
        }
    });
}


function updateGroupMemberStatus() {
    //alert("updateGroupMemeberStatus");
    var nAnimator = document.getElementById("Animator").value;
    var nrepm1 = document.getElementById("repm1").value;
    var nrepm2 = document.getElementById("repm2").value;
    var groupValData = {
        "entityType": "GROUP",
        "validationType": "CLMAPPROVAL",
        "groupId": groupId,
        "userId": "1669",
        "animator": nAnimator,
        "rep1": nrepm1,
        "rep2": nrepm2
    };
    //console.log(groupValData);
    var dataObj = {};
    dataObj["groupValData"] = groupValData;

    $.ajax({
        url: '/updateGroupMemberStatus/',
        dataType: 'json',
        type: "post",
        beforeSend: function() {
            triggerLoadFunc();
            disableActiveTab();
            $("#loading").show();
        },
        complete: function() {
            triggerLoadFunc();
            $("#loading").hide();
            enableActiveTab();
        },
        success: function(data) {
            console.log(data);
            if (data.code == '2024') {
                $.alert("Member roles have been updated successfully");
            }
        },
        data: JSON.stringify(dataObj)
    });
}