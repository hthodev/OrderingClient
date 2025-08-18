import { FoodCategory } from "../constants/foods";
import { apiRequest } from "./request";

export interface Food {
  _id: string;
  name: string;
  price: number;
  image?: string;
  unit: string;
  describe?: string;
  category?: FoodCategory;
  isSell?: boolean;
  quantity: number;
  return?: number;
  user?: {
    name: string;
    orderedAt: Date;
  }[];
  isCooked?: boolean;
}

export interface Order {
  isPayment: boolean;
  orderer: string;
  table: string;
  updatedAt: Date;
  createdAt: Date;
  _id: string;
  foods: Food[];
}

export interface CheckInvoice {
  bills: Food[];
  totalBill: number;
  tableName?: string;
  coupon?: number;
  paymentTime?: string;
}

export default class FoodService {
  static async List(search = "", filter = {}): Promise<Food[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.post("/food/foodList", {
          search,
          filter,
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

  static async Order(foods: Food[], table_id: string): Promise<Order> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.post("/orders/newOrder", {
          foods,
          table_id,
        });
        if (result?.statusCode === 201) {
          return resolve(result);
        } else {
          return reject(result);
        }
      } catch (error: any) {
        return reject(error);
      }
    });
  }

  static async CheckInvoice(
    _id: string,
    returnFoods: { _id: string; returnQuantity?: number }[]
  ): Promise<CheckInvoice> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.post(`/orders/checkInvoice/${_id}`, {
          returnFoods,
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

  static async OrderMore(_id: string, foods: Food[]): Promise<CheckInvoice> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.put(`/orders/orderMore/${_id}`, {
          foods,
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

  static async CustomerPaid(_id: string): Promise<{ success: boolean }> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.put(`/orders/paid/${_id}`);
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

  static async CookedFood(
    order_id: string,
    food_id: string
  ): Promise<{ success: boolean }> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.put(
          `/orders/cooked/orders/${order_id}/foods/${food_id}`
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

  static async UpdateFoodPrices(
    _id: string,
    foods: Food[]
  ): Promise<CheckInvoice> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.put(`/orders/updateFoodPrices/${_id}`, {
          foods,
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
