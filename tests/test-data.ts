export const testCredentials = {
  email: process.env.BA_TEST_EMAIL,
  password: process.env.BA_TEST_PASSWORD,
};

export const hasTestCredentials = Boolean(
  testCredentials.email && testCredentials.password,
);
