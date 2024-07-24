# this is your base image
FROM nginx:latest

# Set the working directory
WORKDIR /usr/share/nginx/html

# copy your app code 
COPY . .

# expose/open up the port on your container so you can access your app 
EXPOSE 80

