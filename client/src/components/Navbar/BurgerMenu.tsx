import { link } from "./Navbar";
import { Link } from "react-router-dom";

type Props = {
	links: link[];
  closeBurgerMenu: () => void;
};

const BurgerMenu = ({ links, closeBurgerMenu }: Props) => {
	return (
		<div className='burgermenu'>
			<div className='burgermenu__links'>
				{links.map((link) => (
					<Link to={link.direction} key={link.direction} className='g__link' onClick={closeBurgerMenu}>
						{link.name}
					</Link>
				))}
			</div>
		</div>
	);
};

export default BurgerMenu;
