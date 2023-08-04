import React, { useState } from 'react'
import MyCell from './MyCell';

type Props = {
    myBoard: number[][],
}

const MyBoard = ({myBoard}: Props) => {

    const upperMarks = ['A', 'B', 'C', 'D', 'E', 'F', 'G','H', 'I', 'J'];
    const leftMarks = [1,2,3,4,5,6,7,8,9,10]

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
                {myBoard.map((row, rowIdx) => (
                    row.map((cell, columnIdx) => (
                        <MyCell value={cell} />
                    ))
                ))}
                </div>
            </div>
        </div>
    </div>
  )
}

export default MyBoard