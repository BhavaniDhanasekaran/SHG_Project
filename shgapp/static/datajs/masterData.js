var validationFields = ["memberName","age","husbandName","fatherName","address","villageName","idProofValue","addressProofValue","sbAccountNumber","bankId","sbAccountName",
			"permanentAddress","pincode","villages","mobileNo","idProofTypeId","addressProofTypeId","loanAmount","loanTypeValue"];

var loanTypeDict = {
   "PLL" : "1",
   "ATL" : "2",
   "VVL" : "532",
   "VV2" : "534",
   "RVL" : "537",
   "BDL" : "538"
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
					console.log(pincodeData["data"][i]);
						$('#villages').append('<option value="'+pincodeData["data"][i]["villageId"]+'">'+pincodeData["data"][i]["villageName"]+'</option>');
					}
				}
			}	
		});
	}
	else{
		alert("Please enter valid Pincode");
	}
		
}

window.onload = function(){
	setSelectOptionInForm();
}

function setSelectOptionInForm(){
	$.ajax({
		url	:  '/masterDataBank/',
	        type	: 'post',
	        dataType: 'json',
	        success	: function (bankData) {
			if(bankData["data"][0]){
				keyValueMasterBankArray = bankData["data"].sort(function(a, b){ var a1= a.bankName, b1= b.bankName;    if(a1== b1) return 0;    return a1> b1? 1: -1; })
				$('#bankId').append('<option value="" > Select Bank </option>');
				for(var i = 0; i < Object.keys(keyValueMasterBankArray).length ; i++){
					$('#bankId').append('<option value="'+keyValueMasterBankArray[i].bankId+'">'+keyValueMasterBankArray[i].bankName+'</option>');
				}	
	
				$.each($('#bankId option'), function(key, optionElement) {
		   			 var curText = $(optionElement).text();
			 		 $(this).attr('title', curText);
					 var lengthToShortenTo = Math.round(parseInt('350px', 10) / 9.4);
			    		 if (curText.length > lengthToShortenTo) {
						$(this).text(curText.substring(0,lengthToShortenTo)+'...');
		    			 }
				});
				// Show full name in tooltip after choosing an option
				$('#bankId').change(function() {
					$(this).attr('title', ($(this).find('option:eq('+$(this).get(0).selectedIndex +')').attr('title')));
				});
			}
		}	
	});	
	
	$.ajax({
		url	:  '/masterIDProof/',
	        type	: 'post',
	        dataType: 'json',
	        success	: function (idProofData) {
			keyValueIDProofArray = idProofData["data"].sort(function(a, b){ var a1= a.idProofName, b1= b.idProofName;    if(a1== b1) return 0;    return a1> b1? 1: -1; })
			$('#idProofTypeId').append('<option value="" > Select ID Proof </option>');
			for(var i = 0; i < Object.keys(keyValueIDProofArray).length ; i++){
				$('#idProofTypeId').append('<option value="'+keyValueIDProofArray[i].idProofId+'">'+keyValueIDProofArray[i].idProofName+'</option>');
			}	

			$.each($('#idProofTypeId option'), function(key, optionElement) {
	   			 var curText = $(optionElement).text();
		 		 $(this).attr('title', curText);
				 var lengthToShortenTo = Math.round(parseInt('350px', 10) / 9.4);
		    		 if (curText.length > lengthToShortenTo) {
					$(this).text(curText.substring(0,lengthToShortenTo)+'...');
	    			 }
			});
			// Show full name in tooltip after choosing an option
			$('#idProofTypeId').change(function() {
				$(this).attr('title', ($(this).find('option:eq('+$(this).get(0).selectedIndex +')').attr('title')));
			});
	        }
	});
	$.ajax({
		url	:  '/masterAddressProof/',
	        type	: 'post',
	        dataType: 'json',
	        success	: function (addressProofData) {
			keyValueAddressProofArray = addressProofData["data"].sort(function(a, b){ var a1= a.addProofName, b1= b.addProofName;    if(a1== b1) return 0;    return a1> b1? 1: -1; })
			$('#addressProofTypeId').append('<option value="" > Select Address Proof </option>');
			for(var i = 0; i < Object.keys(keyValueAddressProofArray).length ; i++){
				$('#addressProofTypeId').append('<option value="'+keyValueAddressProofArray[i].addProofId+'">'+keyValueAddressProofArray[i].addProofName+'</option>');
			}	

			$.each($('#addressProofTypeId option'), function(key, optionElement) {
	   			 var curText = $(optionElement).text();
		 		 $(this).attr('title', curText);
				 var lengthToShortenTo = Math.round(parseInt('350px', 10) / 9.4);
		    		 if (curText.length > lengthToShortenTo) {
					$(this).text(curText.substring(0,lengthToShortenTo)+'...');
	    			 }
			});
			// Show full name in tooltip after choosing an option
			$('#addressProofTypeId').change(function() {
				$(this).attr('title', ($(this).find('option:eq('+$(this).get(0).selectedIndex +')').attr('title')));
			});
	        }
	});
	$.ajax({
		url	:  '/masterLoanPurpose/',
	        type	: 'post',
	        dataType: 'json',
	        success	: function (loanPurposeData) {
			keyValueloanPurposeArray = loanPurposeData["data"].sort(function(a, b){ var a1= a.name, b1= b.name;    if(a1== b1) return 0;    return a1> b1? 1: -1; })
			$('#loanTypeValue').append('<option value="" > Select Loan Purpose </option>');
			for(var i = 0; i < Object.keys(keyValueloanPurposeArray).length ; i++){
				$('#loanTypeValue').append('<option value="'+keyValueloanPurposeArray[i].id+'">'+keyValueloanPurposeArray[i].name+'</option>');
			}	

			$.each($('#loanPurpose option'), function(key, optionElement) {
	   			 var curText = $(optionElement).text();
		 		 $(this).attr('title', curText);
				 var lengthToShortenTo = Math.round(parseInt('350px', 10) / 9.4);
		    		 if (curText.length > lengthToShortenTo) {
					$(this).text(curText.substring(0,lengthToShortenTo)+'...');
	    			 }
			});
			// Show full name in tooltip after choosing an option
			$('#loanTypeValue').change(function() {
				$(this).attr('title', ($(this).find('option:eq('+$(this).get(0).selectedIndex +')').attr('title')));
			});
	        }
	});
	
	
	
}





