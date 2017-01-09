$(function () {

    var idDatatable1 = $('#id_datatable1');
    var dataListUrl = idDatatable1.attr("data-list-url");
    console.log('dataListUrl: ' + dataListUrl);
    console.log('role2 inside: ',role2);

    var loadData = function () {
        $(idDatatable1).dataTable({
            "processing": true,
            "ajax": {
                "processing": true,
                "url": dataListUrl,
                "dataSrc": ""
            },
            "columns": [{
                "data": "fields.username"
            }, {
                "data": "fields.email"
            }],
            "columnDefs": [ {
                "targets": 2,
                "render": function ( data, type, row ) {
                    var rowUrl = '/editdata1/' + row.pk;
                    //console.log('rowUrl: ' + rowUrl);
                    if(role2 == 'True'){
                        return '<a href="' + rowUrl + '">Edit</a>';                        
                    }else{
                        return 'No Edit Action';
                    }
                    //return '<a href="' + rowUrl + '">Edit</a>';
                    //return '<a href="'+ '/editdata1/' +row.pk+'">Edit</a>';                
                }
            } ]
        });
    };
    
    loadData();

});