import { apiRequest } from "./request";

export default class AuthService {
  static async Login({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<{ token: string; refresh: string; statusCode: number }> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.post("/users/login", {
          username,
          password,
        });
        if (result?.statusCode === 200) {
          return resolve(result);
        } else {
          return reject(result);
        }
      } catch (error: any) {
        return reject(error);
      }
    });
  }
}
