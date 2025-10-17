# 🚀 Deployment Guide

Complete guide for deploying Umuhuza backend to production.

---

## 📋 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Security review completed
- [ ] Environment variables configured
- [ ] Database backups set up
- [ ] SSL certificate ready
- [ ] Domain name configured
- [ ] Monitoring tools ready
- [ ] Email service configured
- [ ] SMS service configured
- [ ] Payment gateway configured

---

## 🏗️ Deployment Options

### Option 1: Railway.app (Recommended for Beginners)

**Pros:** Easy setup, managed PostgreSQL, automatic deployments  
**Cons:** Can be expensive at scale  
**Cost:** ~$5-20/month

#### Steps:

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Add PostgreSQL**
   - Click "New"
   - Select "PostgreSQL"
   - Note the connection URL

4. **Configure Environment Variables**
   ```
   DEBUG=False
   SECRET_KEY=<generate-strong-key>
   DATABASE_URL=<from-railway-postgres>
   ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   ```

5. **Deploy**
   - Railway automatically deploys on git push
   - Monitor logs in Railway dashboard

### Option 2: DigitalOcean App Platform

**Pros:** Good balance of control and ease  
**Cons:** Requires some configuration  
**Cost:** ~$12-25/month

#### Steps:

1. **Create DigitalOcean Account**
2. **Create App**
   - Go to Apps
   - Connect GitHub repository
   - Select branch

3. **Configure Build Settings**
   ```yaml
   # app.yaml
   name: umuhuza-backend
   region: fra
   services:
   - name: web
     environment_slug: python
     github:
       repo: yourusername/umuhuza-backend
       branch: main
     build_command: pip install -r requirements.txt && python manage.py collectstatic --no-input
     run_command: gunicorn --workers 2 umuhuza_api.wsgi:application
     envs:
     - key: DEBUG
       value: "False"
     http_port: 8080
   databases:
   - name: db
     engine: PG
     version: "15"
   ```

4. **Add Managed Database**
   - Create PostgreSQL database
   - Connect to app

5. **Deploy**
   - Click "Deploy App"

### Option 3: AWS EC2 (Full Control)

**Pros:** Full control, scalable  
**Cons:** Complex setup, requires DevOps knowledge  
**Cost:** Variable, ~$10-50/month+

#### Steps (Ubuntu):

1. **Launch EC2 Instance**
   ```bash
   # Choose Ubuntu 22.04 LTS
   # t2.small minimum (2GB RAM)
   ```

2. **SSH into Server**
   ```bash
   ssh -i your-key.pem ubuntu@your-ip
   ```

3. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install python3-pip python3-dev libpq-dev postgresql nginx
   ```

4. **Clone Repository**
   ```bash
   cd /var/www
   sudo git clone https://github.com/yourusername/umuhuza-backend.git
   cd umuhuza-backend/backend
   ```

5. **Setup Virtual Environment**
   ```bash
   sudo python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   pip install gunicorn
   ```

6. **Configure PostgreSQL**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE umuhuza;
   CREATE USER umuhuza_admin WITH PASSWORD 'strong_password_here';
   GRANT ALL PRIVILEGES ON DATABASE umuhuza TO umuhuza_admin;
   \q
   ```

7. **Configure Environment**
   ```bash
   sudo nano .env
   # Add production values
   ```

8. **Run Migrations**
   ```bash
   python manage.py migrate
   python manage.py collectstatic
   ```

9. **Setup Gunicorn Service**
   ```bash
   sudo nano /etc/systemd/system/gunicorn.service
   ```
   
   **Add:**
   ```ini
   [Unit]
   Description=Gunicorn daemon for Umuhuza
   After=network.target

   [Service]
   User=ubuntu
   Group=www-data
   WorkingDirectory=/var/www/umuhuza-backend/backend
   Environment="PATH=/var/www/umuhuza-backend/backend/venv/bin"
   ExecStart=/var/www/umuhuza-backend/backend/venv/bin/gunicorn \
             --workers 3 \
             --bind unix:/var/www/umuhuza-backend/backend/gunicorn.sock \
             umuhuza_api.wsgi:application

   [Install]
   WantedBy=multi-user.target
   ```

   **Enable and Start:**
   ```bash
   sudo systemctl start gunicorn
   sudo systemctl enable gunicorn
   sudo systemctl status gunicorn
   ```

10. **Configure Nginx**
    ```bash
    sudo nano /etc/nginx/sites-available/umuhuza
    ```
    
    **Add:**
    ```nginx
    server {
        listen 80;
        server_name api.yourdomain.com;

        location = /favicon.ico { access_log off; log_not_found off; }
        
        location /static/ {
            alias /var/www/umuhuza-backend/backend/staticfiles/;
        }

        location /media/ {
            alias /var/www/umuhuza-backend/backend/media/;
        }

        location / {
            include proxy_params;
            proxy_pass http://unix:/var/www/umuhuza-backend/backend/gunicorn.sock;
        }
    }
    ```

    **Enable Site:**
    ```bash
    sudo ln -s /etc/nginx/sites-available/umuhuza /etc/nginx/sites-enabled
    sudo nginx -t
    sudo systemctl restart nginx
    ```

