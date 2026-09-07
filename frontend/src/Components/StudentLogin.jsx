import { useState } from "react";
import axios from "axios";
import style from "../styles/StudentLogin.module.css";
import { useNavigate,Link } from "react-router-dom";

export default function StudentLogin() {
  const navigate=useNavigate()
  const [userData, setUserData] = useState({
    username: "",
    password: "",
  });

  const goHome=()=>{
    navigate('homepage/')
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/login/",
        userData
      );

      if (response.data.success){
        goHome()
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };

  return (
    <form className={style.loginForm} onSubmit={handleSubmit}>
      <input
        className={style.inpt}
        type="text"
        placeholder="Username"
        onChange={(e) =>
          setUserData((prev) => ({
            ...prev,
            username: e.target.value,
          }))
        }
      />

      <input
        className={style.inpt}
        type="password"
        placeholder="Password"
        onChange={(e) =>
          setUserData((prev) => ({
            ...prev,
            password: e.target.value,
          }))
        }
      />

      <button type="submit">Login</button>

      <div className={style.dec}></div>

      <p>Create new Account? <Link to="/register" >sign Up</Link></p>
    </form>
  );
}