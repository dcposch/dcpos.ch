import sys

assert (len(sys.argv) == 3)
fin = open(sys.argv[1])
fout = open(sys.argv[2], 'w')

fout.write("time,voltage_drain,voltage_actual,current\n");

while (True):
    l = fin.readline()
    if len(l) == 0:
        break
    if len(l) < len("2011-09-06 16:47:40.596005: ") + 1:
        continue
    line = l[len("2011-09-06 16:47:40.596005: "):]
    if line[0] == '>' or line[0] == '=':
        values = line[2:].split(',')
        try:
            v, i, t = float(values[0]), float(values[1]), float(values[2])
            if line[0] == '>':
                fout.write("%f,%f,,%f\n" % (t, v, i))
            else:
                fout.write("%f,,%f,%f\n" % (t, v, i))
        except ValueError:
            continue
        
