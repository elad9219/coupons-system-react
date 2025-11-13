import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Company } from "../../../modal/Company";
import { store } from "../../../redux/store";
import jwtAxios from "../../../util/JWTaxios";
import advNotify from "../../../util/notify_advanced";
import SingleCompany from "../singleCompany/singleCompany";
import "./getCompanyDetails.css";
import globals from '../../../util/global';
import { downloadSingleCompany } from "../../../redux/companyState";

function GetCompanyDetails(): JSX.Element {
    const navigate = useNavigate();
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);  // English: Added loading

    useEffect(() => {
        if (store.getState().authState.userType!="COMPANY") {
            advNotify.error("Please login...");
            navigate("/login");
            return;
        }

        setLoading(true);

        jwtAxios.get<Company>(globals.company.getCompanyDetails)
            .then((response) => {
                setCompany(response.data);
                store.dispatch(downloadSingleCompany([response.data]));
                setLoading(false);
            })
            .catch(err => {
                advNotify.error("Failed to load company details");
                console.log(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Loading...</div>;  // English: Loading screen
    }

    if (!company) {
        return <div>No company found</div>;
    }

    return (
        <div className="getCompanyDetails">
			<h1> פרטי חברה </h1> <hr />
            <SingleCompany company={company} updateCompany={() => {}} />
        </div>
    );
}

export default GetCompanyDetails;