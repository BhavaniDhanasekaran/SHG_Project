$(function () {
    
    var idFormAdd = $('#id_formAdd');
    var idBtnAdd = $('#btnAdd');
    var idSpnAdd = $('#spnAdd');
    var dataAddUrl = idBtnAdd.attr("data-add-url");
    console.log('dataAddUrl: ' + dataAddUrl);
    $('#id_username').focus();
    
    var addData = function () {
        var username = $('#id_username').val();
		var email = $('#id_email').val();		
		var postData = {
          'username': username,
		  'email': email
        };
		$.ajax({
            url: dataAddUrl,
            data: postData,
            type:'post',
            dataType: 'json',
            beforeSend: function () {
                $(idBtnAdd).attr("disabled", true);
            },
            success: function (data) {
              console.log('success response data: ' + JSON.stringify(data));              
            },
            error: function (data) {
              console.log('error response data: ' + JSON.stringify(data));
            },
            complete: function (data) {
                console.log('complete response data: ', JSON.stringify(data));   
                $(idBtnAdd).attr("disabled", false);
            }
        })
        .done(function(data) {
            console.log("done success", data);
        })
        .fail(function(data) {
            console.log("fail error", data);
        })
        .always(function(data) {
            console.log("always complete", data);            
            $(idBtnAdd).attr("disabled", false);
            $(idSpnAdd).text("Add");
        });
    };
    
    var FORM_RULES = {
        username: 'required',
        email: 'required'
    };
     
    var FORM_MESSAGES = {
        username: 'This user name field is required',
        email: 'This email field is required'
    };
     
    $(idFormAdd).validate({
        ignore: [],
        rules: FORM_RULES,
        messages: FORM_MESSAGES,
        submitHandler: function(form) {
            console.log('submitHandler btnAdd submit');
            $(idBtnAdd).attr("disabled", true);
            $(idSpnAdd).text("Adding..");
            setTimeout(function() {
                // Do something after N seconds
                addData();
            }, 1000);
            
        }
    });
    
    /*
    // Reset input form
    function ResetJqueryValidator(formID) {
        var jqueryValidator = $("#" + formID).validate();
        jqueryValidator.resetForm();
    }*/
    
    /*
    $(idBtnAdd).click(function () {
		console.log('btnAdd click');
		addData();
    });
    */
    
});