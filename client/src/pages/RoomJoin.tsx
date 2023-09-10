import { FormEvent } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Button, Card, CardBody, Checkbox, Input } from "@nextui-org/react";
import useUserData from "../hooks/useUserData";

export default function UsernameEntry() {
    const { setUsername, setIsObserver } = useUserData();
    const [savedUsername, setSavedUsername] = useLocalStorage<string | undefined>('username', undefined);

    function onFormSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.target as HTMLFormElement);
        const formUsername = formData.get('username') as string;
        setUsername(formUsername);
        setSavedUsername(formUsername);
        setIsObserver(formData.get('isObserver') === 'true');
    }

    return (
        <div className="container flex flex-col h-full justify-center items-center">
            <form className="flex flex-col gap-5 w-full xl:w-2/3" onSubmit={onFormSubmit}>
                <Card classNames={{ base: 'bg-yellow-600', body: 'text-black' }}>
                    <CardBody>
                        <p>O primeiro usuário a entrar na sala se tornará um <strong>moderador</strong>.</p>
                        <p>Apenas <strong>moderadores</strong> podem encerrar a votação ou resetar a sala.</p>
                    </CardBody>
                </Card>
                <Input type="text" name="username" label="Insira um nome de usuário" defaultValue={savedUsername} required />
                <Checkbox name="isObserver" color="default" value="true">Observador?</Checkbox>
                <Button type="submit" color="primary">Enviar</Button>
            </form>
        </div>
    );
}
