class Location {
    constructor($ip_city, $IVY, $IVM, $IVD, $IVLAT, $IVLONG, $IVCENT, $IVDST, $IVTZ, $iv_shift) {
        this.md_city;
        this.md_latitude;
        this.md_longtitude;
        this.md_hemisphere_ws;
        this.md_hemisphere_ns;
        this.md_year;
        this.md_month;
        this.md_day;
        this.md_u_date;  //date in unix format
        this.md_sunrise1;
        this.md_sunset1;
        this.md_sunrise2;
        this.md_sunset2;
        this.md_sunrise3;
        this.md_sunset3;
        this.md_sunrise4;
        this.md_sunset4;
        this.md_day_len;
        this.md_cent1;
        this.md_cent2;
        this.md_cent3;
        this.md_cent4;
        this.md_polar_day = 0;
        this.md_polar_day1;
        this.md_polar_day2;
        this.md_north_pole = 0;
        this.md_south_pole = 0;
 
        this.md_city = $ip_city;
        this.mdayLen = 0;
        this.mdayLenAsArray;
        //        this.set_shift_for_date($IVY, $IVM, $IVD, $iv_shift);

        this.md_year = $IVY;
        this.md_month = $IVM;
        this.md_day = $IVD;

        if (Math.abs($IVLAT) != 90) {  // except poles
            //echo $IVTZ;
            [this.md_sunrise1, this.md_cent1] = this.calculate_Etime(this.md_year, this.md_month, this.md_day, $IVLAT, $IVLONG, $IVCENT, 1, $IVDST, $IVTZ);
            [this.md_sunrise2, this.md_cent2] = this.calculate_Etime(this.md_year, this.md_month, this.md_day, $IVLAT, $IVLONG, this.md_cent1, 1, $IVDST, $IVTZ);
            [this.md_sunrise3, this.md_cent3] = this.calculate_Etime(this.md_year, this.md_month, this.md_day, $IVLAT, $IVLONG, this.md_cent2, 1, $IVDST, $IVTZ);
            [this.md_sunrise4, this.md_cent4] = this.calculate_Etime(this.md_year, this.md_month, this.md_day, $IVLAT, $IVLONG, this.md_cent3, 1, $IVDST, $IVTZ);


            [this.md_sunset1, this.md_cent1] = this.calculate_Etime(this.md_year, this.md_month, this.md_day, $IVLAT, $IVLONG, $IVCENT, -1, $IVDST, $IVTZ);
            [this.md_sunset2, this.md_cent2] = this.calculate_Etime(this.md_year, this.md_month, this.md_day, $IVLAT, $IVLONG, this.md_cent1, -1, $IVDST, $IVTZ);
            [this.md_sunset3, this.md_cent3] = this.calculate_Etime(this.md_year, this.md_month, this.md_day, $IVLAT, $IVLONG, this.md_cent2, -1, $IVDST, $IVTZ);
            [this.md_sunset4, this.md_cent4] = this.calculate_Etime(this.md_year, this.md_month, this.md_day, $IVLAT, $IVLONG, this.md_cent3, -1, $IVDST, $IVTZ);

            this.md_polar_day = this.get_polar_night_day($IVM, this.md_sunrise4, this.md_sunset4, $IVLAT);
        } else if ($IVLAT == 90) {  // north pole
            this.md_north_pole = 1;
            this.get_north_pole_data(this.md_year, this.md_month, this.md_day, $IVLAT, $IVTZ, $IVDST);
        } else if ($IVLAT == -90) { // south pole
            this.md_south_pole = 1;
            this.get_south_pole_data(this.md_year, this.md_month, this.md_day, $IVLAT, $IVTZ, $IVDST);
        

        }
    };

