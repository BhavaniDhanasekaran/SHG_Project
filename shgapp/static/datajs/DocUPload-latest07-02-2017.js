var groupId = groupId;
function loanDocument(loanTypeId){
    var loanTypeId=loanTypeId;
    var docURLDict = {};
    var documentData ;
    var docUploadedDict = {};
    	  $.ajax({
		    url: '/DocumentView/'+groupId,
		    dataType: 'json',
		    success: function (data) {
			docUploadedDict = data["data"];
			for(var key in docUploadedDict){
				var docId = docUploadedDict[key]["documentName"].split("*")[1];
				var docName = docUploadedDict[key]["documentName"].split("*")[0];
				docURLDict[docUploadedDict[key]["documentName"]] = docUploadedDict[key]["documentPath"];
			}
			$.ajax({
			      url: '/loanDocument/'+loanTypeId,
			      dataType: 'json',
			      success: function (data) {
			      var documentData = data["data"];
			       var docRow = '';
			       var countArray =[];
			      for(var key in documentData){
				      	for(var key1 in docURLDict){
				      		if(key1 == (documentData[key]["documentName"])){
				      		countArray.push(parseInt(key)+1);
				      			docRow += '<tr> <td>'+(parseInt(key)+1)+'</td><td>'+documentData[key]["documentName"]+'</td>'
					      		     +'<td><input type = "file" name = "'+ documentData[key]["documentName"] +'" id = "'+ documentData[key]["documentId"] +'" style="display: none;" /></input>'
					      		     +'<span><button type="button" style="display:none;" class="btn btn-primary js-upload-photos" id = "'+ documentData[key]["documentId"]+'_1'+'" name="'+documentData[key]["documentName"]+'_'+documentData[key]["documentId"]+'"></span>'
					      		     +'<span class="glyphicon glyphicon-cloud-upload"></span> Upload  </button>'
					      		     +'<span><button type="button"  onclick="window.open('+"'"+docURLDict[key1]+"'"+');" class="btn btn-danger" id = "'+ documentData[key]["documentId"]+'_2'+'" name="'+documentData[key]["documentName"]+'_'+documentData[key]["documentId"]+'"></span>'
					      		     +'<span class="glyphicon glyphicon-cloud-upload"></span> View  </button></td></tr> ';
				      		}
				      	}
			      		if($.inArray(parseInt(key)+1, countArray) == -1){
			      			docRow += '<tr> <td>'+(parseInt(key)+1)+'</td><td>'+documentData[key]["documentName"]+'</td>'
					      		     +'<td><input type = "file" name = "'+ documentData[key]["documentName"] +'" id = "'+ documentData[key]["documentId"] +'" style="display: none;" /></input>'
					      		     +'<span><button type="button" class="btn btn-primary js-upload-photos" id = "'+ documentData[key]["documentId"]+'_1'+'" name="'+documentData[key]["documentName"]+'_'+documentData[key]["documentId"]+'"></span>'
					      		     +'<span class="glyphicon glyphicon-cloud-upload"></span> Upload  </button>'
					      		     +'<span><button type="button" style="display:none;" class="btn btn-danger" id = "'+ documentData[key]["documentId"]+'_2'+'" name="'+documentData[key]["documentName"]+'_'+documentData[key]["documentId"]+'"></span>'
					      		     +'<span class="glyphicon glyphicon-cloud-upload"></span> View  </button></td></tr> ';
			      		}
			       }	
			       document.getElementById("records_table").innerHTML = docRow;
			      trigger();
			    }
			    
			  });
			}
		});
}

$(document).ready(function (){
	$(".js-upload-photos").click(function() {
	    var oldid="";
	    var docName="";
	    oldid=$(this).attr('name');
	    var newid = oldid.split("_")[1];
	    docName=oldid.split("_")[0];
	    uploaddoc(newid,docName);

	});
});
function trigger(){
	$(".js-upload-photos").click(function() {
	    var oldid="";
	    var docName="";
	    oldid=$(this).attr('name');
	    var newid = oldid.split("_")[1];
	    docName=oldid.split("_")[0];
	    uploaddoc(newid,docName,groupId);
	 });
}

function uploaddoc(fileid,docName,groupId){
  $("#"+fileid).click();
//$("#loading").show();
  $("#"+fileid).fileupload({
    dataType: 'json',
    sequentialUploads: true,
    start: function (e) {
      $("#modal-progress").modal("show");
    },
    stop: function (e) {
      $("#modal-progress").modal("hide");
    },
    progressall: function (e, data) {
      var progress = parseInt(data.loaded / data.total * 100, 10);
      var strProgress = progress + "%";
      $(".progress-bar").css({"width": strProgress});
      $(".progress-bar").text(strProgress);
    },

    done: function (e, data) {
      if (data.result.is_valid) {
          var groupId= document.getElementById("groupId").innerHTML;
          var fileName=docName;
          
          var newfilid=fileid;
          var newfileName=docName+'*'+fileid;
           var oldfileName=docName;
          var s3url=data.result.url;
          UpdateUrl(groupId,oldfileName,s3url,fileid);
        $("#gallery tbody").prepend(
          "<tr><td><a href='" + data.result.url + "'>" + data.result.name + "</a></td> <td><a href='" + data.result.url + "'>" + "delete"+ "</a></td></tr>"
        )
      }
    }

  });

}
  



  function UpdateUrl(groupId,oldfileName,s3url,fileid){
      var dataObj = {};
      var uploadData = { "groupId" : String(groupId),"name": String(oldfileName), "docSize": "0","userId": "1996","docPathServer" : String(s3url) }
      dataObj["uploadData"] = uploadData;
      $.ajax({
      url: '/updateUrl/',
      dataType: 'json',
      type:"POST",
      success: function (data) {
                  if(data.message == 'Document Uploaded Successfully.')
                  {
                  	//$("#loading").hide();
                       alert("Document Uploaded Successfully.");
                       $("#"+fileid+"_1").css("display","none");
                        $("#"+fileid+"_2").css("display","block");
                        $("#"+fileid+"_2").attr('onClick', 'window.open('+"'"+s3url+"'"+');');
                       //$("#"+fileid+"_2").attr('onClick', 'window.open ('+"'"+s3url+"'"+',"mywindow","menubar=1,resizable=1,width=350,height=250");'); 
                  }
                  else 
                  {
                      alert("Error Upload");
                  }
      },
      data: JSON.stringify(dataObj)
  });

   
  }


