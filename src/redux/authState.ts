import jwt_decode from 'jwt-decode';

export class authState {
    userName : string = "";
    userType : string = "";
    userToken : string = "";
}

export enum authActionType {
    UserLogin = "UserLogin",
    UserLogout = "UserLogout",
    UpdateToken = "UpdateToken",
    LoadToken = "LoadToken",  // English: Action to load token from storage
}

export interface AuthAction {
    type: authActionType,
    payload?: any;
}

export function userLogin(userToken: string): AuthAction {
    return {type: authActionType.UserLogin, payload: userToken};
}

export function userLogout(): AuthAction {
    return {type: authActionType.UserLogout};
}

export function updateToken(userToken: string): AuthAction {
    return {type: authActionType.UpdateToken, payload: userToken};
}

export function loadToken(userToken: string): AuthAction {
    return {type: authActionType.LoadToken, payload: userToken};
}

//reducer
export function authReducer(currentState: authState = new authState, action: AuthAction): authState {
    const newState = {...currentState};

    switch (action.type) {
        case authActionType.UserLogin:
        case authActionType.LoadToken:  // English: Handle load same as login
            var myToken = action.payload.replace("Bearer ","");
            var decoded = JSON.parse(JSON.stringify(jwt_decode(myToken)));
            newState.userName = decoded.sub;
            newState.userType = decoded.userType;
            newState.userToken = action.payload;
            break;

        case authActionType.UserLogout:
            newState.userToken = "";
            newState.userName = "";
            newState.userType = "";
            break;

        case authActionType.UpdateToken:
            newState.userToken = action.payload;
            break;
    }

    return newState;
}