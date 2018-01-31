FROM python:3.6.3-alpine3.6
MAINTAINER Vlad Lupoaie <vlupoaie@bitdefender.com>


##################### BEGIN INSTALLATION #####################

# configure image
RUN apk update \
        && apk upgrade \
        && apk add gcc \
        && apk add musl-dev \
	&& pip install --no-cache-dir \
		CherryPy==12.0.0 \
		Django==1.11.7 \
		SPARQLWrapper


##################### FINISHED INSTALLATION #####################

# run under a limited user
USER nobody

# expose listened ports
EXPOSE 8080

# set working directory to apps directory
WORKDIR /app/api

# start upload server
CMD ["python3.6", "runserver.py"]
