$(function () {

    var idDatatable1 = $('#id_datatable1');
    
    var loadData = function () {
        console.log('inside js username: ', uname);
        //console.log('inside js dtTaskListJSONParse: ', dtTaskListJSONParse);
        loadDatatable1(dtTaskListJSONParse);
    };
    
    $(document).ready(function () {
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
        //console.log('listData', listData);
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