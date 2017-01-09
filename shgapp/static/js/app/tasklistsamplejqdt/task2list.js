$(function () {

    var idDatatable1 = $('#id_datatable1');
    var dataListUrl = idDatatable1.attr("data-list-url");
    console.log('dataListUrl: ' + dataListUrl);

    var loadData = function () {
        $(idDatatable1).dataTable({
            "processing": true,
            "ajax": {
                "processing": true,
                "url": dataListUrl,
                "dataSrc": ""
            },
            "columns": [{
                "data": "name"
            }, {
                "data": "assignee"
            }, {
                "data": "created"
            }]
        });
    };
    
    loadData();

});