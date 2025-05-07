// Using CommonJS require syntax for compatibility with ts-node in CommonJS mode
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "abdallamalik73i@gmail.com";
  const plainPassword = "1234567ASD";
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  
  // Create the user in the database
  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });
  
  console.log("User created successfully:", user);
}

main()
  .catch((error: any) => {
    console.error("Error creating user:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
