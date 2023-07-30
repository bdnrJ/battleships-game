import React from 'react'
import logo from '../assets/logo.gif';
import { Link } from 'react-router-dom';
import {BiUser} from 'react-icons/bi'

type links = {
    name: string,
    direction: string
}

const Navbar = () => {

    const links: links[] = [
        {
            name: "Game",
            direction: "/game"
        },
        {
            name: "Rooms",
            direction: "/rooms"
        },
        {
            name: "Ranking",
            direction: "/ranking"
        },
        {
            name: "SignIn",
            direction: "/signin"
        },
        {
            name: "SignUp",
            direction: "/signup"
        },
    ]

    return (
        <div className="navbar">
            <div className="navbar--logo">
                <img src={logo} alt="logo" />
            </div>
            <div className="navbar--links">
                {links.map((link) => (
                    <Link to={link.direction} key={link.direction}>
                        <button>
                            {link.name}
                        </button>
                    </Link>
                ))}
            </div>
            <div className="navbar--account">
                <button>
                    <BiUser />
                </button>
            </div>
        </div>
    )
}

export default Navbar