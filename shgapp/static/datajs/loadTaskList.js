function loadUnassignedTaskList(data){
	var groupTaskdata = data;
	//var groupTaskdata = JSON.parse(groupTaskList);
	var dataArray = [];
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
				obj["loanType"] = "PLL";
				obj["shgId"] = "SHG ID";
				obj["shgName"] = "SHG Name";
				obj["groupLoanId"] = obj["groupId"]+"_"+obj["loanId"];
			}
		obj["claim"] = '<button type="submit" onclick="claim('+"'"+obj["taskId"]+"'"+');" class="btn btn-Danger button">Claim</button>';
		
		
		}
		dataArray.push(obj);
		
	}
	var table = $('#taskListTable').dataTable({
            data: dataArray,
            rowId: "groupLoanId",
            destroy: true,  
            "bProcessing": true,
            "scrollY": true,
            fixedHeader : true,
            "sPaginationType": "full_numbers",
            "bSortable": true,    

            "aoColumns": [    
                { "mData": "slNo", "sTitle": "S.No", "sWidth": "5%", className:"column"},     
                { "mData": "taskName", "sTitle": "Task Name", "sWidth": "15%", className:"column"},                     
                { "mData": "taskDate","sTitle": "Task Date"  , "sWidth": "10%", className:"column"},
                { "mData": "loanType","sTitle": "Loan Type"  , "sWidth": "8%", className:"column"},
                { "mData": "shgId","sTitle": "SHG ID"  , "sWidth": "10%", className:"column"},
                { "mData": "shgName","sTitle": "SHG Name"  , "sWidth": "15%", className:"column"},
                { "mData": "groupLocation","sTitle": "Group Location"  , "sWidth": "15%", className:"column"},
                { "mData": "claim","sTitle": "Claim"  , "sWidth": "10%", className:"column"},
                  
            ],                       
        }).fnDestroy();
        table = $('#taskListTable').DataTable( {
            //paging: false
        } );  
 }

function loadAssignedTaskList(){
	var myTaskdata = JSON.parse(myTaskList);
	var dataArray = [];
	for(var key in myTaskdata){
		var obj={};
		if(myTaskdata[key]["name"]  && myTaskdata[key]["created"]){
			obj["slNo"] = parseInt(key)+1;
			obj["taskName"] = '<a class="tdViewData">'+myTaskdata[key]["name"]+'</a>';
			obj["taskDate"] = '<a class="tdViewData">'+myTaskdata[key]["created"]+'</a>';
			obj["taskId"]   = myTaskdata[key]["id"]
		
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
				obj["loanType"] = '<a class="tdViewData">'+"PLL"+'</a>';
				obj["shgId"] = '<a class="tdViewData">'+"SHG ID"+'</a>';
				obj["shgName"] = '<a class="tdViewData">'+"SHG Name"+'</a>';
				obj["groupLoanId"] = obj["groupId"]+"_"+obj["loanId"]+"_"+myTaskdata[key]["name"];
			}
		obj["unClaim"] = '<button type="submit" onclick="unClaim('+"'"+obj["taskId"]+"'"+');" class="btn btn-Danger button">UnClaim</button>';
		
		}
		dataArray.push(obj);
	}
	var table = $('#taskListTable').dataTable({
            data: dataArray,
            rowId: "groupLoanId",
            destroy: true,  
            "bProcessing": true,
            "scrollY": true,
            fixedHeader : true,
            "sPaginationType": "full_numbers",
            "bSortable": true,    

            "aoColumns": [    
                { "mData": "slNo", "sTitle": "S.No", "sWidth": "5%", className:"column"},     
                { "mData": "taskName", "sTitle": "Task Name", "sWidth": "15%", className:"column"},                     
                { "mData": "taskDate","sTitle": "Task Date"  , "sWidth": "10%", className:"column"},
                { "mData": "loanType","sTitle": "Loan Type"  , "sWidth": "8%", className:"column"},
                { "mData": "shgId","sTitle": "SHG ID"  , "sWidth": "10%", className:"column"},
                { "mData": "shgName","sTitle": "SHG Name"  , "sWidth": "15%", className:"column"},
                { "mData": "groupLocation","sTitle": "Group Location"  , "sWidth": "15%", className:"column"},
                { "mData": "unClaim","sTitle": "UnClaim"  , "sWidth": "10%", className:"column"},
                  
            ],                       
        }).fnDestroy();
        table = $('#taskListTable').DataTable( { } );  
}

$(document).ready(function (){
	$('.tdViewData').click(function() {
	    	var trId = $(this).closest('tr').attr('id');
	    	var groupLoanID = trId;
		groupLoanIDSplit = groupLoanID.split("_");
		groupID = groupLoanIDSplit[0];
		loanID = groupLoanIDSplit[1];
		taskName = groupLoanIDSplit[2];
		redirectPage(groupID,loanID,taskName);
	});
	$('.button').click(function() {
	    	var nRow = $(this).parent().parent()[0];
	    	console.log(nRow);
	    	var table=$("#taskListTable").dataTable();
		table.fnDeleteRow( nRow, null, true );
		$('#taskListTable tr td:first-child').each(function(i){
	        $(this).html(parseInt(i+1));
		});
	});
});


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
	    success: function (data) {
	    	loadUnassignedTaskList(data);
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


