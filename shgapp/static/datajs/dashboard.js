$(document).ready(function(){
	$.ajax({
		url : '/getDashboardData/',
        dataType: 'json',
	 beforeSend: function() {
            $("#loading").show();
        },
        complete: function() {
            $("#loading").hide();
        },
		success: function (data) {
			console.log(data);
            if(data["Task"]){
                for(var key in data["Task"]){
                    var newKey = '';
                    var keySplit = key.split(" ");
                    for(var key1 in keySplit){
                        if(key1 == 0){
                            newKey += keySplit[key1];
                        }
                        else{
                            newKey += '_'+keySplit[key1];
                        }
                        if(document.getElementById(newKey+"_DB")){
                            document.getElementById(newKey+"_DB").innerHTML = data["Task"][key];
                        }
                    }
                }
            }
		}
	});
});

function disp_data(taskName){
	window.location ='/redirectDBTasks/'+taskName;
}


function viewTasksData(taskName){
        $.ajax({
		url : '/viewTasksData/'+taskName,
		type : "POST",
        dataType: 'json',
		success: function (data) {
			console.log(data);
			var groupTaskdata = data;
            var dataArray = [];
            for(var key in groupTaskdata){
                var obj={};
                if(groupTaskdata[key]["name"]  && groupTaskdata[key]["created"]){
                    obj["slNo"] = parseInt(key)+1;
                    obj["taskName"] = groupTaskdata[key]["name"];
                    var createdDateTime = groupTaskdata[key]["created"];
                    date = moment.parseZone(createdDateTime).utc().format();
                    dateTime = moment(date).format("DD-MM-YYYY HH:mm:ss");
                    obj["taskDate"] = dateTime;
                    obj["taskId"]   = groupTaskdata[key]["id"]
     		      obj["assignee"]   = groupTaskdata[key]["assignee"]


                }
                if(groupTaskdata[key]["customerData"]){
                    var customerData;
                    if(typeof(groupTaskdata[key]["customerData"]) == "string") {
                        customerData = JSON.parse(groupTaskdata[key]["customerData"]);
                    }
                    if(typeof(groupTaskdata[key]["customerData"]) == "object"){
                        customerData = JSON.parse(groupTaskdata[key]["customerData"]["value"]);
                    }
                    var memberCount = customerData["memberDetails"].length;
                    for(var data in customerData){
                        obj["groupId"] = customerData["groupId"];
                        obj["loanId"] = customerData["loanId"];
                        obj["groupLocation"] = customerData["groupLocation"];
                        obj["loanType"] = groupTaskdata[key]["loanTypeName"];
                        obj["shgId"] = customerData["appGroupId"];
                        obj["shgName"] =customerData["groupName"];
                        obj["memberCount"] =memberCount;
                        obj["groupLoanId"] = obj["groupId"]+"_"+obj["loanId"];
                        obj["clusterName"] =customerData["clusterName"];
                        obj["centerName"] =customerData["centerName"];
                        obj["regionName"] =customerData["regionName"];
                        obj["loanAmount"] = customerData["loanAmount"];
                        var loanAppDt = customerData["loanApplicationDate"].split("-");
                        var grpFormDt = customerData["groupFormationDate"].split("-");

                        obj["loanApplicationDate"] =loanAppDt[2]+"-"+loanAppDt[1]+"-"+loanAppDt[0];
                        obj["groupFormationDate"] =grpFormDt[2]+"-"+grpFormDt[1]+"-"+grpFormDt[0];

                    }
                    obj["history"] = '<button type="submit" onclick="viewGrpInfo('+"'"+obj["groupId"]+"'"+",'"+obj["loanId"]+"'"+",'"+obj["taskName"]+"'"+",'"+groupTaskdata[key]["loanTypeName"]+"'"+",'"+groupTaskdata[key]["processInstanceId"]+"'"+",'"+customerData["loanTypeId"]+"'"+');" class="btn btn-danger btn-md">View</button>&nbsp&nbsp'
                                     +'<a href="#" onclick="viewGrpHistory('+"'"+groupTaskdata[key]["processInstanceId"]+"'"+",'"+obj["shgName"]+"'"+",'"+obj["shgId"]+"'"+",'"+obj["loanId"]+"'"+",'"+groupTaskdata[key]["loanTypeName"]+"'"+')" ><i class="fa fa-history" style="color:#307ECC;font-size:large;"></i></a>';
                    }
                dataArray.push(obj);

            }
            $.fn.dataTable.moment('DD-MM-YYYY HH:mm:ss');
            var table = $('#taskListDB').dataTable({
                    data: dataArray,
                    "pageLength": 50,
                    rowId: "groupLoanId",
                    destroy: true,
                    "bProcessing": true,
                    "scrollY": true,
                    fixedHeader : true,
                    "sPaginationType": "full_numbers",
                    "bSortable": true,

                    "aoColumns": [
                        { "mData": "taskName", "sTitle": "Task Name", className:"column"},
                        { "mData": "taskDate","sTitle": "Task Date"  , "sType": "date", className:"column"},
                        { "mData": "loanType","sTitle": "Product Name" , className:"column"},
                        { "mData": "loanAmount","sTitle": "Loan Amt"  ,  className:"column"},
                        { "mData": "shgId","sTitle": "SHG ID"  ,  className:"column"},
                        { "mData": "shgName","sTitle": "SHG Name"  , className:"column"},
                        { "mData": "loanApplicationDate","sTitle": "Loan App. Dt"  ,  className:"column"},
                        { "mData": "groupFormationDate","sTitle": "Grp Frmtn Dt"  ,  className:"column"},
                        { "mData": "memberCount","sTitle": "Total Members"  , className:"column"},
                        { "mData": "regionName","sTitle": "Region Name"  , className:"column"},
                        { "mData": "clusterName","sTitle": "Cluster Name"  , className:"column"},
                        { "mData": "centerName","sTitle": "Center Name"  , className:"column"},
			   { "mData": "assignee","sTitle": "Assignee"  , className:"column"},
                        { "mData": "history","sTitle": "History"  , "sWidth": "9%", className:"column"},

                    ],
                }).fnDestroy();
                table = $('#taskListDB').DataTable( {
                    "pageLength": 50
                } );

		}
	});
}


