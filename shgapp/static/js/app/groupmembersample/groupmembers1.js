 
//$(function () {
    
    var idFormSearch = $('#id_formSearch');
    var idBtnSearch = $('#btnSearch');
    var idSpnSearch = $('#spnSearch');
    var dataSearchUrl = idBtnSearch.attr("data-search-url");
    var dataGetUrl = idBtnSearch.attr("data-get-url");
    console.log('dataSearchUrl: ' + dataSearchUrl);
    console.log('dataGetUrl: ' + dataGetUrl);
    var idDatatable1 = $('#id_datatable1');
    SetFocusControl('id_groupid');
    //$('#id_groupid').focus();
    
    var objDatatable1;
    var columnsDatatable1 = [
        {
            "mData": "memberName"
            ,"mRender": function (data, type, full) {
                return '<a title="View" onclick="showMemberData(\'' + full.memberId + '\');" href="javascript:void(0);">' + data + '</a>';
            }
        }
        ,{
            "mData": "age"
            , "mRender": function (data, type, full) {
                return data;
            }
        }
        ,{
            "mData": "address"
            , "mRender": function (data, type, full) {
                return data;
            }
        }
        ,{
            "mData": "memberStatus"
            , "mRender": function (data, type, full) {
                return data;
            }
        }
    ];
    
    var loadDatatable1 = function (listData) {
        //$(idDatatable1).show();
        objDatatable1 = $(idDatatable1).dataTable($.extend(true, {}, oDefaultDataTable, {
            "aaData": listData,
            "aoColumns": columnsDatatable1,
            "aaSorting": [[0, "asc"]],
            "oLanguage": {
                "sEmptyTable": "<b>No data found</b>"
            }
        }));
    };
    
    // Highlights the selected row in DataTable
    $("#" + 'id_datatable1' + " tbody").on("click", "tr", function () {
        objDatatable1.$('tr.success').removeClass('success');
        $(this).addClass('success');
    });
    
    var searchData = function () {
        resetMemberDataContols();
        var groupid = $('#id_groupid').val();
		var requestData = {
          'groupid': groupid
        };
		$.ajax({
            url: dataSearchUrl,
            data: requestData,
            type: ajaxTypePost,
            dataType: ajaxDataTypeJson,
            beforeSend: function () {
            },
            success: function (data) {
                console.log('success response data: ' + JSON.stringify(data));                
                if(data.status === 200) {
                    ShowSuccessMessage(data.message);
                    loadDatatable1(data.data);        
                } else {
                    ShowErrorMessage(data.message);                    
                    SetControlNotProcessing();                    
                }
            },
            error: function (data) {
              console.log('error response data: ' + JSON.stringify(data));
              ParseAndShowErrorMessage(data);
            },
            complete: function (data) {
                //console.log('complete response data: ', JSON.stringify(data));   
                SetControlNotProcessing();
            }
        });
        /*
        .done(function(data) {
            console.log("done success", data);
        })
        .fail(function(data) {
            console.log("fail error", data);
        })
        .always(function(data) {
            console.log("always complete", data);            
            SetControlNotProcessing();
        });*/
    };
    
    function SetControlNotProcessing() {
        $(idBtnSearch).attr("disabled", false);
        $(idSpnSearch).text("Search");
    }
    
    function SetControlProcessing() {
        $(idBtnSearch).attr("disabled", true);
        $(idSpnSearch).text("Searching..");
    }
    
    var FORM_RULES = {
        groupid: 'required'
    };
     
    var FORM_MESSAGES = {
        groupid: 'This group id field is required'
    };
     
    $(idFormSearch).validate({
        ignore: [],
        rules: FORM_RULES,
        messages: FORM_MESSAGES,
        submitHandler: function(form) {
            console.log('submitHandler btnSearch submit');
            SetControlProcessing();            
            loadDatatable1([]);
            setTimeout(function() {
                // Do something after N seconds
                searchData();
            }, 1000);
            
        }
    });
    
    function showMemberData(memberId) {
        console.log('ShowMemberData memberId: ', memberId);
        resetMemberDataContols();
        var groupid = $('#id_groupid').val();
		var requestData = {
          'groupid': groupid,
          'memberid': memberId
        };
        
		$.ajax({
            url: dataGetUrl,
            data: requestData,
            type: ajaxTypePost,
            dataType: ajaxDataTypeJson,
            beforeSend: function () {
            },
            success: function (data) {
                //console.log('success response data: ' + JSON.stringify(data));                
                if(data.status === 200) {
                    ShowSuccessMessage(data.message);
                    setMemberDataContols(data.data);
                } else {
                    ShowErrorMessage(data.message);
                }
            },
            error: function (data) {
              //console.log('error response data: ' + JSON.stringify(data));
              ParseAndShowErrorMessage(data);
            },
            complete: function (data) {
                //console.log('complete response data: ', JSON.stringify(data));
            }
        });        
    }
    
    //Reset Member Data Controls
    function resetMemberDataContols() {
        $('#id_membername').val('');
        $('#id_memberaddress').val('');
    }
    
    //Set Member Data Controls
    function setMemberDataContols(data) {
        console.log('ssetMemberDataContols data: ' + JSON.stringify(data));
        SetFocusControl('id_membername');
        var md = data.memberDetails;
        $('#id_membername').val(md.memberName);
        $('#id_memberaddress').val(md.address);
    }
    
    /*
    // Reset input form
    function ResetJqueryValidator(formID) {
        var jqueryValidator = $("#" + formID).validate();
        jqueryValidator.resetForm();
    }*/
    
    /*
    $(idBtnSearch).click(function () {
		console.log('btnSearch click');
		searchData();
    });
    */
    
//});