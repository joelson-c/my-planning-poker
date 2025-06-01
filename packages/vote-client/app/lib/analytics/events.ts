export function pushJoinRoomEvent(roomId: string) {
    window.dataLayer.push({
        event: 'join_group',
        group_id: roomId,
    });
}

export function pushVoteStartEvent(roomId: string) {
    window.dataLayer.push({
        event: 'level_start',
        level_name: roomId,
    });
}

export function pushVoteEndEvent(roomId: string) {
    window.dataLayer.push({
        event: 'level_end',
        level_name: roomId,
        success: true,
    });
}

export function pushVoteEvent(roomId: string, vote: string) {
    window.dataLayer.push({
        event: 'user_vote',
        level_name: roomId,
        vote,
    });
}

export function pushShareEvent(roomId: string) {
    window.dataLayer.push({
        event: 'level_share',
        level_name: roomId,
    });
}

export function pushUserRemoveEvent(roomId: string) {
    window.dataLayer.push({
        event: 'user_remove',
        level_name: roomId,
    });
}
