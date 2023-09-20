import EnemyCell from './EnemyCell';
import { gameplayState } from '../../views/GameRoom';
import { v4 } from 'uuid';

type Props = {
    enemyBoard: number[][],
    gameplayStageRoom: gameplayState,
}

const EnemyBoard = ({enemyBoard, gameplayStageRoom}: Props) => {

    const upperMarks = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const leftMarks = [1,2,3,4,5,6,7,8,9,10];

  return (
    <div className="gameboard">
        <div className="gameboard--boardwrapper">
            <div className="gameboard--uppermarks">
                {upperMarks.map((letter) => (
                    <div  key={`m${letter}`} className="gameboard__marks--elem">
                        {letter}
                    </div>
                ))}
            </div>
            <div className="gameboard__rest">
                <div className="gameboard--leftmarks">
                {leftMarks.map((number) => (
                    <div  key={`m${number}`} className="gameboard__marks--elem">
                        {number}
                    </div>
                ))}
                </div>
                <div className="gameboard__board">
                {enemyBoard.map((row, rowIdx) => (
                    row.map((cell, columnIdx) => (
                        <EnemyCell key={v4()}  value={cell} rowIdx={rowIdx} colIdx={columnIdx} turn={gameplayStageRoom.turn}/>
                    ))
                ))}
                </div>
            </div>
        </div>
    </div>
  )
}

export default EnemyBoard