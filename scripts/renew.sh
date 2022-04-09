set -e

echo "STOPPING NGINX"
service nginx stop

echo "RENEWING CERTS"
certbot certonly --standalone --agree-tos --non-interactive --email dcposch@dcpos.ch -d datpedia.org -d www.datpedia.org
certbot certonly --standalone --agree-tos --non-interactive --email dcposch@dcpos.ch -d scramble.io -d www.scramble.io
certbot certonly --standalone --agree-tos --non-interactive --email dcposch@dcpos.ch -d dcpos.ch -d p9.dcpos.ch

echo "STARTING NGINX"
service nginx start

echo "DONE"
