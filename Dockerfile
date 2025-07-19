# Use official Node.js image
FROM node:18

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Expose the port your app runs on (adjust if needed)
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]
