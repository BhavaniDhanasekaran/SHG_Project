var validationFields = ["memberName", "sequenceNumber", "age", "husbandName", "maritalStatus", "fatherName", "address", "villageName", "idProofValue", "addressProofValue", "sbAccountNumber", "bankId", "sbAccountName",
    "permanentAddress", "pincode", "villages", "mobileNo", "idProofTypeId", "addressProofTypeId", "loanAmount", "loanTypeValue"
];

$(document).ajaxError(function(e, xhr, settings, exception) {
    if (exception == "timeout") {
            window.location = '/connection_timeout/';
        }
        if(xhr.status == 400){
            $.alert("Bad Request !!");
        }
        if(xhr.status == 404){
            window.location = '/page_not_found/';
        }
        if(xhr.status == 500) {
            window.location = '/server_error/';
        }
        if(xhr.status == 403) {
           window.location = '/permission_denied/';
        }
        if(xhr.status == 522) {
            window.location = '/connection_timeout/';
        }
        if(xhr.status == 503){
            window.location = '/service_unavailable/';
        }
});


function getGroupData(groupID, loanId) {
    var memId;
    var totalCount = 0;
    var penCount = 0;
    var appCount = 0;
    var rejCount = 0;
    var rewCount = 0;
    $("#groupMembersDropDown").empty();
    $("#comment").focus();
    $.ajax({
        url: '/getGroupData/' + groupID + '/' + loanId + '/'+taskName,
        dataType: 'json',
        beforeSend: function() {
            $("#loading").show();
        },
        complete: function() {
            $("#loading").hide();
        },
        success: function(data) {
            groupData = data;
            var activeMembersArr = [];

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
                            activeMembersArr.push(groupData["data"]["groupMemDetail"][i]["memberId"])
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
                        if (document.getElementById("groupMembersDropDown")) {
                            $("#groupMembersDropDown").append('<a id="' + memberId + '" onclick="getMemberDetails(' + memberId + ',' + groupId + ',' + loanId + ');tabControl();loadGroupRoles2('+groupId+','+ loanId+','+"'"+taskName+"'"+');" class="' + className + '" style="font-weight:bold;"> (' + groupData["data"]["groupMemDetail"][i]["sequenceNumber"] + ")  " + groupData["data"]["groupMemDetail"][i]["memberName"] + '</a>');
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
                    var membersCount = document.getElementById("groupMembersDropDown").getElementsByTagName("a").length;
                    var approvedCount = $('.Approved').length;
                    var rejectedCount = $('.Rejected').length;
                    updateMembersCount();
                    var totalCount = approvedCount + rejectedCount;
                    if (membersCount == totalCount) {
                        $("#operationsDivId").css("display", "none");
                        $("#groupApproveBtnIdQuery").css("display", "block");
                    }
                    if (activeMembersArr[0]) {
                        getMemberDetails(activeMembersArr[0], groupID, loanId);
                    } else {
                        getMemberDetails(memId, groupID, loanId);
                    }

                }
            }
             else {
                $.alert(groupData["message"]);
		        $("#loading").hide();
            }

        } ,

       		error: function (error) {
       		$("#loading").hide();
       	 		$.alert("Connection Time out");


              }
    });
    //getHistComments(processInstanceId);
    //getMemberComments(processInstanceId,loanId);
    //getGroupComments(processInstanceId,loanId);

}

function loadMasterData(taskName){
 if (taskName == "KYC Check" || taskName == "Proposal scrutiny" || taskName == "Query Response"  || taskName =="BM Reply" || taskName =="Resolve Credit Team Query") {
      setSelectOptionInForm()
     }
}



function getMemberDetails(memberId, groupId, loanId) {

    $("#operationsDivId").hide();
    $(".spanClearClass").text('');

    $("#defaultDisplay").show();
    $("#successPanel").hide();
    $("#comment").focus();
    $.ajax({
        url: '/getIndMemberData/' + memberId + '/' + groupId + '/' + loanId + '/' + taskName,
        dataType: 'json',
        beforeSend: function() {
            $("#loading").show();
		clearMemberData();
    		document.getElementById("formMembers").reset();
        },
        complete: function() {
            $("#loading").hide();
            if (document.getElementById("penCount").innerHTML != 0) {
                $("#operationsDivId").show();
            }
            // getMemberFSRData(memberId);
            //getPaymentHistory("member",memberId,groupId);
        },
        success: function(data) {
            if (data.code == "2019") {
                //console.log(data);
                MemberDatadisplay(data)
                highMarksList(data)
                DocumentDetails(data)
                conflictList(data)
                getMemberFSRData(memberId);
                getPaymentHistory("member", memberId, groupId);
                $("#loading").hide();
                $("#comment").focus();
            }
        },
        error: function(error) {
            $("#loading").hide();
            $.alert('Please try after sometime');
        }
    });
}

function MemberDatadisplay(data) {
    var memberData = data;
    if (memberData["data"]["memberDetails"]) {
        if (document.getElementById("previousLoanMemberCycle")) {
            var tagname = document.getElementById("previousLoanMemberCycle").tagName;
            if (tagname == "INPUT") {
                document.getElementById("previousLoanMemberCycle").value = memberData["data"]["previousLoanMemberCycle"];
            }
            if (tagname == "SPAN") {
                document.getElementById("previousLoanMemberCycle").innerHTML = memberData["data"]["previousLoanMemberCycle"];
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
        $("#loading").hide();
    }

    document.getElementById("groupId").innerHTML = groupId;
    document.getElementById("loanId").innerHTML = loanId;
    $("#comment").focus();




}




function highMarksList(data) {
    var memberData = data;
    if (memberData["data"]["highMarksList"]) {
        var conflictDataCreditEnquiry = memberData["data"]["highMarksList"];
        if (document.getElementById("CBStatus") && conflictDataCreditEnquiry[0]) {
            document.getElementById("CBStatus").innerHTML = conflictDataCreditEnquiry[0]["status"];
        }
        var memberDocumentDetails = memberData["data"]["memberDocumentDetails"];
        var memberOverlapLink = ''
        var docPath = ''
        var docId = ''
	 if(conflictDataCreditEnquiry.length == memberDocumentDetails.length){
		for (var j = 0; j < memberDocumentDetails.length; j++) {
			if (memberDocumentDetails[j]["documentType"] == "OVERLAPREPORT") {
            			docPath = memberDocumentDetails[j]["documentPath"];
             			docId = memberDocumentDetails[j]["docId"];
				conflictDataCreditEnquiry[j]["overLapReportURL"] = '<button type="button" class="btn btn-info btn-md btn-danger" onclick="window.open(' + "'" + docPath + "'" + "," + docId + "," + "config='width=500,height=500'" + ');return false;">View</button>';
			}
		}
	 }
	 else{
		for (var k = 0; k < conflictDataCreditEnquiry.length; k++) {
			for (var j = 0; j < memberDocumentDetails.length; j++) {

				if (memberDocumentDetails[j]["documentType"] == "OVERLAPREPORT") {
            				docPath = memberDocumentDetails[j]["documentPath"];
             				docId = memberDocumentDetails[j]["docId"];
					conflictDataCreditEnquiry[k]["overLapReportURL"] = '<button type="button" class="btn btn-info btn-md btn-danger" onclick="window.open(' + "'" + docPath + "'" + "," + docId + "," + "config='width=500,height=500'" + ');return false;">View</button>';
				}
			}
		}
	 }


       // memberOverlapLink = '<button type="button" class="btn btn-info btn-md btn-danger" onclick="window.open(' + "'" + docPath + "'" + "," + "'MemberOverlapWin'" + "," + "config='width=500,height=500'" + ');return false;">View</button>';
        if ($.fn.DataTable.isDataTable('#creditLoadData')) {
            $("#creditLoadData").dataTable().fnDestroy();
        }

        $('#creditLoadData').dataTable({
            "data": conflictDataCreditEnquiry,
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
                    "mData": "overLapReportURL",
                    "sTitle": "OverLap Report",
                    },
                {
                    "mData": "s_product_type",
                    "sTitle": "Product"
                },
                {
                    "mData": "status",
                    "sTitle": "Status"
                },
                {
                    "mData": "remarks",
                    "sTitle": "Remarks"
                },
                {
                    "mData": "hm_response_date",
                    "sTitle": "HM Response Date"
                },
                {
                    "mData": "existing_loan_limit",
                    "sTitle": "Existing Loan Limit"
                },
                {
                    "mData": "loan_amount_eligible",
                    "sTitle": "Loan Amount Eligible"
                },
                {
                    "mData": "no_of_mfi_eligible",
                    "sTitle": "MFI Eligible"
                },
                {
                    "mData": "name_of_mfi_1",
                    "sTitle": "MFI 1 Name"
                },
                {
                    "mData": "overdue_amount_1",
                    "sTitle": "Overdue_1"
                },
                {
                    "mData": "loan_amount_1",
                    "sTitle": "Loan Amount_1"
                },
                {
                    "mData": "balance_1",
                    "sTitle": "Balance_1"
                },
                {
                    "mData": "name_of_mfi_2",
                    "sTitle": "MFI 2 Name"
                },
                {
                    "mData": "overdue_amount_2",
                    "sTitle": "Overdue_2"
                },
                {
                    "mData": "loan_amount_2",
                    "sTitle": "Loan Amount_2"
                },
                {
                    "mData": "balance_2",
                    "sTitle": "Balance_2"
                },
                {
                    "mData": "name_of_mfi_3",
                    "sTitle": "MFI 3 Name"
                },
                {
                    "mData": "overdue_amount_3",
                    "sTitle": "Overdue_3"
                },
                {
                    "mData": "loan_amount_3",
                    "sTitle": "Loan Amount_3"
                },
                {
                    "mData": "balance_3",
                    "sTitle": "Balance_3"
                },
                {
                    "mData": "name_of_mfi_4",
                    "sTitle": "MFI 4 Name"
                },
                {
                    "mData": "overdue_amount_4",
                    "sTitle": "Overdue_4"
                },
                {
                    "mData": "loan_amount_4",
                    "sTitle": "Loan Amount_4"
                },
                {
                    "mData": "balance_4",
                    "sTitle": "Balance_4"
                }
            ],
        });
    }
}


