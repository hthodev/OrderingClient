import { Food, Order } from "./food";
import { apiRequest } from "./request";

export interface FullTable {
  _id: string;
  name: string;
  type: string;
  havingGuests: boolean;
  order?: Order;
}

export default class TableService {
  static async LayoutTable(
    types: string[]
  ): Promise<{ _id: string; layouts: string[][]; type: string }[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.post("/tables/layoutTable", {
          types,
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

  static async Tables(): Promise<FullTable[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.get("/tables/list");
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

  static async TableDetail(_id: string): Promise<FullTable> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.get(`/tables/tableById?_id=${_id}`);
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

  static async tableWithFoodOrderForKitchen(): Promise<FullTable[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.get(
          `/tables/tableWithFoodOrderForKitchen`
        );
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

  static async TableHaveFoodIsCooked(): Promise<FullTable[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.get(`/tables/tableWithCookedFood`);
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

  static async TablesName(): Promise<{ _id: string; name: string }[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.get(`/tables/tablesName`);
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
