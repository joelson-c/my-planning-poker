import { FormEvent, useEffect, useRef, useState } from "react";
import { Card, CardBody, Checkbox, Input, Spinner } from "@nextui-org/react";
import RoomJoinActions, { FormAction } from "../components/pageActions/RoomJoinActions";
import useSocketConnect from "../hooks/socket/useSocketConnect";
import useCreateRoom from "../hooks/socket/useCreateRoom";
import { useParams } from "react-router-dom";
import useJoinRoom from "../hooks/socket/useJoinRoom";
import { useRootStore } from "../state/rootStore";

export default function RoomJoin() {
    const formRef = useRef<HTMLFormElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const localUserData = useRootStore((state) => state.localUserData);
    const [formAction, setFormAction] = useState<FormAction | null>(null);
    const { roomId: urlRoomId } = useParams();
    const connect = useSocketConnect(onSocketConnected);
    const createRoom = useCreateRoom();
    const joinRoom = useJoinRoom();

    async function onFormSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        const formData = new FormData(event.target as HTMLFormElement);
        const username = formData.get('username') as string;
        const isObserver = formData.get('isObserver') === 'true';

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

    function onActionRequested(action: FormAction) {
        setFormAction(action);
    }

    useEffect(() => {
        if (!formAction || !formRef.current) {
            return;
        }

        formRef.current.requestSubmit();
    }, [formAction]);

    if (isLoading) {
        return (
            <div className="container flex flex-col h-full justify-center items-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full justify-center items-center">
            <form className="flex flex-col gap-5 w-full xl:w-2/3" onSubmit={onFormSubmit} ref={formRef}>
                <Card classNames={{ base: 'bg-yellow-600', body: 'text-black' }}>
                    <CardBody>
                        <p>O primeiro usuário a entrar na sala se tornará um <strong>moderador</strong>.</p>
                        <p>Apenas <strong>moderadores</strong> podem encerrar a votação ou resetar a sala.</p>
                    </CardBody>
                </Card>
                <Input
                    type="text"
                    name="username"
                    label="Insira um nome de usuário"
                    defaultValue={localUserData?.username}
                    required
                />
                <Checkbox name="isObserver" color="default" value="true">Observador?</Checkbox>
                <input type="hidden" name="action" value={formAction || ''} />
                <RoomJoinActions onActionRequested={onActionRequested} />
            </form>
        </div>
    );
}
