var monthDict = {"01":"Jan","02":"Feb","03":"Mar","04":"Apr","05":"May","06":"Jun","07":"Jul","08":"Aug","09":"Sep","10":"Oct","11":"Nov","12":"Dec"};

$(document).ajaxError(function(e, xhr, settings, exception) {
    if(exception == "timeout") {
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


function loadUnassignedTaskList(data){

	var groupTaskdata = data;

	var dataArray = [];
	$("#loading").hide();
	for(var key in groupTaskdata){
		var obj={};
		if(groupTaskdata[key]["name"]  && groupTaskdata[key]["created"]){
			obj["slNo"] = parseInt(key)+1;
			obj["taskName"] = groupTaskdata[key]["name"];
			obj["processInstanceId"] = groupTaskdata[key]["processInstanceId"];
			var createdDateTime = groupTaskdata[key]["created"];
		       date = moment.parseZone(createdDateTime).utc().format();
			dateTime = moment(date).format("DD-MM-YYYY HH:mm:ss");
			obj["taskDate"] = dateTime;
			obj["taskId"]   = groupTaskdata[key]["id"];
			var StartDateTime = groupTaskdata[key]["processStartTime"];
		    date2 = moment.parseZone(StartDateTime).utc().format();
			dateTime2 = moment(date2).format("DD-MM-YYYY HH:mm:ss");
			obj["StartDate"] = dateTime2;
			//console.log('start date',obj["StartDate"] );
			//console.log('taskDate',obj["taskDate"] );

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

				obj["groupLoanId"] = obj["groupId"]+"_"+obj["loanId"]+"_"+groupTaskdata[key]["name"]+"_"+obj["taskId"]+"_"+obj["processInstanceId"]+"_"+groupTaskdata[key]["loanTypeName"]+"_"+customerData["loanTypeId"];
				var loanAppDt = customerData["loanApplicationDate"].split("-");
				var grpFormDt = customerData["groupFormationDate"].split("-");

				obj["loanApplicationDate"] =loanAppDt[2]+"-"+loanAppDt[1]+"-"+loanAppDt[0];
				obj["groupFormationDate"] =grpFormDt[2]+"-"+grpFormDt[1]+"-"+grpFormDt[0];

			}
		    obj["claim"] = '<button type="submit" onclick="claimconfirmBox('+"'"+obj["taskId"]+"'"+",'"+obj["shgName"]+"'"+",'"+obj["groupLoanId"]+"'"+');" class="btn btn-danger btn-md button">Claim</button>';
		}
		dataArray.push(obj);

	}
	$.fn.dataTable.moment('DD-MM-YYYY HH:mm:ss');
	var table = $('#taskListTable').dataTable({
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
                { "mData": "taskName", "sTitle": "Task Name", "sWidth": "13%", className:"column"},
                { "mData": "taskDate","sTitle": "Task Date"  , "sWidth": "8%", "sType": "date", className:"column"},
                { "mData": "StartDate","sTitle": "Process Date"  , "sWidth": "8%", "sType": "date", className:"column"},
                { "mData": "loanType","sTitle": "Product Name"  , "sWidth": "8%", className:"column"},
                { "mData": "loanAmount","sTitle": "Loan Amt"  , "sWidth": "8%", className:"column"},
                { "mData": "shgId","sTitle": "SHG ID"  , "sWidth": "8%", className:"column"},
                { "mData": "shgName","sTitle": "SHG Name"  , "sWidth": "10%", className:"column"},
                { "mData": "loanApplicationDate","sTitle": "Loan App. Dt"  , "sWidth": "10%", className:"column"},
                { "mData": "groupFormationDate","sTitle": "Grp Frmtn Dt"  , "sWidth": "10%", className:"column"},
                { "mData": "memberCount","sTitle": "Total Members"  , "sWidth": "8%", className:"column"},
                { "mData": "regionName","sTitle": "Region Name"  , "sWidth": "12%", className:"column"},
                { "mData": "clusterName","sTitle": "Cluster Name"  , "sWidth": "12%", className:"column"},
                { "mData": "centerName","sTitle": "Center Name"  , "sWidth": "12%", className:"column"},
                { "mData": "claim","sTitle": "Claim"  , "sWidth": "10%", className:"column"},

            ],
        }).fnDestroy();
        table = $('#taskListTable').DataTable( {
            "pageLength": 50
        } );
      triggerLoadFunc();
     
      if((dataArray.length > 0 ) && (taskName == "Proposal scrutiny" || taskName == "Approve Loan")){	

       		GetAllData(dataArray);
    	}
    	else{
    		errortable();
    	}
 }



function errortable(){

	var html = "<table class='table table-striped table-bordered table-hover paymentTable'>";
     html+="<thead class='thin-border-bottom'><tr><td style='text-align:center;valign='middle'><b>LOAN TYPE</b></td><td style='text-align:center;valign='middle'><b>TOTAL AMOUNT</b></td><td style='text-align:center;valign='middle'><b>NUMBER OF LOAN</b></td><td style='text-align:center;valign='middle'><b>VIEW</b></td></thead>";

        html+="<tr>"
        html+="<td style='text-align:center;valign='middle'  colspan='4'><b>Data Not Avialable </b></td>";
        html+="</tr>";
    html+="</table>";
    $("#taskListTable2").html(html);

}




var caldata;
function GetAllData(data){
caldata=data;
//console.log("caldata",caldata);



if(data.length > 0){
var group = _.groupBy(data, 'loanType')
var result = _.map(_.keys(group), function(e) {
  return _.reduce(group[e], function(r, o) {
    return r.count += +o.loanAmount, r
  }, {loanType: e, count: 0, sum: group[e].length})
})



  var html = "<table class='table table-striped table-bordered table-hover paymentTable'>";
     html+="<thead class='thin-border-bottom'><tr><td style='text-align:center;valign='middle'><b>LOAN TYPE</b></td><td style='text-align:center;valign='middle'><b>TOTAL AMOUNT</b></td><td style='text-align:center;valign='middle'><b>NUMBER OF LOAN</b></td><td style='text-align:center;valign='middle'><b>VIEW</b></td></thead>";
    for (var i = 0; i < result.length; i++) {
        html+="<tr>"
        html+="<td style='text-align:center;valign='middle'>"+result[i].loanType+"</td>";
        html+="<td style='text-align:center;valign='middle'>"+result[i].count+"</td>";
        html+="<td style='text-align:center;valign='middle'>"+result[i].sum+"</td>";
        html+="<td style='text-align:center;valign='middle'><button type='button' class='btn btn-danger btn-md button' onclick=GetLoanType('"+result[i].loanType+"');>View</button></td>";
        html+="</tr>";

    }
    html+="</table>";
    $("#taskListTable2").html(html);

}
else{
	errortable();

}



}




function GetLoanType(data){
var LoanType=data;

 var filterData= _.filter(caldata, function(o) {
    return o.loanType == LoanType;
 });


$("#tasktable1").show();
$("#taskListTable2").hide();
$('#taskListTable').empty();

$.fn.dataTable.moment('DD-MM-YYYY HH:mm:ss');
	var table = $('#taskListTable').dataTable({
            data: filterData,
	        "pageLength": 50,
            rowId: "groupLoanId",
            destroy: true,
            "bProcessing": true,
            "scrollY": true,
            fixedHeader : true,
            "sPaginationType": "full_numbers",
            "bSortable": true,

            "aoColumns": [
                { "mData": "taskName", "sTitle": "Task Name", "sWidth": "13%", className:"column"},
                { "mData": "taskDate","sTitle": "Task Date"  , "sWidth": "8%", "sType": "date", className:"column"},
                { "mData": "StartDate","sTitle": "Process Date"  , "sWidth": "8%", "sType": "date", className:"column"},
                { "mData": "loanType","sTitle": "Product Name"  , "sWidth": "8%", className:"column"},
                { "mData": "loanAmount","sTitle": "Loan Amt"  , "sWidth": "8%", className:"column"},
                { "mData": "shgId","sTitle": "SHG ID"  , "sWidth": "8%", className:"column"},
                { "mData": "shgName","sTitle": "SHG Name"  , "sWidth": "10%", className:"column"},
                { "mData": "loanApplicationDate","sTitle": "Loan App. Dt"  , "sWidth": "10%", className:"column"},
                { "mData": "groupFormationDate","sTitle": "Grp Frmtn Dt"  , "sWidth": "10%", className:"column"},
                { "mData": "memberCount","sTitle": "Total Members"  , "sWidth": "8%", className:"column"},
                { "mData": "regionName","sTitle": "Region Name"  , "sWidth": "12%", className:"column"},
                { "mData": "clusterName","sTitle": "Cluster Name"  , "sWidth": "12%", className:"column"},
                { "mData": "centerName","sTitle": "Center Name"  , "sWidth": "12%", className:"column"},
                { "mData": "claim","sTitle": "Claim"  , "sWidth": "10%", className:"column"},

            ],
        }).fnDestroy();
        table = $('#taskListTable').DataTable( {
            "pageLength": 50
        } );
      triggerLoadFunc();

}












function loadAssignedTaskList(){
	$("#loading").hide();
	var myTaskdata = JSON.parse(myTaskList);
	//console.log("myTaskdata",myTaskdata);

	var dataArray = [];
	for(var key in myTaskdata){
		var obj={};
		if(myTaskdata[key]["name"]  && myTaskdata[key]["created"]){
			obj["slNo"] = parseInt(key)+1;
			if(myTaskdata[key]["chekcbrespdate"]){
				if(myTaskdata[key]["chekcbrespdate"] == "resolved"){
					obj["taskName"] = '<a class="tdViewData">'+'BM Reply'+'</a>';
					myTaskdata[key]["name"] = 'BM Reply';
				}
				else{
				    obj["taskName"] = '<a class="tdViewData">'+myTaskdata[key]["name"]+'</a>';
					myTaskdata[key]["name"] = myTaskdata[key]["name"];
                }
			}
			if(myTaskdata[key]["disbursement"]){
				if(myTaskdata[key]["disbursement"] == "rework"){
					obj["taskName"] = '<a class="tdViewData">'+'Resolve Confirm Disbursement Query'+'</a>';
					myTaskdata[key]["name"] = 'Resolve Confirm Disbursement Query';
				}
				else{
				    obj["taskName"] = '<a class="tdViewData">'+myTaskdata[key]["name"]+'</a>';
					myTaskdata[key]["name"] = myTaskdata[key]["name"];
                }
			}
			if(myTaskdata[key]["disbursement"]){
				if(myTaskdata[key]["disbursement"] == "resolved"){
					obj["taskName"] = '<a class="tdViewData">'+'Confirm Disbursement Query Response'+'</a>';
					myTaskdata[key]["name"] = 'Confirm Disbursement Query Response';
				}
				else{
				    obj["taskName"] = '<a class="tdViewData">'+myTaskdata[key]["name"]+'</a>';
					myTaskdata[key]["name"] = myTaskdata[key]["name"];
                }
			}
			else{
				obj["taskName"] = '<a class="tdViewData">'+myTaskdata[key]["name"]+'</a>';
			}
			var createdDateTime = myTaskdata[key]["created"];

		    date = moment.parseZone(createdDateTime).utc().format();
			dateTime = moment(date).format("DD-MM-YYYY HH:mm:ss");

			obj["taskDate"] = '<a class="tdViewData">'+dateTime+'</a>';
			obj["taskId"]   = myTaskdata[key]["id"]
			obj["processInstanceId"] = myTaskdata[key]["processInstanceId"];

			var StartDateTime = myTaskdata[key]["processStartTime"];
		    date2 = moment.parseZone(StartDateTime).utc().format();
			dateTime2 = moment(date2).format("DD-MM-YYYY HH:mm:ss");
			obj["StartDate"] ='<a class="tdViewData">'+dateTime2+'</a>';


		}
		if(myTaskdata[key]["customerData"]){
			var customerData;
			if(typeof(myTaskdata[key]["customerData"]) == "string") {
				customerData = JSON.parse(myTaskdata[key]["customerData"]);
            }
            if(typeof(myTaskdata[key]["customerData"]) == "object"){
				customerData = JSON.parse(myTaskdata[key]["customerData"]["value"]);
			}
			var memberCount = customerData["memberDetails"].length;
			for(var data in customerData){
				if(obj["taskName"] == "Query Response"){
					obj["groupLocation"] = '<a class="tdViewQuery">'+customerData["groupLocation"]+'</a>';
					obj["loanType"] = '<a class="tdViewQuery">'+"PLL"+'</a>';
					obj["shgId"] = '<a class="tdViewQuery">'+"SHG ID"+'</a>';
					obj["shgName"] = '<a class="tdViewQuery">'+"SHG Name"+'</a>';
				}
				obj["groupId"] = customerData["groupId"];
				obj["loanId"] = customerData["loanId"];
				obj["groupLocation"] = '<a class="tdViewData">'+customerData["groupLocation"]+'</a>';
				obj["loanType"] = '<a class="tdViewData">'+myTaskdata[key]["loanTypeName"]+'</a>';
				obj["shgId"] = '<a class="tdViewData">'+customerData["appGroupId"]+'</a>';
				obj["shgName"] = '<a class="tdViewData">'+customerData["groupName"]+'</a>';
				obj["memberCount"] = '<a class="tdViewData">'+memberCount+'</a>';
				//obj["groupLoanId"] = obj["groupId"]+"_"+obj["loanId"]+"_"+myTaskdata[key]["name"]+"_"+obj["taskId"]+"_"+obj["processInstanceId"]+"_"+myTaskdata[key]["loanTypeName"];
				obj["groupLoanId"] = obj["groupId"]+"_"+obj["loanId"]+"_"+myTaskdata[key]["name"]+"_"+obj["taskId"]+"_"+obj["processInstanceId"]+"_"+myTaskdata[key]["loanTypeName"]+"_"+customerData["loanTypeId"];
				obj["clusterName"] ='<a class="tdViewData">'+customerData["clusterName"]+'</a>';
				obj["centerName"] ='<a class="tdViewData">'+customerData["centerName"]+'</a>';
				obj["regionName"] ='<a class="tdViewData">'+customerData["regionName"]+'</a>';
				obj["loanAmount"] = '<a class="tdViewData">'+customerData["loanAmount"]+'</a>';
				var loanAppDt = customerData["loanApplicationDate"].split("-");
				var grpFormDt = customerData["groupFormationDate"].split("-");
				obj["loanApplicationDate"] ='<a class="tdViewData">'+loanAppDt[2]+"-"+loanAppDt[1]+"-"+loanAppDt[0]+'</a>';
				obj["groupFormationDate"] ='<a class="tdViewData">'+grpFormDt[2]+"-"+grpFormDt[1]+"-"+grpFormDt[0]+'</a>';



			}
		obj["unClaim"] = '<button type="submit" onclick="unClaimconfirmBox('+"'"+obj["taskId"]+"'"+",'"+customerData["groupName"]+"'"+');" class="btn btn-danger btn-md button">UnClaim</button>';

		}
		dataArray.push(obj);
	}
	$.fn.dataTable.moment('DD-MM-YYYY HH:mm:ss');
	var table = $('#taskListTable').dataTable({
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
                { "mData": "taskName", "sTitle": "Task Name", "sWidth": "13%", className:"column"},
                { "mData": "taskDate","sTitle": "Task Date"  , "sWidth": "8%", "sType": "date", className:"column"},
                { "mData": "StartDate","sTitle": "Process Date"  , "sWidth": "8%", "sType": "date", className:"column"},
                { "mData": "loanType","sTitle": "Product Name"  , "sWidth": "8%", className:"column"},
                { "mData": "loanAmount","sTitle": "Loan Amt"  , "sWidth": "8%", className:"column"},
                { "mData": "shgId","sTitle": "SHG ID"  , "sWidth": "8%", className:"column"},
                { "mData": "shgName","sTitle": "SHG Name"  , "sWidth": "10%", className:"column"},
                { "mData": "loanApplicationDate","sTitle": "Loan App. Dt"  , "sWidth": "10%", className:"column"},
                { "mData": "groupFormationDate","sTitle": "Grp Frmtn Dt"  , "sWidth": "10%", className:"column"},
                { "mData": "memberCount","sTitle": "Total Members"  , "sWidth": "4%", className:"column"},
                { "mData": "regionName","sTitle": "Region Name"  , "sWidth": "12%", className:"column"},
                { "mData": "clusterName","sTitle": "Cluster Name"  , "sWidth": "12%", className:"column"},
                { "mData": "centerName","sTitle": "Center Name"  , "sWidth": "12%", className:"column"},
                { "mData": "unClaim","sTitle": "UnClaim"  , "sWidth": "10%", className:"column"},
            ],
        }).fnDestroy();
        table = $('#taskListTable').DataTable( {
        	"pageLength": 50
        } );
	triggerLoadFunc();

}

