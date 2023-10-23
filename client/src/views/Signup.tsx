import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosClient from "../axios-client";
import { Link, useNavigate } from "react-router-dom";
import { UserContext, UserType } from "../context/UserContext";
import { setCookie } from "../utils/cookies";

type userInput = {
	nickname: string;
	password: string;
	confirmPassword: string;
};

const Signup = () => {
	const { setUser, setLoggedUser } = useContext(UserContext);
	const [signupError, setSignupError] = useState("");
	const schema = z
		.object({
			nickname: z.string().min(1, "required"),
			password: z.string().min(8, "min 8 chars").max(30, "max 30 chars"),
			confirmPassword: z.string().min(1, "required"),
		})
		.refine((data) => data.password === data.confirmPassword, {
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
		if (userData.password !== userData.confirmPassword) {
			setSignupError("Passwords do not match");
			return;
		}

		try {
			const res = await axiosClient.post(
				"/signup",
				{
					nickname: userData.nickname,
					password: userData.password,
					confirmPassword: userData.confirmPassword,
				},
				{ withCredentials: true }
			);

			setUser((prev) => ({
				nickname: res.data.nickname,
				sessionId: prev.sessionId,
			}));

			setLoggedUser({ id: res.data.user_id });

			const userFromResponse: UserType = {
				nickname: res.data.nickname,
				sessionId: "",
			};

			const userFromResponseParsed = JSON.stringify(userFromResponse);

			setCookie("userInfo", userFromResponseParsed, 7);

			navigate("/");
		} catch (error: any) {
			setSignupError(error.response.data.message);
		}
	};

	return (
		<div className='signup'>
			<form onSubmit={handleSubmit(onSignup)} className='g__form --black'>
				<div className='g__form--title'>Sign up</div>
				<div className='g__form__inputs'>
					<div className='g__form__inputs--inputwrapper'>
						<label htmlFor='nickname'>
							<input
								className={`g__form--input ${errors.nickname && "--error"}`}
								type='text'
								{...register("nickname", { required: true })}
								placeholder='Nickname'
							/>
						</label>
						<div className='g__form__inputs--inputwrapper--error'>
							{errors.nickname && <span className={`g__form--inputError`}>{errors.nickname.message}</span>}
						</div>
					</div>

					<div className='g__form__inputs--inputwrapper'>
						<label htmlFor='password'>
							<input
								className={`g__form--input ${errors.password && "--error"}`}
								type='password'
								{...register("password", { required: true })}
								placeholder='Password'
							/>
						</label>
						<div className='g__form__inputs--inputwrapper--error'>
							{errors.password && <span className={`g__form--inputError`}>{errors.password.message}</span>}
						</div>
					</div>
					<div className='g__form__inputs--inputwrapper'>
						<label htmlFor='confirmPassword'>
							<input
								className={`g__form--input ${errors.confirmPassword && "--error"}`}
								type='password'
								{...register("confirmPassword", { required: true })}
								placeholder='Confirm Password'
							/>
						</label>
						<div className='g__form__inputs--inputwrapper--error'>
							{errors.confirmPassword && (
								<span className={`g__form--inputError`}>{errors.confirmPassword.message}</span>
							)}
						</div>
					</div>
				</div>
				<input type='submit' value={"Sign up"} className='g__button --200w' />
				<div className='g__form--error'>{signupError !== "" ? signupError : ""}</div>
				<div className='g__form--whyaccount'>
					<span>Why would i need to create an account?</span>
					<span>For games history, to be in the ranking, and making fame</span>
					<span className="g__form--whyaccount --unfunny" >and to make developer happy, that he did not waste time buidling backend</span>
				</div>
				<div className='g__form--link'>
					<span>Already have an account?</span>
					<Link to='/signin'>
						<button>Sign in</button>
					</Link>
				</div>
			</form>
		</div>
	);
};

export default Signup;
