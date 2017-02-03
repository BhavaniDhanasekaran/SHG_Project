function loadUnassignedTaskList(data){
	var groupTaskdata = data;
	var dataArray = [];
	$("#loading").hide();
	for(var key in groupTaskdata){
		var obj={};
		if(groupTaskdata[key]["name"]  && groupTaskdata[key]["created"]){
			obj["slNo"] = parseInt(key)+1;
			obj["taskName"] = groupTaskdata[key]["name"];
			obj["taskDate"] = groupTaskdata[key]["created"];
			obj["taskId"]   = groupTaskdata[key]["id"]
		
		}
		if(groupTaskdata[key]["customerData"]){
			var customerData = JSON.parse(groupTaskdata[key]["customerData"]);
			for(var data in customerData){
				obj["groupId"] = customerData["groupId"];
				obj["loanId"] = customerData["loanId"];
				obj["groupLocation"] = customerData["groupLocation"];
				obj["loanType"] = customerData["loanTypeName"];
				//obj["shgId"] = customerData["groupId"];
				obj["shgId"] = customerData["appGroupId"];
				obj["shgName"] =customerData["groupName"];
				obj["groupLoanId"] = obj["groupId"]+"_"+obj["loanId"];
				obj["clusterName"] =customerData["clusterName"];
				obj["centerName"] =customerData["centerName"];
				obj["regionName"] =customerData["regionName"];
				obj["loanApplicationDate"] =customerData["loanApplicationDate"];
				obj["groupFormationDate"] =customerData["groupFormationDate"];
				
			}
		obj["claim"] = '<button type="submit" onclick="claim('+"'"+obj["taskId"]+"'"+');" class="btn btn-danger btn-md button">Claim</button>';
		
		
		}
		dataArray.push(obj);
		
	}
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
                //{ "mData": "slNo", "sTitle": "S.No", "sWidth": "3%", className:"column"},     
                { "mData": "taskName", "sTitle": "Task Name", "sWidth": "13%", className:"column"},                     
                { "mData": "taskDate","sTitle": "Task Date"  , "sWidth": "8%", className:"column"},
                { "mData": "loanType","sTitle": "Product Name"  , "sWidth": "8%", className:"column"},
                { "mData": "shgId","sTitle": "SHG ID"  , "sWidth": "8%", className:"column"},
                { "mData": "shgName","sTitle": "SHG Name"  , "sWidth": "10%", className:"column"},
                { "mData": "loanApplicationDate","sTitle": "Loan App. Dt"  , "sWidth": "8%", className:"column"},
                { "mData": "groupFormationDate","sTitle": "Grp Frmtn Dt"  , "sWidth": "8%", className:"column"},
                { "mData": "regionName","sTitle": "Region Name"  , "sWidth": "12%", className:"column"},
                { "mData": "clusterName","sTitle": "Cluster Name"  , "sWidth": "12%", className:"column"},
                { "mData": "centerName","sTitle": "Center Name"  , "sWidth": "12%", className:"column"},
                { "mData": "claim","sTitle": "Claim"  , "sWidth": "10%", className:"column"},
                  
            ],                       
        }).fnDestroy();
        table = $('#taskListTable').DataTable( {
            "pageLength": 50 
        } );  
 }

function loadAssignedTaskList(){
	$("#loading").hide();
	var myTaskdata = JSON.parse(myTaskList);
	var dataArray = [];
	for(var key in myTaskdata){
		var obj={};
		if(myTaskdata[key]["name"]  && myTaskdata[key]["created"]){
			obj["slNo"] = parseInt(key)+1;
			obj["taskName"] = '<a class="tdViewData">'+myTaskdata[key]["name"]+'</a>';
			obj["taskDate"] = '<a class="tdViewData">'+myTaskdata[key]["created"]+'</a>';
			obj["taskId"]   = myTaskdata[key]["id"]
			obj["processInstanceId"] = myTaskdata[key]["processInstanceId"]
		}
		if(myTaskdata[key]["customerData"]){
			var customerData = JSON.parse(myTaskdata[key]["customerData"]);
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
				obj["loanType"] = '<a class="tdViewData">'+customerData["loanTypeName"]+'</a>';
				//obj["shgId"] = '<a class="tdViewData">'+customerData["groupId"]+'</a>';
				obj["shgId"] = '<a class="tdViewData">'+customerData["appGroupId"]+'</a>';
				obj["shgName"] = '<a class="tdViewData">'+customerData["groupName"]+'</a>';
				obj["groupLoanId"] = obj["groupId"]+"_"+obj["loanId"]+"_"+myTaskdata[key]["name"]+"_"+obj["taskId"]+"_"+obj["processInstanceId"]+"_"+customerData["loanTypeName"];
				obj["clusterName"] ='<a class="tdViewData">'+customerData["clusterName"]+'</a>';
				obj["centerName"] ='<a class="tdViewData">'+customerData["centerName"]+'</a>';
				obj["regionName"] ='<a class="tdViewData">'+customerData["regionName"]+'</a>';
				obj["loanApplicationDate"] ='<a class="tdViewData">'+customerData["loanApplicationDate"]+'</a>';
				obj["groupFormationDate"] ='<a class="tdViewData">'+customerData["groupFormationDate"]+'</a>';
				
				
				
			}
		obj["unClaim"] = '<button type="submit" onclick="unClaim('+"'"+obj["taskId"]+"'"+');" class="btn btn-danger btn-md button">UnClaim</button>';
		
		}
		dataArray.push(obj);
	}
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
              // { "mData": "slNo", "sTitle": "S.No", "sWidth": "3%", className:"column"},     
                { "mData": "taskName", "sTitle": "Task Name", "sWidth": "13%", className:"column"},                     
                { "mData": "taskDate","sTitle": "Task Date"  , "sWidth": "8%", className:"column"},
                { "mData": "loanType","sTitle": "Product Name"  , "sWidth": "8%", className:"column"},
                { "mData": "shgId","sTitle": "SHG ID"  , "sWidth": "8%", className:"column"},
                { "mData": "shgName","sTitle": "SHG Name"  , "sWidth": "10%", className:"column"},
                { "mData": "loanApplicationDate","sTitle": "Loan App. Dt"  , "sWidth": "8%", className:"column"},
                { "mData": "groupFormationDate","sTitle": "Grp Frmtn Dt"  , "sWidth": "8%", className:"column"},
                { "mData": "regionName","sTitle": "Region Name"  , "sWidth": "12%", className:"column"},
                { "mData": "clusterName","sTitle": "Cluster Name"  , "sWidth": "12%", className:"column"},
                { "mData": "centerName","sTitle": "Center Name"  , "sWidth": "12%", className:"column"},
                { "mData": "unClaim","sTitle": "UnClaim"  , "sWidth": "10%", className:"column"},
                  
            ],                       
        }).fnDestroy();
        table = $('#taskListTable').DataTable( {
        	"pageLength": 50 
        } );  
}

