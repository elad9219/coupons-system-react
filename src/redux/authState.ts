import jwt_decode from 'jwt-decode';

export class authState {
    userName: string = ""; // Change: Store actual name
    userType: string = "";
    userToken: string = "";
}

export enum authActionType {
    UserLogin = "UserLogin",
    UserLogout = "UserLogout",
    UpdateToken = "UpdateToken",
    LoadToken = "LoadToken",
    SetUserName = "SetUserName" // New action
}

export interface AuthAction {
    type: authActionType,
    payload?: any;
}

export function userLogin(userToken: string): AuthAction {
    return { type: authActionType.UserLogin, payload: userToken };
}

export function userLogout(): AuthAction {
    return { type: authActionType.UserLogout };
}

export function updateToken(userToken: string): AuthAction {
    return { type: authActionType.UpdateToken, payload: userToken };
}

export function loadToken(userToken: string): AuthAction {
    return { type: authActionType.LoadToken, payload: userToken };
}

// New function to set the real name
export function setUserName(name: string): AuthAction {
    return { type: authActionType.SetUserName, payload: name };
}

// reducer
export function authReducer(currentState: authState = new authState, action: AuthAction): authState {
    const newState = { ...currentState };

    switch (action.type) {
        case authActionType.UserLogin:
        case authActionType.LoadToken:
            try {
                var myToken = action.payload.replace("Bearer ", "");
                var decoded: any = jwt_decode(myToken);
                newState.userName = decoded.sub; // Default to email/sub initially
                newState.userType = decoded.userType;
                newState.userToken = action.payload;
            } catch (e) {
                console.error("Token decode failed", e);
            }
            break;

        case authActionType.UserLogout:
            newState.userToken = "";
            newState.userName = "";
            newState.userType = "";
            break;

        case authActionType.UpdateToken:
            newState.userToken = action.payload;
            break;

        case authActionType.SetUserName: // Handle name update
            newState.userName = action.payload;
            break;
    }

    return newState;
}