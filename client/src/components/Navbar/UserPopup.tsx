import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { Link, useNavigate } from "react-router-dom";
import { handleUserWithNoNickanmeBeforeJoin } from "../../context/UserContext";
import axiosClient from "../../axios-client";
import { deleteCookie } from "../../utils/cookies";
import { useAlert } from "../../hooks/useAlert";

type Props = {
	hideUserPopup: () => void;
};

const UserPopup = ({ hideUserPopup }: Props) => {
	const { user, loggedUser, setLoggedUser, setUser } = useContext(UserContext);
	const [isDarkModeOn, setIsDarkModeOn] = useState<boolean>(localStorage.getItem("dark_mode") === "true");
	const { showAlert } = useAlert();
	const navigate = useNavigate();

	const popupRef = useRef<any>(null);

	const handleCheckIfUserIsLogged = async () => {
		try {
			const res = await axiosClient.get("/isUser", { withCredentials: true });

			setLoggedUser({ id: res.data.user_id });
		} catch (err: any) {
			console.log(err);
		}
	};

	const handleLogout = async () => {
		try {
			await axiosClient.post("/logout", {}, { withCredentials: true });
		} catch (err: any) {
			console.log(err);
		}

		deleteCookie("userInfo");
		// deleteCookie('token');
		setLoggedUser({ id: -1 });
		handleUserWithNoNickanmeBeforeJoin(setUser);

		showAlert("Successfully logged out", "success");
		navigate("/rooms");
	};

	const switchTheme = () => {
		const isDarkMode = localStorage.getItem("dark_mode") === "true";
		if (isDarkMode) {
			localStorage.setItem("dark_mode", "false");
			document.body.classList.remove("--black");
			setIsDarkModeOn(false);
		} else {
			localStorage.setItem("dark_mode", "true");
			document.body.classList.add("--black");
			setIsDarkModeOn(true);
		}
	};

	//handling popup visibility
	useEffect(() => {
		function handleClickOutside(event: Event) {
			const target = event.target as Element; // Cast event.target as Element
			if (
				popupRef.current &&
				!popupRef.current.contains(target) &&
				!Array.from(document.querySelectorAll(".dontTriggerUserPopupEvent")).includes(target)
			) {
				console.log(Array.from(document.querySelectorAll(".dontTriggerUserPopupEvent")).includes(target));
				console.log(Array.from(document.querySelectorAll(".dontTriggerUserPopupEvent")));
				hideUserPopup();
			}
		}

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [popupRef]);

	return (
		<div className='userpopup' ref={popupRef}>
			<span className='userpopup__nickname'>{user.nickname}</span>
			<hr />
			<section className='userpopup__buttons'>
				{loggedUser.id === -1 ? (
					<>
						<Link to={"/signin"} className='g__link'>
							Sign In
						</Link>
						<Link to={"/signup"} className='g__link'>
							Sign Up
						</Link>
					</>
				) : (
					<>
						<Link to={"/my_games"} className='g__link'>
							Games history
						</Link>
						<button onClick={handleLogout}>Log out</button>
						<span>UserID: {loggedUser.id}</span>
						<button onClick={handleCheckIfUserIsLogged}>check if logged</button>
					</>
				)}
				<div className='userpopup__buttons--darkmode'>
					Dark mode:{" "}
					<button className={`${isDarkModeOn ? "--on" : "--off"}`} onClick={switchTheme}>
						<span></span>
					</button>
				</div>
			</section>
		</div>
	);
};

export default UserPopup;
