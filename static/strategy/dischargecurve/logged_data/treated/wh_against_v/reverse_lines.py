import sys

fin = open("1A_%dC_treated.csv" % int(sys.argv[1]))

voltages = []
whs = []

while (True):
    l = fin.readline()
    if len(l) == 0:
        break
    spl = l.split(',')
    if spl[1] != "nan\n":
        whs.append(spl[0])
        voltages.append(spl[1])

fin.close()

voltages.reverse()

fout = open("1A_%dC_treated2.csv" % int(sys.argv[1]), 'w')

for i in xrange(len(voltages)):
    print i
    fout.write("%s,%s" % (whs[i], voltages[i]))

fout.close()
