FROM node:current-slim

# Copy source
COPY ./build /app
COPY ./src/server.js /app 

# Install express into the container 
RUN cd /app; npm install express 

# This is 8081 we may put it in an environment variable later
EXPOSE 8081

#Run the application
CMD cd /app && node ./server.js