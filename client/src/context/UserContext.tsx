import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import { getCookie, setCookie } from "../utils/cookies";
import { v4 } from "uuid";

type Props = {
	children: ReactNode;
};

export type UserType = {
	nickname: string;
	sessionId: string;
};

interface UserContextProps {
	user: UserType;
	setUser: Dispatch<SetStateAction<UserType>>;
}

const defaultUser: UserType = {
	nickname: "",
	sessionId: "",
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

	return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};
