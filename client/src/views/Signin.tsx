import axiosClient from "../axios-client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type userInput = {
  email: string;
  password: string;
};

const Signin = () => {
  const schema = z.object({
    email: z.string().min(1, "required"),
    password: z.string().min(1, "required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<userInput>({ resolver: zodResolver(schema) });

  const onLogin = async (userInput: userInput) => {
    try {
      const response = await axiosClient.post(
        "/signin",
        {
          email: userInput.email,
          password: userInput.password,
        },
        { withCredentials: true }
      );

      console.log(response.data); // Handle the response from the server as needed
    } catch (error) {
      console.error("Error while logging in:", error);
    }
  };

  const onGetUsersTest = async () => {
    try {
      const res = await axiosClient.get(`/users/1`, {
        withCredentials: true,
      });

      console.log(res);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="signin">
      <form onSubmit={handleSubmit(onLogin)} className="g__form">
        <div className="g__form--title">
          Sign in
        </div>
        <div className="g__form__inputs">
          <div className="g__form__inputs--inputwrapper">
            <label htmlFor="email">
              <input className={`g__form--input ${errors.email && "--error"}`} type="text" {...register("email", {required: true})} placeholder='Email'/>
            </label>
            <div className="g__form__inputs--inputwrapper--error">
              {errors.email && <span className={`g__form--inputError`}>{errors.email.message}</span>}
            </div>
          </div>
          <div className="g__form__inputs--inputwrapper">
            <label htmlFor="password">
              <input className={`g__form--input ${errors.password && "--error"}`} type="password" {...register("password", {required: true})} placeholder='Password'/>
            </label>
            <div className="g__form__inputs--inputwrapper--error">
              {errors.password && <span className={`g__form--inputError`}>{errors.password.message}</span>}
            </div>
          </div>
        </div>
        <input type="submit" value={"Sign in"} className="g__form--submit"/>
        <button onClick={onGetUsersTest}>Get user</button>
      </form>
    </div>
  );
};

export default Signin;
