# cache dependencies
FROM python:3.13 AS python_cache
RUN apt-get update && apt-get install libsasl2-dev python3-dev libldap2-dev libssl-dev slapd -y

FROM python_cache AS dependencies
ENV VIRTUAL_ENV=/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"
WORKDIR /cache/
COPY requirements.txt .
RUN python -m venv /venv
RUN pip install -r requirements.txt

# build and start
FROM python:3.13-slim AS build
EXPOSE 80
RUN apt-get update && apt-get install libldap-2.5.0 -y
RUN apt-get install -y \
    libldap2-dev \
    libsasl2-2 \
    libsasl2-dev \
    libssl3 \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV VIRTUAL_ENV=/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"
COPY --from=dependencies /venv /venv
COPY . .
RUN strawberry export-schema main > schema.graphql
ENTRYPOINT [ "./entrypoint.sh" ]
