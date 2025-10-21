# Use nginx alpine for a lightweight container
FROM nginx:alpine

# Copy all web files to nginx's default serving directory
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY game.js /usr/share/nginx/html/

# Keep the old single-file version as backup
COPY "Aquarium Tycoon — v261.html" /usr/share/nginx/html/legacy.html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# nginx alpine image already has a CMD to start nginx
# No need to specify CMD
