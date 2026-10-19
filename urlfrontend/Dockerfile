# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# If your frontend needs the API URL at build time, pass it in compose as a build arg
# ARG VITE_API_URL
# ENV VITE_API_URL=$VITE_API_URL
RUN npm run build          # Vite -> dist/ ; Create React App -> build/

# ---- serve ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]