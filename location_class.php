<?php

// V1.0.8 Location class - basic logic
// V1.0.9 Shift day, time
class cl_location {

    protected $md_city;
    protected $md_latitude;
    protected $md_longtitude;
    protected $md_hemisphere_ws;
    protected $md_hemisphere_ns;
    protected $md_year;
    protected $md_month;
    protected $md_day;
    protected $md_u_date;  //date in unix format
    protected $md_sunrise1;
    protected $md_sunset1;
    protected $md_sunrise2;
    protected $md_sunset2;
    protected $md_sunrise3;
    protected $md_sunset3;
    protected $md_sunrise4;
    protected $md_sunset4;
    protected $md_day_len;
    protected $md_cent1;
    protected $md_cent2;
    protected $md_cent3;
    protected $md_cent4;
    protected $md_polar_day = 0;
    private $md_polar_day1;
    private $md_polar_day2;
    protected $md_north_pole = 0;
    protected $md_south_pole = 0;

    function __construct($ip_city, $IVY, $IVM, $IVD, $IVLAT, $IVLONG, $IVCENT, $IVDST, $IVTZ, $iv_shift) {

        $this->md_city = $ip_city;
        
        $this->set_shift_for_date($IVY, $IVM, $IVD, $iv_shift);

        if (abs($IVLAT) <> 90) {  // except poles
            //echo $IVTZ;
            list ( $this->md_sunrise1, $this->md_cent1 ) = $this->calculate_Etime($this->md_year, $this->md_month, $this->md_day, $IVLAT, $IVLONG, $IVCENT, 1, $IVDST, $IVTZ);
            list ( $this->md_sunrise2, $this->md_cent2 ) = $this->calculate_Etime($this->md_year, $this->md_month, $this->md_day, $IVLAT, $IVLONG, $this->md_cent1, 1, $IVDST, $IVTZ);
            list ( $this->md_sunrise3, $this->md_cent3 ) = $this->calculate_Etime($this->md_year, $this->md_month, $this->md_day, $IVLAT, $IVLONG, $this->md_cent2, 1, $IVDST, $IVTZ);
            list ( $this->md_sunrise4, $this->md_cent4 ) = $this->calculate_Etime($this->md_year, $this->md_month, $this->md_day, $IVLAT, $IVLONG, $this->md_cent3, 1, $IVDST, $IVTZ);
            

            list ( $this->md_sunset1, $this->md_cent1 ) = $this->calculate_Etime($this->md_year, $this->md_month, $this->md_day, $IVLAT, $IVLONG, $IVCENT, -1, $IVDST, $IVTZ);
            list ( $this->md_sunset2, $this->md_cent2 ) = $this->calculate_Etime($this->md_year, $this->md_month, $this->md_day, $IVLAT, $IVLONG, $this->md_cent1, -1, $IVDST, $IVTZ);
            list ( $this->md_sunset3, $this->md_cent3 ) = $this->calculate_Etime($this->md_year, $this->md_month, $this->md_day, $IVLAT, $IVLONG, $this->md_cent2, -1, $IVDST, $IVTZ);
            list ( $this->md_sunset4, $this->md_cent4 ) = $this->calculate_Etime($this->md_year, $this->md_month, $this->md_day, $IVLAT, $IVLONG, $this->md_cent3, -1, $IVDST, $IVTZ);
            
            
            $this->md_polar_day = $this->get_polar_night_day($IVM, $this->md_sunrise4, $this->md_sunset4, $IVLAT);
        } elseif ($IVLAT == 90) {  // north pole
            $this->md_north_pole = 1;
            $this->get_north_pole_data($this->md_year, $this->md_month, $this->md_day, $IVLAT, $IVTZ, $IVDST);
        } elseif ($IVLAT == -90) { // south pole
            $this->md_south_pole = 1;
            $this->get_south_pole_data($this->md_year, $this->md_month, $this->md_day, $IVLAT, $IVTZ, $IVDST);
        }
    }

