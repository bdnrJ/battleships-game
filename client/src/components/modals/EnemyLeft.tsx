type Props = {
  handleClose: () => void;
  hasGameEnded: boolean,
}

const EnemyLeft = ({handleClose, hasGameEnded}: Props) => {
  return (
    <div className="enemyleft">
      <div className="enemyleft--title">
        {hasGameEnded ? "Your enemy left" : "Your enemy has left the game :/"}
      </div>
      <button className="g__button" onClick={handleClose} aria-label='ok'>
        OK
      </button>
    </div>
  )
}

export default EnemyLeft