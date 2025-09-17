#!/bin/bash

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
-keyout nginx/private/localhost.key \
-out nginx/certs/localhost.crt \
-subj "/CN=localhost"