function DocumentDetails(data) {
    var memberData = data;
    var imgFiles = ["MEMBERPHOTO", "IDPROOF", "IDPROOF_2", "ADDRESSPROOF", "ADDRESSPROOF_2", "SBACCOUNTPASSBOOK", "OVERLAPREPORT"];

    if (memberData["data"]["memberDocumentDetails"]) {
        if (memberData["data"]["memberDocumentDetails"][0]) {
            var memberDocumentsArray = memberData["data"]["memberDocumentDetails"];

            for (var key in memberDocumentsArray) {
                if ($.inArray(memberDocumentsArray[key]["documentType"], imgFiles) != -1) {
                    if (memberDocumentsArray[key]["documentType"]) {
                        if (memberDocumentsArray[key]["documentType"] == "OVERLAPREPORT") {
                            //$("#" + memberDocumentsArray[key]["documentType"] + "_docPath").attr('onClick', 'window.open(' + "'" + memberDocumentsArray[key]["documentPath"] + "'" + "," + memberDocumentsArray[key]["docId"] + "," + "config='width=500,height=500'" + ').focus();');
                        }
                        if (memberDocumentsArray[key]["documentPath"] == null || memberDocumentsArray[key]["documentPath"] == 'Not uploaded') {
                            $("#" + memberDocumentsArray[key]["documentType"] + "_docPath").css("display", "none");
                        } else {
                            $("#" + memberDocumentsArray[key]["documentType"] + "_docPath").css("display", "inline-block");
                            if (memberDocumentsArray[key]["documentType"] != "OVERLAPREPORT") {
                                $("#" + memberDocumentsArray[key]["documentType"] + "_docPath").addClass("img img-test");
                            }
                            $("#" + memberDocumentsArray[key]["documentType"] + "_docPath").attr("src", memberDocumentsArray[key]["documentPath"]);
                            $("#" + memberDocumentsArray[key]["documentType"] + "_docPath").attr("data-url", memberDocumentsArray[key]["documentPath"]);
                            $("#" + memberDocumentsArray[key]["documentType"] + "_docPath").attr("data-original", memberDocumentsArray[key]["documentPath"]);
                        }
                    }
                }
            }
        }
    }
}



