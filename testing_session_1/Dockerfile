FROM node:current-slim

# Copy source
COPY ./build /app
COPY ./src/server.js /app 

# This is 8081 we may put it in an environment variable later
EXPOSE 8081

#Run the application
CMD cd /app && node ./server.js