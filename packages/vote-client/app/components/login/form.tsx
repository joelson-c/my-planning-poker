import type { SubmitHandler } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { superstructResolver } from "@hookform/resolvers/superstruct";
import { VotingUser } from "@planningpoker/domain-models/voting/user";
import { Form, useSubmit } from "@remix-run/react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { pick } from "superstruct";

interface FormValues {
  nickname: string;
  isObserver: boolean;
  roomId?: string;
}

interface LoginFormProps {
  roomId?: string;
}

const userFormSchema = pick(VotingUser, ["nickname", "isObserver"]);

export function LoginForm({ roomId }: LoginFormProps) {
  const submit = useSubmit();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: superstructResolver(userFormSchema),
    defaultValues: {
      isObserver: false,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = ({ nickname, isObserver }) => {
    submit(
      { nickname, isObserver, roomId: roomId || null },
      { method: "post" }
    );
  };

  return (
    <Form method="post" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nickname">Nickname</Label>
          <Input
            id="nickname"
            placeholder="Enter your nickname"
            aria-invalid={errors.nickname ? "true" : "false"}
            {...register("nickname")}
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
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Switch
                id="is-observer"
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
          {roomId ? "Join Room" : "Create New Room"}
        </Button>
      </div>
    </Form>
  );
}
