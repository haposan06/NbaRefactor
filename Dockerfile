# Copyright (c) 2019 PACS-SRE

FROM node:8

WORKDIR /app
COPY . /app
RUN npm install
ENV JWT_KEY=Ww06GHAjI3Ed3ulYMnB9gfI7nrs9nb6e
ENV CLIENT_ID=ASDSADASD86868
ENV CLIENT_SECRET=ZZZZZZZ8768768768
ENV AUTHENTICATIONBASE_URI=http://localhost:8080/
ENV SOAP_BASE_URI=getData
RUN ["chmod", "+x", "/app/start_nba.sh"]
ENTRYPOINT ["/app/start_nba.sh"]
EXPOSE 3000