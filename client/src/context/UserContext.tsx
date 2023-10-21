import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import { getCookie, setCookie } from "../utils/cookies";
import { v4 } from "uuid";
import axiosClient from "../axios-client";

type Props = {
	children: ReactNode;
};

export type UserType = {
	nickname: string;
	sessionId: string;
};

export type LoggedUser = {
	id: number,
}

interface UserContextProps {
	user: UserType;
	setUser: Dispatch<SetStateAction<UserType>>;

	loggedUser: LoggedUser,
	setLoggedUser: Dispatch<SetStateAction<LoggedUser>>;
}

const defaultUser: UserType = {
	nickname: "",
	sessionId: "",
};

export const UserContext = createContext<UserContextProps>({
	user: defaultUser,
	setUser: () => {},

	loggedUser: {id: -1},
	setLoggedUser: () => {},
});

export const handleUserWithNoNickanme = (setUser: React.Dispatch<SetStateAction<UserType>>, sessionId: string) => {
	if (getCookie("userInfo")) {
		const userFromCookie = JSON.parse(getCookie("userInfo")).nickname;

		console.log(userFromCookie);

		setUser({
			nickname: userFromCookie,
			sessionId: sessionId,
		});
	} else {
		if (getCookie("anonNickname")) {
			const nickname = getCookie("anonNickname");
			
			setUser({
				nickname: nickname,
				sessionId: sessionId,
			});

		} else {

			const nickname = `Anon-${v4().substr(0, 8)}`;
			setCookie("anonNickname", nickname, 999);

			setUser({
				nickname: nickname,
				sessionId: sessionId,
			});
		}
	}
};

export const handleUserWithNoNickanmeBeforeJoin = (setUser: React.Dispatch<SetStateAction<UserType>>): string => {
	if (getCookie("userInfo")) {
		const userFromCookie = JSON.parse(getCookie("userInfo")).nickname;

		setUser((prev) => ({ ...prev, nickname: userFromCookie }));

		return userFromCookie;
	} else {
		if (getCookie("anonNickname")) {
			const nickname = getCookie("anonNickname");

			setUser((prev) => ({ ...prev, nickname: nickname }));

			return nickname;
		} else {
			const nickname = `Anon-${v4().substr(0, 8)}`;

			setCookie("anonNickname", nickname, 999);

			setUser((prev) => ({ ...prev, nickname: nickname }));

			return nickname;
		}
	}
};

export const UserProvider = ({ children }: Props) => {
	const [user, setUser] = useState<UserType>(defaultUser);
	const [loggedUser, setLoggedUser] = useState<LoggedUser>({id: -1});

	const handleCheckIfUserIsLogged = async () => {
		try{
			const res = await axiosClient.get('/isUser', {withCredentials: true});

			setLoggedUser({id: res.data.user_id})
		}catch(err: any){
			console.log(err);
		}
	}

	useEffect(() => {
		if (getCookie("userInfo")) {
			const userFromCookie = JSON.parse(getCookie("userInfo"));

			console.log("i get called");
			
			setUser(userFromCookie);

			handleCheckIfUserIsLogged();
		} else {
			if (getCookie("anonNickname")) {
				const nickname = getCookie("anonNickname");

				setUser({
					nickname: nickname,
					sessionId: "",
				});
			} else {
				const nickname = `Anon-${v4().substr(0, 8)}`;

				setCookie("anonNickname", nickname, 999);

				setUser({
					nickname: nickname,
					sessionId: "",
				});
			}
		}
	}, []);

	return <UserContext.Provider value={{ user, setUser, loggedUser, setLoggedUser }}>{children}</UserContext.Provider>;
};
