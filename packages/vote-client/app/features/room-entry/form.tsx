import type { SubmitHandler } from 'react-hook-form';
import type { Infer } from 'superstruct';
import { Controller, useForm } from 'react-hook-form';
import { superstructResolver } from '@hookform/resolvers/superstruct';
import { Form, useSubmit } from 'react-router';
import { authenticationData } from '~/features/room-entry/authenticationData';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Switch } from '~/components/ui/switch';
import { Button } from '~/components/ui/button';

interface LoginFormProps {
    roomId?: string;
}

export function LoginForm({ roomId }: LoginFormProps) {
    const submit = useSubmit();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<Infer<typeof authenticationData> & { isObserver: boolean }>({
        resolver: superstructResolver(authenticationData),
    });

    const onSubmit: SubmitHandler<Record<string, unknown>> = (_, event) => {
        submit(event!.target);
    };

    return (
        <Form method="post" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="nickname">Nickname</Label>
                    <Input
                        id="nickname"
                        placeholder="Enter your nickname"
                        aria-invalid={errors.nickname ? 'true' : 'false'}
                        {...register('nickname')}
                    />
                    {errors.nickname && (
                        <p className="text-sm text-red-500" role="alert">
                            The nickname must be between 2 and 32 characters
                        </p>
                    )}
                </div>
                {roomId && (
                    <div className="space-y-2">
                        <Label htmlFor="roomid">Room ID</Label>
                        <Input value={roomId} id="roomId" readOnly />
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
