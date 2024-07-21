# this is your base image
FROM nginx:latest

# we set the working dir in yourr container
# WORKDIR /usr/src/App
WORKDIR /play-hangman

# Copy custom nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# copy your app code 
COPY . .

# expose/open up the port on your container so you can access your app 
EXPOSE 5000

