import type { SubmitHandler } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, useSubmit } from 'react-router';
import { roomJoinForm, type RoomJoinForm } from '~/lib/roomJoinForm';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Switch } from '~/components/ui/switch';
import { Button } from '~/components/ui/button';

interface LoginFormProps {
    roomId?: string;
    prevNickname?: string;
    nicknameTaken?: boolean;
}

let hasAddedServerErrors = false;

export function LoginForm({
    roomId,
    prevNickname,
    nicknameTaken,
}: LoginFormProps) {
    const submit = useSubmit();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        setError,
    } = useForm<RoomJoinForm & { isObserver: boolean }>({
        resolver: zodResolver(roomJoinForm),
    });

    const onSubmit: SubmitHandler<Record<string, unknown>> = (_, event) => {
        hasAddedServerErrors = false;
        submit(event!.target);
    };

    if (nicknameTaken && !hasAddedServerErrors) {
        setError('nickname', {
            type: 'nickname-taken',
            message: 'The nickname is already taken.',
        });

        hasAddedServerErrors = true;
    }

    return (
        <Form method="post" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="nickname">Nickname</Label>
                    <Input
                        id="nickname"
                        placeholder="Enter your nickname"
                        aria-invalid={errors.nickname ? 'true' : 'false'}
                        defaultValue={prevNickname}
                        {...register('nickname')}
                    />
                    {errors.nickname && (
                        <p className="text-sm text-red-500" role="alert">
                            {errors.nickname.message}
                        </p>
                    )}
                </div>
                {roomId && (
                    <div className="space-y-2">
                        <Label htmlFor="roomid">Room ID</Label>
                        <Input value={roomId} id="roomId" disabled />
                    </div>
                )}
                <div className="flex items-center space-x-2">
                    <Controller
                        name="isObserver"
                        control={control}
                        render={({
                            field: { onChange, onBlur, value, ref },
                        }) => (
                            <Switch
                                id="is-observer"
                                name="isObserver"
                                checked={value}
                                onCheckedChange={onChange}
                                onBlur={onBlur}
                                ref={ref}
                            />
                        )}
                    />

                    <Label htmlFor="is-observer">Join as Observer</Label>
                </div>
                <Button type="submit" className="w-full">
                    {roomId ? 'Join Room' : 'Create New Room'}
                </Button>
            </div>
        </Form>
    );
}
