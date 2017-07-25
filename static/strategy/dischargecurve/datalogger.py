#!/usr/bin/env python

import serial
import time
import dcload
import datetime
import sys

CONTROLLER_ON = True
CURRENT_ON = True
VOLTAGE_ON = True
BK_ON = True
RELAY_ON = True

assert (len(sys.argv)>=6)
CONTROLLER_DEVICE = '/dev/ttyUSB'+sys.argv[1]
CURRENT_DEVICE = '/dev/ttyUSB'+sys.argv[2]
VOLTAGE_DEVICE = '/dev/ttyUSB'+sys.argv[3]
BK_DEVICE = '/dev/ttyUSB'+sys.argv[4]
RELAY_DEVICE = '/dev/ttyUSB'+sys.argv[5]

OUTPUT_FILE = 'out_%d.txt' % int(time.time())

CHARGE_HIGH_TIME = 60
CHARGE_LOW_TIME = 1

MAX_FAILURES = 3

MIN_BATT_VOLTAGE = 2.8
MAX_BATT_VOLTAGE = 4.2

BK_MODE = 'current'
DRAIN_VALUE = 1.0

COMMANDS = {
    'help': 'Displays the help menu',
    'log':  'Logs a discharge curve (N.B. This drains the battery) - please charge first',
    'charge': 'Charge battery',
    'safe': 'Turns off BK and power supply',
}

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


if VOLTAGE_ON:
    voltageSerial = serial.Serial(VOLTAGE_DEVICE, 9600, dsrdtr=False, timeout=5)
    voltageSerial.write("SYSTem:REMote\n")
if CURRENT_ON:
    currentSerial = serial.Serial(CURRENT_DEVICE, 9600, dsrdtr=False, timeout=5)
    currentSerial.write("SYSTem:REMote\n")
if CONTROLLER_ON:
    controllerSerial = serial.Serial(CONTROLLER_DEVICE, 9600, dsrdtr=False, timeout=5)
    controllerSerial.write("SYSTem:REMote\n")
if BK_ON:
    bk = dcload.DCLoad()
    bk.Initialize(BK_DEVICE, 9600)
    bk.SetRemoteControl()
    set_bk(0.0)
if RELAY_ON:
    relaySerial = serial.Serial(RELAY_DEVICE, 9600, dsrdtr=False, timeout=5)

startTime = time.time()

fout = None
def start_logging():
    global fout
    fout = open(OUTPUT_FILE, 'a+')
    print "wtf: %s"%fout

def done_logging():
    global fout
    fout.close()

def log(message):
    now = datetime.datetime.now()
    message = "%s: %s"%(now, message)
    print message
    fout.write(message + '\n')

'''
get_measurements
---------------
Returns (current, voltage)
'''
def get_measurements():
    voltageStr, currentStr = "0", "0"
    if VOLTAGE_ON:
        voltageSerial.write("MEAS:VOLT:DC? 10, 0.0001\n")
        voltageStr = voltageSerial.read(17)
    if CURRENT_ON:
        currentSerial.write("MEAS:CURR:DC? 3, 0.00001\n")
        currentStr = currentSerial.read(17)
    try:
        current = float(currentStr)
    except ValueError:
        current = 0
    try:
        voltage = float(voltageStr)
    except ValueError:
        voltage = 0

    # TODO: if voltage gets too low, set voltage as something and throw

    return current, voltage

class BatteryVoltageTooLowException(Exception):
    def __init__(self, voltage):
        self.voltage = voltage

    def __str__(self):
        return "Battery voltage is too low: %f V" % self.voltage

