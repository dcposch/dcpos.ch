#!/usr/bin/env python

import serial
import time
import dcload
import datetime
import sys

bk_device = '/dev/ttyUSB0'
bk = None

OUTPUT_FILE = 'out_%d.txt' % int(time.time())

MAX_FAILURES = 3

MIN_BATT_VOLTAGE = 2.75
MAX_BATT_VOLTAGE = 4.2

BK_MODE = 'current'
DRAIN_VALUE = 1.0

def set_bk(value):

    if value == 0.0:
        bk.SetMaxPower(0)
        bk.SetMaxCurrent(0)
    else:
        bk.TurnLoadOn()
        bk.SetMaxPower(value * 5 + 1)
        bk.SetMaxCurrent(value * 5 + 1)
        if BK_MODE == 'power':
            bk.SetMode('cw')
            bk.SetMaxPower(value+1.0)
            bk.SetCWPower(value)
        elif BK_MODE == 'current':
            bk.SetMode('cc')
            bk.SetMaxCurrent(value+1.0)
            bk.SetCCCurrent(value)

def init_bk():
    global bk
    bk = dcload.DCLoad()
    bk.Initialize(bk_device, 9600)
    bk.SetRemoteControl()
    set_bk(0.0)

startTime = time.time()

fout = None
def start_logging():
    global fout
    fout = open(OUTPUT_FILE, 'a+')

def done_logging():
    global fout
    fout.close()

def log(message):
    now = datetime.datetime.now()
    message = "%s: %s"%(now, message)
    print message
    fout.write(message + '\n')

# returns voltage, current
def get_measurements():
    print 'bk test thing'
    input_values = bk.GetInputValues()
    print input_values
    voltage = float(input_values[:input_values.find(' V')])
    current = float(input_values[input_values.find(' V\t')+3:input_values.find(' A')])
    # 3.46 V\t1.0003 A\t3.461 W\t0x1c\t0x40
    # voltage = bk.GetBatteryTestVoltage()
    return voltage, current


class BatteryVoltageTooLowException(Exception):
    def __init__(self, voltage):
        self.voltage = voltage

    def __str__(self):
        return "Battery voltage is too low: %f V" % self.voltage

def log_data():
    fail_count = 0
     
    while True:
        if fail_count > MAX_FAILURES:
            log('Too many (%d) consecutive failures occurred. Bailing.' % fail_count)
            break
        try:
            print 'setting BK to %f in constant %s mode' % (DRAIN_VALUE, BK_MODE)
            set_bk(DRAIN_VALUE)

            time.sleep(30)

            thetime = time.time() - startTime

            voltage_sink, current = get_measurements()

            make_everything_safe()
            time.sleep(1)

            voltage_actual, ignore = get_measurements()

            log("> %f,%f,%f,%f" % (thetime, voltage_sink, voltage_actual, current))

            if voltage_actual < MIN_BATT_VOLTAGE:
                raise BatteryVoltageTooLowException(voltage)

            fail_count = 0

        except Exception as e:
            log('A failure occurred: %s' % e)
            fail_count += 1

    make_everything_safe()

def make_everything_safe():
    set_bk(0.0)

def main_loop():
    global bk_device
    if len(sys.argv) == 2:
        bk_device = sys.argv[1]
    else:
        print "Usage: %s [bk device like /dev/ttyUSB...]" % sys.argv[0]

    init_bk()
    log_data()

start_logging()
try:
    main_loop()
finally:
    done_logging()
    pass