$(document).ready(function (){
	taskCount();
	$('.tdViewData').click(function() {
		var trId = $(this).closest('tr').attr('id');
		var groupLoanID = trId;
		groupLoanIDSplit = groupLoanID.split("_");
		groupID = groupLoanIDSplit[0];
		loanID =  groupLoanIDSplit[1];
		taskName =  groupLoanIDSplit[2];
		taskId =  groupLoanIDSplit[3];
		processInstanceId =  groupLoanIDSplit[4];
		loanTypeName =  groupLoanIDSplit[5];
		loanTypeId =  groupLoanIDSplit[6];
		window.location = '/SHGForm/'+groupID+'/'+loanID+'/'+taskId+'/'+processInstanceId+'/'+taskName+'/'+loanTypeName+'/'+loanTypeId;
	});
	$('.paginate_button').click(function() {
		triggerLoadFunc();
	});
	$('.dataTables_length').click(function() {
		triggerLoadFunc();
	});
	$('.dataTables_filter').click(function() {
		triggerLoadFunc();
	});
	$('.dataTables_filter').keypress(function() {
		triggerLoadFunc();
	});
	$('.dataTables_filter').on('paste', function () {
		setTimeout(triggerLoadFunc,1000);
	});
	$('.sorting').click(function() {
		triggerLoadFunc();
	});
});

