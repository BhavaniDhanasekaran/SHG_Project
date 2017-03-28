var groupId = groupId;
var loanTypeId;
function loanDocument(loanTypeId) {
    loanTypeId = loanTypeId;
    var docURLDict = {};
    var documentData;
    var docUploadedDict = {};
    $.ajax({
        url: '/DocumentView/' + btoa(loanId),
        dataType: 'json',
        success: function(data) {
            docUploadedDict = data["data"];
            for (var key in docUploadedDict) {
                var docId = docUploadedDict[key]["documentName"].split("*")[1];
                var docName = docUploadedDict[key]["documentName"].split("*")[0];
                docURLDict[docUploadedDict[key]["documentName"]] = docUploadedDict[key]["documentPath"] + '*' + docUploadedDict[key]["docId"];
            }

            $.ajax({
                url: '/loanDocument/' + btoa(loanTypeId),
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
                                    '<span><button type="button"  onclick="window.open(' + "'" + docURLDict[key1].split("*")[0] + "'" +","+documentData[key]["documentId"]+","+"width=200,height=100" +').focus();" class="btn btn-danger" id = "' + documentData[key]["documentId"] + '_2' + '" name="' + documentData[key]["documentName"] + '_' + documentData[key]["documentId"] + '"></span>' +
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
        UniqueId = $(this).attr('name');
        doceditId = $(this).attr('id');
        newdoceditId = doceditId.split("_")[0];
        Editdoc(UniqueId, newdoceditId);
    });
}

function uploaddoc(fileid, docName, groupId) {
    $("#" + fileid).click();
    $("#" + fileid).fileupload({
        dataType: 'json',
        sequentialUploads: true,
        start: function(e) {
             disableActiveTab();
            $("#loading").show();

        },
        stop: function(e) {
            $("#loading").hide()
             enableActiveTab();
        },
        done: function(e, data) {
            if (data.result.is_valid) {
                var groupId = document.getElementById("groupId").innerHTML;
                var fileName = docName;
                var newfilid = fileid;
                var newfileName = docName + '*' + fileid;
                var oldfileName = docName;
                var s3url = data.result.url;
                UpdateUrl(loanId,groupId, oldfileName, s3url, fileid);
                $("#gallery tbody").prepend(
                    "<tr><td><a href='" + data.result.url + "'>" + data.result.name + "</a></td> <td><a href='" + data.result.url + "'>" + "delete" + "</a></td></tr>"
                )
            }
        }
    });
}

function UpdateUrl(loanId,groupId, oldfileName, s3url, fileid) {
    var dataObj = {};
    var uploadData = {
        "groupId": String(groupId),
        "loanId" : String(loanId),
        "name": String(oldfileName),
        "docSize": "0",
        "userId": userId,
        "docPathServer": String(s3url)
    }
    dataObj["uploadData"] = uploadData;
    $.ajax({
        url: '/updateUrl/',
        dataType: 'json',
        type: "POST",
        success: function(data) {
            if (data.code == '8000') {
                //$("#loading").hide();
                $.alert("Document Uploaded Successfully.");
                loanDocument(loanTypeId);
                $("#" + fileid + "_1").css("display", "none");
                $("#" + fileid + "_3").css("display", "inline-block");
                $("#" + fileid + "_2").css("display", "inline-block");
                $("#" + fileid + "_2").attr('onClick', 'window.open(' + "'" + s3url + "'" + ').focus();');
                $("#" + fileid + "_3").attr('name', data.data);
            } else {
                $.alert("Error Upload");
            }
        },
        data: JSON.stringify(dataObj)
    });
}

function Editdoc(UniqueId, newdoceditId) {
    $("#" + newdoceditId + "_Edit").click();
    $("#" + newdoceditId + "_Edit").fileupload({
        dataType: 'json',
        sequentialUploads: true,
        start: function(e) {
             disableActiveTab();
            $("#loading").show()

        },
        stop: function(e) {
            $("#loading").hide();
             enableActiveTab();
        },
        done: function(e, data) {
            if (data.result.is_valid) {
                var groupId = document.getElementById("groupId").innerHTML;
                var s3url = data.result.url;
                EditUrl(loanTypeId,groupId, UniqueId, s3url, newdoceditId,loanId);
                $("#gallery tbody").prepend(
                    "<tr><td><a href='" + data.result.url + "'>" + data.result.name + "</a></td> <td><a href='" + data.result.url + "'>" + "delete" + "</a></td></tr>"
                )
            }
        }
    });
}

function EditUrl(loanTypeId,groupId, UniqueId, s3url, newdoceditId,loanId) {
    var dataObj2 = {};
    var uploadData = {
        "loanId": String(loanId),
        "id": String(UniqueId),
        "docSize": "0",
        "userId": userId,
        "docPathServer": String(s3url)
    }
    dataObj2["uploadData"] = uploadData;
    $.ajax({
        url: '/editUrl/',
        dataType: 'json',
        type: "POST",
        success: function(data) {
            if (data.code == "8001") {
                $.alert("Document Updated Successfully.");
                $("#" + newdoceditId + "_2").attr('onClick', 'window.open(' + "'" + s3url + "'" + ","+"width=200,height=100" +').focus();');
                loanDocument(loanTypeId);
            } else {
                $.alert("Error update");
            }
        },
        data: JSON.stringify(dataObj2)
    });
}