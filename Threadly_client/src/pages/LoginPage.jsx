import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login, clearError } from "../features/auth/authSlice";

function LoginPage() {
    const [username,setUsername] = useState("");
    const[password,setPassword]=useState("");
    const dispatch=useDispatch();
    const navigate=useNavigate();
    const { status, error } = useSelector((state) => state.auth);
    const isLoading=status==="Loading";
    const handleSubmit=async(e)=>{
        e.preventDefault();
        dispatch(clearError());
        const result= await dispatch(login({username,password}));
        if (login.fulfilled.match(result)){
            navigate("/")
        }
    };
    return(
        <div>
            <h1>
                Login
            </h1>
            <form onSubmit={handleSubmit}>
                <div>
                <label htmlFor="username">Username</label>
                <input
                id="username"
                type="text"
                value={username}
                onChange={(e)=>setUsername(e.target.value)}
                required/>
                </div>
                <div>
                    <label htmlFor="password">Passowrd</label>
                    <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    required
                    />
                </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={isLoading} >
            {isLoading?"Loggin in...":"Log in"}
        </button>
            </form>
            <p>
                Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>

        </div>

    );
}
export default LoginPage;