from function import Function

class KalmanFilter:
    f = Function()
    h = Function()
    x = 0
    P = 0
    
    def __init__(self, *args, **kwargs):
        if 'f' in kwargs: self.f = kwargs['f']
        if 'h' in kwargs: self.h = kwargs['h']
        if 'x' in kwargs: self.x = kwargs['x']
        if 'P' in kwargs: self.P = kwargs['P']

    def predict(self, Q):
        xhat = self.f.interpolate(self.x)
        P = self.f.D(self.x) * self.P * self.f.D(self.x) + Q
        return xhat, P
    
    def update(self, xhat, P, z, R):
        H = self.h.D(xhat)
        ytilde = z - self.h.interpolate(xhat)
        S = H * P * H + R
        K = P * H / S
        xhat_new = xhat + K * ytilde
        P_new = (1 - K * H) * P
        return xhat_new, P_new

k = KalmanFilter(
    f = Function(data=[(0,0),(1,3),(2,1)]),
    h = Function(data=[(-100,-100), (100,100)]),
    x = 1,
    P = 0.1,
)
xhat, P = k.predict(0.1)
print (xhat, P)
print k.update(xhat, P, 5, 0.1)
