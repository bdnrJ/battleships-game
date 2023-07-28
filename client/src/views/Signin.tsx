import axios from "axios";
import React, { useState } from "react";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = async () => {
    try {
      const response = await axios.post("http://localhost:3000/api/signin", {
        email: email,
        password: password,
      }, {withCredentials: true});

      console.log(response.data); // Handle the response from the server as needed
    } catch (error) {
      console.error("Error while logging in:", error);
      // Handle the error or show a message to the user
    }
  };

  const onGetUsersTest = async () => {
    try{
      const res = await axios.get(`http://localhost:3000/api/users/1`, {
        withCredentials: true
      });

      console.log(res);
    }catch(err){
      console.log(err);
    }
  }

  return (
    <div className="signin">
      <input
        type="text"
        placeholder="login"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={onLogin}>Sign in</button>
      <button onClick={onGetUsersTest}>Get user</button>
    </div>
  );
};

export default Signin;
