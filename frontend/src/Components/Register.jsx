import {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import style from "../styles/Register.module.css"
export default function Register() {
  const [data,setData]=useState({
    name:"",
    branch:"",
    rollNo:"",
    semester:"",
    email:"",
  })
  const navigate=useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/register/",
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
      <input type="text" onChange={e=>{setData(prev=>({...prev,name:e.target.value}))}} name='txtName' placeholder='Full Name' />
      <input type="text" onChange={e=>{setData(prev=>({...prev,branch:e.target.value}))}} name='txtBranch' placeholder='Branch' />
      <input type="text" onChange={e=>{setData(prev=>({...prev,rollNo:e.target.value}))}} name='txtRollNo' placeholder='College Roll Number' />
      <input type="text" onChange={e=>{setData(prev=>({...prev,semester:e.target.value}))}} name='txtSem' placeholder='Semester' />
      <input type="email" onChange={e=>{setData(prev=>({...prev,email:e.target.value}))}} name='txtYear' placeholder='Email' />
      <button type='submit'>Sign Up</button>
    </form>
  )
}