function triggerLoadFunc(){
	taskCount();

	$('.tdViewData').click(function() {
	     var trId = $(this).closest('tr').attr('id');
	     var groupLoanID = trId;
            groupLoanIDSplit = groupLoanID.split("_");
            groupID = groupLoanIDSplit[0];
            loanID =  groupLoanIDSplit[1];
            taskName =  groupLoanIDSplit[2];
            taskId =  groupLoanIDSplit[3];
            processInstanceId =  groupLoanIDSplit[4];
            loanTypeName =  groupLoanIDSplit[5];
		    loanTypeId =  groupLoanIDSplit[6];
		    window.location = '/SHGForm/'+groupID+'/'+loanID+'/'+taskId+'/'+processInstanceId+'/'+taskName+'/'+loanTypeName+'/'+loanTypeId;
	});
}

function taskCount(){
	$.ajax({
	    url: '/tasksCount/',
	    dataType: 'json',
	    success: function (data) {
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
					if(document.getElementById(newKey)){
						document.getElementById(newKey).innerHTML = data["Task"][key];
						if(document.getElementById(newKey+'1')){
							document.getElementById(newKey+'1').innerHTML = data["Task"][key];
						}
					}
				}
			}
		}

	    },
       error: function (error) {
       		$("#loading").hide();
       	 		$.alert("Connection Time out");

              }
	});
}

