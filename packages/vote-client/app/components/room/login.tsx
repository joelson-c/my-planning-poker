import type { SubmitHandler } from 'react-hook-form';
import { Label } from '@radix-ui/react-label';
import { Form, useSubmit } from '@remix-run/react';
import { Controller, useForm } from 'react-hook-form';
import { superstructResolver } from '@hookform/resolvers/superstruct';
import { Button } from '~/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { RepositoryLink } from '../repository/link';
import { JoinedVotingUser } from '@planningpoker/domain-models/voting/user';
import { Switch } from '../ui/switch';

interface RoomLoginProps {
    roomId?: string;
}

interface FormValues {
    nickname: string;
    isObserver: boolean;
    roomId?: string;
}

export function RoomLogin({ roomId }: RoomLoginProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: superstructResolver(JoinedVotingUser),
        defaultValues: {
            isObserver: false,
        },
    });

    const submit = useSubmit();

    const onSubmit: SubmitHandler<FormValues> = ({
        nickname,
        isObserver,
        roomId,
    }) => {
        submit(
            { nickname, isObserver, roomId: roomId || null },
            { method: 'post' },
        );
    };

    return (
        <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                        {roomId ? `Join Planning Poker Room` : `Planning Poker`}
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter a nickname to join the session
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form method="post" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nickname">Nickname</Label>
                                <Input
                                    id="nickname"
                                    placeholder="Enter your nickname"
                                    aria-invalid={
                                        errors.nickname ? 'true' : 'false'
                                    }
                                    {...register('nickname')}
                                />
                                {errors.nickname && (
                                    <p
                                        className="text-sm text-red-500"
                                        role="alert"
                                    >
                                        The nickname must be between 2 and 32
                                        characters
                                    </p>
                                )}
                            </div>
                            {roomId && (
                                <div className="space-y-2">
                                    <Label htmlFor="roomid">Room ID</Label>
                                    <Input
                                        value={roomId}
                                        id="roomId"
                                        readOnly
                                        {...register('roomId')}
                                    />
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
                                            checked={value}
                                            onCheckedChange={onChange}
                                            onBlur={onBlur}
                                            ref={ref}
                                        />
                                    )}
                                />

                                <Label htmlFor="is-observer">
                                    Join as Observer
                                </Label>
                            </div>
                            <Button type="submit" className="w-full">
                                Join Session
                            </Button>
                        </div>
                    </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center space-y-4">
                    <div className="text-sm text-center text-muted-foreground">
                        This is an open-source project. Contribute or star us on
                        GitHub!
                    </div>
                    <RepositoryLink />
                </CardFooter>
            </Card>
        </div>
    );
}
