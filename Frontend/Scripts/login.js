import baseURL from './baseURL.js';
    let form =document.querySelector("form");
form.addEventListener("submit",async (e)=>{
    e.preventDefault();
    let obj={
        payload:document.getElementById("exampleFormControlInput1").value,
        password:document.getElementById("exampleFormControlInput2").value
    }
    try {
        let res=await fetch(baseURL+"user/signin",{
            method:"POST",
            headers:{
                'Content-type':'application/json'
            },
            body:JSON.stringify(obj)
        })
        let data=await res.json();
        console.log(data);
        if(data.msg && (data.msg=="Error in Login" || data.msg=="User not Found" || data.msg=="Wrong Password")){
            alert("Wrong Credentials");
        }else if(data.message && data.message=="Login Successful"){
            localStorage.setItem("token",data.token);
            localStorage.setItem("userName",data.name);
            swal("", "Login Successful", "success").then(function() {
                window.location.href="./book.appointment.html";
            });
        }else{
            alert("Login failed. Please try again.");
        }
      } catch (error) {
        console.log(error);
        swal("Error", "Login failed. Please check your connection.", "error");
      }
})