function claim(d){
	$.ajax({
	    url: '/task/'+d+'/claim/user',
	    dataType: 'json',
	    success: function (data) {
		window.location.reload();
	    }
	});
}


function DirectClaimTask(d,alldata){
	$.ajax({
	    url: '/task/'+d+'/claim/user',
	    dataType: 'json',
	    success: function (data) {
	    var groupLoanID = alldata;
		groupLoanIDSplit = groupLoanID.split("_");
		groupID = groupLoanIDSplit[0];
		loanID =  groupLoanIDSplit[1];
		taskName =  groupLoanIDSplit[2];
		taskId =  groupLoanIDSplit[3];
		processInstanceId =  groupLoanIDSplit[4];
		loanTypeName =  groupLoanIDSplit[5];
		loanTypeId =  groupLoanIDSplit[6];
		window.location = '/SHGForm/'+groupID+'/'+loanID+'/'+taskId+'/'+processInstanceId+'/'+taskName+'/'+loanTypeName+'/'+loanTypeId;
	   // window.location = '../SHGForm/23787/153229/29da9c61-30c6-11e7-86a5-0687f8408349/1305b912-1e92-11e7-94bf-065e2f655607/Approve%20Loan/ATL/2';
		//window.location.reload();
	    }
	});
}



function unClaim(d){
	$.ajax({
	    url: '/task/'+d+'/unclaim/user',
	    dataType: 'json',
	    success: function (data) {
		window.location.reload();
	    }
	});
}

