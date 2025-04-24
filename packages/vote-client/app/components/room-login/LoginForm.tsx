import type { DefaultValues, SubmitHandler } from 'react-hook-form';
import { createSchema, joinSchema, type LoginSchemas } from './schema';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, useSubmit } from 'react-router';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Switch } from '~/components/ui/switch';
import { Button } from '~/components/ui/button';
import { InputError } from '../InputError';

interface LoginFormProps {
    roomId?: string;
    defaultValues: DefaultValues<LoginSchemas>;
    isJoining?: boolean;
}

export function LoginForm({
    roomId,
    defaultValues,
    isJoining = false,
}: LoginFormProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(isJoining ? joinSchema : createSchema),
        criteriaMode: 'all',
        defaultValues: {
            ...defaultValues,
            nickname: defaultValues.nickname || '',
            roomId: defaultValues.roomId || '',
        },
    });

    const submit = useSubmit();
    const onSubmit: SubmitHandler<LoginSchemas> = async (_, event) => {
        await submit(event!.target);
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
                        aria-errormessage="nickname-error"
                        {...register('nickname')}
                    />
                    <InputError error={errors.nickname} id="nickname-error" />
                </div>
                {isJoining && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="roomId">Room ID</Label>
                            <Input
                                id="roomId"
                                readOnly={!!roomId}
                                aria-invalid={errors.roomId ? 'true' : 'false'}
                                aria-errormessage="roomId-error"
                                {...register('roomId')}
                            />
                        </div>
                        <InputError error={errors.roomId} id="roomId-error" />
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
