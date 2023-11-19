import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useRef, useState } from 'react';

import { Card, CardBody, Checkbox, Input, Spinner } from '@nextui-org/react';

import { useRootStore } from '../state/rootStore';
import useSocketConnect from '../hooks/socket/useSocketConnect';
import useJoinRoom from '../hooks/socket/useJoinRoom';
import useCreateRoom from '../hooks/socket/useCreateRoom';
import RoomJoinActions, { FormAction } from '../components/pageActions/RoomJoinActions';

type FormData = {
    username: string;
    isObserver: boolean;
    action: string;
}

export default function RoomJoin() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>();

    const formRef = useRef<HTMLFormElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const localUserData = useRootStore((state) => state.localUserData);
    const [formAction, setFormAction] = useState<FormAction | null>(null);
    const { roomId: urlRoomId } = useParams();
    const connect = useSocketConnect(onSocketConnected, onSocketError);
    const createRoom = useCreateRoom();
    const joinRoom = useJoinRoom();

    async function onFormSubmit({ username, isObserver }: FormData) {
        setIsLoading(true);

        connect({
            username,
            isObserver
        });
    }

    async function onSocketConnected() {
        let roomId = '';
        switch (formAction) {
            case 'createRoom':
                roomId = await createRoom();
                break;
            case 'joinRoom':
                if (!urlRoomId) {
                    throw new Error('Missing room ID for "joinRoom" action');
                }

                roomId = urlRoomId;
                break;
            default:
                throw new Error('Unknown action: ' + formAction);
        }

        await joinRoom(roomId);
        setIsLoading(false);
    }

    function onSocketError() {
        setIsLoading(false);
    }

    function onActionRequested(action: FormAction) {
        if (!formRef.current) {
            return;
        }

        setFormAction(action);
        formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
    }

    if (isLoading) {
        return (
            <div className="container flex flex-col h-full justify-center items-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full justify-center items-center">
            <form className="flex flex-col gap-5 w-full xl:w-2/3" onSubmit={handleSubmit(onFormSubmit)} ref={formRef}>
                <Card classNames={{ base: 'bg-yellow-600', body: 'text-black' }}>
                    <CardBody>
                        <p>O primeiro usuário a entrar na sala se tornará um <strong>moderador</strong>.</p>
                        <p>Apenas <strong>moderadores</strong> podem encerrar a votação ou resetar a sala.</p>
                    </CardBody>
                </Card>
                <Input
                    type="text"
                    label="Insira um nome de usuário"
                    defaultValue={localUserData?.username}
                    isInvalid={!!errors.username}
                    {...register('username', { required: true })}
                />
                <Checkbox
                    color="default"
                    value="true"
                    {...register("isObserver")}
                >Observador?</Checkbox>
                <input type="hidden" value={formAction || ''} {...register("action")} />
                <RoomJoinActions onActionRequested={onActionRequested} />
            </form>
        </div>
    );
}
