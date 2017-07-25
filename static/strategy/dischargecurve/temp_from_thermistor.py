#!/usr/bin/python

import math
import sys

inpt = float(sys.argv[1]) * 1000.0

print (1.0 / ((1.0/298.15)+(1.0/4250.0)*math.log(inpt/(100000.0))))-273.15
