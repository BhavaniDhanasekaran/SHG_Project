var groupId = groupId;
var loanTypeId;

function loanDocument(loanTypeId) {
    var jsondata1 = '';
    var jsondata2 = '';

    $.ajax({
        url: '/loanDocument/' + loanTypeId,
        dataType: 'json',
        async: false,
        beforeSend: function() {
            $("#loading").show();
        },
        complete: function() {
            $("#loading").hide();
        },
        error: function(error) {
            $("#loading").hide();
            $.alert("Connection Time out");
        },
        success: function(data) {
            var jsondata1 = data;
            //console.log("jsondata1");
           // console.log(jsondata1);
           // console.log(jsondata1.data.length);
            totLoanDocCount = jsondata1.data.length;
            $('#drop').empty();
            if (jsondata1.data) {
                $.each(jsondata1.data, function(key, value) {
                    $('#drop').append('<option value="' + "Resolutions if any - " + value.documentName + '">' + value.documentName + '</option>');

                });
                $('#drop').val("Resolutions if any - Resolutions if any");
                $('#drop>option[value="Resolutions if any - Resolutions if any"]').insertBefore('#drop>option[value="Resolutions if any - Form No. SHG- 7 Credit appraisal note"]');
            }

            //console.log(data)

            $.ajax({
                url: '/DocumentView/' + loanId,
                dataType: 'json',
                async: false,
                beforeSend: function() {
                    $("#loading").show();
                },
                complete: function() {
                    $("#loading").hide();
                },
                error: function(error) {
                    $("#loading").hide();
                    $.alert("Connection Time out");
                },
                success: function(data) {
                    var jsondata2 = data;
                    $('#records_table2').empty();
                    var current = 0;
                     //console.log("jsondata2");
                     //console.log(jsondata2);
                    //console.log(jsondata2.data.length);
                    uploadedDocsCount = jsondata2.data.length;
                    //console.log(uploadedDocsCount);
                    if (uploadedDocsCount > 0) {
                     //console.log(jsondata2.data.length );
                        $('#docments_table2').show();

                        $.each(jsondata2.data, function(key, value) {
                            //console.log(value.docId);
                            var tr = $('<tr></tr>');
                            current++;
                            $('<td>' + current + '</td>' +
                                '<td>' + value.documentName + '</td>' +
                                ' <td><button type="button" class="btn btn-danger" id = "' + value.docId + '" onclick="window.open(' + "'" + value.documentPath + "'" + "," + value.docId + "," + "config='width=500,height=500'" + ');return false;">' +
                                '<span class="glyphicon glyphicon-cloud-upload"></span> View  </button>' +

                                '<input type = "file"   accept="application/pdf"  id = "' + value.docId + "_Edit" + '" style="display: none;" /></input>' +
                                '<span>   <button type="button"  class="btn btn-success js-upload-photos2" id = "' + value.docId + '_3' + '" name="' + value.docId + '"></span>' +
                                '<span class="glyphicon glyphicon-edit"></span> Edit  </button></td>' + '<td>' + value.documentDate + '</td>' + '</tr> ').appendTo(tr);
                            tr.appendTo('#records_table2');
                        });

                    }
                   


                    //console.log("DocumentView")
                    ///console.log(data);
                    var result1 = jsondata1.data;
                    var result2 = jsondata2.data;

                    var diff_data = _(result1)
                        .differenceBy(result2, 'documentId', 'documentName')
                        .map(_.partial(_.pick, _, 'documentId', 'documentName'))
                        .value();
                        //console.log("diff data");
                        //console.log(diff_data);
                
                    $('#records_table').empty();

                       
                    if (diff_data) {

                        var sizeobj= _.size(diff_data);
                       // console.log(sizeobj);
                        var current = 0;
                        if(sizeobj>0){
                          $('#docments_table').show();
                         }
                         else{
                          $('#docments_table').hide();

                         }
                    
                        $.each(diff_data, function(key, value) {
                            var tr = $('<tr></tr>');
                            
                            if (value.documentName != "Resolutions if any") {
                                current++;
                                $('<td>' + current + '</td>' +
                                    '<td>' + value.documentName + '</td>' +
                                    '<td><input type = "file"   accept="application/pdf" name = "' + value.documentName + '" id = "' + value.documentId + '" style="display: none;" /></input>' +
                                    '<span><button type="button" class="btn btn-primary js-upload-photos" id = "' + value.documentDate + '_1' + '" name="' + value.documentName + '_' + value.documentId + '"></span>' +
                                    '<span class="glyphicon glyphicon-cloud-upload"></span> Upload  </button>').appendTo(tr);
                                tr.appendTo('#docments_table');
                            }
                        });
                    }
                    trigger();


                }

            });

        }

    });
}