    private function get_south_pole_data($IVY, $IVM, $IVD, $IVLAT, $IVTZ, $IVDST) {
        list($this->md_sunrise4, $this->md_polar_day1) = $this->get_south_pole_sunrise_for_date($IVY, $IVM, $IVD, $IVLAT, $IVTZ, $IVDST);
        list($this->md_sunset4, $this->md_polar_day2) = $this->get_south_pole_sunset_for_date($IVY, $IVM, $IVD, $IVLAT, $IVTZ, $IVDST);

        if ($this->md_polar_day1 == -9 || $this->md_polar_day1 == 0) {
            $this->md_polar_day = 0;
            return;
        };

        if ($this->md_polar_day2 == -9 || $this->md_polar_day2 == 0) {
            $this->md_polar_day = 0;
            return;
        };

        if ($this->md_polar_day1 == -1 || $this->md_polar_day2 == -1) {
            $this->md_polar_day = -1;
            return;
        };

        if ($this->md_polar_day2 == 1 || $this->md_polar_day2 == 1) {
            $this->md_polar_day = 1;
            return;
        };
    }

    private function get_north_pole_data($IVY, $IVM, $IVD, $IVLAT, $IVTZ, $IVDST) {
        list($this->md_sunrise4, $this->md_polar_day1) = $this->get_north_pole_sunrise_for_date($IVY, $IVM, $IVD, $IVLAT, $IVTZ, $IVDST);
        list($this->md_sunset4, $this->md_polar_day2) = $this->get_north_pole_sunset_for_date($IVY, $IVM, $IVD, $IVLAT, $IVTZ, $IVDST);

        if ($this->md_polar_day1 == -9 || $this->md_polar_day1 == 0) {
            $this->md_polar_day = 0;
            return;
        };

        if ($this->md_polar_day2 == -9 || $this->md_polar_day2 == 0) {
            $this->md_polar_day = 0;
            return;
        };

        if ($this->md_polar_day1 == -1 || $this->md_polar_day2 == -1) {
            $this->md_polar_day = -1;
            return;
        };

        if ($this->md_polar_day2 == 1 || $this->md_polar_day2 == 1) {
            $this->md_polar_day = 1;
            return;
        }
    }

