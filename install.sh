#!/bin/bash

set -e

DOMAIN="keyper.avantixlabs.com"
APP_PORT="5001"

echo "🚀 Installing NGINX and Certbot..."
apt update
apt install -y nginx certbot python3-certbot-nginx

echo "🌐 Configuring NGINX for $DOMAIN..."

# Create NGINX config
NGINX_CONF_PATH="/etc/nginx/sites-available/$DOMAIN"

cat > "$NGINX_CONF_PATH" <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable config
ln -sf "$NGINX_CONF_PATH" /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo "🔐 Requesting SSL certificate via Certbot..."
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m kemin@hubresolution.com

echo "🔄 Setting up auto-renewal..."
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet") | crontab -

echo "✅ Setup complete. Site is live at: https://$DOMAIN"
