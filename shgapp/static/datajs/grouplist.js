var validationFields = ["memberName","sequenceNumber", "age", "husbandName", "maritalStatus", "fatherName", "address", "villageName", "idProofValue", "addressProofValue", "sbAccountNumber", "bankId", "sbAccountName",
    "permanentAddress", "pincode", "villages", "mobileNo", "idProofTypeId", "addressProofTypeId", "loanAmount", "loanTypeValue"
];

function getGroupData(groupID, loanId) {
    var memId;
    var totalCount = 0;
    var penCount = 0;
    var appCount = 0;
    var rejCount = 0;
    var rewCount = 0;
    $.ajax({
        url: '/getGroupData/' + groupID + '/' + taskName,
        dataType: 'json',
        beforeSend: function() {
            triggerLoadFunc();
            $("#loading").show();
        },
        complete: function() {
            $("#loading").hide();
        },
        success: function(data) {
            groupData = data;
            console.log(groupData);
            if (groupData["data"]["groupMemDetail"]) {
                if (groupData["data"]["groupMemDetail"][0]) {
                    totalCount = groupData["data"]["groupMemDetail"].length;
                    for (var i = 0; i < groupData["data"]["groupMemDetail"].length; i++) {
                        memId = groupData["data"]["groupMemDetail"][0]["memberId"];
                        var memberId = groupData["data"]["groupMemDetail"][i]["memberId"];
                        var memberStatus = groupData["data"]["groupMemDetail"][i]["memberStatus"];
                        var groupId = groupID;
                        var className = '';
                        if (memberStatus == "Active") {
                            className = "list-group-item list-group-item-action Pending";
                            penCount += 1;
                        }
                        if (memberStatus == "Approved") {
                            className = "list-group-item list-group-item-action list-group-item-success Approved";
                            appCount += 1;
                        }
                        if (memberStatus == "Rejected") {
                            className = "list-group-item list-group-item-action list-group-item-danger Rejected";
                            rejCount += 1;
                        }
                        if (memberStatus == "Rework") {
                            className = "list-group-item list-group-item-action list-group-item-warning Rework";
                            rewCount += 1;
                        }
                        if (document.getElementById("san_test")) {
                            $("#san_test").append('<a id="' + memberId + '" onclick="getMemberDetails(' + memberId + ',' + groupId + ',' + loanId + ');tabControl();" class="' + className + '" style="font-weight:bold;"> (' + groupData["data"]["groupMemDetail"][i]["sequenceNumber"] + ")  " + groupData["data"]["groupMemDetail"][i]["memberName"] + '</a>');
                        }
                        if (document.getElementById("groupName") && groupData["data"]["groupName"]) {
                            document.getElementById("groupName").innerHTML = groupData["data"]["groupName"];
                        }
                        if (document.getElementById("appGroupId") && groupData["data"]["appGroupId"]) {
                            document.getElementById("appGroupId").innerHTML = groupData["data"]["appGroupId"];
                        }
                        if (document.getElementById("loanTypeId1") && groupData["data"]["loanTypeId"]) {
                            document.getElementById("loanTypeId1").innerHTML = groupData["data"]["loanTypeId"];
                        }
                        if (document.getElementById("groupId") && groupData["data"]["groupId"]) {
                            document.getElementById("groupId").innerHTML = groupData["data"]["groupId"];
                        }
                    }
                    var membersCount = document.getElementById("san_test").getElementsByTagName("a").length;
                    var approvedCount = $('.Approved').length;
                    var rejectedCount = $('.Rejected').length;
                    updateMembersCount();
                    var totalCount = approvedCount + rejectedCount;
                    if (membersCount == totalCount) {
                        $("#operationsDivIdQuery").css("display", "none");
                        $("#groupApproveBtnIdQuery").css("display", "block");
                    }
                    getMemberDetails(memId, groupID, loanId);
                }
            } else {
                $.alert(groupData["message"]);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {}
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

function getMemberDetails(memberId, groupId, loanId) {
    if (document.getElementById("comment")) {
        document.getElementById("comment").value = "";
    }
    $.ajax({
        url: '/getIndMemberData/' + memberId + '/' + groupId + '/' + loanId + '/' + taskName,
        //type: 'post',
        dataType: 'json',
        beforeSend: function() {
            triggerLoadFunc();
            $("#loading").show();
        },
        complete: function() {
            $("#loading").hide();
        },
        success: function(data) {
            var memberData = data;
            var conflictListArr = [];
            //var arrayKeys = ["occupations","villages""conflictList","highMarksList","memberFamilyDetails","memberDocumentDetails"];
            var imgFiles = ["MEMBERPHOTO", "IDPROOF", "IDPROOF_2", "ADDRESSPROOF", "ADDRESSPROOF_2", "SBACCOUNTPASSBOOK", "OVERLAPREPORT"];
            if (memberData["data"]["memberDetails"]) {
                if (memberData["data"]["conflictList"]) {
                    var conflictData = memberData["data"]["conflictList"];
                    if ($.fn.DataTable.isDataTable('#memberHistConflict')) {
                        $("#memberHistConflict").dataTable().fnDestroy();
                    }
                    $('#memberHistConflict').dataTable({
                        data: conflictData,
                        "bDestroy": true,
                        "bJQueryUI": false,
                        "bProcessing": true,
                        "bSort": true,
                        "bInfo": true,
                        "bPaginate": false,
                        "iDisplayLength": 10,
                        "bSortClasses": false,
                        "bAutoWidth": false,
                        "searching": false,
                        "sDom": '<"top">rt<"bottom"flp><"clear">',
                        "bDeferRender": true,
                        "aoColumns": [
                            //{ "mData": "slNo", "sTitle": "S.No", "sWidth": "3%", className:"column"},
                            {
                                "mData": "memberName",
                                "sTitle": "Member Name",
                                "sWidth": "25%",
                                className: "column"
                            },
                            {
                                "mData": "groupName",
                                "sTitle": "Group Name",
                                "sWidth": "30%",
                                className: "column"
                            },
                            {
                                "mData": "appGroupId",
                                "sTitle": "App Group ID",
                                "sWidth": "15%",
                                className: "column"
                            },
                            {
                                "mData": "groupId",
                                "sTitle": "Group ID",
                                "sWidth": "15%",
                                className: "column"
                            },
                            {
                                "mData": "memberStatus",
                                "sTitle": "Member Status",
                                "sWidth": "15%",
                                className: "column"
                            },
                        ],
                    });
                }

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
                    } else {
                        $('#creditData').css("display", "none");
                        $('#nodata').css("display", "block");
                        if (document.getElementById("CBStatus")) {
                            document.getElementById("CBStatus").innerHTML = "";
                        }
                    }
                }
                if (memberData["data"]["memberDocumentDetails"]) {
                    //console.log(memberData["data"]["memberDocumentDetails"]);
                    if (memberData["data"]["memberDocumentDetails"][0]) {
                        var memberDocumentsArray = memberData["data"]["memberDocumentDetails"];

                        for (var key in memberDocumentsArray) {
                            if ($.inArray(memberDocumentsArray[key]["documentType"], imgFiles) != -1) {
                                //Need to change with proper URL - Coded just for images display
                                if (memberDocumentsArray[key]["documentType"]) {
                                    if (memberDocumentsArray[key]["documentType"] == "OVERLAPREPORT") {
                                        $("#" + memberDocumentsArray[key]["documentType"] + "_docPath").attr('onClick', 'window.open(' + "'" + memberDocumentsArray[key]["documentPath"] + "'" + "," + memberDocumentsArray[key]["docId"] + "," + "width=100,height=100" + ').focus();');
                                    }

                                    if (memberDocumentsArray[key]["documentPath"].indexOf("Not%20uploaded") != -1) {
                                        if (memberDocumentsArray[key]["documentType"] == "MEMBERPHOTO") {
                                            //console.log(memberDocumentsArray[key]["documentType"] + "_docPath");
                                            $("#" + memberDocumentsArray[key]["documentType"] + "_docPath").attr("src", "/static/images/naveen.jpg");
                                        } else {
                                            $("#" + memberDocumentsArray[key]["documentType"] + "_docPath").css("display", "none");
                                        }
                                    } else {
                                        $("#" + memberDocumentsArray[key]["documentType"] + "_docPath").css("display", "inline-block");
                                        if (memberDocumentsArray[key]["documentType"] != "OVERLAPREPORT") {
                                            $("#" + memberDocumentsArray[key]["documentType"] + "_docPath").addClass("img img-test");
                                        }
                                        $("#" + memberDocumentsArray[key]["documentType"] + "_docPath").attr("src", memberDocumentsArray[key]["documentPath"]);
                                        $("#" + memberDocumentsArray[key]["documentType"] + "_docPath").attr("data-url", memberDocumentsArray[key]["documentPath"]);
                                        $("#" + memberDocumentsArray[key]["documentType"] + "_docPath").attr("data-original", memberDocumentsArray[key]["documentPath"]);
                                        // $("#idProof").imageBox();
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
                            if (document.getElementById("villages").tagName == "SPAN") {
                                document.getElementById("villages").innerHTML = memberData["data"]["memberDetails"]["villageId"];
                            }
                            if (document.getElementById("memberName2") && document.getElementById("appMemberId_top")) {
                                document.getElementById("memberName2").innerHTML = memberData["data"]["memberDetails"]["memberName"];
                                document.getElementById("appMemberId_top").innerHTML = memberData["data"]["memberDetails"]["appMemberId"];
                            }
                        }
                    }
                }
            } else {
                $.alert(memberData["message"]);
            }
            document.getElementById("groupId").innerHTML = groupId;
            document.getElementById("loanId").innerHTML = loanId;
        },
        error: function(jqXHR, textStatus, errorThrown) {}
    });
}

function updateMemValidationStatus(status) {
    var memberName = '';
    var tagname = document.getElementById("memberName").tagName;
    if (tagname == "SPAN") {
        memberName = document.getElementById("memberName").innerHTML;
    }
    if (tagname == "INPUT") {
        memberName = document.getElementById("memberName").value;
    }
    var appMemberId = document.getElementById("appMemberId").innerHTML;
    var memberId = document.getElementById("memberId").innerHTML;
    var groupId = document.getElementById("groupId").innerHTML;
    var loanId = document.getElementById("loanId").innerHTML;
    var comment = document.getElementById("comment").value;
    var memStatus = document.getElementById("memberValStatus").innerHTML;
    var loanTypeId = document.getElementById("loanTypeId1").innerHTML;
    var commentCamunda = "";
    var dataObj = {};
    if (memStatus != "" && memStatus != "PEN") {
        $.alert("Member already Validated!!!!");
        return false;
    }
    if (group == "CreditTeam") {
        validationType = "POST";
        /* if(taskName == "Proposal scrutiny"){
              validationType = "POST";
         }
         if(taskName == "Proposal scrutiny (BM Reply)"){
              validationType = "";
         }*/
    }
    if (group == "CMR" || group == "CLM" || group == "BM") {
        if (taskName == "Resolve Data Support Team Query") {
            validationType = "PRE";
            if (comment == "") {
                $.alert("Please input comment");
                return false;
            } else {
                commentCamunda = comment + "*@*" + memberName + "*@*" + appMemberId;
                dataObj['message'] = commentCamunda;
            }
        }
        if (taskName == "Conduct BAT- Member approval in CRM") {
            validationType = "CLM";
        }
        if (taskName == "Resolve Credit Team Query") {
            validationType = "CLM";
            if (comment == "") {
                $.alert("Please input comment");
                return false;
            } else {
                commentCamunda = comment + "*@*" + memberName + "*@*" + appMemberId;
                dataObj['message'] = commentCamunda;
            }
        }
    }
    if (group == "DataSupportTeam") {
        validationType = "POSTKYC";
    }
    if (status == "Rejected" || status == "Rework") {
        if (comment == "") {
            $.alert("Please input comment");
            return false;
        } else {
            commentCamunda = comment + "*@*" + memberName + "*@*" + appMemberId;
            dataObj['message'] = commentCamunda;
        }
    }

    var memValData = {
        "memberId": memberId,
        "groupId": groupId,
        "loanTypeId": loanTypeId,
        "loanId": loanId,
        "subStatus": status,
        "userId": userId,
        "comment": comment,
        "checkList": "",
        "validationType": validationType,
        "entityType": "MEMBER",
        "bpmTaskId": taskId,
        "bpmTaskName": taskName,
        "bpmProcessId": processInstanceId
    };

    dataObj["memValData"] = memValData;
    dataObj["taskId"] = taskId;
    //console.log(dataObj);
    //return false;

    var updateStatus = '';
    if (status == "Approved") {
        updateStatus = " approved";
    }
    if (status == "Rejected") {
        updateStatus = " rejected";
    }
    if (status == "Rework") {
        updateStatus = " sent for rework";
    }

    $.ajax({
        url: '/updateMemValidationStatus/',
        type: 'post',
        dataType: 'json',
        beforeSend: function() {
            triggerLoadFunc();
            $("#loading").show();
        },
        complete: function() {
            triggerLoadFunc();
            $("#loading").hide();
        },
        success: function(data) {
            if (data["code"] == "2029") {
                $.alert("'"+ memberName +"'" + " has been " + updateStatus);
                if (status == "Approved") {
                    document.getElementById(memberId).className = "list-group-item list-group-item-action list-group-item-success Approved";
                    document.getElementById("memberValStatus").innerHTML = "APP";
                }
                if (status == "Rejected") {
                    document.getElementById(memberId).className = "list-group-item list-group-item-action list-group-item-danger Rejected";
                    document.getElementById("memberValStatus").innerHTML = "REJ";
                }
                if (status == "Rework") {
                    document.getElementById(memberId).className = "list-group-item list-group-item-action list-group-item-warning Rework";
                    document.getElementById("memberValStatus").innerHTML = "RWRK";
                }
                updateMembersCount();
                getHistComments(processInstanceId);
                checkForTaskCompletion();
            }
        },
        data: JSON.stringify(dataObj)
    });

}


function submitKYCForm(status) {
    var validationType;
    if (group == "DataSupportTeam") {
        validationType = "POSTKYC";
    }
    if (group == "CreditTeam") {
        validationType = "POST";
    }
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
            } else {
                $("#" + validationFields[i] + "").css('background-color', 'white');
            }
        }
    }

    var name = document.getElementById("memberName").value;
    var age = document.getElementById("age").value;
    var maritalStatus = document.getElementById("maritalStatus").value;
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
    var appGroupId = document.getElementById("appGroupId").innerHTML;
    var loanId = document.getElementById("loanId").innerHTML;
    var comment = document.getElementById("comment").value;
    var memStatus = document.getElementById("memberValStatus").innerHTML;
    var appMemberId = document.getElementById("appMemberId").innerHTML;
    var loanTypeId = document.getElementById("loanTypeId1").innerHTML;
    var sequenceNumber = document.getElementById("sequenceNumber").value;


    var commentCamunda = "";
    if (validation == 1) {
        //$("#warningId").css("display","block");
        $.alert("Please proceed after mandatory fields are entered");
        return false;
    }
    if (memStatus != "" && memStatus != "PEN") {
        $.alert("Member already Validated!!!!");
        return false;
    }

    var dataObj = {};

    var memValData = {
        "memberId": memberId,
        "groupId": groupId,
        "loanId": loanId,
        "loanTypeId": loanTypeId,
        "subStatus": status,
        "userId": userId,
        "comment": comment,
        "checkList": "",
        "validationType": validationType,
        "entityType": "MEMBER",
        "bpmTaskId": taskId,
        "bpmTaskName": taskName,
        "bpmProcessId": processInstanceId
    };

    var dataDict = {
        "entityType": "MEMBER",
        "validationType": validationType,
        "memberId": memberId,
        "groupId": groupId,
        "loanId": loanId,
        "userId": userId,
        "name": name,
        "age": age,
        "maritalStatus": maritalStatus,
        "spouse": spouse,
        "father": father,
        "address": address,
        "permanentAddress": permanentAddress,
        "pincode": pincode,
        "idProof": idProof,
        "idProofType": idProofType,
        "addressProof": addressProof,
        "addressProofType": addressProofType,
        "sbAccountNumber": sbAccountNumber,
        "bankId": bankId,
        "villageId": villageId,
        "loanAmount": loanAmount,
        "loanPurpose": loanPurpose,
        "sbBranch": sbBranch,
        "sbAccountName": sbAccountName,
        "mobileNumber": mobileNumber,
        "sequenceNumber" :sequenceNumber
    };

    dataObj['formData'] = dataDict;
    dataObj['memValData'] = memValData;
    dataObj['taskId'] = taskId;
    var updateStatus = '';
    if (status == "Rework") {
        updateStatus = " sent for Rework";
    }
    if (status == "Approved") {
        updateStatus = " approved";
    }
    if (status == "Rejected") {
        updateStatus = " rejected";
    }
    if (status == "Rework" || status == "Rejected") {
        if (comment == "") {
            $.alert("Please input Comment!");
            return false;
        } else {
            commentCamunda = comment + "*@*" + name + "*@*" + appMemberId;
            dataObj['message'] = commentCamunda;
        }
    }


    $.ajax({
        url: '/updateKYCDetails/',
        type: 'post',
        dataType: 'json',
        beforeSend: function() {
            triggerLoadFunc();
            $("#loading").show();
        },
        complete: function() {
            triggerLoadFunc();
            $("#loading").hide();
        },
        success: function(data) {
            if (data["code"] == "2024") {
                $.alert("'"+ name +"'" + " has been " + updateStatus);

                if (status == "Approved") {
                    document.getElementById(memberId).className = "list-group-item list-group-item-action list-group-item-success Approved";
                    document.getElementById("memberValStatus").innerHTML = "APP";
                }
                if (status == "Rejected") {
                    document.getElementById(memberId).className = "list-group-item list-group-item-action list-group-item-danger Rejected";
                    document.getElementById("memberValStatus").innerHTML = "REJ";
                }
                if (status == "Rework") {
                    document.getElementById(memberId).className = "list-group-item list-group-item-action list-group-item-warning Rework";
                    document.getElementById("memberValStatus").innerHTML = "RWRK";
                }
                updateMembersCount();
                getHistComments(processInstanceId);
                checkForTaskCompletion();
            } else {
                $.alert("Connection Time out");
            }
        },
        data: JSON.stringify(dataObj)
    });
}


function checkForTaskCompletion() {
    var membersCount = document.getElementById("san_test").getElementsByTagName("a").length;
    var approvedCount = $('.Approved').length;
    var rejectedCount = $('.Rejected').length;
    var reworkCount = $('.Rework').length;
    var pendingCount = $('.Pending').length;
    var processStatus;
    var totalCount = approvedCount + rejectedCount + reworkCount + pendingCount;
    if (group == "DataSupportTeam" || group == "CreditTeam") {
        if (totalCount == membersCount && reworkCount > 0 && pendingCount == 0) {
            processStatus = "raiseQuery";
            taskUpdate(processStatus);
        }
        if (totalCount == membersCount && reworkCount == 0 && pendingCount == 0) {
            if (group == "CreditTeam") {
                processStatus = "CBApproved";
                taskUpdate(processStatus);
            }
            if (group == "DataSupportTeam") {
                processStatus = "Approved";
                taskUpdate(processStatus);
            }
        }
    }

    if (group == "CMR" || group == "CLM" || group == "BM") {
        var dataObj = {};
        if (taskName == "Resolve Data Support Team Query") {
            validationType = "POSTKYC";
            var processUpdate = {
                'variables': {
                    'kyc': {
                        'value': "resolved"
                    },
                }
            };
            dataObj["processUpdate"] = processUpdate;
        }
        if (taskName == "Resolve Credit Team Query") {
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
        if (membersCount == (approvedCount + rejectedCount) && pendingCount == 0) {
            $.ajax({
                url: '/updateTask/',
                dataType: 'json',
                type: "post",
                beforeSend: function() {
                    triggerLoadFunc();
                    $("#loading").show();
                },
                complete: function() {
                    triggerLoadFunc();
                    $("#loading").hide();
                },
                success: function(data) {
                    if (data == "Successful") {
                        window.location = '/assignedTaskList/';
                    }
                },
                data: JSON.stringify(dataObj)
            });
        } else {
            return false;
        }
    }

}

function taskUpdate(status) {
    var comment = '';
    var processupdate;
    if (group == "DataSupportTeam") {
        processupdate = {
            'variables': {
                'kyc': {
                    'value': status
                },
            }
        };
    }
    if (group == "CreditTeam") {
        processupdate = {
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
    if (document.getElementById("comment")) {
        comment = document.getElementById("comment").value;
        dataObj["message"] = comment;
    }
    // console.log(dataObj);
    //return false;
    $.ajax({
        url: '/updateTask/',
        dataType: 'json',
        type: "post",
        beforeSend: function() {
            triggerLoadFunc();
            $("#loading").show();
        },
        complete: function() {
            $("#loading").hide();
        },
        success: function(data) {
            if (data == "Successful") {
                $.alert("Member and Group Validation Completed!!");
                window.location = '/assignedTaskList/';
            } else {
                $.alert("Failed due to some Issue . Please try after sometime or contact your Administrator");
            }
        },
        data: JSON.stringify(dataObj)
    });
}

function creditHistory(loanId) {
    var htmlContent = '';
    $.ajax({
        url: '/creditHistoryGroup/' + loanId,
        dataType: 'json',
        success: function(data) {
            var creditData = data;
            // console.log(creditData);
            var documentObj = [];
            var docPath = ''
            var docId = ''
            var docBtn = ''
            if (creditData.data) {
                for (var i = 0; i < creditData.data.length; i++) {
                    var creditObj = creditData["data"][i]["creditInquiry"];
                    documentObj = creditData["data"][i]["memberDocument"];

                    var documentPath = '';
                    if (documentObj[0]) {
                        for (var j = 0; j < documentObj.length; j++) {
                            if (documentObj[j]["documentType"] == "OVERLAPREPORT") {
                                docPath = documentObj[j]["documentPath"];
                                docId = documentObj[j]["docId"];
                                docBtn = '<button type="button" class="btn btn-info btn-md btn-danger" onclick="window.open(' + "'" + docPath + "'" + "," + docId + "," + "width=200,height=100" + ');"+>View</button>';
                            }
                        }
                    } else {
                        docBtn = '<button type="button" class="btn btn-info btn-md btn-danger"+>View</button>';

                    }
                    htmlContent += '<tr><td>' + docBtn + ' </td>' +
                        '<td>' + creditObj["appMemberId"] + '</td><td>' +
                        creditObj["memberName"] + '</td>' +
                        '<td>' + creditObj["s_product_type"] + '</td>' +
                        '<td>' + creditObj["status"] + '</td>' +
                        '<td>' + creditObj["remarks"] + '</td>' +
                        '<td>' + creditObj["hm_response_date"] + '</td>' +
                        '<td>' + creditObj["existing_loan_limit"] + '</td>' +
                        '<td>' + creditObj["loan_amount_eligible"] + '</td>' +
                        '<td>' + creditObj["no_of_mfi_eligible"] + '</td>' +
                        '<td>' + creditObj["name_of_mfi_1"] + '</td>' +
                        '<td>' + creditObj["overdue_amount_1"] + '</td>' +
                        '<td>' + creditObj["loan_amount_1"] + '</td>' +
                        '<td>' + creditObj["balance_1"] + '</td>' +
                        '<td>' + creditObj["name_of_mfi_2"] + '</td>' +
                        '<td>' + creditObj["overdue_amount_2"] + '</td>' +
                        '<td>' + creditObj["loan_amount_2"] + '</td>' +
                        '<td>' + creditObj["balance_2"] + '</td>' +
                        '<td>' + creditObj["name_of_mfi_3"] + '</td>' +
                        '<td>' + creditObj["overdue_amount_3"] + '</td>' +
                        '<td>' + creditObj["loan_amount_3"] + '</td>' +
                        '<td>' + creditObj["balance_3"] + '</td>' +
                        '<td>' + creditObj["name_of_mfi_4"] + '</td>' +
                        '<td>' + creditObj["overdue_amount_4"] + '</td>' +
                        '<td>' + creditObj["loan_amount_4"] + '</td>' +
                        '<td>' + creditObj["balance_4"] + '</td>' +
                        '</tr>';
                }
            }
            document.getElementById("creditData").innerHTML = htmlContent;
            //loadDataTable("#creditTableID");
        }
    });
}

function disableActiveTab() {
    if (document.getElementsByClassName("active")) {
        if (document.getElementsByClassName("active")[0]) {
            document.getElementsByClassName("active")[0].className = "inactive";
        }
    }
}

function enableActiveTab() {
    if (document.getElementsByClassName("inactive")) {
        if (document.getElementsByClassName("inactive")[0]) {
            document.getElementsByClassName("inactive")[0].className = "active";
        }
    }
}


function loadGroupRoles(groupId, loanId, taskName) {
    var dataObj = {};
    var validationType = '';
    if (group == "CMR" || group == "CLM" || group == "BM") {
        if (taskName == "Print Loan Documents & FSR") {
            validationType = "PEN"
        }
        if (taskName == "Upload loan documents in Web application") {
            validationType = "PRE"
        }
    }
    if (group == "RM" || group == "rm") {
        validationType = "CLMAPPROVAL"
    }
    var roleObj = {
        "groupId": groupId,
        "entityType": "GROUP",
        "validationType": validationType,
        "loanId": loanId
    };
    dataObj["roleObj"] = roleObj;
    $.ajax({
        url: '/groupRoleDetails/',
        dataType: 'json',
        type: "post",

        success: function(data) {
            console.log(data);
            document.getElementById("loanTypeId1").innerHTML = data["data"]["loanTypeId"];
            if (document.getElementById("appGroupId")) {
                document.getElementById("appGroupId").innerHTML = data["data"]["groupDetails"]["appGroupId"];
            }

            var groupDetails = data["data"]["groupDetails"];
            for (var key in groupDetails) {
                if (document.getElementById(key + "_groupRole")) {
                    document.getElementById(key + "_groupRole").innerHTML = groupDetails[key];
                    if (document.getElementById(key + "1")) {
                        document.getElementById(key + "1").innerHTML = groupDetails[key];
                    }
                }
            }
            rmGroupMaster(groupId);
        },
        data: JSON.stringify(dataObj)
    });


}




function updateGroupValStatus(status) {
    var validationType = '';
    var comment;
    var processUpdate;
    var dataObj = {};
    if (document.getElementById("comment")) {
        comment = document.getElementById("comment").value;
    }
    var loanTypeId = document.getElementById("loanTypeId1").innerHTML;
    if (status == "Rejected") {
        if (comment == "") {
            $.alert("Please input comment");
            return false;
        }
    }
    if (group == "DataSupportTeam") {
        validationType = "PEN";
        processUpdate = {
            'variables': {
                'kyc': {
                    'value': "Approved"
                },
            }
        };
        dataObj["processUpdate"] = processUpdate;
    }
    if (group == "CreditTeam") {
        validationType = "POST";
        processUpdate = {
            'variables': {
                'chekcbrespdate': {
                    'value': "CBApproved"
                },
            }
        };
        dataObj["processUpdate"] = processUpdate;
    }

    if (group == "CMR" || group == "CLM" || group == "BM") {
        if (taskName == "Upload loan documents in Web application") {
            validationType = "CLMAPPROVAL";
        }
        if (taskName == "Print Loan Documents & FSR") {
            validationType = "PRE";
            if (!document.getElementById("Animator").value || !document.getElementById("repm1").value || !document.getElementById("repm2").value) {
                $.alert("Please update group roles before task completion!");
                return false;
            }
            else {
                updateGroupMemberStatus();
            }
        }
    }
    if (group == "RM" || group == "rm") {
        validationType = "POST";

        if (!document.getElementById("Animator").value || !document.getElementById("repm1").value || !document.getElementById("repm2").value) {
            $.alert("Please update group roles before task completion!");
            return false;
        }
        else {
            updateGroupMemberStatus();
        }
    }
    var groupValData = {
        "groupId": groupId,
        "loanTypeId": loanTypeId,
        "loanId": loanId,
        "subStatus": status,
        "userId": userId,
        "comment": comment,
        "validationType": validationType,
        "entityType": "GROUP",
        "bpmTaskId": taskId,
        "bpmTaskName": taskName,
        "bpmProcessId": processInstanceId
    };

    dataObj["groupValData"] = groupValData;
    dataObj["taskId"] = taskId;
    if (comment != "") {
        dataObj["message"] = comment;
    }
    $.ajax({
        url: '/updateGrpValidationStatus/',
        dataType: 'json',
        type: "POST",
        beforeSend: function() {
            triggerLoadFunc();
            $("#loading").show();
        },
        complete: function() {
            triggerLoadFunc();
            $("#loading").hide();
        },
        success: function(data) {
            if (data == "Successful") {
                $.alert("Group Validation completed Successfully");
                window.location = '/assignedTaskList/';
            }
        },
        data: JSON.stringify(dataObj)
    });

}


function updateTask(status) {
    var dataObj = {};
    dataObj["taskId"] = taskId;
    dataObj["processUpdate"] = {};
    $.ajax({
        url: '/updateTask/',
        dataType: 'json',
        type: "post",
        beforeSend: function() {
            triggerLoadFunc();
            $("#loading").show();
        },
        complete: function() {
            $("#loading").hide();
        },
        success: function(data) {
            if (data == "Successful") {
                $.alert("Group Updation completed!!");
                window.location = '/assignedTaskList/';
            } else {
                $.alert("Failed due to some Issue . Please try after sometime or contact your Administrator");
            }
        },
        data: JSON.stringify(dataObj)
    });
}



function getHistComments(processId) {
    var htmlContent = '';
    $.ajax({
        url: '/getHistoryComments/' + processId,
        dataType: 'json',
        success: function(data) {
            var commentsJson = data;
            var commentsList = Object.keys(commentsJson).map(function(key) {
                return [key, commentsJson[key]];
            });
            var sortedData = commentsList.sort((function(a, b) {
                return new Date(a[1].startTime) - new Date(b[1].startTime)
            }));
            for (var key in sortedData) {
                if (sortedData[key][1]["activityType"] == "userTask") {
                    if (sortedData[key][1]["comments"]) {
                        if (sortedData[key][1]["comments"][0]) {
                            var sortedcomments = sortedData[key][1]["comments"].sort((function(a, b) {
                                return new Date(a.time) - new Date(b.time)
                            }));
                            for (var key1 in sortedcomments) {
                                var cmtDateSplit = sortedcomments[key1]["time"].split("T");
                                var cmtDate = cmtDateSplit[0].split("-");
                                cmtDate = cmtDate[2] + "-" + cmtDate[1] + "-" + cmtDate[0] + " at " + cmtDateSplit[1];
                                if (sortedcomments[key1]["message"].includes("*@*")) {
                                    var commentSplit = sortedcomments[key1]["message"].split("*@*");
                                    if (commentSplit[1] != "" && commentSplit[2] != "") {
                                        var comment = commentSplit[0];
                                        var memberName = commentSplit[1] + "&nbsp(&nbsp" + commentSplit[2] + "&nbsp)";
                                        htmlContent += '<div class="profile-activity clearfix"><div><span style="font-weight:bold;color:#981b1b;"><i class="glyphicon glyphicon-user"></i> ' + sortedData[key][1]["assignee"] + ':</span>  ' +
                                            '&nbsp&nbsp<span style="color:black;">' + sortedData[key][1]["activityName"] + '</span>' +
                                            '<div style="font-weight:bold;color:darkslategrey;">Member : ' + memberName + '<br></div>' +
                                            '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span style="font-style:italic;">' +
                                            '<i class="fa fa-comments" style="color:darkslategrey;" aria-hidden="true"></i>&nbsp' + comment + '</span><div class="time"><i class="ace-icon fa fa-clock-o bigger-110"></i><span > Commented on &nbsp&nbsp' +
                                            cmtDate + '</span><br><i class="ace-icon fa fa-clock-o bigger-110"></i><span>Task end Time ' + sortedData[key][1]["endTime"] + '</span></div></div></div>';
                                    }
                                } else {
                                    htmlContent += '<div class="profile-activity clearfix"><div><span style="font-weight:bold;color:#981b1b;"><i class="glyphicon glyphicon-user"></i> ' + sortedData[key][1]["assignee"] + ':</span>  ' +
                                        '&nbsp&nbsp<span style="color:black;">' + sortedData[key][1]["activityName"] + '</span></div>' +
                                        '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span style="font-style:italic;">' +
                                        '<i class="fa fa-comments" style="color:darkslategrey;" aria-hidden="true"></i>&nbsp' + sortedcomments[key1]["message"] + '</span><div class="time"><i class="ace-icon fa fa-clock-o bigger-110"></i><span > Commented on &nbsp&nbsp' +
                                        cmtDate + '</span><br><i class="ace-icon fa fa-clock-o bigger-110"></i><span>Task end Time ' + sortedData[key][1]["endTime"] + '</span></div></div></div>';
                                }
                            }
                        }
                    }
                }
            }
            if (!htmlContent) {
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
                    $('<td>' + current + '</td><td>' + value.documentName + '</td><td> <button type="button" class="btn btn-danger" id = "' + value.docId + '" onclick="window.open(' + "'" + value.documentPath + "'" + "," + value.docId + "," + "width=200,height=100" + ');"><span class="glyphicon glyphicon-cloud-upload"></span> View  </button></td> ').appendTo(tr);
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
    if (!document.getElementById("Animator").value) {
        $.alert("Please select Group Animator");
        return false;
    }
    if (!document.getElementById("repm1").value) {
        $.alert("Please select Group Rep1");
        return false;
    }
    if (!document.getElementById("repm2").value) {
        $.alert("Please select Group Rep2");
        return false;
    }
    var nAnimator = document.getElementById("Animator").value;
    var nrepm1 = document.getElementById("repm1").value;
    var nrepm2 = document.getElementById("repm2").value;
    var groupValData = {
        "entityType": "GROUP",
        "validationType": "POST",
        "groupId": groupId,
        "userId": userId,
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
            $("#loading").show();
        },
        complete: function() {
            triggerLoadFunc();
            $("#loading").hide();
        },
        success: function(data) {
            if (data.code == '2024') {
                $.alert("Member roles have been updated successfully");
            }
        },
        data: JSON.stringify(dataObj)
    });
}




function getLoanDetails(groupId, loanId) {
    $.ajax({
        url: '/getLoanDetails/' + groupId + '/' + loanId,
        dataType: 'json',
        success: function(data) {
            var htmlContent = '';
            var creditData = data;
            var loanDetails = data["data"]["loanDetails"];
            if (document.getElementById("loanTypeName")) {
                document.getElementById("loanTypeName").innerHTML = loanDetails["loanTypeName"];
            }
            if (document.getElementById("loanInstallments")) {
                document.getElementById("loanInstallments").value = loanDetails["loanInstallments"];
            }
            var loanMemberDetails = data["data"]["loanMemberDetails"];

            $.ajax({
                url: '/masterLoanPurpose/',
                type: 'post',
                dataType: 'json',
                success: function(loanPurposeData) {
                    $.each(loanPurposeData.data, function(key, value) {
                        // console.log(value.name);
                        //$(".purpose2").css("width","100%");
                        $('.purpose2').append('<option value="' + value.id + '">' + value.name + '</option>');
                    });
                    $.each($('.purpose2 option'), function(key, optionElement) {
                        var curText = $(optionElement).text();
                        $(this).attr('title', curText);
                        var lengthToShortenTo = Math.round(parseInt('200px', 10) / 9.4);
                        if (curText.length > lengthToShortenTo) {
                            $(this).text(curText.substring(0, lengthToShortenTo) + '...');
                        }
                    });
                    // Show full name in tooltip after choosing an option
                    $('.purpose2').change(function() {
                        $(this).attr('title', ($(this).find('option:eq(' + $(this).get(0).selectedIndex + ')').attr('title')));
                    });
                }
            });
            if (creditData.data) {
                //   console.log(creditData.data);
                for (var i = 0; i < creditData.data.loanMemberDetails.length; i++) {
                    var creditObj = creditData["data"]["loanMemberDetails"][i];
                    var newMem = "";
                    //  console.log(creditObj);
                    if (creditObj["newMember"] == true) {
                        newMem = "Yes";
                    }
                    if (creditObj["newMember"] == false) {
                        newMem = "No";
                    }
                    htmlContent += '<tr>'

                        +
                        '<td>' + creditObj["sequenceNumber"] + '</td><td>' +
                        creditObj["appMemId"] + '</td><td>' +
                        newMem + '</td><td>' +
                        creditObj["memberName"] + '</td><td>' +
                        creditObj["sbAccountNo"] + '</td><td>' +
                        creditObj["bankName"] + '</td><td>' +
                        creditObj["previousLoanAmount"] + '</td><td>'

                        +
                        ' <input  onkeypress="validate(event,2)"  id="'+creditObj["memberId"]+"_loanAmt"+'" onblur="validateFields(this.id,this.value,'+"'"+'loanAmount'+"'"+');" maxlength=10 type="text" name="m2street_' + i + '" class="sample5"  value=' + creditObj["loanAmount"] + '></td><td>' +
                        ' <input onkeypress="validate(event,2)" maxlength=7 type="text" style="width: 45px;" class="sample5" name="m2street_' + creditObj["memberId"] + '" value=' + creditObj["awb"] + '></td><td>' +
                        ' <input onkeypress="validate(event,2)" maxlength=7 type="text" style="width: 45px;" class="sample5" name="m2street_' + creditObj["memberId"] + '" value=' + creditObj["sellingPrice"] + '></td><td>' +
                        creditObj["sundryDebt"] + '</td><td>'

                        +
                        creditObj["processingFee"] + '</td><td>' +
                        creditObj["serviceTax"] + '</td><td>' +
                        creditObj["educationCess"] + '</td><td>'

                        +
                        '<font readonly="readonly" style="width: 45px;" name="m2street_' + creditObj["memberId"] + '" value=' + creditObj["insuranceAmount"] + '>' + creditObj["insuranceAmount"] + '</font></td><td>' +
                        creditObj["memNetLoanAmount"] + '</td><td>' +
                        '<select class="purpose2"  id="purpose_' + creditObj["memberId"] + '   name="purpose"><option value=' + creditObj["purposeId"] + '>' + creditObj["purpose"] + '</option></select></td><td>'

                        +
                        ' <input type="checkbox" name="drop" id="m2street + creditObj["memberId"] ' + ' value=' + creditObj["memberId"] + ' ></td><td style="display:none;">' +
                        ' <input type="text" name="atlDebt_' + i + '" value=' + creditObj["atlDebt"] + '></td><td style="display:none">' +
                        ' <input type="text" name="interest_' + i + '" value=' + creditObj["interest"] + '></td><td style="display:none">'

                        +
                        ' <input type="text" name="prevGroupBal_' + i + '" value=' + creditObj["prevMonthGroupBalance"] + '></td><td style="display:none">' +
                        ' <input type="text" name="CurrentMonthColle_' + i + '" value=' + creditObj["currentMonthCollection"] + '></td><td style="display:none"> '

                        +
                        ' <input type="text" name="curMonthOut_' + i + '" value=' + creditObj["currentMonthOutstanding"] + '></td><td style="display:none"> ' +
                        ' <input type="text" name="prevloangroup_' + i + '" value=' + creditObj["prevLoanGroupAmount"] + '></td><td style="display:none">'

                        +
                        ' <input type="text" name="sumOldAmt_' + i + '" value=' + creditObj["sumOldActiveMembersAmount"] + '></td><td style="display:none">' +
                        ' <input type="text" name="memberLoan' + i + '" value=' + creditObj["memberLoanAmount"] + '></td><td style="display:none">'

                        +
                        ' <input type="text" name="gid_' + i + '" value=' + creditObj["groupId"] + '></td><td style="display:none">' +
                        ' <input type="text" name="ltypeid_' + i + '" value=' + creditObj["loanTypeId"] + '></td><td style="display:none">'

                        +
                        ' <input type="text" name="atLlonaid' + i + '" value=' + creditObj["atLloanId"] + '></td><td style="display:none">' +
                        ' <input type="text" name="atlAcc' + i + '" value=' + creditObj["atlLoanAccountNumber"] + '></td>'

                        +
                        '</tr>';
                }
            }
            document.getElementById("loandata").innerHTML = htmlContent;
            //console.log(JSON.stringify(data));
            for (var key in loanDetails) {
                if (document.getElementById(key)) {
                    document.getElementById(key).innerHTML = loanDetails[key];
                    if (document.getElementById(key + "1")) {
                        document.getElementById(key + "1").innerHTML = loanDetails[key];
                    }
                }
            }
            loadDataTable("#paymentTable");
        }
    });
}


function loadDataTable(id) {
    var table = $(id).DataTable({
        "sDom": '<"top">rt<"bottom"flp><"clear">',
        "paging": false,
        "bInfo": false,
        "bLengthChange": false,
        "bPaginate": false,
        "searching": false
    });

    var data = table.$('input, select').serialize();
    return false;
}


function dropMemberDetail(loanId, dropMember, groupId) {
    var dataObj2 = {};
    var uploadData = {
        "loanId": String(loanId),
        "memberIds": dropMember,
        "userId": userId

    }
    dataObj2["uploadData"] = uploadData;
    $.ajax({
        url: '/dropMemberDetail/',
        dataType: 'json',
        type: "POST",
        success: function(data) {
            if (data.code == "2025") {
                $.alert("Members dropped successfully.");
                $("#paymentTable").dataTable().fnDestroy();
                getLoanDetails(groupId, loanId);
            } else {
                $.alert("Error on dropping members");
            }
        },
        data: JSON.stringify(dataObj2)
    });
}

function updateloanDatail(updateloanData) {
    var installment;
    if (document.getElementById("loanInstallments")) {
        if (document.getElementById("loanInstallments").value) {
            installment = document.getElementById("loanInstallments").value;
            if (installment == 0 || installment == "undefined") {
                $("#loanInstallments").css("background-color", "#FEEFB3");
                $.alert("Invalid loan installments");
                return false;
            }
        } else {
            $("#loanInstallments").css("background-color", "#FEEFB3");
            $.alert("Please input loan installments");
            return false;
        }
    }
    var dataObj3 = {};
    var uploadData2 = {
        "loanId": String(loanId),
        "installments": installment,
        "memberLoanDetails": eval(updateloanData),
        "userId": userId
    }
    dataObj3["uploadData"] = uploadData2;
    $.ajax({
        url: '/updateloanDetail/',
        dataType: 'json',
        type: "POST",
        beforeSend: function() {
            $("#loading").show();
        },
        complete: function() {
            $("#loading").hide();
        },
        success: function(data) {
            if (data.code == "2024") {
                $.alert("Members' Loan info has been updated.");
                $("#paymentTable").dataTable().fnDestroy();
                getLoanDetails(groupId, loanId);
            } else {
                $.alert("Error on updating members");
            }
        },
        data: JSON.stringify(dataObj3)
    });
}


function approveLoan(updateloanData) {
    var dataObj = {};
    var groupName = document.getElementById("groupName1").innerHTML;
    var appGroupId = document.getElementById("appGroupId").innerHTML;
    var loanTypeName = document.getElementById("loanTypeName").innerHTML;
    var loanTypeId = document.getElementById("loanTypeId1").innerHTML;
    var installment;
    if (document.getElementById("loanInstallments")) {
        if (document.getElementById("loanInstallments").value) {
            installment = document.getElementById("loanInstallments").value;
            if (installment == 0 || installment == "undefined") {
                $("#loanInstallments").css("background-color", "#FEEFB3");
                $.alert("Invalid loan installments");
                return false;
            }
        } else {
            $("#loanInstallments").css("background-color", "#FEEFB3");
            $.alert("Please input loan installments");
            return false;
        }
    }
    var loanData = {
        "groupId": groupId,
        "loanId": loanId,
        "loanTypeId": loanTypeId,
        "entityType": "LOAN",
        "validationType": "POST",
        "userId": userId,
        "subStatus": "POST_KYC_VALIDATED",
        "installments": installment,
        "memberLoanDetails": eval(updateloanData),
        "bpmTaskId": taskId,
        "bpmTaskName": taskName,
        "bpmProcessId": processInstanceId
    };
    dataObj["loanData"] = loanData;
    dataObj["taskId"] = taskId;
    $.ajax({
        url: '/approveLoan/',
        dataType: 'json',
        type: "POST",
        beforeSend: function() {
            $("#loading").show();
        },
        complete: function() {
            $("#loading").hide();
        },
        success: function(data) {
            if (data.code == "2032") {
                $.alert("Loan has been approved");
                var loanAccNumber = data["data"]["loanAccountNumber"];
                /*var dataArr = {};
                 dataArr["loanAccNo"] = data["data"]["loanAccountNumber"];
                 dataArr["appGroupId"] = appGroupId;
                 dataArr["loanTypeName"] = loanTypeName;
                 dataArr["groupName"] = groupName;
                 $.ajax({
                     url: '/generateLoanAccNum/',
                     dataType: 'json',
                     type: "POST",
                     sucess: function (data) {
                         console.log(data);
                     },
                     data: JSON.stringify(dataArr)
                 });*/
                window.location.href = "/loanAccNo/" + loanAccNumber + '/' + appGroupId + '/' + loanTypeName + '/' + groupName;
            }
            if (data.code == "2034") {
                $.alert(data["message"]);
            }
        },
        data: JSON.stringify(dataObj)
    });
}

function validate(evt, id) {
    var theEvent = evt || window.event;
    var key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode(key);
    if (id == 1) {
        var regex = /[0-9]/;
    }
    if (id == 2) {
        var regex = /[0-9]|\./;
    }
    if (!regex.test(key)) {
        theEvent.returnValue = false;
        if (theEvent.preventDefault)
            theEvent.preventDefault();
    }
}


function alpha(e) {
    var k;
    document.all ? k = e.keyCode : k = e.which;
    console.log(k, e);
    return ((k >= 63 && k <= 91) || (k >= 97 && k < 123) || (k >= 93 && k < 96) || k == 8 || k == 32 || k == 33 || (k >= 40 && k <= 59) || k == 61 || (k >= 35 && k <= 38));
}

function tabControl() {
    $("#tab1").addClass("active");
    $("#tab2").removeClass("active");
    $("#tab3").removeClass("active");
    $("#tab4").removeClass("active");
    $("#tab5").removeClass("active");
    $("#tab6").removeClass("active");
    // $('#CreditListTable').empty();
}

function updateMembersCount() {
    var membersCount = document.getElementById("san_test").getElementsByTagName("a").length;
    var approvedCount = $('.Approved').length;
    var rejectedCount = $('.Rejected').length;
    var reworkCount = $('.Rework').length;
    var penCount = $('.Pending').length;

    if (document.getElementById("appCount")) {
        document.getElementById("appCount").innerHTML = approvedCount;
    }
    if (document.getElementById("rejCount")) {
        document.getElementById("rejCount").innerHTML = rejectedCount;
    }
    if (document.getElementById("rwrkCount")) {
        document.getElementById("rwrkCount").innerHTML = reworkCount;
    }
    if (document.getElementById("penCount")) {
        document.getElementById("penCount").innerHTML = penCount;
    }
    if (document.getElementById("totCount")) {
        document.getElementById("totCount").innerHTML = membersCount;
    }
}


function rmGroupMaster(groupId) {
    $.ajax({
        url: '/getGroupData/' + groupId + '/' + taskName,
        dataType: 'json',
        beforeSend: function() {
            $("#loading").show();
        },
        complete: function() {
            $("#loading").hide();
        },
        success: function(data) {
            var groupViewData2 = data;
            if (groupViewData2["data"]["groupMemDetail"]) {
                var groupData = groupViewData2["data"]["groupMemDetail"];

                var found_names = $.grep(groupViewData2.data.groupMemDetail, function(v) {
                    return v.memberStatus != "Rejected";
                });
                $.each(found_names, function(key, value) {
                    $('#Animator').append('<option value="' + value.memberId + '">' + value.memberName + '</option>');
                    $('#repm1').append('<option value="' + value.memberId + '">' + value.memberName + '</option>');
                    $('#repm2').append('<option value="' + value.memberId + '">' + value.memberName + '</option>');
                });

                var animatorvalue = $("#animatorId_groupRole").text();
                var rep1value = $("#rep1Id_groupRole").text();
                var rep2value = $("#rep2Id_groupRole").text();

                 console.log(animatorvalue,rep1value,rep2value)
                //alert(rep2value);
                if(document.getElementById("Animator")){
                     if ( $("#Animator option[value="+animatorvalue+"]").length == 0 ){
                      $("#Animator").val();
                    }
                    else{
                        $("#Animator").val(animatorvalue);
                    }
                }
                if(document.getElementById("repm1")){
                    if ( $("#repm1 option[value="+rep1value+"]").length == 0 ){
                       $("#repm1").val();
                    }
                    else{
                        $("#repm1").val(rep1value);
                    }
                }
                if(document.getElementById("repm2")){
                    if ( $("#repm2 option[value="+rep2value+"]").length == 0 ){
                      $("#repm2").val();
                    }
                    else{
                        $("#repm2").val(rep2value);
                    }
                 }

                $.each($('.compact option'), function(key, optionElement) {
                    var curText = $(optionElement).text();
                    $(this).attr('title', curText);
                    var lengthToShortenTo = Math.round(parseInt('170px', 10) / 9.4);
                    if (curText.length > lengthToShortenTo) {
                        $(this).text(curText.substring(0, lengthToShortenTo) + '...');
                    }
                });
                // Show full name in tooltip after choosing an option
                $('.compact').change(function() {
                    $(this).attr('title', ($(this).find('option:eq(' + $(this).get(0).selectedIndex + ')').attr('title')));
                });

                if (document.getElementById("groupMemberDetails")) {
                    $('#groupMemberDetails').dataTable({
                        data: groupData,
                        "bDestroy": true,
                        "bJQueryUI": false,
                        "bProcessing": true,
                        "bSort": true,
                        "bInfo": true,
                        "bPaginate": false,
                        "iDisplayLength": 10,
                        "bSortClasses": false,
                        "bAutoWidth": false,
                        "searching": false,
                        "sDom": '<"top">rt<"bottom"flp><"clear">',
                        "bDeferRender": true,
                        "aoColumns": [{
                                "mData": "appMemberId",
                                "sTitle": "App Member Id",
                                "sWidth": "10%",
                                className: "column"
                            },
                            {
                                "mData": "memberName",
                                "sTitle": "Member Name",
                                "sWidth": "25%",
                                className: "column"
                            },
                            {
                                "mData": "age",
                                "sTitle": "Age",
                                "sWidth": "6%",
                                className: "column"
                            },
                            {
                                "mData": "address",
                                "sTitle": "Address",
                                "sWidth": "30%",
                                className: "column"
                            },
                            {
                                "mData": "villageName",
                                "sTitle": "Village",
                                "sWidth": "20%",
                                className: "column"
                            },
                            {
                                "mData": "pincode",
                                "sTitle": "Pincode",
                                "sWidth": "10%",
                                className: "column"
                            },
                        ],
                    });
                }
            }
        }
    });
}

function validateFields(id,val,fieldName){
    if(fieldName == "age" && val < 18){
        $("#"+id).css('background-color', '#FEEFB3');
        $("#"+id).css('color', 'black');
        setInterval(function(){
            document.getElementById(id).style.background = "white";
        }, 20000);
        $.alert("Age should be above 18 !");
        return false;
    }
    if(fieldName == "mobileNumber" && val.length < 10){
        $("#"+id).css('background-color', '#FEEFB3');
        $("#"+id).css('color', 'black');
        setInterval(function(){
            document.getElementById(id).style.background = "white";
        }, 20000);
        $.alert("Please enter valid mobile number !");
        return false;
    }
    if(fieldName == "loanAmount"){
        console.log(Math.round(val));
        if(Math.round(val) == 0){
            $("#"+id).css('background-color', '#FEEFB3');
            $("#"+id).css('color', 'black');
            setInterval(function(){
                document.getElementById(id).style.background = "white";
            }, 20000);
            $.alert("Please enter valid amount !");
            return false;
        }
    }

}