11. **Setup SSL with Let's Encrypt**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d api.yourdomain.com
    ```

12. **Setup Firewall**
    ```bash
    sudo ufw allow 'Nginx Full'
    sudo ufw allow OpenSSH
    sudo ufw enable
    ```

---

## ⚙️ Production Configuration

### settings.py for Production

**Update `umuhuza_api/settings.py`:**

```python
# Production settings
DEBUG = False

ALLOWED_HOSTS = ['api.yourdomain.com', 'yourdomain.com', 'www.yourdomain.com']

# Security
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# CORS for production frontend
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]

# Database (use DATABASE_URL)
import dj_database_url
DATABASES = {
    'default': dj_database_url.config(
        default=config('DATABASE_URL'),
        conn_max_age=600
    )
}

# Static files (use S3 or similar)
AWS_ACCESS_KEY_ID = config('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = config('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = config('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = config('AWS_S3_REGION_NAME', default='us-east-1')
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
AWS_DEFAULT_ACL = 'public-read'

DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
STATICFILES_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'

STATIC_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/static/'
MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'

# Email
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='smtp.sendgrid.net')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@yourdomain.com')

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': '/var/log/umuhuza/django.log',
        },
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'ERROR',
            'propagate': True,
        },
    },
}
```

### Production Environment Variables

**Create production `.env`:**

```env
# Django
DEBUG=False
SECRET_KEY=<use-django-secret-key-generator>
ALLOWED_HOSTS=api.yourdomain.com,yourdomain.com,www.yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# AWS S3 (for file storage)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_STORAGE_BUCKET_NAME=umuhuza-media
AWS_S3_REGION_NAME=us-east-1

# Email (SendGrid)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=SG.xxx
DEFAULT_FROM_EMAIL=noreply@yourdomain.com

# SMS (Africa's Talking)
AFRICASTALKING_USERNAME=sandbox
AFRICASTALKING_API_KEY=your_api_key

# Payment (Lumicash)
LUMICASH_API_KEY=your_key
LUMICASH_SECRET=your_secret
LUMICASH_CALLBACK_URL=https://api.yourdomain.com/api/payments/callback/

# Redis (for Celery)
REDIS_URL=redis://localhost:6379/0

# Sentry (Error Tracking)
SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 🗄️ Database Management

### Backup Strategy

**Automated Daily Backups:**

```bash
# Create backup script
sudo nano /usr/local/bin/backup_db.sh
```

**Add:**
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/umuhuza"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U umuhuza_admin -h localhost umuhuza > $BACKUP_DIR/db_$DATE.sql

# Compress
gzip $BACKUP_DIR/db_$DATE.sql

# Delete backups older than 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

**Make executable:**
```bash
sudo chmod +x /usr/local/bin/backup_db.sh
```

**Setup Cron Job:**
```bash
sudo crontab -e
```

**Add:**
```
0 2 * * * /usr/local/bin/backup_db.sh >> /var/log/umuhuza/backup.log 2>&1
```

### Database Migrations

**Production migration workflow:**

```bash
# 1. Backup database first
pg_dump -U umuhuza_admin umuhuza > backup_before_migration.sql

# 2. Test migrations locally
python manage.py migrate --plan

# 3. Apply migrations
python manage.py migrate

# 4. Verify
python manage.py showmigrations

# 5. If issues, rollback
# python manage.py migrate app_name previous_migration_number
```

---

## 📊 Monitoring & Logging

### Setup Sentry (Error Tracking)

1. **Install Sentry SDK**
   ```bash
   pip install sentry-sdk
   ```

2. **Configure in settings.py**
   ```python
   import sentry_sdk
   from sentry_sdk.integrations.django import DjangoIntegration

   sentry_sdk.init(
       dsn=config('SENTRY_DSN'),
       integrations=[DjangoIntegration()],
       traces_sample_rate=0.1,
       send_default_pii=True
   )
   ```

### Setup Log Rotation

```bash
sudo nano /etc/logrotate.d/umuhuza
```

**Add:**
```
/var/log/umuhuza/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 ubuntu ubuntu
    sharedscripts
    postrotate
        systemctl reload gunicorn
    endscript
}
```

### System Monitoring

**Setup monitoring with htop:**
```bash
sudo apt install htop
htop
```

**Monitor logs:**
```bash
# Django logs
tail -f /var/log/umuhuza/django.log

# Nginx access
tail -f /var/log/nginx/access.log

# Nginx errors
tail -f /var/log/nginx/error.log

# Gunicorn
sudo journalctl -u gunicorn -f
```

---

