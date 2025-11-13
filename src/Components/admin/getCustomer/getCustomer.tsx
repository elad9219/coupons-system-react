import { Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Customer } from "../../../modal/Customer";
import { getSingleCustomer } from "../../../redux/customerState";
import { store } from "../../../redux/store";
import globals from "../../../util/global";
import jwtAxios from "../../../util/JWTaxios";
import notify from "../../../util/notify";
import advNotify from "../../../util/notify_advanced";
import SingleCustomer from "../../customer/singleCustomer/singleCustomer";
import "./getCustomer.css";


interface SingleCustomerProps {
    customer? : Customer;
}


function GetCustomer(props: SingleCustomerProps): JSX.Element {
    const navigate = useNavigate();
    const [getCustomer, setGetCustomer] = useState(false);
    const [customer, setCustomer] = useState(new Customer());
    const [customerId, setCustomerId] = useState(0);


    useEffect(() => {
        if (store.getState().authState.userType!="ADMIN") {
            advNotify.error("Please login...");
            navigate("/login");
        }
    },[]);


    const findCustomer = () => {
        jwtAxios.get(globals.admin.getOneCustomer + customerId)
            .then((response) => {
                setCustomer(response.data);
                setGetCustomer(true);
            })
            .catch((err) => {
                console.error(err);
                notify.error("לקוח לא נמצא");
                console.error(err.data);
            });
    };

    const updateCustomer = () => {
        navigate("/admin/updateCustomer", { state: { customerId: customer.id } });
    };

    return (
        <div className="getCustomer">
			<h1>קבלת לקוח לפי id </h1> <hr />
            <div className="SolidBox">
            <TextField type={"number"} name="customerId" label="id" fullWidth
            value={customerId}
            onChange={(event) => setCustomerId(event.target.value as unknown as number)}/>
            <br /><br />
            <Button variant="contained" fullWidth color="primary" onClick={findCustomer}>מצא לקוח</Button>
            <br /><br />
            {getCustomer ? (
                <SingleCustomer customer={customer} updateCustomer={updateCustomer} />
            ) : (
                ""
            )}
            </div>
        </div>
    );
}

export default GetCustomer;
