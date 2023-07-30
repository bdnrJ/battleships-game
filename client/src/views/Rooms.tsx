import React, { useEffect, useState } from 'react';
import socket from '../socket';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);

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
  const createRoom = () => {
    socket.emit('createRoom', { roomName: 'Room Name' }); // You can change the room name as needed
  };

  return (
    <div className="rooms">
      {rooms.map((room) => (
        <div className="rooms--room" key={room.id}>
          {room.name}
        </div>
      ))}
      <button onClick={createRoom}>Create Room</button>
    </div>
  );
};

export default Rooms;