## 🔐 Security Best Practices

### 1. Secret Key Generation

```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

### 2. Database Security

```sql
-- Restrict permissions
REVOKE ALL ON DATABASE umuhuza FROM PUBLIC;
GRANT CONNECT ON DATABASE umuhuza TO umuhuza_admin;

-- Use SSL
ALTER SYSTEM SET ssl = on;
```

### 3. Rate Limiting

**Install django-ratelimit:**
```bash
pip install django-ratelimit
```

**Add to views:**
```python
from django_ratelimit.decorators import ratelimit

@ratelimit(key='ip', rate='5/m', method='POST')
@api_view(['POST'])
def login_view(request):
    # ...
```

### 4. Security Headers

**Add to settings.py:**
```python
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
```

### 5. Update Dependencies Regularly

```bash
pip list --outdated
pip install --upgrade package_name
```

---

## 🚀 Performance Optimization

### 1. Database Query Optimization

```python
# Use select_related for foreign keys
Listing.objects.select_related('userid', 'cat_id').all()

# Use prefetch_related for many-to-many
Listing.objects.prefetch_related('images').all()

# Add database indexes (already done in models)
```

### 2. Caching with Redis

**Install:**
```bash
pip install django-redis
```

**Configure:**
```python
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': config('REDIS_URL'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}
```

**Use in views:**
```python
from django.views.decorators.cache import cache_page

@cache_page(60 * 15)  # Cache for 15 minutes
@api_view(['GET'])
def listing_list(request):
    # ...
```

### 3. Image Optimization

Already implemented in `upload_listing_image` view:
- Resize large images
- Convert to JPEG
- Compress with quality=85

### 4. Gunicorn Workers

**Formula:** `workers = (2 x CPU cores) + 1`

For 2 CPU cores:
```bash
gunicorn --workers 5 --bind 0.0.0.0:8000 umuhuza_api.wsgi:application
```

---

## 📱 CDN Setup (Cloudflare)

### Benefits:
- Faster content delivery
- DDoS protection
- Free SSL
- Caching

### Setup:

1. **Sign up at Cloudflare**
2. **Add your domain**
3. **Update nameservers** at domain registrar
4. **Configure SSL:** Full (strict)
5. **Enable Auto Minify** (JS, CSS, HTML)
6. **Set Caching Level:** Standard
7. **Page Rules:**
   ```
   api.yourdomain.com/media/*
   Cache Level: Cache Everything
   Edge Cache TTL: 1 month
   ```

---

## 🔄 Continuous Deployment

### Setup GitHub Actions

**Create `.github/workflows/deploy.yml`:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/umuhuza-backend
          git pull origin main
          source backend/venv/bin/activate
          pip install -r backend/requirements.txt
          python backend/manage.py migrate
          python backend/manage.py collectstatic --no-input
          sudo systemctl restart gunicorn
          sudo systemctl reload nginx
```

**Add secrets to GitHub:**
- `HOST`: Your server IP
- `USERNAME`: SSH username
- `SSH_KEY`: Private SSH key

---

## ✅ Post-Deployment Checklist

- [ ] SSL certificate installed and working
- [ ] Database migrations applied
- [ ] Static files served correctly
- [ ] Media uploads working
- [ ] Email sending working
- [ ] SMS sending working (if configured)
- [ ] Payment gateway working (if configured)
- [ ] All API endpoints responding
- [ ] Error pages (404, 500) styled
- [ ] Monitoring tools active
- [ ] Backup system running
- [ ] Security headers configured
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] Log rotation configured
- [ ] Documentation updated
- [ ] Team notified

---

## 🆘 Troubleshooting

### Issue: 502 Bad Gateway

**Check:**
```bash
sudo systemctl status gunicorn
sudo journalctl -u gunicorn -n 50
```

**Fix:**
```bash
sudo systemctl restart gunicorn
sudo systemctl restart nginx
```

### Issue: Database Connection Error

**Check:**
```bash
sudo -u postgres psql
\l  # List databases
\du  # List users
```

**Test connection:**
```bash
psql -U umuhuza_admin -d umuhuza -h localhost
```

### Issue: Static Files Not Loading

**Collect static files:**
```bash
python manage.py collectstatic --no-input
```

**Check Nginx config:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Issue: High Memory Usage

**Check processes:**
```bash
htop
```

**Reduce Gunicorn workers:**
```bash
sudo nano /etc/systemd/system/gunicorn.service
# Change --workers to lower number
sudo systemctl daemon-reload
sudo systemctl restart gunicorn
```

---

## 📞 Support & Resources

- **Django Deployment:** https://docs.djangoproject.com/en/5.0/howto/deployment/
- **Gunicorn Docs:** https://docs.gunicorn.org/
- **Nginx Docs:** https://nginx.org/en/docs/
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---

**Deployment Complete! 🎉**

Your Umuhuza backend is now live in production!