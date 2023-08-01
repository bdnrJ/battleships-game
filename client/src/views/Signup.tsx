import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosClient from "../axios-client";
import { Link, useNavigate } from "react-router-dom";

type userInput = {
  nickname: string,
  email: string,
  password: string,
  confirmPassword: string,
};

const Signup = () => {
  const [signupError, setSignupError] = useState("");
  const schema = z.object({
    nickname: z.string().min(1, "required"),
    email: z.string().email("invalid email").min(1, "required"),
    password: z.string().min(8, "min 8 chars").max(30, "max 30 chars"),
    confirmPassword: z.string().min(1, "required")
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<userInput>({ resolver: zodResolver(schema) });

  const onSignup = async (userData: userInput) => {
    setSignupError("");
    try {
      if (userData.password !== userData.confirmPassword) {
        setSignupError("Passwords do not match");
        return;
      }

      const response = await axiosClient.post("/signup", {
        nickname: userData.nickname,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword
      });

      navigate("/");
    } catch (error: any) {
      setSignupError(error.response.data.message);
    }
  };

  return (
    <div className="signup">
      <form onSubmit={handleSubmit(onSignup)} className="g__form">
        <div className="g__form--title">Sign up</div>
        <div className="g__form__inputs">
          <div className="g__form__inputs--inputwrapper">
            <label htmlFor="nickname">
              <input
                className={`g__form--input ${errors.nickname && "--error"}`}
                type="text"
                {...register("nickname", { required: true })}
                placeholder="Nickname"
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
          <div className="g__form__inputs--inputwrapper">
            <label htmlFor="confirmPassword">
              <input
                className={`g__form--input ${errors.confirmPassword && "--error"}`}
                type="password"
                {...register("confirmPassword", { required: true })}
                placeholder="Confirm Password"
              />
            </label>
            <div className="g__form__inputs--inputwrapper--error">
              {errors.confirmPassword && (
                <span className={`g__form--inputError`}>
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>
          </div>
        </div>
        <input type="submit" value={"Sign up"} className="g__form--submit" />
        <div className="g__form--error">
          {signupError !== "" ? signupError : ""}
        </div>
        <div className="g__form--link">
          <span>Already have an account?</span>
          <Link to="/signin" >
            <button>Sign in</button>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Signup;