function conflictList(data) {
    var conflictListArr = [];
    var memberData = data;

    if (memberData["data"]["conflictList"]) {
        var conflictData = memberData["data"]["conflictList"];
        if ($.fn.DataTable.isDataTable('#memberHistConflict')) {
            $("#memberHistConflict").dataTable().fnDestroy();
        }
        $('#memberHistConflict').dataTable({
            "data": conflictData,
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
    }
    if (group == "CMR" || group == "CLM" || group == "BM") {
        if (taskName == "Resolve Data Support Team Query") {
            validationType = "PRE";
            if (comment == "") {
                $("#comment").focus();
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
                $("#comment").focus();
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
            $("#comment").focus();
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

    var updateStatus = '';
    var faIcon = '';
    var fontColor = '';
    if (status == "Approved") {
        faIcon = 'check-circle';
        updateStatus = " approved";
        fontColor = "green";
    }
    if (status == "Rejected") {
        faIcon = 'times-circle';
        updateStatus = " rejected";
        fontColor = "darkred";
    }
    if (status == "Rework") {
        updateStatus = " sent for rework";
        fontColor = "darkgoldenrod";
    }

    $.ajax({
        url: '/updateMemValidationStatus/',
        type: 'post',
        dataType: 'json',
        beforeSend: function() {
            $("#loading").show();
        },
        complete: function() {
            triggerLoadFunc();
            $("#loading").hide();
        },
        success: function(data) {
            if (data["code"] == "2029") {
                $("#validationMessage").addClass("center");
                document.getElementById("validationMessage").innerHTML ='<span style="color:'+fontColor+' " class="bigger-50"> <i class="ace-icon fa fa-'+faIcon+' bigger-125"></i>&nbsp&nbsp'+"'"+ memberName +"'" + " has been " + updateStatus+'</span>';
                $("#defaultDisplay").hide();
                $("#successPanel").show();
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
    if (group == "CLM" || group == "BM" || group == "CMR") {
        validationType = "CLM";
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
        "sequenceNumber": sequenceNumber
    };

    dataObj['formData'] = dataDict;
    dataObj['memValData'] = memValData;
    dataObj['taskId'] = taskId;
    var updateStatus = '';
    var faIcon = '';
    var fontColor = '';

    if (status == "Rework") {
        updateStatus = " sent for Rework";
        faIcon = 'retweet';
        fontColor = "darkgoldenrod";
    }
    if (status == "Approved") {
        fontColor = "green";
        updateStatus = " approved";
        faIcon = 'check-circle';
    }
    if (status == "Rejected") {
        updateStatus = " rejected";
        fontColor = "darkred";
        faIcon = 'times-circle';
    }
    if (status == "Rework" || status == "Rejected") {
        if (comment == "") {
            $("#comment").focus();
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
            $("#loading").show();
        },
        complete: function() {
            triggerLoadFunc();
            $("#loading").hide();
        },
        success: function(data) {
            if (data["code"] == "2024") {
                $("#validationMessage").addClass("center");
               document.getElementById("validationMessage").innerHTML ='<span style="color:'+fontColor+'" class="bigger-50"> <i class="ace-icon fa fa-'+faIcon+' bigger-125"></i>&nbsp&nbsp'+"'"+ name +"'" + " has been " + updateStatus+'</span>';
               $("#defaultDisplay").hide();
                $("#successPanel").show();
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
                //getHistComments(processInstanceId);
                //getMemberComments(processInstanceId,loanId);
                //getGroupComments(processInstanceId,loanId);
                checkForTaskCompletion();
            } else {
                $.alert("Connection Time out");
            }
        },

        data: JSON.stringify(dataObj)
    });
}


function checkForTaskCompletion() {
    var membersCount = document.getElementById("groupMembersDropDown").getElementsByTagName("a").length;
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
        if(pendingCount >= 1){
            if(document.getElementById("gStatus") && document.getElementById("taskValBtn")){
                 document.getElementById("gStatus").innerHTML = '<h3  class="lighter center smaller">Task has not been completed yet!   <i class="ace-icon glyphicon glyphicon-thumbs-down bigger-125"></i> </h3>';
                 document.getElementById("taskValBtn").innerHTML = '<a href="#" onclick="loadNextMem();" class="btn btn-primary"> <i class="ace-icon fa fa-arrow-right"></i> Next Member </a>';
            }
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
            document.getElementById("gStatus").innerHTML = '';
            $.ajax({
                url: '/updateTask/',
                dataType: 'json',
                type: "post",
                beforeSend: function() {
                    $("#loading").show();
                },
                complete: function() {
                    triggerLoadFunc();
                    $("#loading").hide();
                },
                success: function(data) {
                    if (data == "Successful") {
                        document.getElementById("gStatus").innerHTML = '<h3  class="lighter center smaller">Task has been completed successfully!  <i class="ace-icon glyphicon glyphicon-thumbs-up bigger-150"></i> </h3>';
                        document.getElementById("taskValBtn").innerHTML = '<a href="/assignedTaskList/" class="btn btn-primary"> <i class="glyphicon glyphicon-user"></i> Go to My Tasks </a>'
                        $("#defaultDisplay").hide();
                        $("#successPanel").show();
                        // window.location = '/assignedTaskList/';
                    }
                },
                data: JSON.stringify(dataObj)
            });
        }
        else{
            document.getElementById("gStatus").innerHTML = '<h3  class="lighter center smaller">Task has not been completed yet!   <i class="ace-icon glyphicon glyphicon-thumbs-down bigger-125"></i> </h3>';
            document.getElementById("taskValBtn").innerHTML = '<a href="#" onclick="loadNextMem();" class="btn btn-primary"> <i class="ace-icon fa fa-arrow-right"></i> Next Member </a>';
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
    $.ajax({
        url: '/updateTask/',
        dataType: 'json',
        type: "post",
        beforeSend: function() {
            $("#loading").show();
        },
        complete: function() {
            $("#loading").hide();
        },
        success: function(data) {
            if (data == "Successful") {
                    document.getElementById("gStatus").innerHTML = '<h3  class="lighter center smaller">Task has been completed successfully!  <i class="ace-icon glyphicon glyphicon-thumbs-up bigger-150"></i> </h3>';
                    document.getElementById("taskValBtn").innerHTML = '<a href="/assignedTaskList/" class="btn btn-primary"> <i class="glyphicon glyphicon-user"></i> Go to My Tasks </a>'
                    $("#defaultDisplay").hide();
                    $("#successPanel").show();
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
                                docBtn = '<button type="button" class="btn btn-info btn-md btn-danger" onclick="window.open(' + "'" + docPath + "'" + "," + docId + "," + "config='width=500,height=500'" + ');return false;"+>View</button>';
                            }
                            else{
                                docBtn = '<button type="button" class="btn btn-info btn-md btn-danger"+>View</button>';
                            }
                        }
                    }
                    else {
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
             var table = $("#creditTableID").DataTable({
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
                "bDeferRender": true
            });

            //loadDataTable("#creditTableID");
        },
           error: function(error) {
            $("#loading").hide();
            $.alert('Please try after sometime');


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
        if (taskName == "Prepare Loan Documents" || taskName == "Print Loan Documents & FSR" || taskName == "Add New Members" || taskName == "Upload disbursement docs") {
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
         beforeSend: function() {
            $("#loading").show();
        },
        complete: function() {
            $("#loading").hide();
        },

        success: function(data) {
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





function loadGroupRoles2(groupId, loanId, taskName) {
    $("#comment").focus();
    var dataObj = {};
    var validationType = '';
    if (group == "CMR" || group == "CLM" || group == "BM") {
        if (taskName == "Prepare Loan Documents" || taskName == "Print Loan Documents & FSR" || taskName == "Add New Members" || taskName == "Upload disbursement docs") {
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
         beforeSend: function() {
            $("#loading").show();
        },
        complete: function() {
            $("#loading").hide();
        },

        success: function(data) {
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
            rmGroupMaster2(groupId);
        },
        data: JSON.stringify(dataObj)
    });
}




function updateTask(status) {
    var dataObj = {};
     if( document.getElementById("groupName_groupRole")){
    	var groupName = document.getElementById("groupName_groupRole").innerHTML;
    }
    if(document.getElementById("groupName")){
	var groupName = document.getElementById("groupName").innerHTML;
    }    dataObj["taskId"] = taskId;

    dataObj["processUpdate"] = {};
    $.ajax({
        url: '/updateTask/',
        dataType: 'json',
        type: "post",
        beforeSend: function() {
            $("#loading").show();
        },
        complete: function() {
            $("#loading").hide();
        },
        success: function(data) {
            if (data == "Successful") {
                $("#validationMessage").addClass("center");
                 document.getElementById("validationMessage").innerHTML ='<span style="color:green" " class="bigger-50"><i class="ace-icon fa fa-check-circle bigger-125"></i> &nbsp&nbsp'+"'"+ groupName +"'" + " has been approved"+'</span>';
                 document.getElementById("gStatus").innerHTML = '<h3  class="lighter center smaller">Task has been completed successfully!  <i class="ace-icon glyphicon glyphicon-thumbs-up bigger-150"></i> </h3>';
                 document.getElementById("taskValBtn").innerHTML = '<a href="/assignedTaskList/" class="btn btn-primary"> <i class="glyphicon glyphicon-user"></i> Go to My Tasks </a>';
                 $("#successPanel").show();
                 $("#defaultDisplay").hide();
                 $("#defaultDisplay1").hide();
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
                    $('<td>' + current + '</td><td>' + value.documentName + '</td><td> <button type="button" class="btn btn-danger" id = "' + value.docId + '" onclick="window.open(' + "'" + value.documentPath + "'" + "," + value.docId + "," + "config='width=500,height=500'" + ');return false;"><span class="glyphicon glyphicon-cloud-upload"></span> View  </button></td> ').appendTo(tr);
                    tr.appendTo('#docments_table');
                });
            } else {
                document.getElementById('docments_table').innerHTML = "No documents uploaded";
                $('#nodata2').css("display", "block");
            }
            loadDataTable("#docments_table");
        }
    });
}




function updateGroupMemberStatus() {
    var validationType = ''
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

    var dataObj = {};
    dataObj["groupValData"] = groupValData;
    var responseData;
    return $.ajax({
            url: '/updateGroupMemberStatus/',
            dataType: 'json',
            async : false,
            type: "post",
            beforeSend: function() {
                $("#loading").show();
            },
            complete: function() {
                triggerLoadFunc();
                $("#loading").hide();
            },
            success: function(data) {
                if (data.code == '2024') {

                    $.alert("Member roles have been updated successfully");
                    return "Success";
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

                for (var i = 0; i < creditData.data.loanMemberDetails.length; i++) {
                    var creditObj = creditData["data"]["loanMemberDetails"][i];
                    var newMem = "";
                    var tdColor = '';

                    if (creditObj["newMember"] == true) {
                        tdColor = "green";
                        newMem = "Yes";
                    }
                    if (creditObj["newMember"] == false) {
                        tdColor = "red";
                        newMem = "No";
                    }
                    if(creditObj["atlDebt"] == null){
                        creditObj["atlDebt"] = 0;
                    }
                    htmlContent += '<tr>'
                        +
                        '<td>' + creditObj["sequenceNumber"] + '</td><td>' +
                        creditObj["appMemId"] + '</td><td style="font-weight:bold;color:'+tdColor+'">' +
                        newMem + '</td><td>' +
                        creditObj["memberName"] + '</td><td>' +
                        creditObj["sbAccountNo"] + '</td><td>' +
                        creditObj["bankName"] + '</td><td>' +
                        creditObj["previousLoanAmount"] + '</td><td>'

                        +
                        ' <input  onkeypress="validate(event,2)"  id="' + creditObj["memberId"] + "_loanAmt" + '" onblur="validateFields(this.id,this.value,' + "'" + 'loanAmount' + "'" + ');" maxlength=10 type="text" name="m2street_' + i + '" class="sample5"  value=' + creditObj["loanAmount"] + '></td><td>' +
                        ' <input onkeypress="validate(event,2)" maxlength=7 type="text" style="width: 45px;" class="sample5" name="m2street_' + creditObj["memberId"] + '" value=' + creditObj["awb"] + '></td><td>' +
                        ' <input onkeypress="validate(event,2)" maxlength=7 type="text" style="width: 45px;" class="sample5" name="m2street_' + creditObj["memberId"] + '" value=' + creditObj["sellingPrice"] + '></td><td>' +
                         creditObj["atlDebt"]+ '</td><td>'

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
                        ' <input type="text" name="atlDebt_' + i + '" value=' +creditObj["sundryDebt"] + '></td><td style="display:none">' +
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
                        ' <input type="text" id="atlLoanId_'+creditObj["memberId"]+'" name="atlLoanId' + i + '" value=' + creditObj["atLloanId"] + '></td><td style="display:none">' +
                        ' <input type="text" id="atlAccNo_'+creditObj["memberId"]+'" name="atlAcc' + i + '" value=' + creditObj["atlLoanAccountNumber"] + '></td>'

                        +
                        '</tr>';
                }
            }
            document.getElementById("loandata").innerHTML = htmlContent;

            for (var key in loanDetails) {
                if (document.getElementById(key)) {
                    document.getElementById(key).innerHTML = loanDetails[key];
                    if (document.getElementById(key + "1")) {
                        document.getElementById(key + "1").innerHTML = loanDetails[key];
                    }
                }
            }
            loadDataTable("#paymentTable");

        },
    });
}


function loadDataTable(id) {
    var table = $(id).DataTable({
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
        "bDeferRender": true

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
    var atlLoanId = '';
    var atlAccNo = '';
    var updateloanData = eval(updateloanData);

    for(var key in updateloanData){

        if(updateloanData[key]["atlLoanId"] != null){
            atlLoanId = updateloanData[key]["atlLoanId"];
            atlAccNo  = updateloanData[key]["atlAccNo"];
        }
    }

    var uploadData2 = {
        "loanId": String(loanId),
        "installments": installment,
        "userId": userId,
        "groupId" : groupId,
        "atlLoanId" :atlLoanId,
        "atlAccNo" : atlAccNo,
        "memberLoanDetails": eval(updateloanData),
    }
   /* var uploadData2 = {
        "loanId": String(loanId),
        "installments": installment,
        "memberLoanDetails": eval(updateloanData),
        "userId": userId
    }*/
    dataObj3["uploadData"] = uploadData2;
	console.log(dataObj3);
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


function approveLoan(updateloanData){
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
    var atlLoanId = '';
    var atlAccNo = '';
    var updateloanData = eval(updateloanData);
    for(var key in updateloanData){
        if(updateloanData[key]["atlLoanId"] != null){
            atlLoanId = updateloanData[key]["atlLoanId"];
            atlAccNo  = updateloanData[key]["atlAccNo"];
        }
    }
    var loanData = {
        "atlLoanId" :atlLoanId,
        "atlAccNo" : atlAccNo,
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
    //return false;
    $.ajax({
        url: '/approveLoan/',
        dataType: 'json',
        type: "POST",
        contentType: "application/json; charset=utf-8",
        beforeSend: function() {
            $("#loading").show();
        },
        complete: function() {
            $("#loading").hide();
        },
        success: function(data) {
            if (data.code == "2043") {
                $.alert("Loan has been approved");
                $("#defaultDisplay").hide();
                $("#loanDetailsId").hide();
                $("#loanAccNoPanelId").show();
                document.getElementById("loanGroupId").innerHTML = appGroupId;
                document.getElementById("loanGroupName").innerHTML = groupName;
                document.getElementById("loanGroupType").innerHTML = loanTypeName;
                document.getElementById("loanAccountNumberId").innerHTML = '<span style="color:green" class="bigger-125"> Loan Account Number : '+data["data"]["loanAccountNumber"]+'</span>';
                //document.getElementById("funder").innerHTML = '<b><i><span style="color:green"  class="bigger-100">Fund Info : '+data["data"]["funderResultMgs"].split("&#8377;").join("Rs")+'</span></i></b>';
                document.getElementById("funder").innerHTML = '<b><i><span style="color:green"  class="bigger-100">Fund Info : '+data["data"]["funderResultMgs"].split("&#8377;").join("Rs")+'</span></i></b>';
                document.getElementById("resultBtnId").innerHTML = '<a href="/assignedTaskList/" class="btn btn-primary"> <i class="glyphicon glyphicon-user"></i> Go to My Tasks </a>';
            }
            if (data.code == "2034") {
                $("#defaultDisplay").hide();
                $("#loanDetailsId").hide();
                $("#loanAccNoPanelId").show();
                document.getElementById("loanGroupId").innerHTML = appGroupId;
                document.getElementById("loanGroupName").innerHTML = groupName;
                document.getElementById("loanGroupType").innerHTML = loanTypeName;
                document.getElementById("loanAccountNumberId").innerHTML = '<span style="color:#BE2625" class="bigger-125"> Loan has not been approved yet <i class="ace-icon glyphicon glyphicon-thumbs-down bigger-125"></i></span>';
                document.getElementById("funder").innerHTML = '<b><i><span style="color:#BE2625"  class="bigger-100">Fund Info : '+data["data"]["funderResultMgs"].split("&#8377;").join("Rs")+'</span></i></b>';
                document.getElementById("resultBtnId").innerHTML = '<a href="javascript:history.back()" class="btn btn-primary"><i class="ace-icon fa fa-arrow-left"></i> Go Back </a>';
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

    return ((k >= 63 && k <= 91) || (k >= 97 && k < 123) || (k >= 93 && k < 96) || k == 8 || k == 32 || k == 33 || (k >= 40 && k <= 59) || k == 61 || (k >= 35 && k <= 38));
}

function tabControl() {
    $("#tab1").addClass("active");
    $("#tab2").removeClass("active");
    $("#tab3").removeClass("active");
    $("#tab4").removeClass("active");
    $("#tab5").removeClass("active");
    $("#tab6").removeClass("active");
    $("#tab7").removeClass("active");
}

function updateMembersCount() {
    var membersCount = document.getElementById("groupMembersDropDown").getElementsByTagName("a").length;
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


function rmGroupMaster2(groupId) {
    $.ajax({
        url: '/getGroupData/' + groupId + '/' + loanId + '/'+ taskName,
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


                //alert(rep2value);
                if (document.getElementById("Animator")) {
                    if ($("#Animator option[value=" + animatorvalue + "]").length == 0) {
                        $("#Animator").val();
                    } else {
                        $("#Animator").val(animatorvalue);
                    }
                }
                if (document.getElementById("repm1")) {
                    if ($("#repm1 option[value=" + rep1value + "]").length == 0) {
                        $("#repm1").val();
                    } else {
                        $("#repm1").val(rep1value);
                    }
                }
                if (document.getElementById("repm2")) {
                    if ($("#repm2 option[value=" + rep2value + "]").length == 0) {
                        $("#repm2").val();
                    } else {
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


            }
        },

        error: function (error) {
       		$("#loading").hide();
       	 	$.alert("Please try after sometime");
            }
    });
}


function rmGroupMaster(groupId) {
    var url= '';
    if(taskName == "Add New Members"){
	url = '/getAddNewMemTaskInfo/' + groupId + '/' + loanId + '/'+ processInstanceId;
    }
    else{
   	url =  '/getGroupData/' + groupId + '/' + loanId + '/'+ taskName;
   }

    $.ajax({
        url: url,
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
        		var activeCount = $.grep(groupViewData2.data.groupMemDetail, function(v) {
                    return v.memberStatus == "Active";
                });
		        var appCount = $.grep(groupViewData2.data.groupMemDetail, function(v) {
                    return v.memberStatus == "Approved";
                });
                var rejCount = $.grep(groupViewData2.data.groupMemDetail, function(v) {
                    return v.memberStatus == "Rejected";
                });
                if(document.getElementById("totCount")){
                    document.getElementById("totCount").innerHTML = groupData.length;
                }
                if(document.getElementById("eligibleCount")){
                    document.getElementById("eligibleCount").innerHTML = appCount.length;
                }
                if(document.getElementById("rejectedCount")){
                    document.getElementById("rejectedCount").innerHTML = rejCount.length;
                }
		  if(document.getElementById("newMemCount")){
                    document.getElementById("newMemCount").innerHTML = activeCount.length;
                }

                if(document.getElementById("minimumrem")){
                    document.getElementById("minimumrem").innerHTML = 10 - (appCount.length+activeCount.length);
                }
                $.each(found_names, function(key, value) {
                    $('#Animator').append('<option value="' + value.memberId + '">' + value.memberName + '</option>');
                    $('#repm1').append('<option value="' + value.memberId + '">' + value.memberName + '</option>');
                    $('#repm2').append('<option value="' + value.memberId + '">' + value.memberName + '</option>');
                });

                var animatorvalue = $("#animatorId_groupRole").text();
                var rep1value = $("#rep1Id_groupRole").text();
                var rep2value = $("#rep2Id_groupRole").text();
                if (document.getElementById("Animator")) {
                    if ($("#Animator option[value=" + animatorvalue + "]").length == 0) {
                        $("#Animator").val();
                    } else {
                        $("#Animator").val(animatorvalue);
                    }
                }
                if (document.getElementById("repm1")) {
                    if ($("#repm1 option[value=" + rep1value + "]").length == 0) {
                        $("#repm1").val();
                    } else {
                        $("#repm1").val(rep1value);
                    }
                }
                if (document.getElementById("repm2")) {
                    if ($("#repm2 option[value=" + rep2value + "]").length == 0) {
                        $("#repm2").val();
                    } else {
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
                for (var i=0;i<groupData.length;i++){
                    if(groupData[i]["memberStatus"] == "Active"){
                        groupData[i]["memberStatus"] = '<span style="color:dodgerblue;font-weight:bold;">Pending/Newly added</span>';
                        groupData[i]["memberName"] = '<span style="color:dodgerblue;font-weight:bold;">'+groupData[i]["memberName"]+'</span>';
                        groupData[i]["appMemberId"] = '<span style="color:dodgerblue;font-weight:bold;">'+groupData[i]["appMemberId"]+'</span>';
                    }
                    if(groupData[i]["memberStatus"] == "Approved"){
                        groupData[i]["memberStatus"] = '<span style="color:green;font-weight:bold;">Approved</span>';
                        groupData[i]["memberName"] = '<span style="color:green;font-weight:bold;">'+groupData[i]["memberName"]+'</span>';
                        groupData[i]["appMemberId"] = '<span style="color:green;font-weight:bold;">'+groupData[i]["appMemberId"]+'</span>';
                    }

                    if(groupData[i]["memberStatus"] == "Rejected"){
                        groupData[i]["memberStatus"] = '<span style="color:red;font-weight:bold;">Rejected</span>';
                        groupData[i]["memberName"] = '<span style="color:red;font-weight:bold;">'+groupData[i]["memberName"]+'</span>';
                        groupData[i]["appMemberId"] = '<span style="color:red;font-weight:bold;">'+groupData[i]["appMemberId"]+'</span>';
                    }
                    if(groupData[i]["memberStatus"] == "Rework"){
                        groupData[i]["memberStatus"] = '<span style="color:darkgoldenrod;font-weight:bold;">Rework</span>';
                        groupData[i]["memberName"] = '<span style="color:darkgoldenrod;font-weight:bold;">'+groupData[i]["memberName"]+'</span>';
                        groupData[i]["appMemberId"] = '<span style="color:darkgoldenrod;font-weight:bold;">'+groupData[i]["appMemberId"]+'</span>';
                    }
                }
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
                                "sWidth": "20%",
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
                                "sWidth": "25%",
                                className: "column"
                            },
                            {
                                "mData": "villageName",
                                "sTitle": "Village",
                                "sWidth": "15%",
                                className: "column"
                            },
                            {
                                "mData": "pincode",
                                "sTitle": "Pincode",
                                "sWidth": "8%",
                                className: "column"
                            },
				{
                                "mData": "memberStatus",
                                "sTitle": "Validation Status",
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


function validateFields(id, val, fieldName) {
    if (fieldName == "age" && val < 18) {
        $("#" + id).css('background-color', '#FEEFB3');
        $("#" + id).css('color', 'black');
        setInterval(function() {
            document.getElementById(id).style.background = "white";
        }, 20000);
        $.alert("Age should be above 18 !");
        return false;
    }
    if (fieldName == "mobileNumber" && val.length < 10) {
        $("#" + id).css('background-color', '#FEEFB3');
        $("#" + id).css('color', 'black');
        setInterval(function() {
            document.getElementById(id).style.background = "white";
        }, 20000);
        $.alert("Please enter valid mobile number !");
        return false;
    }
    if (fieldName == "loanAmount") {
        if (Math.round(val) == 0) {
            $("#" + id).css('background-color', '#FEEFB3');
            $("#" + id).css('color', 'black');
            setInterval(function() {
                document.getElementById(id).style.background = "white";
            }, 20000);
            $.alert("Please enter valid amount !");
            return false;
        }
    }

}


function updateGroupValStatus(status) {
    var flag  = 0;
    var validationType = '';
    var comment = '';
    var processUpdate;
    var dataObj = {};
    if (document.getElementById("comment")) {
        comment = document.getElementById("comment").value;
    }
    var loanTypeId = document.getElementById("loanTypeId1").innerHTML;
    var groupName = '';
    if(document.getElementById("groupName")){
        groupName = document.getElementById("groupName").innerHTML;
    }

    if(document.getElementById("groupName_groupRole")){
        groupName = document.getElementById("groupName_groupRole").innerHTML;
    }
    var fontColor = '';
    var fontIcon = '';
    var updateStatus = '';
    var proStatus = '';
    if (status == "Rejected") {
        fontIcon = 'times-circle';
        updateStatus = "rejected";
        fontColor = "darkred";
        if (comment == "") {
            $("#comment").focus();
            $.alert("Please input comment");
            return false;
        }
    }
    if(status == "Approved"){
        fontColor = "green";
        updateStatus = "approved";
        fontIcon = 'check-circle';
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
        showConfirmBox(status);
    }
    if (group == "CreditTeam") {
        validationType = "POST";
        if(taskName == "Proposal scrutiny" || taskName == "BM Reply"){
            processUpdate = {
                'variables': {
                    'chekcbrespdate': {
                        'value': "CBApproved"
                    },
                }
            };
            dataObj["processUpdate"] = processUpdate;
            showConfirmBox(status);
        }
        if(taskName == "Approve Loan"){
            processUpdate = {
                'variables': {
                    'groupinstance': {
                        'value': 'creditrejected'
                    },
                }
            };
            dataObj["processUpdate"] = processUpdate;
            $.confirm({
            title: 'Do you really want to reject the loan?',
            confirmButton: 'Yes',
            cancelButton: 'No',
            confirm: function(){
                validateAndUpdateGroupTask();
            },
            cancel: function(){
            }
        });
        }
    }

    if (group == "CMR" || group == "CLM" || group == "BM") {
	if (taskName == "Conduct BAT- Member approval in CRM"){
		updateTask("Approved");
	}
        if (taskName == "Upload loan documents in Web application") {
            validationType = "CLMAPPROVAL";
            showConfirmBox(status);
        }
        if (taskName == "Prepare Loan Documents" || taskName == "Print Loan Documents & FSR" ) {
            validationType = "PRE";
            if (!document.getElementById("Animator").value || !document.getElementById("repm1").value || !document.getElementById("repm2").value) {
                $.alert("Please update group roles before task completion!");
                return false;
            } else {
                var resp = updateGroupMemberStatus().done(function(result) { if(result.code == 2024)
                {
                    $( ".confirmBtn" ).click();
                    showConfirmBox(status);
                }
                }).fail(function() {  flag = 0; });
            }
        }
        if(taskName == "Add New Members"){
            if(status == "Approved"){
                proStatus = "bmapproved";
                $.ajax({
                    url : '/LoanActiveMemberCount/'+loanId,
                    async: false,
                    dataType: 'json',
                    success: function(data){
                        var jsondata=data;
                        var ActiveMembercount=jsondata.data.loanActiveMemberCount;


                          if( (ActiveMembercount<10)  && (loanTypeId=="1" ||  loanTypeId=="2") )
                {
                    var AddMember= 10- ActiveMembercount;

                    $.alert('You need to Add  ' + AddMember + ' more Members to approve this Group');
                    return false;




                }

                else
                {
                   validationType = "PEN";
		     proStatus = "bmapproved";
                   showConfirmBox(status);
                }

                    }
                });




            }
            if(status == "Rejected"){
                validationType = "CLMAPPROVAL";
                proStatus = "bmrejected";
                showConfirmBox(status);
            }
            processUpdate = {
                'variables': {
                    'groupinstance': {
                        'value': proStatus
                    },
                }
            };
            dataObj["processUpdate"] = processUpdate;

        }
    }
    if (group == "RM" || group == "rm") {
        validationType = "POST";
        if(status == "Approved"){
            proStatus = "rmapproved";
            if (!document.getElementById("Animator").value || !document.getElementById("repm1").value || !document.getElementById("repm2").value) {
                $.alert("Please update group roles before task completion!");
                return false;
            }
            else {
                var resp = updateGroupMemberStatus().done(function(result) { if(result.code == 2024){
                       $( ".confirmBtn" ).click();
                       showConfirmBox(status);
                }  }).fail(function() {  flag = 0; });
            }
        }
        if(status == "Rejected"){
            proStatus = "rmrejected";
            showConfirmBox(status);
        }
        processUpdate = {
            'variables': {
                'groupinstance': {
                    'value': proStatus
                },
            }
        };
        dataObj["processUpdate"] = processUpdate;
    }
    if(flag == 1){
        validateAndUpdateGroupTask();
    }
    function validateAndUpdateGroupTask(){
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
                $("#loading").show();
            },
            complete: function() {
                triggerLoadFunc();
                $("#loading").hide();
            },
            success: function(data) {
                if (data == "Successful") {
                     $("#validationMessage").addClass("center");
                     document.getElementById("validationMessage").innerHTML ='<span style="color:'+fontColor+'" " class="bigger-50"><i class="ace-icon fa fa-'+fontIcon+' bigger-125"></i> &nbsp&nbsp'+"'"+ groupName +"'" + " has been "+updateStatus+'</span>';
                     document.getElementById("gStatus").innerHTML = '<h3  class="lighter center smaller">Task has been completed successfully!  <i class="ace-icon glyphicon glyphicon-thumbs-up bigger-150"></i> </h3>';
                     document.getElementById("taskValBtn").innerHTML = '<a href="/assignedTaskList/" class="btn btn-primary"> <i class="glyphicon glyphicon-user"></i> Go to My Tasks </a>';
                     $("#successPanel").show();
                     $("#defaultDisplay").hide();
                     $("#loanAccNoPanelId").hide();
                     $("#loanDetailsId").hide();
                }
            },
            data: JSON.stringify(dataObj)
        });
    }
    function showConfirmBox(status){
        var statusKey = '';
        if(status == "Approved"){
            statusKey = ' approve ';
        }
        if(status == "Rejected"){
            statusKey = ' reject ';
        }
        $.confirm({
            title: 'Do you really want to '+statusKey+'the group?',
            confirmButton: 'Yes',
            cancelButton: 'No',
            confirm: function(){
                validateAndUpdateGroupTask();
            },
            cancel: function(){
            }
        });
    }
}
function showConfirmBox(status){
        $.confirm({
            title: 'Do you really want to approve the group?',
            confirmButton: 'Yes',
            cancelButton: 'No',
            confirm: function(){
                updateTask(status);
            },
            cancel: function(){
            }
        });
    }




function getMemberFSRData(memberId){
    $.ajax({
        url: '/getMemberFSR/' + memberId,
        dataType: 'json',
        success: function(data) {
            var childRowHtml = '';
            childRowHtml = '<thead><td><b>Field Name</b></td><td><b>Actual Value</b></td></thead>';
            var fsrData = data;
            var formSectionData = [];
            var fsrDataJsonStr = fsrData.data;
            if(fsrDataJsonStr == null){
                childRowHtml +=
                    '<tr>'+
                        '<td colspan="2">' + 'No Data' + '</td>'
                    '</tr>';
            }
            else{
                var fsrDataJson = JSON.parse(fsrDataJsonStr);

                formSectionData = fsrDataJson.form_sections;
                var irrelevantDataArr = ["Official Details","Signature","CMR/BM/CLM confirmation after screening"];
                for(var key in formSectionData){
                    var sectionName = formSectionData[key]["section_name"]
                    var sectionFields = formSectionData[key]["section_fields"];
                    if ($.inArray(sectionName, irrelevantDataArr) == -1) {
                        childRowHtml += '<th colspan="2" style="color:darkblue;background-color:aliceblue;">'+sectionName+'</th>';

                        $.each(sectionFields , function (index, item){
                            var fieldValue = '';
                            if(item.value == undefined){
                                fieldValue = "";
                            }
                            else{
                                fieldValue = item.value;
                            }
                          childRowHtml +=
                            '<tr>'+
                                '<td style="width:60%">' + item.label + '</td>'+
                                '<td style="width:40%">' + fieldValue + '</td>'+
                            '</tr>';
                        });
                    }
                }
            }
            if(document.getElementById("fsrLoadData")){
                 document.getElementById("fsrLoadData").innerHTML = childRowHtml;
            }

        },

    error: function (error) {
       		$("#loading").hide();
       	 	$.alert("Please try after sometime");
      }
   });
}
function getMemberComments(processInstanceId, loanId) {
    var commentsHtml = '';
    $('#profile-feed-1').html('');
    $("#ajax_loader1").show();
    $.ajax({
        url: '/getMemberComments/' + processInstanceId + '/' + loanId,
        dataType: 'json',
         beforeSend: function() {
            $("#ajax_loader1").show();
            $("#widget-body-1").addClass("widget-box-overlay");
        },
        complete: function() {
            $("#ajax_loader1").hide();
            $("#widget-body-1").removeClass("widget-box-overlay");
        },

        success: function(data) {
            var commentData = data;
            if(commentData.data.length>0) {
                $.each(commentData.data, function(key, value) {
                    var count=0;
                    for (var i=0; i< value.comments.length;i++)
                    {
                        if(value.comments[i].comments !=""){
                            count ++;
                        }
                    }
                    if(count>0){
                        commentsHtml += '<div ><i class="fa fa-user fa-2" aria-hidden="true"></i> &nbsp<span style="font-size:12px;color:darkblue;"><b>' + value.memberName + ' (' + value.memberId + ' ) </b> <span> </div>';
                    }
                    $.each(value.comments, function(index, val) {

                        if (val.comments != "") {
                            commentsHtml += '' +
                                '<div class="profile-activity clearfix"><div><span style="font-weight:bold; font-size:11px;color:#981b1b;">' +
                                '' + val.userName + ':</span> ' +
                                '&nbsp&nbsp<span style="color:black;,font-size:11px; ">' + val.taskName + '</span>' +
                                '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span style="font-style:italic;"><br>' +
                                '<i class="fa fa-comments" style="color:darkslategrey;" aria-hidden="true"></i>&nbsp<b>' + val.comments +
                                '</b></span> <div class="time"><i class="ace-icon fa fa-clock-o bigger-110"></i><span > &nbsp&nbsp' +
                                val.validatedDate + '</span></div></div></div>';
                        }
                    });
                });
            }
            else
            {
                 commentsHtml += 'No Comments';
            }
            $('#profile-feed-1').html(commentsHtml);
        } //success part end
    });
}


function getGroupComments(processInstanceId, loanId) {
    var commentsHtml = '';
    $('#profile-feed-2').html('');
    $("#ajax_loader2").show();
    $.ajax({
        url: '/getGroupComments/' + processInstanceId + '/' + loanId,
        dataType: 'json',
        beforeSend: function() {
          $("#ajax_loader2").show();
          $("#widget-body-2").addClass("widget-box-overlay");
        },
        complete: function() {
           $("#ajax_loader2").hide();
           $("#widget-body-2").removeClass("widget-box-overlay");
        },
        success: function(data) {
            var jsondata = data;

            if(jsondata.data[0]){
                if (jsondata.data[0].comments.length>0) {
                    var groupName = jsondata.data[0].groupName;
                    var appGroupId = jsondata.data[0].appGroupId;
                    var groupId = jsondata.data[0].groupId;
                    commentsHtml += '<div style="font-size:12px; font-weight:bold;color:darkslategrey;"><i class="fa fa-user fa-3" aria-hidden="true"></i> &nbsp<span style="font-size:13px;color:darkblue; align:center"><b>' + groupName + '</b></span> </div>';
                    $.each(jsondata.data[0].comments, function(key, value) {
                        if (value.comments != "") {
                            commentsHtml += '' +
                            '<div class="profile-activity clearfix"><div><span style="font-weight:bold; font-size:11px;color:#981b1b;"><b>' +
                                '' + value.userName + '</b>:</span> ' +
                                '<span style="color:black;,font-size:8px; "><b>' + value.taskName + '<b></span>' +
                                '<span style="font-style:italic;"><br>' +
                                '<i class="fa fa-comments" style="color:darkslategrey;" aria-hidden="true"></i>&nbsp<b>' + value.comments +
                                '</b></span> <div class="time"><i class="ace-icon fa fa-clock-o bigger-110"></i><span > &nbsp&nbsp' +
                                value.validatedDate + '</span></div></div></div>';
                        }
                    });
                }
            }
            else
            {
                 commentsHtml += 'No Comments';
            }
            $('#profile-feed-2').html(commentsHtml);
        } //success part end
    });
}
function loadNextMem(){
    $('.spanClearClass').text('');
    clearMemberData();
    document.getElementById("formMembers").reset();
    
    getGroupData(groupId,loanId);
    loadGroupRoles2(groupId, loanId, taskName) ;
    $("#comment").focus();
}

function getPaymentHistory(key,memberId,groupId){
    var url = '';
    if(key == "member"){
        url = '/getLoanMemberPaymentHistory/' + memberId + '/' + groupId;
    }
    if(key == "group"){
        url = '/getLoanGroupPaymentHistory/'+groupId;
    }
    $.ajax({
        url: url,
        type: 'post',
        dataType: 'json',
        success: function(data) {

            var paymentHisData = data;
            var paymentHisLoanData = paymentHisData.data;

            var paymentHistoryData = [];
            if(!$.isArray(paymentHisLoanData) || !paymentHisLoanData.length){

            }else{
                var memberPaymentHistoryData = paymentHisLoanData[0];
                paymentHistoryData = memberPaymentHistoryData.paymentHistory;
            }
            $('#paymentHistoryLoadData').dataTable({
            "data": paymentHistoryData,
            "bDestroy": true,
            "bJQueryUI": false,
            "bProcessing": true,
            "bSort": true,
            "bInfo": true,
            "bPaginate": false,
            "iDisplayLength": 10,
            "bSortClasses": false,
            "bAutoWidth": false,
            "searching" :false,
            "sDom": '<"top">rt<"bottom"flp><"clear">',
            "bDeferRender": true,
            "aoColumns": [
                { "mData": "appMemberId", "sTitle": "App MemberId"},
                { "mData": "loanAccNo","sTitle": "Loan Account Number"},
                { "mData": "demand","sTitle": "Demand"},
                { "mData": "balance","sTitle": "Balance"},
                { "mData": "arrears","sTitle": "Arrears"},
                ]
            });
        },
         error: function (error) {
       		$("#loading").hide();
       	 	$.alert("Please try after sometime");
            }

    });
}

function clearMemberData() {
   $('#Animator').empty();
   $('#repm1').empty();
   $('#repm2').empty();

   $("#ADDRESSPROOF_docPath").css("display", "none");
   $("#ADDRESSPROOF_docPath").attr("src","");

   $("#ADDRESSPROOF_docPath").attr("data-original", "");
   $("#ADDRESSPROOF_2_docPath").css("display", "none");
   $("#ADDRESSPROOF_2_docPath").attr("src","");

   $("#ADDRESSPROOF_2_docPath").attr("data-original", "");
   $("#SBACCOUNTPASSBOOK_docPath").css("display", "none");
   $("#SBACCOUNTPASSBOOK_docPath").attr("src","");

   $("#SBACCOUNTPASSBOOK_docPath").attr("data-original", "");
   $("#IDPROOF_2_docPath").css("display", "none");
   $("#IDPROOF_2_docPath").attr("src","");

   $("#IDPROOF_2_docPath").attr("data-original", "");
   $("#MEMBERPHOTO_docPath").css("display", "none");
   $("#MEMBERPHOTO_docPath").attr("src","");

   $("#MEMBERPHOTO_docPath").attr("data-original", "");
   $("#IDPROOF_docPath").css("display", "none");
   $("#IDPROOF_docPath").attr("src","");

   $("#IDPROOF_docPath").attr("data-original","");
   $("#OverLapReport_docPath").css("display", "none");
   $("#OverLapReport_docPath").attr("src","");

   $("#OverLapReport_docPath").attr("data-original", "");
}

function reloadComments(id) {
    if(id == 1){
         getMemberComments(processInstanceId,loanId);
    }
    if(id == 2){
        getGroupComments(processInstanceId,loanId);
    }
}

function generateLOS(){
    var loanAccNo = document.getElementById("loanAccountNumber").innerHTML;
    var dataObj = {};
    var losGenerationData = {
        "loanAccountNo" : loanAccNo,
        "userId"    : userId,
        "userName" : userName,
        "officeId":  0,
        "officeTypeId": 0
    };
    dataObj["losData"] = losGenerationData;
    $.ajax({
        url: '/generateLOS/',
        dataType: 'json',
        type : "POST",
        contentType: "application/json; charset=utf-8",
        beforeSend: function() {
            $("#loading").show();
        },
        complete: function() {
            $("#loading").hide();
        },
        success: function(data) {
            if(data["code"] == "11000"){
                if( data["data"]["fileContent"]){
                    var sampleArr = base64ToArrayBuffer(data["data"]["fileContent"]);
                    saveByteArray(data["data"]["fileName"], sampleArr);
                }
            }
            if(data["code"] == "11001"){
		  //$.alert(data["message"]);
                $.alert(data.data.message[0]);
            }
        },
        data: JSON.stringify(dataObj)
    });

}
function base64ToArrayBuffer(base64) {
    var binaryString = window.atob(base64);
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
       var ascii = binaryString.charCodeAt(i);
       bytes[i] = ascii;
    }
    return bytes;
 }
 function saveByteArray(reportName, byte) {
    var blob = new Blob([byte]);
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    var fileName = reportName;
    link.download = fileName;
    link.click();
};



function loadDisburseDocData(){
    var disbDocData;
    $.ajax({
        url : '/disburseDocsData/'+loanId,
        async: false,
        dataType: 'json',
        success: function(data){
            if(data["data"][0]){
                disbDocData =  data["data"];
            }
        }
    });
    console.log(disbDocData);
    $('.date-picker').datepicker({
            autoclose: true,
            todayHighlight: true,
            minDate : new Date(disbDocData[0]["loanApprovalDate"])
        })
        //show datepicker when clicking on the icon
        .next().on(ace.click_event, function(){
            $(this).prev().focus();
        });
	var html = '<tr>';
	var innerHTMLBank = '';
	var selectOptValArray = [];
    $.ajax({
        url	:  '/masterDataBank/',
        async: false,
        type	: 'post',
        dataType: 'json',
        success	: function (bankData) {
            if(bankData["data"][0]){
                keyValueMasterBankArray = bankData["data"].sort(function(a, b){ var a1= a.bankName, b1= b.bankName;    if(a1== b1) return 0;    return a1> b1? 1: -1; })
                innerHTMLBank += '<option value="null" > Select Bank </option>';
                for(var i = 0; i < Object.keys(keyValueMasterBankArray).length ; i++){
                        innerHTMLBank += '<option value="'+keyValueMasterBankArray[i].bankCode+'">'+keyValueMasterBankArray[i].bankCode+'</option>'
                }
            }
        }
    });

    var innerHTMLModeOfPayment = '<option value="null" > Select Payment Mode</option><option value="Cheque"> Cheque </option>'+
                                 '<option value="Fund Transfer"> Fund Transfer </option><option value="Prepaid Card"> Prepaid Card </option>';

    var innerHTMLMemAvailLoan = '<option value="null" > Select</option><option value="true"> Yes </option><option value="false"> No </option>';


    if(disbDocData && disbDocData[0]){
        for(var key in disbDocData){
            document.getElementById("dateOfDisbursement").value = disbDocData[0]["loanApprovalDate"].split("-")[2]+"/"+disbDocData[0]["loanApprovalDate"].split("-")[1]+"/"+disbDocData[0]["loanApprovalDate"].split("-")[0];
            document.getElementById("loanSancDate").innerHTML = disbDocData[0]["loanApprovalDate"].split("-")[2]+"/"+disbDocData[0]["loanApprovalDate"].split("-")[1]+"/"+disbDocData[0]["loanApprovalDate"].split("-")[0];
            var obj = {};
            totalMemberIdArray.push(disbDocData[key]["appMemberId"]+"_memberAvailedLoan");
            obj[disbDocData[key]["appMemberId"]+"_modeOfPayment"] = disbDocData[key]["modeOfPayment"];
            obj[disbDocData[key]["appMemberId"]+"_bank"] = disbDocData[key]["bank"];
            obj[disbDocData[key]["appMemberId"]+"_memberAvailedLoan"] = disbDocData[key]["memberAvailedLoan"];
            selectOptValArray.push(obj);
            if(disbDocData[key]["chequeNo"] == null){
                disbDocData[key]["chequeNo"] = ''
            }
            html+= '<td>'+disbDocData[key]["appMemberId"]+'&nbsp<input id="'+disbDocData[key]["memberId"]+'" type="text" style="display:none;" value="'+disbDocData[key]["memberId"]+'"></td>'+
            '<td>'+disbDocData[key]["memberName"]+'</td>'+
            '<td>'+disbDocData[key]["idProofValue"]+'</td>'+
            '<td>'+disbDocData[key]["addressProofValue"]+'</td>'+
            '<td><select id="'+disbDocData[key]["appMemberId"]+"_modeOfPayment"+'">'+innerHTMLModeOfPayment+'</select></td>'+
            '<td><select id="'+disbDocData[key]["appMemberId"]+"_bank"+'">'+innerHTMLBank+'</select></td>'+
            '<td><input id="'+disbDocData[key]["appMemberId"]+"_chequeNo"+'" type="text"  maxlength=30 class="sample1" value='+disbDocData[key]["chequeNo"]+'></input></td>'+
            '<td>'+disbDocData[key]["amount"]+'</td>'+
            '<td><select id="'+disbDocData[key]["appMemberId"]+"_memberAvailedLoan"+'">'+innerHTMLMemAvailLoan+'</select></td></tr>';
        }
        document.getElementById("disburseDocBodyData").innerHTML = html;
        for(var data in selectOptValArray){
            for(var key in selectOptValArray[data]){
                document.getElementById(key).value = selectOptValArray[data][key];
            }
        }
        loadDataTable("#disburseDocData");
    }
}

function updateChequeInfo(){
    $(".setBGColor").css("border","1px solid #D5D5D5");
    $("#disburseDocData td").removeClass("setBGColor");
    var flag = 0;
    var disbursementDate = document.getElementById("dateOfDisbursement").value;
    if(disbursementDate == ""){
        $("#dateOfDisbursementDiv").css("border","1px solid #CD0000");
        $.alert("Please select Date of Disbursement!");
        return false;
    }
    else{
        $("#dateOfDisbursementDiv").css("border","0px solid #D5D5D5");
    }
    memberAvailedLoanFalseArr = [];
    for(var i in totalMemberIdArray){

        if(document.getElementById(totalMemberIdArray[i])){
            if(document.getElementById(totalMemberIdArray[i]).value == "" || document.getElementById(totalMemberIdArray[i]).value == "null"){
                $("#"+totalMemberIdArray[i]).addClass("setBGColor");
                flag = 1;
            }
            else{
                $("#"+totalMemberIdArray[i]).removeClass("setBGColor");
            }
            if(document.getElementById(totalMemberIdArray[i]).value == "true"){
                memberAvailedLoanArray.push(totalMemberIdArray[i].split("_")[0]);
            }
	     if(document.getElementById(totalMemberIdArray[i]).value == "false"){
                memberAvailedLoanFalseArr.push(totalMemberIdArray[i].split("_")[0]);
            }
                    }
    }



    var formFields = ["bank","modeOfPayment","chequeNo","memberAvailedLoan"];
    for(var i in memberAvailedLoanArray){
        for(var j in formFields){
            var domElemId = memberAvailedLoanArray[i]+"_"+formFields[j];
            if(document.getElementById(domElemId)){
                if(document.getElementById(domElemId).value == "" || document.getElementById(domElemId).value == "null"){
                    $("#"+domElemId).addClass("setBGColor");
                    flag = 1
                }
                else{
                     $("#"+domElemId).removeClass("setBGColor");
                     $("#"+domElemId).css("border","1px solid #D5D5D5");
                     $("#"+domElemId).css("color","black");
                }
            }
        }
    }
    for(var i in memberAvailedLoanFalseArr){
        for(var j in formFields){
            var domElemId = memberAvailedLoanFalseArr[i]+"_"+formFields[j];
            if(document.getElementById(domElemId)){
                $("#"+domElemId).removeClass("setBGColor");
                $("#"+domElemId).css("border","1px solid #D5D5D5");
                $("#"+domElemId).css("color","black");
            }
        }
    }

    if(flag == 1){
        $(".setBGColor").css("border","1px solid #CD0000");
        $(".setBGColor").css("color","black");
        $.alert("Highlighted fields cannot be empty")
        return false;
    }
    var updateCheqData=convertChequeDataToJson();
    var dataObj = {};
    dataObj["cheqData"] = eval(updateCheqData);




    return $.ajax({
        url: '/updateDisburseMemberData/',
        dataType: 'json',
        type : "POST",
        beforeSend: function() {
            $("#loading").show();
        },
        complete: function() {
            $("#loading").hide();
        },
        success: function(data) {
            if(data.code == "12001"){
                $.alert("Cheque details updated successfully");
                $("#disburseDocData").dataTable().fnDestroy();
                loadDisburseDocData();

            }
        },
        data: JSON.stringify(dataObj)
    });


}
function convertChequeDataToJson(){
    var rows = [];
    var disbursementDate = document.getElementById("dateOfDisbursement").value;
    disbursementDateSplit = disbursementDate.split("/");
    disbursementDate = disbursementDateSplit[2]+"-"+disbursementDateSplit[1]+"-"+disbursementDateSplit[0];
    $('table.disburseDocData tr').not('thead tr').each(function(i, n){
        var $row = $(n);
        rows.push({
            "loanId" : loanId,
            "memberId": $row.find("td:eq(0) input[type='text']").val(),
            "modeOfPayment":  $row.find("td:eq(4) :selected").val(),
            "bank":  $row.find("td:eq(5) :selected").val(),
            "memberAvailedLoan":  $row.find("td:eq(8) :selected").val(),
            "chequeNumber": $row.find("td:eq(6) input[type='text']").val(),
            "dos" : disbursementDate
        });
    });
    return JSON.stringify(rows);
}


function approveDisburseDocs(status){
    var flag = 0;
    if(totLoanDocCount != uploadedDocsCount){
        $.alert("Please upload all the documents before approving.");
        $('.tabbable a[href="#upload"]').tab('show');
        return false;
    }else{
        updateChequeInfo().done(function(result) { if(result.code == 12001)
        {
            $( ".confirmBtn" ).click();
            $.confirm({
            title: 'Do you really want to approve the group?',
            confirmButton: 'Yes',
            cancelButton: 'No',
            confirm: function(){
                 completeTask(status);
            },
            cancel: function(){
            }
        });

        }
        }).fail(function() {  flag = 0; });
    }

}


function loadDisburseDocDataRead(){
    var disbDocData;
    $.ajax({
        url : '/disburseDocsData/'+loanId,
        async: false,
        dataType: 'json',
        success: function(data){
            if(data["data"][0]){
                disbDocData =  data["data"];
            }
        }
    });
    console.log(disbDocData);
	var html = '<tr>';
	var innerHTMLBank = '';
	var selectOptValArray = [];
    if(disbDocData && disbDocData[0]){
        for(var key in disbDocData){

            if(disbDocData[0]["oldDos"] != "" || disbDocData[0]["oldDos"] != null){
                var dateSplit = disbDocData[0]["oldDos"].split("-");
                dateSplit = dateSplit[2].split(" ")[0]+"-"+dateSplit[1]+"-"+dateSplit[0];
                document.getElementById("dateOfDisbursement").innerHTML = dateSplit;
            }
            else{
                var dateSplit = disbDocData[0]["oldDos"].split("-");
                dateSplit = dateSplit[2].split(" ")[0]+"-"+dateSplit[1]+"-"+dateSplit[0];
                document.getElementById("dateOfDisbursement").innerHTML = dateSplit;
            }
            var obj = {};
            totalMemberIdArray.push(disbDocData[key]["appMemberId"]+"_memberAvailedLoan");
            obj[disbDocData[key]["appMemberId"]+"_modeOfPayment"] = disbDocData[key]["modeOfPayment"];
            obj[disbDocData[key]["appMemberId"]+"_bank"] = disbDocData[key]["bank"];
            obj[disbDocData[key]["appMemberId"]+"_memberAvailedLoan"] = disbDocData[key]["memberAvailedLoan"];
            selectOptValArray.push(obj);
            if(disbDocData[key]["chequeNo"] == null){
                disbDocData[key]["chequeNo"] = ''
            }
            var memberAvailedLoan = '';
            if(disbDocData[key]["memberAvailedLoan"] == true){
                memberAvailedLoan = "Yes";
            }
            if(disbDocData[key]["memberAvailedLoan"] == false){
                memberAvailedLoan = "No";
            }
            html+= '<td>'+disbDocData[key]["appMemberId"]+'&nbsp</td>'+
            '<td>'+disbDocData[key]["memberName"]+'</td>'+
            '<td>'+disbDocData[key]["idProofValue"]+'</td>'+
            '<td>'+disbDocData[key]["addressProofValue"]+'</td>'+
            '<td>'+disbDocData[key]["modeOfPayment"]+'</td>'+
            '<td>'+disbDocData[key]["bank"]+'</td>'+
            '<td>'+disbDocData[key]["chequeNo"]+'</td>'+
            '<td>'+disbDocData[key]["amount"]+'</td>'+
            '<td>'+memberAvailedLoan+'&nbsp<input id="'+disbDocData[key]["memberAvailedLoan"]+'" type="text" style="display:none;" value="'+disbDocData[key]["memberAvailedLoan"]+'"></td>'+
            '<td style="display:none;"><input id="'+disbDocData[key]["memberId"]+'" type="text"  value="'+disbDocData[key]["memberId"]+'"></td></tr>';
        }
        document.getElementById("disburseDocBodyData").innerHTML = html;

        loadDataTable("#disburseDocData");
    }
}

function confirmLoan(status){
   var groupName = document.getElementById("groupName_groupRole").innerHTML;
    $.confirm({
            title: 'Do you really want to approve the group?',
            confirmButton: 'Yes',
            cancelButton: 'No',
            confirm: function(){
                var rows = [];
                var disbursementDate = document.getElementById("dateOfDisbursement").innerHTML;
                disbursementDateSplit = disbursementDate.split("-");
                disbursementDate = disbursementDateSplit[2]+"-"+disbursementDateSplit[1]+"-"+disbursementDateSplit[0];
                $('table.disburseDocData tr').not('thead tr').each(function(i, n){
                    var $row = $(n);
                    rows.push({
                        "loanId" : loanId,
                        "memberId": $row.find("td:eq(9) input[type='text']").val(),
                        "modeOfPayment":  $row.find("td:eq(4)").text(),
                        "bank":  $row.find("td:eq(5)").text(),
                        "memberAvailedLoan":  $row.find("td:eq(8) input[type='text']").val(),
                        "chequeNumber": $row.find("td:eq(6)").text(),
                        "dos" : disbursementDate,
                        "userId" : userId
                    });
                });

                var dataObj = {};
                dataObj["cheqData"] = eval(JSON.stringify(rows));
                dataObj["processUpdate"] = { 'variables': { 'disbursement': {   'value': status     },     }     };
		  dataObj["taskId"] = taskId;

                $.ajax({
                    url : '/confirmChqDisbursement/',
                    dataType: 'json',
                    type: 'POST',
                    success: function(data){
                        if(data["code"] == "12002"){
				var groupName = document.getElementById("groupName_groupRole").innerHTML;
                            $("#validationMessage").addClass("center");
                             document.getElementById("validationMessage").innerHTML ='<span style="color:green" " class="bigger-50"><i class="ace-icon fa fa-check-circle bigger-125"></i> &nbsp&nbsp'+"'"+ groupName +"'" + " has been approved"+'</span>';
                             document.getElementById("gStatus").innerHTML = '<h3  class="lighter center smaller">Loan process has been completed successfully!  <i class="ace-icon glyphicon glyphicon-thumbs-up bigger-150"></i> </h3>';
                             document.getElementById("taskValBtn").innerHTML = '<a href="/assignedTaskList/" class="btn btn-primary"> <i class="glyphicon glyphicon-user"></i> Go to My Tasks </a>';
                             $("#successPanel").show();
                             $("#defaultDisplay").hide();
                             $("#defaultDisplay1").hide();
                        }
                    },
                    data: JSON.stringify(dataObj)
                });
            },
            cancel: function(){
            }
        });




}

function completeTask(status){
    var flag =0;

    if(taskName == "Add New Members"){
        var statusUpdate = '';
        var groupName = document.getElementById("groupName_groupRole").innerHTML;
            statusUpdate = "'"+groupName+"'"+'  has been approved';
        var dataObj = {};
        dataObj["taskId"] = taskId;
        dataObj["processUpdate"] = { 'variables': { 'groupinstance': {   'value': "bmapproved"     },     }     };
        flag =1;
    }
    else{

    var fontColor = '';
    var statusUpdate = '';
    var groupName = document.getElementById("groupName_groupRole").innerHTML;
    if(status == "rework"){
	 fontColor = 'darkgoldenrod';
        statusUpdate = "'"+groupName+"'"+'  has been sent for rework';
    }
    if(status == "send"){
	 fontColor = 'green';
        statusUpdate = "'"+groupName+"'"+' has been approved';
    }
    if(status == "resolved"){
	 fontcolor = 'green';
        statusUpdate = groupName+"'s query"+'  has been resolved';
    }
    var dataObj = {};

    dataObj["taskId"] = taskId;
    dataObj["processUpdate"] = { 'variables': { 'disbursement': {   'value': status     },     }     };
    flag =1;

    }
    if(flag == 1){

         $.ajax({
        url: '/updateTask/',
        dataType: 'json',
        type: "post",
        beforeSend: function() {
            $("#loading").show();
        },
        complete: function() {
            $("#loading").hide();
        },
        success: function(data) {
            if (data == "Successful") {
                $("#validationMessage").addClass("center");
                document.getElementById("validationMessage").innerHTML ='<span style="color:'+fontColor+'" " class="bigger-50"><i class="ace-icon fa fa-check-circle bigger-125"></i> &nbsp&nbsp'+statusUpdate+'</span>';
                document.getElementById("gStatus").innerHTML = '<h3  class="lighter center smaller">Task has been completed successfully!  <i class="ace-icon glyphicon glyphicon-thumbs-up bigger-150"></i> </h3>';
                document.getElementById("taskValBtn").innerHTML = '<a href="/assignedTaskList/" class="btn btn-primary"> <i class="glyphicon glyphicon-user"></i> Go to My Tasks </a>';
                $("#successPanel").show();
                $("#defaultDisplay").hide();
                $("#defaultDisplay1").hide();
            } else {
                $.alert("Failed due to some Issue . Please try after sometime or contact your Administrator");
            }
        },
        data: JSON.stringify(dataObj)
    });
    }

}


function getLoanAccountNumber(){
    $.ajax({
        url: '/getLoanAccNo/'+processInstanceId,
        dataType: 'json',
        success: function(data) {
            document.getElementById("loanAccountNumber").innerHTML = data["loanAccNo"];
        }
    });
}



function setSelectOptionInForm(){
    $.ajax({
        url :  '/masterDataBank/',
            type    : 'post',
            dataType: 'json',
            success : function (bankData) {
            if(bankData["data"][0]){
                keyValueMasterBankArray = bankData["data"].sort(function(a, b){ var a1= a.bankName, b1= b.bankName;    if(a1== b1) return 0;    return a1> b1? 1: -1; })
                $('#bankId').append('<option value="" > Select Bank </option>');
                for(var i = 0; i < Object.keys(keyValueMasterBankArray).length ; i++){
                    $('#bankId').append('<option value="'+keyValueMasterBankArray[i].bankId+'">'+keyValueMasterBankArray[i].bankName+'</option>');
                }

                $.each($('#bankId option'), function(key, optionElement) {
                     var curText = $(optionElement).text();
                     $(this).attr('title', curText);
                     var lengthToShortenTo = Math.round(parseInt('350px', 10) / 9.4);
                         if (curText.length > lengthToShortenTo) {
                        $(this).text(curText.substring(0,lengthToShortenTo)+'...');
                         }
                });
                // Show full name in tooltip after choosing an option
                $('#bankId').change(function() {
                    $(this).attr('title', ($(this).find('option:eq('+$(this).get(0).selectedIndex +')').attr('title')));
                });
            }

        }
    });

    $.ajax({
        url :  '/masterIDProof/',
            type    : 'post',
            dataType: 'json',
            success : function (idProofData) {
            keyValueIDProofArray = idProofData["data"].sort(function(a, b){ var a1= a.idProofName, b1= b.idProofName;    if(a1== b1) return 0;    return a1> b1? 1: -1; })
            $('#idProofTypeId').append('<option value="" > Select ID Proof </option>');
            for(var i = 0; i < Object.keys(keyValueIDProofArray).length ; i++){
                $('#idProofTypeId').append('<option value="'+keyValueIDProofArray[i].idProofId+'">'+keyValueIDProofArray[i].idProofName+'</option>');
            }

            $.each($('#idProofTypeId option'), function(key, optionElement) {
                 var curText = $(optionElement).text();
                 $(this).attr('title', curText);
                 var lengthToShortenTo = Math.round(parseInt('265px', 10) / 9.4);
                     if (curText.length > lengthToShortenTo) {
                    $(this).text(curText.substring(0,lengthToShortenTo)+'...');
                     }
            });
            // Show full name in tooltip after choosing an option
            $('#idProofTypeId').change(function() {
                $(this).attr('title', ($(this).find('option:eq('+$(this).get(0).selectedIndex +')').attr('title')));
            });
            }
    });
    $.ajax({
        url :  '/masterAddressProof/',
            type    : 'post',
            dataType: 'json',
            success : function (addressProofData) {
            keyValueAddressProofArray = addressProofData["data"].sort(function(a, b){ var a1= a.addProofName, b1= b.addProofName;    if(a1== b1) return 0;    return a1> b1? 1: -1; })
            $('#addressProofTypeId').append('<option value="" > Select Address Proof </option>');
            for(var i = 0; i < Object.keys(keyValueAddressProofArray).length ; i++){
                $('#addressProofTypeId').append('<option value="'+keyValueAddressProofArray[i].addProofId+'">'+keyValueAddressProofArray[i].addProofName+'</option>');
            }

            $.each($('#addressProofTypeId option'), function(key, optionElement) {
                 var curText = $(optionElement).text();
                 $(this).attr('title', curText);
                 var lengthToShortenTo = Math.round(parseInt('265px', 10) / 9.4);
                     if (curText.length > lengthToShortenTo) {
                    $(this).text(curText.substring(0,lengthToShortenTo)+'...');
                     }
            });
            // Show full name in tooltip after choosing an option
            $('#addressProofTypeId').change(function() {
                $(this).attr('title', ($(this).find('option:eq('+$(this).get(0).selectedIndex +')').attr('title')));
            });
            }
    });
    $.ajax({
        url :  '/masterLoanPurpose/',
            type    : 'post',
            dataType: 'json',
            success : function (loanPurposeData) {
            keyValueloanPurposeArray = loanPurposeData["data"].sort(function(a, b){ var a1= a.name, b1= b.name;    if(a1== b1) return 0;    return a1> b1? 1: -1; })
            $('#loanTypeValue').append('<option value="" > Select Loan Purpose </option>');
            for(var i = 0; i < Object.keys(keyValueloanPurposeArray).length ; i++){
                $('#loanTypeValue').append('<option value="'+keyValueloanPurposeArray[i].id+'">'+keyValueloanPurposeArray[i].name+'</option>');
            }

            $.each($('#loanTypeValue option'), function(key, optionElement) {
                 var curText = $(optionElement).text();
                 $(this).attr('title', curText);
                 var lengthToShortenTo = Math.round(parseInt('265px', 10) / 9.4);
                     if (curText.length > lengthToShortenTo) {
                         $(this).text(curText.substring(0,lengthToShortenTo)+'...');
                     }
            });
            // Show full name in tooltip after choosing an option
            $('#loanTypeValue').change(function() {
                $(this).attr('title', ($(this).find('option:eq('+$(this).get(0).selectedIndex +')').attr('title')));
            });
            }
    });



}