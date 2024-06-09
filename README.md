# school-management_smart-contract

RUN npm install
RUN npx hardhat compile
RUN npx hardhat node
RUN node src/js/server.js

OPEN localhost:3000