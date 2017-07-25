from function import Function

fin = open("in.csv")
fout = open("out.csv", 'w')

# in = soc(wh), voltage_actual

data = []

min_v = float("inf")
max_v = 0
min_wh = float("inf")
max_wh = 0

while (True):
    l = fin.readline()
    if len(l) == 0:
        break
    spl = l.split(',')
    try:
        if spl[0].strip() != "nan" and spl[1].strip() != "nan":
            wh = float(spl[0].strip())
            v = float(spl[1].strip())
            min_v = min(min_v, v)
            max_v = max(max_v, v)
            min_wh = min(min_wh, wh)
            max_wh = max(max_wh, wh)
            data.append((v,wh))
    except Exception, e:
        print "An exception occurred: " + str(e)
        print "It's probably ok"

f = Function(data=data)

for i in xrange(len(data)):
    v = data[i][0]
    wh = data[i][1]
    data[i] = (v, (wh - min_wh) / (max_wh - min_wh))

SPACING = (max_v - min_v) / 100

fout.write('[\n')

v = min_v
while v <= max_v:
    interpolated_wh = f.interpolate(v)
    fout.write("{%d,%d},\n" % (int(v*1000000), int(interpolated_wh*1000000)))
    v += SPACING

fout.write(']\n')
fout.write('[\n')

SPACING = (max_v - min_v) / 10000

last_v = min_v
last_wh = f.interpolate(min_v)
max_delta_v = 0
max_delta_wh = 0
min_delta_v = float("inf")
min_delta_wh = float("inf")
v = min_v

cum_v = last_v
cum_wh = last_wh

while v <= max_v:
    interpolated_wh = f.interpolate(v)
    delta_v = v - last_v
    delta_wh = interpolated_wh - last_wh
    if delta_v > 0 and delta_wh > 0:
        fout.write("{%d,%d},\n" % (int(delta_v*100000), int(delta_wh*1000000)))
        cum_v += delta_v
        cum_wh += delta_wh
        last_v = v
        last_wh = interpolated_wh
        max_delta_v = max(max_delta_v, delta_v)
        max_delta_wh = max(max_delta_wh, delta_wh)
        min_delta_v = min(min_delta_v, delta_v)
        min_delta_wh = min(min_delta_wh, delta_wh)
    v += SPACING

fout.write(']\n')

fin.close()
fout.close()

print cum_v
print cum_wh

print int(max_delta_v*100000)
print int(max_delta_wh*100000)
print int(min_delta_v*100000)
print int(min_delta_wh*100000)
