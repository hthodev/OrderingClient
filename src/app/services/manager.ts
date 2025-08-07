import { Food } from "./food";
import { apiRequest } from "./request";

type RangeType = "week" | "month" | "year";

export interface ChartItem {
  label: string;
  total: number;
}

interface OrdersByTimeRange {
  range: RangeType;
  chartData: ChartItem[];
}

export interface TopFoodChartItem {
  name: string;
  quantity: number;
}

export interface TopBeerChartItem {
  name: string;
  quantity: number;
}

export interface TopFood {
  range: RangeType;
  topFoods: TopFoodChartItem[];
  topBeers: TopBeerChartItem[];
}

export default class ManagerService {
  static async OrdersByTimeRange(type: string): Promise<OrdersByTimeRange> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.get(
          `/manager/orders/ordersByTimeRange?type=${type}`
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

  static async TopFoods(type: string): Promise<TopFood> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.get(
          `/manager/foods/topFoods?type=${type}`
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

  static async NewFood(form: Food): Promise<{ success: boolean }> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.post(`/food/create`, form);
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

  static async UpdateFood(
    _id: string,
    form: Food
  ): Promise<{ success: boolean }> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.put(`/food/updateFood/${_id}`, form);
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

  static async DeleteFood(_id: string): Promise<{ success: boolean }> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.delete(`/food/deleteFood/${_id}`);
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
