import type { SubmitHandler } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, useSubmit } from 'react-router';
import {
    roomCreateSchema,
    roomJoinSchema,
    type RoomCreateSchema,
    type RoomJoinShema,
} from '~/lib/roomFormSchema';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Switch } from '~/components/ui/switch';
import { Button } from '~/components/ui/button';

interface LoginFormProps {
    roomId?: string;
    prevNickname?: string;
    schema: typeof roomJoinSchema | typeof roomCreateSchema;
}

export function LoginForm({ roomId, prevNickname, schema }: LoginFormProps) {
    const submit = useSubmit();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<RoomCreateSchema & RoomJoinShema>({
        resolver: zodResolver(schema),
        criteriaMode: 'all',
        defaultValues: {
            roomId: roomId || '',
            nickname: prevNickname || '',
        },
    });

    const onSubmit: SubmitHandler<Record<string, unknown>> = async (
        _,
        event,
    ) => {
        await submit(event!.target);
    };

    const isJoining = schema === roomJoinSchema;

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
                            {errors.nickname.message}
                        </p>
                    )}
                </div>
                {isJoining && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="roomId">Room ID</Label>
                            <Input
                                id="roomId"
                                readOnly={!!roomId}
                                aria-invalid={errors.roomId ? 'true' : 'false'}
                                {...register('roomId')}
                            />
                        </div>
                        {errors.roomId && (
                            <p className="text-sm text-red-500" role="alert">
                                {errors.roomId.message}
                            </p>
                        )}
                    </>
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
                    {isJoining ? 'Join Room' : 'Create New Room'}
                </Button>
            </div>
        </Form>
    );
}
