import { FormEvent } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Button, Checkbox, Input } from "@nextui-org/react";
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
        <div className="flex flex-col h-full justify-center items-center">
            <form className="flex flex-col gap-3 w-1/3" onSubmit={onFormSubmit}>
                <Input type="text" name="username" label="Insira um nome de usuário" defaultValue={savedUsername} required />
                <Checkbox name="isObserver" color="default" value="true">Observador?</Checkbox>
                <Button type="submit" color="primary">Enviar</Button>
            </form>
        </div>
    );
}
