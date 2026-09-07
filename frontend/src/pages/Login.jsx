import {useState} from "react";
import {Routes,Route} from "react-router-dom"
import { useNavigate } from "react-router-dom";
import style from "../styles/Login.module.css";
import StudentLogin from "../Components/StudentLogin";
import ManagementLogin from "../Components/ManagementLogin";
import Register from "../Components/Register";
import ManagementRegister from "../Components/ManagementRegister";
export default function Login() {

  
  const [mngData,setMngData]=useState({
    mngId:"",
    username:"",
    password:"",
  })

  const navigate=useNavigate();
  const handelStudent=()=>{
    navigate("/")
  }
  const handelManagement=()=>{
    navigate("/management")
  }
  return (
    <div className={style.loginContainer}>
      <div className={style.logo}>
        <span>Route</span><p>Flow</p>
      </div>

      <div className={style.splineContainer}>
        <iframe
          src="https://my.spline.design/3dgradient-AcpgG6LxFkpnJSoowRHPfcbO"
          frameBorder="0"
          width="100%"
          height="100%"
          id="aura-spline"
        ></iframe>
      </div>
      <div className={style.login}>
        <div className={style.memberType}>
            <button onClick={handelStudent}>Student</button>
            <button onClick={handelManagement}>Management</button>
        </div>
        <Routes>
          <Route path="/" element={<StudentLogin />}/>
          <Route path="/management" element={<ManagementLogin />}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/managementRegister" element={<ManagementRegister/>}/>
        </Routes>
      </div>
    </div>
  );
}
