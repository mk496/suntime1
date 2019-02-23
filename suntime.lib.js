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
};
