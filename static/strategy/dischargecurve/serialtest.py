#!/usr/bin/env python

import serial, time

CONTROLLER_ON =	False
VOLTAGE_ON =	True
CURRENT_ON =	True

if CONTROLLER_ON:
    controller = serial.Serial('/dev/ttyUSB1', 9600, dsrdtr=False, timeout=5)
    controller.write("SYSTem:REMote\n")
    controller.write('VOLT 0.0\n')
    controller.write('CURR 0.0\n')

if VOLTAGE_ON:
    voltage = serial.Serial('/dev/ttyUSB2', 9600, dsrdtr=False, timeout=5)
    voltage.write("SYSTem:REMote\n")
    for i in range(0,3):
        voltage.write("MEAS:VOLT:DC? 3, 0.001\n")
        voltageString = voltage.read(17)
        print "Voltage: %s" % voltageString

if CURRENT_ON:
    current = serial.Serial('/dev/ttyUSB1', 9600, dsrdtr=False, timeout=5)
    current.write("SYSTem:REMote\n")
    for i in range(0,3):
        current.write("MEAS:CURR:DC? 3, 0.00001\n")
        currentString = current.read(17)
        print "Current: %s" % currentString
