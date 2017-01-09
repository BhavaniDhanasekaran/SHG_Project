$(function () {

    var idDatatable1 = $('#id_datatable1');
    var dataListUrl = idDatatable1.attr("data-list-url");
    console.log('dataListUrl: ' + dataListUrl);    
    
    var loadData = function () {
        $.ajax({
            type: ajaxTypeGet,
            url: dataListUrl,
            data: {},
            success: function (response) {
                //console.log('success response: ' + response);
                console.log('success response: ' + JSON.stringify(response));
                //ShowSuccessMessage(response.message);
                loadDatatable1(response);
            }
        });        
    };
    
    $(document).ready(function () {
        $.ajaxSetup(
            ajaxDefaultSettings
        );
        loadData();
    });    
    
    var objDatatable1;
    var columnsDatatable1 = [
        {
            "mData": "created"
              , "mRender": function (data, type, full) {
                  return moment(data).format(dateTimeFormat);
              }
            , "sType": "date"
            , "sClass": "center"
        }
        ,{
            "mData": "name"
            , "mRender": function (data, type, full) {
                return data;
            }
        }
        ,{
            "mData": "assignee"
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
    
});