function filterKYCTasksByDate(){
	$("#loading").hide();
	var groupTaskdata = JSON.parse(groupTaskList);
	var dateDict = {};
	var dateArray=[];
	var finalDict =  [];
	var html = '';
	var i=0;

	for(var key in groupTaskdata){
		if(groupTaskdata[key]){
			var obj = {};
			if(groupTaskdata[key]["created"]){
				var datesplit = groupTaskdata[key]["created"].split("T");
				var taskDate = datesplit[0].split("-")[2]+"-"+monthDict[datesplit[0].split("-")[1]]+"-"+datesplit[0].split("-")[0];
				if($.inArray(taskDate, dateArray) == -1){
					dateArray.push(taskDate);
					dateDict[taskDate] = i+1;
				}
				else{
					dateDict[taskDate] = dateDict[taskDate]+1;
				}
			}
		}
	}
	var dataList = Object.keys(dateDict).map(function(key) {
	  return [key, dateDict[key]];
	});
	var sortedData= dataList.sort((function (a, b) {return new Date(a[0]) - new Date(b[0]) }));

	for(var i=0;i<sortedData.length;i++){
		html += '<tr><td>'+sortedData[i][0]+'</td><td><a id="'+sortedData[i][0]+'"href="#" onclick="redirectKYCPage(this.id);">'+sortedData[i][1]+'</a></td></tr>'
	}
	$('#tableData').append(html);
}

function KYCTasksGroupByDate(dateFrom,dateto){
	$.ajax({
	    url: '/KYCTasksGroupByDate/'+dateFrom+'/'+dateto,
	    dataType: 'json',
	    beforeSend: function(){
     		$("#loading").show();
	    },
	    complete: function(){
		$("#loading").hide();
	    },
	    success: function (data) {
	    	loadUnassignedTaskList(data);
	    	triggerLoadFunc();
	    }
	});
}


function setNextDate(date){
	var back_GTM = new Date(date);
	back_GTM.setDate(back_GTM.getDate() + 1);
	var b_dd = back_GTM.getDate();

	var b_mm = back_GTM.getMonth()+1;
	var b_yyyy = back_GTM.getFullYear();
	if (b_dd < 10) {
		b_dd = '0' + b_dd
	}
	if (b_mm < 10) {
		b_mm = '0' +b_mm
	}
	var back_date=  b_yyyy + '-' + b_mm + '-' + b_dd+"T00:00:00";
	return back_date;
}

function redirectKYCPage(date){
	var dateSplit = date.split("-");
	var key = val2key(dateSplit[1],monthDict);
	var date = dateSplit[2]+"-"+key+"-"+dateSplit[0]+"T00:00:00";
	var nextDate = setNextDate(date);
	window.location = '/KYCCheck/'+date+'/'+nextDate;
}

