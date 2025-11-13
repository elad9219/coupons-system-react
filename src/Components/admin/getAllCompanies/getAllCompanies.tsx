import { useEffect } from "react";
import { store } from "../../../redux/store";
import { useSelector } from "react-redux";
import { addCompany, downloadCompanies } from '../../../redux/companyState';
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import notify from "../../../util/notify";
import { Company } from "../../../modal/Company";
import SingleCompany from "../../company/singleCompany/singleCompany";

function GetAllCompanies(): JSX.Element {
    const companies = useSelector((state: any) => state.companyState.company);

    useEffect(() => {
        if (companies.length === 0) {
            jwtAxios.get<Company[]>(globals.admin.getAllCompanies)
                .then(response => {
                    store.dispatch(downloadCompanies(response.data));
                })
                .catch(err => {
                    notify.error("שגיאה בטעינת חברות");
                });
        }
    }, [companies]);

    return (
        <div dir="rtl">
            <h2>כל החברות</h2>
            {companies.map((company: Company) => (
                <SingleCompany 
                    key={company.id} 
                    company={company} 
                    updateCompany={() => {}} 
                />
            ))}
        </div>
    );
}

export default GetAllCompanies;