import axiosClient from "../axios-client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setCookie } from "../utils/cookies";
import { UserContext, UserType } from "../context/UserContext";

type userInput = {
  nickname: string;
  password: string;
};

const Signin = () => {
  const [loginError, setLoginError] = useState<string>("");
  const schema = z.object({
    nickname: z.string().min(1, "required"),
    password: z.string().min(1, "required"),
  });
  const { setUser} = useContext(UserContext);
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
          nickname: userInput.nickname,
          password: userInput.password,
        },
        { withCredentials: true }
      );

      let userFromResponse: UserType = {
        nickname: response.data.userInfo.nickname,
        sessionId: '',
      }

      setUser(userFromResponse);

      const userFromResponseParsed = JSON.stringify(userFromResponse);

      setCookie(
        "userInfo",
        userFromResponseParsed,
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
            <label htmlFor="nickname">
              <input
                className={`g__form--input ${errors.nickname && "--error"}`}
                type="text"
                {...register("nickname", { required: true })}
                placeholder="nickname"
              />
            </label>
            <div className="g__form__inputs--inputwrapper--error">
              {errors.nickname && (
                <span className={`g__form--inputError`}>
                  {errors.nickname.message}
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
    </div>
  );
};

export default Signin;
