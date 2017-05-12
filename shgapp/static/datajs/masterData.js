var validationFields = ["memberName","age","sequenceNumber", "husbandName","maritalStatus","fatherName","address","villageName","idProofValue","addressProofValue","sbAccountNumber","bankId","sbAccountName",
			"permanentAddress","pincode","villages","mobileNo","idProofTypeId","addressProofTypeId","loanAmount","loanTypeValue"];

var loanTypeDict = {
    "PLL": "1",
    "ATL": "2",
    "VVL": "532",
    "VV2": "534",
    "RVL": "537",
    "BDL": "538"
};


function areasUnderPincode(){
	
	var pincode = document.getElementById("pincode").value;
	if(!pincode){
		alert("Please enter Pincode!");
		return false;
	}
	if(pincode.length == 6){
		$('#villages').empty();
		
		$.ajax({
			url	:  '/getPinCodeDetails/'+pincode,
			type	: 'post',
			dataType: 'json',
			success	: function (pincodeData) {
				//pincodeData = JSON.parse(pincodeData);
				if(pincodeData["data"][0]){
					$('#villages').append('<option value="" >   Select Area </option>');
					for(var i = 0; i< pincodeData["data"].length; i++){
						$('#villages').append('<option value="'+pincodeData["data"][i]["villageId"]+'">'+pincodeData["data"][i]["villageName"]+'</option>');
					}
				}
				else{
				    $.alert("No areas available under this pincode!");
				}
			}	
		});
	}
	else{
		$.alert("Please enter valid Pincode");
	}
		
}

window.onload = function(){
	//setSelectOptionInForm();
}


