import jwt_decode from 'jwt-decode';

export class authState {
    userName: string = "";
    userType: string = "";
    userToken: string = "";
    id: number = 0;
}

export enum authActionType {
    UserLogin = "UserLogin",
    UserLogout = "UserLogout",
    UpdateToken = "UpdateToken",
    LoadToken = "LoadToken",
    SetUserName = "SetUserName",
    SetUserId = "SetUserId"
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

export function setUserName(name: string): AuthAction {
    return { type: authActionType.SetUserName, payload: name };
}

export function setUserId(id: number): AuthAction {
    return { type: authActionType.SetUserId, payload: id };
}

export function authReducer(currentState: authState = new authState(), action: AuthAction): authState {
    const newState = { ...currentState };

    switch (action.type) {
        case authActionType.UserLogin:
        case authActionType.LoadToken:
            try {
                const token = action.payload.replace("Bearer ", "");
                const decoded: any = jwt_decode(token);
                
                // Changed to sessionStorage
                newState.userName = sessionStorage.getItem("userName") || "";
                
                newState.userType = decoded.userType;
                newState.userToken = action.payload;

                // Changed to sessionStorage
                const savedId = sessionStorage.getItem("userId");
                if (savedId) newState.id = +savedId;

                if (decoded.id) newState.id = decoded.id;
            } catch (e) {
                console.error("Token decode failed", e);
            }
            break;

        case authActionType.UserLogout:
            newState.userToken = "";
            newState.userName = "";
            newState.userType = "";
            newState.id = 0;
            // Changed to sessionStorage
            sessionStorage.removeItem("userId"); 
            sessionStorage.removeItem("userName"); 
            break;

        case authActionType.UpdateToken:
            newState.userToken = action.payload;
            break;

        case authActionType.SetUserName:
            newState.userName = action.payload;
            // Changed to sessionStorage
            sessionStorage.setItem("userName", action.payload); 
            break;

        case authActionType.SetUserId:
            newState.id = action.payload;
            // Changed to sessionStorage
            sessionStorage.setItem("userId", action.payload.toString()); 
            break;
    }
    return newState;
}