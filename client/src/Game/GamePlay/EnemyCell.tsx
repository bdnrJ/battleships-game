import React from 'react'
import { CellType } from './GamePlay'

type Props = {
    value: number,
}

const EnemyCell = ({value}: Props) => {
  return (
    <div className={`enemycell 
        ${value === CellType.NORMAL && '--normal'}
        ${value === CellType.HIT && '--hit'}
        ${value === CellType.DAMAGED && '--damaged'}
        ${value === CellType.DEAD && '--dead'}
        ${value === CellType.AROUNDDEAD && '--arounddead'}
    `}
    >
        {/* {value} */}
    </div>
  )
}

export default EnemyCell