def log_data():
    fail_count = 0
    if CONTROLLER_ON:
        set_controller(0, 0)
    if BK_ON:
        print 'setting BK to %f in constant %s mode' % (DRAIN_VALUE, BK_MODE)
        set_bk(DRAIN_VALUE)
        
    while True:
        if fail_count > MAX_FAILURES:
            log('Too many (%d) consecutive failures occurred. Bailing.' % fail_count)
            break
        try:
            time.sleep(30)
            current, voltage = get_measurements()
            log('Got voltage: %f' % voltage)
            log('Got current: %f' % current)
            thetime = time.time() - startTime
            log("> %f,%f,%f" % (voltage, current, thetime))
            if voltage < MIN_BATT_VOLTAGE:
                raise BatteryVoltageTooLowException(voltage)

            make_everything_safe()
            time.sleep(1)
            current, voltage = get_measurements()
            log("= %f,%f,%f" % (voltage, current, thetime))
            if BK_ON:
                set_bk(DRAIN_VALUE)
            if voltage < MIN_BATT_VOLTAGE:
                raise BatteryVoltageTooLowException(voltage)
            fail_count = 0
        except Exception as e:
            log('A failure occurred: %s' % e)
            fail_count += 1
    make_everything_safe()
    time.sleep(10)
    current, voltage = get_measurements()
    log('Final voltage without sink: %f' % voltage)
    log('Final current: %f' % current)
    log("> %f,%f,%f" % (voltage, current, (time.time()-startTime)))

def set_controller(voltage, current):
    print 'setting controller at %f V and %f A' % (voltage, current)
    if voltage == 0 and current == 0:
        set_relay(False)
    else:
        set_relay(True)
    controllerSerial.write('VOLT %f\n' % voltage)
    controllerSerial.write('CURR %f\n' % current)

def set_charge_battery(voltage, current, until_voltage):
    print 'charging batt at %f V and %f A' % (voltage, current)
    fail_count = 0
    set_controller(voltage, current)
    time.sleep(CHARGE_LOW_TIME)
    while (True):
        if fail_count > MAX_FAILURES:
            print 'Too many (%d) consecutive failures occurred. Bailing.' % fail_count
            break
        try:
            m_current, ignore = get_measurements()
            make_everything_safe()
            time.sleep(CHARGE_LOW_TIME)
            ignore, m_voltage = get_measurements()
            print 'V=%f I=%f' % (m_voltage, m_current)
            if m_voltage > until_voltage:
                print 'reached %f - breaking out' % m_voltage
                break
            set_controller(voltage, current)
            time.sleep(CHARGE_HIGH_TIME)
        except Exception as e:
            print 'A failure occurred: %s' % e
            fail_count += 1
    set_controller(0,0)

def charge_battery():
    log('charging')
    set_charge_battery(MAX_BATT_VOLTAGE + 0.0, 1.0, MAX_BATT_VOLTAGE - 0.2)
    set_charge_battery(MAX_BATT_VOLTAGE + 0.1, 0.4, MAX_BATT_VOLTAGE - 0.1)
    set_charge_battery(MAX_BATT_VOLTAGE + 0.2, 0.2, MAX_BATT_VOLTAGE - 0.0)
    make_everything_safe()
    log('done charging!')

def make_everything_safe():
    if CONTROLLER_ON:
        set_controller(0.0, 0.0)
    if BK_ON:
        set_bk(0.0)
    if RELAY_ON:
        set_relay(False)
    

def show_help():
    print '---'
    print 'Commands are as follows'
    for cmd, desc in COMMANDS.items():
        print '{0}: {1}'.format(cmd, desc)
    print '---'

def handle_cmd(cmd):
    if cmd == 'help':
        show_help()

    elif cmd == 'log':
        log_data()

    elif cmd == 'charge':
        charge_battery()

    elif cmd == 'safe':
        make_everything_safe()

    elif cmd.startswith("iterate"):
        ncycles = int(cmd[len("iterate"):])
        for i in range(ncycles):
            log('Starting cycle %d of %d...'%(i+1, ncycles))
            make_everything_safe()
            charge_battery()
            make_everything_safe()
            log_data()
            make_everything_safe()
            log('Finished cycle %d of %d...'%(i+1, ncycles))

    else:
        print 'Command not recognised'

def set_relay(on):
    if on:
        relaySerial.write('0')
    else:
        relaySerial.write('1')

def main_loop():
    if len(sys.argv)==6:
        handle_cmd(sys.argv[5])

    while True:
        print 'Enter a command. Enter "help" if you don\'t know what you\'re doing'
        cmd = raw_input('> ')
        handle_cmd(cmd)


start_logging()
try:
    main_loop()
finally:
    done_logging()
    pass
