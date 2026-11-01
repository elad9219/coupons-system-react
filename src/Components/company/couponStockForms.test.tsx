
import React from "react";
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor
} from "@testing-library/react";

import AddCoupon from "./addCoupon/addCoupon";
import UpdateCoupon from "./updateCoupon/updateCoupon";
import jwtAxios from "../../util/JWTaxios";
import globals from "../../util/global";
import { Coupon } from "../../modal/Coupon";

const mockNavigate = jest.fn();

const mockCoupon: Coupon = {
    id: 15,
    companyId: 2,
    category: "FOOD",
    title: "Test coupon",
    description: "Test description",
    start_date: "2030-01-01",
    end_date: "2030-01-31",
    amount: 5,
    price: 100
};

const mockLocationState = {
    coupon: mockCoupon
};

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
    useLocation: () => ({
        state: mockLocationState,
        pathname: "/company/updateCoupon"
    })
}));

jest.mock("../../redux/store", () => ({
    store: {
        getState: () => ({
            authState: {
                userType: "COMPANY"
            }
        })
    }
}));

jest.mock("../../util/JWTaxios", () => ({
    __esModule: true,
    default: {
        post: jest.fn(),
        put: jest.fn()
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

jest.mock("@mui/x-date-pickers", () => ({
    LocalizationProvider: ({
        children
    }: {
        children: React.ReactNode;
    }) => <>{children}</>,

    DatePicker: ({
        label,
        onChange,
        disabled
    }: {
        label: string;
        onChange: (date: Date | null) => void;
        disabled?: boolean;
    }) => (
        <input
            aria-label={label}
            type="date"
            disabled={disabled}
            onChange={event => {
                const value = event.target.value;

                onChange(
                    value
                        ? new Date(`${value}T12:00:00`)
                        : null
                );
            }}
        />
    )
}));

const mockPost = jwtAxios.post as jest.Mock;
const mockPut = jwtAxios.put as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();
    mockPost.mockReset();
    mockPut.mockReset();
});

describe("Coupon stock controls", () => {
    test("shows an inline error for excessive stock on creation", async () => {
        render(<AddCoupon />);

        fireEvent.change(
            screen.getByRole("spinbutton", {
                name: /כמות/
            }),
            { target: { value: "9999999999999" } }
        );

        expect(
            await screen.findByText(
                "הכמות המקסימלית היא 100,000 קופונים."
            )
        ).toBeInTheDocument();

        expect(mockPost).not.toHaveBeenCalled();
    });

    test("blocks invalid stock on update", async () => {
        render(<UpdateCoupon />);

        const amountField = await screen.findByRole(
            "spinbutton",
            { name: /כמות/ }
        );

        fireEvent.change(amountField, {
            target: { value: "100001" }
        });

        expect(
            await screen.findByText(
                "הכמות המקסימלית היא 100,000 קופונים."
            )
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", {
                name: "שמור שינויים"
            })
        );

        expect(mockPut).not.toHaveBeenCalled();
    });

    test("allows only one update while saving", async () => {
        let resolveUpdate!: (value: unknown) => void;

        mockPut.mockReturnValue(
            new Promise(resolve => {
                resolveUpdate = resolve;
            })
        );

        render(<UpdateCoupon />);

        const amountField = await screen.findByRole(
            "spinbutton",
            { name: /כמות/ }
        );

        fireEvent.change(amountField, {
            target: { value: "12" }
        });

        const form = screen
            .getByRole("button", { name: "שמור שינויים" })
            .closest("form");

        expect(form).not.toBeNull();

        fireEvent.submit(form!);
        fireEvent.submit(form!);

        expect(mockPut).toHaveBeenCalledTimes(1);

        expect(mockPut).toHaveBeenCalledWith(
            globals.company.updateCoupon,
            expect.objectContaining({
                id: 15,
                amount: 12,
                price: 100
            })
        );

        expect(
            screen.getByRole("button", {
                name: /שומר שינויים/
            })
        ).toBeDisabled();

        await act(async () => {
            resolveUpdate({ data: "Coupon updated" });
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(
                "/company/allCoupons"
            );
        });
    });
});
