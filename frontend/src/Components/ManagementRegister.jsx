import {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import style from "../styles/Register.module.css"
export default function ManagementRegister() {
  const [data,setData]=useState({
    username:"",
    password:"",
    email:"",
  })
  const navigate=useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/managementRegister/",
        data
      );

      if (response.data.success){
        alert("Accounts Login details will be sent to Email")
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };

  return (
    <form className={style.RegisterForm} onSubmit={handleSubmit} >
      <input type="text" onChange={e=>{setData(prev=>({...prev,username:e.target.value}))}} name='txtUsername' placeholder='Username' />
      <input type="text" onChange={e=>{setData(prev=>({...prev,password:e.target.value}))}} name='txtPassword' placeholder='Password' />
      <input type="email" onChange={e=>{setData(prev=>({...prev,email:e.target.value}))}} name='txtEmail' placeholder='Email' />
      <button type='submit'>Sign Up</button>
    </form>
  )
}
