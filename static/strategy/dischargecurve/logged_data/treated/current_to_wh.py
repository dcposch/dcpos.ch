import sys

AVERAGE_CURRENT = 1.00027111205

from function import Function

# first read 1A_25C.csv to get voltage_drain -> voltage_actual
# in = time, voltage_drain, voltage_actual, "0"

data = []
cur_time = 0
cur_voltage_drain = 0
cur_voltage_actual = 0
last_time = -1
total_wh = 0

fin = open("1A_%dC.csv" % int(sys.argv[1]))
fout = open("1A_%dC_treated.csv" % int(sys.argv[1]), 'w')
fout.write("total_wh, voltage_actual\n")

while (True):
    l = fin.readline()
    if len(l) == 0:
        break
    spl = l.split(',')
    try:
        time = float(spl[0])

        if float('0'+spl[1]) > 0:
            cur_voltage_drain = float(spl[1])
            if last_time > 0:
                total_wh += (time - last_time) * cur_voltage_drain * AVERAGE_CURRENT / 3600
            last_time = time
        if float('0'+spl[2]) > 0:
            cur_voltage_actual = float(spl[2])
            fout.write("%f,%f\n" % (total_wh, cur_voltage_actual))
        t = 0
        if float('0'+spl[3].strip()) > 0:
            t = float(spl[3].strip())

        if t == cur_time and cur_voltage_drain > 0 and cur_voltage_actual > 0:
            data.append((cur_voltage_drain, cur_voltage_actual))

        cur_time = t
    except Exception, e:
        print "An exception occurred: " + str(e)
        print "It's probably ok"

fin.close()
fout.close()

exit(0)

f = Function(data=data)

fo = open("function.csv", 'w')

for d in data:
    fo.write("%f,%f\n" % (d[0],d[1]))

fo.close()

exit(0)

# now read in 1A.csv to get voltage_actual against wh
# in = time, voltage_drain, current

last_time = 0
total_wh = 0

fin = open("1A.csv")
fout = open("1A_treated.csv", 'w')
fout.write("total_wh, voltage_actual\n")
while (True):
    l = fin.readline()
    if len(l) == 0:
        break
    spl = l.split(',')
    try:
        time = float(spl[0])
        voltage_drain = float(spl[1])
        current = float(spl[2])
        total_wh += (time - last_time) * voltage_drain * current / 3600
        last_time = time

        fout.write("%f,%f\n" % (total_wh, f.interpolate(voltage_drain)))
    except Exception, e:
        print "An exception occurred: " + str(e)
        print "It's probably ok"

fin.close()
fout.close()
