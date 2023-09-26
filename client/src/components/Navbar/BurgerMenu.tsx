import { link } from "./Navbar";
import { Link } from "react-router-dom";
import {useEffect, useRef} from 'react';

type Props = {
	links: link[];
  closeBurgerMenu: () => void;
};

const BurgerMenu = ({ links, closeBurgerMenu }: Props) => {

  const popupRef = useRef<any>(null);

	//handling popup visibility
	useEffect(() => {
		const htmlElement = document.documentElement;

		// Set overflow hidden on the html element
		htmlElement.style.overflow = "hidden";

		function handleClickOutside(event: Event) {
			if (
				popupRef.current &&
				!popupRef.current.contains(event.target)
			) {
				closeBurgerMenu();
			}
		}

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);

			// Reset overflow to "visible" when the component unmounts
			htmlElement.style.overflow = "visible";
		};
	}, [popupRef]);

	return (
		<div className='burgermenu' ref={popupRef}>
			<section className='burgermenu__links'>
				{links.map((link) => (
					<Link to={link.direction} key={link.direction} className='g__link' onClick={closeBurgerMenu}>
						{link.name}
					</Link>
				))}
			</section>
		</div>
	);
};

export default BurgerMenu;
