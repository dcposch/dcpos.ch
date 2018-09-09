echo "RENEWING CERTS"
certbot certonly --standalone --agree-tos --non-interactive --email dcposch@dcpos.ch -d datpedia.org -d www.datpedia.org
certbot certonly --standalone --agree-tos --non-interactive --email dcposch@dcpos.ch -d scramble.io -d www.scramble.io
certbot certonly --standalone --agree-tos --non-interactive --email dcposch@dcpos.ch -d dcpos.ch -d p9.dcpos.ch -d blog.dcpos.ch -d www.dcpos.ch
certbot certonly --standalone --agree-tos --non-interactive --email dcposch@dcpos.ch -d batsign.al -d www.batsign.al
certbot certonly --standalone --agree-tos --non-interactive --email dcposch@dcpos.ch -d bazooka.city
echo "DONE"
