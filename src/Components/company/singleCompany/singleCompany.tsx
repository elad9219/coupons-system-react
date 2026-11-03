
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

import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ListAltRoundedIcon from "@mui/icons-material/ListAltRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";

import { Company } from "../../../modal/Company";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import notify from "../../../util/notify";
import { getApiErrorMessage } from "../../../util/apiError";
import { store } from "../../../redux/store";

interface SingleCompanyProps {
    company?: Company;
    updateCompany: () => void;
    onDelete?: (id: number) => void;
}

function SingleCompany({
    company,
    updateCompany,
    onDelete
}: SingleCompanyProps): JSX.Element {
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const userType = store.getState().authState.userType;

    if (!company) {
        return <Box />;
    }

    const removeCompany = async (): Promise<void> => {
        if (deleting || company.id === undefined) {
            return;
        }

        setDeleting(true);

        try {
            await jwtAxios.delete(
                globals.admin.deleteCompany + company.id
            );

            notify.success("החברה נמחקה בהצלחה");
            onDelete?.(company.id);
            setOpen(false);
        } catch (error) {
            notify.error(
                getApiErrorMessage(
                    error,
                    "לא הצלחנו למחוק את החברה."
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
                            bgcolor: "#EAF0FF",
                            color: "primary.main",
                            borderRadius: 2.5
                        }}
                    >
                        <StorefrontRoundedIcon />
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
                            {company.name}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            חשבון חברה
                        </Typography>
                    </Box>

                    {userType === "ADMIN" && (
                        <Chip
                            size="small"
                            label={`#${company.id}`}
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
                            {company.email}
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
                            onClick={updateCompany}
                            sx={{ flexGrow: 1 }}
                        >
                            עריכת פרטים
                        </Button>

                        <Tooltip title="הצגת קופונים">
                            <IconButton
                                aria-label="הצג קופונים של החברה"
                                onClick={() => {
                                    navigate(
                                        "/company/allCoupons",
                                        {
                                            state: {
                                                companyId: company.id
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

                        <Tooltip title="מחיקת חברה">
                            <IconButton
                                aria-label="מחק חברה"
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

                {userType === "COMPANY" && (
                    <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<EditOutlinedIcon />}
                        onClick={updateCompany}
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
                    מחיקת חברה
                </DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        האם אתה בטוח שברצונך למחוק את חברת{" "}
                        <strong>{company.name}</strong>?
                    </DialogContentText>

                    <Typography
                        variant="body2"
                        sx={{
                            mt: 2,
                            color: "error.main",
                            fontWeight: 700
                        }}
                    >
                        פעולה זו תמחק לצמיתות את החברה ואת
                        כל הקופונים שיצרה, גם אם נרכשו.
                    </Typography>
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
                        onClick={removeCompany}
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
