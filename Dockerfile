# this is your base image
FROM nginx:latest

# Remove the default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# copy your app code 
COPY . /usr/share/nginx/html

# expose/open up the port on your container so you can access your app 
EXPOSE 80

# Start Nginx when the container has started
CMD ["nginx", "-g", "daemon off;"]
