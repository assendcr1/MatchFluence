FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY BackendAPI/BackendAPI.csproj BackendAPI/
RUN dotnet restore BackendAPI/BackendAPI.csproj

COPY BackendAPI/ BackendAPI/
RUN dotnet publish BackendAPI/BackendAPI.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:${PORT:-8080}
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

ENTRYPOINT ["dotnet", "BackendAPI.dll"]
