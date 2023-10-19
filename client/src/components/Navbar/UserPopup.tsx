import { useContext, useEffect, useRef } from "react";
import { UserContext } from "../../context/UserContext";
import { Link } from "react-router-dom";

type Props = {
	hideUserPopup: () => void;
};

const UserPopup = ({ hideUserPopup }: Props) => {
	const { user } = useContext(UserContext);

	const popupRef = useRef<any>(null);

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
      <section className="userpopup__buttons">
        <Link to={'/signin'} className="g__link">
          Sign In
        </Link>
        <Link to={'/signup'} className="g__link">
          Sign Up
        </Link>
      </section>
		</div>
	);
};

export default UserPopup;
