
import React from "react";
import {
    fireEvent,
    render,
    screen,
    waitFor
} from "@testing-library/react";

import AllCoupons from "./allCoupons";
import { Coupon } from "../../../modal/Coupon";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";

const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector: (state: any) => unknown) =>
        selector({
            authState: { userType: "" }
        })
}));

jest.mock("../../../util/JWTaxios", () => ({
    __esModule: true,
    default: {
        get: jest.fn()
    }
}));

jest.mock("../../company/singleCoupon/singleCoupon", () => ({
    __esModule: true,
    default: ({ coupon }: { coupon: Coupon }) => (
        <div data-testid="coupon-card">
            {coupon.title}
        </div>
    )
}));

const mockGet = jwtAxios.get as jest.Mock;

const firstCoupon: Coupon = {
    id: 20,
    companyId: 1,
    category: "FOOD",
    title: "First coupon",
    start_date: "2026-01-01",
    end_date: "2027-01-01",
    amount: 10,
    price: 100
};

const secondCoupon: Coupon = {
    ...firstCoupon,
    id: 19,
    title: "Second coupon",
    price: 200
};

function catalogResponse(
    content: Coupon[],
    page: number,
    totalElements: number,
    totalPages: number
) {
    return {
        data: {
            content,
            page,
            size: 12,
            totalElements,
            totalPages,
            last: page === totalPages - 1
        }
    };
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe("AllCoupons server-side catalog", () => {
    test("loads only the requested page", async () => {
        mockGet.mockResolvedValue(
            catalogResponse([firstCoupon], 0, 1, 1)
        );

        render(<AllCoupons />);

        expect(
            await screen.findByText("First coupon")
        ).toBeInTheDocument();

        expect(mockGet).toHaveBeenCalledWith(
            globals.guest.catalog,
            {
                params: {
                    page: 0,
                    size: 12,
                    category: undefined,
                    maxPrice: 10000,
                    sort: "newest"
                }
            }
        );

        expect(
            screen.getAllByTestId("coupon-card")
        ).toHaveLength(1);
    });

    test("requests another page from the backend", async () => {
        mockGet.mockImplementation(
            (_url: string, config: any) => {
                const requestedPage = config.params.page;

                return Promise.resolve(
                    requestedPage === 0
                        ? catalogResponse(
                            [firstCoupon], 0, 24, 2
                        )
                        : catalogResponse(
                            [secondCoupon], 1, 24, 2
                        )
                );
            }
        );

        render(<AllCoupons />);

        expect(
            await screen.findByText("First coupon")
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Go to page 2"
            })
        );

        expect(
            await screen.findByText("Second coupon")
        ).toBeInTheDocument();

        expect(
            screen.queryByText("First coupon")
        ).not.toBeInTheDocument();

        expect(mockGet).toHaveBeenLastCalledWith(
            globals.guest.catalog,
            expect.objectContaining({
                params: expect.objectContaining({
                    page: 1,
                    size: 12
                })
            })
        );
    });

    test("shows an error and supports a manual retry", async () => {
        mockGet
            .mockRejectedValueOnce(new Error("Network error"))
            .mockResolvedValueOnce(
                catalogResponse([firstCoupon], 0, 1, 1)
            );

        render(<AllCoupons />);

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent("לא הצלחנו לטעון");

        fireEvent.click(
            screen.getByRole("button", {
                name: "נסה שוב"
            })
        );

        expect(
            await screen.findByText("First coupon")
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(mockGet).toHaveBeenCalledTimes(2);
        });
    });

    test("shows an empty state for no matches", async () => {
        mockGet.mockResolvedValue(
            catalogResponse([], 0, 0, 0)
        );

        render(<AllCoupons />);

        expect(
            await screen.findByText(
                "לא נמצאו קופונים התואמים את הסינון."
            )
        ).toBeInTheDocument();

        expect(
            screen.queryAllByTestId("coupon-card")
        ).toHaveLength(0);
    });
});