    private function calculate_Etime($IVY, $IVM, $IVD, $IVLAT, $IVLONG, $IVCENT, $IVRISE, $IVDST, $IVTZ) {
        $C1 = 0.017453293;
        $TZ = $IVTZ; // Strefa czasowa
        $DST = $IVDST; // Czas letni
        $c11 = 6.28318530718;
        $PI = 3.14159265358979;
        $RISE = 1;
        $SET = -1;

        $Req = -0.833; //{wysokosc Slonca podczas Wschodu i Zachodu}
        $J = 367 * $IVY - intval(7 * ($IVY + intval(($IVM + 9) / 12)) / 4) + intval(275 * $IVM / 9) + $IVD - 730531.5 + (- $TZ + $DST) / 24;
        if ($IVCENT == 0) {
            $Cent = $J / 36525;
        } else {
            $Cent = $IVCENT;
        }

        $x1 = 628.331969753199 * $Cent;
        $a = 4.8949504201433 + $x1;

        $L = modd($a, $c11);

        $b = 6.2400408 + 628.3019501 * $Cent;

        $G = modd($b, $c11);

        $O = 0.409093 - 0.0002269 * $Cent;
        $F = 0.033423 * SIN($G) + 0.00034907 * SIN(2 * $G);
        $E = 0.0430398 * SIN(2 * ($L + $F)) - 0.00092502 * SIN(4 * ($L + $F)) - $F;
        $A = ASIN(SIN($O) * SIN($L + $F));

        $Lat1 = $IVLAT;

        $C = (SIN($C1 * $Req) - (SIN($C1 * $Lat1)) * SIN($A)) / (COS($C1 * $Lat1) * COS($A));

        $Long1 = $IVLONG;

        $W1 = $PI - ($E + 0.017453293 * $Long1 + $IVRISE * ACOS($C));

        $ETime = $W1 * 57.29577951 / 15;
        $ETime = $ETime + $TZ + $DST;

        $B34 = ($J + $W1 / (2 * $PI)) / 36525;

// Ta linia potrzebna pod UNIXA
        if ($ETime < 0) {
            $ETime = 0;
        }

        return array($ETime, $B34);
    }

private function calculate_Etime_old($lv_IVY, $lv_IVM, $lv_IVD, $lv_IVLAT, $lv_IVLONG, $lv_IVCENT, $lv_IVRISE, $lv_IVDST, $lv_IVTZ) {
        $lv_C1 = 0.017453293;
        $lv_TZ = $lv_IVTZ; // Strefa czasowa
        $lv_DST = $lv_IVDST; // Czas letni
        $lv_c11 = 6.28318530718;
        $lv_PI = 3.14159265358979;
        $lv_RISE = 1;
        $lv_SET = -1;

        $lv_Req = -0.833; //{wysokosc Slonca podczas Wschodu i Zachodu}
        $lv_J = 367 * $lv_IVY - intval(7 * ($lv_IVY + intval(($lv_IVM + 9) / 12)) / 4) + intval(275 * $lv_IVM / 9) + $lv_IVD - 730531.5 + (- $lv_TZ + $lv_DST) / 24;
        if ($lv_IVCENT == 0) {
            $lv_Cent = $lv_J / 36525;
        } else {
            $lv_Cent = $lv_IVCENT;
        }

        $lv_x1 = 628.331969753199 * $lv_Cent;
        $lv_a = 4.8949504201433 + $lv_x1;

        $lv_L = modd($lv_a, $lv_c11);

        $lv_b = 6.2400408 + 628.3019501 * $lv_Cent;

        $lv_G = modd($lv_b, $lv_c11);

        $lv_O = 0.409093 - 0.0002269 * $lv_Cent;
        $lv_F = 0.033423 * SIN($lv_G) + 0.00034907 * SIN(2 * $lv_G);
        $lv_E = 0.0430398 * SIN(2 * ($lv_L + $lv_F)) - 0.00092502 * SIN(4 * ($lv_L + $lv_F)) - $lv_F;
        $lv_A = ASIN(SIN($lv_O) * SIN($lv_L + $lv_F));

        $lv_Lat1 = $lv_IVLAT;

        $lv_C = (SIN($lv_C1 * $lv_Req) - (SIN($lv_C1 * $lv_Lat1)) * SIN($lv_A)) / (COS($lv_C1 * $lv_Lat1) * COS($lv_A));

        $lv_Long1 = $lv_IVLONG;

        $lv_W1 = $lv_PI - ($lv_E + 0.017453293 * $lv_Long1 + $lv_IVRISE * ACOS($lv_C));

        $lv_ETime = $lv_W1 * 57.29577951 / 15;
        $lv_ETime = $lv_ETime + $lv_TZ + $lv_DST;

        $lv_B34 = ($lv_J + $lv_W1 / (2 * $lv_PI)) / 36525;

// Ta linia potrzebna pod UNIXA
        if ($lv_ETime < 0) {
            $lv_ETime = 0;
        }

        return array($lv_ETime, $lv_B34);
    }    
    
    private function get_south_pole_sunrise_for_date($R, $M, $D, $lat, $tz, $dst) {

        if ($lat > -89.41) {
            return -9;
        };

        $dat = $M . $D;

        list( $ss, $sr, $day_ss, $day_sr) = $this->get_sunrise_sunset_for_poles_new2($R, 'S', $tz, $dst);

        if ($dat == $day_sr) {
            $polar_day = 0;  // Sunrisa/ss day
        } elseif ($dat > $day_sr && $dat < '1231') {
            $polar_day = 1; // POLAR DAY
            $sr = 0;
        } elseif ($dat < $day_ss && $dat > '101') {
            $polar_day = 1; // POLAR DAY
            $sr = 0;
        } else {
            $polar_day = -1; // POLAR NIGHT
            $sr = 0;
        };

        return array($sr, $polar_day); // 1 - day, -1 - night
    }

    private function get_south_pole_sunset_for_date($R, $M, $D, $lat, $tz, $dst) {

        if ($lat > -89.41) {
            return -9;
        };

        $dat = $M . $D;

        list( $ss, $sr, $day_ss, $day_sr) = $this->get_sunrise_sunset_for_poles_new2($R, 'S', $tz, $dst);


        if ($dat == $day_ss) {
            $polar_day = 0;  // Sunrisa/ss day
        } elseif ($dat > $day_sr && $dat < '1231') {
            $polar_day = 1; // POLAR DAY
            $ss = 0;
        } elseif ($dat < $day_ss && $dat > '101') {
            $polar_day = 1; // POLAR DAY
            $ss = 0;
        } else {
            $polar_day = -1; // POLAR NIGHT
            $ss = 0;
        };


        return array($ss, $polar_day); // 1 - day, -1 - night
    }

