import React from "react";
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor
} from "@testing-library/react";

import SingleCoupon from "./singleCoupon";
import { Coupon } from "../../../modal/Coupon";
import { CustomerActionTypes } from "../../../redux/customerState";
import jwtAxios from "../../../util/JWTaxios";
import notify from "../../../util/notify";

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();

let mockUserType = "CUSTOMER";
let mockCustomerCoupons: Coupon[] = [];

jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate
}));

jest.mock("react-redux", () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector: (state: any) => unknown) =>
        selector({
            authState: {
                userType: mockUserType,
                id: 21
            },
            customerState: {
                customer: [
                    {
                        id: 21,
                        coupons: mockCustomerCoupons
                    }
                ]
            }
        })
}));

jest.mock("../../../util/JWTaxios", () => ({
    __esModule: true,
    default: {
        post: jest.fn(),
        delete: jest.fn()
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
const mockError = notify.error as jest.Mock;

const coupon: Coupon = {
    id: 10,
    companyId: 5,
    category: "FOOD",
    title: "Demo Coupon",
    description: "Test coupon",
    start_date: "2020-01-01",
    end_date: "2099-12-31",
    amount: 5,
    price: 100,
    image: "https://example.com/coupon.png"
};

beforeEach(() => {
    jest.clearAllMocks();
    mockUserType = "CUSTOMER";
    mockCustomerCoupons = [];
});

describe("SingleCoupon purchase safety", () => {
    test("submits only one POST while a purchase is pending", async () => {
        let resolvePurchase!: (value: any) => void;

        mockPost.mockReturnValue(
            new Promise(resolve => {
                resolvePurchase = resolve;
            })
        );

        render(<SingleCoupon coupon={coupon} />);

        fireEvent.click(
            screen.getByRole("button", { name: "רכישה" })
        );

        const confirmButton = screen.getByRole(
            "button",
            { name: "אישור ורכישה" }
        );

        fireEvent.click(confirmButton);
        fireEvent.click(confirmButton);

        expect(mockPost).toHaveBeenCalledTimes(1);

        expect(
            screen.getByRole("button", { name: /מבצע רכישה/ })
        ).toBeDisabled();

        await act(async () => {
            resolvePurchase({ data: "Coupon purchased." });
        });

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: CustomerActionTypes.PURCHASE_COUPON,
                payload: coupon
            })
        );

        expect(mockSuccess).toHaveBeenCalledWith(
            "נרכש בהצלחה!"
        );

        expect(mockPost).toHaveBeenCalledTimes(1);
    });

    test("does not purchase a coupon already owned by the customer", () => {
        mockCustomerCoupons = [coupon];

        render(<SingleCoupon coupon={coupon} />);

        expect(
            screen.getByRole("button", { name: "נרכש" })
        ).toBeDisabled();

        expect(mockPost).not.toHaveBeenCalled();
    });

    test("shows an error and permits a manual retry", async () => {
        mockPost
            .mockRejectedValueOnce(new Error("Server error"))
            .mockResolvedValueOnce({
                data: "Coupon purchased."
            });

        render(<SingleCoupon coupon={coupon} />);

        fireEvent.click(
            screen.getByRole("button", { name: "רכישה" })
        );

        fireEvent.click(
            screen.getByRole("button", { name: "אישור ורכישה" })
        );

        await waitFor(() => {
            expect(mockError).toHaveBeenCalledWith(
                "שגיאה ברכישת הקופון"
            );
        });

        expect(mockPost).toHaveBeenCalledTimes(1);

        fireEvent.click(
            screen.getByRole("button", { name: "אישור ורכישה" })
        );

        await waitFor(() => {
            expect(mockSuccess).toHaveBeenCalledWith(
                "נרכש בהצלחה!"
            );
        });

        expect(mockPost).toHaveBeenCalledTimes(2);
    });

    test("redirects guests to login instead of purchasing", () => {
        mockUserType = "";

        render(<SingleCoupon coupon={coupon} />);

        fireEvent.click(
            screen.getByRole("button", { name: "רכישה" })
        );

        expect(mockNavigate).toHaveBeenCalledWith("/login");
        expect(mockPost).not.toHaveBeenCalled();
    });

    test("blocks purchase before the coupon start date", () => {
        render(
            <SingleCoupon
                coupon={{
                    ...coupon,
                    start_date: "2099-01-01"
                }}
            />
        );

        expect(
            screen.getByRole("button", { name: "טרם התחיל" })
        ).toBeDisabled();

        expect(mockPost).not.toHaveBeenCalled();
    });
});