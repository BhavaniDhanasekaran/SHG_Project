
var json =[
{"data":{"id":"1","user_name":"Mohana","book":"123","role":"Student"}},
{"data":{"id":"3","user_name":"Kanchana","book":"456","role":"Student"}},
{"data":{"id":"4","user_name":"Usha","book":"456","role":"Student"}},
{"data":{"id":"5","user_name":"Mohni","book":"456","role":"Student"}},
{"data":{"id":"6","user_name":"Seetha","book":"456","role":"Student"}}
];




$(document).ready(function(){
	


var students = json;
	 $.each(students, function(index, student) {
	 	 		
			
			if(student.data.id==1){
            $('#san_test').append('<a href="ds_groupview%20-query.html" class="list-group-item list-group-item-success"> <B>' +student.data.user_name + '</B></a>' );
					
			}
			
			
			if(student.data.id==3){
            $('#san_test').append('<a href="ds_groupview2.html" class="list-group-item list-group-item-success"> <B>' +student.data.user_name + '</B></a>' );
					
			}
			
			
			else if(student.data.id==4){
            $('#san_test').append('<a href="ds_groupview%20-query.html" class="list-group-item list-group-item-danger"> <B>' + student.data.user_name + '<B></a>' );
					
			}
			
			else{
			
			$('#san_test').append('<a href="ds_groupview%20-query.html" class="list-group-item "><B>' + student.data.user_name + '<B></a>' );
			
			}
	
		
		});
		
		

});





