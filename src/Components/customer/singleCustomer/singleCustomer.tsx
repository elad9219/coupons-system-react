import { Customer } from "../../../modal/Customer";
import jwtAxios from "../../../util/JWTaxios";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Card, CardContent, Typography, Box, IconButton, InputAdornment, TextField, CardActions, Tooltip } from "@mui/material";
import globals from "../../../util/global";
import notify from '../../../util/notify';
import { store } from "../../../redux/store";
import { useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ListAltIcon from '@mui/icons-material/ListAlt';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from "react-router-dom";

interface SingleCustomerProps {
    customer?: Customer;
    updateCustomer: () => void;
    onDelete?: (id: number) => void;
}

function SingleCustomer(props: SingleCustomerProps): JSX.Element {
    const [open, setOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const userType = store.getState().authState.userType;
    const navigate = useNavigate();

    if (!props.customer) return <div>No Data</div>;

    const removeCustomer = () => {
        if (!props.customer) return;
        jwtAxios.delete(globals.admin.deleteCustomer + props.customer.id)
            .then(() => {
                notify.success("הלקוח נמחק");
                if (props.onDelete) props.onDelete(props.customer!.id);
            })
            .catch(() => notify.error("שגיאה במחיקה"));
    };

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3, borderRadius: 2 }} dir="rtl">
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="div" gutterBottom fontWeight="bold" color="primary">
                    {props.customer.first_name} {props.customer.last_name}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {userType === "ADMIN" && (
                        <Typography color="text.secondary" variant="caption">ID: {props.customer.id}</Typography>
                    )}
                    <Typography variant="body2"><b>אימייל:</b> {props.customer.email}</Typography>

                    <Box display="flex" alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 1 }}>סיסמה:</Typography>
                        <TextField
                            variant="standard"
                            type={showPassword ? 'text' : 'password'}
                            value={props.customer.password}
                            InputProps={{
                                disableUnderline: true,
                                readOnly: true,
                                style: { fontSize: '0.875rem' },
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                </Box>
            </CardContent>

            <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                {userType === "ADMIN" && (
                    <Box sx={{ width: '100%', display: 'flex', gap: 1, alignItems: 'center' }}>
                        {/* Tooltip added: Shows "רשימת קופונים" only on hover */}
                        <Tooltip title="רשימת קופונים" arrow placement="top">
                            <IconButton 
                                color="info" 
                                onClick={() => navigate("/customer/customerCoupons", { state: { customerId: props.customer?.id } })}
                            >
                                <ListAltIcon />
                            </IconButton>
                        </Tooltip>

                        <Button size="small" variant="contained" color="warning" onClick={props.updateCustomer} fullWidth startIcon={<EditIcon/>}>
                            ערוך
                        </Button>
                        
                        <IconButton size="small" color="error" onClick={() => setOpen(true)}>
                            <DeleteIcon/>
                        </IconButton>
                    </Box>
                )}
                {userType === "CUSTOMER" && (
                    <Button variant="outlined" fullWidth onClick={props.updateCustomer}>עדכון פרטים</Button>
                )}
            </CardActions>

            <Dialog open={open} onClose={() => setOpen(false)} dir="rtl">
                <DialogTitle>מחיקת לקוח</DialogTitle>
                <DialogContent><DialogContentText>למחוק את {props.customer.first_name}?</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>ביטול</Button>
                    <Button onClick={() => { removeCustomer(); setOpen(false); }} color="error">מחק</Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}

export default SingleCustomer;