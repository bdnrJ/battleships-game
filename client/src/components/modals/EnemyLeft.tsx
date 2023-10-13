type Props = {
  handleClose: () => void;
}

const EnemyLeft = ({handleClose}: Props) => {
  return (
    <div className="enemyleft">
      <div className="enemyleft--title">
        Your enemy has left the game :/
      </div>
      <button className="g__button" onClick={handleClose} aria-label='ok'>
        OK
      </button>
    </div>
  )
}

export default EnemyLeft