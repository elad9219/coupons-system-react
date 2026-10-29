import React from "react";
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor
} from "@testing-library/react";

import Login from "./login";
import jwtAxios from "../../../util/JWTaxios";
import notify from "../../../util/notify";
import { authActionType } from "../../../redux/authState";
import { CompanyActionTypes } from "../../../redux/companyState";
import { CustomerActionTypes } from "../../../redux/customerState";

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate
}));

jest.mock("react-redux", () => ({
    useDispatch: () => mockDispatch
}));

jest.mock("../../../util/JWTaxios", () => ({
    __esModule: true,
    default: {
        post: jest.fn(),
        get: jest.fn()
    }
}));

jest.mock("../../../util/notify", () => ({
    __esModule: true,
    default: {
        success: jest.fn(),
        error: jest.fn()
    }
}));

const mockPost = jwtAxios.post as jest.Mock;
const mockGet = jwtAxios.get as jest.Mock;
const mockSuccess = notify.success as jest.Mock;

function createToken(role: string): string {
    const payload = {
        userType: role,
        exp: Math.floor(Date.now() / 1000) + 3600
    };

    const encodedPayload = btoa(JSON.stringify(payload))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    return `Bearer header.${encodedPayload}.signature`;
}

function fillCredentials(
    email = "kobi@gmail.com",
    password = "1234"
): void {
    fireEvent.change(screen.getByLabelText("מייל"), {
        target: { value: email }
    });

    fireEvent.change(screen.getByLabelText("סיסמה"), {
        target: { value: password }
    });
}

function submitLogin(): void {
    fireEvent.click(
        screen.getByRole("button", { name: "התחבר" })
    );
}

beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
});

describe("Login", () => {
    test("logs in as administrator without requesting a profile", async () => {
        const token = createToken("ADMIN");

        mockPost.mockResolvedValue({
            headers: { authorization: token }
        });

        render(<Login />);

        fireEvent.click(
            screen.getByRole("button", { name: "אדמין" })
        );

        submitLogin();

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/");
        });

        expect(mockPost).toHaveBeenCalledWith(
            expect.stringContaining("/api/login"),
            {
                email: "admin@admin.com",
                password: "admin",
                userType: "ADMIN"
            }
        );

        expect(mockGet).not.toHaveBeenCalled();
        expect(sessionStorage.getItem("token")).toBe(token);

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: authActionType.UserLogin,
                payload: token
            })
        );
    });

    test("loads the company profile before completing login", async () => {
        const token = createToken("COMPANY");

        mockPost.mockResolvedValue({
            headers: { authorization: token }
        });

        mockGet.mockResolvedValue({
            data: {
                id: 15,
                name: "Sony",
                email: "sony@contact.com"
            }
        });

        render(<Login />);

        fireEvent.click(
            screen.getByRole("button", { name: "חברה" })
        );

        submitLogin();

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(
                "/company/allCoupons"
            );
        });

        expect(mockGet).toHaveBeenCalledWith(
            expect.stringContaining("/api/company/companyDetails")
        );

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: CompanyActionTypes.DOWNLOAD_SINGLE_COMPANY,
                payload: [
                    expect.objectContaining({
                        id: 15,
                        name: "Sony"
                    })
                ]
            })
        );

        expect(mockSuccess).toHaveBeenCalled();
    });

    test("loads the customer profile before completing login", async () => {
        const token = createToken("CUSTOMER");

        mockPost.mockResolvedValue({
            headers: { authorization: token }
        });

        mockGet.mockResolvedValue({
            data: {
                id: 21,
                first_name: "Kobi",
                last_name: "Shasha",
                email: "kobi@gmail.com"
            }
        });

        render(<Login />);

        // The demo button fills the required email and password fields.
        fireEvent.click(
            screen.getByRole("button", { name: "לקוח" })
        );

        submitLogin();

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/");
        });

        expect(mockPost).toHaveBeenCalledWith(
            expect.stringContaining("/api/login"),
            {
                email: "kobi@gmail.com",
                password: "1234",
                userType: "CUSTOMER"
            }
        );

        expect(mockGet).toHaveBeenCalledWith(
            expect.stringContaining("/api/customer/customerDetails")
        );

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: CustomerActionTypes.DOWNLOAD_SINGLE_CUSTOMER,
                payload: [
                    expect.objectContaining({
                        id: 21,
                        first_name: "Kobi"
                    })
                ]
            })
        );
    });

    test("shows an appropriate error for invalid credentials", async () => {
        mockPost.mockRejectedValue({
            isAxiosError: true,
            response: { status: 400 }
        });

        render(<Login />);

        fillCredentials();
        submitLogin();

        expect(
            await screen.findByText(
                "האימייל, הסיסמה או סוג המשתמש שגויים."
            )
        ).toBeInTheDocument();

        expect(mockGet).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(sessionStorage.getItem("token")).toBeNull();
    });

    test("shows a server availability error without retrying POST", async () => {
        mockPost.mockRejectedValue({
            isAxiosError: true,
            response: { status: 503 }
        });

        render(<Login />);

        fillCredentials();
        submitLogin();

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent("לא ניתן להתחבר לשרת כרגע");

        expect(mockPost).toHaveBeenCalledTimes(1);
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("rejects a login response without an authorization token", async () => {
        mockPost.mockResolvedValue({
            headers: {}
        });

        render(<Login />);

        fillCredentials();
        submitLogin();

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent("טוקן התחברות לא תקין");

        expect(sessionStorage.getItem("token")).toBeNull();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("rejects a token for a different user role", async () => {
        mockPost.mockResolvedValue({
            headers: {
                authorization: createToken("ADMIN")
            }
        });

        render(<Login />);

        fillCredentials();
        submitLogin();

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent("טוקן התחברות לא תקין");

        expect(mockGet).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("restores the previous session when profile loading fails", async () => {
        const previousToken = createToken("ADMIN");
        const newToken = createToken("COMPANY");

        sessionStorage.setItem("token", previousToken);

        mockPost.mockResolvedValue({
            headers: { authorization: newToken }
        });

        mockGet.mockRejectedValue(
            new Error("Network error")
        );

        render(<Login />);

        fireEvent.click(
            screen.getByRole("button", { name: "חברה" })
        );

        submitLogin();

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent("לא הצלחנו לטעון את פרטי החשבון");

        expect(sessionStorage.getItem("token")).toBe(previousToken);
        expect(mockNavigate).not.toHaveBeenCalled();

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: authActionType.UpdateToken,
                payload: previousToken
            })
        );

        expect(mockDispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({
                type: authActionType.UserLogin
            })
        );
    });

    test("prevents duplicate submissions while login is pending", async () => {
        let resolveLogin!: (response: any) => void;

        const pendingLogin = new Promise<any>(resolve => {
            resolveLogin = resolve;
        });

        mockPost.mockReturnValue(pendingLogin);

        mockGet.mockResolvedValue({
            data: {
                id: 21,
                first_name: "Kobi"
            }
        });

        render(<Login />);

        fillCredentials();

        const form = screen
            .getByRole("button", { name: "התחבר" })
            .closest("form");

        expect(form).not.toBeNull();

        fireEvent.submit(form!);
        fireEvent.submit(form!);

        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledTimes(1);
        });

        expect(
            screen.getByRole("button", { name: /מתחבר/ })
        ).toBeDisabled();

        await act(async () => {
            resolveLogin({
                headers: {
                    authorization: createToken("CUSTOMER")
                }
            });
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/");
        });

        expect(mockPost).toHaveBeenCalledTimes(1);
        expect(mockGet).toHaveBeenCalledTimes(1);
    });
});