$(document).ready(function (){
	taskCount();
	
	$('.tdViewData').click(function() {
	    	var trId = $(this).closest('tr').attr('id');
	    	var groupLoanID = trId;
		groupLoanIDSplit = groupLoanID.split("_");
		groupID = groupLoanIDSplit[0];
		loanID = groupLoanIDSplit[1];
		taskName = groupLoanIDSplit[2];
		taskId = groupLoanIDSplit[3];
		processInstanceId = groupLoanIDSplit[4];
		loanType = groupLoanIDSplit[5];
		window.location = '/SHGForm/'+groupID+'/'+loanID+'/'+taskId+'/'+processInstanceId+'/'+taskName+'/'+loanType;
		//redirectPage(groupID,loanID,taskName,taskId,processInstanceId);
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
	$('.sorting').click(function() {
		triggerLoadFunc();
	});
	$('.button').click(function() {
	    	var nRow = $(this).parent().parent()[0];
	    	var table=$("#taskListTable").dataTable();
		table.fnDeleteRow( nRow, null, true );
		var rows = $('#taskListTable >tbody >tr').length;
		if(rows == 1){
			if($('td').hasClass('dataTables_empty')) {
				window.location.reload();
			}
		}
	});
	$('.progress .progress-bar').css("width",
                function() {
                    return $(this).attr("aria-valuenow") + "%";
                }
        );
});

function triggerLoadFunc(){
	taskCount();
	$('.tdViewData').click(function() {
	    	var trId = $(this).closest('tr').attr('id');
	    	var groupLoanID = trId;
		groupLoanIDSplit = groupLoanID.split("_");
		groupID = groupLoanIDSplit[0];
		loanID = groupLoanIDSplit[1];
		taskName = groupLoanIDSplit[2];
		taskId = groupLoanIDSplit[3];
		processInstanceId = groupLoanIDSplit[4];
		window.location = '/SHGForm/'+groupID+'/'+loanID+'/'+taskId+'/'+processInstanceId+'/'+taskName;
		//redirectPage(groupID,loanID,taskName,taskId,processInstanceId);
	});
	$('.button').click(function() {
	    	var nRow = $(this).parent().parent()[0];
	    	var table=$("#taskListTable").dataTable();
		table.fnDeleteRow( nRow, null, true );
		var rows = $('#taskListTable >tbody >tr').length;
		if(rows == 1){
			if($('td').hasClass('dataTables_empty')) {
				window.location.reload();
			}
		}
	});
	

}


function taskCount(){
	$.ajax({
	    url: '/tasksCount',
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
	   
	    }
	});
}


function claim(d){
	$.ajax({
	    url: '/task/'+d+'/claim/user',
	    dataType: 'json',
	    success: function (data) {
		taskCount();
	    }
	});
}

function unClaim(d){
	$.ajax({
	    url: '/task/'+d+'/unclaim/user',
	    dataType: 'json',
	    success: function (data) {
		taskCount();
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
				if($.inArray(datesplit[0], dateArray) == -1){
					dateArray.push(datesplit[0]);
					dateDict[datesplit[0]] = i+1;
				}
				else{
					dateDict[datesplit[0]] = dateDict[datesplit[0]]+1;
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
	var date = date+"T00:00:00";
	var nextDate = setNextDate(date);
	window.location = '/KYCCheck/'+date+'/'+nextDate;
}

function redirectToTaskPage(taskName){
	window.location = '/dstasklistByName/'+taskName;
}
function getBMTasksByTaskName(taskName){
	$.ajax({
	    url: '/getBMTasksByTaskName/'+taskName,
	    dataType: 'json',
	    beforeSend: function(){
     		$("#loading").show();
	    },
	    complete: function(){
		$("#loading").hide();
	    },
	    success: function (data) {
		taskCount();
		loadUnassignedTaskList(data);
		triggerLoadFunc();
	    }
	});	

}


