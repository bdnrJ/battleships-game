import logo from "../../assets/logo.gif";
import { Link } from "react-router-dom";
import { BiUser } from "react-icons/bi";
import BurgerMenu from "./BurgerMenu";
import { useState } from "react";

export type link = {
	name: string;
	direction: string;
};

const Navbar = () => {
	const [isBurgerOn, setIsBurgerOn] = useState<boolean>(false);
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
			<div className='navbar--logo'>
				<img src={logo} alt='logo' />
			</div>
			<div className='navbar--links'>
				{links.map((link) => (
					<Link to={link.direction} key={link.direction} className='g__link'>
						{link.name}
					</Link>
				))}
			</div>
			<div className="navbar__utils">
				<div className='navbar--account'>
					<button>
						<BiUser />
					</button>
				</div>
				<button className={`navbar--burger ${isBurgerOn ? "--active" : ""}`} onClick={() => setIsBurgerOn(prev => !prev)}>
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