function val2key(val,array){
    for (var key in array) {
        this_val = array[key];
        if(this_val == val){
            return key;
            break;
        }
    }
}
function redirectToTaskPage(taskName,loanTypeName){
	window.location = '/dstasklistByName/'+taskName;
}
function getTasksByTaskName(taskName){
	$.ajax({
	    url: '/getTasksByTaskName/'+taskName,
	    dataType: 'json',
	    beforeSend: function(){
     		$("#loading").show();
	    },
	    complete: function(){
		$("#loading").hide();
	    },
	    success: function (data) {
		loadUnassignedTaskList(data);
		triggerLoadFunc();
	    }
	});
}


function val2key(val,array){
    for (var key in array) {
        this_val = array[key];
        if(this_val == val){
            return key;
            break;
        }
    }
}


function unClaimconfirmBox(id,shgName){
	$.confirm({
		     title: 'Do you want to unclaim '+"'"+shgName+"'"+'?',
		    confirmButton: 'Yes',
		    cancelButton: 'No',
		    confirm: function(){
		    unClaim(id)
		    },
		    cancel: function(){
		     }
		});
}


function claimconfirmBox(id,shgName,alldata){
	$.confirm({
		    title: 'Do you want to claim '+"'"+shgName+"'"+'?',
		    confirmButton: 'Yes',
		    cancelButton: 'No',
		    confirm: function(){
		    		var groupLoanID = alldata;
					groupLoanIDSplit = groupLoanID.split("_");
					groupID = groupLoanIDSplit[0];
					loanID =  groupLoanIDSplit[1];
					taskName =  groupLoanIDSplit[2];
					taskId =  groupLoanIDSplit[3];
					processInstanceId =  groupLoanIDSplit[4];
					loanTypeName =  groupLoanIDSplit[5];

					loanTypeId =  groupLoanIDSplit[6];	
		    if (group == "CreditTeam") {

				    DirectClaimTask(id,alldata);
		    }
		    else{

		  		claim(id);
		  	}

		    },
		    cancel: function(){
		     }
		});
}

function tasklistRedirect(taskName){
    window.location = '/taskListLoanType/'+taskName;
}

function getTaskList(taskName){
    var url = '';
    if(taskName == "KYC Check"){
        url = '/KYCTaskListByLoanType/';
    }
    if(taskName == "Query Response" || taskName == "BM Reply"){
        url = '/queryRespTaskList/';
    }
    if(taskName == "Proposal scrutiny" || taskName == "Upload disbursement docs"){
        url = '/proposalScrutinyTaskList/';
    }
    if(taskName == "Resolve Confirm Disbursement Query"){

        url = '/confirmDisburseRwrk/';
    }
    if(taskName == "Confirm Disbursement Query Response"){
        url = '/confDisburseQueryResponse/';
    }
    if(taskName == "Confirm disbursement"){
        url = '/confirmDisbursement/';
    }
    $.ajax({
	    url: url,
	    dataType: 'json',
	    beforeSend: function(){
     		$("#loading").show();
	    },
	    complete: function(){
		$("#loading").hide();
	    },
	    success: function (data) {

            loadUnassignedTaskList(data);
            triggerLoadFunc();
	    },
	    error: function (error) {
       	$("#loading").hide();
       	$.alert("Connection Time out");
        }
	});
}






function loadCTUserTasks(data){
	var groupTaskdata = data;

	var dataArray = [];
	$("#loading").hide();
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
			var StartDateTime = groupTaskdata[key]["startTime"];
		    	date2 = moment.parseZone(StartDateTime).utc().format();
			dateTime2 = moment(date2).format("DD-MM-YYYY HH:mm:ss");
			obj["StartDate"] = dateTime2;


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
			}
		    obj["assign"] = '<input type="checkbox" class="checkBoxClass" id='+obj["taskId"]+' ></input>';

		}
		dataArray.push(obj);

	}
	$.fn.dataTable.moment('DD-MM-YYYY HH:mm:ss');
	var table = $('#taskListTable').dataTable({
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
                { "mData": "taskName", "sTitle": "Task Name", "sWidth": "10%",className:"column"},
                { "mData": "taskDate","sTitle": "Task Date"  ,"sType": "date", className:"column"},
                { "mData": "StartDate","sTitle": "Process Start Date"  ,"sType": "date","sWidth": "5%", className:"column"},
                { "mData": "loanType","sTitle": "Product Name","sWidth": "5%"  , className:"column"},
                { "mData": "loanAmount","sTitle": "Loan Amt"  ,lassName:"column"},
                { "mData": "shgId","sTitle": "SHG ID"  ,  className:"column"},
                { "mData": "shgName","sTitle": "SHG Name"  , className:"column"},
                { "mData": "memberCount","sTitle": "Total Members" ,"sWidth": "3%", className:"column"},
                { "mData": "regionName","sTitle": "Region Name"  , className:"column"},
                { "mData": "clusterName","sTitle": "Cluster Name"  ,  className:"column"},
                { "mData": "centerName","sTitle": "Center Name"  ,  className:"column"},
		  { "mData": "assignee","sTitle": "Assignee"  ,  className:"column"},
                { "mData": "assign","sTitle":"<input type='checkbox' id='selectAll'> Re-Assign</input>" , "sWidth": "8%", className:"column"},

            ],
        }).fnDestroy();
        table = $('#taskListTable').DataTable( {
            "pageLength": 50
        } );
      triggerLoadFunc();
 }

