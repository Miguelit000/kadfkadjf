# Etapa 1: Construcción (Descarga librerías y compila el proyecto)
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: Ejecución (Prepara el servidor para arrancar)
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Exponemos el puerto 8080 que usa Spring Boot
EXPOSE 8080

# Comando final para iniciar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]