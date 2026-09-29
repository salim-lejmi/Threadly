import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { signup, clearError } from "../features/auth/authSlice";
function SignupPage() {
  const [formData,setFormData]=useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    birthDate: "",    
  });
  const dispatch=useDispatch();
  const navigate=useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const isLoading=status==="Loading";
  const handleCh=(e)=>{
    setFormData({...formData,[e.target.name]:e.target.value});
  }
  
  const handleSubmit=async(e)=>{
      e.preventDefault();
      dispatch(clearError());
      const payload={
        ...formData,
        phoneNumber:Number(formData.phoneNumber),
                                      }
      const result=await dispatch(payload)
      if (signup.fulfilled.match(result)){
        navigate("/login");
      }
  };

  return (
  
      <div>
      <h1>Sign up</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="phoneNumber">Phone number</label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="birthDate">Birth date</label>
          <input
            id="birthDate"
            name="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={handleChange}
            required
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing up..." : "Sign up"}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}

export default SignupPage;
  