    private function get_north_pole_sunset_for_date($R, $M, $D, $lat, $tz, $dst) {

        if ($lat < 89.41) {
            return -9;
        };

        $dat = $M . $D;

        list( $sr, $ss, $day_sr, $day_ss) = $this->get_sunrise_sunset_for_poles_new2($R, 'N', $tz, $dst);

        if ($dat == $day_ss) {
            $polar_day = 0;  // Sunrisa/ss day
        } elseif ($dat > $day_ss || $dat < $day_sr) {
            $polar_day = -1; // POLAR Night
            $ss = 0;
        } else {
            $polar_day = 1; // POLAR day
            $ss = 0;
        };

        return array($ss, $polar_day); // 1 - day, -1 - night
    }

    private function get_north_pole_sunrise_for_date($R, $M, $D, $lat, $tz, $dst) {

        if ($lat < 89.41) {
            return -9;
        };

        $dat = $M . $D;

        list( $sr, $ss, $day_sr, $day_ss) = $this->get_sunrise_sunset_for_poles_new2($R, 'N', $tz, $dst);

        if ($dat == $day_sr) {
            $polar_day = 0;  // Sunrisa/ss day    
        } elseif ($dat > $day_ss || $dat < $day_sr) {
            $polar_day = -1; // POLAR Night  
            $sr = 0;
        } else {
            $polar_day = 1; // POLAR DAY  
            $sr = 0;
        };

        return array($sr, $polar_day); // 1 - day, -1 - night
    }