function searchTasks(){
    var dataObj = {};
    var searchById;
    if(document.getElementById("searchBy").value != ""){
        searchById = document.getElementById("searchBy").value;
    }else{
        $.alert("Please choose search by parameter.");
        return false;
    }
    if(searchById == 1){
        var replaceTaskNames = {
            "Proposal scrutiny" : "Proposal scrutiny",
            "BM Reply" : "Proposal scrutiny",
	     "Approve Loan" : "Approve Loan",
            "Confirm disbursement" : "Confirm disbursement",
            "Confirm Disbursement Query Response" :  "Confirm disbursement"
        }
        if(document.getElementById("taskNameSelect")){

            if(!document.getElementById("taskNameSelect").value){
                $.alert("Please select the task name");
                return false;
            }
            else{
                dataObj["searchBy"] = searchById;
                //dataObj["taskName"] = replaceTaskNames[document.getElementById("taskNameSelect").value];
                dataObj["taskName"] = document.getElementById("taskNameSelect").value;
            }
        }
	}
	if(searchById == 2){
        if(document.getElementById("dateFrom") && document.getElementById("dateTo")){
            if(!document.getElementById("dateFrom").value){
                $.alert("Please select from date");
                return false;
            }
             if(!document.getElementById("dateTo").value){
                $.alert("Please select to date");
                return false;
            }
            var fromDate = document.getElementById("dateFrom").value;
            var toDate = document.getElementById("dateTo").value

            var validateFromDate = fromDate.split('/')[2]+'-'+fromDate.split('/')[1]+'-'+fromDate.split('/')[0];
            var validateToDate = toDate.split('/')[2]+'-'+toDate.split('/')[1]+'-'+toDate.split('/')[0];

            var timeDiff = new Date(validateToDate).getTime() - new Date(validateFromDate).getTime();
            if(timeDiff < 0){
                $.alert("DateTo cannot be less than DateFrom!");
                return false;
            }

            fromDate =  fromDate.split('/')[1]+'-'+fromDate.split('/')[0]+'-'+fromDate.split('/')[2];
            toDate=  toDate.split('/')[1]+'-'+toDate.split('/')[0]+'-'+toDate.split('/')[2];

            fromDate = setPrevNextDate(new Date(fromDate),"prev");
            toDate = setPrevNextDate(new Date(toDate),"next");

            dataObj["searchBy"] = searchById;
            dataObj["taskFromDate"] = fromDate+'T00:00:00';
            dataObj["taskToDate"] = toDate+'T00:00:00';
        }
	}
	if(searchById == 3){
        if(document.getElementById("dateFrom") && document.getElementById("dateTo")){
            if(!document.getElementById("dateFrom").value){
                $.alert("Please select from date");
                return false;
            }
             if(!document.getElementById("dateTo").value){
                $.alert("Please select to date");
                return false;
            }
            var fromDate = document.getElementById("dateFrom").value;
            var toDate = document.getElementById("dateTo").value

            var validateFromDate = fromDate.split('/')[2]+'-'+fromDate.split('/')[1]+'-'+fromDate.split('/')[0];
            var validateToDate = toDate.split('/')[2]+'-'+toDate.split('/')[1]+'-'+toDate.split('/')[0];

            var timeDiff = new Date(validateToDate).getTime() - new Date(validateFromDate).getTime();
            if(timeDiff < 0){
                $.alert("DateTo cannot be less than DateFrom!");
                return false;
            }

            fromDate =  fromDate.split('/')[1]+'-'+fromDate.split('/')[0]+'-'+fromDate.split('/')[2];
            toDate=  toDate.split('/')[1]+'-'+toDate.split('/')[0]+'-'+toDate.split('/')[2];

            fromDate = setPrevNextDate(new Date(fromDate),"prev");
            toDate = setPrevNextDate(new Date(toDate),"next");
            dataObj["searchBy"] = searchById;
            dataObj["processFromDate"] = fromDate+'T00:00:00';
            dataObj["processToDate"] = toDate+'T00:00:00';
            console.log(dataObj);
        }
	}
    if(searchById == 4){
        if(document.getElementById("taskAssignee")){

            if(!document.getElementById("taskAssignee").value){
                $.alert("Please select the assignee");
                return false;
            }
            else{
                dataObj["searchBy"] = searchById;
                dataObj["assignee"] = document.getElementById("taskAssignee").value;
            }
        }
	}
    $.ajax({
        url : '/listAssigneeTasks/',
        dataType:'json',
        type: "POST",
        beforeSend : function(data){
            $("#loading").show();
        },
        complete : function(data){
            $("#loading").hide();
        },
        success: function(data){
            console.log(data);
            loadCTUserTasks(data);
        },
        data:JSON.stringify(dataObj),
    });



}

