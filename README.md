# school-management_smart-contract

# setup
RUN npm install

# database setup / schema change
RUN npx prisma generate

# contract code change
RUN npx hardhat compile

# run code
RUN npx hardhat node
npx hardhat run scripts/deploy.cjs --network localhost
RUN npm run api
RUN npm run start

# port
OPEN localhost:8000