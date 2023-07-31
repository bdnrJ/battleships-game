import React, { SetStateAction } from 'react';
import { getCookie } from '../../utils/cookies';
import { v4 as uuidv4 } from 'uuid';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { GameRoom } from '../../views/Rooms';

type Props = {
    createRoom: (room: GameRoom) => void,
    closePopup: () => void,
}

type roomInput = {
    roomName: string,
    hasPassword: boolean,
    password: string,
}

const CreateRoom = ({createRoom, closePopup}: Props) => {
    const hostName = getCookie('userInfo')
        ? JSON.parse(getCookie('userInfo')).nickname
        : `Anon - ${uuidv4().substr(0, 8)}`;

    const schema = z.object({
        roomName: z.string().min(3, "min 3 chars required"),
        hasPassword: z.boolean(),
        password: z.string().nonempty().min(3, "min 3 chars"),
    });

    const { control, register, handleSubmit, watch, formState: { errors } } = useForm<roomInput>({
        defaultValues: {
            roomName: hostName + ' game room',
            hasPassword: false,
            password: '',
        },
        resolver: zodResolver(schema),
    });

    const hasPassword = watch('hasPassword', false);

    const onSubmit = (data: roomInput) => {
        const newRoom: GameRoom = {
            hostName: hostName,
            roomName: data.roomName,
            hasPassword: data.hasPassword,
            password: data.password,
        }        

        createRoom(newRoom);
        closePopup();
    };

    return (
        <div className="createroom">
            <form onSubmit={handleSubmit(onSubmit)} className="g__form">
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
                        {errors.roomName && (
                            <span className="g__form--inputError">{errors.roomName.message}</span>
                        )}
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
                                type="password"
                                placeholder="Password"
                                {...register('password', { required: true })}
                            />
                            {errors.password && (
                                <span className="g__form--inputError">{errors.password.message}</span>
                            )}
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
