import { v4 as uuidv4 } from 'uuid';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameRoomType, GameStage, RoomContext } from '../../context/RoomContext';
import socket from '../../utils/socket';
import { UserContext } from '../../context/UserContext';

type Props = {
    createRoom: (room: GameRoomType) => void,
    closePopup: () => void,
    inModal: boolean,
}

type roomInput = {
    roomName: string,
    hasPassword: boolean,
    password: string,
}

const CreateRoom = ({ createRoom, inModal }: Props) => {
    const navigate = useNavigate();
    const { setRoom } = useContext(RoomContext);
    const {user} = useContext(UserContext);

    useEffect(() => {
        socket.on('createdAndJoined', ((data) => {
            setRoom(data);
            navigate(`/room/${data.id}`)
        }))


        return () => {
            socket.off('createdAndJoined');
        };
    }, []);

    const schema = z.object({
        roomName: z.string().min(3, "min 3 chars required"),
        hasPassword: z.boolean(),
        password: z.string().refine((value) => !hasPassword || value.trim() !== '', {
            message: "Password is required when 'hasPassword' is true",
        }),
    }).refine((data) => !data.hasPassword || data.password.trim().length >= 3, {
        message: "Password must be at least 3 characters long",
        path: ['password'],
    });


    const { register, handleSubmit, watch, formState: { errors } } = useForm<roomInput>({
        defaultValues: {
            roomName: user.nickname + ' game room',
            hasPassword: false,
            password: '',
        },
        resolver: zodResolver(schema),
    });

    const hasPassword: boolean = watch('hasPassword', false);

    const onSubmit = async (data: roomInput) => {
        const newRoom: GameRoomType = {
            id: uuidv4(),
            hostName: user.nickname,
            roomName: data.roomName,
            hasPassword: data.hasPassword,
            password: data.password,
            clients: [],
            clientNicknames: [],
            clientBoards: [],
            clientReady: [],
            gameState: GameStage.WAITING
        }

        await createRoom(newRoom);
        // setRoom(newRoom);
    };

    return (
        <div className="createroom">
            <form onSubmit={handleSubmit(onSubmit)} className={`g__form ${inModal ? '--inmodal' : '' }`}>
                <div className="g__form--title">Room creation</div>
                <div className="g__form__inputs">
                    <div className="g__form__inputs--inputwrapper">
                        <label htmlFor="roomName">
                            <input
                                className={`g__form--input ${errors.roomName && "--error"}`}
                                type="text"
                                placeholder="Room Name"
                                {...register('roomName', { required: true })}
                            />
                        </label>
                        <div className="g__form__inputs--inputwrapper--error">
                            {errors.roomName && (
                                <span className={`g__form--inputError`}>
                                    {errors.roomName.message}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="g__form__inputs--inputwrapper">
                        <label htmlFor="hasPassword" className='g__form__inputs--inputwrapper--checkbox'>
                            <span>
                                Has Password:
                            </span>
                            <input
                                type="checkbox"
                                {...register('hasPassword')}
                            />
                        </label>
                    </div>
                    {hasPassword && (
                        <div className="g__form__inputs--inputwrapper">
                            <label htmlFor="password"></label>
                            <input
                                className={`g__form--input ${errors.password && "--error"}`}
                                type="text"
                                placeholder="Password"
                                {...register('password', { required: true })}
                            />
                            <div className="g__form__inputs--inputwrapper--error">
                                {errors.password && (
                                    <span className={`g__form--inputError`}>
                                        {errors.password.message}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <button type="submit" className="g__form--submit">
                    Create Room
                </button>
            </form>
        </div>
    );
};

export default CreateRoom;