$(document).ready(function() {
    $(".js-upload-photos").click(function() {
        //alert("js-upload-photos");
        var oldid = "";
        var docName = "";
        oldid = $(this).attr('name');
        // console.log(oldid);


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
        // console.log(docName);
        // console.log(newid);

        uploaddoc(newid, docName, groupId);
    });
    $(".js-upload-photos2").click(function() {
        //alert("i m calling");
        var UniqueId = "";
        var doceditId = "";
        var newdoceditId = "";
        UniqueId = $(this).attr('name');
        // console.log("UniqueId",UniqueId);
        doceditId = $(this).attr('id');
        // console.log("doceditId",doceditId);
        newdoceditId = doceditId.split("_")[0];
        ///console.log("newdoceditId",newdoceditId);
        Editdoc(UniqueId, newdoceditId);
    });




    $('.js-upload-photos3').off().on('click', function() {
         var docName = $("#drop").val();

        if (docName == "Resolutions if any - Resolutions if any") {

            $.alert("Please Select Resolutions if any options ");
            $("#drop").focus()
            return false;
        }

        uploaddoc_res(docName, groupId);
        // function body
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
            $("#loading").show();
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
                var file_size = data.result.file_size;
                UpdateUrl(loanId, groupId, oldfileName, s3url, fileid, file_size);
                // UpdateUrl(loanId,groupId, oldfileName, s3url, fileid);
                // $("#gallery tbody").prepend(
                //     "<tr><td><a href='" + data.result.url + "'>" + data.result.name + "</a></td> <td><a href='" + data.result.url + "'>" + "delete" + "</a></td></tr>"
                // )
            }
        }
    });
}

function UpdateUrl(loanId, groupId, oldfileName, s3url, fileid, file_size) {
    var dataObj = {};
    var uploadData = {
        "groupId": String(groupId),
        "loanId": String(loanId),
        "name": String(oldfileName),
        "docSize": file_size,
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
                $("#loading").hide();
                $.alert("Document Uploaded Successfully.");
                loanDocument(loanTypeId);
                $("#" + fileid + "_1").css("display", "none");
                $("#" + fileid + "_1").closest("tr").hide();
                // $("#" + fileid + "_3").css("display", "inline-block");
                // $("#" + fileid + "_2").css("display", "inline-block");
                // $("#" + fileid + "_2").attr('onClick', 'window.open(' + "'" + s3url + "'" + ').focus();');
                // $("#" + fileid + "_3").attr('name', data.data);
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
            $("#loading").show();
            enableActiveTab();
        },
        done: function(e, data) {
            if (data.result.is_valid) {
                var groupId = document.getElementById("groupId").innerHTML;
                var s3url = data.result.url;
                var file_size = data.result.file_size;
                EditUrl(loanTypeId, groupId, UniqueId, s3url, newdoceditId, loanId, file_size);
                //EditUrl(loanTypeId,groupId, UniqueId, s3url, newdoceditId,loanId);
                $("#gallery tbody").prepend(
                    "<tr><td><a href='" + data.result.url + "'>" + data.result.name + "</a></td> <td><a href='" + data.result.url + "'>" + "delete" + "</a></td></tr>"
                )
            }
        }
    });
}

function EditUrl(loanTypeId, groupId, UniqueId, s3url, newdoceditId, loanId, file_size) {
    var dataObj2 = {};
    var uploadData = {
        "loanId": String(loanId),
        "id": String(UniqueId),
        "docSize": file_size,
        "userId": userId,
        "docPathServer": String(s3url)
    }
    console.log(uploadData);
    dataObj2["uploadData"] = uploadData;
    $.ajax({
        url: '/editUrl/',
        dataType: 'json',
        type: "POST",
        success: function(data) {
            if (data.code == "8001") {
                $("#loading").hide();
                $.alert("Document Updated Successfully.");
                $("#" + newdoceditId + "_2").attr('onClick', 'window.open(' + "'" + s3url + "'" + "," + "width=200,height=100" + ').focus();');
                loanDocument(loanTypeId);
            } else {
                $.alert("Error update");
            }
        },
        data: JSON.stringify(dataObj2)
    });
}




function uploaddoc_res(docName, groupId) {
    $("#Doc1").click();
    $("#Doc1").fileupload({
        dataType: 'json',
        sequentialUploads: true,
        start: function(e) {
            disableActiveTab();
            $("#loading").show();

        },
        stop: function(e) {
            $("#loading").show();
            enableActiveTab();
        },
        done: function(e, data) {
            if (data.result.is_valid) {
                var groupId = document.getElementById("groupId").innerHTML;
                var fileName = docName;

                var s3url = data.result.url;
                var file_size = data.result.file_size;
                UpdateUrl_res(loanId, groupId, fileName, s3url, file_size);
                // UpdateUrl(loanId,groupId, oldfileName, s3url, fileid);
                // $("#gallery tbody").prepend(
                //     "<tr><td><a href='" + data.result.url + "'>" + data.result.name + "</a></td> <td><a href='" + data.result.url + "'>" + "delete" + "</a></td></tr>"
                // )
            }
        }
    });
}


function UpdateUrl_res(loanId, groupId, fileName, s3url, file_size) {
    var dataObj = {};
    var uploadData = {
        "groupId": String(groupId),
        "loanId": String(loanId),
        "name": String(fileName),
        "docSize": file_size,
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
                $("#loading").hide();
                $.alert("Document Uploaded Successfully.");
                loanDocument(loanTypeId);
                // $("#" + fileid + "_1").css("display", "none");
                //$("#" + fileid + "_1").closest("tr").hide();
                // $("#" + fileid + "_3").css("display", "inline-block");
                // $("#" + fileid + "_2").css("display", "inline-block");
                // $("#" + fileid + "_2").attr('onClick', 'window.open(' + "'" + s3url + "'" + ').focus();');
                // $("#" + fileid + "_3").attr('name', data.data);
            } else {
                $.alert("Error Upload");
            }
        },
        data: JSON.stringify(dataObj)
    });
}