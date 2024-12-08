import type { CardTypes, RoomState } from '@planningpoker/domain-models';

export interface LocalVotingState {
    cardVariant: CardTypes;
    roomState: RoomState;
}

type SetCardVariant = {
    type: 'SET_CARD_VARIANT';
    payload: {
        variant: CardTypes;
    };
};

type SetRoomState = {
    type: 'SET_ROOM_STATE';
    payload: {
        state: RoomState;
    };
};

export type VotingStateActions = SetCardVariant | SetRoomState;

export function votingStateReducer(
    state: LocalVotingState,
    action: VotingStateActions,
) {
    switch (action.type) {
        case 'SET_CARD_VARIANT':
            return {
                ...state,
                cardVariant: action.payload.variant,
            };
        case 'SET_ROOM_STATE':
            return {
                ...state,
                state: action.payload.state,
            };
        default:
            return state;
    }
}
