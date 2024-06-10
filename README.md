# school-management_smart-contract

# setup
npm install

# database setup / schema change
cp .env.development .env
npx prisma generate

# contract code change
npx hardhat compile

# run code
npx hardhat node
npx hardhat run scripts/deploy.cjs --network localhost
npm run api
npm run start

# port
OPEN localhost:8000