
import React from "react";
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor
} from "@testing-library/react";

import AddCompany from "./addCompany/addCompany";
import AddCustomer from "./addCustomer/addCustomer";
import jwtAxios from "../../util/JWTaxios";
import notify from "../../util/notify";
import globals from "../../util/global";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate
}));

jest.mock("../../redux/store", () => ({
    store: {
        getState: () => ({
            authState: {
                userType: "ADMIN"
            }
        })
    }
}));

jest.mock("../../util/JWTaxios", () => ({
    __esModule: true,
    default: {
        post: jest.fn()
    }
}));

jest.mock("../../util/notify", () => ({
    __esModule: true,
    default: {
        success: jest.fn(),
        error: jest.fn()
    }
}));

jest.mock("../../util/notify_advanced", () => ({
    __esModule: true,
    default: {
        error: jest.fn()
    }
}));

const mockPost = jwtAxios.post as jest.Mock;

function fillField(label: string, value: string): void {
    fireEvent.change(
        screen.getByLabelText(label),
        { target: { value } }
    );
}

beforeEach(() => {
    jest.clearAllMocks();
    mockPost.mockReset();
});

describe("Admin creation forms", () => {
    test("prevents duplicate company creation requests", async () => {
        let resolveRequest!: (value: unknown) => void;

        mockPost.mockReturnValue(
            new Promise(resolve => {
                resolveRequest = resolve;
            })
        );

        render(<AddCompany />);

        fillField("שם חברה", "Example Company");
        fillField("אימייל", "company@example.com");
        fillField("סיסמה", "password123");

        const form = screen
            .getByRole("button", { name: "הוסף חברה" })
            .closest("form");

        expect(form).not.toBeNull();

        fireEvent.submit(form!);
        fireEvent.submit(form!);

        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledTimes(1);
        });

        expect(mockPost).toHaveBeenCalledWith(
            globals.admin.addCompany,
            {
                name: "Example Company",
                email: "company@example.com",
                password: "password123"
            }
        );

        expect(
            screen.getByRole("button", {
                name: /מוסיף חברה/
            })
        ).toBeDisabled();

        await act(async () => {
            resolveRequest({ data: "Company added" });
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(
                "/admin/getAllCompanies"
            );
        });

        expect(notify.success).toHaveBeenCalled();
    });

    test("does not submit an invalid company email", async () => {
        render(<AddCompany />);

        fillField("שם חברה", "Example Company");
        fillField("אימייל", "invalid-email");
        fillField("סיסמה", "password123");

        fireEvent.click(
            screen.getByRole("button", { name: "הוסף חברה" })
        );

        expect(
            await screen.findByText("כתובת אימייל לא תקינה.")
        ).toBeInTheDocument();

        expect(mockPost).not.toHaveBeenCalled();
    });

    test("creates a customer with clean profile data", async () => {
        mockPost.mockResolvedValue({
            data: "Customer added"
        });

        render(<AddCustomer />);

        fillField("שם פרטי", " Dana ");
        fillField("שם משפחה", " Cohen ");
        fillField("אימייל", "dana@example.com");
        fillField("סיסמה", "password123");

        fireEvent.click(
            screen.getByRole("button", { name: "הוסף לקוח" })
        );

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(
                "/admin/getAllCustomers"
            );
        });

        expect(mockPost).toHaveBeenCalledWith(
            globals.admin.addCustomer,
            {
                first_name: "Dana",
                last_name: "Cohen",
                email: "dana@example.com",
                password: "password123"
            }
        );

        expect(mockPost).toHaveBeenCalledTimes(1);
    });

    test("shows a duplicate email error without navigating", async () => {
        mockPost.mockRejectedValue({
            isAxiosError: true,
            response: {
                status: 400,
                data: {
                    error: "Customer error",
                    description: "There is already a user with this email"
                }
            }
        });

        render(<AddCustomer />);

        fillField("שם פרטי", "Dana");
        fillField("שם משפחה", "Cohen");
        fillField("אימייל", "dana@example.com");
        fillField("סיסמה", "password123");

        fireEvent.click(
            screen.getByRole("button", { name: "הוסף לקוח" })
        );

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent(
            "כתובת האימייל כבר קיימת במערכת."
        );

        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockPost).toHaveBeenCalledTimes(1);
    });
});
