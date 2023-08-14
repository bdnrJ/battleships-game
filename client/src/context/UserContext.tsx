import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import axiosClient from "../axios-client";
import { getCookie, setCookie } from "../utils/cookies";
import { v4 } from "uuid";

type Props = {
	children: ReactNode;
};

export type UserType = {
	nickname: string;
	email: string | undefined;
};

interface UserContextProps {
	user: UserType;
	setUser: Dispatch<SetStateAction<UserType>>;
}

const defaultUser: UserType = {
	nickname: "",
	email: "",
};

export const UserContext = createContext<UserContextProps>({
	user: defaultUser,
	setUser: () => {},
});

export const UserProvider = ({ children }: Props) => {
	const [user, setUser] = useState<UserType>(defaultUser);

	useEffect(() => {
		if (getCookie("userInfo")) {
			const userFromCookie = JSON.parse(getCookie("userInfo"));
			setUser(userFromCookie);
		} else {
			const nickname = `Anon-${v4().substr(0, 8)}`;
			setUser({
				nickname: nickname,
				email: "",
			});
		}
	}, []);

	return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};
