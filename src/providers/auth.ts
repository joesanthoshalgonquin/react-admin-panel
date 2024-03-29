import { AuthBindings } from "@refinedev/core";

import { API_URL, dataProvider } from "./data";

export const authCredentials = {
  email: "joe.santhosh88@yahoo.com",
  password: "password",
};

export const authProvider: AuthBindings = {
  login: async ({ email }) => {
    try {
      const { data } = await dataProvider.custom({
        url: API_URL,
        method: "post",
        headers: {},
        meta: {
          variables: { email },
          rawQuery: `
                        mutation Login($email: String!) {
                            login(loginInput: { email: $email }) {
                                accessToken
                            }
                        }
                    `,
        },
      });

      localStorage.setItem("access_token", data.login.accessToken);

      return {
        success: true,
        redirectTo: "/",
      };
    } catch (err) {
      const error = err as Error;

      return {
        success: false,
        error: {
          message: "message" in error ? error.message : "Login failed",
          name: "name" in error ? error.name : "Invalid email or password",
        },
      };
    }
  },
  logout: async () => {
    localStorage.removeItem("access_token");

    return {
      success: true,
      redirectTo: "/login",
    };
  },

  onError: async (error) => {
    if (error.statusCode === "UNAUTHENTICATED") {
      return {
        logout: true,
        ...error,
      };
    }

    return { error };
  },

  check: async () => {
    try {
      await dataProvider.custom({
        url: API_URL,
        method: "post",
        headers: {},
        meta: {
          rawQuery: `
                    query Me {
                        me {
                            name
                        }
                    }
                `,
        },
      });

      return {
        authenticated: true,
        redirectTo: "/",
      };
    } catch (err) {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }
  },

  getIdentity: async () => {
    const accessToken = localStorage.getItem("access_token");

    try {
      const { data } = await dataProvider.custom<{ me: any }>({
        url: API_URL,
        method: "post",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        meta: {
          rawQuery: `
                    queryMe {
                        me {
                            id
                            name
                            email
                            phone
                            jobTitle
                            timezone
                            avatarUrl
                        }
                    }
                `,
        },
      });

      return data.me;
    } catch (err) {
      return undefined;
    }
  },
};
