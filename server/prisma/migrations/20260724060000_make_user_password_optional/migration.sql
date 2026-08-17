-- Better Auth stores credential hashes in the account table, not users.password.
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;
