
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
import { Company } from "../../../modal/Company";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import notify from "../../../util/notify";
import { store } from "../../../redux/store";

interface SingleCompanyProps {
    company?: Company;
    updateCompany: () => void;
    onDelete?: (id: number) => void;
}

function SingleCompany(props: SingleCompanyProps): JSX.Element {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const userType = store.getState().authState.userType;

    if (!props.company) {
        return <div>No Data</div>;
    }

    const company = props.company;

    const removeCompany = async () => {
        if (deleting || company.id === undefined) return;

        setDeleting(true);

        try {
            await jwtAxios.delete(
                globals.admin.deleteCompany + company.id
            );

            notify.success("החברה נמחקה בהצלחה");

            if (props.onDelete) {
                props.onDelete(company.id);
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
                    {company.name}
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {userType === "ADMIN" && (
                        <Typography color="text.secondary" variant="caption">
                            ID: {company.id}
                        </Typography>
                    )}

                    <Typography variant="body2">
                        <b>אימייל:</b> {company.email}
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
                                    "/company/allCoupons",
                                    {
                                        state: {
                                            companyId: company.id
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
                            onClick={props.updateCompany}
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

                {userType === "COMPANY" && (
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={props.updateCompany}
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
                <DialogTitle
                    sx={{
                        fontWeight: "bold",
                        color: "error.main"
                    }}
                >
                    מחיקת חברה - אזהרה
                </DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        האם אתה בטוח שברצונך למחוק את חברת{" "}
                        <b>{company.name}</b>?
                        <br />
                        <br />
                        <span style={{ color: "red", fontWeight: "bold" }}>
                            שים לב:
                        </span>{" "}
                        פעולה זו תמחק לצמיתות את החברה ואת{" "}
                        <b>כל הקופונים</b> שיצרה, גם אם נרכשו על ידי לקוחות.
                    </DialogContentText>
                </DialogContent>

                <DialogActions sx={{ p: 3, gap: 3 }}>
                    <Button
                        onClick={() => setOpen(false)}
                        variant="outlined"
                        color="inherit"
                        disabled={deleting}
                    >
                        ביטול
                    </Button>

                    <Button
                        onClick={removeCompany}
                        color="error"
                        variant="contained"
                        disabled={deleting}
                    >
                        {deleting ? "מוחק..." : "אשר ומחק"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}

export default SingleCompany;
