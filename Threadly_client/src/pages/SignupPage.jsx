import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { signup, clearError } from "../features/auth/authSlice";

function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    birthDate: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const isLoading = status === "loading";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    const payload = {
      ...formData,
      phoneNumber: Number(formData.phoneNumber),
    };

    const result = await dispatch(signup(payload));

    if (signup.fulfilled.match(result)) {
      navigate("/login");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="logo-mark">T</span>
        </div>
        <h1>Create your account</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
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

          <div className="form-field">
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

          <div className="form-field">
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

          <div className="form-row">
            <div className="form-field">
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

            <div className="form-field">
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
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="btn btn-primary btn-block" type="submit" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;