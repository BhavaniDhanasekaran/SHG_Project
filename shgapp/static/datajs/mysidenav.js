function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginRight = "240px";
    document.body.style.backgroundColor = "rgba(0,0,0,0)";

}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0px";
    document.getElementById("main").style.marginRight= "0px";
    document.body.style.backgroundColor = "white";
}

function toggleNav() {
    var sidenav = document.getElementById("mySidenav"),
    main = document.getElementById("main");
    sidenav.style.width = sidenav.style.width == "270px" ? '0' : '270px';
    main.style.marginRight = main.style.marginRight === "240px" ? '0' : '240px';
    if(sidenav.style.width == "270px" && main.style.marginRight == "240px"){
        getMemberComments(processInstanceId,loanId);
        getGroupComments(processInstanceId,loanId);
    }

}