#!/usr/bin/env python
import sys
from time import *
from datetime import *
import exceptions
from math import *

import matplotlib as mpl
import matplotlib.pyplot as plt
import numpy as np

def read_csv(filename, **args):
    headers = "headers" in args and args["headers"] or None 
    delim = "delim" in args and args["delim"] or ','
    lambdas = "lambdas" in args and args["lambdas"] or None 

    with open(filename, "r") as f:
        if not headers:
            headers = map(lambda part: part.strip().lower(), f.readline().split(delim))
        if not lambdas:
            lambdas = [None]*len(headers)
        series = [[] for i in range(len(headers))]

        for line in f:
            parts = line.split(delim)
            assert len(parts)==len(headers)
            
            for i in range(len(parts)):
                val = parts[i].strip()
                if not lambdas[i]:
                    try:
                        lambdas[i] = lambda x: (x.startswith('"') and x.endswith('"')) and x[1:-1] or x
                        float(val)
                        lambdas[i] = lambda x: float(x)
                        int(val)
                        lambdas[i] = lambda x: int(x)
                    except exceptions.ValueError:
                        pass
                val = lambdas[i](val)
                series[i].append(val)
        print(len(series[0]))

        ret = {}
        for i in range(len(headers)):
            ret[headers[i]] = series[i]
        return ret

date_explain = """
%a  Locale abbreviated weekday name.   
%A  Locale full weekday name.  
%b  Locale abbreviated month name.     
%B  Locale full month name.    
%c  Locale appropriate date and time representation.   
%d  Day of the month as a decimal number [01,31].    
%f  Microsecond as a decimal number [0,999999], zero-padded on the left (1)
%H  Hour (24-hour clock) as a decimal number [00,23].    
%I  Hour (12-hour clock) as a decimal number [01,12].    
%j  Day of the year as a decimal number [001,366].   
%m  Month as a decimal number [01,12].   
%M  Minute as a decimal number [00,59].  
%p  Locales equivalent of either AM or PM. (2)
%S  Second as a decimal number [00,61]. (3)
%U  Week number of the year (Sunday as the first day of the week) as a decimal number [00,53]. All days in a new year preceding the first Sunday are considered to be in week 0.    (4)
%w  Weekday as a decimal number [0(Sunday),6].   
%W  Week number of the year (Monday as the first day of the week) as a decimal number [00,53]. All days in a new year preceding the first Monday are considered to be in week 0.    (4)
%x  Locales appropriate date representation.    
%X  Locales appropriate time representation.    
%y  Year without century as a decimal number [00,99].    
%Y  Year with century as a decimal number.   
%z  UTC offset in the form +HHMM or -HHMM (empty string if the the object is naive).    (5)
%Z  Time zone name (empty string if the object is naive).
"""
def ui_get_time_parser(header, vals):
    val = vals[0]
    numval = try_parse_float(val) 
    if numval==None:
        formats = ["%Y%m%d %H:%M:%S.%f", "%Y%m%dT%H:%M:%S.%f", "%Y%m%d %H:%M:%S", "%Y%m%dT%H:%M:%S"]
        for form in formats:
            if try_parse_date(val, form):
                return lambda x: try_parse_date(x, form)
    elif numval > 10000000*3600*24*1900:
        #this is a .NET timestamp, 100-nanosec "ticks" since the 01/01/0001
        return lambda x: datetime.utcfromtimestamp(long(x) / 10000000 - ((1969*365 + 477)*24*3600))
    elif numval > 20*365*24*3600 and numval < 200*365*24*3600:
        #this is likely a Unix timestamp, secs since 1/1/1970
        return lambda x: datetime.utcfromtimestamp(float(x))
    else:
        print date_explain
        return input("No idea how to parse this date: %s > %s, %s, ..."%(header,vals[0],vals[1])) 

def try_parse_float(val):
    try:
        return float(val)
    except ValueError:
        return None

def try_parse_date(datestr, dateformat):
    try:
        return datetime.strptime(datestr, dateformat)
    except ValueError:
        return None

def series_normalize_time(series):
    ret = {}
    headers = list(series.keys())
    for header in headers:
        if header=="time" or header=="timestamp" or header=="date" or header=="datetime":
            parser = ui_get_time_parser(header, series[header])
            ret["timestamp"] = map(parser, series[header])
        else:
            ret[header] = series[header]
    if not "timestamp" in ret:
        header = raw_input("Get timestamp column name %s: "%headers)
        parser = ui_get_time_parser(header, series[header])
        ret["timestamp"] = map(parser, series[header])

    timebase = series['timestamp']
    ret['seconds'] = [0]
    for i in range(len(timebase)-1):
        #dt = (timebase[i+1]-timebase[i]).total_seconds()
        dt = (timebase[i+1]-timebase[0])/10000000.0
        ret['seconds'].append(dt) 

    return ret

def derivative(nums):
    ret = [0]
    for i in range(len(nums)-1):
        diff = nums[i+1]-nums[i]
        if diff is timedelta:
            diff = diff.total_seconds()
        ret.append(diff)
    return ret

def stats(nums):
    sigma = 0
    ssigma = 0
    for num in nums:
        sigma += num
        ssigma += num*num
    return (sigma/len(nums), sqrt(ssigma/len(nums)))

def stats(nums):
    snums = sorted(nums)
    n = len(snums)
    return (snums[n/4], snums[n/2], snums[3*n/4])

eps = 1e-30
def avg(vals):
    return sum(vals)/(len(vals)+eps)

#treat clusters of vals arriving within 1/10 of a second as arriving simult.
time_thresh = 0.1 
def time_combine(*timevectors):
    #combine all the times into a single array, then sort them
    times = sorted(sum(timevectors, []))
    print "Combining %d time vecs, total of %d times..."%(len(timevectors), len(times))

    #now go thru that array, combining clusters of very closely spaced times into one
    newtimes = []
    curtimes = [times[0]]
    for time in times:
        if time-min(curtimes) < time_thresh:
            curtimes.append(time)
        else:
            newtimes.append(avg(curtimes))
            curtimes = [time]
    newtimes.append((min(curtimes)+max(curtimes))/2)

    print "Combined %d time vecs, total of %d times into %d times"%(len(timevectors), len(times), len(newtimes))
    return newtimes

def time_snap(vals, times, timebase):
    newtimes = []
    ix = 0
    for time in times:
        while (time-timebase[ix])>(time_thresh/2+eps):
            ix += 1
        newtimes.append(timebase[ix])
    return newtimes

# Takes a list of values corresponding to times.
# Returns an approx of the same function, evaluated 
# at different times (timebase) using linear interp.
def time_interpolate(vals, times, timebase):
    newvals = [] 
    ix = 0
    for t in timebase:
        if ix < len(times) and t < times[ix]:
            newvals.append(vals[ix])
        else:
            while ix < len(times) and times[ix] < t :
                ix += 1
            if ix >= len(times): 
                newvals.append(vals[-1])
            else:
                u = (t - times[ix-1]) / (times[ix] - times[ix-1])
                newvals.append(vals[ix]*u + vals[ix-1]*(1-u))

    assert len(newvals) == len(timebase)
    return newvals

def series_filter(series, col, fun):
    newseries = {}
    for key in series.keys():
        newseries[key] = []
    vec = series[col]
    for i in range(len(vec)):
        if fun(vec[i]):
            for key in series.keys():
                newseries[key].append(series[key][i])
    return newseries