    calculate_Etime($IVY, $IVM, $IVD, $IVLAT, $IVLONG, $IVCENT, $IVRISE, $IVDST, $IVTZ) {
        let $C1 = 0.017453293;
        let $TZ = $IVTZ; // Strefa czasowa
        let $DST = $IVDST; // Czas letni
        let $c11 = 6.28318530718;
        let $PI = 3.14159265358979;
        let $RISE = 1;
        let $SET = -1;

        let $Req = -0.833; //{wysokosc Slonca podczas Wschodu i Zachodu}
        let $J = 367 * $IVY - Math.floor(7 * ($IVY + Math.floor(($IVM + 9) / 12)) / 4) + Math.floor(275 * $IVM / 9) + $IVD - 730531.5 + (- $TZ + $DST) / 24;

        let $Cent = 0;
        if ($IVCENT == 0) {
            $Cent = $J / 36525;
        } else {
            $Cent = $IVCENT;
        }

        let $x1 = 628.331969753199 * $Cent;
        let $a = 4.8949504201433 + $x1;

        let $L = this._modd($a, $c11);
        let $L496 = $a % $c11;
        let $b = 6.2400408 + 628.3019501 * $Cent;

        let $G = this._modd($b, $c11);
        //        let $G = $b % $c11;

        let $O = 0.409093 - 0.0002269 * $Cent;
        let $F = 0.033423 * Math.sin($G) + 0.00034907 * Math.sin(2 * $G);
        let $E = 0.0430398 * Math.sin(2 * ($L + $F)) - 0.00092502 * Math.sin(4 * ($L + $F)) - $F;
        let $A = Math.asin(Math.sin($O) * Math.sin($L + $F));

        let $Lat1 = $IVLAT;

        //$C = (SIN($C1 * $Req) - (SIN($C1 * $Lat1)) * SIN($A)) / (COS($C1 * $Lat1) * COS($A));
        let $C = (Math.sin($C1 * $Req) - (Math.sin($C1 * $Lat1)) * Math.sin($A)) / (Math.cos($C1 * $Lat1) * Math.cos($A));

        let $Long1 = $IVLONG;

        let $W1 = $PI - ($E + 0.017453293 * $Long1 + $IVRISE * Math.acos($C));

        let $ETime = $W1 * 57.29577951 / 15;
        $ETime = $ETime + $TZ + $DST;

        let $B34 = ($J + $W1 / (2 * $PI)) / 36525;

        // Ta linia potrzebna pod UNIXA
        if ($ETime < 0) {
            $ETime = 0;
        }

        return [$ETime, $B34];
    };

    get_sunRise() {
        let $lv = this.md_sunrise4;
        this.md_sunrise4 = this.get_time_over_24h($lv);

        return this._convert2Minutes(this.md_sunrise4);

    };

    get_sunSet() {
        let $lv = this.md_sunset4;
        this.md_sunset4 = this.get_time_over_24h($lv);
        return this._convert2Minutes(this.md_sunset4);
    };

    get_sunRise_raw() {

        return this.md_sunrise4;

    };

    get_sunSet_raw() {

        return this.md_sunset4;

    };

    get_time_over_24h($ip_time) {
        if ($ip_time > 24.00) {
            let $ret_val = $ip_time - 24.00;
            return $ret_val;
        }
        return $ip_time;
    };

    getDayLen() {

        this.mdayLen = this.get_sunSet_raw() - this.get_sunRise_raw()

        return this._convert2Minutes(this.mdayLen);

    };

    set_shift_for_date($iv_R, $iv_M, $iv_D, $iv_shift) {

        // let $lv_date = mktime(0, 0, 0, $iv_M, $iv_D + $iv_shift, $iv_R);
        //let $lv_date = new Date($iv_R, $iv_M, $iv_D + $iv_shift, 0, 0, 0, 0).getTime() / 1000;
        //this.md_u_date = $lv_date;
        // $arr_date = getdate($lv_date);
        let $arr_date = new Date($iv_R, $iv_M, $iv_D + $iv_shift, 0, 0, 0, 0);


        this.md_year = $arr_date.getFullYear();
        this.md_month = $arr_date.getMonth();
        this.md_day = $arr_date.getDay();
    };

