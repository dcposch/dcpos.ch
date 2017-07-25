#!/usr/bin/env python

import dcload
import time

bk_device = '/dev/ttyUSB0'

bk = dcload.DCLoad()
bk.Initialize(bk_device, 9600)
bk.SetRemoteControl()
bk.SetMaxPower(300)
bk.SetMaxCurrent(15)
bk.SetMaxVoltage(200)
bk.TurnLoadOn()

bk.SetMode('cv')

bk.SetCVVoltage(2)
#bk.SetCCCurrent(10)
'''
for i in xrange(100):
    v = 3.0 - float(i) / 100.0 *  2.5
    print "setting bk at CV at %f V" % v
    bk.SetCVVoltage(v)
    time.sleep(1)
'''
