#!/usr/bin/env python
from math import *

import matplotlib.pyplot as plt
import numpy as np

# see functions in timeseries.py
from timeseries import *


def main():

    print "Reading input files..."
    args = {'delim':'\t', 'headers':['timestamp', 'val']}
    couls = series_normalize_time(read_csv("telem_pack_coulomb.csv", **args))
    amps = series_normalize_time(read_csv("telem_pack_current.csv", **args))
    volts = series_normalize_time(read_csv("telem_pack_voltage.csv", **args))
    mmvolts = read_csv("multimeter_out_cleaned.csv")

    print "Modding times from the multimeter so they line up with telem..."
    for i in range(len(mmvolts['seconds'])):
        mmvolts['seconds'][i] -= 13*60;

    print "Kicking out bad values (voltages < 100)..."
    volts = series_filter(volts, "val", lambda v: v >= 100)

    print "Computing timebase for BPS measurements..."
    time_base = time_combine(couls['seconds'],amps['seconds'],volts['seconds'], mmvolts['seconds'])

    print "Interpolating coulomb counter onto the common timebase..."
    newcouls = time_interpolate(couls['val'], couls['seconds'], time_base)
    newvolts = time_interpolate(volts['val'], volts['seconds'], time_base)
    newmmvolts = time_interpolate(mmvolts['voltage'], mmvolts['seconds'], time_base)

    print "Plotting..."
    #plt.plot(newcouls, newvolts, '-', newcouls, newmmvolts, '--')
    #plt.title('discharge curve (pack voltage from telem,multimeter vs bps coulomb counter, 5.06A @ ~20C)')
    #plt.show()

    plt.plot(time_base, newvolts, '-', time_base, newmmvolts, '--')
    plt.title('discharge curve (pack voltage from telem,multimeter vs time in seconds, 5.06A @ ~20C)')
    plt.show()


main()

