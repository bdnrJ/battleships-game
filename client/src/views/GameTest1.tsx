// GameTest1.tsx
import React, { useState } from 'react';
import Board from './GameTest/Board';
import Ship from './GameTest/Ship';

const GameTest1: React.FC = () => {
  const [board, setBoard] = useState<number[][]>(Array(10).fill(Array(10).fill(0)));
  const [shipsPlaced, setShipsPlaced] = useState<string[]>([]);

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    // Implement your game logic for attacking here
    // For example, check if the cell has already been attacked or contains a ship,
    // update the board state accordingly, and trigger the opponent's turn.
  };

  const handleShipDrop = (rowIndex: number, colIndex: number, shipType: string) => {
    // Implement your ship placement logic here
    // Check if the ship can be placed at the selected position based on the board's current state
    const shipLength = shipType === 'carrier' ? 4 : shipType === 'battleship' ? 3 : shipType === 'cruiser' ? 2 : 1;

    // Check if the ship can fit within the boundaries of the board
    if (rowIndex + shipLength > 10 || colIndex + shipLength > 10) {
      // Ship placement is invalid (exceeds the board's boundaries)
      return;
    }

    // Check if there are any existing ships or attacked cells in the selected area
    for (let i = 0; i < shipLength; i++) {
      if (board[rowIndex + i][colIndex] !== 0 || board[rowIndex][colIndex + i] !== 0) {
        // Ship placement is invalid (overlaps with an existing ship or attacked cell)
        return;
      }
    }

    // Place the ship on the board
    const newBoard = [...board];
    for (let i = 0; i < shipLength; i++) {
      newBoard[rowIndex + i][colIndex] = 1; // Set ship cells to 1
    }
    setBoard(newBoard);

    // Update the shipsPlaced state to keep track of placed ships
    if (!shipsPlaced.includes(shipType)) {
      setShipsPlaced([...shipsPlaced, shipType]);
    }
  };

  const handleShipDragStart = (shipType: string) => {
    // Set the selected ship type when the drag operation starts
    // This will allow the board to know which ship type is being dragged
    setSelectedShip(shipType);
  };

  return (
    <div className="game">
      <div className="game__other">other</div>
      <div className="game__board">
        <Board board={board} onCellClick={handleCellClick} onShipDrop={handleShipDrop} />
      </div>
      <div className="game__ships">
        <Ship type="carrier" draggable={!shipsPlaced.includes('carrier')} onDragStart={handleShipDragStart} />
        <Ship type="battleship" draggable={!shipsPlaced.includes('battleship')} onDragStart={handleShipDragStart} />
        <Ship type="cruiser" draggable={!shipsPlaced.includes('cruiser')} onDragStart={handleShipDragStart} />
        <Ship type="destroyer" draggable={!shipsPlaced.includes('destroyer')} onDragStart={handleShipDragStart} />
      </div>
    </div>
  );
};

export default GameTest1;


// Board.tsx
import React, { useState } from 'react';
import Cell from './Cell';

interface BoardProps {
    board: number[][];
    onCellClick: (rowIndex: number, colIndex: number) => void;
    onShipDrop: (rowIndex: number, colIndex: number, shipType: string) => void;
}

const Board: React.FC<BoardProps> = ({ board, onCellClick, onShipDrop }) => {
    const [selectedShip, setSelectedShip] = useState<string | null>(null);

    const handleDrop = (rowIndex: number, colIndex: number) => {
        if (selectedShip) {
            onShipDrop(rowIndex, colIndex, selectedShip);
            setSelectedShip(null);
        }
    };

    const handleCellClick = (rowIndex: number, colIndex: number) => {
        // Handle cell clicks during ship placement (if required)
    };

    return (
        <div className="grid">
            {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                    <Cell
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => onCellClick(rowIndex, colIndex)}
                        onDrop={() => handleDrop(rowIndex, colIndex)}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        {cell}
                    </Cell>
                ))
            )}
        </div>
    );
};

export default Board;

// Cell.tsx
import React from 'react';

interface CellProps {
    children: React.ReactNode;
    onClick: () => void;
}

const Cell: React.FC<CellProps> = ({ children, onClick }) => {
    return <div className="cell" onClick={onClick}>{children}</div>;
};

export default Cell;


// Ship.tsx
import React from 'react';
import './Ship.scss';

interface ShipProps {
    type: string;
    draggable: boolean;
    onDragStart: (shipType: string) => void;
}

const Ship: React.FC<ShipProps> = ({ type, draggable, onDragStart }) => {
    const shipLength = type === 'carrier' ? 4 : type === 'battleship' ? 3 : type === 'cruiser' ? 2 : 1;

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        onDragStart(type);
        e.dataTransfer.setData('text', type);
    };

    return (
        <div
            className={`ship ship-${type}`}
            style={{ width: `${shipLength * 40}px` }}
            draggable={draggable}
            onDragStart={handleDragStart}
        />
    );
};

export default Ship;

