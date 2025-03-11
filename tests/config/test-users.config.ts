import path from "path";

// Base path for auth storage files
const authStoragePath = path.join(__dirname, "../../playwright/.auth");

// Define all test users with their credentials and storage paths
export const testUsers = {
  employee: {
    email: "employeeTestUser@example.com",
    password: "test-password123@",
    role: "employee",
    storageState: path.join(authStoragePath, "employeeUser.json"),
  },
  admin: {
    email: "adminTestUser@example.com",
    password: "test-password123@",
    role: "admin",
    storageState: path.join(authStoragePath, "adminUser.json"),
  },
};

// Helper function to get a user by key
export function getUser(key: keyof typeof testUsers) {
  return testUsers[key];
}

// Helper function to get all user keys
export function getUserKeys(): Array<keyof typeof testUsers> {
  return Object.keys(testUsers) as Array<keyof typeof testUsers>;
}
