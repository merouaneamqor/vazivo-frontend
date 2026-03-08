FROM node:22-alpine

# Install dependencies for node-gyp
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files including lock file
COPY package.json package-lock.json ./

# Install exact versions from lock file
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Remove any cached build files
RUN rm -rf .next

# Expose port
EXPOSE 3001

# Start development server
CMD ["npm", "run", "dev"]
