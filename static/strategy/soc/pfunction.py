from operator import itemgetter

from function import Function, weighted_average

'''
reslice_function
----------------
reslices the function's data into n data points
'''
def reslice_function(f, n):
    data = []
    for i in xrange(n-1):
        index = float(i * (len(f.data))) / float(n)
        pt1 = f.data[int(index)]
        pt2 = f.data[int(index) + 1]
        print 'pt1, pt2 = ', pt1, pt2
        weight = index - int(index)
        new_key = pt1[0] * (1 - weight) + pt2[0] * weight
        new_val = pt1[1] * (1 - weight) + pt2[1] * weight
        print 'weight = %d' % weight
        print 'nk, nv =', new_key, new_val
        data.append((new_key, new_val))
    data.append(f.data[len(f.data) - 1])
    return Function(data=data)

def merge_functions(f1, f2, weight):
    new_data = []
    for i in xrange(min(len(f1.data), len(f2.data))):
        new_data.append((
            f1.data[i][0] * (1 - weight) + f2.data[i][0] * weight,
            f1.data[i][1] * (1 - weight) + f2.data[i][1] * weight
        ))
    return Function(data=new_data)

class PFunction:
    '''
    data
    ----
    In format:
    [
        (paramval, [...]),
        (paramval, [...]),
        ...
    ]
    '''
    data = []

    def __init__(self, *args, **kwargs):
        if 'data' in kwargs:
            self.data = kwargs['data']
    
    def get_function(self, parameter):

        # find the appropriate set of data points

        lower_param = float("inf")
        upper_param = 0
        lower_data = []
        upper_data = []
        for d in self.data:
            print d
            if d[0] < lower_param:
                lower_param = d[0]
                lower_data = d[1]
            if d[0] > upper_param:
                upper_param = d[0]
                upper_data = d[1]

        print lower_data
        print upper_data

        # now split them into some sensible number of points

        num_points = max(len(lower_data), len(upper_data))
        lower_function = reslice_function(Function(data=lower_data), num_points)
        upper_function = reslice_function(Function(data=upper_data), num_points)

        lower_function.show()
        upper_function.show()
        
        return merge_functions(lower_function, upper_function,
                               (parameter - lower_param) / (upper_param - lower_param))

    def inverse(self, parameter):
        return self.get_function(parameter).inverse()
    
    def D(self, parameter, value):
        return self.get_function(parameter).D(value)

    def show(self):
        print self.data
        
    def interpolate(self, parameter, value):
        return self.get_function(parameter).interpolate(value)

pf = PFunction(data=[
    (0, [(0, 0), (1, 1), (2, 2)]),
    (1, [(0, 0), (1, 0.5), (2, 1), (3, 1.5)]),
])

print pf.interpolate(1, 0.5)
