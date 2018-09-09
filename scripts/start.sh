echo "Starting dat"
screen -S dat -d -m dat share /srv/http/dcpos.ch/static

echo "Starting p9"
(cd gl && screen -S p9 -d -m node src/server/ --config ~/p9/config.json)

echo "Done"
