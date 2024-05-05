import React, { useEffect, useState } from "react";
import { useAuth } from './components/AuthProvider'
import { useNavigate } from "react-router-dom";
import "./Login.css";

function LoginError({errorText}: {errorText: string}) {
  if (errorText !== "") {
    return (
      <div className="error">
        <p>{errorText}</p>
      </div>
    );
  } else {
    return null;
  }
} 

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, loginError, login } = useAuth();
  const navigate = useNavigate();

  const loggedIn = () => {
    if (user) navigate("/map");
  }

  useEffect(() => {
    if (user) navigate("/map");
  }, [user, navigate]);

  return (
    <div className="login">
      <div className="login__container">
        <LoginError errorText={loginError} />
        <input
          type="text"
          className="login__textBox"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail Address"
        />
        <input
          type="password"
          className="login__textBox"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button
          className="login__btn"
          onClick={() => login(email, password, loggedIn)}
        >
          Login
        </button>
      </div>
    </div>
  );
}
export default Login;