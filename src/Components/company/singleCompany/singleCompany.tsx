import { Company } from "../../../modal/Company";
import jwtAxios from '../../../util/JWTaxios';
import globals from "../../../util/global";
import notify from '../../../util/notify';
import { store } from "../../../redux/store";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Card, CardContent, Typography, Box, TextField, InputAdornment, IconButton, CardActions } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ListAltIcon from '@mui/icons-material/ListAlt';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

interface SingleCompanyProps {
    company?: Company;
    updateCompany: () => void;
    onDelete?: (id: number) => void;
}

function SingleCompany(props: SingleCompanyProps): JSX.Element {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const userType = store.getState().authState.userType;

    if (!props.company) return <div>No Data</div>;

    const removeCompany = () => {
        if (!props.company) return;
        jwtAxios.delete(globals.admin.deleteCompany + props.company.id)
            .then(() => {
                notify.success("החברה נמחקה");
                if (props.onDelete) props.onDelete(props.company!.id);
            })
            .catch(() => notify.error("שגיאה במחיקה (אולי יש קופונים מקושרים?)"));
    };

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3, borderRadius: 2 }} dir="rtl">
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="div" gutterBottom fontWeight="bold" color="primary">
                    {props.company.name}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {userType === "ADMIN" && (
                        <Typography color="text.secondary" variant="caption">ID: {props.company.id}</Typography>
                    )}
                    <Typography variant="body2"><b>אימייל:</b> {props.company.email}</Typography>

                    <Box display="flex" alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 1 }}>סיסמה:</Typography>
                        <TextField
                            variant="standard"
                            type={showPassword ? 'text' : 'password'}
                            value={props.company.password}
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
                    <Box sx={{ width: '100%', display: 'flex', gap: 1 }}>
                        <Button size="small" variant="outlined" onClick={() => navigate("/company/allCoupons", { state: { companyId: props.company?.id } })}><ListAltIcon/></Button>
                        <Button size="small" variant="contained" color="warning" onClick={props.updateCompany} fullWidth startIcon={<EditIcon/>}>ערוך</Button>
                        <IconButton size="small" color="error" onClick={() => setOpen(true)}><DeleteIcon/></IconButton>
                    </Box>
                )}
                {userType === "COMPANY" && (
                        <Button variant="outlined" fullWidth onClick={props.updateCompany}>עדכון פרטים</Button>
                )}
            </CardActions>

            <Dialog open={open} onClose={() => setOpen(false)} dir="rtl">
                <DialogTitle>מחיקת חברה</DialogTitle>
                <DialogContent><DialogContentText>למחוק את {props.company.name}?</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>ביטול</Button>
                    <Button onClick={() => { removeCompany(); setOpen(false); }} color="error">מחק</Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}

export default SingleCompany;