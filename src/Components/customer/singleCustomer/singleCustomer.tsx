
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Card,
    CardContent,
    Typography,
    Box,
    IconButton,
    CardActions,
    Tooltip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { Customer } from "../../../modal/Customer";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import notify from "../../../util/notify";
import { store } from "../../../redux/store";

interface SingleCustomerProps {
    customer?: Customer;
    updateCustomer: () => void;
    onDelete?: (id: number) => void;
}

function SingleCustomer(props: SingleCustomerProps): JSX.Element {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const userType = store.getState().authState.userType;

    if (!props.customer) {
        return <div>No Data</div>;
    }

    const customer = props.customer;

    const removeCustomer = async () => {
        if (deleting || customer.id === undefined) return;

        setDeleting(true);

        try {
            await jwtAxios.delete(
                globals.admin.deleteCustomer + customer.id
            );

            notify.success("הלקוח נמחק");

            if (props.onDelete) {
                props.onDelete(customer.id);
            }

            setOpen(false);
        } catch (error: any) {
            notify.error(
                error.response?.data?.description ||
                "שגיאה במחיקה"
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Card
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                boxShadow: 3,
                borderRadius: 2
            }}
            dir="rtl"
        >
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                    variant="h6"
                    component="div"
                    gutterBottom
                    fontWeight="bold"
                    color="primary"
                >
                    {customer.first_name} {customer.last_name}
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {userType === "ADMIN" && (
                        <Typography color="text.secondary" variant="caption">
                            ID: {customer.id}
                        </Typography>
                    )}

                    <Typography variant="body2">
                        <b>אימייל:</b> {customer.email}
                    </Typography>
                </Box>
            </CardContent>

            <CardActions
                sx={{
                    p: 2,
                    pt: 0,
                    justifyContent: "space-between"
                }}
            >
                {userType === "ADMIN" && (
                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            gap: 1,
                            alignItems: "center"
                        }}
                    >
                        <Tooltip title="רשימת קופונים" arrow placement="top">
                            <IconButton
                                color="info"
                                onClick={() => navigate(
                                    "/customer/customerCoupons",
                                    {
                                        state: {
                                            customerId: customer.id
                                        }
                                    }
                                )}
                            >
                                <ListAltIcon />
                            </IconButton>
                        </Tooltip>

                        <Button
                            size="small"
                            variant="contained"
                            color="warning"
                            onClick={props.updateCustomer}
                            fullWidth
                            startIcon={<EditIcon />}
                        >
                            ערוך
                        </Button>

                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => setOpen(true)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                )}

                {userType === "CUSTOMER" && (
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={props.updateCustomer}
                    >
                        עדכון פרטים
                    </Button>
                )}
            </CardActions>

            <Dialog
                open={open}
                onClose={() => {
                    if (!deleting) setOpen(false);
                }}
                dir="rtl"
            >
                <DialogTitle>מחיקת לקוח</DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        למחוק את {customer.first_name}?
                    </DialogContentText>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => setOpen(false)}
                        disabled={deleting}
                    >
                        ביטול
                    </Button>

                    <Button
                        onClick={removeCustomer}
                        color="error"
                        disabled={deleting}
                    >
                        {deleting ? "מוחק..." : "מחק"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}

export default SingleCustomer;
