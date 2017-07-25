import serial

ser = serial.Serial('/dev/ttyUSB0', 9600, dsrdtr=False, timeout=5)
ser.write('SYSTem:REMote\n')
ser.write('VOLT 4\n')
ser.write('CURR 0.1\n')
