import { useEffect, useState } from "react";
import "./getAllCompanyCoupons.css";
import { Coupon } from "../../../modal/Coupon";
import jwtAxios from "../../../util/JWTaxios";
import globals from "../../../util/global";
import { store } from "../../../redux/store";
import { downloadCoupons } from "../../../redux/couponState";
import SingleCoupon from "../singleCoupon/singleCoupon";
import { useNavigate } from "react-router-dom";
import { Grid, Typography, Container, Box, CircularProgress } from "@mui/material";

function GetAllCompanyCoupons(): JSX.Element {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Corrected property name from 'coupons' to 'coupon' based on your couponState.ts
        if (store.getState().couponState.coupon.length === 0) {
            jwtAxios.get<Coupon[]>(globals.company.getAllCoupons)
                .then(response => {
                    store.dispatch(downloadCoupons(response.data));
                    setCoupons(response.data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Error fetching coupons:", error);
                    setLoading(false);
                });
        } else {
            // Corrected property name from 'coupons' to 'coupon'
            setCoupons(store.getState().couponState.coupon);
            setLoading(false);
        }
    }, []);

    const handleUpdateNavigate = (coupon: Coupon) => {
        // Sending the full object including id and companyId
        navigate("/company/updateCoupon", { state: { coupon: coupon } });
    };

    const handleDelete = (id: number) => {
        setCoupons(coupons.filter(c => c.id !== id));
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container className="GetAllCompanyCoupons" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
                הקופונים שלי
            </Typography>
            <hr />
            <br />
            {coupons.length === 0 ? (
                <Typography variant="h6" align="center" color="textSecondary">
                    לא נמצאו קופונים בחברה זו.
                </Typography>
            ) : (
                <Grid container spacing={3}>
                    {coupons.map(item => (
                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                            <SingleCoupon 
                                coupon={item} 
                                onDelete={handleDelete}
                                updateCoupon={() => handleUpdateNavigate(item)}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}

export default GetAllCompanyCoupons;