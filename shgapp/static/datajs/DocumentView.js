

alert("hi");


function DocumnetView(){

	var groupID="68600";
	console.log(groupID);

	$.ajax({
	    url: '/DocumentView/'+groupID,
	    dataType: 'json',
	    success: function (data) {
		groupData = data;
		console.log(groupData);
		}
	   
	});
	}

DocumnetView();	



