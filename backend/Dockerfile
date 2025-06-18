# Chuẩn bị môi trường node js, version 18
FROM node:18-alpine
 
# Set the working directory inside the container
WORKDIR /tourbooking/backend
 
# Copy package.json and package-lock.json
COPY package*.json ./
 
# Install dependencies
RUN npm install
 

# Copy the rest of your application files
COPY . .
 
 
# Define the command to run your app
CMD ["npm", "run", "dev"]