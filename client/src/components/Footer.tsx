import {AiFillGithub} from 'react-icons/ai';

const Footer = () => {
  return (
    <footer className="footer">
      <span>Simple Multiplayer Battleships Game</span>
      <span>Using React, Node.js, Socket.io</span>
      <a href='https://github.com/bdnrJ/battleships-game' target='_blank' className='footer--github' ><AiFillGithub/> bdnrJ</a>
    </footer>
  )
}

export default Footer