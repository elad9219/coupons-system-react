
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Tooltip,
    Typography
} from "@mui/material";

import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ListAltRoundedIcon from "@mui/icons-material/ListAltRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";

import { Customer } from "../../../modal/Customer";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import notify from "../../../util/notify";
import { getApiErrorMessage } from "../../../util/apiError";
import { store } from "../../../redux/store";

interface SingleCustomerProps {
    customer?: Customer;
    updateCustomer: () => void;
    onDelete?: (id: number) => void;
}

function SingleCustomer({
    customer,
    updateCustomer,
    onDelete
}: SingleCustomerProps): JSX.Element {
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const userType = store.getState().authState.userType;

    if (!customer) {
        return <Box />;
    }

    const fullName = [
        customer.first_name,
        customer.last_name
    ].filter(Boolean).join(" ");

    const removeCustomer = async (): Promise<void> => {
        if (deleting || customer.id === undefined) {
            return;
        }

        setDeleting(true);

        try {
            await jwtAxios.delete(
                globals.admin.deleteCustomer + customer.id
            );

            notify.success("הלקוח נמחק בהצלחה");
            onDelete?.(customer.id);
            setOpen(false);
        } catch (error) {
            notify.error(
                getApiErrorMessage(
                    error,
                    "לא הצלחנו למחוק את הלקוח."
                )
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Card
            dir="rtl"
            elevation={0}
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "0 5px 22px rgba(20,38,61,0.045)",
                transition: "box-shadow 0.2s, transform 0.2s",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 30px rgba(20,38,61,0.09)"
                }
            }}
        >
            <CardContent
                sx={{
                    p: 2.5,
                    pb: 2,
                    flexGrow: 1
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.5,
                        mb: 2.5
                    }}
                >
                    <Avatar
                        sx={{
                            width: 46,
                            height: 46,
                            bgcolor: "#E7F8F5",
                            color: "secondary.dark",
                            borderRadius: 2.5
                        }}
                    >
                        <PersonOutlineRoundedIcon />
                    </Avatar>

                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontSize: "1.05rem",
                                fontWeight: 800,
                                color: "text.primary",
                                lineHeight: 1.35,
                                overflowWrap: "anywhere"
                            }}
                        >
                            {fullName}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            חשבון לקוח
                        </Typography>
                    </Box>

                    {userType === "ADMIN" && (
                        <Chip
                            size="small"
                            label={`#${customer.id}`}
                            sx={{
                                flexShrink: 0,
                                color: "text.secondary",
                                bgcolor: "#F2F5FA",
                                fontWeight: 700
                            }}
                        />
                    )}
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: "#F7F9FC",
                        minWidth: 0
                    }}
                >
                    <MailOutlineRoundedIcon
                        sx={{
                            fontSize: 19,
                            color: "text.secondary",
                            mt: 0.2,
                            flexShrink: 0
                        }}
                    />

                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mb: 0.4 }}
                        >
                            כתובת אימייל
                        </Typography>

                        <Typography
                            variant="body2"
                            dir="ltr"
                            sx={{
                                color: "text.primary",
                                textAlign: "right",
                                overflowWrap: "anywhere",
                                fontSize: "0.86rem"
                            }}
                        >
                            {customer.email}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>

            <CardActions
                sx={{
                    px: 2.5,
                    pb: 2.5,
                    pt: 0.5,
                    gap: 1
                }}
            >
                {userType === "ADMIN" && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            gap: 1
                        }}
                    >
                        <Button
                            variant="contained"
                            startIcon={<EditOutlinedIcon />}
                            onClick={updateCustomer}
                            sx={{ flexGrow: 1 }}
                        >
                            עריכת פרטים
                        </Button>

                        <Tooltip title="הצגת קופונים">
                            <IconButton
                                aria-label="הצג קופונים של הלקוח"
                                onClick={() => {
                                    navigate(
                                        "/customer/customerCoupons",
                                        {
                                            state: {
                                                customerId: customer.id
                                            }
                                        }
                                    );
                                }}
                                sx={{
                                    color: "primary.main",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 2
                                }}
                            >
                                <ListAltRoundedIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="מחיקת לקוח">
                            <IconButton
                                aria-label="מחק לקוח"
                                color="error"
                                onClick={() => setOpen(true)}
                                sx={{
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 2
                                }}
                            >
                                <DeleteOutlineRoundedIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}

                {userType === "CUSTOMER" && (
                    <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<EditOutlinedIcon />}
                        onClick={updateCustomer}
                    >
                        עדכון פרטים
                    </Button>
                )}
            </CardActions>

            <Dialog
                open={open}
                onClose={() => {
                    if (!deleting) {
                        setOpen(false);
                    }
                }}
                dir="rtl"
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle sx={{ fontWeight: 800 }}>
                    מחיקת לקוח
                </DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        האם אתה בטוח שברצונך למחוק את הלקוח{" "}
                        <strong>{fullName}</strong>?
                    </DialogContentText>
                </DialogContent>

                <DialogActions sx={{ p: 2.5, gap: 1 }}>
                    <Button
                        onClick={() => setOpen(false)}
                        disabled={deleting}
                    >
                        ביטול
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        onClick={removeCustomer}
                        disabled={deleting}
                    >
                        {deleting ? "מוחק..." : "אשר ומחק"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}

export default SingleCustomer;