$(document).on('click',"#selectAll", function (){
    $(".checkBoxClass").prop('checked', $(this).prop('checked'));
});


function reassignAllTasks(){
    var dataObj = {};
    var arr = [];
    $("input:checkbox").each(function(){
		 if($(this).is(":checked")){
			 var val =$(this).attr("id") ;
			 if(val.startsWith("selectAll") != true){
			    arr.push(val);
			 }
			}
	});
	console.log(arr);
	if(arr.length  == 0){
		$.alert('No task is checked to re-assign!');
		return false;
	}
	if(document.getElementById("taskReassignee")){
	    if(!document.getElementById("taskReassignee").value){
            $.alert("Please select the re-assignee");
            return false;
	    }
	    else{
	    dataObj["reassignee"] = document.getElementById("taskReassignee").value;
	    }
	}

	dataObj["taskIdArr"] = arr;
    $.ajax({
        url : '/reassignAllTasks/',
        type:"POST",
        success: function(data){
            if( data == "Successful"){
                $.alert({
                    title: 'Tasks have been re-assigned successfully!',
                    confirmButton: 'Yes',
                    cancelButton: 'No',
                    confirm: function(){
                        window.location.reload();
                    },
                    cancel: function(){
                    }
                });
            }

        },
        data : JSON.stringify(dataObj),
    });
}

$(document).on("change",".searchBy",function(){

		if(this.value == 1){
		    $('#taskNameSelect').val("");
			$('#taskNameSelect').css("display","-webkit-inline-box");
			$('#taskAssignee').css("display","none");
			$('#dateSelect').css("display","none");
			searchById = 1;
		}
		else if(this.value == 3 || this.value == 2){
		    $(".datepicker").val("");
			$('#taskNameSelect').css("display","none");
			$('#dateSelect').css("display","-webkit-inline-box");
			$('#taskAssignee').css("display","none");
			searchById = 2;
		}
		else if(this.value == 4){
		    $('#taskAssignee').val("");
			$('#taskNameSelect').css("display","none");
			$('#dateSelect').css("display","none");
			$('#taskAssignee').css("display","-webkit-inline-box");
			searchById = 3;
		}
		else{
		    $('#taskNameSelect').css("display","none");
			$('#dateSelect').css("display","none");
			$('#taskAssignee').css("display","none");
		}
	});


function setPrevNextDate(date,key)
{
	if(key == "prev"){
   		 var back_GTM = new Date(date);
   		 back_GTM.setDate(back_GTM.getDate() - 1);
    }
    if(key == "next"){
   		 var back_GTM = new Date(date);
   		 back_GTM.setDate(back_GTM.getDate() + 1);
    }
    var b_dd = back_GTM.getDate();
    var b_mm = back_GTM.getMonth()+1;
    var b_yyyy = back_GTM.getFullYear();
    if (b_dd < 10) {
        b_dd = '0' + b_dd
    }
    if (b_mm < 10) {
        b_mm = '0' +b_mm
    }
    var back_date=  b_yyyy + '-' + b_mm + '-' + b_dd;
	return back_date;
}

function RejectConfirmBox(status){
        var statusKey = '';
        if(status == "Rejected"){
            statusKey = ' reject ';
        }           
        if(status == "Approved"){
            statusKey = ' approve ';
        }
        if(status == "Rework"){
            statusKey = ' rework ';
        }        
        $.confirm({
            title: 'Do you really want to '+statusKey+'',
            confirmButton: 'Yes',
            cancelButton: 'No',
            confirm: function(){
                updateMemValidationStatus(status);
            },
            cancel: function(){
            }
        });
    }    
function ApproveConfirmBox(status){
        var statusKey = '';
        if(status == "Approved"){
            statusKey = ' approve ';
        }
        if(status == "Rework"){
            statusKey = ' rework ';
        }
        $.confirm({
            title: 'Do you really want to '+statusKey+'',
            confirmButton: 'Yes',
            cancelButton: 'No',
            confirm: function(){
                submitKYCForm(status);
            },
            cancel: function(){
            }
        });
    } 