    private function get_sunrise_sunset_for_poles_new2($R, $H, $TZ, $dst) {

        $lc_sunrise_day_1_march_n = '317';
        $lc_sunrise_day_2_march_n = '318';
        $lc_sunrise_day_3_march_n = '319';

        $lc_sunrise_day_1_sept_n = '923';
        $lc_sunrise_day_2_sept_n = '924';
        $lc_sunrise_day_3_sept_n = '925';
        $lc_sunrise_day_4_sept_n = '926';

        $lc_sunrise_day_1_march_s = '321';
        $lc_sunrise_day_2_march_s = '322';
        $lc_sunrise_day_3_march_s = '323';

        $lc_sunrise_day_1_sept_s = '919';
        $lc_sunrise_day_2_sept_s = '920';
        $lc_sunrise_day_3_sept_s = '921';

        $diff = $R - 2000;
        $b0 = 0.24237404;
        $b1 = 0.00000010338 * $diff;
        $tropic_year_diff_ve = ( $b0 + $b1 ) * 24;  //vernal equinox

        $a0 = 0.24201767;
        $a1 = 0.0000002315 * $diff;
        $tropic_year_diff_ae = ( $a0 - $a1 ) * 24; // autumnal equinox

        switch ($H) {
            case 'S' :  // South pole
                $sunrise_pole_2000 = 10.116667; //"10:10";  
                $sunset_pole_2000 = 14.02; //"14:16";            

                $sunrise_pole_curr = $sunrise_pole_2000 + $tropic_year_diff_ve * $diff + $TZ + $dst; //"22:07";
                $sunset_pole_curr = $sunset_pole_2000 + $tropic_year_diff_ae * $diff + $TZ + $dst; //"2:12";

                $df2000 = $this->get_24h_number_from_2000($sunrise_pole_curr);
                $df2000_ss = $this->get_24h_number_from_2000($sunset_pole_curr);
                $lf2000 = $this->get_leap_year_number_from_2000($R);
                //$mod_y = $R % 4;
                $mod_y = $this->is_leap_y($R);


                $diff_d = $lf2000 - $df2000;
                $diff_d_ss = $lf2000 - $df2000_ss;

                //echo ' $df2000_ss: ' . $df2000_ss . ' $lf2000: ' . $lf2000 . ' ';

                if ($diff_d == 1 && $mod_y == 0) {
                    $ep_day_sr = $lc_sunrise_day_1_march_s;
                };

                if ($diff_d == 1 && $mod_y > 0) {
                    $ep_day_sr = $lc_sunrise_day_2_march_s;
                };

                if ($diff_d == 0 && $mod_y > 0) {
                    $ep_day_sr = $lc_sunrise_day_2_march_s;
                };

                if ($diff_d == 0 && $mod_y == 0) {
                    $ep_day_sr = $lc_sunrise_day_2_march_s;
                };

                if ($diff_d == -1 && $mod_y > 0) {
                    $ep_day_sr = $lc_sunrise_day_3_march_s;
                };

                if ($diff_d == -1 && $mod_y == 0) {
                    $ep_day_sr = $lc_sunrise_day_3_march_s;
                };
// ******************************************************************

                if ($diff_d_ss == 1 && $mod_y == 0) {
                    $ep_day_ss = $lc_sunrise_day_1_sept_s;
                };

                if ($diff_d_ss == 1 && $mod_y > 0) {
                    $ep_day_ss = $lc_sunrise_day_2_sept_s;
                };

                if ($diff_d_ss == 0 && $mod_y > 0) {
                    $ep_day_ss = $lc_sunrise_day_2_sept_s;
                };

                if ($diff_d_ss == 0 && $mod_y == 0) {
                    $ep_day_ss = $lc_sunrise_day_2_sept_s;
                };

                if ($diff_d_ss == -1 && $mod_y > 0) {
                    $ep_day_ss = $lc_sunrise_day_3_sept_s;
                };

                if ($diff_d_ss == -1 && $mod_y == 0) {
                    $ep_day_ss = $lc_sunrise_day_3_sept_s;
                };
                break;

            case 'N' :  // North pole
                $sunrise_pole_2000 = 5.05; //"18:34";
                $sunset_pole_2000 = 20.60; //"5:03";   

                $sunrise_pole_curr = $sunrise_pole_2000 + $tropic_year_diff_ve * $diff + $TZ + $dst; //"22:07";
                $sunset_pole_curr = $sunset_pole_2000 + $tropic_year_diff_ae * $diff + $TZ + $dst; //"2:12";

                $df2000 = $this->get_24h_number_from_2000($sunrise_pole_curr);
                $df2000_ss = $this->get_24h_number_from_2000($sunset_pole_curr);
                $lf2000 = $this->get_leap_year_number_from_2000($R);
                //$mod_y = $R % 4;
                $mod_y = $this->is_leap_y($R);
                //echo ' mod_y: '.$mod_y;
                //echo ' $df2000: ' . $df2000 . ' $lf2000: ' . $lf2000 . ' ';
                $diff_d = $lf2000 - $df2000;
                $diff_d_ss = $lf2000 - $df2000_ss;

                if ($diff_d == 1 && $mod_y == 0) {
                    $ep_day_sr = $lc_sunrise_day_1_march_n;
                };

                if ($diff_d == 1 && $mod_y > 0) {
                    $ep_day_sr = $lc_sunrise_day_2_march_n;
                };

                if ($diff_d == 0 && $mod_y > 0) {
                    $ep_day_sr = $lc_sunrise_day_2_march_n;
                };

                if ($diff_d == 0 && $mod_y == 0) {
                    $ep_day_sr = $lc_sunrise_day_2_march_n;
                };

                if ($diff_d == -1 && $mod_y > 0) {
                    $ep_day_sr = $lc_sunrise_day_3_march_n;
                };
                if ($diff_d == -1 && $mod_y == 0) {
                    $ep_day_sr = $lc_sunrise_day_3_march_n;
                };

// ******************************************************************

                if ($diff_d_ss == 1 && $mod_y == 0) {
                    $ep_day_ss = $lc_sunrise_day_1_sept_n;
                };

                if ($diff_d_ss == 1 && $mod_y > 0) {
                    $ep_day_ss = $lc_sunrise_day_2_sept_n;
                };

                if ($diff_d_ss == 0 && $mod_y > 0) {
                    $ep_day_ss = $lc_sunrise_day_2_sept_n;
                };

                if ($diff_d_ss == 0 && $mod_y == 0) {
                    $ep_day_ss = $lc_sunrise_day_2_sept_n;
                };

                if ($diff_d_ss == -1 && $mod_y > 0) {
                    $ep_day_ss = $lc_sunrise_day_3_sept_n;
                };
                if ($diff_d_ss == -1 && $mod_y == 0) {
                    $ep_day_ss = $lc_sunrise_day_3_sept_n;
                };
                if ($diff_d_ss == -2 && $mod_y > 0) {
                    $ep_day_ss = $lc_sunrise_day_4_sept_n;
                };
                if ($diff_d_ss == -2 && $mod_y == 0) {
                    $ep_day_ss = $lc_sunrise_day_4_sept_n;
                };
                break;
        }

        if ($sunrise_pole_curr > 24) {
            $sunrise_pole_curr = $this->get_hour($sunrise_pole_curr);
        }

        if ($sunset_pole_curr > 24) {
            $sunset_pole_curr = $this->get_hour($sunset_pole_curr);
        }

        return array($sunrise_pole_curr, $sunset_pole_curr, $ep_day_sr, $ep_day_ss);
    }

