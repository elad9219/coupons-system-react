
import React from "react";
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor
} from "@testing-library/react";

import Register from "./register";
import jwtAxios from "../../../util/JWTaxios";
import notify from "../../../util/notify";
import globals from "../../../util/global";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate
}));

jest.mock("../../../util/JWTaxios", () => ({
    __esModule: true,
    default: {
        post: jest.fn()
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
const mockSuccess = notify.success as jest.Mock;

function fillRegistration(): void {
    fireEvent.change(
        screen.getByLabelText("שם פרטי"),
        { target: { value: "Dana" } }
    );

    fireEvent.change(
        screen.getByLabelText("שם משפחה"),
        { target: { value: "Cohen" } }
    );

    fireEvent.change(
        screen.getByLabelText("אימייל"),
        { target: { value: "dana@example.com" } }
    );

    fireEvent.change(
        screen.getByLabelText("סיסמה"),
        { target: { value: "secure123" } }
    );
}

function submitRegistration(): void {
    fireEvent.click(
        screen.getByRole("button", {
            name: "הירשם"
        })
    );
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Register", () => {
    test("registers once and navigates to login", async () => {
        mockPost.mockResolvedValue({
            data: "Customer registered"
        });

        render(<Register />);

        fillRegistration();
        submitRegistration();

        await waitFor(() => {
            expect(mockNavigate)
                .toHaveBeenCalledWith("/login");
        });

        expect(mockPost).toHaveBeenCalledWith(
            globals.guest.register,
            {
                first_name: "Dana",
                last_name: "Cohen",
                email: "dana@example.com",
                password: "secure123"
            }
        );

        expect(mockSuccess).toHaveBeenCalled();
        expect(mockPost).toHaveBeenCalledTimes(1);
    });

    test("shows a readable duplicate-email error", async () => {
        mockPost.mockRejectedValue({
            isAxiosError: true,
            response: {
                status: 400,
                data: {
                    error: "Invalid request",
                    description: "Email already exists"
                }
            }
        });

        render(<Register />);

        fillRegistration();
        submitRegistration();

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent(
            "כתובת האימייל כבר רשומה במערכת."
        );

        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockPost).toHaveBeenCalledTimes(1);
    });

    test("prevents duplicate submissions while pending", async () => {
        let resolveRegistration!: (value: any) => void;

        const pendingRequest = new Promise<any>(resolve => {
            resolveRegistration = resolve;
        });

        mockPost.mockReturnValue(pendingRequest);

        render(<Register />);

        fillRegistration();

        const form = screen
            .getByRole("button", { name: "הירשם" })
            .closest("form");

        expect(form).not.toBeNull();

        fireEvent.submit(form!);
        fireEvent.submit(form!);

        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledTimes(1);
        });

        expect(
            screen.getByRole("button", {
                name: /נרשם/
            })
        ).toBeDisabled();

        await act(async () => {
            resolveRegistration({
                data: "Customer registered"
            });
        });

        await waitFor(() => {
            expect(mockNavigate)
                .toHaveBeenCalledWith("/login");
        });

        expect(mockPost).toHaveBeenCalledTimes(1);
    });
});
