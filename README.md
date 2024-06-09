# school-management_smart-contract

RUN npm install
RUN npx hardhat compile
RUN npx prisma generate
RUN npx hardhat node
RUN npm run start

OPEN localhost:3000