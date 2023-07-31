import React, { useEffect, useState } from 'react';
import socket from '../utils/socket';
import Modal from '../components/modals/Modal';
import CreateRoom from '../components/modals/CreateRoom';

export interface GameRoom {
  roomName: string,
  hostName: string,
  hasPassword: boolean,
  password: string,
}


const Rooms = () => {
  const [isCreateRoomVisible, setIsCreateRoomVisible] = useState<boolean>(false);
  const [rooms, setRooms] = useState<GameRoom[]>([]);

  useEffect(() => {
    // Emit the event to request the list of available rooms
    socket.emit('getRooms');

    // Listen for the event that sends the list of available rooms
    socket.on('roomsList', (availableRooms) => {
      setRooms([...availableRooms]);
    });

    // Clean up the event listener when the component unmounts
    return () => {
      socket.off('roomsList'); // Remove the 'roomsList' event listener
    };
  }, []); // Empty dependency array to run the effect only once when the component mounts

  // Function to create a new room
  const createRoom = (gameRoom: GameRoom) => {
    socket.emit('createRoom', gameRoom); // You can change the room name as needed
  };

  return (
    <div className="rooms">
      {rooms.map((room) => (
        <div className="rooms--room" key={room.hostName + room.roomName}>
          <span>Host: {room.hostName}</span>
          <span>Name: {room.roomName}</span>
          <span>Password: {room.hasPassword}</span>
          <span>Password xd lmao: {room.password}</span>
        </div>
      ))}
      <button onClick={() => setIsCreateRoomVisible(true)}>Create Room</button>
      {isCreateRoomVisible &&
        <Modal onClose={() => setIsCreateRoomVisible(false)}>
          <CreateRoom closePopup={() => setIsCreateRoomVisible(false)} createRoom={createRoom}/>
        </Modal>
        }
    </div>
  );
};

export default Rooms;
