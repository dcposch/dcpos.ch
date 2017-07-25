#!/usr/bin/python

from function import Function
from pfunction import PFunction
from kf import KalmanFilter

'''
We require:
- a reported SOC from the coulomb counter
- a voltage, corrected for lift / sink
- a bunch of curves for v -> wh
'''

CURVE_FILES = [
    (25, 'data/curves/25C'),
    (30, 'data/curves/30C'),
    (40, 'data/curves/40C'),
]

def data_from_curve(fname):
    fin = open(fname)

    # format = wh_left, v_actual

    data = []
    while (True):
        l = fin.readline()
        if len(l) == 0: break
        spl = l.split(',')
        try:
            wh = float(spl[0].strip())
            v = float(spl[1].strip())
            data.append((v, wh))
        except Exception, e:
            print "An exception occurred: %s" % str(e)
            print "It's probably OK"

    return data

def pfunction_from_curves():
    data = []
    for t in CURVE_FILES:
        data.append((t[0], data_from_curve(t[1])))
    return PFunction(data=data)


