import axiosClient from "../axios-client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type userInput = {
  email: string;
  password: string;
};

const setCookie = (name: string, value: any, days = 7, path = "/") => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie =
    name +
    "=" +
    encodeURIComponent(value) +
    "; expires=" +
    expires +
    "; path=" +
    path;
};

const getCookie = (name: string) => {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, "");
  
};

const deleteCookie = (name: string, path: string) => {
  setCookie(name, "", -1, path);
};

const Signin = () => {
  const [loginError, setLoginError] = useState<string>("");
  const schema = z.object({
    email: z.string().min(1, "required"),
    password: z.string().min(1, "required"),
  });
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<userInput>({ resolver: zodResolver(schema) });

  const onLogin = async (userInput: userInput) => {
    setLoginError("");
    try {
      const response = await axiosClient.post(
        "/signin",
        {
          email: userInput.email,
          password: userInput.password,
        },
        { withCredentials: true }
      );

      const userFromResponse = JSON.stringify( {
        nickname: response.data.userInfo.nickname,
        email: response.data.userInfo.email,
      });

      console.log(userFromResponse);

      setCookie(
        "userInfo",
        userFromResponse,
        7
      );

      navigate("/");
    } catch (error: any) {
      setLoginError(error.response.data.message);
    }
  };

  return (
    <div className="signin">
      <form onSubmit={handleSubmit(onLogin)} className="g__form">
        <div className="g__form--title">Sign in</div>
        <div className="g__form__inputs">
          <div className="g__form__inputs--inputwrapper">
            <label htmlFor="email">
              <input
                className={`g__form--input ${errors.email && "--error"}`}
                type="text"
                {...register("email", { required: true })}
                placeholder="Email"
              />
            </label>
            <div className="g__form__inputs--inputwrapper--error">
              {errors.email && (
                <span className={`g__form--inputError`}>
                  {errors.email.message}
                </span>
              )}
            </div>
          </div>
          <div className="g__form__inputs--inputwrapper">
            <label htmlFor="password">
              <input
                className={`g__form--input ${errors.password && "--error"}`}
                type="password"
                {...register("password", { required: true })}
                placeholder="Password"
              />
            </label>
            <div className="g__form__inputs--inputwrapper--error">
              {errors.password && (
                <span className={`g__form--inputError`}>
                  {errors.password.message}
                </span>
              )}
            </div>
          </div>
        </div>
        <input type="submit" value={"Sign in"} className="g__form--submit" />
        <div className="g__form--error">
          {loginError !== "" ? loginError : ""}
        </div>
        <div className="g__form--link">
          <span>You dont have an account?</span>
          <Link to="/signup">
            <button>Sign up</button>
          </Link>
        </div>
      </form>
      <button>
      </button>
    </div>
  );
};

export default Signin;
