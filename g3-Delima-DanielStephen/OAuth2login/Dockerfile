# ---------- Build Stage ----------
FROM maven:3.9.6-eclipse-temurin-21 AS build

# Set working directory inside the container
WORKDIR /app

# Copy the Maven project files to the container
COPY OAuth2login/pom.xml
COPY OAuth2login/src ./src

# Download dependencies and build the project
RUN mvn clean package -DskipTests

# ---------- Run Stage ----------
FROM eclipse-temurin:21-jre-alpine AS runtime

# Set working directory
WORKDIR /app

# Copy the JAR file from the build stage

COPY --from=build /app/target/*.jar app.jar

# Expose the port Spring Boot runs on
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
