$(function () {
    
    var idBtnUpdate = $('#btnUpdate');
    var dataGetUrl = idBtnUpdate.attr("data-get-url");
    var dataEditUrl = idBtnUpdate.attr("data-edit-url");
    console.log('dataGetUrl: ' + dataGetUrl);
    console.log('dataEditUrl: ' + dataEditUrl);
	
    var getData = function () {
        $.ajax({
            url: dataGetUrl,
            type:'get',
            dataType: 'json',
            success: function (data) {
              console.log('load success data: ' + JSON.stringify(data));
              console.log('load success data[0]: ' + JSON.stringify(data[0]));
                $('#id_username').val(data[0].fields.username);
                $('#id_email').val(data[0].fields.email);
            }
        });    
    };
    
    getData();
    
    var updateData = function () {
        var username = $('#id_username').val();
		var email = $('#id_email').val();		
		var putData = {
          'username': username,
		  'email': email
        };
		$.ajax({
            url: dataEditUrl,
            data: putData,
            type:'post',
            dataType: 'json',
            success: function (data) {
              console.log('put success data: ' + JSON.stringify(data));
            }
        });    
    };
    
    $(idBtnUpdate).click(function () {
		console.log('btnUpdate click');
		updateData();
    });
    
});