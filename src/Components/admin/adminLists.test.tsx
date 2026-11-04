
import React from "react";
import {
    fireEvent,
    render,
    screen,
    waitFor
} from "@testing-library/react";

import GetAllCompanies from "./getAllCompanies/getAllCompanies";
import GetAllCustomers from "./getAllCustomers/getAllCustomers";
import jwtAxios from "../../util/JWTaxios";
import globals from "../../util/global";
import { store } from "../../redux/store";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate
}));

jest.mock("../../redux/store", () => ({
    store: {
        getState: jest.fn()
    }
}));

jest.mock("../../util/JWTaxios", () => ({
    __esModule: true,
    default: {
        get: jest.fn()
    }
}));

jest.mock("../../util/notify_advanced", () => ({
    __esModule: true,
    default: {
        error: jest.fn()
    }
}));

jest.mock("../company/singleCompany/singleCompany", () => ({
    __esModule: true,
    default: ({ company }: { company: { name: string } }) => (
        <div data-testid="company-card">{company.name}</div>
    )
}));

jest.mock("../customer/singleCustomer/singleCustomer", () => ({
    __esModule: true,
    default: ({
        customer
    }: {
        customer: { first_name: string }
    }) => (
        <div data-testid="customer-card">{customer.first_name}</div>
    )
}));

const mockGet = jwtAxios.get as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReset();

    (store.getState as jest.Mock).mockReturnValue({
        authState: {
            userType: "ADMIN"
        }
    });
});

describe("Administrator company list", () => {
    test("loads company cards", async () => {
        mockGet.mockResolvedValue({
            data: [
                { id: 1, name: "Sony", email: "sony@example.com" }
            ]
        });

        render(<GetAllCompanies />);

        expect(
            screen.getByRole("status", {
                name: "טוען חברות"
            })
        ).toBeInTheDocument();

        expect(
            await screen.findByText("Sony")
        ).toBeInTheDocument();

        expect(mockGet).toHaveBeenCalledWith(
            globals.admin.getAllCompanies
        );
    });

    test("shows an error and retries manually", async () => {
        mockGet
            .mockRejectedValueOnce(new Error("Network error"))
            .mockResolvedValueOnce({
                data: [
                    { id: 2, name: "Updated Company" }
                ]
            });

        render(<GetAllCompanies />);

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent("לא הצלחנו לטעון");

        fireEvent.click(
            screen.getByRole("button", { name: "נסה שוב" })
        );

        expect(
            await screen.findByText("Updated Company")
        ).toBeInTheDocument();

        expect(mockGet).toHaveBeenCalledTimes(2);
    });

    test("shows an empty state", async () => {
        mockGet.mockResolvedValue({ data: [] });

        render(<GetAllCompanies />);

        expect(
            await screen.findByText(
                "אין חברות במערכת כרגע."
            )
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "הוסף חברה"
            })
        ).toBeInTheDocument();
    });
});

describe("Administrator customer list", () => {
    test("loads customer cards", async () => {
        mockGet.mockResolvedValue({
            data: [
                { id: 4, first_name: "Dana", last_name: "Cohen" }
            ]
        });

        render(<GetAllCustomers />);

        expect(
            await screen.findByText("Dana")
        ).toBeInTheDocument();

        expect(mockGet).toHaveBeenCalledWith(
            globals.admin.getAllCustomers
        );
    });

    test("shows an error and retries manually", async () => {
        mockGet
            .mockRejectedValueOnce(new Error("Network error"))
            .mockResolvedValueOnce({
                data: [
                    { id: 5, first_name: "Kobi" }
                ]
            });

        render(<GetAllCustomers />);

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent("לא הצלחנו לטעון");

        fireEvent.click(
            screen.getByRole("button", { name: "נסה שוב" })
        );

        expect(
            await screen.findByText("Kobi")
        ).toBeInTheDocument();

        expect(mockGet).toHaveBeenCalledTimes(2);
    });

    test("shows an empty state", async () => {
        mockGet.mockResolvedValue({ data: [] });

        render(<GetAllCustomers />);

        expect(
            await screen.findByText(
                "אין לקוחות במערכת כרגע."
            )
        ).toBeInTheDocument();
    });

    test("redirects users without administrator access", async () => {
        (store.getState as jest.Mock).mockReturnValue({
            authState: {
                userType: "CUSTOMER"
            }
        });

        render(<GetAllCustomers />);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/login");
        });

        expect(mockGet).not.toHaveBeenCalled();
    });
});
