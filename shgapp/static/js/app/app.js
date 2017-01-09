
// Default DataTable setting
var oDefaultDataTable = {
    "bDestroy": true,
    "bJQueryUI": true,
    "bProcessing": false,
    "bSort": true,
    "bInfo": true,
    "bPaginate": true,
    "iDisplayLength": 25,
    "bSortClasses": false,
    "bAutoWidth": false,
    "bDeferRender": true
};

// Re-Load the DataTable
function ReDraw(objDataTable) {
    objDataTable.fnDestroy();
}

var dateTimeFormat = "MM/DD/YYYY hh:mm A";
var dateFormatMMDDYYYY = "MM/DD/YYYY";

var ajaxDataTypeJson = 'json';
var ajaxTypeGet = 'GET';
var ajaxTypePost = 'POST';
var ajaxTypePut = 'PUT';
var ajaxTypeDelete = 'DELETE';
    
// Default AJAX setting
var ajaxDefaultSettings = {
    cache: false,
    dataType: 'json',
    timeout: 15000,
    contentType: 'application/json; charset=utf-8',
    crossDomain: true,
    //async: false,
    data: {},
    //xhrFields: { withCredentials: true },
    beforeSend: function (xhr) {
        //xhr.setRequestHeader("Authorization", "Basic " + window.btoa(serviceAppUserName + ":" + serviceAppUserPwd));
    },
    error: function (xhr, textStatus, err) {
        //ShowErrorMessage(err);
    },
    complete: function () {
    }
};

// DO when Ajax call started
$(document).ajaxStart(function () {
    var loader = ['<div id="confirmOverlay">', '<div id="ajaxloading">',
        '<img src="/static/images/squares.gif" alt="Loading..." />', '</div></div>'].join('');
    $(loader).hide().appendTo('body').fadeIn();
});

// DO when Ajax call ended
$(document).ajaxComplete(function () {
    setTimeout(function () {
        $('#confirmOverlay').fadeOut(function () {
            $(this).remove();
        });
    }, 500);
});

function ParseAndShowErrorMessage(data) {
    var msg = '';
    
    if(data) {
        if(data.statusText) {
            msg += data.statusText + '. ';
        }
        if(data.responseJSON) {
            if(data.responseJSON.message) {
                msg += data.responseJSON.message + '. ';
            }
        }
    }
    
    if(msg) {
        console.log('msg: ',msg);
        ShowErrorMessage(msg);
    } else{
        console.log('no msg: ',msg);
    }
}

// Default Error message
function ShowErrorMessage(msg) {
    console.log('ShowErrorMessage: ', msg);
    var errorMessageID = Math.floor((Math.random() * 1000) + 1) + 'Error';
    $('.server-message-top').append('<div id="' + errorMessageID + '" class="alert error-top server-message alert-dismissable">' +
          '<i class="fa fa-ban"></i>' +
          '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
          '<b>Error -</b> ' + msg + '.</div>');
    setTimeout(function () {
        $('#' + errorMessageID).slideUp();
    }, 10000);
}

// Default success message
function ShowSuccessMessage(msg) {
    console.log('ShowSuccessMessage: ', msg);
    var successMessageID = Math.floor((Math.random() * 1000) + 1) + 'Success';
    $('.server-message-top').append('<div id="' + successMessageID + '" class="alert success-top server-message alert-dismissable">' +
            '<i class="fa fa-check"></i>' +
            '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
            '<b>Done -</b> ' + msg + '.</div>');
    setTimeout(function () {
        $('#' + successMessageID).slideUp();
    }, 7000);
}

// This optional function html-encodes messages for display in the page.
function htmlEncode(value) {
    var encodedValue = $('<div />').text(value).html();
    return encodedValue;
}

function SetFocusControl(controlId) {
    $("#" + controlId).focus();
}

function EnableDisableControl(controlId, isDisabled) {
    $('#' + controlId).prop('disabled', isDisabled);
}

function GetColumnStatusText(isDisable) {
    if (isDisable) {
        return '<span class="label label-success">Yes</span>';
    }
    else {
        return '<span class="label label-danger">No</span>';
    }
}

function GetJSONDateToPost(input) {
    var dt = new Date(input);
    if (isNaN(dt)) return null;
    return '\/Date(' + dt.getTime() + '-0000)\/';
}

function GetCurrentDate() {
    var today = new Date(),
     dd = today.getDate(),
     mm = today.getMonth() + 1, //January is 0!
     yyyy = today.getFullYear();
    if (dd < 10)
        dd = '0' + dd
    if (mm < 10)
        mm = '0' + mm
    return mm + '/' + dd + '/' + yyyy;
}