    private function set_shift_for_date($iv_R, $iv_M, $iv_D, $iv_shift) {

     $lv_date = mktime(0, 0, 0, $iv_M, $iv_D + $iv_shift, $iv_R);
        $this->md_u_date = $lv_date;
       $arr_date = getdate($lv_date);

        $this->md_year = $arr_date[year];
        $this->md_month = $arr_date[mon];
        $this->md_day = $arr_date[mday];        
    }

//////  ******* HELP FUNCTION **************


    function get_hour($val) {
        $mod1 = $val % 24;
        $floor1 = floor($val);
        $minsek = $val - $floor1;
        //$ho = intval($mod1);
        //$min = $val - $ho;   
        $ret_val = $mod1 + $minsek;
        return $ret_val;
    }

    function get_24h_number_from_2000($ip_val) {
        $ep_ret = intval($ip_val / 24);
        return $ep_ret;
    }

    function get_leap_year_number_from_2000($ip_val) {
        $ep_ret = 0;
        for ($i = 2001; $i <= $ip_val; $i++) {
            //$lv_mod = $i % 4;
            $lv_mod = $this->is_leap_y($i);
            if ($lv_mod == 0) {
                $ep_ret = $ep_ret + 1;
            }
        }
        return $ep_ret;
    }

    function is_leap_y($R) {
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

    function get_polar_night_day($month, $sr, $ss, $lat) {


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
            return 1;  // polar night    
        };

// otherwise         
        return 0;
    }

// ********************** HELP FUNCTIONS END ******************    
// ********************** HELP FUNCTIONS END ******************    
// ********************** HELP FUNCTIONS END ******************    

    protected function get_time_over_24h($ip_time) {
        if ($ip_time > 24.00) {
            $ret_val = $ip_time - 24.00;
            return $ret_val;
        }
        return $ip_time;
    }

    public function get_sunrise() {
        $lv = $this->md_sunrise4;
        $this->md_sunrise4 = $this->get_time_over_24h($lv);
        return $this->md_sunrise4;
    }

    public function get_sunset() {
        $lv = $this->md_sunset4;
        $this->md_sunset4 = $this->get_time_over_24h($lv);
        return $this->md_sunset4;
    }

    public function get_city() {
        return $this->md_city;
    }

    public function get_day_length() {
        if ($this->md_south_pole == 1 || $this->md_north_pole == 1) {
            if ($this->md_sunset4 > $this->md_sunrise4) {
                $this->md_day_len = $this->md_sunset4 - $this->md_sunrise4;
            } else {
                $this->md_day_len = - $this->md_sunrise4 + 24;
            }
        } else {
            $this->md_day_len = $this->md_sunset4 - $this->md_sunrise4;
        };

        return $this->md_day_len;
    }

    public function get_polar_day() {
        return $this->md_polar_day;
    }

    public function get_u_date() {
        return $this->md_u_date;
    }
    
    public function get_a_date() {  // as array
        return array( $this->md_year, $this->md_month, $this->md_day );
    }
}

?>