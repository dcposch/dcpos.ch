import dcload

LOAD_PORT = '/dev/ttyUSB1'

load = dcload.DCLoad()
load.Initialize(LOAD_PORT, 9600)
load.SetRemoteControl()
load.SetMaxPower(2)
load.SetCWPower(1)
