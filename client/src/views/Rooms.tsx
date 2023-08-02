import { useContext, useEffect, useState, useRef } from 'react';
import socket from '../utils/socket';
import Modal from '../components/modals/Modal';
import CreateRoom from '../components/modals/CreateRoom';
import Room from '../components/Room';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { GameRoomType, RoomContext } from '../context/RoomContext';



const Rooms = () => {
  const [isCreateRoomVisible, setIsCreateRoomVisible] = useState<boolean>(false);
  const [rooms, setRooms] = useState<GameRoomType[]>([]);
  const {setRoom} = useContext(RoomContext);
  const navigate = useNavigate();

  //to make useeffect work once for tests :)
  const effectCalled = useRef<boolean>(false);

  useEffect(() => {
    // if (effectCalled.current) return;
    // Emit the event to request the list of available rooms
    socket.emit('getRooms');

    // Listen for the event that sends the list of available rooms
    socket.on('roomsList', (availableRooms) => {
      setRooms([...availableRooms]);
    });

    socket.on('roomJoined', ((room) => {
      setRoom(room);
      navigate(`/room/${room.id}`)
    }))

    socket.on('roomError', (error) => console.log(error))

    // Clean up the event listener when the component unmounts
    effectCalled.current = true;
    return () => {
      socket.off('roomsList'); // Remove the 'roomsList' event listener
      socket.off('roomJoined'); // Remove the 'roomJoined' event listener
      socket.off('roomError'); // Remove the 'roomError' event listener
    };
  }, []); // Empty dependency array to run the effect only once when the component mounts

  // Function to create a new room
  const createRoom = (gameRoom: GameRoomType) => {
    socket.emit('createRoom', gameRoom); // You can change the room name as needed
  };

  return (
    <div className="rooms">
      {rooms.map((room) => (
        <Room key={room.id} gameRoom={room} />
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
