import sys

# read in 1A.csv to get avg curr
# in = time, voltage_drain, current

last_time = 0
total_wh = 0

currents = []

fin = open("1A.csv")
while (True):
    l = fin.readline()
    if len(l) == 0:
        break
    spl = l.split(',')
    try:
        time = float(spl[0])
        voltage_drain = float(spl[1])
        current = float(spl[2])
        currents.append(current)

    except Exception, e:
        print "An exception occurred: " + str(e)
        print "It's probably ok"

print sum(currents) / len(currents)

fin.close()
