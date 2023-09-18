import { FormEvent, useEffect, useState } from "react";
import { Button, Card, CardBody, Checkbox, Input } from "@nextui-org/react";
import { toast } from 'react-hot-toast';
import useUserData from "../hooks/useUserData";
import { useNavigate, useParams } from "react-router-dom";
import useSocketClient from "../hooks/useSocketClient";

export default function RoomJoin() {
    const [isLoading, setIsLoading] = useState(false);
    const { username, setUsername, setIsObserver, setRoomId } = useUserData();
    const [localUsername, setLocalUsername] = useState(username);
    const { roomId: urlRoomId } = useParams();
    const { socket, isConnected } = useSocketClient();
    const navigate = useNavigate();

    async function onFormSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        const formData = new FormData(event.target as HTMLFormElement);
        const formUsername = formData.get('username') as string;

        setUsername(formUsername);
        setIsObserver(formData.get('isObserver') === 'true');
    }

    function onCreateRoomClick() {
        setUsername(localUsername || '');
        navigate('/');
    }

    useEffect(() => {
        if (!isConnected) {
            return;
        }

        async function joinRoom() {
            const roomIdToJoin = urlRoomId || (await socket.emitWithAck('createRoom')).id;
            setRoomId(roomIdToJoin);

            const roomUser = await socket.emitWithAck('joinRoom', roomIdToJoin);
            if (!roomUser) {
                // Reset the username in context to enable connect retries.
                setUsername('');
                setIsLoading(false);
                toast.error(
                    'Erro ao entrar na sala. A sala não existe ou há algum problema na conexão com o servidor.'
                    , { id: 'join-room-error' });
                return;
            }

            navigate(`/room/${roomIdToJoin}`);
        }

        joinRoom();
    }, [isConnected, navigate, setRoomId, setUsername, socket, urlRoomId]);

    return (
        <div className="container flex flex-col h-full justify-center items-center">
            <form className="flex flex-col gap-5 w-full xl:w-2/3" onSubmit={onFormSubmit}>
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
                    value={localUsername}
                    onChange={(evt) => setLocalUsername(evt.target.value)}
                    required
                />
                <Checkbox name="isObserver" color="default" value="true">Observador?</Checkbox>
                <div className="flex gap-4 w-full">
                    <Button type="submit" color="primary" isLoading={isLoading} className="flex-1">
                        {urlRoomId ? 'Entrar na sala' : 'Criar sala'}
                    </Button>
                    {urlRoomId && (
                        <Button type="button" color="secondary" onClick={onCreateRoomClick} className="flex-1">
                            Criar sala
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}