    _modd($val1, $val2) {
        let $lv = $val1 / $val2;
        let $lvi = Math.floor($lv);
        let $lvr = $lv - $lvi;
        let $m = $lvr * $val2;
        return $m;
    }

    _convert2Minutes(ivValue) {
        let hour = Math.floor(ivValue);
        let minutes = Math.floor((ivValue - hour) * 60);
        return [hour, minutes];
    }

// Polar zone ***************************************

get_south_pole_sunrise_for_date($R, $M, $D, $lat, $tz, $dst) {

    if ($lat > -89.41) {
        return -9;
    };

    this.$dat = $M . $D;

    [this.$ss, this.$sr, this.$day_ss, this.$day_sr] = this.get_sunrise_sunset_for_poles_new2($R, 'S', $tz, $dst);

    if (this.$dat == this.$day_sr) {
        this.$polar_day = 0;  // Sunrisa/ss day
    } else if (this.$dat > this.$day_sr && this.$dat < '1231') {
        this.$polar_day = 1; // POLAR DAY
        this.$sr = 0;
    } else if (this.$dat < this.$day_ss && this.$dat > '101') {
        this.$polar_day = 1; // POLAR DAY
        this.$sr = 0;
    } else {
        this.$polar_day = -1; // POLAR NIGHT
        this.$sr = 0;
    };

    return [this.$sr, this.$polar_day]; // 1 - day, -1 - night
}

get_south_pole_sunset_for_date($R, $M, $D, $lat, $tz, $dst) {

    if (this.$lat > -89.41) {
        return -9;
    };

    this.$dat = $M . $D;

    [this.$ss, this.$sr, this.$day_ss, this.$day_sr] = this.get_sunrise_sunset_for_poles_new2($R, 'S', $tz, $dst);


    if (this.$dat == this.$day_ss) {
        this.$polar_day = 0;  // Sunrisa/ss day
    } else if (this.$dat > this.$day_sr && this.$dat < '1231') {
        this.$polar_day = 1; // POLAR DAY
        this.$ss = 0;
    } else if (this.$dat < this.$day_ss && $dat > '101') {
        this.$polar_day = 1; // POLAR DAY
        this.$ss = 0;
    } else {
        this.$polar_day = -1; // POLAR NIGHT
        this.$ss = 0;
    };


    return [$ss, $polar_day]; // 1 - day, -1 - night
}

get_north_pole_sunset_for_date($R, $M, $D, $lat, $tz, $dst) {

    if ($lat < 89.41) {
        return -9;
    };

    this.$dat = $M . $D;

    [ this.$sr, this.$ss, this.$day_sr, this.$day_ss ] = this.get_sunrise_sunset_for_poles_new2($R, 'N', $tz, $dst);

    if (this.$dat == this.$day_ss) {
        this.$polar_day = 0;  // Sunrisa/ss day
    } else if (this.$dat > this.$day_ss || this.$dat < this.$day_sr) {
        this.$polar_day = -1; // POLAR Night
        this.$ss = 0;
    } else {
        this.$polar_day = 1; // POLAR day
        this.$ss = 0;
    };

    return [$ss, $polar_day]; // 1 - day, -1 - night
}

get_north_pole_sunrise_for_date($R, $M, $D, $lat, $tz, $dst) {

    if (this.$lat < 89.41) {
        return -9;
    };

    this.$dat = $M . $D;

    [ $sr, $ss, $day_sr, $day_ss ] = this.get_sunrise_sunset_for_poles_new2($R, 'N', $tz, $dst);

    if (this.$dat == this.$day_sr) {
        this.$polar_day = 0;  // Sunrisa/ss day    
    } else if (this.$dat > this.$day_ss || this.$dat < this.$day_sr) {
        this.$polar_day = -1; // POLAR Night  
        this.$sr = 0;
    } else {
        this.$polar_day = 1; // POLAR DAY  
        this.$sr = 0;
    };

    return [$sr, $polar_day]; // 1 - day, -1 - night
}

get_sunrise_sunset_for_poles_new2($R, $H, $TZ, $dst) {

    this.$lc_sunrise_day_1_march_n = '317';
    this.$lc_sunrise_day_2_march_n = '318';
    this.$lc_sunrise_day_3_march_n = '319';

    this.$lc_sunrise_day_1_sept_n = '923';
    this.$lc_sunrise_day_2_sept_n = '924';
    this.$lc_sunrise_day_3_sept_n = '925';
    this.$lc_sunrise_day_4_sept_n = '926';

    this.$lc_sunrise_day_1_march_s = '321';
    this.$lc_sunrise_day_2_march_s = '322';
    this.$lc_sunrise_day_3_march_s = '323';

    this.$lc_sunrise_day_1_sept_s = '919';
    this.$lc_sunrise_day_2_sept_s = '920';
    this.$lc_sunrise_day_3_sept_s = '921';

    this.$diff = $R - 2000;
    this.$b0 = 0.24237404;
    this.$b1 = 0.00000010338 * this.$diff;
    this.$tropic_year_diff_ve = ( this.$b0 + this.$b1 ) * 24;  //vernal equinox

    this.$a0 = 0.24201767;
    this.$a1 = 0.0000002315 * this.$diff;
    this.$tropic_year_diff_ae = ( this.$a0 - this.$a1 ) * 24; // autumnal equinox

    switch ($H) {
        case 'S' :  // South pole
        this.$sunrise_pole_2000 = 10.116667; //"10:10";  
        this.$sunset_pole_2000 = 14.02; //"14:16";            

        this.$sunrise_pole_curr = this.$sunrise_pole_2000 + this.$tropic_year_diff_ve * this.$diff + $TZ + $dst; //"22:07";
        this.$sunset_pole_curr = this.$sunset_pole_2000 + this.$tropic_year_diff_ae * this.$diff + $TZ + $dst; //"2:12";

            this.$df2000 = this.get_24h_number_from_2000(this.$sunrise_pole_curr);
            this.$df2000_ss = this.get_24h_number_from_2000(this.$sunset_pole_curr);
            this.$lf2000 = this.get_leap_year_number_from_2000($R);
            //$mod_y = $R % 4;
            this.$mod_y = this.is_leap_y($R);


            this.$diff_d = this.$lf2000 - this.$df2000;
            this.$diff_d_ss = this.$lf2000 - this.$df2000_ss;

            //echo ' $df2000_ss: ' . $df2000_ss . ' $lf2000: ' . $lf2000 . ' ';

            if (this.$diff_d == 1 && this.$mod_y == 0) {
                this.$ep_day_sr = this.$lc_sunrise_day_1_march_s;
            };

            if (this.$diff_d == 1 && this.$mod_y > 0) {
                this.$ep_day_sr = this.$lc_sunrise_day_2_march_s;
            };

            if (this.$diff_d == 0 && this.$mod_y > 0) {
                this.$ep_day_sr = this.$lc_sunrise_day_2_march_s;
            };

            if (this.$diff_d == 0 && this.$mod_y == 0) {
                this.$ep_day_sr = this.$lc_sunrise_day_2_march_s;
            };

            if (this.$diff_d == -1 && this.$mod_y > 0) {
                this.$ep_day_sr = this.$lc_sunrise_day_3_march_s;
            };

            if (this.$diff_d == -1 && this.$mod_y == 0) {
                this.$ep_day_sr = this.$lc_sunrise_day_3_march_s;
            };
// ******************************************************************

            if (this.$diff_d_ss == 1 && this.$mod_y == 0) {
                this.$ep_day_ss = this.$lc_sunrise_day_1_sept_s;
            };

            if (this.$diff_d_ss == 1 && this.$mod_y > 0) {
                this.$ep_day_ss = this.$lc_sunrise_day_2_sept_s;
            };

            if (this.$diff_d_ss == 0 && this.$mod_y > 0) {
                this.$ep_day_ss = this.$lc_sunrise_day_2_sept_s;
            };

            if (this.$diff_d_ss == 0 && this.$mod_y == 0) {
                this.$ep_day_ss = this.$lc_sunrise_day_2_sept_s;
            };

            if (this.$diff_d_ss == -1 && this.$mod_y > 0) {
                this.$ep_day_ss = this.$lc_sunrise_day_3_sept_s;
            };

            if (this.$diff_d_ss == -1 && this.$mod_y == 0) {
                this.$ep_day_ss = this.$lc_sunrise_day_3_sept_s;
            };
            break;

        case 'N' :  // North pole
            this.$sunrise_pole_2000 = 5.05; //"18:34";
            this.$sunset_pole_2000 = 20.60; //"5:03";   

            this.$sunrise_pole_curr = this.$sunrise_pole_2000 + this.$tropic_year_diff_ve * this.$diff + $TZ + $dst; //"22:07";
            this.$sunset_pole_curr = this.$sunset_pole_2000 + this.$tropic_year_diff_ae * this.$diff + $TZ + $dst; //"2:12";

            this.$df2000 = this.get_24h_number_from_2000(this.$sunrise_pole_curr);
            this.$df2000_ss = this.get_24h_number_from_2000(this.$sunset_pole_curr);
            this.$lf2000 = this.get_leap_year_number_from_2000($R);
            //$mod_y = $R % 4;
            this.$mod_y = this.is_leap_y($R);
            //echo ' mod_y: '.$mod_y;
            //echo ' $df2000: ' . $df2000 . ' $lf2000: ' . $lf2000 . ' ';
            this.$diff_d = this.$lf2000 - this.$df2000;
            this.$diff_d_ss = this.$lf2000 - this.$df2000_ss;

            if (this.$diff_d == 1 && this.$mod_y == 0) {
                this.$ep_day_sr = this.$lc_sunrise_day_1_march_n;
            };

            if (this.$diff_d == 1 && this.$mod_y > 0) {
                this.$ep_day_sr = this.$lc_sunrise_day_2_march_n;
            };

            if (this.$diff_d == 0 && this.$mod_y > 0) {
                this.$ep_day_sr = this.$lc_sunrise_day_2_march_n;
            };

            if (this.$diff_d == 0 && this.$mod_y == 0) {
                this.$ep_day_sr = this.$lc_sunrise_day_2_march_n;
            };

            if (this.$diff_d == -1 && this.$mod_y > 0) {
                this.$ep_day_sr = this.$lc_sunrise_day_3_march_n;
            };
            if (this.$diff_d == -1 && this.$mod_y == 0) {
                this.$ep_day_sr = this.$lc_sunrise_day_3_march_n;
            };

// ******************************************************************

            if (this.$diff_d_ss == 1 && this.$mod_y == 0) {
                this.$ep_day_ss = this.$lc_sunrise_day_1_sept_n;
            };

            if (this.$diff_d_ss == 1 && this.$mod_y > 0) {
                this.$ep_day_ss = this.$lc_sunrise_day_2_sept_n;
            };

            if (this.$diff_d_ss == 0 && this.$mod_y > 0) {
                this.$ep_day_ss = this.$lc_sunrise_day_2_sept_n;
            };

            if (this.$diff_d_ss == 0 && this.$mod_y == 0) {
                this.$ep_day_ss = this.$lc_sunrise_day_2_sept_n;
            };

            if (this.$diff_d_ss == -1 && this.$mod_y > 0) {
                this.$ep_day_ss = this.$lc_sunrise_day_3_sept_n;
            };
            if (this.$diff_d_ss == -1 && this.$mod_y == 0) {
                this.$ep_day_ss = this.$lc_sunrise_day_3_sept_n;
            };
            if (this.$diff_d_ss == -2 && this.$mod_y > 0) {
                this.$ep_day_ss = this.$lc_sunrise_day_4_sept_n;
            };
            if (this.$diff_d_ss == -2 && this.$mod_y == 0) {
                this.$ep_day_ss = this.$lc_sunrise_day_4_sept_n;
            };
            break;
    }

    if (this.$sunrise_pole_curr > 24) {
        this.$sunrise_pole_curr = this.get_hour(this.$sunrise_pole_curr);
    }

    if (this.$sunset_pole_curr > 24) {
        this.$sunset_pole_curr = this.get_hour(this.$sunset_pole_curr);
    }

    return [this.$sunrise_pole_curr, this.$sunset_pole_curr, this.$ep_day_sr, this.$ep_day_ss];
}

set_shift_for_date($iv_R, $iv_M, $iv_D, $iv_shift) {

 this.$lv_date = mktime(0, 0, 0, $iv_M, $iv_D + $iv_shift, $iv_R);
    this.md_u_date = $lv_date;
   this.$arr_date = getdate($lv_date);

    this.md_year = this.$arr_date[year];
    this.md_month = this.$arr_date[mon];
    this.md_day = this.$arr_date[mday];        
}

//////  ******* HELP FUNCTION **************


get_hour($val) {
    this.$mod1 = $val % 24;
    this.$floor1 = floor($val);
    this.$minsek = $val - this.$floor1;
    //$ho = intval($mod1);
    //$min = $val - $ho;   
    this.$ret_val = this.$mod1 + this.$minsek;
    return this.$ret_val;
}

get_24h_number_from_2000($ip_val) {
    this.$ep_ret = intval($ip_val / 24);
    return this.$ep_ret;
}

get_leap_year_number_from_2000($ip_val) {
    this.$ep_ret = 0;
    for (this.$i = 2001; this.$i <= $ip_val; this.$i++) {
        //this.$lv_mod = $i % 4;
        this.$lv_mod = this.is_leap_y(this.$i);
        if (this.$lv_mod == 0) {
            this.$ep_ret = this.$ep_ret + 1;
        }
    }
    return this.$ep_ret;
}

is_leap_y($R) {
    if ($R % 4 == 0) {
        if ($R % 100 == 0) {
            if ($R % 400 == 0) {
                return 0;  // is leap
            } else {
                return 1;
            }
        } else {
            return 0;  // is leap
        }
    } else {
        return 1;
    }
}

get_polar_night_day($month, $sr, $ss, $lat) {


// NORTH POLE
    if ($lat > 66 && $sr == $ss && $month > 8) {
        return -1;  // polar night    
    };

    if ($lat > 66 && $sr == $ss && $month < 4) {
        return -1;  // polar night    
    };

// SOUTH POLE
    if ($lat < -66 && $sr == $ss && $month > 2 && $month < 10) {
        return -1;  // polar night    
    };

// ************** Polar day ****************
// NORTH POLE
    if ($lat > 66 && $sr == $ss && $month > 2 && $month < 10) {
        return 1;  // polar day    
    };

// SOUTH POLE
    if ($lat < -66 && $sr == $ss && $month < 4) {
        return 1;  // polar night    
    };

    if ($lat < -66 && $sr == $ss && $month > 8) {
        return 1;  // polar day    
    };

// otherwise         
    return 0;
}

// ********************** HELP FUNCTIONS END ******************    
// ********************** HELP FUNCTIONS END ******************    
// ********************** HELP FUNCTIONS END ******************    

get_time_over_24h($ip_time) {
    if ($ip_time > 24.00) {
        this.$ret_val = $ip_time - 24.00;
        return this.$ret_val;
    }
    return $ip_time;
}



};
