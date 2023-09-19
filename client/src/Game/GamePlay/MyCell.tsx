import React from 'react'

type Props = {
  value: number,
}

const MyCell = ({ value }: Props) => {
  return (
    <div className={`mycell ${value === 1 ? '--destroyer' : value === 2 ? '--cruiser' : value === 3 ? '--battleship' : value === 4 ? "--carrier" : ""} ${value === 6 && '--hitted'}`}>
      {value}
    </div>
  )
}

export default MyCell