function viewGrpInfo(groupId,loanId,taskName,loanTypeName,processInstanceId,loanTypeId){
    window.location = '/viewGroupHistoryDB/'+groupId+'/'+loanId+'/'+taskName+'/'+loanTypeName+'/'+processInstanceId+'/'+loanTypeId;
}


function viewGrpHistory(processInstanceId,groupName,shgId,loanId,loanTypeName){

    var historyDict ={};
    var html = '';
    $.ajax({
	    url: '/getOverAllHistory/'+processInstanceId,
	    dataType: 'json',
	    success: function (data) {
            var history = data;
            if(history[0]){
                for( var data in history){
                    var arr={};
                    if( history[data]["activityType"] == "userTask" ){
                        historyDict[history[data]["taskId"]] = history[data];
                    }


                }
		    }

		    var historyList = Object.keys(historyDict).map(function(key) {
              return [key, historyDict[key]];
            });
            var sortedData= historyList.sort((function (a, b) { return new Date(a[1].startTime) - new Date(b[1].startTime) }));

            html += '<div class="classmemberDetails">'+groupName+'<div><font >Group ID : '+shgId+'</font>&nbsp&nbsp&nbsp&nbsp<font>Loan ID : '+loanId+'</font>&nbsp&nbsp&nbsp&nbsp<font>Loan Type : '+loanTypeName+'</font></div></div><br><div class="history_main"><ul class="cbp_tmtimeline">';
            var reworkTasksList = ["KYC Check","Proposal scrutiny","Upload disbursement docs","Confirm disbursement"];
            var replaceTaskName = {
                "KYC Check"                                 : "Query Response",
                "Proposal scrutiny"                         : "BM Reply",
                "Upload disbursement docs"                  : "Resolve Confirm Disbursement Query",
                "Confirm disbursement"                      : "Confirm Disbursement Query Response",
                "Conduct BAT- Member approval in CRM"       : "Conduct BAT- Member approval in CRM",
                "Upload loan documents in Web application"  : "Upload loan documents in Web application",
                "Resolve Data Support Team Query"           : "Resolve Data Support Team Query",
                "Add New Members"                           : "Add New Members",
                "Prepare Loan Documents"                    : "Prepare Loan Documents",
                "Approve or Reject Group"                   : "Approve or Reject Group",
                "Resolve Credit Team Query"                 : "Resolve Credit Team Query",
                "Approve Loan"                              : "Approve Loan",
                "Generate repayment chart"                  : "Generate repayment chart"
            };
            var existsList = [];
	     var addNewMemberInd = 0;
            for(var i=0;i<sortedData.length;i++){
                var startDateTime = sortedData[i][1].startTime;
                date = moment.parseZone(startDateTime).utc().format();
                dateTime = moment(date).format("DD-MM-YYYY HH:mm:ss");
                var date= dateTime;
                var dateCreatedSplit = date.split(" ");
                var onlyDate = dateCreatedSplit[0];
                var onlyTime = dateCreatedSplit[1];
		  if(sortedData[i][1].activityName == "Add New Members"){
			addNewMemberInd= i+1;	
		  }
                if($.inArray(sortedData[i][1].activityName, existsList) != -1){
                    sortedData[i][1].activityName = replaceTaskName[sortedData[i][1].activityName]
		      sortedData[addNewMemberInd][1].activityName = "KYC Check";
                }
                else{
                    existsList.push(sortedData[i][1].activityName);
                    sortedData[i][1].activityName = sortedData[i][1].activityName;
                }
                if(sortedData[i][1].endTime != null){
                    var endDateTime = sortedData[i][1].endTime;
                    date = moment.parseZone(endDateTime).utc().format();
                    dateTime = moment(date).format("DD-MM-YYYY HH:mm:ss");
                    var taskEndTime = dateTime;
					var taskEndTimeSplit = taskEndTime.split(" ");
					taskEndTime = taskEndTimeSplit[0]+', '+taskEndTimeSplit[1];
                    sortedData[i][1].endTime = "Task has been completed by " +'<label style="font-weight:bold;">'+sortedData[i][1]["assignee"]+ "</label>"+ " on "+ taskEndTime;
                }
                else{
                     sortedData[i][1].endTime = "Task has not been completed yet"
                }
                html += '<li><time class="cbp_tmtime" datetime="'+onlyDate+' '+onlyTime+'"><span>'+onlyDate+'</span> <span>'+onlyTime+'</span></time>'
                            +'<div class="cbp_tmicon cbp_tmicon-phone"></div><div class="cbp_tmlabel"><h3>'+sortedData[i][1].activityName+'</h3>'
                            +'<p class="tmtime_ptag">'+sortedData[i][1].endTime+'<br></p></div></li>';
            }

            html +='</ul></div>';
            $('#Modal').css('display','block');
            if(document.getElementById("historyModal")){
                document.getElementById('historyModal').innerHTML = html;
            }
		}
	});

}



