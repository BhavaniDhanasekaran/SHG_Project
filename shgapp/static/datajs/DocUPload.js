var groupId = groupId;

function loanDocument(loanTypeId) {
    var loanTypeId = loanTypeId;
    var docURLDict = {};
    var documentData;
    var docUploadedDict = {};
    $.ajax({
        url: '/DocumentView/' + groupId,
        dataType: 'json',
        success: function(data) {
            docUploadedDict = data["data"];
            for (var key in docUploadedDict) {
                var docId = docUploadedDict[key]["documentName"].split("*")[1];
                var docName = docUploadedDict[key]["documentName"].split("*")[0];
                docURLDict[docUploadedDict[key]["documentName"]] = docUploadedDict[key]["documentPath"] + '*' + docUploadedDict[key]["docId"];
                // console.log(docURLDict[docUploadedDict[key]["documentName"]]);
            }

            $.ajax({
                url: '/loanDocument/' + loanTypeId,
                dataType: 'json',
                success: function(data) {
                    var documentData = data["data"];
                    var docRow = '';
                    var countArray = [];
                    for (var key in documentData) {
                        for (var key1 in docURLDict) {
                            if (key1 == (documentData[key]["documentName"].split("*")[0])) {
                                countArray.push(parseInt(key) + 1);
                                docRow += '<tr> <td>' + (parseInt(key) + 1) + '</td><td>' + documentData[key]["documentName"] + ' </td>' +
                                    '<td><input type = "file" name = "' + documentData[key]["documentName"] + '" id = "' + documentData[key]["documentId"] + '" style="display: none;" /></input>' +
                                    '<span><button type="button" style="display:none;" class="btn btn-primary js-upload-photos" id = "' + documentData[key]["documentId"] + '_1' + '" name="' + documentData[key]["documentName"] + '_' + documentData[key]["documentId"] + '"></span>' +
                                    '<span class="glyphicon glyphicon-cloud-upload"></span> Upload  </button>' +
                                    '<span><button type="button"  onclick="window.open(' + "'" + docURLDict[key1].split("*")[0] + "'" + ').focus();" class="btn btn-danger" id = "' + documentData[key]["documentId"] + '_2' + '" name="' + documentData[key]["documentName"] + '_' + documentData[key]["documentId"] + '"></span>' +
                                    '<span class="glyphicon glyphicon-cloud-upload"></span> View  </button>' +
                                    '<input type = "file" id="' + documentData[key]["documentId"] + '_Edit' + '" style="display: none;" /></input>' +
                                    '<span>   <button type="button"  class="btn btn-success js-upload-photos2" id = "' + documentData[key]["documentId"] + '_1' + '" name="' + docURLDict[key1].split("*")[1] + '"></span>' +
                                    '<span class="glyphicon glyphicon-edit"></span> Edit  </button></td></tr> ';
                            }
                        }
                        if ($.inArray(parseInt(key) + 1, countArray) == -1) {
                            docRow += '<tr> <td>' + (parseInt(key) + 1) + '</td><td>' + documentData[key]["documentName"] + '</td>' +
                                '<td><input type = "file" name = "' + documentData[key]["documentName"] + '" id = "' + documentData[key]["documentId"] + '" style="display: none;" /></input>' +
                                '<span><button type="button" class="btn btn-primary js-upload-photos" id = "' + documentData[key]["documentId"] + '_1' + '" name="' + documentData[key]["documentName"] + '_' + documentData[key]["documentId"] + '"></span>' +
                                '<span class="glyphicon glyphicon-cloud-upload"></span> Upload  </button>' +
                                '<span><button type="button" style="display:none;" class="btn btn-danger" id = "' + documentData[key]["documentId"] + '_2' + '" name="' + documentData[key]["documentName"] + '_' + documentData[key]["documentId"] + '"></span>' +
                                '<span class="glyphicon glyphicon-cloud-upload"></span> View  </button> ' +
                                '<input type = "file" id="' + documentData[key]["documentId"] + '_Edit' + '" style="display: none;" /></input>' +
                                '<span><button type="button"   style="display: none;"  class="btn btn-success js-upload-photos2" id = "' + documentData[key]["documentId"] + '_3' + '" name=""></span>' +
                                '<span class="glyphicon glyphicon-edit"></span> Edit  </button></td></tr>';
                        }
                    }
                    document.getElementById("records_table").innerHTML = docRow;
                    trigger();
                }
            });
        }
    });
}
$(document).ready(function() {
    $(".js-upload-photos").click(function() {
        var oldid = "";
        var docName = "";
        oldid = $(this).attr('name');
        var newid = oldid.split("_")[1];
        docName = oldid.split("_")[0];
        uploaddoc(newid, docName);
    });
    $(".js-upload-photos2").click(function() {
        var UniqueId = "";
        var doceditId = "";
        var newdoceditId = "";
        UniqueId = $(this).attr('name');
        doceditId = $(this).attr('id');
        newdoceditId = doceditId.split("_")[0];
        //newdoceditId2 = newdoceditId+ "_2" 
        Editdoc(UniqueId, newdoceditId);
    });
});

