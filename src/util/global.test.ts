
import globals from "./global";

describe("Development API route compatibility", () => {
    test("company profile URL matches the backend mapping", () => {
        expect(globals.company.getCompanyDetails).toMatch(
            /\/api\/company\/companyDetails$/
        );
    });

    test("admin company update URL matches the backend mapping", () => {
        expect(globals.admin.updateCompany).toMatch(
            /\/api\/admin\/updateCompany$/
        );
    });

    test("customer profile URL remains unchanged", () => {
        expect(globals.customer.getCustomerDetails).toMatch(
            /\/api\/customer\/customerDetails$/
        );
    });
});
