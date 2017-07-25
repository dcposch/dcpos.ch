from operator import itemgetter

def gradient(pt1, pt2):
    try:
        return float(pt2[1]-pt1[1])/float(pt2[0]-pt1[0])
    except ZeroDivisionError:
        return float("inf")

def weighted_average(pt1, pt2, value):
    dist = float(pt2[0] - pt1[0])
    value = float(value)
    return pt1[1] * (pt2[0] - value) / dist + pt2[1] * (value - pt1[0]) / dist

class Function:
    data = []

    def __init__(self, *args, **kwargs):
        if 'data' in kwargs:
            self.data = kwargs['data']
    
    def inverse(self):
        return Function(data=[(tuple[1],tuple[0]) for tuple in self.data])
    
    def D(self, value):
        first_point = (float("inf"),float("inf"))
        last_point = (float("inf"),float("inf"))
        for point in sorted(self.data, key=itemgetter(0)):
            if point[0] > value:
                last_point = point
                return gradient(first_point, last_point)
            else:
                first_point = point
        return gradient(first_point, last_point)

    def show(self):
        print self.data
        
    def interpolate(self, value):
        first_point = (float("inf"),float("inf"))
        last_point = (float("inf"),float("inf"))
        for point in sorted(self.data, key=itemgetter(0)):
            if point[0] > value:
                last_point = point
                return weighted_average(first_point, last_point, value)
            else:
                first_point = point
        return weighted_average(first_point, last_point, value)