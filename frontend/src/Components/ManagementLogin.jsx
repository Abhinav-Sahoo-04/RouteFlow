import {useState} from "react";
import axios from "axios";
import { useNavigate,Link } from "react-router-dom";
import style from "../styles/StudentLogin.module.css";
export default function ManagementLogin() {
  const navigate=useNavigate()
  const [managementData, setManagementData] = useState({
    mid:"",
    username:"",
    password:"",
  });
  const goHome=()=>{
    navigate('/homepage')
  }
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/manage/",
        managementData
      );

      if (response.data.success){
        goHome()
      }
    } catch (error) {
      alert("Invalid Credentials !")
      console.error(error.response?.data || error.message);
    }
  };
  return (
    <form className={style.loginForm} onSubmit={handleSubmit} >
      <input type="text" name="MID" id="idMid" placeholder="Management ID" onChange={e=>{
        setManagementData(prev=>({
          ...prev,mid:e.target.value
        }))
      }} />
      <input
        className={style.inpt}
        type="text"
        name="txtUser"
        id="idUser"
        placeholder="Username"
        onChange={e=>{
          setManagementData(prev=>({
            ...prev,username:e.target.value
          }))
        }}
      />
      <input
        className={style.inpt}
        type="password"
        name="txtPass"
        id="idPass"
        placeholder="Password"
        onChange={e=>{
          setManagementData(prev=>({
            ...prev,password:e.target.value
          }))
        }}
      />
      <button type="submit" >Login</button>
      <div className={style.dec}></div>
      <p>Create new Account? <Link to="/managementRegister"> Sign Up</Link></p>
      
    </form>
  );
}
