
import React from "react";
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor
} from "@testing-library/react";

import AddCoupon from "./addCoupon";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import notify from "../../../util/notify";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate
}));

jest.mock("../../../redux/store", () => ({
    store: {
        getState: () => ({
            authState: {
                userType: "COMPANY"
            }
        })
    }
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

jest.mock("../../../util/notify_advanced", () => ({
    __esModule: true,
    default: {
        error: jest.fn()
    }
}));

jest.mock("@mui/x-date-pickers", () => ({
    LocalizationProvider: ({
        children
    }: {
        children: React.ReactNode
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

beforeEach(() => {
    jest.clearAllMocks();
    mockPost.mockReset();
});

async function fillCoupon(): Promise<void> {
    fireEvent.mouseDown(screen.getByRole("combobox"));

    fireEvent.click(
        await screen.findByRole("option", {
            name: "אוכל"
        })
    );

    fireEvent.change(
        screen.getByLabelText("כותרת"),
        { target: { value: "Test coupon" } }
    );

    fireEvent.change(
        screen.getByLabelText("תיאור"),
        { target: { value: "Test description" } }
    );

    fireEvent.change(
        screen.getByLabelText("תאריך התחלה"),
        { target: { value: "2030-01-10" } }
    );

    fireEvent.change(
        screen.getByLabelText("תאריך סיום"),
        { target: { value: "2030-01-20" } }
    );

    fireEvent.change(
        screen.getByLabelText("כמות"),
        { target: { value: "10" } }
    );

    fireEvent.change(
        screen.getByLabelText("מחיר (₪)"),
        { target: { value: "150" } }
    );
}

describe("AddCoupon", () => {
    test("sends one POST while creation is pending", async () => {
        let resolveRequest!: (value: unknown) => void;

        mockPost.mockReturnValue(
            new Promise(resolve => {
                resolveRequest = resolve;
            })
        );

        render(<AddCoupon />);
        await fillCoupon();

        const form = screen
            .getByRole("button", { name: "שמור ופרסם" })
            .closest("form");

        expect(form).not.toBeNull();

        fireEvent.submit(form!);
        fireEvent.submit(form!);

        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledTimes(1);
        });

        expect(mockPost).toHaveBeenCalledWith(
            globals.company.addCoupon,
            expect.objectContaining({
                category: "FOOD",
                title: "Test coupon",
                description: "Test description",
                start_date: "2030-01-10",
                end_date: "2030-01-20",
                amount: 10,
                price: 150
            })
        );

        expect(
            screen.getByRole("button", {
                name: /שומר קופון/
            })
        ).toBeDisabled();

        await act(async () => {
            resolveRequest({ data: "Coupon added" });
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(
                "/company/allCoupons"
            );
        });

        expect(notify.success).toHaveBeenCalled();
    });

    test("requires a description before sending", async () => {
        render(<AddCoupon />);
        await fillCoupon();

        fireEvent.change(
            screen.getByLabelText("תיאור"),
            { target: { value: "" } }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "שמור ופרסם"
            })
        );

        expect(
            await screen.findByText("יש להזין תיאור.")
        ).toBeInTheDocument();

        expect(mockPost).not.toHaveBeenCalled();
    });
});
