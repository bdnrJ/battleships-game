import logo from "../../assets/logo.gif";
import { Link, useNavigate } from "react-router-dom";
import { BiUser } from "react-icons/bi";
import BurgerMenu from "./BurgerMenu";
import { useState } from "react";
import UserPopup from "./UserPopup";

export type link = {
	name: string;
	direction: string;
};

const Navbar = () => {
	const [isBurgerOn, setIsBurgerOn] = useState<boolean>(false);
	const [isUserPopupOn, setIsUserPopupOn] = useState<boolean>(false);
	const navigate = useNavigate();
	const links: link[] = [
		{
			name: "Game",
			direction: "/game",
		},
		{
			name: "Rooms",
			direction: "/rooms",
		},
		{
			name: "Ranking",
			direction: "/ranking",
		},
	];

	return (
		<div className='navbar'>
			{/* TODO <div className='navbar--logo' onClick={() => navigate('/')}> */}
			<div className='navbar--logo' onClick={() => navigate("/rooms")}>
				<img src={logo} alt='logo' />
			</div>
			<section className='navbar--links'>
				{links.map((link) => (
					<Link to={link.direction} key={link.direction} className='g__link'>
						{link.name}
					</Link>
				))}
			</section>
			<div className='navbar__utils'>
				<div className='navbar--account dontTriggerEvent'>
					<button onClick={() => {if(!isUserPopupOn) setIsUserPopupOn(true); setIsBurgerOn(false)}}>
						<BiUser />
					</button>
					{isUserPopupOn && <UserPopup hideUserPopup={() => {setIsUserPopupOn(false); setIsBurgerOn(false)}} />}
				</div>
				<button
					className={`navbar--burger ${isBurgerOn ? "--active" : ""}`}
					onClick={() => setIsBurgerOn((prev) => !prev)}
				>
					<span className='dontTriggerEvent'></span>
					<span className='dontTriggerEvent'></span>
					<span className='dontTriggerEvent'></span>
				</button>
			</div>
			{isBurgerOn && <BurgerMenu links={links} closeBurgerMenu={() => setIsBurgerOn(false)} />}
		</div>
	);
};

export default Navbar;