function trigger() {
    $(".js-upload-photos").click(function() {
        var oldid = "";
        var docName = "";
        oldid = $(this).attr('name');
        var newid = oldid.split("_")[1];
        docName = oldid.split("_")[0];
        uploaddoc(newid, docName, groupId);
    });
    $(".js-upload-photos2").click(function() {
        var UniqueId = "";
        var doceditId = "";
        var newdoceditId = "";
        //var newdoceditId2="";
        //var docName="";
        UniqueId = $(this).attr('name');
        doceditId = $(this).attr('id');
        newdoceditId = doceditId.split("_")[0];
        //newdoceditId2 = newdoceditId+ "_2" ;
        console.log(newdoceditId);
        Editdoc(UniqueId, newdoceditId);
    });
}

function uploaddoc(fileid, docName, groupId) {
    $("#" + fileid).click();
    //$("#loading").show();
    $("#" + fileid).fileupload({
        dataType: 'json',
        sequentialUploads: true,
        start: function(e) {
            //$("#modal-progress").modal("show");
             disableActiveTab();
            $("#loading").show();

        },
        stop: function(e) {
            //$("#modal-progress").modal("hide");
            $("#loading").hide()
             enableActiveTab();
        },
        /*progressall: function(e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            var strProgress = progress + "%";
            $(".progress-bar").css({
                "width": strProgress
            });
            $(".progress-bar").text(strProgress);
        },*/
        done: function(e, data) {
            if (data.result.is_valid) {
                var groupId = document.getElementById("groupId").innerHTML;
                var fileName = docName;
                var newfilid = fileid;
                var newfileName = docName + '*' + fileid;
                var oldfileName = docName;
                var s3url = data.result.url;
                UpdateUrl(groupId, oldfileName, s3url, fileid);
                $("#gallery tbody").prepend(
                    "<tr><td><a href='" + data.result.url + "'>" + data.result.name + "</a></td> <td><a href='" + data.result.url + "'>" + "delete" + "</a></td></tr>"
                )
            }
        }
    });
}

function UpdateUrl(groupId, oldfileName, s3url, fileid) {
    var dataObj = {};
    var uploadData = {
        "groupId": String(groupId),
        "name": String(oldfileName),
        "docSize": "0",
        "userId": "1996",
        "docPathServer": String(s3url)
    }
    dataObj["uploadData"] = uploadData;
    $.ajax({
        url: '/updateUrl/',
        dataType: 'json',
        type: "POST",
        success: function(data) {
            console.log(data.message);
            if (data.message == 'Group Document Uploaded Successfully.') {
                //$("#loading").hide();
                $.alert("Document Uploaded Successfully.");
                $("#" + fileid + "_1").css("display", "none");
                $("#" + fileid + "_3").css("display", "inline-block");
                $("#" + fileid + "_2").css("display", "inline-block");
                $("#" + fileid + "_2").attr('onClick', 'window.open(' + "'" + s3url + "'" + ').focus();');
                $("#" + fileid + "_3").attr('name', data.data);
                //$("#"+fileid+"_2").attr('onClick', 'window.open ('+"'"+s3url+"'"+',"mywindow","menubar=1,resizable=1,width=350,height=250");');
            } else {
                $.alert("Error Upload");
            }
        },
        data: JSON.stringify(dataObj)
    });
}

function Editdoc(UniqueId, newdoceditId) {
    console.log('newdoceditId');
    console.log(newdoceditId);
    console.log(loanId);
    $("#" + newdoceditId + "_Edit").click();
    //$("#loading").show();
    $("#" + newdoceditId + "_Edit").fileupload({
        dataType: 'json',
        sequentialUploads: true,
        start: function(e) {
           // $("#modal-progress").modal("show");
             disableActiveTab();
            $("#loading").show()

        },
        stop: function(e) {
            //$("#modal-progress").modal("hide");
            $("#loading").hide();
             enableActiveTab();
        },
        /*progressall: function(e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            var strProgress = progress + "%";
            $(".progress-bar").css({
                "width": strProgress
            });
            $(".progress-bar").text(strProgress);
        },*/
        done: function(e, data) {
            if (data.result.is_valid) {
                var groupId = document.getElementById("groupId").innerHTML;
                //  var fileName=docName;
                //var newfilid=UniqueId;
                //var newfileName=docName+'*'+fileid;
                //// var oldfileName=docName;
                var s3url = data.result.url;
                EditUrl(groupId, UniqueId, s3url, newdoceditId,loanId);
                $("#gallery tbody").prepend(
                    "<tr><td><a href='" + data.result.url + "'>" + data.result.name + "</a></td> <td><a href='" + data.result.url + "'>" + "delete" + "</a></td></tr>"
                )
            }
        }
    });
}

function EditUrl(groupId, UniqueId, s3url, newdoceditId,loanId) {
    console.log(UniqueId);
    var dataObj2 = {};
    var uploadData = {
        "loanId": String(loanId),
        "id": String(UniqueId),
        "docSize": "0",
        "userId": "1996",
        "docPathServer": String(s3url)
    }
    dataObj2["uploadData"] = uploadData;
    $.ajax({
        url: '/editUrl/',
        dataType: 'json',
        type: "POST",
        success: function(data) {
            if (data.message == "Group Document Updated Successfully.") {
                //$("#loading").hide();
                $.alert("Document Updated Successfully.");
                $("#" + newdoceditId + "_2").attr('onClick', 'window.open(' + "'" + s3url + "'" + ').focus();');
                //$("#" + newdoceditId + "_3").attr('name',data.data);
                //$("#"+fileid+"_2").attr('onClick', 'window.open ('+"'"+s3url+"'"+',"mywindow","menubar=1,resizable=1,width=350,height=250");');
            } else {
                $.alert("Error update");
            }
        },
        data: JSON.stringify(dataObj2)
    });
}