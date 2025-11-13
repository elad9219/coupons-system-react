import "./login.css";
import { Button, ButtonGroup, TextField, Typography, Select, InputLabel, MenuItem, FormControl } from "@mui/material";
import { useForm } from "react-hook-form";
import { useState } from "react";
import notify from '../../../util/notify';
import globals from "../../../util/global";
import jwtAxios from '../../../util/JWTaxios';
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { userLogin } from "../../../redux/authState";
import { store } from "../../../redux/store";
import { downloadCompanies } from "../../../redux/companyState";
import { downloadCustomers } from "../../../redux/customerState";
import { downloadSingleCompany } from "../../../redux/companyState";
import { downloadSingleCustomer } from "../../../redux/customerState";
import { Company } from "../../../modal/Company";
import { Customer } from "../../../modal/Customer";

interface LoginForm {
  email: string;
  password: string;
}

function Login(): JSX.Element {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const [userType, setUserType] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changeHandler = (event: any) => {
    setUserType(event.target.value);
  };

  const send = (data: LoginForm) => {
    const credentials = { ...data, userType };
    jwtAxios.post(globals.urls.login, credentials)
      .then(response => {
        const token = response.headers.authorization;
        localStorage.setItem('token', token);
        dispatch(userLogin(token));
        notify.success("!ברוך הבא");

        // נווט מיידי לפי userType
        const currentUserType = store.getState().authState.userType;

        if (currentUserType === "ADMIN") {
          jwtAxios.get<Company[]>(globals.admin.getAllCompanies)
            .then(res => dispatch(downloadCompanies(res.data)))
            .catch(() => {});
          jwtAxios.get<Customer[]>(globals.admin.getAllCustomers)
            .then(res => dispatch(downloadCustomers(res.data)))
            .catch(() => {});
          navigate("/");
        }

        if (currentUserType === "COMPANY") {
          jwtAxios.get<Company>(globals.company.getCompanyDetails)
            .then(res => dispatch(downloadSingleCompany([res.data])))
            .catch(() => {});
          navigate("/company/allCoupons");
        }

        if (currentUserType === "CUSTOMER") {
          jwtAxios.get<Customer>(globals.customer.getCustomerDetails)
            .then(res => dispatch(downloadSingleCustomer([res.data])))
            .catch(() => {});
          navigate("/");
        }
      })
      .catch(err => {
        notify.error("שגיאה בכניסה");
        console.log(err);
      });
  };

  return (
    <div className="login SolidBox" dir="rtl">
      <Typography variant="h3" className="HeadLine">כניסת משתמש</Typography><hr /><br />
      <form onSubmit={handleSubmit(send)}>
        <TextField label="מייל" variant="outlined" fullWidth {...register("email", { required: "חובה להזין מייל" })} />
        {errors.email && <span style={{ color: 'red' }}>{errors.email.message}</span>}
        <br /><br />

        <TextField label="סיסמה" type="password" variant="outlined" fullWidth {...register("password", { required: "חובה להזין סיסמה" })} />
        {errors.password && <span style={{ color: 'red' }}>{errors.password.message}</span>}
        <br /><br />

        <FormControl fullWidth>
          <InputLabel>סוג משתמש</InputLabel>
          <Select value={userType} onChange={changeHandler} label="סוג משתמש">
            <MenuItem value="ADMIN">ADMIN</MenuItem>
            <MenuItem value="COMPANY">COMPANY</MenuItem>
            <MenuItem value="CUSTOMER">CUSTOMER</MenuItem>
          </Select>
        </FormControl>
        <br /><br />

        <ButtonGroup variant="contained" fullWidth>
          <Button type="submit" color="primary">כניסה למערכת</Button>
        </ButtonGroup>
      </form>
    </div>
  );
}

export default Login;